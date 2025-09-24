from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'agents', views.AIAgentViewSet, basename='ai-agent')
router.register(r'conversations', views.AIConversationViewSet, basename='ai-conversation')
router.register(r'templates', views.AIMessageTemplateViewSet, basename='ai-template')
router.register(r'sentiment-analysis', views.AISentimentAnalysisViewSet, basename='sentiment-analysis')
router.register(r'content-generation', views.AIContentGenerationViewSet, basename='content-generation')
router.register(r'processing-logs', views.AIProcessingLogViewSet, basename='processing-log')

# URL patterns
urlpatterns = [
    # ViewSet URLs
    path('', include(router.urls)),

    # AI Operation URLs
    path('chat/', views.ai_chat, name='ai-chat'),
    path('redraft-message/', views.ai_redraft_message, name='ai-redraft-message'),
    path('analyze-sentiment/', views.ai_analyze_sentiment, name='ai-analyze-sentiment'),
    path('generate-content/', views.ai_generate_content, name='ai-generate-content'),
    path('bulk-sentiment-analysis/', views.ai_bulk_sentiment_analysis, name='ai-bulk-sentiment'),

    # Analytics URLs
    path('stats/', views.ai_agent_stats, name='ai-agent-stats'),
]