import firebase_admin
from firebase_admin import credentials, firestore
import requests
import json
import os
from datetime import datetime
import time

def initialize_firestore():
    """Initialize Firestore with service account key"""
    try:
        # Path to service account key - check both locations
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
            print("❌ serviceAccountKey.json not found in any of these locations:")
            for path in cred_paths:
                print(f"   • {path}")
            print("\nPlease download serviceAccountKey.json from Firebase Console and place it in the scripts folder.")
            return None

        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firestore initialized successfully")
        return db
    except Exception as e:
        print(f"❌ Error initializing Firestore: {e}")
        return None

def fetch_trips_from_backend():
    """Fetch all trips from the local Django backend"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"📡 Fetching trips from local backend (attempt {attempt + 1}/{max_retries})...")
            response = requests.get('http://127.0.0.1:8000/api/trips/', timeout=10)

            if response.status_code != 200:
                print(f"❌ Failed to fetch trips: {response.status_code}")
                print(f"Response: {response.text[:200]}")
                if attempt < max_retries - 1:
                    print("⏳ Retrying in 2 seconds...")
                    time.sleep(2)
                    continue
                return []

            data = response.json()
            results = data.get('results', data) if isinstance(data, dict) else data

            print(f"✅ Fetched {len(results)} trips from backend")
            return results

        except requests.exceptions.ConnectionError:
            print(f"❌ Cannot connect to local backend (attempt {attempt + 1}). Make sure it's running on http://127.0.0.1:8000/")
            if attempt < max_retries - 1:
                print("⏳ Retrying in 3 seconds...")
                time.sleep(3)
            else:
                print("💡 Tip: Run this command in another terminal first:")
                print("   cd backend && python manage.py runserver 127.0.0.1:8000")
        except Exception as e:
            print(f"❌ Error fetching trips: {e}")
            return []

    return []

def upload_trips_to_firestore(db, trips):
    """Upload trips to Firestore"""
    try:
        print("📤 Uploading trips to Firestore...")

        batch = db.batch()
        trips_ref = db.collection('trips')

        for i, trip in enumerate(trips, 1):
            # Create a document ID from the trip ID or title
            doc_id = str(trip.get('id', f"trip_{i}"))

            # Prepare trip data for Firestore
            trip_data = {
                'id': trip.get('id'),
                'title': trip.get('title', ''),
                'description': trip.get('description', ''),
                'price': trip.get('price', ''),
                'duration': trip.get('duration', ''),
                'difficulty': trip.get('difficulty', ''),
                'featured_status': trip.get('featured_status', 'none'),
                'tags': trip.get('tags', []),
                'images': trip.get('images', []),
                'itinerary': trip.get('itinerary', []),
                'inclusions': trip.get('inclusions', []),
                'exclusions': trip.get('exclusions', []),
                'created_at': trip.get('created_at'),
                'updated_at': trip.get('updated_at'),
                'backup_date': datetime.now().isoformat(),
                'source': 'django_backup'
            }

            # Add to batch
            doc_ref = trips_ref.document(doc_id)
            batch.set(doc_ref, trip_data)

            if i % 10 == 0:
                print(f"📝 Processed {i}/{len(trips)} trips...")

        # Commit the batch
        batch.commit()
        print(f"✅ Successfully uploaded {len(trips)} trips to Firestore")

        # Verify upload
        docs = trips_ref.stream()
        count = sum(1 for _ in docs)
        print(f"✅ Verification: {count} documents in Firestore 'trips' collection")

        return True

    except Exception as e:
        print(f"❌ Error uploading to Firestore: {e}")
        return False

def main():
    print("🚀 Starting Trip Backup to Firestore")
    print("=" * 50)

    # Initialize Firestore
    db = initialize_firestore()
    if not db:
        return

    # Fetch trips from backend
    trips = fetch_trips_from_backend()
    if not trips:
        print("❌ No trips to backup. Exiting.")
        return

    # Upload to Firestore
    success = upload_trips_to_firestore(db, trips)

    if success:
        print("\n🎉 Backup completed successfully!")
        print("📋 Summary:")
        print(f"   • Trips backed up: {len(trips)}")
        print("   • Location: Firestore 'trips' collection")
        print("   • Next steps: Fix VM backend, then restore from Firestore if needed")
    else:
        print("\n❌ Backup failed. Please check the errors above.")

if __name__ == '__main__':
    main()