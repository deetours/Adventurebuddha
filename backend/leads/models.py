from django.db import models
from django.utils import timezone

class Lead(models.Model):
    """Model to store lead information from the home page modal"""

    # Basic Information
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)

    # Trip Preferences
    destination = models.CharField(max_length=100, blank=True, null=True)
    travel_date = models.DateField(blank=True, null=True)
    travelers = models.PositiveIntegerField(default=1)
    budget = models.CharField(max_length=50, blank=True, null=True)
    experience_level = models.CharField(max_length=50, blank=True, null=True)

    # Interests (stored as JSON)
    interests = models.JSONField(default=list, blank=True)

    # Lead Status and Tracking
    STATUS_CHOICES = [
        ('new', 'New Lead'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('converted', 'Converted'),
        ('lost', 'Lost'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')

    # Marketing and Analytics
    source = models.CharField(max_length=50, default='home_page_modal')
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    # Follow-up
    follow_up_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['destination']),
        ]

    def __str__(self):
        return f"{self.name} - {self.email} - {self.destination or 'No destination'}"

    def save(self, *args, **kwargs):
        # Set follow-up date for new leads (24 hours from creation)
        if self._state.adding and not self.follow_up_date:
            self.follow_up_date = timezone.now() + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)