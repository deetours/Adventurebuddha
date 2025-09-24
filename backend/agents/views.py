from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
import uuid
import json
from .models import ChatSession, ChatMessage, SupportAgent
from .serializers import ChatMessageSerializer
from .langchain_agents import chat_with_agent

class AgentViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]  # Allow unauthenticated access for demo

    @action(detail=False, methods=['post'])
    def chat(self, request):
        """Handle chat messages with chain prompting orchestrator"""
        query = request.data.get('query', '')
        context = request.data.get('context', {})
        conversation_history = request.data.get('conversationHistory', [])

        if not query:
            return Response(
                {'error': 'query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Use chain prompting to get response
            result = chat_with_agent(
                query=query,
                context=context,
                conversation_history=conversation_history
            )

            # Create or get chat session
            session_id = context.get('sessionId') or str(uuid.uuid4())

            # For demo purposes, we'll create a session even without authentication
            # In production, you'd want proper user authentication
            session, created = ChatSession.objects.get_or_create(
                session_id=session_id,
                defaults={
                    'user': request.user if request.user.is_authenticated else None,
                    'metadata': json.dumps({
                        'page': context.get('page', 'general'),
                        'agent_type': result['agentType']
                    })
                }
            )

            # Save user message
            user_message = ChatMessage.objects.create(
                session=session,
                message_type='user',
                content=query,
                metadata=json.dumps({
                    'agent_type': result['agentType'],
                    'page': context.get('page', 'general')
                })
            )

            # Save agent response
            agent_message = ChatMessage.objects.create(
                session=session,
                message_type='agent',
                content=result['content'],
                metadata=json.dumps({
                    'agent_type': result['agentType'],
                    'confidence': result['confidence']
                })
            )

            return Response({
                'content': result['content'],
                'agentType': result['agentType'],
                'sessionId': session_id,
                'confidence': result['confidence'],
                'timestamp': agent_message.created_at.isoformat()
            })

        except Exception as e:
            print(f"Chat processing error: {e}")
            return Response(
                {
                    'error': 'Failed to process chat message',
                    'content': "I apologize, but I'm experiencing some technical difficulties. Please try again or contact support.",
                    'agentType': 'error'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def discovery_query(self, request):
        """Handle agent discovery queries - legacy endpoint"""
        return self.chat(request)

    @action(detail=False, methods=['post'])
    def chat_message(self, request):
        """Handle chat messages - legacy endpoint"""
        return self.chat(request)