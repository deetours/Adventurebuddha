import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from django.utils import timezone
from .models import DashboardActivity
import asyncio

class DashboardConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time dashboard updates"""

    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope['user']
        self.room_group_name = None

        if self.user.is_authenticated:
            if self.user.is_staff:
                # Admin dashboard
                self.room_group_name = 'admin_dashboard'
            else:
                # User dashboard
                self.room_group_name = f'user_dashboard_{self.user.id}'

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()

            # Send initial data
            await self.send_initial_data()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'ping':
                # Respond to ping for connection health check
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
            elif message_type == 'request_update':
                # Send updated data
                await self.send_dashboard_data()

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))

    async def send_initial_data(self):
        """Send initial dashboard data when connection is established"""
        await self.send_dashboard_data()

    async def send_dashboard_data(self):
        """Send current dashboard data"""
        if self.user.is_staff:
            data = await self.get_admin_dashboard_data()
        else:
            data = await self.get_user_dashboard_data()

        await self.send(text_data=json.dumps({
            'type': 'dashboard_update',
            'data': data,
            'timestamp': timezone.now().isoformat()
        }))

    @database_sync_to_async
    def get_admin_dashboard_data(self):
        """Get admin dashboard data"""
        from django.db.models import Sum, Count, Avg
        from bookings.models import Booking
        from payments.models import Payment
        from django.contrib.auth.models import User

        # Calculate current month data
        today = timezone.now().date()
        month_start = today.replace(day=1)

        total_bookings = Booking.objects.filter(status__in=['confirmed', 'completed']).count()
        total_revenue = Payment.objects.filter(status='completed').aggregate(total=Sum('amount'))['total'] or 0
        active_users = User.objects.filter(is_active=True).count()
        avg_rating = Booking.objects.filter(rating__isnull=False).aggregate(avg=Avg('rating'))['avg'] or 0
        pending_bookings = Booking.objects.filter(status='pending').count()

        # Recent activities
        recent_activities = []
        activities = DashboardActivity.objects.order_by('-created_at')[:10]
        for activity in activities:
            recent_activities.append({
                'id': str(activity.id),
                'type': activity.activity_type,
                'title': activity.title,
                'description': activity.description,
                'timestamp': activity.created_at.isoformat(),
                'user': activity.user.get_full_name() if activity.user else None,
            })

        return {
            'overview': {
                'total_bookings': total_bookings,
                'total_revenue': total_revenue,
                'active_users': active_users,
                'avg_rating': avg_rating,
                'pending_bookings': pending_bookings,
            },
            'recent_activities': recent_activities,
        }

    @database_sync_to_async
    def get_user_dashboard_data(self):
        """Get user dashboard data"""
        from django.db.models import Sum, Count, Avg
        from bookings.models import Booking
        from payments.models import Payment

        total_trips = Booking.objects.filter(
            user=self.user,
            status__in=['confirmed', 'completed']
        ).count()

        total_spent = Payment.objects.filter(
            booking__user=self.user,
            status='completed'
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Calculate loyalty points
        loyalty_points = total_trips * 100 + (total_spent / 100)

        avg_rating = Booking.objects.filter(
            user=self.user,
            rating__isnull=False
        ).aggregate(avg=Avg('rating'))['avg'] or 0

        # Recent bookings
        recent_bookings = []
        bookings = Booking.objects.filter(user=self.user).select_related('trip').order_by('-created_at')[:5]
        for booking in bookings:
            recent_bookings.append({
                'id': str(booking.id),
                'trip_title': booking.trip.title,
                'status': booking.status,
                'amount': booking.total_amount,
                'created_at': booking.created_at.isoformat(),
            })

        return {
            'overview': {
                'total_trips': total_trips,
                'total_spent': total_spent,
                'loyalty_points': int(loyalty_points),
                'avg_rating': avg_rating,
            },
            'recent_bookings': recent_bookings,
        }

    # Handler for broadcasting updates to all connected clients
    async def dashboard_update(self, event):
        """Send dashboard update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'dashboard_update',
            'data': event['data'],
            'timestamp': event['timestamp']
        }))

    async def activity_update(self, event):
        """Send activity update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'activity_update',
            'activity': event['activity'],
            'timestamp': event['timestamp']
        }))

class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time notifications"""

    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope['user']

        if self.user.is_authenticated:
            self.room_group_name = f'notifications_{self.user.id}'

            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))

        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': 'Invalid JSON format'
            }))

    async def notification(self, event):
        """Send notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification'],
            'timestamp': event['timestamp']
        }))

# Utility functions for broadcasting updates
async def broadcast_admin_dashboard_update():
    """Broadcast dashboard update to all admin users"""
    from channels.layers import get_channel_layer
    channel_layer = get_channel_layer()

    # Get updated data
    from .consumers import DashboardConsumer
    consumer = DashboardConsumer()
    consumer.user = type('MockUser', (), {'is_staff': True, 'is_authenticated': True})()
    data = await consumer.get_admin_dashboard_data()

    await channel_layer.group_send(
        'admin_dashboard',
        {
            'type': 'dashboard_update',
            'data': data,
            'timestamp': timezone.now().isoformat()
        }
    )

async def broadcast_user_dashboard_update(user_id):
    """Broadcast dashboard update to specific user"""
    from channels.layers import get_channel_layer
    channel_layer = get_channel_layer()

    # Get updated data
    from .consumers import DashboardConsumer
    consumer = DashboardConsumer()
    from django.contrib.auth.models import User
    consumer.user = await database_sync_to_async(User.objects.get)(id=user_id)
    data = await consumer.get_user_dashboard_data()

    await channel_layer.group_send(
        f'user_dashboard_{user_id}',
        {
            'type': 'dashboard_update',
            'data': data,
            'timestamp': timezone.now().isoformat()
        }
    )

async def broadcast_activity_update(activity_data):
    """Broadcast activity update to admin dashboard"""
    from channels.layers import get_channel_layer
    channel_layer = get_channel_layer()

    await channel_layer.group_send(
        'admin_dashboard',
        {
            'type': 'activity_update',
            'activity': activity_data,
            'timestamp': timezone.now().isoformat()
        }
    )

async def send_user_notification(user_id, notification_data):
    """Send notification to specific user"""
    from channels.layers import get_channel_layer
    channel_layer = get_channel_layer()

    await channel_layer.group_send(
        f'notifications_{user_id}',
        {
            'type': 'notification',
            'notification': notification_data,
            'timestamp': timezone.now().isoformat()
        }
    )