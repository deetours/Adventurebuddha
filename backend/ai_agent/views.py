from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from .models import (
    AIAgent, AIConversation, AIMessageTemplate, AISentimentAnalysis,
    AIContentGeneration, AIProcessingLog, VectorDocument, RAGQuery
)
from .serializers import (
    AIAgentSerializer, AIConversationSerializer, AIMessageTemplateSerializer,
    AISentimentAnalysisSerializer, AIContentGenerationSerializer,
    AIProcessingLogSerializer, AIChatRequestSerializer, AIChatResponseSerializer,
    AIMessageRedraftSerializer, AIMessageRedraftResponseSerializer,
    AISentimentRequestSerializer, AIContentGenerationRequestSerializer,
    AITemplateEnhancementSerializer, BulkAISentimentSerializer,
    VectorDocumentSerializer, RAGQuerySerializer, RAGQueryRequestSerializer,
    RAGQueryResponseSerializer, VectorStorePopulateSerializer,
    VectorStorePopulateResponseSerializer
)
from .services import AIService, RAGService
import logging

logger = logging.getLogger(__name__)


class AIAgentViewSet(viewsets.ModelViewSet):
    """ViewSet for AI Agent management"""

    serializer_class = AIAgentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AIAgent.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def test_agent(self, request, pk=None):
        """Test an AI agent with a sample message"""
        agent = self.get_object()
        message = request.data.get('message', 'Hello, this is a test message.')

        try:
            ai_service = AIService()
            start_time = timezone.now()

            response = ai_service.chat_with_agent(
                agent=agent,
                message=message,
                user=request.user
            )

            processing_time = (timezone.now() - start_time).total_seconds()

            return Response({
                'response': response,
                'processing_time': processing_time,
                'agent_name': agent.name
            })

        except Exception as e:
            logger.error(f"Error testing agent {agent.name}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AIConversationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AI Conversation history"""

    serializer_class = AIConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user)

    @action(detail=True, methods=['delete'])
    def clear_history(self, request, pk=None):
        """Clear conversation history"""
        conversation = self.get_object()
        conversation.messages = []
        conversation.message_count = 0
        conversation.save()

        return Response({'message': 'Conversation history cleared'})


class AIMessageTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for AI Message Template management"""

    serializer_class = AIMessageTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AIMessageTemplate.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def enhance_template(self, request, pk=None):
        """Enhance a message template using AI"""
        template = self.get_object()
        serializer = AITemplateEnhancementSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            ai_service = AIService()
            enhanced_content = ai_service.enhance_template(
                template=template,
                enhancement_type=serializer.validated_data['enhancement_type'],
                custom_instructions=serializer.validated_data.get('custom_instructions')
            )

            # Update template with enhanced content
            template.content = enhanced_content['enhanced_content']
            template.save()

            return Response({
                'enhanced_content': enhanced_content['enhanced_content'],
                'improvements': enhanced_content['improvements']
            })

        except Exception as e:
            logger.error(f"Error enhancing template {template.name}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AISentimentAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AI Sentiment Analysis results"""

    serializer_class = AISentimentAnalysisSerializer
    permission_classes = [IsAuthenticated]
    queryset = AISentimentAnalysis.objects.all()


class AIContentGenerationViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AI Content Generation results"""

    serializer_class = AIContentGenerationSerializer
    permission_classes = [IsAuthenticated]
    queryset = AIContentGeneration.objects.all()

    @action(detail=True, methods=['post'])
    def mark_used(self, request, pk=None):
        """Mark generated content as used"""
        content = self.get_object()
        content.mark_as_used()

        return Response({'message': 'Content marked as used'})


class AIProcessingLogViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AI Processing Logs"""

    serializer_class = AIProcessingLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AIProcessingLog.objects.filter(user=self.request.user)


# API Views for AI Operations

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_chat(request):
    """Chat with an AI agent"""
    serializer = AIChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        ai_service = AIService()
        response_data = ai_service.chat_with_agent(
            agent_id=None,  # Use default chatbot agent
            message=serializer.validated_data['message'],
            session_id=serializer.validated_data.get('session_id'),
            context_data=serializer.validated_data.get('context_data', {}),
            user=request.user
        )

        response_serializer = AIChatResponseSerializer(data=response_data)
        if response_serializer.is_valid():
            return Response(response_serializer.validated_data)
        else:
            return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        logger.error(f"Error in AI chat: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_redraft_message(request):
    """Redraft a message using AI"""
    serializer = AIMessageRedraftSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        ai_service = AIService()
        redraft_data = ai_service.redraft_message(
            original_message=serializer.validated_data['original_message'],
            context=serializer.validated_data.get('context'),
            tone=serializer.validated_data.get('tone', 'professional'),
            max_length=serializer.validated_data.get('max_length', 500),
            user=request.user
        )

        response_serializer = AIMessageRedraftResponseSerializer(data=redraft_data)
        if response_serializer.is_valid():
            return Response(response_serializer.validated_data)
        else:
            return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        logger.error(f"Error redrafting message: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_analyze_sentiment(request):
    """Analyze sentiment of a message"""
    serializer = AISentimentRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        ai_service = AIService()
        analysis_data = ai_service.analyze_sentiment(
            message=serializer.validated_data['message'],
            include_keywords=serializer.validated_data.get('include_keywords', True),
            include_entities=serializer.validated_data.get('include_entities', True),
            user=request.user
        )

        return Response(analysis_data)

    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_generate_content(request):
    """Generate content using AI"""
    serializer = AIContentGenerationRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        ai_service = AIService()
        content_data = ai_service.generate_content(
            content_type=serializer.validated_data['content_type'],
            prompt=serializer.validated_data['prompt'],
            context=serializer.validated_data.get('context', {}),
            max_length=serializer.validated_data.get('max_length', 1000),
            user=request.user
        )

        return Response(content_data)

    except Exception as e:
        logger.error(f"Error generating content: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def ai_bulk_sentiment_analysis(request):
    """Analyze sentiment for multiple messages"""
    serializer = BulkAISentimentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        ai_service = AIService()
        results = ai_service.bulk_analyze_sentiment(
            messages=serializer.validated_data['messages'],
            include_keywords=serializer.validated_data.get('include_keywords', False),
            include_entities=serializer.validated_data.get('include_entities', False),
            user=request.user
        )

        return Response({'results': results})

    except Exception as e:
        logger.error(f"Error in bulk sentiment analysis: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ai_agent_stats(request):
    """Get AI usage statistics for the current user"""
    try:
        user = request.user

        # Get counts
        agent_count = AIAgent.objects.filter(created_by=user).count()
        conversation_count = AIConversation.objects.filter(user=user).count()
        template_count = AIMessageTemplate.objects.filter(created_by=user).count()
        processing_count = AIProcessingLog.objects.filter(user=user).count()

        # Get recent activity
        recent_logs = AIProcessingLog.objects.filter(
            user=user
        ).order_by('-processed_at')[:10]

        recent_activity = []
        for log in recent_logs:
            recent_activity.append({
                'operation_type': log.operation_type,
                'status': log.status,
                'processing_time': log.processing_time,
                'processed_at': log.processed_at
            })

        # Get usage by operation type
        usage_stats = {}
        logs = AIProcessingLog.objects.filter(user=user)
        for log in logs:
            op_type = log.operation_type
            if op_type not in usage_stats:
                usage_stats[op_type] = {'count': 0, 'total_time': 0, 'success_rate': 0}
            usage_stats[op_type]['count'] += 1
            usage_stats[op_type]['total_time'] += log.processing_time
            if log.status == 'success':
                usage_stats[op_type]['success_rate'] = (
                    (usage_stats[op_type].get('success_count', 0) + 1) / usage_stats[op_type]['count']
                ) * 100

        return Response({
            'agent_count': agent_count,
            'conversation_count': conversation_count,
            'template_count': template_count,
            'processing_count': processing_count,
            'recent_activity': recent_activity,
            'usage_stats': usage_stats
        })

    except Exception as e:
        logger.error(f"Error getting AI stats: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# RAG (Retrieval-Augmented Generation) Views

class VectorDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Vector Document management"""

    serializer_class = VectorDocumentSerializer
    permission_classes = [IsAuthenticated]
    queryset = VectorDocument.objects.filter(is_active=True)

    def get_queryset(self):
        queryset = super().get_queryset()
        source_type = self.request.query_params.get('source_type')
        if source_type:
            queryset = queryset.filter(source_type=source_type)
        return queryset


class RAGQueryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for RAG Query history"""

    serializer_class = RAGQuerySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return RAGQuery.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def rate_response(self, request, pk=None):
        """Rate a RAG response"""
        rag_query = self.get_object()
        rating = request.data.get('rating')
        feedback = request.data.get('feedback', '')

        if rating is not None:
            try:
                rating = int(rating)
                if not 1 <= rating <= 5:
                    return Response(
                        {'error': 'Rating must be between 1 and 5'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                rag_query.user_rating = rating
                rag_query.user_feedback = feedback
                rag_query.save()

                return Response({'message': 'Rating saved successfully'})

            except (ValueError, TypeError):
                return Response(
                    {'error': 'Invalid rating value'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        return Response(
            {'error': 'Rating is required'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rag_query(request):
    """Process a RAG query for trip information"""
    serializer = RAGQueryRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        rag_service = RAGService()
        response_data = rag_service.process_query(
            query=serializer.validated_data['query'],
            session_id=serializer.validated_data.get('session_id'),
            top_k=serializer.validated_data.get('top_k', 5),
            user=request.user
        )

        response_serializer = RAGQueryResponseSerializer(data=response_data)
        if response_serializer.is_valid():
            return Response(response_serializer.validated_data)
        else:
            return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        logger.error(f"Error processing RAG query: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def populate_vector_store(request):
    """Populate the vector store with trip data"""
    serializer = VectorStorePopulateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        rag_service = RAGService()
        result = rag_service.populate_vector_store(
            source_type=serializer.validated_data.get('source_type', 'all')
        )

        response_serializer = VectorStorePopulateResponseSerializer(data=result)
        if response_serializer.is_valid():
            return Response(response_serializer.validated_data)
        else:
            return Response(response_serializer.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        logger.error(f"Error populating vector store: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def rag_stats(request):
    """Get RAG system statistics"""
    try:
        # Get vector document stats
        total_documents = VectorDocument.objects.filter(is_active=True).count()
        documents_by_type = {}
        for doc in VectorDocument.objects.filter(is_active=True).values('source_type').annotate(count=models.Count('id')):
            documents_by_type[doc['source_type']] = doc['count']

        # Get query stats
        total_queries = RAGQuery.objects.count()
        avg_response_time = RAGQuery.objects.filter(total_time__isnull=False).aggregate(avg_time=models.Avg('total_time'))['avg_time']
        avg_rating = RAGQuery.objects.filter(user_rating__isnull=False).aggregate(avg_rating=models.Avg('user_rating'))['avg_rating']

        # Recent queries
        recent_queries = RAGQuery.objects.order_by('-created_at')[:10]
        recent_query_data = []
        for query in recent_queries:
            recent_query_data.append({
                'id': query.id,
                'query': query.query[:100] + '...' if len(query.query) > 100 else query.query,
                'response_quality': query.response_quality,
                'total_time': query.total_time,
                'created_at': query.created_at
            })

        return Response({
            'total_documents': total_documents,
            'documents_by_type': documents_by_type,
            'total_queries': total_queries,
            'average_response_time': avg_response_time,
            'average_rating': avg_rating,
            'recent_queries': recent_query_data
        })

    except Exception as e:
        logger.error(f"Error getting RAG stats: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )