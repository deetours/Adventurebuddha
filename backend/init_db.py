#!/usr/bin/env python
"""
Script to initialize the database with sample data
"""
import os
import sys
import django
from django.conf import settings

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adventure_buddha_backend.settings')
django.setup()

from django.contrib.auth.models import User
from trips.models import Trip, TripSlot
import json

def create_sample_data():
    # Create superuser if it doesn't exist
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("Created superuser: admin/admin123")
    
    # Create sample trips if none exist
    if Trip.objects.count() == 0:
        # Sample trip 1
        trip1 = Trip.objects.create(
            slug='ladakh-adventure',
            title='Ladakh Adventure - 7 Days',
            description='Experience the magical landscapes of Ladakh with this incredible 7-day adventure.',
            images=[
                'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg',
                'https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg',
            ],
            price=35000,
            duration=7,
            tags=['trek', 'adventure', 'mountains'],
            difficulty='challenging',
            rating=4.8,
            review_count=124,
            inclusions=['Transportation', 'Accommodation', 'Meals', 'Guide'],
            exclusions=['Personal expenses', 'Insurance', 'Tips'],
            itinerary=[
                {
                    'day': 1,
                    'title': 'Arrival in Leh',
                    'description': 'Arrive in Leh, acclimatization day',
                    'activities': ['Airport pickup', 'Hotel check-in', 'Rest'],
                    'meals': ['Dinner'],
                    'accommodation': 'Hotel in Leh'
                },
                {
                    'day': 2,
                    'title': 'Leh Local Sightseeing',
                    'description': 'Explore the beautiful monasteries and palaces',
                    'activities': ['Leh Palace', 'Shanti Stupa', 'Local market'],
                    'meals': ['Breakfast', 'Lunch', 'Dinner'],
                    'accommodation': 'Hotel in Leh'
                }
            ],
            status='published'
        )
        
        # Create a slot for this trip
        TripSlot.objects.create(
            trip=trip1,
            date='2024-06-15',
            time='06:00',
            vehicle_type='Tempo Traveller',
            total_seats=12,
            available_seats=8,
            price=35000,
            status='available'
        )
        
        print("Created sample trip: Ladakh Adventure")
        
        # Goa Beach Retreat trip removed as requested
        
        print("Created sample trip: Goa Beach Retreat")
    
    print("Database initialization complete!")

if __name__ == '__main__':
    create_sample_data()