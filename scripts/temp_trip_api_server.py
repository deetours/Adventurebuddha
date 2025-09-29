from flask import Flask, jsonify, request
import json
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load trips data
def load_trips_data():
    """Load trips from JSON file"""
    try:
        script_dir = os.path.dirname(__file__)
        json_file = os.path.join(script_dir, 'trips_from_firestore.json')

        if not os.path.exists(json_file):
            print(f"❌ trips_from_firestore.json not found at {json_file}")
            return []

        with open(json_file, 'r', encoding='utf-8') as f:
            trips = json.load(f)

        print(f"✅ Loaded {len(trips)} trips from JSON file")
        return trips

    except Exception as e:
        print(f"❌ Error loading trips data: {e}")
        return []

# Load data on startup
TRIPS_DATA = load_trips_data()

@app.route('/api/trips/', methods=['GET'])
def get_trips():
    """Get all trips with optional filtering"""
    try:
        # Get query parameters
        featured_filter = request.args.get('featured')

        if not TRIPS_DATA:
            return jsonify({'error': 'No trips data available'}), 500

        trips = TRIPS_DATA.copy()

        # Apply featured filter if specified
        if featured_filter:
            if featured_filter in ['featured', 'popular', 'both']:
                trips = [trip for trip in trips if trip.get('featured_status') in [featured_filter, 'both']]
            elif featured_filter == 'none':
                trips = [trip for trip in trips if trip.get('featured_status') == 'none']

        # Return in same format as Django API
        return jsonify({
            'count': len(trips),
            'results': trips
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/trips/<int:trip_id>/', methods=['GET'])
def get_trip_detail(trip_id):
    """Get a specific trip by ID"""
    try:
        trip = next((trip for trip in TRIPS_DATA if trip.get('id') == trip_id), None)

        if not trip:
            return jsonify({'error': 'Trip not found'}), 404

        return jsonify(trip)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'trips_count': len(TRIPS_DATA),
        'source': 'firestore_backup'
    })

if __name__ == '__main__':
    print("🚀 Starting Temporary Trip API Server")
    print("=" * 40)
    print(f"📊 Loaded {len(TRIPS_DATA)} trips from Firestore backup")
    print("🌐 Server will run on http://127.0.0.1:3001")
    print("📡 API endpoints:")
    print("   GET /api/trips/ - Get all trips")
    print("   GET /api/trips/?featured=featured - Get featured trips")
    print("   GET /api/trips/?featured=popular - Get popular trips")
    print("   GET /api/trips/<id>/ - Get specific trip")
    print("   GET /health/ - Health check")
    print("\n⚠️  This is a temporary server using Firestore backup data")
    print("🛠️  Update your frontend config to use http://127.0.0.1:3001 when VM is down")
    print("\nPress Ctrl+C to stop the server")

    app.run(host='127.0.0.1', port=3001, debug=True)