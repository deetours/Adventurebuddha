import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from dashboard.models import DashboardStats, TripAnalytics, AgentMetrics, UserDashboardStats
from trips.models import Trip, Booking
from agents.models import Agent
import json


class DashboardAPITestCase(APITestCase):
    def setUp(self):
        """Set up test data"""
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )

        # Create test trip
        self.trip = Trip.objects.create(
            title='Test Trip',
            description='A test trip',
            price=25000,
            duration_days=5,
            max_participants=10,
            difficulty='moderate'
        )

        # Create test booking
        self.booking = Booking.objects.create(
            user=self.user,
            trip=self.trip,
            number_of_participants=2,
            total_amount=50000,
            status='confirmed'
        )

        # Create test agent
        self.agent = Agent.objects.create(
            name='Test Agent',
            agent_type='booking',
            status='active',
            last_active='2024-01-15T10:00:00Z'
        )

        # Create dashboard stats
        self.dashboard_stats = DashboardStats.objects.create(
            total_bookings=100,
            total_revenue=2500000,
            active_users=500,
            avg_rating=4.5,
            monthly_growth=10.5,
            pending_bookings=5
        )

    def test_admin_overview_unauthenticated(self):
        """Test admin overview endpoint without authentication"""
        url = reverse('admin-overview')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_overview_authenticated(self):
        """Test admin overview endpoint with authentication"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('admin-overview')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIn('total_bookings', data)
        self.assertIn('total_revenue', data)
        self.assertIn('active_users', data)
        self.assertIn('avg_rating', data)

    def test_recent_bookings_endpoint(self):
        """Test recent bookings endpoint"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('recent-bookings')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIsInstance(data, list)
        if data:  # If there are bookings
            booking = data[0]
            self.assertIn('id', booking)
            self.assertIn('user_name', booking)
            self.assertIn('trip_title', booking)
            self.assertIn('amount', booking)
            self.assertIn('status', booking)

    def test_trip_performance_endpoint(self):
        """Test trip performance analytics endpoint"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('trip-performance')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIsInstance(data, list)

    def test_agent_status_endpoint(self):
        """Test AI agent status endpoint"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('agent-status')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIsInstance(data, list)
        if data:  # If there are agents
            agent = data[0]
            self.assertIn('name', agent)
            self.assertIn('status', agent)
            self.assertIn('last_active', agent)

    def test_user_overview_endpoint(self):
        """Test user dashboard overview endpoint"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-overview')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIn('total_trips', data)
        self.assertIn('total_spent', data)
        self.assertIn('loyalty_points', data)
        self.assertIn('avg_rating', data)

    def test_user_bookings_endpoint(self):
        """Test user bookings endpoint"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-bookings')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIsInstance(data, list)
        if data:  # If there are bookings
            booking = data[0]
            self.assertIn('id', booking)
            self.assertIn('trip', booking)
            self.assertIn('status', booking)
            self.assertIn('total_amount', booking)

    def test_travel_insights_endpoint(self):
        """Test travel insights endpoint"""
        self.client.force_authenticate(user=self.user)
        url = reverse('travel-insights')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIsInstance(data, list)

    def test_notification_settings_get(self):
        """Test getting notification settings"""
        self.client.force_authenticate(user=self.user)
        url = reverse('notification-settings')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIn('email_bookings', data)
        self.assertIn('email_promotions', data)
        self.assertIn('sms_updates', data)
        self.assertIn('whatsapp_updates', data)

    def test_notification_settings_update(self):
        """Test updating notification settings"""
        self.client.force_authenticate(user=self.user)
        url = reverse('notification-settings')
        update_data = {
            'email_bookings': False,
            'email_promotions': True,
            'sms_updates': True,
            'whatsapp_updates': False
        }
        response = self.client.put(url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertEqual(data['email_bookings'], False)
        self.assertEqual(data['email_promotions'], True)

    def test_travel_preferences_get(self):
        """Test getting travel preferences"""
        self.client.force_authenticate(user=self.user)
        url = reverse('travel-preferences')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIn('preferred_trip_types', data)
        self.assertIn('preferred_group_size', data)
        self.assertIn('preferred_budget_min', data)
        self.assertIn('preferred_budget_max', data)
        self.assertIn('preferred_activity_level', data)

    def test_favorite_trips_endpoint(self):
        """Test favorite trips endpoint"""
        self.client.force_authenticate(user=self.user)
        url = reverse('favorite-trips')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        data = response.json()
        self.assertIsInstance(data, list)


class DashboardModelsTestCase(TestCase):
    def setUp(self):
        """Set up test data for model tests"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_dashboard_stats_creation(self):
        """Test DashboardStats model creation"""
        stats = DashboardStats.objects.create(
            total_bookings=50,
            total_revenue=1000000,
            active_users=200,
            avg_rating=4.2,
            monthly_growth=5.5,
            pending_bookings=3
        )
        self.assertEqual(stats.total_bookings, 50)
        self.assertEqual(stats.total_revenue, 1000000)
        self.assertEqual(stats.active_users, 200)

    def test_trip_analytics_creation(self):
        """Test TripAnalytics model creation"""
        analytics = TripAnalytics.objects.create(
            trip_id=1,
            trip_title='Test Trip',
            total_bookings=25,
            total_revenue=500000,
            avg_rating=4.5,
            booking_trend=10.0
        )
        self.assertEqual(analytics.trip_title, 'Test Trip')
        self.assertEqual(analytics.total_bookings, 25)
        self.assertEqual(analytics.total_revenue, 500000)

    def test_agent_metrics_creation(self):
        """Test AgentMetrics model creation"""
        metrics = AgentMetrics.objects.create(
            agent_name='Test Agent',
            agent_type='booking',
            total_interactions=100,
            successful_interactions=95,
            avg_response_time=2.5,
            status='active'
        )
        self.assertEqual(metrics.agent_name, 'Test Agent')
        self.assertEqual(metrics.total_interactions, 100)
        self.assertEqual(metrics.successful_interactions, 95)

    def test_user_dashboard_stats_creation(self):
        """Test UserDashboardStats model creation"""
        user_stats = UserDashboardStats.objects.create(
            user=self.user,
            total_trips=5,
            total_spent=125000,
            loyalty_points=1250,
            avg_rating=4.8,
            favorite_category='adventure'
        )
        self.assertEqual(user_stats.user, self.user)
        self.assertEqual(user_stats.total_trips, 5)
        self.assertEqual(user_stats.total_spent, 125000)
        self.assertEqual(user_stats.loyalty_points, 1250)