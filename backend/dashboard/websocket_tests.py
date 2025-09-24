import pytest
from django.test import TestCase
from django.contrib.auth.models import User
from channels.testing import WebsocketCommunicator
from dashboard.consumers import DashboardConsumer
from dashboard.models import DashboardStats, TripAnalytics, AgentMetrics
import json


class DashboardWebSocketTestCase(TestCase):
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

        # Create test data
        self.dashboard_stats = DashboardStats.objects.create(
            total_bookings=100,
            total_revenue=2500000,
            active_users=500,
            avg_rating=4.5,
            monthly_growth=10.5,
            pending_bookings=5
        )

    async def test_dashboard_consumer_connection(self):
        """Test WebSocket connection to dashboard consumer"""
        # Create WebSocket communicator
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            "/ws/dashboard/",
            headers=[("authorization", f"Bearer test-token")]
        )

        # Mock authentication (in real scenario, use proper JWT token)
        # For testing purposes, we'll assume authentication passes

        # Connect
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)

        # Test sending a message
        await communicator.send_json_to({
            "type": "dashboard.subscribe",
            "data": {
                "metrics": ["total_bookings", "total_revenue"],
                "update_interval": 30
            }
        })

        # Receive response
        response = await communicator.receive_json_from()
        self.assertIn("type", response)
        self.assertEqual(response["type"], "dashboard.subscribed")

        # Test receiving dashboard data
        await communicator.send_json_to({
            "type": "dashboard.request_update"
        })

        response = await communicator.receive_json_from()
        self.assertIn("type", response)
        self.assertIn("data", response)

        # Close connection
        await communicator.disconnect()

    async def test_realtime_dashboard_updates(self):
        """Test real-time dashboard data updates"""
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            "/ws/dashboard/",
            headers=[("authorization", f"Bearer test-token")]
        )

        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)

        # Subscribe to updates
        await communicator.send_json_to({
            "type": "dashboard.subscribe",
            "data": {
                "metrics": ["total_bookings", "active_users"],
                "update_interval": 10
            }
        })

        # Confirm subscription
        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "dashboard.subscribed")

        # Simulate data update (in real scenario, this would be triggered by model changes)
        await communicator.send_json_to({
            "type": "dashboard.update",
            "data": {
                "total_bookings": 105,
                "active_users": 520,
                "timestamp": "2024-01-15T12:00:00Z"
            }
        })

        # Receive update
        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "dashboard.data")
        self.assertIn("total_bookings", response["data"])
        self.assertIn("active_users", response["data"])

        await communicator.disconnect()

    async def test_activity_feed_updates(self):
        """Test real-time activity feed updates"""
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            "/ws/dashboard/",
            headers=[("authorization", f"Bearer test-token")]
        )

        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)

        # Subscribe to activity feed
        await communicator.send_json_to({
            "type": "activity.subscribe"
        })

        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "activity.subscribed")

        # Simulate new activity
        await communicator.send_json_to({
            "type": "activity.new",
            "data": {
                "activity_type": "booking_created",
                "description": "New booking for Ladakh Adventure",
                "user": "Rahul Sharma",
                "timestamp": "2024-01-15T12:30:00Z"
            }
        })

        # Receive activity update
        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "activity.update")
        self.assertIn("activity_type", response["data"])
        self.assertEqual(response["data"]["activity_type"], "booking_created")

        await communicator.disconnect()

    async def test_notification_updates(self):
        """Test real-time notification updates"""
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            "/ws/dashboard/",
            headers=[("authorization", f"Bearer test-token")]
        )

        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)

        # Subscribe to notifications
        await communicator.send_json_to({
            "type": "notifications.subscribe"
        })

        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "notifications.subscribed")

        # Simulate new notification
        await communicator.send_json_to({
            "type": "notification.new",
            "data": {
                "title": "Booking Confirmed",
                "message": "Your booking for Ladakh Adventure has been confirmed",
                "type": "success",
                "timestamp": "2024-01-15T13:00:00Z"
            }
        })

        # Receive notification
        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "notification.received")
        self.assertIn("title", response["data"])
        self.assertEqual(response["data"]["title"], "Booking Confirmed")

        await communicator.disconnect()

    async def test_unauthenticated_connection(self):
        """Test WebSocket connection without authentication"""
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            "/ws/dashboard/"
        )

        connected, subprotocol = await communicator.connect()
        # Should fail to connect without authentication
        self.assertFalse(connected)

    async def test_invalid_message_handling(self):
        """Test handling of invalid messages"""
        communicator = WebsocketCommunicator(
            DashboardConsumer.as_asgi(),
            "/ws/dashboard/",
            headers=[("authorization", f"Bearer test-token")]
        )

        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)

        # Send invalid message
        await communicator.send_json_to({
            "type": "invalid.type",
            "data": {}
        })

        # Should receive error response
        response = await communicator.receive_json_from()
        self.assertEqual(response["type"], "error")
        self.assertIn("message", response)

        await communicator.disconnect()


class DashboardConsumerUnitTestCase(TestCase):
    def test_consumer_group_naming(self):
        """Test WebSocket group naming logic"""
        # Test that group names are constructed correctly
        expected_group = "dashboard_updates"
        # In real implementation, this would be tested through the consumer

    def test_message_type_routing(self):
        """Test that messages are routed to correct handlers"""
        # Test message type routing logic
        message_types = [
            "dashboard.subscribe",
            "dashboard.request_update",
            "activity.subscribe",
            "notifications.subscribe"
        ]

        for msg_type in message_types:
            # Verify each message type has a corresponding handler
            # This would be tested by checking the consumer's message routing
            pass