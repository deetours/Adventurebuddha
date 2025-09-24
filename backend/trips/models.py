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
    
    id = models.AutoField(primary_key=True)
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    images = models.JSONField(default=list)  # Store image URLs as list
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration = models.IntegerField()  # in days
    tags = models.JSONField(default=list)  # Store tags as list
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    review_count = models.IntegerField(default=0)
    inclusions = models.JSONField(default=list)
    exclusions = models.JSONField(default=list)
    itinerary = models.JSONField(default=list)  # Store day-wise itinerary
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