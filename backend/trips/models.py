from django.db import models
from django.contrib.auth.models import User

class Trip(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('moderate', 'Moderate'),
        ('challenging', 'Challenging'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    CATEGORY_CHOICES = [
        ('cultural', 'Cultural'),
        ('adventure', 'Adventure'),
        ('spiritual', 'Spiritual'),
        ('beach', 'Beach'),
        ('trekking', 'Trekking'),
        ('mixed', 'Mixed'),
    ]
    
    FEATURED_CHOICES = [
        ('featured', 'Featured'),
        ('popular', 'Popular'),
        ('both', 'Both'),
        ('none', 'None'),
    ]
    
    id = models.AutoField(primary_key=True)
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True, null=True)
    description = models.TextField()
    overview = models.TextField(blank=True, null=True)
    images = models.JSONField(default=list)  # Store image URLs as list
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=5.0)
    duration = models.IntegerField()  # in days
    tags = models.JSONField(default=list)  # Store tags as list
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='mixed')
    featured_status = models.CharField(max_length=20, choices=FEATURED_CHOICES, default='none')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    review_count = models.IntegerField(default=0)
    inclusions = models.JSONField(default=list)
    exclusions = models.JSONField(default=list)
    things_to_carry = models.JSONField(default=list)
    important_points = models.JSONField(default=list)
    who_can_attend = models.JSONField(default=list)
    itinerary = models.JSONField(default=list)  # Store day-wise itinerary
    contact_info = models.JSONField(default=dict)  # Contact numbers, etc.
    bank_details = models.JSONField(default=dict)  # Payment information
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class TripSlot(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('filling_fast', 'Filling Fast'),
        ('sold_out', 'Sold Out'),
    ]
    
    id = models.AutoField(primary_key=True)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='upcoming_slots')
    date = models.DateField()
    time = models.TimeField()
    vehicle_type = models.CharField(max_length=100)
    total_seats = models.IntegerField()
    available_seats = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.trip.title} - {self.date} {self.time}"

class SeatMap(models.Model):
    id = models.AutoField(primary_key=True)
    slot = models.OneToOneField(TripSlot, on_delete=models.CASCADE, related_name='seat_map')
    vehicle = models.CharField(max_length=100)
    rows = models.IntegerField()
    cols = models.IntegerField()
    seats = models.JSONField()  # Store seat configuration as JSON
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Seat Map for {self.slot.trip.title} - {self.slot.date}"