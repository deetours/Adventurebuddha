import os
import logging
import time
import requests
from typing import Dict, Any, Optional
from django.conf import settings
from django.core.files import File

# Import custom messaging service
from .custom_messaging_service import custom_messaging_service

logger = logging.getLogger(__name__)


class WhatsAppService:
    """
    WhatsApp integration service - Now uses Custom Messaging API
    Maintains backward compatibility while using custom messaging backend
    """

    def __init__(self):
        # Use custom messaging service as the backend
        self.messaging_service = custom_messaging_service
        self.use_mock = getattr(settings, 'WHATSAPP_USE_MOCK', True)
        self.api_key = getattr(settings, 'WHATSAPP_API_KEY', '')
        self.api_url = getattr(settings, 'WHATSAPP_API_URL', '')

        logger.info("WhatsApp Service initialized with Custom Messaging backend")

    def send_message(
        self,
        phone_number: str,
        message: str,
        attachment_url: Optional[str] = None,
        attachment_file: Optional[str] = None,
        wait_time: int = 15
    ) -> Dict[str, Any]:
        """
        Send WhatsApp message using custom messaging service

        Args:
            phone_number: Recipient phone number (with country code)
            message: Message content
            attachment_url: URL of attachment to send
            attachment_file: Local file path of attachment
            wait_time: Time to wait (for backward compatibility)

        Returns:
            Dict with success status and message details
        """
        try:
            # Use custom messaging service
            result = self.messaging_service.send_message(
                phone_number=phone_number,
                message=message,
                attachment_url=attachment_url,
                attachment_file=attachment_file
            )

            # Adapt response format for backward compatibility
            return {
                'success': result['success'],
                'message_id': result.get('message_id'),
                'status': result.get('status', 'unknown'),
                'error': result.get('error')
            }

        except Exception as e:
            logger.error(f"Error sending WhatsApp message to {phone_number}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message_id': None
            }

    def validate_whatsapp_number(self, phone_number: str) -> Dict[str, Any]:
        """
        Validate if a phone number can receive messages

        Args:
            phone_number: Phone number to validate

        Returns:
            Dict with validation results
        """
        try:
            # Use custom messaging service validation
            result = self.messaging_service.validate_phone_number(phone_number)

            # Adapt response format for backward compatibility
            return {
                'is_valid': result.get('is_valid', False),
                'has_whatsapp': result.get('can_receive_messages', False),
                'checked_at': result.get('checked_at'),
                'error': result.get('error')
            }

        except Exception as e:
            logger.error(f"Error validating WhatsApp number {phone_number}: {str(e)}")
            return {
                'is_valid': False,
                'has_whatsapp': False,
                'error': str(e),
                'checked_at': time.time()
            }

    def get_message_status(self, message_id: str) -> Dict[str, Any]:
        """
        Get the status of a sent message

        Args:
            message_id: WhatsApp message ID

        Returns:
            Dict with message status
        """
        try:
            # Use custom messaging service
            result = self.messaging_service.get_message_status(message_id)

            return {
                'message_id': message_id,
                'status': result.get('status'),
                'timestamp': result.get('checked_at')
            }

        except Exception as e:
            logger.error(f"Error checking message status {message_id}: {str(e)}")
            return {
                'message_id': message_id,
                'status': 'error',
                'error': str(e)
            }

    # Additional methods for enhanced functionality

    def send_bulk_messages(self, messages: list, campaign_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Send multiple messages in bulk

        Args:
            messages: List of message dicts
            campaign_id: Associated campaign ID

        Returns:
            Dict with bulk send results
        """
        return self.messaging_service.send_bulk_messages(messages, campaign_id)

    def get_account_balance(self) -> Dict[str, Any]:
        """
        Get account balance information

        Returns:
            Dict with balance information
        """
        return self.messaging_service.get_account_balance()


# Global instance
whatsapp_service = WhatsAppService()