import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

def initialize_firestore():
    """Initialize Firestore with service account key"""
    try:
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
        return db
    except Exception as e:
        print(f"❌ Error initializing Firestore: {e}")
        return None

def fetch_trips_from_firestore(db):
    """Fetch all trips from Firestore"""
    try:
        print("📡 Fetching trips from Firestore...")
        trips_ref = db.collection('trips')
        docs = trips_ref.stream()

        trips = []
        for doc in docs:
            trip_data = doc.to_dict()
            # Remove Firestore metadata
            trip_data.pop('backup_date', None)
            trip_data.pop('source', None)
            trips.append(trip_data)

        print(f"✅ Fetched {len(trips)} trips from Firestore")
        return trips

    except Exception as e:
        print(f"❌ Error fetching from Firestore: {e}")
        return []

def save_trips_to_json(trips, filename='trips_from_firestore.json'):
    """Save trips to JSON file"""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(trips, f, indent=2, ensure_ascii=False)

        print(f"✅ Saved {len(trips)} trips to {filename}")

        # Show sample
        if trips:
            print("\n📋 Sample trip data:")
            sample = trips[0]
            print(f"   Title: {sample.get('title', 'N/A')}")
            print(f"   Price: {sample.get('price', 'N/A')}")
            print(f"   Status: {sample.get('featured_status', 'none')}")
            print(f"   Tags: {sample.get('tags', [])}")

        return True

    except Exception as e:
        print(f"❌ Error saving to JSON: {e}")
        return False

def main():
    print("📥 Exporting Trips from Firestore to JSON")
    print("=" * 45)

    # Initialize Firestore
    db = initialize_firestore()
    if not db:
        return

    # Fetch trips
    trips = fetch_trips_from_firestore(db)
    if not trips:
        print("❌ No trips found in Firestore")
        return

    # Save to JSON
    success = save_trips_to_json(trips)

    if success:
        print("\n🎉 Export completed successfully!")
        print("📋 Next steps:")
        print("   1. Use trips_from_firestore.json for frontend development")
        print("   2. Or restore to database when VM backend is fixed")
        print("   3. File location: scripts/trips_from_firestore.json")

if __name__ == '__main__':
    main()