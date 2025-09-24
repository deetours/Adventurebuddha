from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.conf import settings
from messaging.custom_messaging_service import custom_messaging_service
from messaging.models import MessageCampaign, Contact, Message
from messaging.serializers import MessageSerializer, ContactSerializer
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    """
    Send a single message through custom messaging API

    POST /api/messaging/send-message/
    {
        "phone_number": "+1234567890",
        "message": "Hello from custom API!",
        "campaign_id": "optional-campaign-uuid",
        "priority": "normal",
        "attachment_url": "optional-url"
    }
    """
    try:
        phone_number = request.data.get('phone_number')
        message = request.data.get('message')
        campaign_id = request.data.get('campaign_id')
        priority = request.data.get('priority', 'normal')
        attachment_url = request.data.get('attachment_url')

        if not phone_number or not message:
            return Response(
                {'error': 'phone_number and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate phone number
        validation = custom_messaging_service.validate_phone_number(phone_number)
        if not validation.get('is_valid'):
            return Response(
                {'error': 'Invalid phone number', 'details': validation},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Send message
        result = custom_messaging_service.send_message(
            phone_number=phone_number,
            message=message,
            campaign_id=campaign_id,
            attachment_url=attachment_url,
            priority=priority
        )

        if result['success']:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.error(f"Error in send_message API: {str(e)}")
        return Response(
            {'error': 'Internal server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_bulk_messages(request):
    """
    Send multiple messages in bulk

    POST /api/messaging/send-bulk/
    {
        "messages": [
            {
                "phone_number": "+1234567890",
                "message": "Hello user 1!",
                "priority": "normal"
            },
            {
                "phone_number": "+0987654321",
                "message": "Hello user 2!",
                "priority": "high"
            }
        ],
        "campaign_id": "optional-campaign-uuid"
    }
    """
    try:
        messages = request.data.get('messages', [])
        campaign_id = request.data.get('campaign_id')

        if not messages or not isinstance(messages, list):
            return Response(
                {'error': 'messages array is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(messages) > 100:  # Limit bulk size
            return Response(
                {'error': 'Maximum 100 messages per bulk request'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate all messages
        for i, msg in enumerate(messages):
            if not msg.get('phone_number') or not msg.get('message'):
                return Response(
                    {'error': f'Message {i+1}: phone_number and message are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Send bulk messages
        result = custom_messaging_service.send_bulk_messages(messages, campaign_id)

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in send_bulk_messages API: {str(e)}")
        return Response(
            {'error': 'Internal server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_phone_number(request):
    """
    Validate a phone number

    POST /api/messaging/validate-phone/
    {
        "phone_number": "+1234567890"
    }
    """
    try:
        phone_number = request.data.get('phone_number')

        if not phone_number:
            return Response(
                {'error': 'phone_number is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = custom_messaging_service.validate_phone_number(phone_number)

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in validate_phone_number API: {str(e)}")
        return Response(
            {'error': 'Internal server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_message_status(request, message_id):
    """
    Get status of a specific message

    GET /api/messaging/message/{message_id}/status/
    """
    try:
        result = custom_messaging_service.get_message_status(message_id)

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in get_message_status API: {str(e)}")
        return Response(
            {'error': 'Internal server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_account_balance(request):
    """
    Get account balance and usage information

    GET /api/messaging/account/balance/
    """
    try:
        result = custom_messaging_service.get_account_balance()

        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in get_account_balance API: {str(e)}")
        return Response(
            {'error': 'Internal server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_campaign_messages(request, campaign_id):
    """
    Get all messages for a specific campaign

    GET /api/messaging/campaign/{campaign_id}/messages/
    """
    try:
        campaign = get_object_or_404(MessageCampaign, id=campaign_id)

        # Check permissions - user should own the campaign
        if campaign.created_by and campaign.created_by != request.user:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        messages = Message.objects.filter(campaign=campaign).order_by('-created_at')
        serializer = MessageSerializer(messages, many=True)

        return Response({
            'campaign_id': campaign_id,
            'campaign_name': campaign.name,
            'total_messages': messages.count(),
            'messages': serializer.data
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in get_campaign_messages API: {str(e)}")
        return Response(
            {'error': 'Internal server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_campaign_with_messages(request):
    """
    Create a campaign and send messages to contacts

    POST /api/messaging/create-campaign-send/
    {
        "campaign_name": "My Campaign",
        "message_template": "Hello {{name}}!",
        "phone_numbers": ["+1234567890", "+0987654321"],
        "priority": "normal",
        "use_ai_personalization": false
    }
    """
    try:
        campaign_name = request.data.get('campaign_name')
        message_template = request.data.get('message_template')
        phone_numbers = request.data.get('phone_numbers', [])
        priority = request.data.get('priority', 'normal')
        use_ai_personalization = request.data.get('use_ai_personalization', False)

        if not campaign_name or not message_template or not phone_numbers:
            return Response(
                {'error': 'campaign_name, message_template, and phone_numbers are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create campaign
        campaign = MessageCampaign.objects.create(
            name=campaign_name,
            message_content=message_template,
            created_by=request.user,
            campaign_type='personalized' if use_ai_personalization else 'standard',
            total_messages=len(phone_numbers)
        )

        # Send messages
        messages_to_send = []
        for phone in phone_numbers:
            messages_to_send.append({
                'phone_number': phone,
                'message': message_template,  # In real implementation, you'd personalize this
                'priority': priority
            })

        bulk_result = custom_messaging_service.send_bulk_messages(
            messages_to_send,
            str(campaign.id)
        )

        # Update campaign statistics
        campaign.sent_messages = bulk_result['successful']
        campaign.failed_messages = bulk_result['failed']
        campaign.save()

        return Response({
            'campaign_id': campaign.id,
            'campaign_name': campaign.name,
            'bulk_send_result': bulk_result
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Error in create_campaign_with_messages API: {str(e)}")
        return Response(
            {'error': 'Internal server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messaging_stats(request):
    """
    Get messaging statistics and analytics

    GET /api/messaging/stats/
    Query params: days=7 (default 30)
    """
    try:
        days = int(request.GET.get('days', 30))

        # Get user's campaigns
        campaigns = MessageCampaign.objects.filter(created_by=request.user)

        total_campaigns = campaigns.count()
        total_messages = sum(campaign.total_messages for campaign in campaigns)
        total_sent = sum(campaign.sent_messages for campaign in campaigns)
        total_delivered = sum(campaign.delivered_messages for campaign in campaigns)
        total_failed = sum(campaign.failed_messages for campaign in campaigns)

        # Calculate success rate
        success_rate = (total_sent / total_messages * 100) if total_messages > 0 else 0

        # Get account balance
        balance_info = custom_messaging_service.get_account_balance()

        return Response({
            'total_campaigns': total_campaigns,
            'total_messages': total_messages,
            'messages_sent': total_sent,
            'messages_delivered': total_delivered,
            'messages_failed': total_failed,
            'success_rate': round(success_rate, 2),
            'account_balance': balance_info
        }, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error in get_messaging_stats API: {str(e)}")
        return Response(
            {'error': 'Internal server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )