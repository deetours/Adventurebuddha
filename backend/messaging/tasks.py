from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
from django.utils import timezone
import pandas as pd
import openpyxl
from io import BytesIO
import time
import logging
import json
import os
from datetime import datetime

from .models import (
    ContactList, Contact, MessageCampaign, Message,
    MessageLog, CampaignReport
)
from .whatsapp_service import WhatsAppService

logger = logging.getLogger(__name__)

# Initialize WhatsApp service
whatsapp_service = WhatsAppService()


@shared_task(bind=True, max_retries=3)
def send_bulk_messages_task(self, phone_numbers, message_content, attachment_url, delay_seconds, user_id):
    """Send bulk WhatsApp messages with delay between each"""
    try:
        results = []

        for i, phone_number in enumerate(phone_numbers):
            try:
                # Send message
                result = whatsapp_service.send_message(
                    phone_number=phone_number,
                    message=message_content,
                    attachment_url=attachment_url
                )

                results.append({
                    'phone_number': phone_number,
                    'status': 'sent' if result['success'] else 'failed',
                    'message_id': result.get('message_id'),
                    'error': result.get('error')
                })

                # Log the message sending
                logger.info(f"Message sent to {phone_number}: {result}")

                # Delay between messages (except for the last one)
                if i < len(phone_numbers) - 1:
                    time.sleep(delay_seconds)

            except Exception as e:
                logger.error(f"Error sending message to {phone_number}: {str(e)}")
                results.append({
                    'phone_number': phone_number,
                    'status': 'failed',
                    'error': str(e)
                })

        return {
            'success': True,
            'results': results,
            'total_sent': len([r for r in results if r['status'] == 'sent']),
            'total_failed': len([r for r in results if r['status'] == 'failed'])
        }

    except Exception as e:
        logger.error(f"Bulk message sending failed: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=2)
def process_contact_list_task(self, contact_list_id):
    """Process uploaded Excel/CSV file and create contacts"""
    try:
        contact_list = ContactList.objects.get(id=contact_list_id)

        # Read the file
        file_path = contact_list.get_file_path()
        if not file_path or not os.path.exists(file_path):
            raise FileNotFoundError(f"Contact list file not found: {file_path}")

        # Determine file type and read accordingly
        file_extension = contact_list.file.name.split('.')[-1].lower()

        if file_extension == 'csv':
            df = pd.read_csv(file_path)
        elif file_extension in ['xlsx', 'xls']:
            df = pd.read_excel(file_path, engine='openpyxl' if file_extension == 'xlsx' else None)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")

        # Process contacts
        total_contacts = len(df)
        valid_contacts = 0
        invalid_contacts = 0
        whatsapp_contacts = 0

        # Default column mapping if not provided
        column_mapping = contact_list.column_mapping or {}
        if not column_mapping:
            # Auto-detect columns
            column_mapping = autodetect_columns(df)

        for index, row in df.iterrows():
            try:
                # Extract contact data
                contact_data = extract_contact_data(row, column_mapping)

                if not contact_data.get('phone_number'):
                    invalid_contacts += 1
                    continue

                # Validate phone number
                phone_number = validate_phone_number(contact_data['phone_number'])
                if not phone_number:
                    invalid_contacts += 1
                    continue

                # Check WhatsApp validity (mock for now)
                whatsapp_valid = check_whatsapp_validity(phone_number)

                # Create contact
                Contact.objects.create(
                    contact_list=contact_list,
                    phone_number=phone_number,
                    name=contact_data.get('name', ''),
                    email=contact_data.get('email', ''),
                    custom_fields=contact_data.get('custom_fields', {}),
                    status='whatsapp_valid' if whatsapp_valid else 'valid',
                    whatsapp_status=whatsapp_valid
                )

                valid_contacts += 1
                if whatsapp_valid:
                    whatsapp_contacts += 1

            except Exception as e:
                logger.error(f"Error processing contact at row {index}: {str(e)}")
                invalid_contacts += 1

        # Update contact list statistics
        contact_list.total_contacts = total_contacts
        contact_list.valid_contacts = valid_contacts
        contact_list.invalid_contacts = invalid_contacts
        contact_list.whatsapp_contacts = whatsapp_contacts
        contact_list.processed_at = timezone.now()
        contact_list.save()

        logger.info(f"Processed contact list {contact_list_id}: {valid_contacts} valid, {invalid_contacts} invalid")

        return {
            'success': True,
            'total_contacts': total_contacts,
            'valid_contacts': valid_contacts,
            'invalid_contacts': invalid_contacts,
            'whatsapp_contacts': whatsapp_contacts
        }

    except Exception as e:
        logger.error(f"Contact list processing failed for {contact_list_id}: {str(e)}")
        raise self.retry(countdown=300, exc=e)


@shared_task(bind=True, max_retries=3)
def send_campaign_messages_task(self, campaign_id):
    """Send messages for a campaign in batches"""
    try:
        campaign = MessageCampaign.objects.get(id=campaign_id)

        if campaign.status not in ['running', 'scheduled']:
            logger.info(f"Campaign {campaign_id} is not in running state")
            return

        # Get pending messages
        pending_messages = campaign.messages.filter(status='queued')[:campaign.batch_size]

        if not pending_messages:
            # No more messages to send, mark campaign as completed
            campaign.status = 'completed'
            campaign.completed_at = timezone.now()
            campaign.save()
            logger.info(f"Campaign {campaign_id} completed")
            return

        sent_count = 0
        failed_count = 0

        for message in pending_messages:
            try:
                # Send message
                result = whatsapp_service.send_message(
                    phone_number=message.contact.phone_number,
                    message=message.content,
                    attachment_url=message.attachment_url,
                    attachment_file=message.attachment_file.path if message.attachment_file else None
                )

                if result['success']:
                    message.status = 'sent'
                    message.sent_at = timezone.now()
                    message.whatsapp_message_id = result.get('message_id')
                    sent_count += 1
                else:
                    message.status = 'failed'
                    message.error_message = result.get('error', 'Unknown error')
                    message.failed_at = timezone.now()
                    failed_count += 1

                message.save()

                # Log the action
                MessageLog.objects.create(
                    message=message,
                    action='send_attempt',
                    status=message.status,
                    details=result,
                    error_message=result.get('error')
                )

                # Delay between messages
                if campaign.delay_between_messages > 0:
                    time.sleep(campaign.delay_between_messages)

            except Exception as e:
                logger.error(f"Error sending message {message.id}: {str(e)}")
                message.status = 'failed'
                message.error_message = str(e)
                message.failed_at = timezone.now()
                message.save()
                failed_count += 1

        # Update campaign statistics
        campaign.sent_messages += sent_count
        campaign.failed_messages += failed_count
        campaign.pending_messages -= (sent_count + failed_count)
        campaign.current_batch += 1
        campaign.last_message_sent_at = timezone.now()
        campaign.save()

        # Continue with next batch if campaign is still running
        if campaign.status == 'running' and campaign.pending_messages > 0:
            # Schedule next batch
            send_campaign_messages_task.apply_async(
                args=[campaign_id],
                countdown=60  # Wait 1 minute before next batch
            )

        logger.info(f"Campaign {campaign_id} batch completed: {sent_count} sent, {failed_count} failed")

        return {
            'success': True,
            'sent': sent_count,
            'failed': failed_count,
            'remaining': campaign.pending_messages
        }

    except Exception as e:
        logger.error(f"Campaign message sending failed for {campaign_id}: {str(e)}")
        raise self.retry(countdown=120, exc=e)


@shared_task(bind=True, max_retries=2)
def send_single_message_task(self, message_id):
    """Send a single message (for retries)"""
    try:
        message = Message.objects.get(id=message_id)

        if message.status != 'failed':
            return {'success': False, 'error': 'Message is not in failed state'}

        # Send message
        result = whatsapp_service.send_message(
            phone_number=message.contact.phone_number,
            message=message.content,
            attachment_url=message.attachment_url,
            attachment_file=message.attachment_file.path if message.attachment_file else None
        )

        message.retry_count += 1

        if result['success']:
            message.status = 'sent'
            message.sent_at = timezone.now()
            message.whatsapp_message_id = result.get('message_id')
            message.error_message = None
        else:
            message.error_message = result.get('error', 'Unknown error')

        message.save()

        # Log the retry
        MessageLog.objects.create(
            message=message,
            action='retry_attempt',
            status=message.status,
            details=result,
            error_message=result.get('error')
        )

        return {
            'success': result['success'],
            'message_id': message.id,
            'status': message.status
        }

    except Exception as e:
        logger.error(f"Single message sending failed for {message_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=1)
def generate_campaign_report_task(self, campaign_id, report_type, user_id):
    """Generate a report for a campaign"""
    try:
        campaign = MessageCampaign.objects.get(id=campaign_id)

        if report_type == 'summary':
            report_data = generate_summary_report(campaign)
        elif report_type == 'detailed':
            report_data = generate_detailed_report(campaign)
        elif report_type == 'failed':
            report_data = generate_failed_messages_report(campaign)
        else:
            raise ValueError(f"Unknown report type: {report_type}")

        # Create Excel file
        excel_file = create_excel_report(report_data, report_type)

        # Save report
        report = CampaignReport.objects.create(
            campaign=campaign,
            report_type=report_type,
            file=excel_file,
            generated_by_id=user_id
        )

        logger.info(f"Generated {report_type} report for campaign {campaign_id}")

        return {
            'success': True,
            'report_id': report.id,
            'file_name': report.get_file_name()
        }

    except Exception as e:
        logger.error(f"Report generation failed for campaign {campaign_id}: {str(e)}")
        raise


# Helper functions

def autodetect_columns(df):
    """Auto-detect column mappings from DataFrame"""
    mapping = {}
    columns = [col.lower() for col in df.columns]

    # Common column name patterns
    phone_patterns = ['phone', 'mobile', 'number', 'contact', 'tel']
    name_patterns = ['name', 'full_name', 'first_name', 'customer_name']
    email_patterns = ['email', 'mail', 'e-mail']

    for i, col in enumerate(columns):
        col_name = df.columns[i]
        if any(pattern in col for pattern in phone_patterns):
            mapping['phone_number'] = col_name
        elif any(pattern in col for pattern in name_patterns):
            mapping['name'] = col_name
        elif any(pattern in col for pattern in email_patterns):
            mapping['email'] = col_name

    return mapping


def extract_contact_data(row, column_mapping):
    """Extract contact data from a DataFrame row"""
    data = {}

    # Map standard fields
    for field, col_name in column_mapping.items():
        if col_name in row.index:
            value = row[col_name]
            if pd.notna(value):  # Check if value is not NaN
                if field in ['phone_number', 'name', 'email']:
                    data[field] = str(value).strip()
                else:
                    data.setdefault('custom_fields', {})[field] = str(value).strip()

    return data


def validate_phone_number(phone_number):
    """Validate and format phone number"""
    import re

    if not phone_number:
        return None

    # Remove all non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', str(phone_number))

    # Ensure it starts with +
    if not cleaned.startswith('+'):
        # Assume Indian number if no country code
        if len(cleaned) == 10:
            cleaned = f'+91{cleaned}'
        else:
            return None

    # Basic validation
    if not re.match(r'^\+\d{10,15}$', cleaned):
        return None

    return cleaned


def check_whatsapp_validity(phone_number):
    """Check if phone number has WhatsApp (mock implementation)"""
    # In a real implementation, this would check with WhatsApp Business API
    # For now, assume 80% of valid numbers have WhatsApp
    import random
    return random.random() < 0.8


def generate_summary_report(campaign):
    """Generate summary report data"""
    messages = campaign.messages.all()

    total = messages.count()
    sent = messages.filter(status='sent').count()
    delivered = messages.filter(status='delivered').count()
    read = messages.filter(status='read').count()
    failed = messages.filter(status='failed').count()

    return {
        'campaign_name': campaign.name,
        'created_at': campaign.created_at,
        'status': campaign.status,
        'summary': {
            'total_messages': total,
            'sent': sent,
            'delivered': delivered,
            'read': read,
            'failed': failed,
            'success_rate': f"{(sent/total*100):.1f}%" if total > 0 else "0%"
        }
    }


def generate_detailed_report(campaign):
    """Generate detailed report data"""
    messages = campaign.messages.select_related('contact').all()

    report_data = []
    for message in messages:
        report_data.append({
            'phone_number': message.contact.phone_number,
            'name': message.contact.name,
            'status': message.status,
            'sent_at': message.sent_at,
            'delivered_at': message.delivered_at,
            'read_at': message.read_at,
            'error_message': message.error_message,
            'retry_count': message.retry_count
        })

    return {
        'campaign_name': campaign.name,
        'messages': report_data
    }


def generate_failed_messages_report(campaign):
    """Generate failed messages report"""
    failed_messages = campaign.messages.select_related('contact').filter(status='failed')

    report_data = []
    for message in failed_messages:
        report_data.append({
            'phone_number': message.contact.phone_number,
            'name': message.contact.name,
            'error_message': message.error_message,
            'retry_count': message.retry_count,
            'failed_at': message.failed_at
        })

    return {
        'campaign_name': campaign.name,
        'failed_messages': report_data
    }


def create_excel_report(data, report_type):
    """Create Excel file from report data"""
    output = BytesIO()

    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        if report_type == 'summary':
            # Summary sheet
            summary_df = pd.DataFrame([data['summary']])
            summary_df.to_excel(writer, sheet_name='Summary', index=False)

            # Campaign info
            info_df = pd.DataFrame([{
                'Campaign Name': data['campaign_name'],
                'Created At': data['created_at'],
                'Status': data['status']
            }])
            info_df.to_excel(writer, sheet_name='Campaign Info', index=False)

        elif report_type == 'detailed':
            messages_df = pd.DataFrame(data['messages'])
            messages_df.to_excel(writer, sheet_name='Messages', index=False)

        elif report_type == 'failed':
            failed_df = pd.DataFrame(data['failed_messages'])
            failed_df.to_excel(writer, sheet_name='Failed Messages', index=False)

    output.seek(0)

    # Create Django file
    file_name = f"campaign_report_{report_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    file_content = ContentFile(output.getvalue(), name=file_name)

    return file_content


@shared_task(bind=True, max_retries=3)
def process_incoming_message_task(self, contact_id, message_text, message_type, whatsapp_message_id):
    """Process incoming WhatsApp message and generate automated response"""
    try:
        from ai_agent.services import AIService
        from ai_agent.models import AIConversation

        contact = Contact.objects.get(id=contact_id)
        ai_service = AIService()

        # Create or get conversation
        conversation, created = AIConversation.objects.get_or_create(
            contact=contact,
            defaults={'conversation_data': []}
        )

        # Analyze message intent and generate response
        context = {
            'contact_name': contact.name,
            'phone_number': contact.phone_number,
            'message_type': message_type,
            'conversation_history': conversation.conversation_data[-5:] if conversation.conversation_data else []
        }

        # Classify message and get appropriate response
        if 'booking' in message_text.lower() or 'trip' in message_text.lower():
            agent_type = 'trip_guidance'
        elif 'payment' in message_text.lower() or 'pay' in message_text.lower():
            agent_type = 'payment'
        elif 'help' in message_text.lower() or 'support' in message_text.lower():
            agent_type = 'customer_care'
        else:
            agent_type = 'customer_care'

        # Generate AI response
        try:
            ai_response = ai_service.chat_with_agent(
                agent_type=agent_type,
                message=message_text,
                context=context
            )

            response_text = ai_response.get('response', 'Thank you for your message. Our team will get back to you soon.')

        except Exception as e:
            logger.error(f"AI response generation failed: {str(e)}")
            response_text = "Thank you for your message. Our team will get back to you soon."

        # Send automated response
        result = whatsapp_service.send_message(
            phone_number=contact.phone_number,
            message=response_text
        )

        # Update conversation history
        conversation.conversation_data.append({
            'timestamp': timezone.now().isoformat(),
            'user_message': message_text,
            'ai_response': response_text,
            'agent_type': agent_type,
            'response_sent': result['success']
        })
        conversation.save()

        # Log the interaction
        MessageLog.objects.create(
            message=None,  # No campaign message for incoming
            action='incoming_message_processed',
            status='processed',
            details={
                'contact_id': contact_id,
                'message_text': message_text,
                'ai_response': response_text,
                'response_sent': result['success']
            }
        )

        return {
            'success': True,
            'contact_id': contact_id,
            'response_sent': result['success'],
            'ai_agent_used': agent_type
        }

    except Exception as e:
        logger.error(f"Incoming message processing failed for contact {contact_id}: {str(e)}")
        raise self.retry(countdown=60, exc=e)


@shared_task(bind=True, max_retries=2)
def generate_personalized_messages_task(self, campaign_id):
    """Generate personalized messages for a campaign using AI"""
    try:
        from ai_agent.services import AIService

        campaign = MessageCampaign.objects.get(id=campaign_id)
        ai_service = AIService()

        contacts = campaign.contact_list.contacts.filter(status='whatsapp_valid')

        for contact in contacts:
            try:
                # Get contact context for personalization
                context = {
                    'contact_name': contact.name or 'Valued Customer',
                    'phone_number': contact.phone_number,
                    'custom_fields': contact.custom_fields,
                    'campaign_type': campaign.campaign_type
                }

                # Use AI to personalize the message
                personalized_content = campaign.message_content

                # Replace basic placeholders
                personalized_content = personalized_content.replace('{{name}}', context['contact_name'])
                personalized_content = personalized_content.replace('{{phone}}', context['phone_number'])

                # Use AI for advanced personalization if needed
                if campaign.personalization_rules:
                    try:
                        ai_personalization = ai_service.generate_content(
                            content_type='personalized_message',
                            topic=f"Personalize this message for {context['contact_name']}: {campaign.message_content}",
                            context=context,
                            tone='friendly'
                        )

                        if ai_personalization.get('success'):
                            personalized_content = ai_personalization['content']

                    except Exception as e:
                        logger.warning(f"AI personalization failed for contact {contact.id}: {str(e)}")
                        # Fall back to basic personalization

                # Create personalized message
                Message.objects.create(
                    campaign=campaign,
                    contact=contact,
                    content=personalized_content,
                    attachment_url=campaign.attachment_url,
                    attachment_file=campaign.attachment_file,
                    status='queued'
                )

            except Exception as e:
                logger.error(f"Failed to create personalized message for contact {contact.id}: {str(e)}")
                continue

        # Update campaign statistics
        campaign.total_messages = contacts.count()
        campaign.pending_messages = contacts.count()
        campaign.save()

        return {
            'success': True,
            'campaign_id': campaign_id,
            'messages_created': contacts.count()
        }

    except Exception as e:
        logger.error(f"Personalized message generation failed for campaign {campaign_id}: {str(e)}")
        raise self.retry(countdown=120, exc=e)