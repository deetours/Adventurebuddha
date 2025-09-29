from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.db import models
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid
from PIL import Image
from io import BytesIO
from .models import Trip, TripSlot, SeatMap
from .serializers import TripSerializer, TripSlotSerializer, SeatMapSerializer

class TripViewSet(viewsets.ModelViewSet):
    queryset = Trip.objects.filter(status='published').order_by('-created_at')
    serializer_class = TripSerializer
    lookup_field = 'slug'
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    
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
            featured_list = featured.split(',')
            queryset = queryset.filter(featured_status__in=featured_list)
        
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
    
    def _process_and_save_image(self, image_file, trip_slug):
        """Process and save uploaded image with optimization"""
        try:
            # Generate unique filename
            file_extension = os.path.splitext(image_file.name)[1].lower()
            if file_extension not in ['.jpg', '.jpeg', '.png', '.webp']:
                raise ValueError("Unsupported image format. Please use JPG, PNG, or WebP.")
            
            unique_filename = f"trips/{trip_slug}/{uuid.uuid4().hex}{file_extension}"
            
            # Open and process the image
            image = Image.open(image_file)
            
            # Convert RGBA to RGB if necessary
            if image.mode == 'RGBA':
                background = Image.new('RGB', image.size, (255, 255, 255))
                background.paste(image, mask=image.split()[-1])
                image = background
            
            # Resize image if too large (max width: 1200px)
            max_width = 1200
            if image.width > max_width:
                ratio = max_width / image.width
                new_height = int(image.height * ratio)
                image = image.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Save optimized image
            output = BytesIO()
            if file_extension.lower() in ['.jpg', '.jpeg']:
                image.save(output, format='JPEG', quality=85, optimize=True)
            else:
                image.save(output, format='PNG', optimize=True)
            
            output.seek(0)
            content_file = ContentFile(output.read())
            
            # Save to storage
            saved_path = default_storage.save(unique_filename, content_file)
            return f"/media/{saved_path}"
            
        except Exception as e:
            raise ValueError(f"Error processing image: {str(e)}")
    
    @action(detail=True, methods=['post'])
    def upload_image(self, request, pk=None):
        """Upload and add a new image to a trip"""
        trip = self.get_object()
        
        if 'image' not in request.FILES:
            return Response(
                {'error': 'No image file provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            image_file = request.FILES['image']
            image_url = self._process_and_save_image(image_file, trip.slug)
            
            # Add to trip's images list
            if trip.images is None:
                trip.images = []
            trip.images.append(image_url)
            trip.save()
            
            return Response({
                'message': 'Image uploaded successfully',
                'image_url': image_url,
                'images': trip.images
            })
            
        except ValueError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to upload image'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['delete'])
    def delete_image(self, request, pk=None):
        """Delete an image from a trip"""
        trip = self.get_object()
        image_url = request.data.get('image_url')
        
        if not image_url:
            return Response(
                {'error': 'Image URL is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if trip.images and image_url in trip.images:
            # Remove from list
            trip.images.remove(image_url)
            trip.save()
            
            # Delete file from storage
            try:
                file_path = image_url.replace('/media/', '')
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
            except Exception as e:
                print(f"Warning: Could not delete file {file_path}: {e}")
            
            return Response({
                'message': 'Image deleted successfully',
                'images': trip.images
            })
        else:
            return Response(
                {'error': 'Image not found in trip'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def reorder_images(self, request, pk=None):
        """Reorder images in a trip"""
        trip = self.get_object()
        new_order = request.data.get('images')
        
        if not new_order or not isinstance(new_order, list):
            return Response(
                {'error': 'Invalid images order provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate that all images in new_order exist in trip.images
        if trip.images and set(new_order) == set(trip.images):
            trip.images = new_order
            trip.save()
            
            return Response({
                'message': 'Images reordered successfully',
                'images': trip.images
            })
        else:
            return Response(
                {'error': 'Invalid image order - some images do not match'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class TripSlotViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TripSlot.objects.all()
    serializer_class = TripSlotSerializer
    permission_classes = [AllowAny]
    
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