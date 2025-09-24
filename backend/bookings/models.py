from django.db import models
from django.contrib.auth.models import User
from trips.models import TripSlot

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending_payment', 'Pending Payment'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]
    
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    slot = models.ForeignKey(TripSlot, on_delete=models.CASCADE)
    seat_ids = models.JSONField()  # Store selected seat IDs as list
    lock_token = models.CharField(max_length=100, unique=True, null=True, blank=True)
    lock_expiry = models.DateTimeField(null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_payment')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Booking {self.id} - {self.user.username}"

class SeatLock(models.Model):
    id = models.AutoField(primary_key=True)
    slot = models.ForeignKey(TripSlot, on_delete=models.CASCADE)
    seat_ids = models.JSONField()  # Store locked seat IDs as list
    lock_token = models.CharField(max_length=100, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Lock {self.lock_token} for {self.slot.trip.title}"