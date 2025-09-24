from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class AIAgent(models.Model):
    """
    AI Agent configuration for different purposes
    """
    AGENT_TYPES = [
        ('message_redrafter', 'Message Redrafter'),
        ('reply_analyzer', 'Reply Analyzer'),
        ('chatbot', 'Chatbot'),
        ('content_generator', 'Content Generator'),
        ('sentiment_analyzer', 'Sentiment Analyzer'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Name of the AI agent")
    agent_type = models.CharField(max_length=20, choices=AGENT_TYPES, help_text="Type of AI agent")
    description = models.TextField(blank=True, help_text="Description of the agent's purpose")

    # AI Configuration
    model_name = models.CharField(
        max_length=100,
        default='gpt-3.5-turbo',
        help_text="AI model to use (e.g., gpt-3.5-turbo, gpt-4)"
    )
    temperature = models.FloatField(
        default=0.7,
        validators=[MinValueValidator(0.0), MaxValueValidator(2.0)],
        help_text="Creativity level (0.0 = deterministic, 2.0 = very creative)"
    )
    max_tokens = models.IntegerField(
        default=1000,
        validators=[MinValueValidator(1), MaxValueValidator(4000)],
        help_text="Maximum tokens in response"
    )

    # System Prompt
    system_prompt = models.TextField(
        help_text="System prompt that defines the agent's behavior and personality"
    )

    # Status and Settings
    is_active = models.BooleanField(default=True, help_text="Whether this agent is active")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_agents', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'AI Agent'
        verbose_name_plural = 'AI Agents'

    def __str__(self):
        return f"{self.name} ({self.get_agent_type_display()})"


class AIConversation(models.Model):
    """
    Conversation history with AI agents
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    agent = models.ForeignKey(AIAgent, on_delete=models.CASCADE, related_name='conversations')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_conversations', null=True, blank=True)

    # Conversation Context
    session_id = models.CharField(max_length=100, help_text="Unique session identifier")
    context_data = models.JSONField(
        default=dict,
        help_text="Additional context data for the conversation"
    )

    # Message History
    messages = models.JSONField(
        default=list,
        help_text="List of messages in the conversation"
    )

    # Metadata
    message_count = models.IntegerField(default=0, help_text="Number of messages in conversation")
    last_message_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-last_message_at']
        unique_together = ['agent', 'session_id']
        verbose_name = 'AI Conversation'
        verbose_name_plural = 'AI Conversations'

    def __str__(self):
        return f"Conversation with {self.agent.name} - {self.session_id}"

    def add_message(self, role: str, content: str, metadata: dict = None):
        """Add a message to the conversation"""
        message = {
            'role': role,
            'content': content,
            'timestamp': self.last_message_at.isoformat(),
            'metadata': metadata or {}
        }
        self.messages.append(message)
        self.message_count += 1
        self.save(update_fields=['messages', 'message_count', 'last_message_at'])


class AIMessageTemplate(models.Model):
    """
    Pre-defined message templates for AI processing
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, help_text="Template name")
    template_type = models.CharField(
        max_length=50,
        choices=[
            ('greeting', 'Greeting'),
            ('follow_up', 'Follow Up'),
            ('complaint_response', 'Complaint Response'),
            ('confirmation', 'Confirmation'),
            ('promotion', 'Promotion'),
            ('custom', 'Custom'),
        ],
        help_text="Type of message template"
    )

    # Template Content
    content = models.TextField(help_text="Template content with placeholders")
    placeholders = models.JSONField(
        default=list,
        help_text="List of placeholder variables (e.g., ['customer_name', 'product_name'])"
    )

    # AI Enhancement
    use_ai_enhancement = models.BooleanField(
        default=False,
        help_text="Whether to use AI to enhance this template"
    )
    enhancement_prompt = models.TextField(
        blank=True,
        help_text="Prompt for AI to enhance the template"
    )

    # Usage Tracking
    usage_count = models.IntegerField(default=0, help_text="How many times this template has been used")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_templates')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-usage_count', 'name']
        verbose_name = 'AI Message Template'
        verbose_name_plural = 'AI Message Templates'

    def __str__(self):
        return f"{self.name} ({self.template_type})"

    def increment_usage(self):
        """Increment usage count"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])


class AISentimentAnalysis(models.Model):
    """
    Sentiment analysis results for messages
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Related Message
    message_content = models.TextField(help_text="Original message content")
    message_id = models.CharField(
        max_length=100,
        blank=True,
        help_text="ID of the related message (if applicable)"
    )

    # Analysis Results
    sentiment = models.CharField(
        max_length=20,
        choices=[
            ('positive', 'Positive'),
            ('negative', 'Negative'),
            ('neutral', 'Neutral'),
            ('mixed', 'Mixed'),
        ],
        help_text="Overall sentiment"
    )
    confidence_score = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Confidence score of the analysis (0.0 to 1.0)"
    )

    # Detailed Scores
    positive_score = models.FloatField(default=0.0, help_text="Positive sentiment score")
    negative_score = models.FloatField(default=0.0, help_text="Negative sentiment score")
    neutral_score = models.FloatField(default=0.0, help_text="Neutral sentiment score")

    # Keywords and Entities
    keywords = models.JSONField(default=list, help_text="Key words/phrases identified")
    entities = models.JSONField(default=list, help_text="Named entities identified")

    # Metadata
    analyzed_by = models.ForeignKey(AIAgent, on_delete=models.SET_NULL, null=True, related_name='sentiment_analyses')
    analyzed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-analyzed_at']
        verbose_name = 'AI Sentiment Analysis'
        verbose_name_plural = 'AI Sentiment Analyses'

    def __str__(self):
        return f"Sentiment: {self.sentiment} ({self.confidence_score:.2f})"


class AIContentGeneration(models.Model):
    """
    AI-generated content for various purposes
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Generation Details
    content_type = models.CharField(
        max_length=50,
        choices=[
            ('message', 'Message'),
            ('email', 'Email'),
            ('social_post', 'Social Media Post'),
            ('ad_copy', 'Advertisement Copy'),
            ('blog_post', 'Blog Post'),
            ('description', 'Product/Service Description'),
        ],
        help_text="Type of content generated"
    )
    prompt = models.TextField(help_text="Prompt used to generate content")
    generated_content = models.TextField(help_text="AI-generated content")

    # Quality and Usage
    quality_score = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Quality score of generated content (0.0 to 1.0)"
    )
    is_used = models.BooleanField(default=False, help_text="Whether this content was used")
    usage_count = models.IntegerField(default=0, help_text="How many times this content was used")

    # Related Objects
    related_message_template = models.ForeignKey(
        AIMessageTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='generated_content'
    )

    # Metadata
    generated_by = models.ForeignKey(AIAgent, on_delete=models.CASCADE, related_name='generated_content')
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-generated_at']
        verbose_name = 'AI Content Generation'
        verbose_name_plural = 'AI Content Generations'

    def __str__(self):
        return f"{self.content_type} - {self.generated_at.strftime('%Y-%m-%d %H:%M')}"

    def mark_as_used(self):
        """Mark content as used and increment usage count"""
        self.is_used = True
        self.usage_count += 1
        self.save(update_fields=['is_used', 'usage_count'])


class AIProcessingLog(models.Model):
    """
    Log of AI processing activities for monitoring and debugging
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Processing Details
    agent = models.ForeignKey(AIAgent, on_delete=models.CASCADE, related_name='processing_logs', null=True, blank=True)
    operation_type = models.CharField(
        max_length=50,
        choices=[
            ('message_redraft', 'Message Redraft'),
            ('reply_analysis', 'Reply Analysis'),
            ('chatbot_response', 'Chatbot Response'),
            ('content_generation', 'Content Generation'),
            ('sentiment_analysis', 'Sentiment Analysis'),
            ('template_enhancement', 'Template Enhancement'),
        ],
        help_text="Type of AI operation performed"
    )

    # Input/Output
    input_data = models.JSONField(help_text="Input data for the AI operation")
    output_data = models.JSONField(null=True, blank=True, help_text="Output data from the AI operation")

    # Performance Metrics
    processing_time = models.FloatField(help_text="Time taken to process (in seconds)")
    tokens_used = models.IntegerField(null=True, blank=True, help_text="Number of tokens used")
    cost_estimate = models.DecimalField(
        max_digits=10,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Estimated cost of the operation"
    )

    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('success', 'Success'),
            ('error', 'Error'),
            ('timeout', 'Timeout'),
            ('rate_limited', 'Rate Limited'),
        ],
        default='success',
        help_text="Status of the AI operation"
    )
    error_message = models.TextField(blank=True, help_text="Error message if operation failed")

    # Metadata
    processed_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ai_processing_logs'
    )

    class Meta:
        ordering = ['-processed_at']
        verbose_name = 'AI Processing Log'
        verbose_name_plural = 'AI Processing Logs'

    def __str__(self):
        return f"{self.operation_type} - {self.status} ({self.processed_at.strftime('%Y-%m-%d %H:%M')})"