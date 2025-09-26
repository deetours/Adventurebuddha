from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import Trip, TripSlot, SeatMap
from .serializers import TripSerializer, TripSlotSerializer, SeatMapSerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.filter(status='published').order_by('-created_at')
    serializer_class = TripSerializer
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = Trip.objects.filter(status='published')
        
        # Filter by tags
        tags = self.request.query_params.get('tags', None)
        if tags:
            tag_list = tags.split(',')
            for tag in tag_list:
                queryset = queryset.filter(tags__contains=[tag])
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by featured status
        featured = self.request.query_params.get('featured', None)
        if featured:
            if featured == 'featured':
                queryset = queryset.filter(featured_status__in=['featured', 'both'])
            elif featured == 'popular':
                queryset = queryset.filter(featured_status__in=['popular', 'both'])
            elif featured == 'both':
                queryset = queryset.filter(featured_status='both')
        
        # Search by title or description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) | 
                models.Q(description__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured trips"""
        trips = self.get_queryset().filter(featured_status__in=['featured', 'both'])
        serializer = self.get_serializer(trips, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get popular trips"""
        trips = self.get_queryset().filter(featured_status__in=['popular', 'both'])
        serializer = self.get_serializer(trips, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Get availability information for a trip"""
        trip = self.get_object()
        slots = TripSlot.objects.filter(trip=trip).order_by('date')
        serializer = TripSlotSerializer(slots, many=True)
        return Response(serializer.data)

class TripSlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TripSlot.objects.all()
    serializer_class = TripSlotSerializer
    
    @action(detail=True, methods=['get'])
    def seatmap(self, request, pk=None):
        """Get seat map for a trip slot"""
        try:
            slot = self.get_object()
            seat_map = SeatMap.objects.get(slot=slot)
            serializer = SeatMapSerializer(seat_map)
            
            # Get current seat status
            # In a real implementation, this would come from a cache or database
            seat_status = {
                'available': [],  # List of available seat IDs
                'locked': [],     # List of locked seat IDs
                'booked': [],     # List of booked seat IDs
                'blocked': [],    # List of blocked seat IDs
            }
            
            return Response({
                'seatMap': serializer.data,
                **seat_status
            })
        except SeatMap.DoesNotExist:
            return Response(
                {'error': 'Seat map not found for this slot'}, 
                status=status.HTTP_404_NOT_FOUND
            )