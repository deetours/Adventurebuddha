from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import redirect
from django.http import JsonResponse
from django.db import connection
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
import requests
import os
from redis import Redis


def health_check(request):
    """
    Health check endpoint that verifies:
    - Database connectivity
    - Redis connectivity (if configured)
    - Basic service availability
    """
    health_status = {
        'status': 'healthy',
        'services': {},
        'timestamp': __import__('datetime').datetime.now().isoformat()
    }

    # Check database
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health_status['services']['database'] = 'healthy'
    except Exception as e:
        health_status['services']['database'] = f'unhealthy: {str(e)}'
        health_status['status'] = 'unhealthy'

    # Check Redis (optional)
    redis_url = os.getenv('REDIS_URL')
    if redis_url:
        try:
            redis_client = Redis.from_url(redis_url)
            redis_client.ping()
            health_status['services']['redis'] = 'healthy'
        except Exception as e:
            health_status['services']['redis'] = f'unhealthy: {str(e)}'
            health_status['status'] = 'unhealthy'
    else:
        health_status['services']['redis'] = 'not_configured'

    # Set HTTP status code
    status_code = 200 if health_status['status'] == 'healthy' else 503

    return JsonResponse(health_status, status=status_code)


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://localhost:5173/auth/google/callback"
    client_class = OAuth2Client


class GoogleCallbackView(APIView):
    """
    Handle Google OAuth callback and exchange code for tokens
    """

    def post(self, request):
        code = request.data.get('code')
        state = request.data.get('state')

        if not code:
            return Response(
                {'error': 'Authorization code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Exchange authorization code for access token
            token_url = 'https://oauth2.googleapis.com/token'
            data = {
                'client_id': request.settings.get('GOOGLE_CLIENT_ID'),
                'client_secret': request.settings.get('GOOGLE_CLIENT_SECRET'),
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': 'http://localhost:5173/auth/google/callback',
            }

            token_response = requests.post(token_url, data=data)
            token_data = token_response.json()

            if token_response.status_code != 200:
                return Response(
                    {'error': 'Failed to exchange code for token'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            access_token = token_data.get('access_token')

            # Get user info from Google
            user_info_url = 'https://www.googleapis.com/oauth2/v2/userinfo'
            headers = {'Authorization': f'Bearer {access_token}'}
            user_response = requests.get(user_info_url, headers=headers)
            user_data = user_response.json()

            if user_response.status_code != 200:
                return Response(
                    {'error': 'Failed to get user info'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create or get user and return JWT tokens
            from django.contrib.auth import get_user_model
            from rest_framework_simplejwt.tokens import RefreshToken
            from allauth.socialaccount.models import SocialAccount
            from adventure_buddha_backend.adapters import CustomSocialAccountAdapter

            User = get_user_model()

            # Try to find existing social account
            try:
                social_account = SocialAccount.objects.get(
                    provider='google',
                    uid=user_data['id']
                )
                user = social_account.user
            except SocialAccount.DoesNotExist:
                # Create new user
                adapter = CustomSocialAccountAdapter()
                user = adapter.populate_user(user_data)

                if user:
                    user.save()
                    # Create social account
                    SocialAccount.objects.create(
                        user=user,
                        provider='google',
                        uid=user_data['id'],
                        extra_data=user_data
                    )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            return Response({
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_active': user.is_active,
                }
            })

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )