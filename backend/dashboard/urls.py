from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'stats', views.DashboardStatsViewSet)
router.register(r'trip-analytics', views.TripAnalyticsViewSet)
router.register(r'agent-metrics', views.AgentMetricsViewSet)
router.register(r'user-stats', views.UserDashboardStatsViewSet)
router.register(r'notification-settings', views.NotificationSettingsViewSet)
router.register(r'travel-preferences', views.TravelPreferencesViewSet)
router.register(r'favorite-trips', views.FavoriteTripViewSet)
router.register(r'activities', views.DashboardActivityViewSet)

# URL patterns
urlpatterns = [
    # Include router URLs
    path('api/', include(router.urls)),

    # Admin Dashboard APIs
    path('api/admin/overview/', views.admin_overview, name='admin-overview'),
    path('api/admin/recent-bookings/', views.recent_bookings, name='recent-bookings'),
    path('api/admin/trip-performance/', views.trip_performance, name='trip-performance'),
    path('api/admin/agent-status/', views.agent_status, name='agent-status'),

    # User Dashboard APIs
    path('api/user/overview/', views.user_overview, name='user-overview'),
    path('api/user/bookings/', views.user_bookings, name='user-bookings'),
    path('api/user/travel-insights/', views.travel_insights, name='travel-insights'),
]