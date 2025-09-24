from django.urls import path
from .views import AgentViewSet

urlpatterns = [
    path('discovery/query/', AgentViewSet.as_view({'post': 'discovery_query'}), name='agent-discovery-query'),
    path('chat/message/', AgentViewSet.as_view({'post': 'chat_message'}), name='agent-chat-message'),
    path('chat/', AgentViewSet.as_view({'post': 'chat'}), name='agent-chat'),
]