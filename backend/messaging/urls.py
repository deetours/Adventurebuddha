from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views, api_views

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'message-templates', views.MessageTemplateViewSet)
router.register(r'contact-lists', views.ContactListViewSet)
router.register(r'contacts', views.ContactViewSet)
router.register(r'message-campaigns', views.MessageCampaignViewSet)
router.register(r'messages', views.MessageViewSet)
router.register(r'message-logs', views.MessageLogViewSet)
router.register(r'campaign-reports', views.CampaignReportViewSet)

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    # Additional API endpoints
    path('bulk-message/', views.send_bulk_messages, name='bulk-message'),
    path('upload-contacts/', views.upload_contacts, name='upload-contacts'),
    path('webhook/whatsapp/', views.whatsapp_webhook, name='whatsapp-webhook'),
    path('automated-responses/', views.automated_responses, name='automated-responses'),
    path('personalized-campaign/', views.create_personalized_campaign, name='personalized-campaign'),
    path('ai-insights/', views.get_ai_insights, name='ai-insights'),

    # Custom Messaging API endpoints
    path('send-message/', api_views.send_message, name='send-message'),
    path('send-bulk/', api_views.send_bulk_messages, name='send-bulk'),
    path('validate-phone/', api_views.validate_phone_number, name='validate-phone'),
    path('message/<str:message_id>/status/', api_views.get_message_status, name='message-status'),
    path('account/balance/', api_views.get_account_balance, name='account-balance'),
    path('campaign/<uuid:campaign_id>/messages/', api_views.get_campaign_messages, name='campaign-messages'),
    path('create-campaign-send/', api_views.create_campaign_with_messages, name='create-campaign-send'),
    path('stats/', api_views.get_messaging_stats, name='messaging-stats'),
]