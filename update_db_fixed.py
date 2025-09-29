#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adventure_buddha_backend.settings')
import django
django.setup()

from trips.models import Trip

print('=== REMOVING UNWANTED TRIPS ===')
removed_titles = ['Rajasthan Cultural Heritage Tour', 'Goa Beach Retreat', 'Kashmir Valley Adventure']
for title in removed_titles:
    try:
        trip = Trip.objects.get(title=title)
        trip.delete()
        print('✓ Removed: {}'.format(title))
    except Trip.DoesNotExist:
        print('⚠️  Already removed: {}'.format(title))

print()
print('=== UPDATING REMAINING TRIP CATEGORIES ===')
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
        print('✓ {}: {} → {}'.format(title, old_status, new_status))
    except Trip.DoesNotExist:
        print('✗ Trip not found: {}'.format(title))

print()
print('=== FINAL VERIFICATION ===')
all_trips = Trip.objects.all()
print('Total trips in VM database: {}'.format(all_trips.count()))

featured = Trip.objects.filter(featured_status__in=['featured', 'both'])
popular = Trip.objects.filter(featured_status__in=['popular', 'both'])

print('Featured trips: {}'.format(featured.count()))
print('Popular trips: {}'.format(popular.count()))

found_removed = [trip.title for trip in all_trips if trip.title in removed_titles]
if found_removed:
    print('❌ ERROR: Still found removed trips: {}'.format(found_removed))
else:
    print('✅ SUCCESS: All 3 trips successfully removed from VM!')