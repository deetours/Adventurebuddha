from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from django.db.models import Count, Q
from datetime import timedelta

from .models import Lead
from .serializers import LeadSerializer, LeadCreateSerializer

class LeadViewSet(viewsets.ModelViewSet):
    """ViewSet for managing leads"""

    queryset = Lead.objects.all()
    permission_classes = [AllowAny]  # Allow anonymous access for lead capture

    def get_serializer_class(self):
        if self.action == 'create':
            return LeadCreateSerializer
        return LeadSerializer

    def get_permissions(self):
        """Allow anyone to create leads, but require auth for other operations"""
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        """Create a new lead"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lead = serializer.save()

        # Return success response with lead ID
        return Response({
            'success': True,
            'message': 'Lead captured successfully! We\'ll contact you within 24 hours.',
            'lead_id': lead.id,
            'data': LeadSerializer(lead).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def stats(self, request):
        """Get lead statistics for dashboard"""
        today = timezone.now().date()
        last_week = today - timedelta(days=7)
        last_month = today - timedelta(days=30)

        stats = {
            'total_leads': Lead.objects.count(),
            'new_leads_today': Lead.objects.filter(created_at__date=today).count(),
            'new_leads_week': Lead.objects.filter(created_at__date__gte=last_week).count(),
            'new_leads_month': Lead.objects.filter(created_at__date__gte=last_month).count(),
            'status_breakdown': Lead.objects.values('status').annotate(count=Count('id')),
            'top_destinations': Lead.objects.values('destination').annotate(
                count=Count('id')
            ).exclude(destination__isnull=True).order_by('-count')[:5],
            'conversion_rate': self._calculate_conversion_rate(),
        }

        return Response(stats)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def recent(self, request):
        """Get recent leads for dashboard"""
        limit = int(request.query_params.get('limit', 10))
        leads = Lead.objects.select_related().order_by('-created_at')[:limit]
        serializer = self.get_serializer(leads, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """Update lead status"""
        lead = self.get_object()
        new_status = request.data.get('status')

        if new_status not in dict(Lead.STATUS_CHOICES):
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        lead.status = new_status
        lead.save()

        serializer = self.get_serializer(lead)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def add_note(self, request, pk=None):
        """Add a note to a lead"""
        lead = self.get_object()
        note = request.data.get('note')

        if not note:
            return Response(
                {'error': 'Note is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_notes = lead.notes or ""
        timestamp = timezone.now().strftime("%Y-%m-%d %H:%M:%S")
        new_note = f"[{timestamp}] {note}\n\n{current_notes}"
        lead.notes = new_note
        lead.save()

        serializer = self.get_serializer(lead)
        return Response(serializer.data)

    def _calculate_conversion_rate(self):
        """Calculate conversion rate from leads to bookings"""
        total_leads = Lead.objects.count()
        if total_leads == 0:
            return 0

        converted_leads = Lead.objects.filter(status='converted').count()
        return round((converted_leads / total_leads) * 100, 2)