import requests
import json

# Test the leads API
url = 'http://localhost:8000/api/leads/'
data = {
    'name': 'Test User',
    'email': 'test@example.com',
    'phone': '+1234567890',
    'destination': 'Ladakh',
    'travel_date': '2024-12-01',
    'travelers': 2,
    'budget': '₹25,000 - ₹50,000',
    'experience_level': 'Some Experience',
    'interests': ['Trekking', 'Photography']
}

try:
    response = requests.post(url, json=data, headers={'Content-Type': 'application/json'}, timeout=10)
    print(f'Status Code: {response.status_code}')
    if response.status_code == 201:
        print('✅ Lead created successfully!')
        result = response.json()
        print(f'Lead ID: {result.get("lead_id")}')
        print(f'Message: {result.get("message")}')
    else:
        print(f'❌ Error: {response.text}')
except Exception as e:
    print(f'❌ Error: {e}')