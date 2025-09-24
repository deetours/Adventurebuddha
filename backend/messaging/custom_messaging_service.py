import os
import logging
import time
import requests
import uuid
from typing import Dict, Any, Optional, List
from django.conf import settings
from django.core.files import File
from django.core.cache import cache
from django.utils import timezone
from messaging.models import Message, Contact, MessageCampaign

logger = logging.getLogger(__name__)


class CustomMessagingService:
    """
    Custom Messaging API Service - Similar to WhatsApp Sender APIs like WaSenderAPI
    Provides a REST API interface for sending messages with phone number input
    Designed for easy integration with WhatsApp API later
    """

    def __init__(self):
        self.api_key = getattr(settings, 'CUSTOM_MESSAGING_API_KEY', 'your_api_key_here')
        self.api_url = getattr(settings, 'CUSTOM_MESSAGING_API_URL', 'http://localhost:8001/api')
        self.use_mock = getattr(settings, 'CUSTOM_MESSAGING_USE_MOCK', True)
        self.rate_limit_per_minute = getattr(settings, 'MESSAGING_RATE_LIMIT', 60)
        self.max_messages_per_batch = getattr(settings, 'MAX_MESSAGES_PER_BATCH', 100)

        logger.info(f"Custom Messaging Service initialized - Mock: {self.use_mock}")

    def send_message(
        self,
        phone_number: str,
        message: str,
        campaign_id: Optional[str] = None,
        attachment_url: Optional[str] = None,
        attachment_file: Optional[str] = None,
        priority: str = 'normal',
        scheduled_at: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send message through custom messaging API

        Args:
            phone_number: Recipient phone number (with country code)
            message: Message content
            campaign_id: Associated campaign ID
            attachment_url: URL of attachment
            attachment_file: Local file path
            priority: Message priority (low, normal, high, urgent)
            scheduled_at: ISO format datetime for scheduling

        Returns:
            Dict with success status and message details
        """
        try:
            # Check rate limiting
            if not self._check_rate_limit(phone_number):
                return {
                    'success': False,
                    'error': 'Rate limit exceeded',
                    'message_id': None
                }

            if self.use_mock:
                return self._send_mock_message(
                    phone_number, message, campaign_id,
                    attachment_url, attachment_file, priority, scheduled_at
                )
            else:
                return self._send_api_message(
                    phone_number, message, campaign_id,
                    attachment_url, attachment_file, priority, scheduled_at
                )

        except Exception as e:
            logger.error(f"Error sending message to {phone_number}: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message_id': None
            }

    def _send_mock_message(
        self,
        phone_number: str,
        message: str,
        campaign_id: Optional[str] = None,
        attachment_url: Optional[str] = None,
        attachment_file: Optional[str] = None,
        priority: str = 'normal',
        scheduled_at: Optional[str] = None
    ) -> Dict[str, Any]:
        """Mock implementation for development/testing"""
        logger.info(f"MOCK: Sending message to {phone_number}: {message[:50]}...")

        # Simulate processing time based on priority
        delay = {'low': 0.1, 'normal': 0.5, 'high': 1.0, 'urgent': 2.0}.get(priority, 0.5)
        time.sleep(delay)

        # Simulate occasional failures (5% failure rate)
        import random
        success = random.random() > 0.05

        message_id = f"custom_msg_{int(time.time())}_{phone_number.replace('+', '')}"

        if success:
            # Update database if this is part of a campaign
            self._update_message_status(message_id, 'sent', campaign_id)

            return {
                'success': True,
                'message_id': message_id,
                'status': 'sent',
                'priority': priority,
                'estimated_delivery': timezone.now() + timezone.timedelta(seconds=30)
            }
        else:
            error_types = [
                'Invalid phone number',
                'Network error',
                'Recipient unavailable',
                'Message blocked',
                'Temporary failure'
            ]
            error = random.choice(error_types)

            self._update_message_status(message_id, 'failed', campaign_id, error)

            return {
                'success': False,
                'error': error,
                'message_id': message_id,
                'status': 'failed'
            }

    def _send_api_message(
        self,
        phone_number: str,
        message: str,
        campaign_id: Optional[str] = None,
        attachment_url: Optional[str] = None,
        attachment_file: Optional[str] = None,
        priority: str = 'normal',
        scheduled_at: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send message through custom messaging API"""
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
                'X-API-Version': '1.0'
            }

            payload = {
                'phone_number': phone_number,
                'message': message,
                'priority': priority,
                'message_type': 'text'
            }

            # Add optional fields
            if campaign_id:
                payload['campaign_id'] = campaign_id
            if scheduled_at:
                payload['scheduled_at'] = scheduled_at
            if attachment_url:
                payload['attachment_url'] = attachment_url
                payload['message_type'] = 'media'
            if attachment_file and os.path.exists(attachment_file):
                # For file uploads, we'd need to use multipart/form-data
                # This is a simplified version
                payload['attachment_file'] = attachment_file
                payload['message_type'] = 'media'

            response = requests.post(
                f"{self.api_url}/messages/send",
                headers=headers,
                json=payload,
                timeout=30
            )

            if response.status_code in [200, 201]:
                data = response.json()
                message_id = data.get('message_id', f"api_msg_{int(time.time())}")

                # Update database status
                self._update_message_status(message_id, 'sent', campaign_id)

                return {
                    'success': True,
                    'message_id': message_id,
                    'status': 'sent',
                    'api_response': data
                }
            else:
                error_msg = f"API error: {response.status_code} - {response.text}"
                logger.error(error_msg)
                return {
                    'success': False,
                    'error': error_msg,
                    'message_id': None
                }

        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': f"API request failed: {str(e)}",
                'message_id': None
            }

    def send_bulk_messages(
        self,
        messages: List[Dict[str, Any]],
        campaign_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Send multiple messages in bulk

        Args:
            messages: List of message dicts with phone_number, message, etc.
            campaign_id: Associated campaign ID

        Returns:
            Dict with bulk send results
        """
        results = []
        successful = 0
        failed = 0

        # Limit batch size
        messages = messages[:self.max_messages_per_batch]

        for msg_data in messages:
            result = self.send_message(
                phone_number=msg_data['phone_number'],
                message=msg_data['message'],
                campaign_id=campaign_id,
                attachment_url=msg_data.get('attachment_url'),
                priority=msg_data.get('priority', 'normal')
            )

            results.append({
                'phone_number': msg_data['phone_number'],
                'result': result
            })

            if result['success']:
                successful += 1
            else:
                failed += 1

        return {
            'success': True,
            'total_messages': len(messages),
            'successful': successful,
            'failed': failed,
            'results': results
        }

    def validate_phone_number(self, phone_number: str) -> Dict[str, Any]:
        """
        Validate phone number format and check if messaging is possible

        Args:
            phone_number: Phone number to validate

        Returns:
            Dict with validation results
        """
        try:
            # Basic phone number validation
            import re
            # Remove all non-digit characters except +
            clean_number = re.sub(r'[^\d+]', '', phone_number)

            # Check if it starts with + and has reasonable length
            if not clean_number.startswith('+'):
                clean_number = '+' + clean_number

            # Basic length check (10-15 digits after +)
            digits_only = clean_number[1:]
            if not 10 <= len(digits_only) <= 15:
                return {
                    'is_valid': False,
                    'formatted_number': clean_number,
                    'error': 'Invalid phone number length'
                }

            # Check if all characters are digits after +
            if not digits_only.isdigit():
                return {
                    'is_valid': False,
                    'formatted_number': clean_number,
                    'error': 'Phone number contains invalid characters'
                }

            if self.use_mock:
                # Mock validation - 90% success rate
                import random
                can_receive = random.random() > 0.1
                return {
                    'is_valid': True,
                    'formatted_number': clean_number,
                    'can_receive_messages': can_receive,
                    'carrier_info': 'Mock Carrier' if can_receive else None,
                    'checked_at': time.time()
                }
            else:
                # Real API validation
                headers = {
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }

                response = requests.post(
                    f"{self.api_url}/validate",
                    headers=headers,
                    json={'phone_number': clean_number},
                    timeout=10
                )

                if response.status_code == 200:
                    data = response.json()
                    return {
                        'is_valid': data.get('valid', False),
                        'formatted_number': clean_number,
                        'can_receive_messages': data.get('can_receive', False),
                        'carrier_info': data.get('carrier'),
                        'checked_at': time.time()
                    }
                else:
                    return {
                        'is_valid': False,
                        'formatted_number': clean_number,
                        'error': f"Validation API error: {response.status_code}",
                        'checked_at': time.time()
                    }

        except Exception as e:
            logger.error(f"Error validating phone number {phone_number}: {str(e)}")
            return {
                'is_valid': False,
                'formatted_number': phone_number,
                'error': str(e),
                'checked_at': time.time()
            }

    def get_message_status(self, message_id: str) -> Dict[str, Any]:
        """
        Get the status of a sent message

        Args:
            message_id: Message ID

        Returns:
            Dict with message status
        """
        try:
            if self.use_mock:
                # Mock status check
                statuses = ['sent', 'delivered', 'read', 'failed']
                import random
                status = random.choice(statuses)
                return {
                    'message_id': message_id,
                    'status': status,
                    'delivered_at': timezone.now() if status in ['delivered', 'read'] else None,
                    'read_at': timezone.now() if status == 'read' else None,
                    'checked_at': time.time()
                }
            else:
                # Real API status check
                headers = {
                    'Authorization': f'Bearer {self.api_key}'
                }

                response = requests.get(
                    f"{self.api_url}/messages/{message_id}/status",
                    headers=headers,
                    timeout=10
                )

                if response.status_code == 200:
                    data = response.json()
                    return {
                        'message_id': message_id,
                        'status': data.get('status'),
                        'delivered_at': data.get('delivered_at'),
                        'read_at': data.get('read_at'),
                        'checked_at': time.time()
                    }
                else:
                    return {
                        'message_id': message_id,
                        'status': 'unknown',
                        'error': f"Status check failed: {response.status_code}",
                        'checked_at': time.time()
                    }

        except Exception as e:
            logger.error(f"Error checking message status {message_id}: {str(e)}")
            return {
                'message_id': message_id,
                'status': 'error',
                'error': str(e),
                'checked_at': time.time()
            }

    def get_account_balance(self) -> Dict[str, Any]:
        """
        Get account balance/credits information

        Returns:
            Dict with balance information
        """
        try:
            if self.use_mock:
                return {
                    'balance': 1000.50,
                    'currency': 'USD',
                    'messages_sent_today': 150,
                    'messages_limit_daily': 1000,
                    'messages_remaining': 850
                }
            else:
                headers = {
                    'Authorization': f'Bearer {self.api_key}'
                }

                response = requests.get(
                    f"{self.api_url}/account/balance",
                    headers=headers,
                    timeout=10
                )

                if response.status_code == 200:
                    return response.json()
                else:
                    return {
                        'error': f"Balance check failed: {response.status_code}",
                        'balance': 0
                    }

        except Exception as e:
            logger.error(f"Error checking account balance: {str(e)}")
            return {
                'error': str(e),
                'balance': 0
            }

    def _check_rate_limit(self, phone_number: str) -> bool:
        """Check if rate limit allows sending to this number"""
        cache_key = f"msg_rate_limit_{phone_number}"
        current_count = cache.get(cache_key, 0)

        if current_count >= self.rate_limit_per_minute:
            return False

        # Increment counter (expires in 60 seconds)
        cache.set(cache_key, current_count + 1, 60)
        return True

    def _update_message_status(
        self,
        message_id: str,
        status: str,
        campaign_id: Optional[str] = None,
        error_message: Optional[str] = None
    ):
        """Update message status in database"""
        try:
            # Find message by ID or create if it doesn't exist
            message = Message.objects.filter(whatsapp_message_id=message_id).first()
            if message:
                message.status = status
                if error_message:
                    message.error_message = error_message
                if status == 'sent':
                    message.sent_at = timezone.now()
                elif status == 'delivered':
                    message.delivered_at = timezone.now()
                elif status == 'read':
                    message.read_at = timezone.now()
                elif status == 'failed':
                    message.failed_at = timezone.now()
                message.save()

        except Exception as e:
            logger.error(f"Error updating message status: {str(e)}")


# Global instance
custom_messaging_service = CustomMessagingService()