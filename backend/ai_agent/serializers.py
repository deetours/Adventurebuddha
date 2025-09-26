from rest_framework import serializers
from django.utils import timezone
from .models import (
    AIAgent, AIConversation, AIMessageTemplate, AISentimentAnalysis,
    AIContentGeneration, AIProcessingLog, VectorDocument, RAGQuery
)


class AIAgentSerializer(serializers.ModelSerializer):
    """Serializer for AI Agent model"""

    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    conversation_count = serializers.SerializerMethodField()
    processing_log_count = serializers.SerializerMethodField()

    class Meta:
        model = AIAgent
        fields = [
            'id', 'name', 'agent_type', 'description',
            'model_name', 'temperature', 'max_tokens',
            'system_prompt', 'is_active',
            'created_by', 'created_by_name',
            'created_at', 'updated_at',
            'conversation_count', 'processing_log_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']

    def get_conversation_count(self, obj):
        return obj.conversations.count()

    def get_processing_log_count(self, obj):
        return obj.processing_logs.count()

    def validate_temperature(self, value):
        """Validate temperature is within acceptable range"""
        if not 0.0 <= value <= 2.0:
            raise serializers.ValidationError("Temperature must be between 0.0 and 2.0")
        return value

    def validate_max_tokens(self, value):
        """Validate max tokens is within acceptable range"""
        if not 1 <= value <= 4000:
            raise serializers.ValidationError("Max tokens must be between 1 and 4000")
        return value


class AIConversationSerializer(serializers.ModelSerializer):
    """Serializer for AI Conversation model"""

    agent_name = serializers.CharField(source='agent.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    last_message_preview = serializers.SerializerMethodField()

    class Meta:
        model = AIConversation
        fields = [
            'id', 'agent', 'agent_name', 'user', 'user_name',
            'session_id', 'context_data', 'messages',
            'message_count', 'last_message_at', 'created_at',
            'last_message_preview'
        ]
        read_only_fields = ['id', 'created_at', 'last_message_at']

    def get_last_message_preview(self, obj):
        """Get preview of the last message"""
        if obj.messages:
            last_message = obj.messages[-1]
            content = last_message.get('content', '')
            return content[:100] + '...' if len(content) > 100 else content
        return None


class AIMessageTemplateSerializer(serializers.ModelSerializer):
    """Serializer for AI Message Template model"""

    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = AIMessageTemplate
        fields = [
            'id', 'name', 'template_type', 'content',
            'placeholders', 'use_ai_enhancement', 'enhancement_prompt',
            'usage_count', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'usage_count']

    def validate_placeholders(self, value):
        """Validate placeholders is a list of strings"""
        if not isinstance(value, list):
            raise serializers.ValidationError("Placeholders must be a list")

        for placeholder in value:
            if not isinstance(placeholder, str):
                raise serializers.ValidationError("All placeholders must be strings")
            if not placeholder.strip():
                raise serializers.ValidationError("Placeholders cannot be empty strings")

        return value


class AISentimentAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for AI Sentiment Analysis model"""

    analyzed_by_name = serializers.CharField(source='analyzed_by.name', read_only=True)

    class Meta:
        model = AISentimentAnalysis
        fields = [
            'id', 'message_content', 'message_id', 'sentiment',
            'confidence_score', 'positive_score', 'negative_score',
            'neutral_score', 'keywords', 'entities',
            'analyzed_by', 'analyzed_by_name', 'analyzed_at'
        ]
        read_only_fields = ['id', 'analyzed_at']


class AIContentGenerationSerializer(serializers.ModelSerializer):
    """Serializer for AI Content Generation model"""

    generated_by_name = serializers.CharField(source='generated_by.name', read_only=True)
    related_template_name = serializers.CharField(
        source='related_message_template.name',
        read_only=True
    )

    class Meta:
        model = AIContentGeneration
        fields = [
            'id', 'content_type', 'prompt', 'generated_content',
            'quality_score', 'is_used', 'usage_count',
            'related_message_template', 'related_template_name',
            'generated_by', 'generated_by_name', 'generated_at'
        ]
        read_only_fields = ['id', 'generated_at', 'usage_count']


class AIProcessingLogSerializer(serializers.ModelSerializer):
    """Serializer for AI Processing Log model"""

    agent_name = serializers.CharField(source='agent.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = AIProcessingLog
        fields = [
            'id', 'agent', 'agent_name', 'operation_type',
            'input_data', 'output_data', 'processing_time',
            'tokens_used', 'cost_estimate', 'status',
            'error_message', 'processed_at', 'user', 'user_name'
        ]
        read_only_fields = ['id', 'processed_at']


# Specialized serializers for specific operations

class AIChatRequestSerializer(serializers.Serializer):
    """Serializer for AI chat requests"""

    message = serializers.CharField(max_length=4000, help_text="User message to send to AI")
    session_id = serializers.CharField(
        max_length=100,
        required=False,
        help_text="Conversation session ID (optional, will be generated if not provided)"
    )
    context_data = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Additional context data for the conversation"
    )

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message cannot be empty")
        return value.strip()


class AIChatResponseSerializer(serializers.Serializer):
    """Serializer for AI chat responses"""

    response = serializers.CharField(help_text="AI response message")
    session_id = serializers.CharField(help_text="Conversation session ID")
    message_count = serializers.IntegerField(help_text="Total messages in conversation")
    processing_time = serializers.FloatField(help_text="Time taken to process request")


class AIMessageRedraftSerializer(serializers.Serializer):
    """Serializer for message redrafting requests"""

    original_message = serializers.CharField(
        max_length=2000,
        help_text="Original message to redraft"
    )
    context = serializers.CharField(
        max_length=500,
        required=False,
        help_text="Context about the message (e.g., recipient, purpose)"
    )
    tone = serializers.ChoiceField(
        choices=[
            ('professional', 'Professional'),
            ('friendly', 'Friendly'),
            ('formal', 'Formal'),
            ('casual', 'Casual'),
            ('persuasive', 'Persuasive'),
            ('urgent', 'Urgent'),
        ],
        required=False,
        default='professional',
        help_text="Desired tone for the redrafted message"
    )
    max_length = serializers.IntegerField(
        required=False,
        default=500,
        min_value=50,
        max_value=2000,
        help_text="Maximum length of redrafted message"
    )


class AIMessageRedraftResponseSerializer(serializers.Serializer):
    """Serializer for message redrafting responses"""

    original_message = serializers.CharField()
    redrafted_message = serializers.CharField()
    improvements = serializers.ListField(
        child=serializers.CharField(),
        help_text="List of improvements made"
    )
    tone_used = serializers.CharField()
    processing_time = serializers.FloatField()


class AISentimentRequestSerializer(serializers.Serializer):
    """Serializer for sentiment analysis requests"""

    message = serializers.CharField(
        max_length=5000,
        help_text="Message to analyze for sentiment"
    )
    include_keywords = serializers.BooleanField(
        default=True,
        help_text="Whether to extract keywords"
    )
    include_entities = serializers.BooleanField(
        default=True,
        help_text="Whether to extract named entities"
    )


class AIContentGenerationRequestSerializer(serializers.Serializer):
    """Serializer for content generation requests"""

    content_type = serializers.ChoiceField(
        choices=[
            ('message', 'Message'),
            ('email', 'Email'),
            ('social_post', 'Social Media Post'),
            ('ad_copy', 'Advertisement Copy'),
            ('blog_post', 'Blog Post'),
            ('description', 'Product/Service Description'),
        ],
        help_text="Type of content to generate"
    )
    prompt = serializers.CharField(
        max_length=2000,
        help_text="Prompt describing what content to generate"
    )
    context = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Additional context for content generation"
    )
    max_length = serializers.IntegerField(
        required=False,
        default=1000,
        min_value=100,
        max_value=4000,
        help_text="Maximum length of generated content"
    )


class AITemplateEnhancementSerializer(serializers.Serializer):
    """Serializer for template enhancement requests"""

    template_id = serializers.UUIDField(help_text="ID of the template to enhance")
    enhancement_type = serializers.ChoiceField(
        choices=[
            ('improve_clarity', 'Improve Clarity'),
            ('make_more_engaging', 'Make More Engaging'),
            ('add_personalization', 'Add Personalization'),
            ('optimize_length', 'Optimize Length'),
            ('enhance_cta', 'Enhance Call-to-Action'),
            ('custom', 'Custom Enhancement'),
        ],
        help_text="Type of enhancement to apply"
    )
    custom_instructions = serializers.CharField(
        max_length=1000,
        required=False,
        help_text="Custom instructions for enhancement (required if enhancement_type is 'custom')"
    )

    def validate(self, data):
        if data.get('enhancement_type') == 'custom' and not data.get('custom_instructions'):
            raise serializers.ValidationError({
                'custom_instructions': 'Custom instructions are required when enhancement_type is "custom"'
            })
        return data


class BulkAISentimentSerializer(serializers.Serializer):
    """Serializer for bulk sentiment analysis"""

    messages = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of messages to analyze. Each message should have 'content' and optional 'id' fields"
    )
    include_keywords = serializers.BooleanField(default=False)
    include_entities = serializers.BooleanField(default=False)

    def validate_messages(self, value):
        if len(value) > 100:
            raise serializers.ValidationError("Cannot analyze more than 100 messages at once")

        for i, message in enumerate(value):
            if 'content' not in message:
                raise serializers.ValidationError(f"Message {i} must have a 'content' field")
            if not message['content'].strip():
                raise serializers.ValidationError(f"Message {i} content cannot be empty")

        return value


class VectorDocumentSerializer(serializers.ModelSerializer):
    """Serializer for Vector Document model"""

    class Meta:
        model = VectorDocument
        fields = [
            'id', 'content', 'title', 'source_type', 'source_id',
            'source_url', 'embedding_model', 'metadata',
            'chunk_index', 'total_chunks', 'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RAGQuerySerializer(serializers.ModelSerializer):
    """Serializer for RAG Query model"""

    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = RAGQuery
        fields = [
            'id', 'query', 'rewritten_query', 'retrieved_documents',
            'context_used', 'response', 'response_quality',
            'search_time', 'generation_time', 'total_time',
            'user_rating', 'user_feedback', 'session_id',
            'user', 'user_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class RAGQueryRequestSerializer(serializers.Serializer):
    """Serializer for RAG query requests"""

    query = serializers.CharField(required=True, max_length=1000)
    session_id = serializers.CharField(required=False, max_length=100)
    top_k = serializers.IntegerField(required=False, default=5, min_value=1, max_value=20)

    def validate_query(self, value):
        if not value.strip():
            raise serializers.ValidationError("Query cannot be empty")
        return value.strip()


class RAGQueryResponseSerializer(serializers.Serializer):
    """Serializer for RAG query responses"""

    response = serializers.CharField()
    query_id = serializers.CharField()
    context_documents = serializers.IntegerField()
    generation_time = serializers.FloatField()


class VectorStorePopulateSerializer(serializers.Serializer):
    """Serializer for vector store population requests"""

    source_type = serializers.ChoiceField(
        choices=['trip', 'all'],
        default='all'
    )


class VectorStorePopulateResponseSerializer(serializers.Serializer):
    """Serializer for vector store population responses"""

    total_items = serializers.IntegerField()
    success_count = serializers.IntegerField()
    error_count = serializers.IntegerField()
    message = serializers.CharField()