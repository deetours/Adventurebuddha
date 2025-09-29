import os
import sys
import django
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore

# Setup Django
backend_dir = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adventure_buddha_backend.settings')
django.setup()

from trips.models import Trip

def initialize_firestore():
    """Initialize Firestore with service account key"""
    try:
        # Path to service account key
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
            return None

        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firestore initialized successfully")
        return db
    except Exception as e:
        print(f"❌ Error initializing Firestore: {e}")
        return None

def fetch_trips_from_database():
    """Fetch all trips directly from Django database"""
    try:
        print("📡 Fetching trips from Django database...")
        trips = Trip.objects.all()

        trip_data = []
        for trip in trips:
            # Convert trip to dictionary
            trip_dict = {
                'id': trip.id,
                'title': trip.title,
                'description': trip.description,
                'price': str(trip.price) if trip.price else '',
                'duration': trip.duration,
                'difficulty': trip.difficulty,
                'featured_status': trip.featured_status or 'none',
                'tags': trip.tags or [],
                'images': trip.images or [],
                'itinerary': trip.itinerary or [],
                'inclusions': trip.inclusions or [],
                'exclusions': trip.exclusions or [],
                'created_at': trip.created_at.isoformat() if trip.created_at else None,
                'updated_at': trip.updated_at.isoformat() if trip.updated_at else None,
                'backup_date': datetime.now().isoformat(),
                'source': 'django_database_backup'
            }
            trip_data.append(trip_dict)

        print(f"✅ Fetched {len(trip_data)} trips from database")
        return trip_data

    except Exception as e:
        print(f"❌ Error fetching trips from database: {e}")
        return []

def upload_trips_to_firestore(db, trips):
    """Upload trips to Firestore"""
    try:
        print("📤 Uploading trips to Firestore...")

        batch = db.batch()
        trips_ref = db.collection('trips')

        for i, trip in enumerate(trips, 1):
            # Use trip ID as document ID
            doc_id = str(trip['id'])
            doc_ref = trips_ref.document(doc_id)
            batch.set(doc_ref, trip)

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
    print("🚀 Starting Trip Database Backup to Firestore")
    print("=" * 50)

    # Initialize Firestore
    db = initialize_firestore()
    if not db:
        return

    # Fetch trips from database
    trips = fetch_trips_from_database()
    if not trips:
        print("❌ No trips to backup. Exiting.")
        return

    # Upload to Firestore
    success = upload_trips_to_firestore(db, trips)

    if success:
        print("\n🎉 Database backup completed successfully!")
        print("📋 Summary:")
        print(f"   • Trips backed up: {len(trips)}")
        print("   • Location: Firestore 'trips' collection")
        print("   • Method: Direct database access (no API needed)")
        print("   • Next steps: Fix VM backend, then restore from Firestore if needed")
    else:
        print("\n❌ Backup failed!")

if __name__ == '__main__':
    main()