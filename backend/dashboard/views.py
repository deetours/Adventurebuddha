from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Sum, Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from .models import (
    DashboardStats, TripAnalytics, AgentMetrics, UserDashboardStats,
    NotificationSettings, TravelPreferences, FavoriteTrip, DashboardActivity
)
from .serializers import (
    DashboardStatsSerializer, TripAnalyticsSerializer, AgentMetricsSerializer,
    UserDashboardStatsSerializer, NotificationSettingsSerializer,
    TravelPreferencesSerializer, FavoriteTripSerializer, DashboardActivitySerializer,
    AdminOverviewSerializer, RecentBookingSerializer, TripPerformanceSerializer,
    AgentStatusSerializer, UserOverviewSerializer, UserBookingSerializer,
    TravelInsightSerializer
)
from trips.models import Trip
from bookings.models import Booking
from payments.models import Payment

class DashboardStatsViewSet(viewsets.ModelViewSet):
    """ViewSet for dashboard statistics"""
    queryset = DashboardStats.objects.all()
    serializer_class = DashboardStatsSerializer
    permission_classes = [IsAdminUser]

class TripAnalyticsViewSet(viewsets.ModelViewSet):
    """ViewSet for trip analytics"""
    queryset = TripAnalytics.objects.all()
    serializer_class = TripAnalyticsSerializer
    permission_classes = [IsAdminUser]

class AgentMetricsViewSet(viewsets.ModelViewSet):
    """ViewSet for agent metrics"""
    queryset = AgentMetrics.objects.all()
    serializer_class = AgentMetricsSerializer
    permission_classes = [IsAdminUser]

class UserDashboardStatsViewSet(viewsets.ModelViewSet):
    """ViewSet for user dashboard statistics"""
    queryset = UserDashboardStats.objects.all()
    serializer_class = UserDashboardStatsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class NotificationSettingsViewSet(viewsets.ModelViewSet):
    """ViewSet for notification settings"""
    queryset = NotificationSettings.objects.all()
    serializer_class = NotificationSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def get_or_create_settings(self):
        """Get or create notification settings for the user"""
        settings, created = NotificationSettings.objects.get_or_create(
            user=self.request.user,
            defaults={
                'email_bookings': True,
                'email_updates': True,
                'sms_bookings': True,
                'sms_updates': True,
                'whatsapp_bookings': True,
                'whatsapp_updates': True,
            }
        )
        return settings

    def retrieve(self, request, *args, **kwargs):
        settings = self.get_or_create_settings()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)

class TravelPreferencesViewSet(viewsets.ModelViewSet):
    """ViewSet for travel preferences"""
    queryset = TravelPreferences.objects.all()
    serializer_class = TravelPreferencesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def get_or_create_preferences(self):
        """Get or create travel preferences for the user"""
        preferences, created = TravelPreferences.objects.get_or_create(
            user=self.request.user,
            defaults={
                'preferred_trip_types': ['adventure'],
                'preferred_group_size': 'small',
                'preferred_budget_min': 15000,
                'preferred_budget_max': 50000,
                'preferred_activity_level': 'moderate',
            }
        )
        return preferences

    def retrieve(self, request, *args, **kwargs):
        preferences = self.get_or_create_preferences()
        serializer = self.get_serializer(preferences)
        return Response(serializer.data)

class FavoriteTripViewSet(viewsets.ModelViewSet):
    """ViewSet for favorite trips"""
    queryset = FavoriteTrip.objects.all()
    serializer_class = FavoriteTripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def toggle_favorite(self, request):
        """Toggle favorite status for a trip"""
        trip_id = request.data.get('trip_id')
        if not trip_id:
            return Response({'error': 'trip_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            trip = Trip.objects.get(id=trip_id)
        except Trip.DoesNotExist:
            return Response({'error': 'Trip not found'}, status=status.HTTP_404_NOT_FOUND)

        favorite, created = FavoriteTrip.objects.get_or_create(
            user=request.user,
            trip=trip
        )

        if not created:
            favorite.delete()
            return Response({'message': 'Removed from favorites', 'is_favorite': False})

        return Response({'message': 'Added to favorites', 'is_favorite': True})

class DashboardActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for dashboard activities"""
    queryset = DashboardActivity.objects.all()
    serializer_class = DashboardActivitySerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = super().get_queryset()
        activity_type = self.request.query_params.get('activity_type')
        if activity_type:
            queryset = queryset.filter(activity_type=activity_type)
        return queryset.order_by('-created_at')[:50]  # Last 50 activities

# Admin Dashboard API Views
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_overview(request):
    """Get admin dashboard overview data"""
    # Calculate date ranges
    today = timezone.now().date()
    month_start = today.replace(day=1)
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)
    last_month_end = month_start - timedelta(days=1)

    # Get current stats
    current_bookings = Booking.objects.filter(created_at__date__gte=month_start).count()
    last_month_bookings = Booking.objects.filter(
        created_at__date__gte=last_month_start,
        created_at__date__lte=last_month_end
    ).count()

    current_revenue = Payment.objects.filter(
        created_at__date__gte=month_start,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0

    last_month_revenue = Payment.objects.filter(
        created_at__date__gte=last_month_start,
        created_at__date__lte=last_month_end,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Calculate growth
    monthly_growth = 0
    if last_month_revenue > 0:
        monthly_growth = ((current_revenue - last_month_revenue) / last_month_revenue) * 100

    data = {
        'total_bookings': Booking.objects.filter(status__in=['confirmed', 'completed']).count(),
        'total_revenue': Payment.objects.filter(status='completed').aggregate(total=Sum('amount'))['total'] or 0,
        'active_users': User.objects.filter(is_active=True).count(),
        'avg_rating': Booking.objects.filter(rating__isnull=False).aggregate(avg=Avg('rating'))['avg'] or 0,
        'monthly_growth': monthly_growth,
        'pending_bookings': Booking.objects.filter(status='pending').count(),
    }

    serializer = AdminOverviewSerializer(data)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def recent_bookings(request):
    """Get recent bookings for admin dashboard"""
    recent_bookings = Booking.objects.select_related('user', 'trip').order_by('-created_at')[:10]

    data = []
    for booking in recent_bookings:
        data.append({
            'id': booking.id,
            'user_name': booking.user.get_full_name() or booking.user.username,
            'trip_title': booking.trip.title,
            'amount': booking.total_amount,
            'status': booking.status,
            'created_at': booking.created_at,
        })

    serializer = RecentBookingSerializer(data, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def trip_performance(request):
    """Get trip performance analytics"""
    # Get analytics for the current month
    today = timezone.now().date()
    month_start = today.replace(day=1)

    trip_stats = Booking.objects.filter(
        created_at__date__gte=month_start,
        status__in=['confirmed', 'completed']
    ).values('trip__id', 'trip__title').annotate(
        bookings_count=Count('id'),
        revenue=Sum('total_amount'),
        avg_rating=Avg('rating')
    ).order_by('-revenue')

    data = []
    for stat in trip_stats:
        # Calculate occupancy rate (simplified)
        total_capacity = 20  # Assuming average trip capacity
        occupancy_rate = min((stat['bookings_count'] / total_capacity) * 100, 100)

        data.append({
            'trip_id': stat['trip__id'],
            'trip_title': stat['trip__title'],
            'bookings_count': stat['bookings_count'],
            'revenue': stat['revenue'] or 0,
            'rating': stat['avg_rating'] or 0,
            'occupancy_rate': occupancy_rate,
        })

    serializer = TripPerformanceSerializer(data, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def agent_status(request):
    """Get AI agent status and metrics"""
    # Mock data for now - in real implementation, this would come from agent monitoring
    agents_data = [
        {
            'agent_type': 'trip_guidance',
            'status': 'active',
            'active_sessions': 5,
            'avg_response_time': 2.3,
            'user_satisfaction': 94.5,
        },
        {
            'agent_type': 'faq',
            'status': 'active',
            'active_sessions': 12,
            'avg_response_time': 1.8,
            'user_satisfaction': 96.2,
        },
        {
            'agent_type': 'payment',
            'status': 'active',
            'active_sessions': 3,
            'avg_response_time': 1.5,
            'user_satisfaction': 98.1,
        },
        {
            'agent_type': 'booking',
            'status': 'active',
            'active_sessions': 8,
            'avg_response_time': 2.1,
            'user_satisfaction': 95.8,
        },
    ]

    serializer = AgentStatusSerializer(agents_data, many=True)
    return Response(serializer.data)

# User Dashboard API Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_overview(request):
    """Get user dashboard overview data"""
    user = request.user

    # Get user stats
    total_trips = Booking.objects.filter(
        user=user,
        status__in=['confirmed', 'completed']
    ).count()

    total_spent = Payment.objects.filter(
        booking__user=user,
        status='completed'
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Get loyalty points (simplified calculation)
    loyalty_points = total_trips * 100 + (total_spent / 100)  # 100 points per trip + 1 point per 100 rupees

    avg_rating = Booking.objects.filter(
        user=user,
        rating__isnull=False
    ).aggregate(avg=Avg('rating'))['avg'] or 0

    # Get next trip
    next_booking = Booking.objects.filter(
        user=user,
        status='confirmed',
        trip__start_date__gte=timezone.now().date()
    ).select_related('trip').order_by('trip__start_date').first()

    next_trip_data = None
    if next_booking:
        next_trip_data = {
            'id': next_booking.trip.id,
            'title': next_booking.trip.title,
            'start_date': next_booking.trip.start_date,
            'destination': next_booking.trip.destination,
        }

    data = {
        'total_trips': total_trips,
        'total_spent': total_spent,
        'loyalty_points': int(loyalty_points),
        'avg_rating': avg_rating,
        'next_trip': next_trip_data,
    }

    serializer = UserOverviewSerializer(data)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_bookings(request):
    """Get user's bookings"""
    user = request.user
    status_filter = request.query_params.get('status')

    bookings = Booking.objects.filter(user=user).select_related('trip')

    if status_filter:
        bookings = bookings.filter(status=status_filter)

    bookings = bookings.order_by('-created_at')

    data = []
    for booking in bookings:
        data.append({
            'id': booking.id,
            'trip_title': booking.trip.title,
            'trip_destination': booking.trip.destination,
            'booking_date': booking.created_at,
            'status': booking.status,
            'amount': booking.total_amount,
            'trip_date': booking.trip.start_date,
        })

    serializer = UserBookingSerializer(data, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def travel_insights(request):
    """Get personalized travel insights for user"""
    user = request.user

    # Generate insights based on user's booking history
    insights = []

    # Most visited destination
    most_visited = Booking.objects.filter(
        user=user,
        status__in=['confirmed', 'completed']
    ).values('trip__destination').annotate(
        count=Count('id')
    ).order_by('-count').first()

    if most_visited:
        insights.append({
            'insight_type': 'frequent_destination',
            'title': 'Your Favorite Destination',
            'description': f"You've visited {most_visited['trip__destination']} {most_visited['count']} times",
            'value': most_visited['trip__destination'],
            'trend': 'up',
        })

    # Spending trend
    current_month_spent = Payment.objects.filter(
        booking__user=user,
        status='completed',
        created_at__month=timezone.now().month,
        created_at__year=timezone.now().year
    ).aggregate(total=Sum('amount'))['total'] or 0

    last_month_spent = Payment.objects.filter(
        booking__user=user,
        status='completed',
        created_at__month=timezone.now().month - 1,
        created_at__year=timezone.now().year
    ).aggregate(total=Sum('amount'))['total'] or 0

    if last_month_spent > 0:
        spending_change = ((current_month_spent - last_month_spent) / last_month_spent) * 100
        trend = 'up' if spending_change > 0 else 'down'
        insights.append({
            'insight_type': 'spending_trend',
            'title': 'Spending Trend',
            'description': f"Your spending this month is {abs(spending_change):.1f}% {'higher' if spending_change > 0 else 'lower'} than last month",
            'value': f"₹{current_month_spent:,.0f}",
            'trend': trend,
        })

    # Loyalty status
    total_trips = Booking.objects.filter(
        user=user,
        status__in=['confirmed', 'completed']
    ).count()

    loyalty_tier = 'Bronze'
    if total_trips >= 10:
        loyalty_tier = 'Gold'
    elif total_trips >= 5:
        loyalty_tier = 'Silver'

    insights.append({
        'insight_type': 'loyalty_status',
        'title': 'Loyalty Status',
        'description': f"You're a {loyalty_tier} member with {total_trips} completed trips",
        'value': loyalty_tier,
        'trend': 'up',
    })

    serializer = TravelInsightSerializer(insights, many=True)
    return Response(serializer.data)