from django.db import models
from django.contrib.auth.models import User
from bookings.models import Booking

class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('razorpay', 'Razorpay'),
        ('upi', 'UPI'),
        ('manual', 'Manual Upload'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.AutoField(primary_key=True)
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    payment_data = models.JSONField(default=dict)  # Store payment-specific data
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment {self.id} for Booking {self.booking.id}"

class ManualPayment(models.Model):
    id = models.AutoField(primary_key=True)
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE)
    screenshot = models.ImageField(upload_to='payment_screenshots/')
    verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Manual Payment {self.id} for Payment {self.payment.id}"