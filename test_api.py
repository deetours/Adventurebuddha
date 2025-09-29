import requests
import json

print('=== TESTING API ENDPOINTS ===')

# Test all trips
try:
    response = requests.get('http://68.233.115.38:8000/api/trips/', timeout=10)
    print('All trips endpoint:')
    print('Status:', response.status_code)
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        print(f'Total trips: {len(results)}')
        for i, trip in enumerate(results, 1):
            title = trip.get('title', 'No title')
            status = trip.get('featured_status', 'none')
            print(f'{i}. {title} - {status}')
    print()
except Exception as e:
    print('Error:', e)

# Test featured trips
try:
    response = requests.get('http://68.233.115.38:8000/api/trips/?featured=featured,both', timeout=10)
    print('Featured trips endpoint:')
    print('Status:', response.status_code)
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        print(f'Featured trips: {len(results)}')
        for trip in results:
            print(f'  - {trip.get("title", "No title")}')
    print()
except Exception as e:
    print('Error:', e)

# Test popular trips
try:
    response = requests.get('http://68.233.115.38:8000/api/trips/?featured=popular,both', timeout=10)
    print('Popular trips endpoint:')
    print('Status:', response.status_code)
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        print(f'Popular trips: {len(results)}')
        for trip in results:
            print(f'  - {trip.get("title", "No title")}')
    print()
except Exception as e:
    print('Error:', e)

print('=== VERIFICATION ===')
removed_titles = ['Rajasthan Cultural Heritage Tour', 'Goa Beach Retreat', 'Kashmir Valley Adventure']
print('Checking if removed trips are gone...')
try:
    response = requests.get('http://68.233.115.38:8000/api/trips/', timeout=10)
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        found_removed = [trip.get('title') for trip in results if trip.get('title') in removed_titles]
        if found_removed:
            print('❌ ERROR: Found removed trips:', found_removed)
        else:
            print('✅ SUCCESS: All 3 trips successfully removed!')
except Exception as e:
    print('Error checking removal:', e)