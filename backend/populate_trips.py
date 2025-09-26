#!/usr/bin/env python
"""
Script to populate the database with trip data
"""
import os
import django
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adventure_buddha_backend.settings')
django.setup()

from trips.models import Trip

def create_udupi_trip():
    """Create the Udupi Coastal Escape trip"""

    # Check if trip already exists
    trip, created = Trip.objects.get_or_create(
        slug='udupi-coastal-escape',
        defaults={
            'title': 'Coastal Flavours & Yakshagana Tales – Udupi Coastal Escape',
            'subtitle': 'Udupi Coastal Escape',
            'description': 'Trade the city lights of Bangalore for Udupi\'s serene backwaters, golden beaches, and vibrant cultural traditions. This 3-day journey blends adventure and heritage – from kayaking in the Suvarna River and parasailing at Malpe, to witnessing the captivating Yakshagana folk theatre and soaking in temple vibes at Sri Krishna Matha. Add in coastal delicacies, lively fish markets, and stunning sunsets – and you\'ve got the perfect mix of sea, soul, and stories.',
            'overview': 'Trade the city lights of Bangalore for Udupi\'s serene backwaters, golden beaches, and vibrant cultural traditions. This 3-day journey blends adventure and heritage – from kayaking in the Suvarna River and parasailing at Malpe, to witnessing the captivating Yakshagana folk theatre and soaking in temple vibes at Sri Krishna Matha. Add in coastal delicacies, lively fish markets, and stunning sunsets – and you\'ve got the perfect mix of sea, soul, and stories. 🌅🎭🌴',
            'images': [
                '/images/udupi-coastal-1.jpg',
                '/images/udupi-coastal-2.jpg',
                '/images/udupi-coastal-3.jpg'
            ],
            'price': 5999.00,
            'original_price': 5714.00,
            'gst_percentage': 5.0,
            'duration': 3,
            'tags': ['cultural', 'beach', 'adventure', 'yakshagana', 'temple', 'coastal', 'hulivesha'],
            'category': 'cultural',
            'featured_status': 'both',  # Both featured and popular
            'difficulty': 'easy',
            'inclusions': [
                'Travel from Bangalore to Udupi homestay in Non AC Tempo Traveller / Minibus 🚐',
                '3 meals: 2 breakfasts (Day 1 & Day 2), and 1 dinner (Day 1) 🍽️',
                'Accommodation on 2–4 sharing basis, with cots/floor mattress (separate for guys and girls)',
                'Local guide and outdoor trek leader from Adventure Buddha'
            ],
            'exclusions': [
                'Entry charges (if applicable)',
                'Activity charges (e.g., Kayaking)',
                'Meals other than those mentioned in the itinerary',
                'Any kind of personal expenses',
                '5% GST',
                'Any kind of insurances (health, life, accidental, medical, etc.)',
                'Anything not mentioned in the inclusions list'
            ],
            'things_to_carry': [
                'Water bottle',
                'Raincoat or umbrella',
                'Shoes OR Slippers with good grip',
                'Backpack for carrying essentials while exploring',
                'Toilet kit (toothbrush, toothpaste, soap)',
                'Towel',
                'Comfortable clothes',
                'Cargo/track pants/shorts',
                'Polybags for packing wet clothes',
                'At least one ID proof (Driving License, Voter ID, or Aadhar card)',
                'Extra cash for purchases and meals not included in the package',
                'Sunscreen and Hat',
                'Personal medicine if required',
                'Mosquito repellent cream'
            ],
            'important_points': [
                'No Luxury. We assure awesome memories in every trip, but not awesome facilities!',
                'No alcohol & Drugs during Treks & adventure activities',
                'The itinerary is fixed. No special requests to change itinerary/schedule are permitted',
                'Please go through the Terms & Conditions before booking',
                'This trip involves basic facilities in terms of food, travel, and stay without any luxury'
            ],
            'who_can_attend': [
                'Group Trips for 18-40-Year-Olds',
                'Join as Solo / Couple / Small Groups',
                'For the Spiritual Seekers & Culture Lovers',
                'For the Beach Walkers, Peace Finders & Food Explorers',
                'For those who love to soak in stories, temples & traditions'
            ],
            'itinerary': [
                {
                    'day': 0,
                    'title': 'Overnight Journey from Bangalore',
                    'date': 'Sep 19 (Friday Night)',
                    'description': 'Board your vehicle in the evening. As the city lights fade, settle in for an overnight ride through Karnataka\'s highways.',
                    'activities': []
                },
                {
                    'day': 1,
                    'title': 'Backwaters, Beaches & Coastal Culture',
                    'date': 'Sep 20 (Saturday)',
                    'description': 'Arrival in Udupi & Homestay Check-In. Wake up to refreshing coastal air as you arrive in Udupi. Check in to a cozy homestay surrounded by coconut palms and the sound of distant waves.',
                    'activities': [
                        'Authentic Coastal Breakfast: neer dosa, goli baje, or Udupi buns with chutney',
                        'Kayaking in Suvarna River Backwaters',
                        'Toddy Tasting: traditional fermented coconut drink',
                        'Lunch: Coastal Feast - seafood thali or Udupi-style vegetarian meal',
                        'Beaches Trail: Malpe, Mattu & Padubidri beaches',
                        'Evening at Kapu Beach & Lighthouse',
                        'Yakshagana Cultural Experience (Night Event)'
                    ]
                },
                {
                    'day': 2,
                    'title': 'Temples, Heritage & Coastal Life',
                    'date': 'Sep 21 (Sunday)',
                    'description': 'Explore Udupi\'s rich cultural and spiritual heritage.',
                    'activities': [
                        'Breakfast at the Homestay',
                        'Sri Krishna Temple Darshan (Udupi)',
                        'Lunch & Shopping: wholesome vegetarian thali and local markets',
                        'Hasta Shilpa Heritage Village',
                        'Manipal Museum of Anatomy & Pathology',
                        'Manipal End Point Park (Evening)',
                        'Dinner & Departure: Start overnight return journey'
                    ]
                },
                {
                    'day': 3,
                    'title': 'Back to Bangalore',
                    'date': 'Early Morning',
                    'description': 'Arrive in Bangalore early morning around 6 AM.',
                    'activities': []
                }
            ],
            'contact_info': {
                'phone1': '9353810775',
                'phone2': '8073465622',
                'whatsapp': '8073465622'
            },
            'bank_details': {
                'account_name': 'Adventure Buddha',
                'account_number': '924020059925287',
                'ifsc': 'UTIB0000693',
                'branch': 'Majestic Anand Rao Circle Bangalore',
                'bank': 'Axis Bank',
                'gpay': '8073465622'
            },
            'notes': 'This trip involves basic facilities in terms of food, travel, and stay without any luxury, whatsoever. This is a group trip with a shared model. It may not suit everyone – especially for those expecting privacy and comfort. Homestay with cots & beds/ floor mattresses(sharing basis, separate for boys & girls), clean washrooms. Please do not book this trip if you are not okay with the above points.',
            'status': 'published'
        }
    )
    
    if not created:
        # Update existing trip
        trip.tags = ['cultural', 'beach', 'adventure', 'yakshagana', 'temple', 'coastal', 'hulivesha']
        trip.save()
        print("Updated existing trip: Udupi Coastal Escape")
    else:
        print(f"Created trip: {trip.title}")
    
    return trip

def create_uttara_kannada_trip():
    """Create the Uttara Kannada Tribal & Cultural Experience trip"""

    # Check if trip already exists
    if Trip.objects.filter(slug='uttara-kannada-tribal-cultural').exists():
        print("Uttara Kannada Tribal & Cultural Experience trip already exists!")
        return

    trip = Trip.objects.create(
        slug='uttara-kannada-tribal-cultural',
        title='Tribal & Cultural Experience – Uttara Kannada',
        subtitle='Uttara Kannada Tribal Experience',
        description='Step into the heart of Uttara Kannada and experience the life of the tribal community, whose traditions have been preserved for centuries amidst the forests. This journey is not just about travel—it\'s about living, learning, and connecting. From exploring forests and foraging wild edibles, to cooking authentic tribal meals, joining cultural performances, and discovering sustainable living practices, this trip is crafted for those who want real, raw, and immersive experiences.',
        overview='Step into the heart of Uttara Kannada and experience the life of the tribal community, whose traditions have been preserved for centuries amidst the forests. This journey is not just about travel—it\'s about living, learning, and connecting. From exploring forests and foraging wild edibles, to cooking authentic tribal meals, joining cultural performances, and discovering sustainable living practices, this trip is crafted for those who want real, raw, and immersive experiences. If you\'re seeking stories, connections, and cultural depth beyond regular touristy itineraries—this trip is for you. 🌿',
        images=[
            '/images/uttara-kannada-1.jpg',
            '/images/uttara-kannada-2.jpg',
            '/images/uttara-kannada-3.jpg'
        ],
        price=5999.00,
        original_price=5714.00,
        gst_percentage=5.0,
        duration=3,
        tags=['cultural', 'tribal', 'forest', 'traditional', 'siddi', 'foraging', 'hulivesha'],
        category='cultural',
        featured_status='both',  # Both featured and popular
        difficulty='easy',
        inclusions=[
            'Travel from Bangalore to Hubli (train/tempo traveller/minibus – depending on group size) and local transfers to the tribal stay 🚐',
            '5 meals: 2 breakfasts (Day 1 & Day 2), 2 lunches (Day 1 & Day 2), and 1 dinner (Day 1) 🍽️',
            'Accommodation on 4 sharing basis with cots & floor mattress (separate for guys and girls)',
            'Local tribal community hosts + cultural experiences',
            'Outdoor trek leader & coordinator from Adventure Buddha'
        ],
        exclusions=[
            'Entry charges (if applicable)',
            'Activity charges (anything beyond Itinerary)',
            'Meals other than those mentioned in the itinerary',
            'Any kind of personal expenses',
            '5% GST',
            'Any kind of insurances (health, life, accidental, medical, etc.)',
            'Anything not mentioned in the inclusions list'
        ],
        things_to_carry=[
            'Water bottle',
            'Raincoat or umbrella',
            'Shoes OR Slippers with good grip',
            'Backpack for carrying essentials while exploring',
            'Toilet kit (toothbrush, toothpaste, soap)',
            'Towel',
            'Comfortable clothes',
            'Cargo/track pants/shorts',
            'Polybags for packing wet clothes',
            'At least one ID proof (Driving License, Voter ID, or Aadhar card)',
            'Extra cash for purchases and meals not included in the package',
            'Sunscreen and Hat',
            'Personal medicine if required',
            'Mosquito repellent cream'
        ],
        important_points=[
            'No Luxury. We assure awesome memories in every trip, but not awesome facilities!',
            'No alcohol & Drugs during Treks & adventure activities',
            'The itinerary is fixed. No special requests to change itinerary/schedule are permitted',
            'Please go through the Terms & Conditions before booking',
            'This trip involves basic facilities in terms of food, travel, and stay without any luxury',
            'This is a group trip with a shared model. It may not suit everyone – especially for those expecting privacy and comfort',
            'Homestay with cots & beds/ floor mattresses(sharing basis, separate for boys & girls), clean washrooms',
            'Please do not book this trip if you are not okay with the above points'
        ],
        who_can_attend=[
            'Group Trips for 18-40-Year-Olds',
            'Join as Solo / Couple / Small Groups',
            'For the Spiritual Seekers & Culture Lovers',
            'For the Beach Walkers, Peace Finders & Food Explorers',
            'For those who love to soak in stories, temples & traditions',
            'Note: Since this is a group trip, I\'d like to shed light on the local food. The local food here offers a unique experience with its distinct cooking techniques and ingredients. While some may find the flavors exquisite, others may have varying tastes. Moreover, please note that locating vegetarian eateries can pose a challenge in certain areas. I kindly ask for your understanding and adaptability during our journey.'
        ],
        itinerary=[
            {
                'day': 0,
                'title': 'Departure from Bangalore',
                'date': 'Sep 26 (Friday)',
                'description': 'Depart from Bangalore by train or tempo traveller at 9:00 PM.',
                'activities': []
            },
            {
                'day': 1,
                'title': 'Arrival & Cultural Connection',
                'date': 'Sep 27 (Saturday)',
                'description': 'Arrive at Hubli and continue by vehicle (approx. 2 hrs) to your forest-nestled stay.',
                'activities': [
                    'Freshen up and enjoy a traditional welcome drink with breakfast',
                    'Spend time with the Siddi tribal community, listening to their stories and understanding their age-old traditions',
                    'Join the tribe in preparing authentic dishes over woodfire stoves, savoring the earthy aromas before sitting together for a traditional lunch',
                    'Discover the ingenious hunting tools used by the tribe, as elders demonstrate techniques passed down through generations',
                    'Embark on a short trek to a hidden waterfall, where the sound of rushing water blends with the forest\'s tranquil silence',
                    'Return to the stay and enjoy a refreshing herbal kashaya',
                    'Immerse yourself in an evening of soulful rhythms with Siddi dance, music, and storytelling under the stars',
                    'End the day with a wholesome traditional dinner and overnight stay'
                ]
            },
            {
                'day': 2,
                'title': 'Foraging & Farewell',
                'date': 'Sep 28 (Sunday)',
                'description': 'Wake up early for a guided forest walk and foraging expedition.',
                'activities': [
                    'Wake up early for a guided forest walk and foraging expedition, discovering medicinal plants and wild edibles',
                    'Return for breakfast',
                    'Visit local areca nut farms and forage for seasonal greens',
                    'Engage in a hands-on cooking workshop where you\'ll grind spices, stir pots, and prepare age-old Siddi recipes, finally enjoying a community lunch',
                    'Wander through a nearby village, observing the rhythms of rural life and the simplicity of traditional living',
                    'Take part in tribal games that bring laughter, teamwork, and a glimpse into their playful community spirit',
                    'Savour some tea with the tribe, bid farewell, and depart for Hubli by 8:00 PM',
                    'Board your train/vehicle to Bangalore around 9:00 PM'
                ]
            },
            {
                'day': 3,
                'title': 'Return to Bangalore',
                'date': 'Early Morning',
                'description': 'Reach Bangalore early morning by 7:00 AM.',
                'activities': []
            }
        ],
        contact_info={
            'phone1': '9353810775',
            'phone2': '8073465622',
            'whatsapp': '8073465622'
        },
        bank_details={
            'account_name': 'Adventure Buddha',
            'account_number': '924020059925287',
            'ifsc': 'UTIB0000693',
            'branch': 'Majestic Anand Rao Circle Bangalore',
            'bank': 'Axis Bank',
            'gpay': '8073465622'
        },
        notes='This trip involves basic facilities in terms of food, travel, and stay without any luxury, whatsoever. This is a group trip with a shared model. It may not suit everyone – especially for those expecting privacy and comfort. Homestay with cots & beds/ floor mattresses(sharing basis, separate for boys & girls), clean washrooms. Please do not book this trip if you are not okay with the above points. Travel: Tempo Traveller or Mini Bus (with push-back seats). Note: This trip involves an overnight journey on a push-back Seater (Not sleeper or semis-sleeper). We request you to book this trip only if you can handle slight discomfort (especially the last row of the vehicle with no push back). Seats are allotted on a first come first serve basis to the pickup point.',
        status='published'
    )

    print(f"Created trip: {trip.title}")
    return trip

def create_gudibande_adiyogi_trip():
    """Create the Gudibande and Adiyogi Light Show trip"""

    # Check if trip already exists
    if Trip.objects.filter(slug='gudibande-adiyogi-light-show').exists():
        print("Gudibande and Adiyogi Light Show trip already exists!")
        return

    trip = Trip.objects.create(
        slug='gudibande-adiyogi-light-show',
        title='Gudibande and Adiyogi Light Show',
        subtitle='Gudibande Fort & Isha Foundation',
        description='Experience the majestic Gudibande Fort, a 17th-century marvel with panoramic views and ingenious rainwater harvesting systems, combined with the spiritual grandeur of the Bhoga Nandeeshwara Temple and the spectacular Adiyogi Light & Sound Show at Isha Foundation. This day trip blends history, spirituality, and modern artistry in a perfect harmony.',
        overview='Discover Karnataka\'s hidden gems in this enriching day trip! Gudibande Fort, built in the 17th century, offers stunning panoramic views and showcases brilliant rainwater harvesting systems. Visit the ancient Bhoga Nandeeshwara Temple at the base of Nandi Hills, a 1000-year-old architectural marvel. End your journey with the mesmerizing Adiyogi Light & Sound Show at Isha Foundation, where spirituality meets spectacular visual storytelling. 🏰🕉️✨',
        images=[
            '/images/gudibande-adiyogi-1.jpg',
            '/images/gudibande-adiyogi-2.jpg',
            '/images/gudibande-adiyogi-3.jpg'
        ],
        price=1260.00,
        original_price=1200.00,
        gst_percentage=5.0,
        duration=1,
        tags=['cultural', 'spiritual', 'fort', 'temple', 'light-show', 'isha', 'adiyogi', 'mountain', 'trekking'],
        category='cultural',
        featured_status='both',  # Both featured and popular
        difficulty='easy',
        inclusions=[
            'Travel from Bangalore to Chikkaballapur in a sit-in coach bus',
            '1 meal (lunch)',
            'Coffee/Tea',
            'Local guide and outdoor trek leader from Adventure Buddha',
            'Entry charges for all places'
        ],
        exclusions=[
            'Meals other than those mentioned in the itinerary',
            '5% GST',
            'Any kind of personal expenses',
            'Any kind of insurance (health, life, accidental, medical, etc.)',
            'Anything not included in the above list'
        ],
        things_to_carry=[
            'Water bottle',
            'Raincoat or umbrella',
            'Shoes OR Slippers with good grip',
            'Backpack for carrying essentials while exploring',
            'Toilet kit (toothbrush, toothpaste, soap)',
            'Towel',
            'Comfortable clothes',
            'Cargo/track pants/shorts',
            'Polybags for packing wet clothes',
            'At least one ID proof (Driving License, Voter ID, or Aadhar card)',
            'Extra cash for purchases and meals not included in the package',
            'Sunscreen and Hat',
            'Personal medicine if required',
            'Mosquito repellent cream'
        ],
        important_points=[
            'No Luxury. We assure awesome memories in every trip, but not awesome facilities!',
            'No alcohol & Drugs during Treks & adventure activities',
            'The itinerary is fixed. No special requests to change itinerary/schedule are permitted',
            'Please go through the Terms & Conditions before booking',
            'This trip involves basic facilities in terms of food, travel, and stay without any luxury',
            'This is a group trip with a shared model. It may not suit everyone – especially for those expecting privacy and comfort',
            'Please do not book this trip if you are not okay with the above points'
        ],
        who_can_attend=[
            'Group Trips for 18-40-Year-Olds',
            'Join as Solo / Couple / Small Groups',
            'For the Spiritual Seekers & Culture Lovers',
            'For the Beach Walkers, Peace Finders & Food Explorers',
            'For those who love to soak in stories, temples & traditions',
            'Note: Since this is a group trip, I\'d like to shed light on the local food. The local food here offers a unique experience with its distinct cooking techniques and ingredients. While some may find the flavors exquisite, others may have varying tastes. Moreover, please note that locating vegetarian eateries can pose a challenge in certain areas. I kindly ask for your understanding and adaptability during our journey.'
        ],
        itinerary=[
            {
                'day': 1,
                'title': 'Gudibande Fort & Isha Foundation Day Trip',
                'date': 'Sep 21 (Sunday)',
                'description': 'A complete day of cultural and spiritual exploration starting from Bangalore.',
                'activities': [
                    'Start from Bangalore in the morning by 8:00 AM and complete pickups',
                    'Icebreaker session on the way to get to know your fellow travel buddies',
                    'Visit the Bhoga Nandeeshwara Temple, a 1000-year-old temple at the base of Nandi Hills',
                    'Continue the journey with an early lunch en route to Gudibande',
                    'Reach the base of Gudibande Fort by 2:30 PM and begin the trek',
                    'A beginner-friendly climb of about 2 km leading to panoramic views and a chance to explore the fort\'s history',
                    'Spend some time at the top, enjoying the scenery and capturing memories',
                    'Head down to the base and proceed towards the Isha Foundation in the evening (6:30 PM)',
                    'Witness the grand Adiyogi Light & Sound Show at the 112-feet Adiyogi Shiva Statue',
                    'Start the return journey to Bangalore and reach by night by 10:00 PM (Approximate)'
                ]
            }
        ],
        contact_info={
            'phone1': '9353810775',
            'phone2': '8073465622',
            'whatsapp': '8073465622'
        },
        bank_details={
            'account_name': 'Adventure Buddha',
            'account_number': '924020059925287',
            'ifsc': 'UTIB0000693',
            'branch': 'Majestic Anand Rao Circle Bangalore',
            'bank': 'Axis Bank',
            'gpay': '8073465622'
        },
        notes='This trip involves basic facilities in terms of food, travel, and stay without any luxury, whatsoever. This is a group trip with a shared model. It may not suit everyone – especially for those expecting privacy and comfort. Please do not book this trip if you are not okay with the above points. Travel: Sit-in coach bus. This is a budget-friendly, experience-oriented trip, so we request everyone to come with an open and flexible mindset. Arrangements will be basic and simple—please do not expect luxury or high comfort throughout the journey.',
        status='published'
    )

    print(f"Created trip: {trip.title}")
    return trip

def create_udupi_coastal_escape_updated_trip():
    """Create the updated Udupi Coastal Escape trip with Huli Vesha and Dasara festivities"""

    # Check if trip already exists
    if Trip.objects.filter(slug='udupi-coastal-escape-updated').exists():
        print("Updated Udupi Coastal Escape trip already exists!")
        return

    trip = Trip.objects.create(
        slug='udupi-coastal-escape-updated',
        title='Waves, Temples & Tiger Stripes – Udupi Coastal Escape',
        subtitle='Udupi Coastal Escape with Dasara Festivities',
        description='Trade the city lights of Bangalore for Udupi\'s serene backwaters, golden beaches, and vibrant cultural traditions. This 3-day journey blends adventure and heritage – from kayaking in the Suvarna River and parasailing at Malpe, to witnessing the electrifying Huli Vesha tiger dance and soaking in temple vibes at Sri Krishna Matha. Add in coastal delicacies, lively fish markets, and stunning sunsets – and you\'ve got the perfect mix of sea, soul, and stories.',
        overview='Trade the city lights of Bangalore for Udupi\'s serene backwaters, golden beaches, and vibrant cultural traditions. This 3-day journey blends adventure and heritage – from kayaking in the Suvarna River and parasailing at Malpe, to witnessing the electrifying Huli Vesha tiger dance and soaking in temple vibes at Sri Krishna Matha. Add in coastal delicacies, lively fish markets, and stunning sunsets – and you\'ve got the perfect mix of sea, soul, and stories. 🌅🐅🌴',
        images=[
            '/images/udupi-coastal-updated-1.jpg',
            '/images/udupi-coastal-updated-2.jpg',
            '/images/udupi-coastal-updated-3.jpg'
        ],
        price=5999.00,
        original_price=5714.00,
        gst_percentage=5.0,
        duration=3,
        tags=['cultural', 'beach', 'adventure', 'huli-vesha', 'temple', 'coastal', 'dasara', 'tiger-dance', 'hulivesha'],
        category='cultural',
        featured_status='both',  # Both featured and popular
        difficulty='easy',
        inclusions=[
            'Travel from Bangalore to Udupi homestay in Non AC Tempo Traveller / Minibus 🚐 (depending on the group size)',
            '3 meals: 2 breakfasts (Day 1 & Day 2), and 1 dinner (Day 1) 🍽️',
            'Accommodation on 2–4 sharing basis, with cots/floor mattress (separate for guys and girls)',
            'Local guide and outdoor trek leader from Adventure Buddha'
        ],
        exclusions=[
            'Entry charges (if applicable)',
            'Activity charges (e.g., Kayaking)',
            'Meals other than those mentioned in the itinerary',
            'Any kind of personal expenses',
            '5% GST',
            'Any kind of insurances (health, life, accidental, medical, etc.)',
            'Anything not mentioned in the inclusions list'
        ],
        things_to_carry=[
            'Water bottle',
            'Raincoat or umbrella',
            'Shoes OR Slippers with good grip',
            'Backpack for carrying essentials while exploring',
            'Toilet kit (toothbrush, toothpaste, soap)',
            'Towel',
            'Comfortable clothes',
            'Cargo/track pants/shorts',
            'Polybags for packing wet clothes',
            'At least one ID proof (Driving License, Voter ID, or Aadhar card)',
            'Extra cash for purchases and meals not included in the package',
            'Sunscreen and Hat',
            'Personal medicine if required',
            'Mosquito repellent cream'
        ],
        important_points=[
            'No Luxury. We assure awesome memories in every trip, but not awesome facilities!',
            'No alcohol & Drugs during Treks & adventure activities',
            'The itinerary is fixed. No special requests to change itinerary/schedule are permitted',
            'Please go through the Terms & Conditions before booking',
            'This trip involves basic facilities in terms of food, travel, and stay without any luxury',
            'Dress Code for Temple Visits & Dasara Festivities: Traditional attire is mandatory only if you wish to enter the sanctum of Sri Krishna Temple. For general sightseeing and Dasara celebrations, modest, comfortable clothing is perfectly fine.',
            'Expect very large crowds during Dasara, especially in Udupi and Mangalore. Patience, cooperation, and staying with the group will be important for a smooth experience.'
        ],
        who_can_attend=[
            'Group Trips for 18-40-Year-Olds',
            'Join as Solo / Couple / Small Groups',
            'For the Spiritual Seekers & Culture Lovers',
            'For the Beach Walkers, Peace Finders & Food Explorers',
            'For those who love to soak in stories, temples & traditions',
            'Note: Since this is a group trip, I\'d like to shed light on the local food. The local food here offers a unique experience with its distinct cooking techniques and ingredients. While some may find the flavors exquisite, others may have varying tastes. Moreover, please note that locating vegetarian eateries can pose a challenge in certain areas. I kindly ask for your understanding and adaptability during our journey.'
        ],
        itinerary=[
            {
                'day': 0,
                'title': 'Overnight Journey from Bangalore',
                'date': 'Sep 26 (Friday)',
                'description': 'Board your vehicle in the evening. As the city lights fade, settle in for an overnight ride through Karnataka\'s highways.',
                'activities': []
            },
            {
                'day': 1,
                'title': 'Backwaters, Beaches & Coastal Culture',
                'date': 'Sep 27 (Saturday)',
                'description': 'Arrival in Udupi & Homestay Check-In. Wake up to refreshing coastal air as you arrive in Udupi.',
                'activities': [
                    'Authentic Coastal Breakfast: neer dosa, goli baje, or Udupi buns with chutney',
                    'Kayaking in Suvarna River Backwaters',
                    'Toddy Tasting: traditional fermented coconut drink',
                    'Lunch: Coastal Feast - seafood thali or Udupi-style vegetarian meal',
                    'Beaches Trail: Malpe, Mattu & Padubidri beaches',
                    'Evening at Kapu Beach & Lighthouse',
                    'Dinner and overnight stay at homestay'
                ]
            },
            {
                'day': 2,
                'title': 'Temples, Traditions & Dasara Festivities',
                'date': 'Sep 28 (Sunday)',
                'description': 'Explore Udupi\'s cultural heritage and witness Dasara festivities in Mangalore.',
                'activities': [
                    'Malpe Fish Market Visit - early morning fresh catch auction',
                    'Beach time and relaxation',
                    'Return to homestay, breakfast, and check-out',
                    'Sri Krishna Temple Darshan - world-famous temple with Kanakana Kindi',
                    'Lunch: wholesome sattvic meal on banana leaves',
                    'Drive to Mangalore – Huli Vesha Celebrations (tiger dance during Dasara)',
                    'Evening at Pabba\'s: Gudbud ice cream and snacks',
                    'Dinner in Mangalore and night departure to Bangalore'
                ]
            },
            {
                'day': 3,
                'title': 'Back to Bangalore',
                'date': 'Early Morning',
                'description': 'Arrive in Bangalore early morning around 6 AM.',
                'activities': []
            }
        ],
        contact_info={
            'phone1': '9353810775',
            'phone2': '8073465622',
            'whatsapp': '8073465622'
        },
        bank_details={
            'account_name': 'Adventure Buddha',
            'account_number': '924020059925287',
            'ifsc': 'UTIB0000693',
            'branch': 'Majestic Anand Rao Circle Bangalore',
            'bank': 'Axis Bank',
            'gpay': '8073465622'
        },
        notes='This trip involves basic facilities in terms of food, travel, and stay without any luxury, whatsoever. This is a group trip with a shared model. It may not suit everyone – especially for those expecting privacy and comfort. Homestay with cots & beds/ floor mattresses(sharing basis, separate for boys & girls), clean washrooms. Please do not book this trip if you are not okay with the above points. Travel: Tempo Traveller or Mini Bus (with push-back seats). Note: This trip involves an overnight journey on a push-back Seater (Not sleeper or semis-sleeper). We request you to book this trip only if you can handle slight discomfort (especially the last row of the vehicle with no push back). Seats are allotted on a first come first serve basis to the pickup point. Since this is monsoon season, most beach adventure activities (like water sports) will not be available. But the beaches, backwaters, and cultural experiences will still offer plenty of charm and beauty.',
        status='published'
    )

    print(f"Created trip: {trip.title}")
    return trip

def create_pondicherry_coastal_trip():
    """Create the Pondicherry – Pichavaram – Auroville Coastal Itinerary trip"""

    # Check if trip already exists
    if Trip.objects.filter(slug='pondicherry-pichavaram-auroville').exists():
        print("Pondicherry – Pichavaram – Auroville trip already exists!")
        return

    trip = Trip.objects.create(
        slug='pondicherry-pichavaram-auroville',
        title='Coastal Itinerary: Pondicherry – Pichavaram – Auroville',
        subtitle='Pondicherry Coastal Escape with Mangroves',
        description='Embark on a coastal journey that blends French heritage, mystical mangroves, and spiritual serenity. From Pondicherry\'s colonial charm and Auroville\'s global community to Pichavaram\'s enchanting mangrove forests, this 5-day adventure offers a perfect mix of culture, nature, and coastal vibes.',
        overview='🌊✨ Coastal Itinerary: Pondicherry – Pichavaram – Auroville. This coastal journey blends French heritage, mystical mangroves, and spiritual serenity. From Pondicherry\'s colonial charm and Auroville\'s global community to Pichavaram\'s enchanting mangrove forests, this 5-day adventure offers a perfect mix of culture, nature, and coastal vibes.',
        images=[
            '/images/pondicherry-coastal-1.jpg',
            '/images/pondicherry-coastal-2.jpg',
            '/images/pondicherry-coastal-3.jpg'
        ],
        price=8399.00,
        original_price=7999.00,
        gst_percentage=5.0,
        duration=5,
        tags=['cultural', 'beach', 'spiritual', 'mangroves', 'french-colonial', 'auroville', 'pichavaram', 'coastal', 'hulivesha'],
        category='cultural',
        featured_status='both',  # Both featured and popular
        difficulty='easy',
        inclusions=[
            'Travel to & from Bangalore to Pondicherry in Non AC Tempo Traveller / Minibus 🚐 (depending on the group size)',
            '3 meals: 3 breakfasts (Day 1, Day 2, Day 3) 🍽️',
            'Accommodation on 2–4 sharing basis, with cots/floor mattress (separate for guys and girls)',
            'Local guide and outdoor trek leader from Adventure Buddha'
        ],
        exclusions=[
            'Entry charges (if applicable)',
            'Activity charges (e.g., Kayaking)',
            'Meals other than those mentioned in the itinerary',
            'Any kind of personal expenses',
            '5% GST',
            'Any kind of insurances (health, life, accidental, medical, etc.)',
            'Anything not mentioned in the inclusions list'
        ],
        things_to_carry=[
            'Raincoat or umbrella',
            'Shoes OR Slippers with good grip',
            'Water bottle',
            'Backpack for carrying essentials while exploring',
            'Toilet kit (toothbrush, toothpaste, soap)',
            'Towel',
            'Comfortable clothes',
            'Cargo/track pants/shorts',
            'Polybags for packing wet clothes',
            'At least one ID proof (Driving License, Voter ID, or Aadhar card)',
            'Extra cash for purchases and meals not included in the package',
            'Sunscreen and Hat',
            'Personal medicine if required',
            'Mosquito repellent cream'
        ],
        important_points=[
            'No Luxury. We assure awesome memories in every trip, but not awesome facilities!',
            'No alcohol & Drugs during Treks & adventure activities',
            'The itinerary is fixed. No special requests to change itinerary/schedule are permitted',
            'Please go through the Terms & Conditions before booking',
            'This trip involves basic facilities in terms of food, travel, and stay without any luxury',
            'Traditional attire is mandatory only if you wish to enter the sanctum of temples. For general sightseeing and activities modest, comfortable clothing is perfectly fine.',
            'Patience, cooperation, and staying with the group will be important for a smooth experience.'
        ],
        who_can_attend=[
            'Group Trips for 18-35-Year-Olds',
            'Join as Solo / Couple / Small Groups',
            'For the Spiritual Seekers & Culture Lovers',
            'For the Beach Walkers, Peace Finders & Food Explorers',
            'For those who love to soak in stories, temples & traditions',
            'Note: Since this is a group trip, I\'d like to shed light on the local food. The local food here offers a unique experience with its distinct cooking techniques and ingredients. While some may find the flavors exquisite, others may have varying tastes. Moreover, please note that locating vegetarian eateries can pose a challenge in certain areas. I kindly ask for your understanding and adaptability during our journey.'
        ],
        itinerary=[
            {
                'day': 0,
                'title': 'The Road to Serenity',
                'date': 'Oct 1 (Wednesday Night)',
                'description': 'Pack your bags and set off from Bangalore at 9:00 PM, leaving behind the hustle of the city.',
                'activities': [
                    'Overnight road trip filled with chatter, music, and anticipation',
                    'Watch the glowing skyline fade into the calm of the highway'
                ]
            },
            {
                'day': 1,
                'title': 'Sunrise & French Heritage of Pondicherry',
                'date': 'Oct 2 (Thursday)',
                'description': 'Arrive at your homestay just in time to head to Serenity Beach.',
                'activities': [
                    'Sunrise at Serenity Beach - first rays painting the ocean in gold',
                    'Freshen up and hearty breakfast',
                    'French Colony exploration - cobblestone streets, mustard-yellow villas',
                    'Arulmiga Vinayaka Temple visit',
                    'Sri Aurobindo Ashram - step into silence and spiritual calm',
                    'Immaculate Conception Cathedral - 17th-century church with soaring arches',
                    'Local Pondicherry meal or café lunch (Self-Sponsored)',
                    'Marina Lighthouse climb (2 PM – 5 PM) for Bay of Bengal views',
                    'Sacred Heart Basilica - stained glass windows and kaleidoscope hues',
                    'Rock Beach sunset and evening vibes',
                    'Pondicherry nightlife - cafés with fusion menus and upbeat parties'
                ]
            },
            {
                'day': 2,
                'title': 'Thrills at Sea & Colonial Echoes',
                'date': 'Oct 3 (Friday)',
                'description': 'After breakfast, make your way to Auroville.',
                'activities': [
                    'Auroville exploration - red dirt roads, artsy boutiques, global community',
                    'Colonial City Tour and café lunch (Self-Sponsored)',
                    'Ananda Ranga Pillai Mansion - 18th-century French-Indian history',
                    'French War Memorial - solemn tribute under afternoon sun',
                    'Paradise Beach boat ride across backwaters',
                    'Water adventures - jet skiing, speed boating, or beach relaxation',
                    'Café crawl or Pondicherry nightlife with dance and laughter'
                ]
            },
            {
                'day': 3,
                'title': 'Mystical Mangroves of Pichavaram',
                'date': 'Oct 4 (Saturday)',
                'description': 'Wake up early, have breakfast, and set off for Pichavaram Mangrove Forest.',
                'activities': [
                    'Boat ride through Pichavaram Mangrove Forest - green tunnels and magical canals',
                    'Bird watching - herons, kingfishers, and crabs among mangrove roots',
                    'Kayaking or water-based activities in the unique ecosystem',
                    'Lunch en route or in Pichavaram (Self-Sponsored) with coastal delicacies',
                    'Return to Pondicherry by late afternoon',
                    'Botanical Garden - exotic plant species and colonial landscaping',
                    'Bharathi Park - fountains and grand monuments',
                    'Seaside café dinner with salt air and temple silhouettes',
                    'Begin return journey to Bangalore filled with stories and memories'
                ]
            },
            {
                'day': 4,
                'title': 'Return to Bangalore',
                'date': 'Oct 5 (Sunday Morning)',
                'description': 'Reach Bangalore by late night, hearts full and cameras packed with moments.',
                'activities': []
            }
        ],
        contact_info={
            'phone1': '9353810775',
            'phone2': '8073465622',
            'whatsapp': '8073465622'
        },
        bank_details={
            'account_name': 'Adventure Buddha',
            'account_number': '924020059925287',
            'ifsc': 'UTIB0000693',
            'branch': 'Majestic Anand Rao Circle Bangalore',
            'bank': 'Axis Bank',
            'gpay': '8073465622'
        },
        notes='This trip involves basic facilities in terms of food, travel, and stay without any luxury, whatsoever. This is a group trip with a shared model. It may not suit everyone – especially for those expecting privacy and comfort. Homestay with cots & beds/ floor mattresses(sharing basis, separate for boys & girls), clean washrooms. Please do not book this trip if you are not okay with the above points. Travel: Tempo Traveller or Mini Bus (with push-back seats). Note: This trip involves an overnight journey on a push-back Seater (Not sleeper or semis-sleeper). We request you to book this trip only if you can handle slight discomfort (especially the last row of the vehicle with no push back). Seats are allotted on a first come first serve basis to the pickup point. This trip is designed to give you a real taste of coastal life — not just through sightseeing, but also by exploring old eateries, small local joints, authentic food spots, and offbeat activities that bring out the culture of Pondicherry. Some of these experiences may be simple, rustic, or different from typical touristy trips, but that\'s exactly what makes them special.',
        status='published'
    )

    print(f"Created trip: {trip.title}")
    return trip

def create_coorg_chikmagalur_extended_trip():
    """Create the Coorg + Chikmagalur Extended Itinerary trip"""

    # Check if trip already exists
    if Trip.objects.filter(slug='coorg-chikmagalur-extended').exists():
        print("Coorg + Chikmagalur Extended Itinerary trip already exists!")
        return

    trip = Trip.objects.create(
        slug='coorg-chikmagalur-extended',
        title='Coorg + Chikmagalur Extended Itinerary',
        subtitle='Coorg & Chikmagalur Mountain Adventure',
        description='Embark on an extended journey through Karnataka\'s coffee country, exploring the misty hills of Coorg and Chikmagalur. From off-road jeep adventures and waterfall treks to plantation walks and elephant encounters, this 5-day trip offers the perfect blend of adventure, culture, and natural beauty.',
        overview='🌄 Coorg + Chikmagalur Extended Itinerary. Embark on an extended journey through Karnataka\'s coffee country, exploring the misty hills of Coorg and Chikmagalur. From off-road jeep adventures and waterfall treks to plantation walks and elephant encounters, this 5-day trip offers the perfect blend of adventure, culture, and natural beauty.',
        images=[
            '/images/coorg-chikmagalur-1.jpg',
            '/images/coorg-chikmagalur-2.jpg',
            '/images/coorg-chikmagalur-3.jpg'
        ],
        price=10498.00,
        original_price=9999.00,
        gst_percentage=5.0,
        duration=5,
        tags=['adventure', 'mountains', 'coffee-plantations', 'waterfalls', 'jeep-safari', 'coorg', 'chikmagalur', 'elephant-camp', 'cultural', 'hulivesha'],
        category='adventure',
        featured_status='both',  # Both featured and popular
        difficulty='moderate',
        inclusions=[
            'Travel to & from Bangalore to Coorg-Chikmagalur in Non AC Tempo Traveller / Minibus 🚐 (depending on the group size)',
            '9 meals: 4 breakfast(Day 1,Day 2,Day 3 & Day 4),2 Lunch(Day 3 & Day 4), Dinner(Day 1, Day 2 & Day3) 🍽️',
            'Accommodation will be on a 2–4 sharing basis with a mix of cots and floor mattresses, arranged separately for men and women',
            'Local guide and outdoor trek leader from Adventure Buddha'
        ],
        exclusions=[
            'Entry charges to the places(if applicable)',
            'Activity charges/ Jeep charges (e.g., Kayaking, speed boating)',
            'Meals other than those mentioned in the itinerary',
            'Any kind of personal expenses',
            '5% GST',
            'Any kind of insurances (health, life, accidental, medical, etc.)',
            'Anything not mentioned in the inclusions list'
        ],
        things_to_carry=[
            'Raincoat or umbrella',
            'Shoes OR Slippers with good grip',
            'Water bottle',
            'Backpack for carrying essentials while exploring',
            'Toilet kit (toothbrush, toothpaste, soap)',
            'Towel',
            'Comfortable clothes',
            'Cargo/track pants/shorts',
            'Polybags for packing wet clothes',
            'At least one ID proof (Driving License, Voter ID, or Aadhar card)',
            'Extra cash for purchases and meals not included in the package',
            'Sunscreen and Hat',
            'Personal medicine if required',
            'Mosquito repellent cream'
        ],
        important_points=[
            'No Luxury. We assure awesome memories in every trip, but not awesome facilities!',
            'No alcohol & Drugs during Treks & adventure activities',
            'The itinerary is fixed. No special requests to change itinerary/schedule are permitted',
            'Please go through the Terms & Conditions before booking',
            'This trip involves basic facilities in terms of food, travel, and stay without any luxury',
            'Bring empty lunch boxes for Days 3 & 4 as we will be carrying lunch to interior offbeat locations',
            'Arrangements will be basic and simple yet hygienic —please do not expect luxury or high comfort throughout the journey.'
        ],
        who_can_attend=[
            'Group Trips for 18-40-Year-Olds',
            'Join as Solo / Couple / Groups',
            'For the Spiritual Seekers & Culture Lovers',
            'For the Beach Walkers, Peace Finders & Food Explorers',
            'For those who love to soak in stories, temples & traditions',
            'Note: Since this is a group trip, I\'d like to shed light on the local food. The local food here offers a unique experience with its distinct cooking techniques and ingredients. While some may find the flavors exquisite, others may have varying tastes. Moreover, please note that locating vegetarian eateries can pose a challenge in certain areas. I kindly ask for your understanding and adaptability during our journey.'
        ],
        itinerary=[
            {
                'day': 0,
                'title': 'Departure from Bangalore',
                'date': 'Oct 1 (Wednesday Night)',
                'description': 'Board your vehicle at night and set off on an overnight road journey filled with laughter, music, and anticipation.',
                'activities': [
                    'Overnight road journey filled with laughter, music, and anticipation',
                    'Sleep under the hum of the moving bus as the city lights fade into silence'
                ]
            },
            {
                'day': 1,
                'title': 'Coorg – Hills, Plantations & Sunset',
                'date': 'Oct 2 (Thursday)',
                'description': 'Wake up to the misty hills of Coorg and explore plantations and viewpoints.',
                'activities': [
                    'Arrival & Homestay Check-In - Wake up to misty hills and hearty Kodava breakfast',
                    'Off-Road Jeep Ride to Mandalpatti - Panoramic views of rolling green mountains',
                    'Abbey Falls Visit - Roaring falls surrounded by dense forests and pepper plantations',
                    'Lunch (Self-Sponsored) – Try authentic local Kodava dishes',
                    'Plantation Walk & Wine Tasting - Learn about coffee, pepper, cardamom life cycles and fruit wine tasting',
                    'Omkareshwara Temple & Raja\'s Seat - Indo-Islamic architecture and sunset viewpoints',
                    'Evening at the Homestay - Campfire, local stories, Coorg-style dinner'
                ]
            },
            {
                'day': 2,
                'title': 'Coorg → Chikmagalur',
                'date': 'Oct 3 (Friday)',
                'description': 'Transfer from Coorg to Chikmagalur with wildlife and nature experiences.',
                'activities': [
                    'Morning Coffee & Breakfast - Estate-brewed coffee with mist drifting across plantations',
                    'Harangi Elephant Camp - Meet gentle giants, feed them, witness playful side (closes by 10:30 AM)',
                    'Cauvery Nisargadhama - Hanging bridges and bamboo groves on river island',
                    'Lunch (Self-Sponsored) – Try authentic local Kodava dishes',
                    'Transfer to Chikmagalur - Scenic drive to emerald hills above coffee country',
                    'Check into forest homestay and unwind',
                    'Dinner & Campfire - Good food, laughter, and music by the fire'
                ]
            },
            {
                'day': 3,
                'title': 'Chikmagalur – Peaks & Waterfalls',
                'date': 'Oct 4 (Saturday)',
                'description': 'Explore Chikmagalur\'s highest peaks and hidden waterfalls.',
                'activities': [
                    'Breakfast & Start the Day - Fresh filter coffee and homely breakfast',
                    'Baba Budan Giri Peak - Legendary peak where coffee first found roots in India',
                    'Jhari / Dabdabe / Buttermilk Falls - Jeep ride and jungle trek to hidden waterfalls',
                    'Lunch (Self-Sponsored) – Relish Malnad-style delicacies (bring empty lunch boxes)',
                    'Mullayangiri Peak - Karnataka\'s highest peak via thrilling jeep trails and sunset views',
                    'Evening Back at the Homestay - Coffee, dinner, music, and dance by the fire'
                ]
            },
            {
                'day': 4,
                'title': 'Chikmagalur – Waterfalls & Return',
                'date': 'Oct 5 (Sunday)',
                'description': 'Final adventures in Chikmagalur before returning to Bangalore.',
                'activities': [
                    'Breakfast & Check-Out - Wholesome breakfast before final adventures',
                    'Hebbe Falls - Forest trails and trek to stunning waterfall in the Ghats',
                    'Lunch (Self-Sponsored) – Relish Malnad-style delicacies (bring empty lunch boxes)',
                    'Z Point Viewpoint - Windy cliff-edge with 360° panoramas',
                    'Kalathgiri Temple - Serene temple surrounded by nature',
                    'Evening Departure - Set off for Bangalore by 5:00 PM with dinner stop en route',
                    'Reach Bangalore by 10 PM (Approx)'
                ]
            }
        ],
        contact_info={
            'phone1': '9353810775',
            'phone2': '8073465622',
            'whatsapp': '8073465622'
        },
        bank_details={
            'account_name': 'Adventure Buddha',
            'account_number': '924020059925287',
            'ifsc': 'UTIB0000693',
            'branch': 'Majestic Anand Rao Circle Bangalore',
            'bank': 'Axis Bank',
            'gpay': '8073465622'
        },
        notes='This trip involves basic facilities in terms of food, travel, and stay without any luxury, whatsoever. This is a group trip with a shared model. It may not suit everyone – especially for those expecting privacy and comfort. Homestay with cots & beds/ floor mattresses(sharing basis, separate for boys & girls), clean washrooms. Please do not book this trip if you are not okay with the above points. Travel: Tempo Traveller or Mini Bus (with push-back/recliner seats). Note: This trip involves an overnight journey on a push-back(recliner) seating vehicle. We request you to book this trip only if you can handle slight discomfort (especially the last row of the vehicle with no push back). Seats are allotted on a first come first serve basis to the pickup point. This trip is designed to give you a real taste of mountain life — not just through sightseeing, but also by exploring old eateries, small local joints, authentic food spots, and offbeat activities that bring out the culture of Coorg & Chikmagalur. Some of these experiences may be simple, rustic, or different from typical touristy trips, but that\'s exactly what makes them special.',
        status='published'
    )

    print(f"Created trip: {trip.title}")
    return trip

def create_udupi_mangalore_agumbe_coastal_escape_trip():
    """Create the Udupi, Mangalore & Agumbe Coastal Escape trip"""

    # Check if trip already exists
    if Trip.objects.filter(slug='udupi-mangalore-agumbe-coastal-escape').exists():
        print("Udupi, Mangalore & Agumbe Coastal Escape trip already exists!")
        return

    trip = Trip.objects.create(
        slug='udupi-mangalore-agumbe-coastal-escape',
        title='Waves, Temples & Tiger Stripes – Udupi, Mangalore & Agumbe Coastal Escape',
        subtitle='Udupi Coastal Escape with Mangalore & Agumbe',
        description='Trade the city lights of Bangalore for Udupi\'s serene backwaters, golden beaches, and vibrant cultural traditions. This 4-day journey blends adventure and heritage – from kayaking in the Suvarna River and parasailing at Malpe, to witnessing the electrifying Huli Vesha tiger dance in Mangalore, exploring Agumbe\'s rainforests, and soaking in temple vibes at Sri Krishna Matha. Add in coastal delicacies, lively fish markets, and stunning sunsets – and you\'ve got the perfect mix of sea, soul, and stories.',
        overview='Trade the city lights of Bangalore for Udupi\'s serene backwaters, golden beaches, and vibrant cultural traditions. This 4-day journey blends adventure and heritage – from kayaking in the Suvarna River and parasailing at Malpe, to witnessing the electrifying Huli Vesha tiger dance in Mangalore, exploring Agumbe\'s rainforests, and soaking in temple vibes at Sri Krishna Matha. Add in coastal delicacies, lively fish markets, and stunning sunsets – and you\'ve got the perfect mix of sea, soul, and stories. 🌅🐅🌴',
        images=[
            '/images/udupi-mangalore-agumbe-1.jpg',
            '/images/udupi-mangalore-agumbe-2.jpg',
            '/images/udupi-mangalore-agumbe-3.jpg'
        ],
        price=9449.00,
        original_price=8999.00,
        gst_percentage=5.0,
        duration=4,
        tags=['cultural', 'beach', 'adventure', 'huli-vesha', 'temple', 'coastal', 'dasara', 'tiger-dance', 'mangalore', 'agumbe', 'rainforest', 'hulivesha'],
        category='cultural',
        featured_status='both',  # Both featured and popular
        difficulty='easy',
        inclusions=[
            'Travel from Bangalore to Udupi homestay in Non AC Tempo Traveller / Minibus 🚐 (depending on the group size)',
            '4 meals: 3 breakfasts (Day 1 & Day 2), 1 Lunch(Day 2) and 1 dinner (Day 1) 🍽️',
            'Accommodation on 2–4 sharing basis, with cots/floor mattress (separate for guys and girls)',
            'Local guide and outdoor trek leader from Adventure Buddha'
        ],
        exclusions=[
            'Entry charges (if applicable)',
            'Activity charges (e.g., Kayaking)',
            'Meals other than those mentioned in the itinerary',
            'Any kind of personal expenses',
            '5% GST',
            'Any kind of insurances (health, life, accidental, medical, etc.)',
            'Anything not mentioned in the inclusions list'
        ],
        things_to_carry=[
            'Water bottle',
            'Raincoat or umbrella',
            'Shoes OR Slippers with good grip',
            'Backpack for carrying essentials while exploring',
            'Toilet kit (toothbrush, toothpaste, soap)',
            'Towel',
            'Comfortable clothes',
            'Cargo/track pants/shorts',
            'Polybags for packing wet clothes',
            'At least one ID proof (Driving License, Voter ID, or Aadhar card)',
            'Extra cash for purchases and meals not included in the package',
            'Sunscreen and Hat',
            'Personal medicine if required',
            'Mosquito repellent cream'
        ],
        important_points=[
            'No Luxury. We assure awesome memories in every trip, but not awesome facilities!',
            'No alcohol & Drugs during Treks & adventure activities',
            'The itinerary is fixed. No special requests to change itinerary/schedule are permitted',
            'Please go through the Terms & Conditions before booking',
            'This trip involves basic facilities in terms of food, travel, and stay without any luxury',
            'Dress Code for Temple Visits & Dasara Festivities: Traditional attire is mandatory only if you wish to enter the sanctum of Sri Krishna Temple. For general sightseeing and Dasara celebrations, modest, comfortable clothing is perfectly fine.',
            'Expect very large crowds during Dasara, especially in Udupi and Mangalore. Patience, cooperation, and staying with the group will be important for a smooth experience.'
        ],
        who_can_attend=[
            'Group Trips for 18-40-Year-Olds',
            'Join as Solo / Couple / Small Groups',
            'For the Spiritual Seekers & Culture Lovers',
            'For the Beach Walkers, Peace Finders & Food Explorers',
            'For those who love to soak in stories, temples & traditions',
            'Note: Since this is a group trip, I\'d like to shed light on the local food. The local food here offers a unique experience with its distinct cooking techniques and ingredients. While some may find the flavors exquisite, others may have varying tastes. Moreover, please note that locating vegetarian eateries can pose a challenge in certain areas. I kindly ask for your understanding and adaptability during our journey.'
        ],
        itinerary=[
            {
                'day': 0,
                'title': 'Overnight Journey from Bangalore',
                'date': 'Oct 1 (Wednesday)',
                'description': 'Board your vehicle in the evening. As the city lights fade, settle in for an overnight ride through Karnataka\'s highways.',
                'activities': []
            },
            {
                'day': 1,
                'title': 'Backwaters, Beaches & Coastal Culture',
                'date': 'Oct 2 (Thursday)',
                'description': 'Arrival in Udupi & Homestay Check-In. Wake up to refreshing coastal air as you arrive in Udupi.',
                'activities': [
                    'Authentic Coastal Breakfast: neer dosa, goli baje, or Udupi buns with chutney',
                    'Kayaking in Suvarna River Backwaters',
                    'Toddy Tasting: traditional fermented coconut drink',
                    'Lunch: Coastal Feast - seafood thali or Udupi-style vegetarian meal',
                    'Beaches Trail: Malpe, Mattu & Pithrody beaches',
                    'Evening at Kapu Beach & Lighthouse',
                    'Dinner and overnight stay at homestay'
                ]
            },
            {
                'day': 2,
                'title': 'Temples, Traditions & Dasara Festivities',
                'date': 'Oct 3 (Friday)',
                'description': 'Explore Udupi\'s cultural heritage and witness Dasara festivities in Mangalore.',
                'activities': [
                    'Malpe Fish Market Visit - early morning fresh catch auction',
                    'Beach time and relaxation',
                    'Return to homestay, breakfast, and check-out',
                    'Sri Krishna Temple Darshan - world-famous temple with Kanakana Kindi',
                    'Lunch: wholesome sattvic meal on banana leaves',
                    'Drive to Mangalore – Huli Vesha Celebrations (tiger dance during Dasara)',
                    'Evening at Pabba\'s: Gudbud ice cream and snacks',
                    'Dinner in Mangalore and return to homestay',
                    'Overnight stay at homestay'
                ]
            },
            {
                'day': 3,
                'title': 'Agumbe – Rainforests & Sunset',
                'date': 'Oct 4 (Saturday)',
                'description': 'Explore Agumbe\'s rainforests and enjoy stunning sunset views.',
                'activities': [
                    'Breakfast & Departure for Agumbe (approx. 2.5 hrs drive)',
                    'Kundadri Hills – Jain temple with sweeping Western Ghats views',
                    'Malgudi Days House – iconic house from classic TV series',
                    'Lunch: Malnad Style - akki rotti, pathrode, avarekalu dishes',
                    'Agumbe Sunset Point – stunning sunset over misty ghats',
                    'Evening departure back to Bangalore with dinner en route'
                ]
            },
            {
                'day': 4,
                'title': 'Back to Bangalore',
                'date': 'Early Morning Oct 5 (Sunday)',
                'description': 'Arrive in Bangalore early morning around 5:30 AM.',
                'activities': []
            }
        ],
        contact_info={
            'phone1': '9353810775',
            'phone2': '8073465622',
            'whatsapp': '8073465622'
        },
        bank_details={
            'account_name': 'Adventure Buddha',
            'account_number': '924020059925287',
            'ifsc': 'UTIB0000693',
            'branch': 'Majestic Anand Rao Circle Bangalore',
            'bank': 'Axis Bank',
            'gpay': '8073465622'
        },
        notes='This trip involves basic facilities in terms of food, travel, and stay without any luxury, whatsoever. This is a group trip with a shared model. It may not suit everyone – especially for those expecting privacy and comfort. Homestay with cots & beds/ floor mattresses(sharing basis, separate for boys & girls), clean washrooms. Please do not book this trip if you are not okay with the above points. Travel: Tempo Traveller or Mini Bus (with push-back seats). Note: This trip involves an overnight journey on a push-back Seater (Not sleeper or semis-sleeper). We request you to book this trip only if you can handle slight discomfort (especially the last row of the vehicle with no push back). Seats are allotted on a first come first serve basis to the pickup point. Since this is monsoon season, most beach adventure activities (like water sports) will not be available. But the beaches, backwaters, and cultural experiences will still offer plenty of charm and beauty. This trip is designed to give you a real taste of coastal life — not just through sightseeing, but also by exploring old eateries, small local joints, authentic food spots, and offbeat activities that bring out the culture of Udupi.',
        status='published'
    )

    print(f"Created trip: {trip.title}")
    return trip

def create_hampi_weekend_getaway_trip():
    """Create the Hampi Weekend Getaway – Heritage, Hills & Hippie Vibes trip"""

    # Check if trip already exists
    if Trip.objects.filter(slug='hampi-weekend-getaway').exists():
        print("Hampi Weekend Getaway trip already exists!")
        return

    trip = Trip.objects.create(
        slug='hampi-weekend-getaway',
        title='Hampi Weekend Getaway – Heritage, Hills & Hippie Vibes',
        subtitle='Hampi Heritage & Adventure',
        description='Step away from Bangalore\'s bustle and into Hampi\'s timeless world of boulders, temples, and river valleys. This 2-day journey is a blend of heritage and adventure – from wandering through the grand ruins of the Vijayanagara Empire and watching sunsets from Hemakuta and Anjanadri Hills, to feeling the rush of cliff jumping at Sanapur Lake and drifting on coracle rides. Add in vibrant hippie cafés, soulful music, and the charm of rustic stays – and you\'ve got a weekend escape where history, thrill, and tranquility meet.',
        overview='⛰️✨ Step away from Bangalore\'s bustle and into Hampi\'s timeless world of boulders, temples, and river valleys. This 2-day journey is a blend of heritage and adventure – from wandering through the grand ruins of the Vijayanagara Empire and watching sunsets from Hemakuta and Anjanadri Hills, to feeling the rush of cliff jumping at Sanapur Lake and drifting on coracle rides. Add in vibrant hippie cafés, soulful music, and the charm of rustic stays – and you\'ve got a weekend escape where history, thrill, and tranquility meet. 🌅🏛️🌊',
        images=[
            '/images/hampi-weekend-1.jpg',
            '/images/hampi-weekend-2.jpg',
            '/images/hampi-weekend-3.jpg'
        ],
        price=4999.00,
        original_price=4761.00,
        gst_percentage=5.0,
        duration=3,
        tags=['cultural', 'heritage', 'adventure', 'hampi', 'temples', 'boulders', 'sunset', 'cliff-jumping', 'coracle', 'hippie', 'vijayanagara', 'hulivesha'],
        category='cultural',
        featured_status='both',  # Both featured and popular
        difficulty='moderate',
        inclusions=[
            'Travel from Bangalore to Hampi homestay in Non AC Tempo Traveller / Minibus 🚐 (depending on the group size)',
            '3 meals: 2 breakfasts (Day 1 & Day 2), and 1 dinner (Day 1) 🍽️',
            'Accommodation in hut cottages with cots and floor mattresses on a multiple-sharing basis',
            'Local guide and outdoor trek leader from Adventure Buddha',
            'Entry charges to all the listed places in the itinerary'
        ],
        exclusions=[
            'Meals other than those mentioned in the itinerary',
            'Coracle ride at Sanapur Lake (self-sponsored)',
            'Cliff jumping at Sanapur Lake (self-sponsored)',
            'Any kind of personal expenses',
            'Any kind of insurance (health, life, accidental, medical, etc.)',
            'Anything not mentioned in the inclusions list',
            '5% GST'
        ],
        things_to_carry=[
            'Water bottle',
            'Raincoat or umbrella',
            'Shoes OR Slippers with good grip',
            'Backpack for carrying essentials while exploring',
            'Toilet kit (toothbrush, toothpaste, soap)',
            'Towel',
            'Comfortable clothes',
            'Cargo/track pants/shorts',
            'Polybags for packing wet clothes',
            'At least one ID proof (Driving License, Voter ID, or Aadhar card)',
            'Extra cash for purchases and meals not included in the package',
            'Sunscreen and Hat',
            'Personal medicine if required',
            'Mosquito repellent cream'
        ],
        important_points=[
            'No Luxury. We assure awesome memories in every trip, but not awesome facilities!',
            'No alcohol & Drugs during Treks & adventure activities',
            'The itinerary is fixed. No special requests to change itinerary/schedule are permitted',
            'Please go through the Terms & Conditions before booking',
            'This trip involves basic facilities in terms of food, travel, and stay without any luxury',
            'Certain adventure activities (like cliff jumping or lake swims) may depend on weather and water levels, as your safety comes first.'
        ],
        who_can_attend=[
            'Group Trips for 18-40-Year-Olds',
            'Join as Solo / Couple / Small Groups',
            'For the Spiritual Seekers & Culture Lovers',
            'For the Beach Walkers, Peace Finders & Food Explorers',
            'For those who love to soak in stories, temples & traditions',
            'Note: Since this is a group trip, I\'d like to shed light on the local food. The local food here offers a unique experience with its distinct cooking techniques and ingredients. While some may find the flavors exquisite, others may have varying tastes. Moreover, please note that locating vegetarian eateries can pose a challenge in certain areas. I kindly ask for your understanding and adaptability during our journey.'
        ],
        itinerary=[
            {
                'day': 0,
                'title': 'Departure from Bangalore',
                'date': 'Oct 3 (Friday Night)',
                'description': 'Departure from Bangalore at 9:00 PM. Overnight journey to Hampi in a comfortable Non-AC coach/TT.',
                'activities': []
            },
            {
                'day': 1,
                'title': 'Heritage & Sunset',
                'date': 'Oct 4 (Saturday)',
                'description': 'Reach Hampi early morning and explore the Vijayanagara Empire heritage sites.',
                'activities': [
                    'Freshen up and breakfast (washrooms arranged; luggage drop until 11 AM check-in)',
                    'Explore Heritage Side: Virupaksha Temple, Lotus Mahal, Elephant Stables, Vittala Temple (Stone Chariot)',
                    'Visit Shivalinga & Ugra Narasimha statue, Kadalekalu Ganapathi',
                    'Lunch (self-sponsored at local restaurant)',
                    'Sunset at Hemakuta Hills - panoramic views with golden hues over ruins',
                    'Return to homestay, freshen up and relax',
                    'Dinner at café - unwind with music and chilled-out Hampi vibe'
                ]
            },
            {
                'day': 2,
                'title': 'Adventure & Lakeside Fun',
                'date': 'Oct 5 (Sunday)',
                'description': 'Hike to Anjanadri Hill and enjoy adventure at Sanapur Lake.',
                'activities': [
                    'Breakfast at homestay',
                    'Hike to Anjanadri Hill - birthplace of Lord Hanuman with panoramic views',
                    'Lunch (self-sponsored)',
                    'Adventure at Sanapur Lake - cliff jumping and coracle rides (self-sponsored)',
                    'Relax and capture scenic photos of lake and waterfalls',
                    'Visit Tungabhadra Dam - serene sunset views',
                    'Dinner at Hospet (self-sponsored)',
                    'Depart for Bangalore at 9:30 PM',
                    'Reach Bangalore by 4:00 AM (approx)'
                ]
            }
        ],
        contact_info={
            'phone1': '9353810775',
            'phone2': '8073465622',
            'whatsapp': '8073465622'
        },
        bank_details={
            'account_name': 'Adventure Buddha',
            'account_number': '924020059925287',
            'ifsc': 'UTIB0000693',
            'branch': 'Majestic Anand Rao Circle Bangalore',
            'bank': 'Axis Bank',
            'gpay': '8073465622'
        },
        notes='This trip involves basic facilities in terms of food, travel, and stay without any luxury, whatsoever. This is a group trip with a shared model. It may not suit everyone – especially for those expecting privacy and comfort. Homestay with cots & beds/ floor mattresses(sharing basis, separate for boys & girls), clean washrooms. Please do not book this trip if you are not okay with the above points. Travel: Tempo Traveller or Mini Bus (with push-back seats). Note: This trip involves an overnight journey on a push-back Seater (Not sleeper or semis-sleeper). We request you to book this trip only if you can handle slight discomfort (especially the last row of the vehicle with no push back). Seats are allotted on a first come first serve basis to the pickup point. This trip is designed to let you experience Hampi beyond just monuments — blending history, adventure, and culture in a way that feels alive. From wandering through ancient temple complexes and royal ruins to hiking up hills for magical sunsets, and from thrilling cliff jumps to peaceful coracle rides, every moment is crafted to be immersive. Some experiences may be rustic, adventurous, or different from regular touristy trips — but that\'s the charm of Hampi.',
        status='published'
    )

    print(f"Created trip: {trip.title}")
    return trip

def create_sample_trips():
    """Create additional sample trips for testing"""

    # Sample trip 2 - Featured only
    if not Trip.objects.filter(slug='kashmir-valley-adventure').exists():
        trip2 = Trip.objects.create(
            slug='kashmir-valley-adventure',
            title='Kashmir Valley Adventure',
            subtitle='Paradise on Earth',
            description='Experience the breathtaking beauty of Kashmir with houseboat stays, shikara rides, and mountain treks.',
            images=['/images/kashmir-1.jpg', '/images/kashmir-2.jpg'],
            price=15999.00,
            duration=7,
            tags=['adventure', 'mountains', 'houseboat', 'kashmir', 'cultural', 'hulivesha'],
            category='adventure',
            featured_status='featured',
            difficulty='moderate',
            inclusions=['Accommodation', 'Meals', 'Local transport', 'Guide'],
            exclusions=['Flights', 'Personal expenses', 'Insurance'],
            things_to_carry=['Warm clothes', 'Hiking shoes', 'ID proof'],
            itinerary=[
                {'day': 1, 'title': 'Arrival in Srinagar', 'description': 'Welcome to Kashmir'},
                {'day': 2, 'title': 'Houseboat Stay', 'description': 'Relax on Dal Lake'},
                {'day': 3, 'title': 'Mountain Trek', 'description': 'Explore the valleys'}
            ],
            status='published'
        )
        print(f"Created trip: {trip2.title}")

    # Sample trip 3 - Popular only
    if not Trip.objects.filter(slug='goa-beach-retreat').exists():
        trip3 = Trip.objects.create(
            slug='goa-beach-retreat',
            title='Goa Beach Retreat',
            subtitle='Sun, Sand & Serenity',
            description='Relax on Goa\'s pristine beaches with yoga sessions and beach activities.',
            images=['/images/goa-1.jpg', '/images/goa-2.jpg'],
            price=8999.00,
            duration=5,
            tags=['beach', 'relaxation', 'yoga', 'goa', 'cultural', 'hulivesha'],
            category='beach',
            featured_status='popular',
            difficulty='easy',
            inclusions=['Beach resort stay', 'Yoga sessions', 'Meals', 'Local transport'],
            exclusions=['Flights', 'Personal expenses', 'Spa treatments'],
            things_to_carry=['Swimwear', 'Sunscreen', 'Light clothes'],
            itinerary=[
                {'day': 1, 'title': 'Arrival & Beach Welcome', 'description': 'Settle into paradise'},
                {'day': 2, 'title': 'Yoga & Meditation', 'description': 'Find inner peace'},
                {'day': 3, 'title': 'Beach Activities', 'description': 'Water sports and relaxation'}
            ],
            status='published'
        )
        print(f"Created trip: {trip3.title}")

    # Sample trip 4 - Both featured and popular
    if not Trip.objects.filter(slug='rajasthan-cultural-tour').exists():
        trip4 = Trip.objects.create(
            slug='rajasthan-cultural-tour',
            title='Rajasthan Cultural Heritage Tour',
            subtitle='Royal Palaces & Desert Adventures',
            description='Explore Rajasthan\'s royal heritage with palace visits, desert safaris, and cultural performances.',
            images=['/images/rajasthan-1.jpg', '/images/rajasthan-2.jpg'],
            price=12999.00,
            duration=8,
            tags=['cultural', 'heritage', 'desert', 'palaces', 'rajasthan', 'hulivesha'],
            category='cultural',
            featured_status='both',
            difficulty='moderate',
            inclusions=['Heritage hotels', 'Cultural performances', 'Desert safari', 'Meals', 'Guide'],
            exclusions=['Flights', 'Personal expenses', 'Camera fees'],
            things_to_carry=['Comfortable clothes', 'Walking shoes', 'Scarf for desert'],
            itinerary=[
                {'day': 1, 'title': 'Jaipur Arrival', 'description': 'Welcome to the Pink City'},
                {'day': 2, 'title': 'Palace Tours', 'description': 'Explore royal heritage'},
                {'day': 3, 'title': 'Desert Safari', 'description': 'Experience the Thar Desert'}
            ],
            status='published'
        )
        print(f"Created trip: {trip4.title}")

if __name__ == '__main__':
    print("Creating trips...")
    create_udupi_trip()
    create_uttara_kannada_trip()
    create_gudibande_adiyogi_trip()
    create_udupi_coastal_escape_updated_trip()
    create_pondicherry_coastal_trip()
    create_coorg_chikmagalur_extended_trip()
    create_udupi_mangalore_agumbe_coastal_escape_trip()
    create_hampi_weekend_getaway_trip()
    create_sample_trips()
    print("All trips created successfully!")