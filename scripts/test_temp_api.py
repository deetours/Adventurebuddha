import requests

def test_temp_api():
    try:
        print("Testing temporary API server...")

        # Test health endpoint
        response = requests.get('http://127.0.0.1:3001/health/', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check passed!")
            print(f"   Status: {data.get('status')}")
            print(f"   Trips: {data.get('trips_count')}")
            print(f"   Source: {data.get('source')}")
        else:
            print("❌ Health check failed")
            return False

        # Test trips endpoint
        response = requests.get('http://127.0.0.1:3001/api/trips/', timeout=5)
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            print("✅ Trips endpoint working!")
            print(f"   Total trips: {len(results)}")
            if results:
                print(f"   Sample: {results[0].get('title', 'No title')[:50]}...")
        else:
            print("❌ Trips endpoint failed")
            return False

        # Test featured filter
        response = requests.get('http://127.0.0.1:3001/api/trips/?featured=featured', timeout=5)
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            print("✅ Featured filter working!")
            print(f"   Featured trips: {len(results)}")

        print("\n🎉 Temporary API server is fully operational!")
        print("🌐 Frontend can now use: http://127.0.0.1:3001")
        return True

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to temporary API server")
        print("💡 Make sure temp_trip_api_server.py is running")
        return False
    except Exception as e:
        print(f"❌ Error testing API: {e}")
        return False

if __name__ == '__main__':
    test_temp_api()