from django.db import models
from django.contrib.auth.models import User
from django.core.validators import FileExtensionValidator
import uuid
import os


class MessageTemplate(models.Model):
    """Templates for WhatsApp messages with placeholders"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    content = models.TextField(help_text="Message content with placeholders like {{name}}, {{orderId}}")
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


class ContactList(models.Model):
    """Uploaded contact lists from Excel/CSV files"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    file = models.FileField(
        upload_to='contact_lists/',
        validators=[FileExtensionValidator(allowed_extensions=['xlsx', 'xls', 'csv'])]
    )
    total_contacts = models.IntegerField(default=0)
    valid_contacts = models.IntegerField(default=0)
    invalid_contacts = models.IntegerField(default=0)
    whatsapp_contacts = models.IntegerField(default=0)  # Valid WhatsApp numbers
    column_mapping = models.JSONField(help_text="Mapping of Excel columns to fields", null=True, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.total_contacts} contacts)"

    def get_file_path(self):
        return self.file.path if self.file else None


class Contact(models.Model):
    """Individual contacts from uploaded lists"""
    STATUS_CHOICES = [
        ('pending', 'Pending Validation'),
        ('valid', 'Valid'),
        ('invalid', 'Invalid'),
        ('whatsapp_valid', 'WhatsApp Valid'),
        ('whatsapp_invalid', 'WhatsApp Invalid'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    contact_list = models.ForeignKey(ContactList, on_delete=models.CASCADE, related_name='contacts')
    phone_number = models.CharField(max_length=20)
    name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    custom_fields = models.JSONField(default=dict, blank=True)  # Additional fields from Excel
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    whatsapp_status = models.BooleanField(default=False)
    last_validated = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name or 'Unknown'} - {self.phone_number}"

    class Meta:
        unique_together = ['contact_list', 'phone_number']
        ordering = ['name', 'phone_number']


class MessageCampaign(models.Model):
    """WhatsApp message campaigns"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('running', 'Running'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    template = models.ForeignKey(MessageTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    contact_list = models.ForeignKey(ContactList, on_delete=models.CASCADE)
    message_content = models.TextField()
    attachment_url = models.URLField(blank=True, null=True)
    attachment_file = models.FileField(upload_to='campaign_attachments/', blank=True, null=True)

    # Campaign settings
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    scheduled_at = models.DateTimeField(null=True, blank=True)
    delay_between_messages = models.IntegerField(default=30, help_text="Delay in seconds between messages")
    batch_size = models.IntegerField(default=10, help_text="Messages per batch")

    # AI Personalization
    campaign_type = models.CharField(max_length=20, choices=[
        ('standard', 'Standard Campaign'),
        ('personalized', 'AI Personalized'),
        ('automated', 'Automated Responses'),
    ], default='standard')
    personalization_rules = models.JSONField(default=dict, blank=True, help_text="Rules for AI personalization")

    # Statistics
    total_messages = models.IntegerField(default=0)
    sent_messages = models.IntegerField(default=0)
    delivered_messages = models.IntegerField(default=0)
    failed_messages = models.IntegerField(default=0)
    pending_messages = models.IntegerField(default=0)

    # Progress tracking
    current_batch = models.IntegerField(default=0)
    last_message_sent_at = models.DateTimeField(null=True, blank=True)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.status})"

    def get_progress_percentage(self):
        """Calculate campaign progress percentage"""
        if self.total_messages == 0:
            return 0
        return int((self.sent_messages / self.total_messages) * 100)

    def can_pause(self):
        return self.status in ['running', 'scheduled']

    def can_resume(self):
        return self.status == 'paused'

    def can_cancel(self):
        return self.status in ['draft', 'scheduled', 'running', 'paused']


class Message(models.Model):
    """Individual WhatsApp messages sent"""
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('sending', 'Sending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(MessageCampaign, on_delete=models.CASCADE, related_name='messages')
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE)
    content = models.TextField()  # Final personalized content
    attachment_url = models.URLField(blank=True, null=True)
    attachment_file = models.FileField(upload_to='message_attachments/', blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    whatsapp_message_id = models.CharField(max_length=100, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)

    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    failed_at = models.DateTimeField(null=True, blank=True)

    retry_count = models.IntegerField(default=0)
    max_retries = models.IntegerField(default=3)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Message to {self.contact.phone_number} ({self.status})"

    def can_retry(self):
        return self.status == 'failed' and self.retry_count < self.max_retries

    class Meta:
        ordering = ['-created_at']


class MessageLog(models.Model):
    """Detailed logs for message sending operations"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='logs')
    action = models.CharField(max_length=50)  # 'send_attempt', 'status_update', 'error'
    status = models.CharField(max_length=20)
    details = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} - {self.status}"

    class Meta:
        ordering = ['-created_at']


class CampaignReport(models.Model):
    """Generated reports for campaigns"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(MessageCampaign, on_delete=models.CASCADE)
    report_type = models.CharField(max_length=20, choices=[
        ('summary', 'Summary Report'),
        ('detailed', 'Detailed Report'),
        ('failed', 'Failed Messages Report'),
    ])
    file = models.FileField(upload_to='campaign_reports/')
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.campaign.name} - {self.report_type}"

    def get_file_name(self):
        return os.path.basename(self.file.name) if self.file else None


class Unsubscriber(models.Model):
    """List of users who have unsubscribed from messaging"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number = models.CharField(max_length=20, unique=True)
    reason = models.TextField(blank=True, help_text="Reason for unsubscribing")
    unsubscribed_at = models.DateTimeField(auto_now_add=True)
    source = models.CharField(max_length=50, blank=True, help_text="How they unsubscribed (e.g., reply, web)")

    def __str__(self):
        return f"Unsubscribed: {self.phone_number}"

    class Meta:
        ordering = ['-unsubscribed_at']