#!/usr/bin/env python3
import os
import django
from pathlib import Path

# Setup Django with SQLite
BASE_DIR = Path(__file__).resolve().parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adventure_buddha_backend.settings_temp')

# Simple SQLite settings
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': str(BASE_DIR / 'db.sqlite3'),
    }
}

# Minimal Django setup
SECRET_KEY = 'temp'
DEBUG = True
INSTALLED_APPS = ['trips']
USE_TZ = True

django.setup()

from trips.models import Trip

print('=== REMOVING UNWANTED TRIPS ===')
removed_titles = ['Rajasthan Cultural Heritage Tour', 'Goa Beach Retreat', 'Kashmir Valley Adventure']
for title in removed_titles:
    try:
        trip = Trip.objects.get(title=title)
        trip.delete()
        print('✓ Removed: ' + title)
    except Trip.DoesNotExist:
        print('⚠️  Already removed: ' + title)

print('')
print('=== FINAL VERIFICATION ===')
all_trips = Trip.objects.all()
print('Total trips remaining: ' + str(all_trips.count()))

found_removed = [trip.title for trip in all_trips if trip.title in removed_titles]
if found_removed:
    print('❌ ERROR: Still found: ' + str(found_removed))
else:
    print('✅ SUCCESS: All 3 trips removed!')