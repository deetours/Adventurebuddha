from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import transaction
import uuid
from .models import Booking, SeatLock
from .serializers import BookingSerializer
from trips.models import TripSlot

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def lock_seats(self, request):
        """Lock seats for a user"""
        slot_id = request.data.get('slot_id')
        seat_ids = request.data.get('seat_ids', [])
        
        if not slot_id or not seat_ids:
            return Response(
                {'error': 'slot_id and seat_ids are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            slot = TripSlot.objects.get(id=slot_id)
        except TripSlot.DoesNotExist:
            return Response(
                {'error': 'Invalid slot_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if seats are already locked or booked
        # In a real implementation, this would be more complex
        locked_seats = []  # Get currently locked seats for this slot
        booked_seats = []  # Get currently booked seats for this slot
        
        conflicting_seats = set(seat_ids) & (set(locked_seats) | set(booked_seats))
        if conflicting_seats:
            return Response(
                {'error': f'Seats {list(conflicting_seats)} are already locked or booked'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create seat lock
        lock_token = str(uuid.uuid4())
        expires_at = timezone.now() + timezone.timedelta(minutes=5)  # 5 minute lock
        
        seat_lock = SeatLock.objects.create(
            slot=slot,
            seat_ids=seat_ids,
            lock_token=lock_token,
            user=request.user,
            expires_at=expires_at
        )
        
        return Response({
            'lock_token': lock_token,
            'expires_in': 300  # 5 minutes in seconds
        })
    
    @action(detail=False, methods=['post'])
    def unlock_seats(self, request):
        """Unlock seats"""
        lock_token = request.data.get('lock_token')
        
        if not lock_token:
            return Response(
                {'error': 'lock_token is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            seat_lock = SeatLock.objects.get(lock_token=lock_token, user=request.user)
            seat_lock.delete()
            return Response({'released': True})
        except SeatLock.DoesNotExist:
            return Response(
                {'error': 'Invalid lock_token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'])
    def create_booking(self, request):
        """Create a booking draft"""
        slot_id = request.data.get('slot_id')
        seat_ids = request.data.get('seat_ids', [])
        lock_token = request.data.get('lock_token')
        
        if not all([slot_id, seat_ids, lock_token]):
            return Response(
                {'error': 'slot_id, seat_ids, and lock_token are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Verify seat lock
                seat_lock = SeatLock.objects.get(
                    lock_token=lock_token,
                    slot_id=slot_id,
                    user=request.user
                )
                
                if seat_lock.expires_at < timezone.now():
                    seat_lock.delete()
                    return Response(
                        {'error': 'Seat lock has expired'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Verify seat IDs match
                if set(seat_lock.seat_ids) != set(seat_ids):
                    return Response(
                        {'error': 'Seat IDs do not match locked seats'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Get slot and calculate amount
                slot = seat_lock.slot
                amount = slot.price * len(seat_ids)  # Simplified calculation
                
                # Create booking
                booking = Booking.objects.create(
                    user=request.user,
                    slot=slot,
                    seat_ids=seat_ids,
                    lock_token=lock_token,
                    amount=amount,
                    status='pending_payment'
                )
                
                # Delete seat lock
                seat_lock.delete()
                
                serializer = BookingSerializer(booking)
                return Response(serializer.data)
                
        except SeatLock.DoesNotExist:
            return Response(
                {'error': 'Invalid seat lock'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except TripSlot.DoesNotExist:
            return Response(
                {'error': 'Invalid slot'}, 
                status=status.HTTP_400_BAD_REQUEST
            )