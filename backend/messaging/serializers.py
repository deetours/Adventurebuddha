from rest_framework import serializers
from .models import (
    MessageTemplate, ContactList, Contact, MessageCampaign,
    Message, MessageLog, CampaignReport, Unsubscriber
)
import re


class MessageTemplateSerializer(serializers.ModelSerializer):
    """Serializer for message templates"""

    class Meta:
        model = MessageTemplate
        fields = [
            'id', 'name', 'content', 'description', 'is_active',
            'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ContactListSerializer(serializers.ModelSerializer):
    """Serializer for contact lists"""

    class Meta:
        model = ContactList
        fields = [
            'id', 'name', 'file', 'total_contacts', 'valid_contacts',
            'invalid_contacts', 'whatsapp_contacts', 'column_mapping',
            'uploaded_by', 'created_at', 'processed_at'
        ]
        read_only_fields = [
            'id', 'total_contacts', 'valid_contacts', 'invalid_contacts',
            'whatsapp_contacts', 'uploaded_by', 'created_at', 'processed_at'
        ]

    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class ContactSerializer(serializers.ModelSerializer):
    """Serializer for individual contacts"""

    contact_list_name = serializers.CharField(source='contact_list.name', read_only=True)

    class Meta:
        model = Contact
        fields = [
            'id', 'contact_list', 'contact_list_name', 'phone_number',
            'name', 'email', 'custom_fields', 'status', 'whatsapp_status',
            'last_validated', 'created_at'
        ]
        read_only_fields = ['id', 'last_validated', 'created_at']


class MessageCampaignSerializer(serializers.ModelSerializer):
    """Serializer for message campaigns"""

    template_name = serializers.CharField(source='template.name', read_only=True)
    contact_list_name = serializers.CharField(source='contact_list.name', read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = MessageCampaign
        fields = [
            'id', 'name', 'description', 'template', 'template_name',
            'contact_list', 'contact_list_name', 'message_content',
            'attachment_url', 'attachment_file', 'status', 'scheduled_at',
            'delay_between_messages', 'batch_size', 'campaign_type', 'personalization_rules',
            'total_messages', 'sent_messages', 'delivered_messages', 'failed_messages',
            'pending_messages', 'current_batch', 'last_message_sent_at',
            'progress_percentage', 'created_by', 'created_at', 'updated_at',
            'completed_at'
        ]
        read_only_fields = [
            'id', 'total_messages', 'sent_messages', 'delivered_messages',
            'failed_messages', 'pending_messages', 'current_batch',
            'last_message_sent_at', 'progress_percentage', 'created_by',
            'created_at', 'updated_at', 'completed_at'
        ]

    def get_progress_percentage(self, obj):
        return obj.get_progress_percentage()

    def validate_message_content(self, value):
        """Validate message content for placeholders"""
        if not value or not value.strip():
            raise serializers.ValidationError("Message content cannot be empty.")

        # Check for balanced placeholders
        placeholders = re.findall(r'\{\{(\w+)\}\}', value)
        if len(placeholders) != len(set(placeholders)):
            raise serializers.ValidationError("Duplicate placeholders found in message content.")

        return value

    def validate_delay_between_messages(self, value):
        """Validate delay between messages"""
        if value < 10:
            raise serializers.ValidationError("Delay between messages must be at least 10 seconds.")
        if value > 300:
            raise serializers.ValidationError("Delay between messages cannot exceed 5 minutes.")
        return value

    def validate_batch_size(self, value):
        """Validate batch size"""
        if value < 1:
            raise serializers.ValidationError("Batch size must be at least 1.")
        if value > 50:
            raise serializers.ValidationError("Batch size cannot exceed 50 messages.")
        return value


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for individual messages"""

    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    contact_phone = serializers.CharField(source='contact.phone_number', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'campaign', 'campaign_name', 'contact', 'contact_name',
            'contact_phone', 'content', 'attachment_url', 'attachment_file',
            'status', 'whatsapp_message_id', 'error_message', 'sent_at',
            'delivered_at', 'read_at', 'failed_at', 'retry_count',
            'max_retries', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'whatsapp_message_id', 'sent_at', 'delivered_at',
            'read_at', 'failed_at', 'created_at', 'updated_at'
        ]


class MessageLogSerializer(serializers.ModelSerializer):
    """Serializer for message logs"""

    message_content = serializers.CharField(source='message.content', read_only=True)
    contact_phone = serializers.CharField(source='message.contact.phone_number', read_only=True)

    class Meta:
        model = MessageLog
        fields = [
            'id', 'message', 'message_content', 'contact_phone', 'action',
            'status', 'details', 'error_message', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CampaignReportSerializer(serializers.ModelSerializer):
    """Serializer for campaign reports"""

    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = CampaignReport
        fields = [
            'id', 'campaign', 'campaign_name', 'report_type', 'file',
            'file_name', 'generated_by', 'created_at'
        ]
        read_only_fields = ['id', 'file_name', 'generated_by', 'created_at']

    def get_file_name(self, obj):
        return obj.get_file_name()


# Specialized serializers for specific operations

class BulkMessageSerializer(serializers.Serializer):
    """Serializer for bulk message sending"""
    phone_numbers = serializers.ListField(
        child=serializers.CharField(max_length=20),
        max_length=10,
        help_text="List of phone numbers (max 10)"
    )
    message = serializers.CharField(max_length=1000)
    attachment_url = serializers.URLField(required=False, allow_blank=True)
    delay_seconds = serializers.IntegerField(
        default=30,
        min_value=10,
        max_value=300,
        help_text="Delay between messages in seconds"
    )

    def validate_phone_numbers(self, value):
        """Validate phone numbers format"""
        if not value:
            raise serializers.ValidationError("At least one phone number is required.")

        validated_numbers = []
        for number in value:
            # Basic phone number validation (allow international format)
            cleaned = re.sub(r'[^\d+\-\s]', '', number).strip()
            if not re.match(r'^\+?[\d\s\-\(\)]{7,20}$', cleaned):
                raise serializers.ValidationError(f"Invalid phone number format: {number}")
            validated_numbers.append(cleaned)

        return validated_numbers


class CampaignActionSerializer(serializers.Serializer):
    """Serializer for campaign actions (pause, resume, cancel)"""
    action = serializers.ChoiceField(choices=['pause', 'resume', 'cancel'])

    def validate(self, data):
        campaign = self.context.get('campaign')
        if not campaign:
            raise serializers.ValidationError("Campaign context is required.")

        action = data['action']

        if action == 'pause' and not campaign.can_pause():
            raise serializers.ValidationError(f"Cannot pause campaign in {campaign.status} status.")

        if action == 'resume' and not campaign.can_resume():
            raise serializers.ValidationError(f"Cannot resume campaign in {campaign.status} status.")

        if action == 'cancel' and not campaign.can_cancel():
            raise serializers.ValidationError(f"Cannot cancel campaign in {campaign.status} status.")

        return data


class ExcelUploadSerializer(serializers.Serializer):
    """Serializer for Excel file upload"""
    file = serializers.FileField(
        help_text="Excel or CSV file containing contact information"
    )
    name = serializers.CharField(
        max_length=100,
        help_text="Name for this contact list"
    )
    column_mapping = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Optional column mapping (e.g., {'name': 'A', 'phone': 'B'})"
    )

    def validate_file(self, value):
        """Validate uploaded file"""
        if not value:
            raise serializers.ValidationError("File is required.")

        # Check file size (max 10MB)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB.")

        # Check file extension
        allowed_extensions = ['xlsx', 'xls', 'csv']
        file_extension = value.name.split('.')[-1].lower()
        if file_extension not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
            )

        return value


class PersonalizedCampaignSerializer(serializers.Serializer):
    """Serializer for creating personalized campaigns"""
    contact_list_id = serializers.IntegerField()
    base_template = serializers.CharField(max_length=1000)
    personalization_rules = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Rules for personalization (e.g., {'name': 'use_contact_name', 'location': 'infer_from_history'})"
    )

    def validate_contact_list_id(self, value):
        """Validate that contact list exists and belongs to user"""
        request = self.context.get('request')
        if not request or not request.user:
            raise serializers.ValidationError("Authentication required.")

        try:
            contact_list = ContactList.objects.get(
                id=value,
                uploaded_by=request.user
            )
            if contact_list.contacts.count() == 0:
                raise serializers.ValidationError("Contact list is empty.")
            return value
        except ContactList.DoesNotExist:
            raise serializers.ValidationError("Contact list not found or access denied.")


class UnsubscriberSerializer(serializers.ModelSerializer):
    """Serializer for unsubscribers"""

    class Meta:
        model = Unsubscriber
        fields = [
            'id', 'phone_number', 'reason', 'unsubscribed_at', 'source'
        ]
        read_only_fields = ['id', 'unsubscribed_at']