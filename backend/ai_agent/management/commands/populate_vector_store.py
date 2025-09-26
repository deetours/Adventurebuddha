from django.core.management.base import BaseCommand
from ai_agent.services import RAGService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Populate the vector store with trip data for RAG system'

    def add_arguments(self, parser):
        parser.add_argument(
            '--source-type',
            type=str,
            choices=['trip', 'all'],
            default='all',
            help='Type of data to populate (trip or all)'
        )
        parser.add_argument(
            '--clear-existing',
            action='store_true',
            help='Clear existing vector documents before populating'
        )

    def handle(self, *args, **options):
        source_type = options['source_type']
        clear_existing = options['clear_existing']

        self.stdout.write(
            self.style.SUCCESS(f'Starting vector store population for source type: {source_type}')
        )

        if clear_existing:
            self.stdout.write('Clearing existing vector documents...')
            from ai_agent.models import VectorDocument
            deleted_count = VectorDocument.objects.all().delete()[0]
            self.stdout.write(
                self.style.WARNING(f'Deleted {deleted_count} existing vector documents')
            )

        try:
            rag_service = RAGService()
            result = rag_service.populate_vector_store(source_type=source_type)

            self.stdout.write(
                self.style.SUCCESS(
                    f'Vector store population completed:\n'
                    f'  Total items processed: {result.get("total_trips", result.get("total_items", 0))}\n'
                    f'  Successfully indexed: {result["success_count"]}\n'
                    f'  Errors: {result["error_count"]}\n'
                    f'  Message: {result["message"]}'
                )
            )

        except Exception as e:
            logger.error(f'Error populating vector store: {str(e)}')
            self.stdout.write(
                self.style.ERROR(f'Failed to populate vector store: {str(e)}')
            )
            return

        self.stdout.write(
            self.style.SUCCESS('Vector store population command completed successfully')
        )