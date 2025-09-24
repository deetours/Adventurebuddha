from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.conf import settings
import pandas as pd
import openpyxl
from io import BytesIO
import json
import logging
from datetime import datetime, timedelta
import os

from django.db.models import Count, Avg, Q, Sum
from django.db import models

from .models import (
    MessageTemplate, ContactList, Contact, MessageCampaign,
    Message, MessageLog, CampaignReport
)
from .serializers import (
    MessageTemplateSerializer, ContactListSerializer, ContactSerializer,
    MessageCampaignSerializer, MessageSerializer, MessageLogSerializer,
    CampaignReportSerializer, BulkMessageSerializer, CampaignActionSerializer,
    ExcelUploadSerializer, PersonalizedCampaignSerializer
)
from .tasks import (
    send_bulk_messages_task, process_contact_list_task,
    send_campaign_messages_task, generate_campaign_report_task
)

logger = logging.getLogger(__name__)


class MessageTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for message templates"""
    queryset = MessageTemplate.objects.all()
    serializer_class = MessageTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter templates by user or show all active ones"""
        user = self.request.user
        if user.is_staff:
            return MessageTemplate.objects.all()
        return MessageTemplate.objects.filter(
            Q(created_by=user) | Q(is_active=True)
        )

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a message template"""
        template = self.get_object()
        template.pk = None
        template.name = f"{template.name} (Copy)"
        template.created_by = request.user
        template.save()

        serializer = self.get_serializer(template)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ContactListViewSet(viewsets.ModelViewSet):
    """ViewSet for contact lists"""
    queryset = ContactList.objects.all()
    serializer_class = ContactListSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        """Filter contact lists by user"""
        return ContactList.objects.filter(uploaded_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create contact list and process the uploaded file"""
        serializer = ExcelUploadSerializer(data=request.data)
        if serializer.is_valid():
            # Save the contact list
            contact_list = ContactList.objects.create(
                name=serializer.validated_data['name'],
                file=serializer.validated_data['file'],
                column_mapping=serializer.validated_data.get('column_mapping', {}),
                uploaded_by=request.user
            )

            # Process the file asynchronously
            process_contact_list_task.delay(contact_list.id)

            response_serializer = ContactListSerializer(contact_list)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download the original contact list file"""
        contact_list = self.get_object()

        if not contact_list.file:
            return Response(
                {'error': 'File not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            file_path = contact_list.get_file_path()
            with open(file_path, 'rb') as f:
                file_data = f.read()

            response = HttpResponse(
                file_data,
                content_type='application/octet-stream'
            )
            response['Content-Disposition'] = f'attachment; filename="{contact_list.file.name.split("/")[-1]}"'
            return response

        except Exception as e:
            logger.error(f"Error downloading contact list {pk}: {str(e)}")
            return Response(
                {'error': 'Error downloading file'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """Get contacts for a specific contact list"""
        contact_list = self.get_object()
        contacts = contact_list.contacts.all()

        # Apply filters
        status_filter = request.query_params.get('status')
        whatsapp_filter = request.query_params.get('whatsapp_status')

        if status_filter:
            contacts = contacts.filter(status=status_filter)
        if whatsapp_filter:
            contacts = contacts.filter(whatsapp_status=whatsapp_filter == 'true')

        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)


class ContactViewSet(viewsets.ModelViewSet):
    """ViewSet for individual contacts"""
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter contacts by user's contact lists"""
        user_contact_lists = ContactList.objects.filter(uploaded_by=self.request.user)
        return Contact.objects.filter(contact_list__in=user_contact_lists)

    @action(detail=False, methods=['post'])
    def validate_numbers(self, request):
        """Validate phone numbers for WhatsApp compatibility"""
        phone_numbers = request.data.get('phone_numbers', [])

        if not phone_numbers:
            return Response(
                {'error': 'phone_numbers list is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # This would integrate with WhatsApp validation API
        # For now, return mock validation results
        results = []
        for number in phone_numbers:
            results.append({
                'number': number,
                'is_valid': True,  # Mock validation
                'is_whatsapp_user': True,  # Mock WhatsApp check
                'country_code': self._extract_country_code(number)
            })

        return Response({'results': results})

    def _extract_country_code(self, number):
        """Extract country code from phone number"""
        # Simple country code extraction logic
        if number.startswith('+91'):
            return 'IN'
        elif number.startswith('+1'):
            return 'US'
        elif number.startswith('+44'):
            return 'GB'
        else:
            return 'Unknown'


class MessageCampaignViewSet(viewsets.ModelViewSet):
    """ViewSet for message campaigns"""
    queryset = MessageCampaign.objects.all()
    serializer_class = MessageCampaignSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter campaigns by user"""
        return MessageCampaign.objects.filter(created_by=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create campaign and prepare messages"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        campaign = serializer.save(created_by=request.user)

        # Create individual messages for each contact
        contact_list = campaign.contact_list
        contacts = contact_list.contacts.filter(
            status='whatsapp_valid',
            whatsapp_status=True
        )

        messages_created = 0
        for contact in contacts:
            # Personalize message content
            personalized_content = self._personalize_message(
                campaign.message_content,
                contact
            )

            Message.objects.create(
                campaign=campaign,
                contact=contact,
                content=personalized_content,
                attachment_url=campaign.attachment_url,
                attachment_file=campaign.attachment_file
            )
            messages_created += 1

        # Update campaign statistics
        campaign.total_messages = messages_created
        campaign.pending_messages = messages_created
        campaign.save()

        response_serializer = self.get_serializer(campaign)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def _personalize_message(self, template_content, contact):
        """Replace placeholders in message template"""
        content = template_content

        # Replace basic placeholders
        replacements = {
            '{{name}}': contact.name or 'Valued Customer',
            '{{phone}}': contact.phone_number,
            '{{email}}': contact.email or '',
        }

        # Replace custom field placeholders
        for key, value in contact.custom_fields.items():
            placeholder = f'{{{{{key}}}}}'
            replacements[placeholder] = str(value)

        for placeholder, value in replacements.items():
            content = content.replace(placeholder, value)

        return content

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a campaign"""
        campaign = self.get_object()

        if campaign.status != 'draft':
            return Response(
                {'error': f'Cannot start campaign in {campaign.status} status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update campaign status
        campaign.status = 'running'
        campaign.save()

        # Start sending messages asynchronously
        send_campaign_messages_task.delay(campaign.id)

        serializer = self.get_serializer(campaign)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def perform_action(self, request, pk=None):
        """Perform action on campaign (pause, resume, cancel)"""
        campaign = self.get_object()

        serializer = CampaignActionSerializer(
            data=request.data,
            context={'campaign': campaign}
        )
        serializer.is_valid(raise_exception=True)

        action_type = serializer.validated_data['action']

        if action_type == 'pause':
            campaign.status = 'paused'
        elif action_type == 'resume':
            campaign.status = 'running'
            # Resume sending messages
            send_campaign_messages_task.delay(campaign.id)
        elif action_type == 'cancel':
            campaign.status = 'cancelled'
            campaign.completed_at = datetime.now()

        campaign.save()

        response_serializer = self.get_serializer(campaign)
        return Response(response_serializer.data)

    @action(detail=True, methods=['post'])
    def generate_report(self, request, pk=None):
        """Generate a report for the campaign"""
        campaign = self.get_object()
        report_type = request.data.get('report_type', 'summary')

        if report_type not in ['summary', 'detailed', 'failed']:
            return Response(
                {'error': 'Invalid report type'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate report asynchronously
        generate_campaign_report_task.delay(campaign.id, report_type, request.user.id)

        return Response({
            'message': f'Report generation started for {report_type} report'
        })

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get messages for a campaign"""
        campaign = self.get_object()
        messages = campaign.messages.all()

        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            messages = messages.filter(status=status_filter)

        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for individual messages"""
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter messages by user's campaigns"""
        user_campaigns = MessageCampaign.objects.filter(created_by=self.request.user)
        return Message.objects.filter(campaign__in=user_campaigns)

    @action(detail=True, methods=['post'])
    def retry(self, request, pk=None):
        """Retry sending a failed message"""
        message = self.get_object()

        if not message.can_retry():
            return Response(
                {'error': 'Message cannot be retried'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Retry sending the message
        from .tasks import send_single_message_task
        send_single_message_task.delay(message.id)

        return Response({'message': 'Message retry initiated'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_bulk_messages(request):
    """Send bulk WhatsApp messages (up to 10 at once)"""
    serializer = BulkMessageSerializer(data=request.data)
    if serializer.is_valid():
        # Send messages asynchronously
        task = send_bulk_messages_task.delay(
            serializer.validated_data['phone_numbers'],
            serializer.validated_data['message'],
            serializer.validated_data.get('attachment_url'),
            serializer.validated_data['delay_seconds'],
            request.user.id
        )

        return Response({
            'task_id': task.id,
            'message': 'Bulk message sending initiated',
            'estimated_completion': f"{len(serializer.validated_data['phone_numbers']) * serializer.validated_data['delay_seconds']} seconds"
        })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def campaign_stats(request):
    """Get overall campaign statistics for the user"""
    user_campaigns = MessageCampaign.objects.filter(created_by=request.user)

    stats = {
        'total_campaigns': user_campaigns.count(),
        'active_campaigns': user_campaigns.filter(status__in=['running', 'scheduled']).count(),
        'completed_campaigns': user_campaigns.filter(status='completed').count(),
        'total_messages_sent': user_campaigns.aggregate(
            total=Sum('sent_messages')
        )['total'] or 0,
        'total_messages_failed': user_campaigns.aggregate(
            total=Sum('failed_messages')
        )['total'] or 0,
        'success_rate': 0
    }

    # Calculate success rate
    total_sent = stats['total_messages_sent']
    total_failed = stats['total_messages_failed']
    if total_sent + total_failed > 0:
        stats['success_rate'] = round((total_sent / (total_sent + total_failed)) * 100, 2)

    return Response(stats)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unsubscribers_list(request):
    """Get list of unsubscribed contacts"""
    # This would be implemented based on your unsubscriber tracking logic
    # For now, return empty list
    return Response({
        'unsubscribers': [],
        'total_unsubscribed': 0
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_contacts(request):
    """Upload contacts via Excel/CSV file"""
    serializer = ExcelUploadSerializer(data=request.data)
    if serializer.is_valid():
        # This would create a contact list and process the file
        # For now, return success response
        return Response({
            'message': 'Contact upload initiated',
            'file_name': serializer.validated_data['file'].name,
            'column_mapping': serializer.validated_data.get('column_mapping', {})
        })

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MessageLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for message logs"""
    queryset = MessageLog.objects.all()
    serializer_class = MessageLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter message logs by user's campaigns"""
        user_campaigns = MessageCampaign.objects.filter(created_by=self.request.user)
        return MessageLog.objects.filter(message__campaign__in=user_campaigns)


class CampaignReportViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for campaign reports"""
    queryset = CampaignReport.objects.all()
    serializer_class = CampaignReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter reports by user's campaigns"""
        user_campaigns = MessageCampaign.objects.filter(created_by=self.request.user)
        return CampaignReport.objects.filter(campaign__in=user_campaigns)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def whatsapp_webhook(request):
    """Handle incoming WhatsApp messages via webhook"""
    if request.method == 'GET':
        # WhatsApp webhook verification
        mode = request.GET.get('hub.mode')
        token = request.GET.get('hub.verify_token')
        challenge = request.GET.get('hub.challenge')

        # Verify webhook token (should match your configured token)
        if mode == 'subscribe' and token == settings.WHATSAPP_WEBHOOK_TOKEN:
            return Response(challenge, status=status.HTTP_200_OK)
        return Response('Verification failed', status=status.HTTP_403_FORBIDDEN)

    elif request.method == 'POST':
        # Process incoming WhatsApp messages
        data = request.data

        try:
            # Process each message entry
            for entry in data.get('entry', []):
                for change in entry.get('changes', []):
                    messages = change.get('value', {}).get('messages', [])
                    contacts = change.get('value', {}).get('contacts', [])

                    for message in messages:
                        # Find or create contact
                        wa_id = message.get('from')
                        contact = Contact.objects.filter(phone_number=f"+{wa_id}").first()

                        if not contact:
                            # Get contact name from contacts array
                            contact_name = ""
                            for contact_info in contacts:
                                if contact_info.get('wa_id') == wa_id:
                                    contact_name = contact_info.get('profile', {}).get('name', '')

                            contact = Contact.objects.create(
                                name=contact_name,
                                phone_number=f"+{wa_id}",
                                whatsapp_status=True
                            )

                        # Process the message
                        message_text = message.get('text', {}).get('body', '')
                        message_type = message.get('type')

                        # Trigger automated response
                        from .tasks import process_incoming_message_task
                        process_incoming_message_task.delay(
                            contact.id,
                            message_text,
                            message_type,
                            message.get('id')
                        )

            return Response({'status': 'processed'}, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Webhook processing error: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def automated_responses(request):
    """Get automated response settings and analytics"""
    # Get response analytics
    responses = Message.objects.filter(
        campaign__name__icontains='auto',
        created_at__gte=datetime.now() - timedelta(days=30)
    ).aggregate(
        total_responses=Count('id'),
        successful_responses=Count('id', filter=Q(status='delivered')),
        avg_response_time=Avg('created_at')  # This would need adjustment
    )

    # Get active automated rules (placeholder)
    rules = [
        {
            'trigger': 'greeting',
            'response_template': 'Hello! Welcome to Adventure Buddha. How can I help you today?',
            'is_active': True
        },
        {
            'trigger': 'booking_inquiry',
            'response_template': 'I\'d be happy to help you with booking! What destination interests you?',
            'is_active': True
        }
    ]

    return Response({
        'analytics': responses,
        'rules': rules
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_personalized_campaign(request):
    """Create a campaign with AI-personalized messages"""
    serializer = PersonalizedCampaignSerializer(data=request.data)
    if serializer.is_valid():
        # Extract campaign data
        contact_list_id = serializer.validated_data['contact_list_id']
        base_template = serializer.validated_data['base_template']
        personalization_rules = serializer.validated_data.get('personalization_rules', {})

        # Get contact list
        contact_list = ContactList.objects.get(id=contact_list_id, uploaded_by=request.user)
        contacts = contact_list.contacts.filter(status='whatsapp_valid')

        # Create personalized campaign
        campaign = MessageCampaign.objects.create(
            name=f"Personalized: {base_template[:30]}...",
            message_content=base_template,
            contact_list=contact_list,
            created_by=request.user,
            campaign_type='personalized',
            personalization_rules=personalization_rules
        )

        # Generate personalized messages using AI
        from .tasks import generate_personalized_messages_task
        generate_personalized_messages_task.delay(campaign.id)

        response_serializer = MessageCampaignSerializer(campaign)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ai_insights(request):
    """Get AI-powered insights for messaging campaigns"""
    # Get campaign performance data
    campaigns = MessageCampaign.objects.filter(created_by=request.user)

    insights = {
        'best_performing_templates': [],
        'optimal_send_times': [],
        'audience_segmentation': {},
        'content_recommendations': [],
        'engagement_predictions': {}
    }

    # Analyze template performance
    template_performance = MessageTemplate.objects.filter(
        created_by=request.user
    ).annotate(
        usage_count=Count('messagecampaign'),
        avg_success_rate=Avg('messagecampaign__sent_messages')
    ).order_by('-avg_success_rate')[:5]

    insights['best_performing_templates'] = [
        {
            'template_id': t.id,
            'name': t.name,
            'success_rate': t.avg_success_rate or 0,
            'usage_count': t.usage_count
        } for t in template_performance
    ]

    # Mock AI insights (would be generated by ML models)
    insights['optimal_send_times'] = [
        {'day': 'Monday', 'hour': '10:00', 'success_rate': 85},
        {'day': 'Wednesday', 'hour': '14:00', 'success_rate': 82},
        {'day': 'Friday', 'hour': '11:00', 'success_rate': 78}
    ]

    insights['content_recommendations'] = [
        'Use personalized greetings with customer names',
        'Include specific trip details in responses',
        'Add urgency for limited-time offers',
        'Include clear call-to-action buttons'
    ]

    return Response(insights)


# Import models for the query
from django.db import models