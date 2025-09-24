from django.contrib import admin
from .models import (
    AIAgent, AIConversation, AIMessageTemplate, AISentimentAnalysis,
    AIContentGeneration, AIProcessingLog
)


@admin.register(AIAgent)
class AIAgentAdmin(admin.ModelAdmin):
    list_display = ['name', 'agent_type', 'model_name', 'is_active', 'created_by', 'created_at']
    list_filter = ['agent_type', 'is_active', 'model_name', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'agent_type', 'description')
        }),
        ('AI Configuration', {
            'fields': ('model_name', 'temperature', 'max_tokens', 'system_prompt')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )


@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display = ['agent', 'user', 'session_id', 'message_count', 'last_message_at']
    list_filter = ['agent', 'created_at', 'last_message_at']
    search_fields = ['session_id', 'user__username']
    readonly_fields = ['id', 'created_at', 'last_message_at']


@admin.register(AIMessageTemplate)
class AIMessageTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'template_type', 'usage_count', 'created_by', 'created_at']
    list_filter = ['template_type', 'use_ai_enhancement', 'created_at']
    search_fields = ['name', 'content']
    readonly_fields = ['id', 'created_at', 'updated_at', 'usage_count']


@admin.register(AISentimentAnalysis)
class AISentimentAnalysisAdmin(admin.ModelAdmin):
    list_display = ['sentiment', 'confidence_score', 'analyzed_by', 'analyzed_at']
    list_filter = ['sentiment', 'analyzed_by', 'analyzed_at']
    search_fields = ['message_content']
    readonly_fields = ['id', 'analyzed_at']


@admin.register(AIContentGeneration)
class AIContentGenerationAdmin(admin.ModelAdmin):
    list_display = ['content_type', 'is_used', 'usage_count', 'generated_by', 'generated_at']
    list_filter = ['content_type', 'is_used', 'generated_at']
    search_fields = ['prompt', 'generated_content']
    readonly_fields = ['id', 'generated_at', 'usage_count']


@admin.register(AIProcessingLog)
class AIProcessingLogAdmin(admin.ModelAdmin):
    list_display = ['agent', 'operation_type', 'status', 'processing_time', 'processed_at', 'user']
    list_filter = ['operation_type', 'status', 'processed_at', 'agent']
    search_fields = ['user__username', 'error_message']
    readonly_fields = ['id', 'processed_at']