from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
import firebase_admin
from firebase_admin import auth, credentials
import os

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    # For development, use Firebase config from environment
    # In production, you should use a service account key file
    try:
        # Try to initialize with service account credentials if available
        cred_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY_PATH')
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            # For development/demo purposes, use Firebase config
            # This is less secure and should not be used in production
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": os.getenv('FIREBASE_PROJECT_ID', 'adventurebuddha-1e141'),
                "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID', ''),
                "private_key": os.getenv('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n') if os.getenv('FIREBASE_PRIVATE_KEY') else '',
                "client_email": os.getenv('FIREBASE_CLIENT_EMAIL', ''),
                "client_id": os.getenv('FIREBASE_CLIENT_ID', ''),
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{os.getenv('FIREBASE_CLIENT_EMAIL', '')}"
            })

        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Warning: Firebase Admin SDK initialization failed: {e}")
        print("Firebase authentication will not work. Please set up proper Firebase credentials.")

class FirebaseAuthView(APIView):
    """
    Handle Firebase authentication and sync with Django users
    """

    def post(self, request):
        id_token = request.data.get('id_token')

        if not id_token:
            return Response(
                {'error': 'Firebase ID token is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Verify Firebase token
            decoded_token = auth.verify_id_token(id_token)
            firebase_uid = decoded_token['uid']
            email = decoded_token.get('email')
            name = decoded_token.get('name', '')

            if not email:
                return Response(
                    {'error': 'Email is required from Firebase token'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            User = get_user_model()

            # Try to find existing user by Firebase UID or email
            user = None
            try:
                # Check if user exists with Firebase UID as username
                user = User.objects.get(username=firebase_uid)
            except User.DoesNotExist:
                try:
                    # Check if user exists with email
                    user = User.objects.get(email=email)
                    # Update username to Firebase UID for future logins
                    user.username = firebase_uid
                    user.save()
                except User.DoesNotExist:
                    # Create new user
                    first_name = name.split()[0] if name else ''
                    last_name = ' '.join(name.split()[1:]) if name and len(name.split()) > 1 else ''

                    user = User.objects.create_user(
                        username=firebase_uid,
                        email=email,
                        first_name=first_name,
                        last_name=last_name,
                        is_active=True
                    )

            # Generate Django JWT tokens
            refresh = RefreshToken.for_user(user)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_active': user.is_active,
                }
            })

        except auth.InvalidIdTokenError:
            return Response(
                {'error': 'Invalid Firebase ID token'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except auth.ExpiredIdTokenError:
            return Response(
                {'error': 'Firebase ID token has expired'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {'error': f'Authentication failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )