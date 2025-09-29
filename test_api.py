import requests
import json

def test_api():
    print('=== TESTING VM API ENDPOINTS ===')
    base_url = 'http://68.233.115.38:8000'

    try:
        # Test trips endpoint
        print('\n1. Testing /api/trips/ endpoint...')
        response = requests.get(f'{base_url}/api/trips/', timeout=10)
        print(f'Status: {response.status_code}')
        print(f'Content-Type: {response.headers.get("content-type", "unknown")}')

        if response.status_code == 200:
            data = response.json()
            results = data.get('results', data) if isinstance(data, dict) else data
            trip_count = len(results) if hasattr(results, '__len__') else 0
            print(f'Total trips: {trip_count}')

            if results and len(results) > 0:
                trip = results[0]
                print(f'First trip: {trip.get("title", "No title")}')
                print(f'Price: {trip.get("price", "N/A")}')
                print(f'Status: {trip.get("featured_status", "none")}')
                print(f'Tags: {trip.get("tags", [])}')
                print(f'Images: {len(trip.get("images", []))} images')
            else:
                print('No trips returned')
        else:
            print(f'Error: {response.text[:200]}')

        # Test trips with featured filter
        print('\n2. Testing /api/trips/?featured=featured endpoint...')
        response = requests.get(f'{base_url}/api/trips/?featured=featured', timeout=10)
        print(f'Status: {response.status_code}')
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', data) if isinstance(data, dict) else data
            count = len(results) if hasattr(results, '__len__') else 0
            print(f'Featured trips: {count}')

        # Test trips with popular filter
        print('\n3. Testing /api/trips/?featured=popular endpoint...')
        response = requests.get(f'{base_url}/api/trips/?featured=popular', timeout=10)
        print(f'Status: {response.status_code}')
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', data) if isinstance(data, dict) else data
            count = len(results) if hasattr(results, '__len__') else 0
            print(f'Popular trips: {count}')

        # Test leads endpoint (if exists)
        print('\n4. Testing /api/leads/ endpoint...')
        try:
            response = requests.get(f'{base_url}/api/leads/', timeout=5)
            print(f'Status: {response.status_code}')
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', data) if isinstance(data, dict) else data
                count = len(results) if hasattr(results, '__len__') else 0
                print(f'Leads count: {count}')
        except:
            print('Leads endpoint not available or requires authentication')

        # Test bookings endpoint (if exists)
        print('\n5. Testing /api/bookings/ endpoint...')
        try:
            response = requests.get(f'{base_url}/api/bookings/', timeout=5)
            print(f'Status: {response.status_code}')
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', data) if isinstance(data, dict) else data
                count = len(results) if hasattr(results, '__len__') else 0
                print(f'Bookings count: {count}')
        except:
            print('Bookings endpoint not available or requires authentication')

        # Test dashboard endpoint (if exists)
        print('\n6. Testing /api/dashboard/ endpoint...')
        try:
            response = requests.get(f'{base_url}/api/dashboard/', timeout=5)
            print(f'Status: {response.status_code}')
            if response.status_code == 200:
                data = response.json()
                print(f'Dashboard data keys: {list(data.keys()) if isinstance(data, dict) else "Not a dict"}')
        except:
            print('Dashboard endpoint not available or requires authentication')

        print('\n=== VERIFICATION: REMOVED TRIPS ===')
        removed_titles = ['Rajasthan Cultural Heritage Tour', 'Goa Beach Retreat', 'Kashmir Valley Adventure']
        try:
            response = requests.get(f'{base_url}/api/trips/', timeout=10)
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', data) if isinstance(data, dict) else data
                found_removed = [trip.get('title') for trip in results if trip.get('title') in removed_titles]
                if found_removed:
                    print('❌ ERROR: Found removed trips:', found_removed)
                else:
                    print('✅ SUCCESS: All 3 trips successfully removed!')
        except Exception as e:
            print('Error checking removal:', e)

        print('\n=== API TEST COMPLETE ===')

    except requests.exceptions.ConnectionError:
        print('ERROR: Cannot connect to server. Is it running?')
    except requests.exceptions.Timeout:
        print('ERROR: Connection timeout. Server may be slow or unreachable.')
    except Exception as e:
        print(f'ERROR: {e}')

if __name__ == '__main__':
    test_api()