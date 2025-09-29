import firebase_admin
from firebase_admin import credentials, firestore
import os

def test_firestore_connection():
    """Test Firestore connection with service account key"""
    try:
        print("🔍 Testing Firestore Connection")
        print("=" * 40)

        # Check for service account key
        script_dir = os.path.dirname(__file__)
        cred_paths = [
            os.path.join(script_dir, 'serviceAccountKey.json'),
            os.path.join(script_dir, 'scripts', 'serviceAccountKey.json'),
            os.path.join(os.path.dirname(script_dir), 'scripts', 'serviceAccountKey.json')
        ]

        cred_path = None
        for path in cred_paths:
            if os.path.exists(path):
                cred_path = path
                break

        if not cred_path:
            print("❌ serviceAccountKey.json not found!")
            print("\nPlease:")
            print("1. Download serviceAccountKey.json from Firebase Console")
            print("2. Place it in the scripts/ folder")
            print("3. Run this test again")
            return False

        print(f"✅ Found serviceAccountKey.json at: {cred_path}")

        # Initialize Firestore
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()

        print("✅ Firestore initialized successfully")

        # Test basic operations
        test_doc = {
            'test': True,
            'timestamp': firebase_admin.firestore.SERVER_TIMESTAMP
        }

        # Write test document
        doc_ref = db.collection('test_connection').document('test_doc')
        doc_ref.set(test_doc)
        print("✅ Test document written to Firestore")

        # Read test document
        doc = doc_ref.get()
        if doc.exists:
            print("✅ Test document read from Firestore")
            print(f"   Data: {doc.to_dict()}")

        # Clean up test document
        doc_ref.delete()
        print("✅ Test document cleaned up")

        print("\n🎉 Firestore connection test PASSED!")
        print("You can now run the backup script: python backup_trips_to_firestore.py")

        return True

    except Exception as e:
        print(f"❌ Firestore connection test FAILED: {e}")
        return False

if __name__ == '__main__':
    test_firestore_connection()