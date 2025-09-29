#!/bin/bash

# Script to apply database changes to VM server
# This removes the 3 unwanted trips and updates categories

VM_HOST="68.233.115.38"
VM_USER="ubuntu"
BACKEND_DIR="/home/ubuntu/adventure-buddha/backend"

echo "=== APPLYING DATABASE CHANGES TO VM ==="

# SSH into VM and apply changes
ssh $VM_USER@$VM_HOST << 'EOF'
cd /home/ubuntu/adventure-buddha/backend

echo "=== CONNECTING TO VM DATABASE ==="
python manage.py shell -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adventure_buddha_backend.settings')
django.setup()

from trips.models import Trip

print('=== REMOVING UNWANTED TRIPS ===')
removed_titles = ['Rajasthan Cultural Heritage Tour', 'Goa Beach Retreat', 'Kashmir Valley Adventure']
for title in removed_titles:
    try:
        trip = Trip.objects.get(title=title)
        trip.delete()
        print(f'✓ Removed: {title}')
    except Trip.DoesNotExist:
        print(f'⚠️  Already removed: {title}')

print('\n=== UPDATING REMAINING TRIP CATEGORIES ===')
# Update categories for remaining trips
trip_updates = [
    ('Coastal Flavours & Yakshagana Tales – Udupi Coastal Escape', 'both'),
    ('Tribal & Cultural Experience – Uttara Kannada', 'both'),
    ('Gudibande and Adiyogi Light Show', 'both'),
    ('Waves, Temples & Tiger Stripes – Udupi Coastal Escape', 'popular'),
    ('Coastal Itinerary: Pondicherry – Pichavaram – Auroville', 'both'),
    ('Coorg + Chikmagalur Extended Itinerary', 'both'),
    ('Waves, Temples & Tiger Stripes – Udupi, Mangalore & Agumbe Coastal Escape', 'popular'),
    ('Hampi Weekend Getaway – Heritage, Hills & Hippie Vibes', 'both'),
]

for title, new_status in trip_updates:
    try:
        trip = Trip.objects.get(title=title)
        old_status = trip.featured_status
        trip.featured_status = new_status
        trip.save()
        print(f'✓ {title}: {old_status} → {new_status}')
    except Trip.DoesNotExist:
        print(f'✗ Trip not found: {title}')

print('\n=== FINAL VERIFICATION ===')
all_trips = Trip.objects.all()
print(f'Total trips in VM database: {all_trips.count()}')

featured = Trip.objects.filter(featured_status__in=['featured', 'both'])
popular = Trip.objects.filter(featured_status__in=['popular', 'both'])

print(f'Featured trips: {featured.count()}')
print(f'Popular trips: {popular.count()}')

print('\n=== CHECKING REMOVAL SUCCESS ===')
found_removed = [trip.title for trip in all_trips if trip.title in removed_titles]
if found_removed:
    print('❌ ERROR: Still found removed trips:', found_removed)
else:
    print('✅ SUCCESS: All 3 trips successfully removed from VM!')
"
EOF

echo "=== VM DATABASE UPDATE COMPLETE ==="
echo "Please verify the changes by checking the API at: http://68.233.115.38:8000/api/trips/"