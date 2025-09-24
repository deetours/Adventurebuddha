from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import uuid
from .models import Payment, ManualPayment
from bookings.models import Booking

class PaymentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def razorpay_create_order(self, request):
        """Create a Razorpay order"""
        booking_id = request.data.get('booking_id')
        
        if not booking_id:
            return Response(
                {'error': 'booking_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Invalid booking_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # In a real implementation, this would call the Razorpay API
        # For now, we'll simulate the response
        order_id = f"order_{uuid.uuid4().hex[:10]}"
        
        return Response({
            'order_id': order_id,
            'amount': int(booking.amount * 100)  # Razorpay expects amount in paise
        })
    
    @action(detail=False, methods=['post'])
    def razorpay_verify(self, request):
        """Verify a Razorpay payment"""
        # In a real implementation, this would verify the payment with Razorpay
        # For now, we'll just simulate success
        return Response({'success': True})
    
    @action(detail=False, methods=['post'])
    def upiqr(self, request):
        """Generate UPI QR code details"""
        booking_id = request.data.get('booking_id')
        
        if not booking_id:
            return Response(
                {'error': 'booking_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Invalid booking_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate UPI link
        upi_link = f"upi://pay?pa=adventurebuddha@upi&pn=Adventure+Buddha&am={booking.amount}&cu=INR"
        
        return Response({
            'upi_link': upi_link,
            'amount': booking.amount
        })
    
    @action(detail=False, methods=['post'])
    def manual_upload(self, request):
        """Handle manual payment screenshot upload"""
        booking_id = request.data.get('booking_id')
        
        if not booking_id:
            return Response(
                {'error': 'booking_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            booking = Booking.objects.get(id=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response(
                {'error': 'Invalid booking_id'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # In a real implementation, this would handle file upload
        # For now, we'll just simulate success
        return Response({
            'message': 'Screenshot uploaded successfully',
            'booking_id': booking_id
        })