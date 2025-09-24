import logging
from celery import shared_task
from django.contrib.auth import get_user_model
from .models import AIAgent, AIMessageTemplate
from .services import AIService

logger = logging.getLogger(__name__)
User = get_user_model()


@shared_task(bind=True, max_retries=3)
def process_ai_chat_task(self, agent_id, message, session_id, context_data, user_id):
    """
    Process AI chat in background
    """
    try:
        ai_service = AIService()
        user = User.objects.get(id=user_id) if user_id else None

        result = ai_service.chat_with_agent(
            agent_id=agent_id,
            message=message,
            session_id=session_id,
            context_data=context_data,
            user=user
        )

        logger.info(f"AI chat processed successfully for session {session_id}")
        return result

    except Exception as e:
        logger.error(f"Error processing AI chat: {str(e)}")
        raise self.retry(countdown=60 * (2 ** self.request.retries), exc=e)


@shared_task(bind=True, max_retries=3)
def redraft_message_task(self, original_message, context, tone, max_length, user_id):
    """
    Redraft message using AI in background
    """
    try:
        ai_service = AIService()
        user = User.objects.get(id=user_id) if user_id else None

        result = ai_service.redraft_message(
            original_message=original_message,
            context=context,
            tone=tone,
            max_length=max_length,
            user=user
        )

        logger.info("Message redrafting completed successfully")
        return result

    except Exception as e:
        logger.error(f"Error redrafting message: {str(e)}")
        raise self.retry(countdown=60 * (2 ** self.request.retries), exc=e)


@shared_task(bind=True, max_retries=3)
def analyze_sentiment_task(self, message, include_keywords, include_entities, user_id):
    """
    Analyze sentiment of a message in background
    """
    try:
        ai_service = AIService()
        user = User.objects.get(id=user_id) if user_id else None

        result = ai_service.analyze_sentiment(
            message=message,
            include_keywords=include_keywords,
            include_entities=include_entities,
            user=user
        )

        logger.info("Sentiment analysis completed successfully")
        return result

    except Exception as e:
        logger.error(f"Error analyzing sentiment: {str(e)}")
        raise self.retry(countdown=60 * (2 ** self.request.retries), exc=e)


@shared_task(bind=True, max_retries=3)
def generate_content_task(self, content_type, prompt, context, max_length, user_id):
    """
    Generate content using AI in background
    """
    try:
        ai_service = AIService()
        user = User.objects.get(id=user_id) if user_id else None

        result = ai_service.generate_content(
            content_type=content_type,
            prompt=prompt,
            context=context,
            max_length=max_length,
            user=user
        )

        logger.info(f"Content generation completed for type: {content_type}")
        return result

    except Exception as e:
        logger.error(f"Error generating content: {str(e)}")
        raise self.retry(countdown=60 * (2 ** self.request.retries), exc=e)


@shared_task(bind=True, max_retries=3)
def bulk_sentiment_analysis_task(self, messages, include_keywords, include_entities, user_id):
    """
    Analyze sentiment for multiple messages in background
    """
    try:
        ai_service = AIService()
        user = User.objects.get(id=user_id) if user_id else None

        results = ai_service.bulk_analyze_sentiment(
            messages=messages,
            include_keywords=include_keywords,
            include_entities=include_entities,
            user=user
        )

        logger.info(f"Bulk sentiment analysis completed for {len(messages)} messages")
        return results

    except Exception as e:
        logger.error(f"Error in bulk sentiment analysis: {str(e)}")
        raise self.retry(countdown=60 * (2 ** self.request.retries), exc=e)


@shared_task(bind=True, max_retries=3)
def enhance_template_task(self, template_id, enhancement_type, custom_instructions, user_id):
    """
    Enhance a message template using AI in background
    """
    try:
        ai_service = AIService()
        user = User.objects.get(id=user_id) if user_id else None
        template = AIMessageTemplate.objects.get(id=template_id)

        result = ai_service.enhance_template(
            template=template,
            enhancement_type=enhancement_type,
            custom_instructions=custom_instructions,
            user=user
        )

        # Update the template with enhanced content
        template.content = result['enhanced_content']
        template.save()

        logger.info(f"Template enhancement completed for template: {template.name}")
        return result

    except AIMessageTemplate.DoesNotExist:
        logger.error(f"Template with ID {template_id} not found")
        raise
    except Exception as e:
        logger.error(f"Error enhancing template: {str(e)}")
        raise self.retry(countdown=60 * (2 ** self.request.retries), exc=e)


@shared_task(bind=True)
def cleanup_old_conversations_task(self):
    """
    Clean up old AI conversations (older than 30 days)
    """
    from django.utils import timezone
    from datetime import timedelta

    try:
        cutoff_date = timezone.now() - timedelta(days=30)

        # Delete old conversations
        from .models import AIConversation
        old_conversations = AIConversation.objects.filter(
            last_message_at__lt=cutoff_date
        )

        deleted_count = old_conversations.count()
        old_conversations.delete()

        logger.info(f"Cleaned up {deleted_count} old AI conversations")
        return {'deleted_conversations': deleted_count}

    except Exception as e:
        logger.error(f"Error cleaning up old conversations: {str(e)}")
        raise


@shared_task(bind=True)
def cleanup_old_processing_logs_task(self):
    """
    Clean up old AI processing logs (older than 90 days)
    """
    from django.utils import timezone
    from datetime import timedelta

    try:
        cutoff_date = timezone.now() - timedelta(days=90)

        # Delete old processing logs
        from .models import AIProcessingLog
        old_logs = AIProcessingLog.objects.filter(
            processed_at__lt=cutoff_date
        )

        deleted_count = old_logs.count()
        old_logs.delete()

        logger.info(f"Cleaned up {deleted_count} old AI processing logs")
        return {'deleted_logs': deleted_count}

    except Exception as e:
        logger.error(f"Error cleaning up old processing logs: {str(e)}")
        raise


@shared_task(bind=True)
def generate_ai_usage_report_task(self, user_id=None):
    """
    Generate AI usage report for monitoring
    """
    from django.db.models import Count, Avg, Sum
    from django.utils import timezone
    from datetime import timedelta

    try:
        # Time range for report (last 30 days)
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)

        # Base queryset
        logs_queryset = AIProcessingLog.objects.filter(
            processed_at__range=(start_date, end_date)
        )

        if user_id:
            logs_queryset = logs_queryset.filter(user_id=user_id)

        # Aggregate statistics
        total_operations = logs_queryset.count()
        successful_operations = logs_queryset.filter(status='success').count()
        failed_operations = logs_queryset.filter(status='error').count()

        # Average processing time
        avg_processing_time = logs_queryset.aggregate(
            avg_time=Avg('processing_time')
        )['avg_time'] or 0

        # Operations by type
        operations_by_type = logs_queryset.values('operation_type').annotate(
            count=Count('id'),
            avg_time=Avg('processing_time')
        ).order_by('-count')

        # Cost analysis (if cost_estimate is available)
        total_cost = logs_queryset.aggregate(
            total=Sum('cost_estimate')
        )['total'] or 0

        # Token usage
        total_tokens = logs_queryset.aggregate(
            total=Sum('tokens_used')
        )['total'] or 0

        report = {
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'summary': {
                'total_operations': total_operations,
                'successful_operations': successful_operations,
                'failed_operations': failed_operations,
                'success_rate': (successful_operations / total_operations * 100) if total_operations > 0 else 0,
                'average_processing_time': avg_processing_time
            },
            'operations_by_type': list(operations_by_type),
            'resource_usage': {
                'total_tokens': total_tokens,
                'estimated_cost': total_cost
            },
            'generated_at': end_date.isoformat()
        }

        logger.info(f"AI usage report generated: {total_operations} operations")
        return report

    except Exception as e:
        logger.error(f"Error generating AI usage report: {str(e)}")
        raise