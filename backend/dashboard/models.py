from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import uuid

class DashboardStats(models.Model):
    """Real-time dashboard statistics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    total_bookings = models.IntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    active_users = models.IntegerField(default=0)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    monthly_growth = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    pending_bookings = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Dashboard Stats'
        verbose_name_plural = 'Dashboard Stats'

class TripAnalytics(models.Model):
    """Trip performance analytics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trip = models.ForeignKey('trips.Trip', on_delete=models.CASCADE)
    bookings_count = models.IntegerField(default=0)
    revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    occupancy_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    period_start = models.DateField()
    period_end = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Trip Analytics'
        verbose_name_plural = 'Trip Analytics'
        unique_together = ['trip', 'period_start', 'period_end']

class AgentMetrics(models.Model):
    """AI Agent performance metrics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent_type = models.CharField(max_length=50)  # trip_guidance, faq, payment, etc.
    total_chats = models.IntegerField(default=0)
    avg_response_time = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # seconds
    user_satisfaction = models.DecimalField(max_digits=5, decimal_places=2, default=0)  # percentage
    active_sessions = models.IntegerField(default=0)
    period_start = models.DateField()
    period_end = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Agent Metrics'
        verbose_name_plural = 'Agent Metrics'
        unique_together = ['agent_type', 'period_start', 'period_end']

class UserDashboardStats(models.Model):
    """User-specific dashboard statistics"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    total_trips = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    favorite_destination = models.CharField(max_length=100, blank=True)
    loyalty_points = models.IntegerField(default=0)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Dashboard Stats'
        verbose_name_plural = 'User Dashboard Stats'

class NotificationSettings(models.Model):
    """User notification preferences"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Email notifications
    email_bookings = models.BooleanField(default=True)
    email_promotions = models.BooleanField(default=False)
    email_updates = models.BooleanField(default=True)

    # SMS notifications
    sms_bookings = models.BooleanField(default=True)
    sms_updates = models.BooleanField(default=True)

    # WhatsApp notifications
    whatsapp_bookings = models.BooleanField(default=True)
    whatsapp_updates = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Notification Settings'
        verbose_name_plural = 'Notification Settings'

class TravelPreferences(models.Model):
    """User travel preferences"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    # Trip preferences
    preferred_trip_types = models.JSONField(default=list)  # ['adventure', 'beach', 'cultural']
    preferred_group_size = models.CharField(max_length=20, default='small')  # small, medium, large
    preferred_budget_min = models.IntegerField(default=15000)
    preferred_budget_max = models.IntegerField(default=50000)
    preferred_activity_level = models.CharField(max_length=20, default='moderate')  # easy, moderate, challenging

    # Additional preferences
    dietary_restrictions = models.JSONField(default=list)
    accessibility_needs = models.TextField(blank=True)
    special_requests = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Travel Preferences'
        verbose_name_plural = 'Travel Preferences'

class FavoriteTrip(models.Model):
    """User favorite trips"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    trip = models.ForeignKey('trips.Trip', on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Favorite Trip'
        verbose_name_plural = 'Favorite Trips'
        unique_together = ['user', 'trip']

class DashboardActivity(models.Model):
    """Dashboard activity log for real-time updates"""
    ACTIVITY_TYPES = [
        ('booking_created', 'Booking Created'),
        ('booking_updated', 'Booking Updated'),
        ('payment_received', 'Payment Received'),
        ('user_registered', 'User Registered'),
        ('trip_completed', 'Trip Completed'),
        ('agent_interaction', 'Agent Interaction'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    data = models.JSONField(default=dict)  # Additional activity data
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Dashboard Activity'
        verbose_name_plural = 'Dashboard Activities'
        ordering = ['-created_at']