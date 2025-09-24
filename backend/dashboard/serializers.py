from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    DashboardStats, TripAnalytics, AgentMetrics, UserDashboardStats,
    NotificationSettings, TravelPreferences, FavoriteTrip, DashboardActivity
)
from trips.models import Trip
from bookings.models import Booking

class DashboardStatsSerializer(serializers.ModelSerializer):
    """Serializer for dashboard statistics"""
    class Meta:
        model = DashboardStats
        fields = '__all__'

class TripAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for trip analytics"""
    trip_name = serializers.CharField(source='trip.title', read_only=True)
    trip_destination = serializers.CharField(source='trip.destination', read_only=True)

    class Meta:
        model = TripAnalytics
        fields = '__all__'

class AgentMetricsSerializer(serializers.ModelSerializer):
    """Serializer for agent metrics"""
    class Meta:
        model = AgentMetrics
        fields = '__all__'

class UserDashboardStatsSerializer(serializers.ModelSerializer):
    """Serializer for user dashboard statistics"""
    class Meta:
        model = UserDashboardStats
        fields = '__all__'

class NotificationSettingsSerializer(serializers.ModelSerializer):
    """Serializer for notification settings"""
    class Meta:
        model = NotificationSettings
        fields = '__all__'

class TravelPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for travel preferences"""
    class Meta:
        model = TravelPreferences
        fields = '__all__'

class FavoriteTripSerializer(serializers.ModelSerializer):
    """Serializer for favorite trips"""
    trip_details = serializers.SerializerMethodField()

    class Meta:
        model = FavoriteTrip
        fields = '__all__'

    def get_trip_details(self, obj):
        return {
            'id': obj.trip.id,
            'title': obj.trip.title,
            'destination': obj.trip.destination,
            'price': obj.trip.price,
            'duration': obj.trip.duration,
            'image': obj.trip.image.url if obj.trip.image else None,
        }

class DashboardActivitySerializer(serializers.ModelSerializer):
    """Serializer for dashboard activities"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = DashboardActivity
        fields = '__all__'

# Admin Dashboard Serializers
class AdminOverviewSerializer(serializers.Serializer):
    """Serializer for admin dashboard overview"""
    total_bookings = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    active_users = serializers.IntegerField()
    avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    monthly_growth = serializers.DecimalField(max_digits=5, decimal_places=2)
    pending_bookings = serializers.IntegerField()

class RecentBookingSerializer(serializers.Serializer):
    """Serializer for recent bookings"""
    id = serializers.UUIDField()
    user_name = serializers.CharField()
    trip_title = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    status = serializers.CharField()
    created_at = serializers.DateTimeField()

class TripPerformanceSerializer(serializers.Serializer):
    """Serializer for trip performance"""
    trip_id = serializers.UUIDField()
    trip_title = serializers.CharField()
    bookings_count = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    occupancy_rate = serializers.DecimalField(max_digits=5, decimal_places=2)

class AgentStatusSerializer(serializers.Serializer):
    """Serializer for agent status"""
    agent_type = serializers.CharField()
    status = serializers.CharField()
    active_sessions = serializers.IntegerField()
    avg_response_time = serializers.DecimalField(max_digits=5, decimal_places=2)
    user_satisfaction = serializers.DecimalField(max_digits=5, decimal_places=2)

# User Dashboard Serializers
class UserOverviewSerializer(serializers.Serializer):
    """Serializer for user dashboard overview"""
    total_trips = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=12, decimal_places=2)
    loyalty_points = serializers.IntegerField()
    avg_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    next_trip = serializers.SerializerMethodField()

    def get_next_trip(self, obj):
        # This would be implemented based on user's upcoming bookings
        return None

class UserBookingSerializer(serializers.Serializer):
    """Serializer for user bookings"""
    id = serializers.UUIDField()
    trip_title = serializers.CharField()
    trip_destination = serializers.CharField()
    booking_date = serializers.DateTimeField()
    status = serializers.CharField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    trip_date = serializers.DateField()

class TravelInsightSerializer(serializers.Serializer):
    """Serializer for travel insights"""
    insight_type = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    value = serializers.CharField()
    trend = serializers.CharField()