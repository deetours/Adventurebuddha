#!/usr/bin/env python
"""
Test script for trips API
"""
import os
import django
import sys
import requests

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adventure_buddha_backend.settings')
django.setup()

from trips.models import Trip

def test_api():
    """Test the trips API"""
    print("Testing trips API...")

    # Check database
    trips = Trip.objects.filter(status='published')
    print(f"Trips in database: {trips.count()}")

    for trip in trips:
        print(f"- {trip.title} (Status: {trip.featured_status})")

    # Test featured endpoint
    print("\nTesting featured trips...")
    featured_trips = Trip.objects.filter(featured_status__in=['featured', 'both'])
    print(f"Featured trips: {featured_trips.count()}")

    # Test popular endpoint
    print("\nTesting popular trips...")
    popular_trips = Trip.objects.filter(featured_status__in=['popular', 'both'])
    print(f"Popular trips: {popular_trips.count()}")

if __name__ == '__main__':
    test_api()