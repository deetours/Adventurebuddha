from django.db import models
from django.contrib.auth.models import User

class SupportAgent(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=100)  # e.g., 'trips', 'bookings', 'payments'
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.specialization}"

class ChatSession(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    agent = models.ForeignKey(SupportAgent, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Chat {self.session_id} - {self.user.username}"

class ChatMessage(models.Model):
    MESSAGE_TYPE_CHOICES = [
        ('user', 'User'),
        ('agent', 'Agent'),
        ('system', 'System'),
    ]
    
    id = models.AutoField(primary_key=True)
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.message_type}: {self.content[:50]}..."

class AgentKnowledgeBase(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.CharField(max_length=100)  # e.g., 'faq', 'policy', 'procedure'
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title