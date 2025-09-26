import os
import logging
import time
import uuid
import numpy as np
from typing import Dict, Any, Optional, List
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from sklearn.metrics.pairwise import cosine_similarity
import json

from .models import (
    AIAgent, AIConversation, AIMessageTemplate, AISentimentAnalysis,
    AIContentGeneration, AIProcessingLog, VectorDocument, RAGQuery
)

logger = logging.getLogger(__name__)

logger = logging.getLogger(__name__)


class AIService:
    """
    AI Service using LangChain and OpenRouter API for various AI operations
    """

    def __init__(self):
        self.api_key = getattr(settings, 'OPENROUTER_API_KEY', os.getenv('OPENROUTER_API_KEY'))
        self.base_url = getattr(settings, 'OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')

        if not self.api_key:
            logger.warning("OpenRouter API key not found. AI features will not work.")

        # Initialize the language model
        self.llm = self._initialize_llm()

    def _initialize_llm(self, model_name: str = "xai/grok-beta", temperature: float = 0.7):
        """Initialize the language model"""
        if not self.api_key:
            return None

        try:
            llm = ChatOpenAI(
                model=model_name,
                temperature=temperature,
                api_key=self.api_key,
                base_url=self.base_url,
                max_tokens=2000,
            )
            return llm
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {str(e)}")
            return None

    def _log_processing(
        self,
        agent: Optional[AIAgent],
        operation_type: str,
        input_data: Dict[str, Any],
        output_data: Optional[Dict[str, Any]] = None,
        processing_time: float = 0,
        status: str = 'success',
        error_message: str = '',
        user=None,
        tokens_used: Optional[int] = None,
        cost_estimate: Optional[float] = None
    ):
        """Log AI processing activity"""
        try:
            AIProcessingLog.objects.create(
                agent=agent,
                operation_type=operation_type,
                input_data=input_data,
                output_data=output_data,
                processing_time=processing_time,
                tokens_used=tokens_used,
                cost_estimate=cost_estimate,
                status=status,
                error_message=error_message,
                user=user
            )
        except Exception as e:
            logger.error(f"Failed to log AI processing: {str(e)}")

    def chat_with_agent(
        self,
        agent: Optional[AIAgent] = None,
        agent_id: Optional[str] = None,
        message: str = "",
        session_id: Optional[str] = None,
        context_data: Dict[str, Any] = None,
        user=None
    ) -> Dict[str, Any]:
        """
        Chat with an AI agent, maintaining conversation history
        """
        start_time = time.time()

        try:
            # Get or create agent
            if agent_id:
                agent = get_object_or_404(AIAgent, id=agent_id, is_active=True)
            elif not agent:
                # Use default chatbot agent or create one
                agent = self._get_or_create_default_agent()

            # Get or create conversation
            if session_id:
                conversation, created = AIConversation.objects.get_or_create(
                    agent=agent,
                    user=user,
                    session_id=session_id,
                    defaults={'context_data': context_data or {}}
                )
            else:
                session_id = str(uuid.uuid4())
                conversation = AIConversation.objects.create(
                    agent=agent,
                    user=user,
                    session_id=session_id,
                    context_data=context_data or {}
                )

            # Prepare messages for LangChain
            messages = [SystemMessage(content=agent.system_prompt)]

            # Add conversation history
            for msg in conversation.messages[-10:]:  # Last 10 messages for context
                if msg['role'] == 'user':
                    messages.append(HumanMessage(content=msg['content']))
                elif msg['role'] == 'assistant':
                    messages.append(AIMessage(content=msg['content']))

            # Add current message
            messages.append(HumanMessage(content=message))

            # Get response from AI
            if not self.llm:
                raise Exception("AI service not available - API key not configured")

            # Update LLM with agent settings
            self.llm.model_name = agent.model_name
            self.llm.temperature = agent.temperature
            self.llm.max_tokens = agent.max_tokens

            response = self.llm.invoke(messages)
            ai_response = response.content

            # Add messages to conversation
            conversation.add_message('user', message)
            conversation.add_message('assistant', ai_response)

            processing_time = time.time() - start_time

            # Log processing
            self._log_processing(
                agent=agent,
                operation_type='chatbot_response',
                input_data={'message': message, 'session_id': session_id},
                output_data={'response': ai_response},
                processing_time=processing_time,
                user=user
            )

            return {
                'response': ai_response,
                'session_id': session_id,
                'message_count': conversation.message_count,
                'processing_time': processing_time
            }

        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = str(e)

            self._log_processing(
                agent=agent,
                operation_type='chatbot_response',
                input_data={'message': message, 'session_id': session_id},
                processing_time=processing_time,
                status='error',
                error_message=error_msg,
                user=user
            )

            raise Exception(f"AI chat failed: {error_msg}")

    def _get_or_create_default_agent(self) -> AIAgent:
        """Get or create a default chatbot agent"""
        agent, created = AIAgent.objects.get_or_create(
            name="Default Chatbot",
            agent_type="chatbot",
            defaults={
                'description': "Default AI chatbot for general conversations",
                'system_prompt': """You are a helpful AI assistant. You provide clear, accurate, and helpful responses.
                Be friendly, professional, and concise in your answers. If you don't know something, admit it rather than making up information.""",
                'model_name': 'xai/grok-beta',
                'temperature': 0.7,
                'max_tokens': 1000,
                'is_active': True
            }
        )
        return agent

    def redraft_message(
        self,
        original_message: str,
        context: Optional[str] = None,
        tone: str = "professional",
        max_length: int = 500,
        user=None
    ) -> Dict[str, Any]:
        """
        Redraft a message using AI to improve clarity, tone, and effectiveness
        """
        start_time = time.time()

        try:
            agent = self._get_or_create_redraft_agent()

            prompt = f"""
            Please redraft the following message to improve its clarity, effectiveness, and tone.

            Original Message: {original_message}

            Context: {context or "General business communication"}

            Desired Tone: {tone}

            Maximum Length: {max_length} characters

            Please provide:
            1. The redrafted message
            2. A brief list of improvements made

            Make the message more engaging and professional while maintaining its original intent.
            """

            messages = [
                SystemMessage(content=agent.system_prompt),
                HumanMessage(content=prompt)
            ]

            if not self.llm:
                raise Exception("AI service not available")

            self.llm.model_name = agent.model_name
            self.llm.temperature = agent.temperature
            self.llm.max_tokens = min(agent.max_tokens, 1500)

            response = self.llm.invoke(messages)
            ai_response = response.content

            # Parse the response to extract redrafted message and improvements
            lines = ai_response.strip().split('\n')
            redrafted_message = ""
            improvements = []

            parsing_improvements = False
            for line in lines:
                line = line.strip()
                if line.lower().startswith(('redrafted', 'improved', 'revised')):
                    continue
                elif line.lower().startswith(('improvements', 'changes', 'what was improved')):
                    parsing_improvements = True
                    continue
                elif parsing_improvements and line.startswith(('- ', '* ', '• ')):
                    improvements.append(line[2:].strip())
                elif not parsing_improvements and line:
                    if not redrafted_message:
                        redrafted_message = line
                    else:
                        redrafted_message += " " + line

            # Fallback parsing if structured parsing fails
            if not redrafted_message:
                redrafted_message = ai_response.split('\n')[0].strip()

            if not improvements:
                improvements = ["Improved clarity and tone", "Enhanced professionalism"]

            processing_time = time.time() - start_time

            # Log processing
            self._log_processing(
                agent=agent,
                operation_type='message_redraft',
                input_data={
                    'original_message': original_message,
                    'context': context,
                    'tone': tone,
                    'max_length': max_length
                },
                output_data={
                    'redrafted_message': redrafted_message,
                    'improvements': improvements
                },
                processing_time=processing_time,
                user=user
            )

            return {
                'original_message': original_message,
                'redrafted_message': redrafted_message,
                'improvements': improvements,
                'tone_used': tone,
                'processing_time': processing_time
            }

        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = str(e)

            self._log_processing(
                agent=None,
                operation_type='message_redraft',
                input_data={
                    'original_message': original_message,
                    'context': context,
                    'tone': tone
                },
                processing_time=processing_time,
                status='error',
                error_message=error_msg,
                user=user
            )

            raise Exception(f"Message redrafting failed: {error_msg}")

    def _get_or_create_redraft_agent(self) -> AIAgent:
        """Get or create a message redrafting agent"""
        agent, created = AIAgent.objects.get_or_create(
            name="Message Redrafter",
            agent_type="message_redrafter",
            defaults={
                'description': "Specialized AI for improving and redrafting messages",
                'system_prompt': """You are an expert at redrafting messages to make them clearer, more professional, and more effective.
                Focus on improving grammar, tone, clarity, and persuasiveness while maintaining the original intent.
                Always provide the redrafted message first, then list the specific improvements made.""",
                'model_name': 'xai/grok-beta',
                'temperature': 0.3,  # Lower temperature for more consistent results
                'max_tokens': 1200,
                'is_active': True
            }
        )
        return agent

    def analyze_sentiment(
        self,
        message: str,
        include_keywords: bool = True,
        include_entities: bool = True,
        user=None
    ) -> Dict[str, Any]:
        """
        Analyze sentiment of a message
        """
        start_time = time.time()

        try:
            agent = self._get_or_create_sentiment_agent()

            prompt = f"""
            Analyze the sentiment of the following message. Provide a detailed analysis including:

            Message: {message}

            Please return your analysis in the following format:
            - Sentiment: [positive/negative/neutral/mixed]
            - Confidence: [0.0-1.0]
            - Positive Score: [0.0-1.0]
            - Negative Score: [0.0-1.0]
            - Neutral Score: [0.0-1.0]
            """

            if include_keywords:
                prompt += "- Keywords: [list of key words/phrases]\n"
            if include_entities:
                prompt += "- Entities: [list of named entities]\n"

            messages = [
                SystemMessage(content=agent.system_prompt),
                HumanMessage(content=prompt)
            ]

            if not self.llm:
                raise Exception("AI service not available")

            self.llm.model_name = agent.model_name
            self.llm.temperature = 0.1  # Very low temperature for consistent analysis

            response = self.llm.invoke(messages)
            ai_response = response.content

            # Parse the response
            analysis = self._parse_sentiment_response(ai_response)

            # Save to database
            sentiment_obj = AISentimentAnalysis.objects.create(
                message_content=message,
                sentiment=analysis['sentiment'],
                confidence_score=analysis['confidence_score'],
                positive_score=analysis['positive_score'],
                negative_score=analysis['negative_score'],
                neutral_score=analysis['neutral_score'],
                keywords=analysis.get('keywords', []),
                entities=analysis.get('entities', []),
                analyzed_by=agent
            )

            processing_time = time.time() - start_time

            # Log processing
            self._log_processing(
                agent=agent,
                operation_type='sentiment_analysis',
                input_data={
                    'message': message,
                    'include_keywords': include_keywords,
                    'include_entities': include_entities
                },
                output_data=analysis,
                processing_time=processing_time,
                user=user
            )

            return {
                'id': sentiment_obj.id,
                'sentiment': analysis['sentiment'],
                'confidence_score': analysis['confidence_score'],
                'positive_score': analysis['positive_score'],
                'negative_score': analysis['negative_score'],
                'neutral_score': analysis['neutral_score'],
                'keywords': analysis.get('keywords', []),
                'entities': analysis.get('entities', []),
                'analyzed_at': sentiment_obj.analyzed_at
            }

        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = str(e)

            self._log_processing(
                agent=None,
                operation_type='sentiment_analysis',
                input_data={'message': message},
                processing_time=processing_time,
                status='error',
                error_message=error_msg,
                user=user
            )

            raise Exception(f"Sentiment analysis failed: {error_msg}")

    def _parse_sentiment_response(self, response: str) -> Dict[str, Any]:
        """Parse the sentiment analysis response from AI"""
        analysis = {
            'sentiment': 'neutral',
            'confidence_score': 0.5,
            'positive_score': 0.0,
            'negative_score': 0.0,
            'neutral_score': 1.0,
            'keywords': [],
            'entities': []
        }

        lines = response.strip().split('\n')
        for line in lines:
            line = line.strip()
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip().lower()
                value = value.strip()

                if 'sentiment' in key:
                    analysis['sentiment'] = value.lower()
                elif 'confidence' in key:
                    try:
                        analysis['confidence_score'] = float(value)
                    except:
                        pass
                elif 'positive' in key:
                    try:
                        analysis['positive_score'] = float(value)
                    except:
                        pass
                elif 'negative' in key:
                    try:
                        analysis['negative_score'] = float(value)
                    except:
                        pass
                elif 'neutral' in key:
                    try:
                        analysis['neutral_score'] = float(value)
                    except:
                        pass
                elif 'keywords' in key:
                    analysis['keywords'] = [k.strip() for k in value.split(',') if k.strip()]
                elif 'entities' in key:
                    analysis['entities'] = [e.strip() for e in value.split(',') if e.strip()]

        return analysis

    def _get_or_create_sentiment_agent(self) -> AIAgent:
        """Get or create a sentiment analysis agent"""
        agent, created = AIAgent.objects.get_or_create(
            name="Sentiment Analyzer",
            agent_type="sentiment_analyzer",
            defaults={
                'description': "AI specialized in analyzing message sentiment and emotions",
                'system_prompt': """You are an expert at analyzing the sentiment and emotional tone of messages.
                Provide accurate sentiment analysis with confidence scores and identify key emotional indicators.
                Be precise and consistent in your scoring.""",
                'model_name': 'xai/grok-beta',
                'temperature': 0.1,
                'max_tokens': 800,
                'is_active': True
            }
        )
        return agent

    def generate_content(
        self,
        content_type: str,
        prompt: str,
        context: Dict[str, Any] = None,
        max_length: int = 1000,
        user=None
    ) -> Dict[str, Any]:
        """
        Generate content using AI
        """
        start_time = time.time()

        try:
            agent = self._get_or_create_content_agent()

            context_str = ""
            if context:
                context_str = f"\n\nContext: {context}"

            full_prompt = f"""
            Generate {content_type} content based on the following prompt:

            Prompt: {prompt}
            Content Type: {content_type}
            Maximum Length: {max_length} characters{context_str}

            Please generate high-quality, engaging content that meets the requirements.
            """

            messages = [
                SystemMessage(content=agent.system_prompt),
                HumanMessage(content=full_prompt)
            ]

            if not self.llm:
                raise Exception("AI service not available")

            self.llm.model_name = agent.model_name
            self.llm.temperature = agent.temperature
            self.llm.max_tokens = min(agent.max_tokens, max_length // 4)  # Rough token estimate

            response = self.llm.invoke(messages)
            generated_content = response.content

            # Save to database
            content_obj = AIContentGeneration.objects.create(
                content_type=content_type,
                prompt=prompt,
                generated_content=generated_content,
                generated_by=agent
            )

            processing_time = time.time() - start_time

            # Log processing
            self._log_processing(
                agent=agent,
                operation_type='content_generation',
                input_data={
                    'content_type': content_type,
                    'prompt': prompt,
                    'context': context,
                    'max_length': max_length
                },
                output_data={'generated_content': generated_content},
                processing_time=processing_time,
                user=user
            )

            return {
                'id': content_obj.id,
                'content_type': content_type,
                'generated_content': generated_content,
                'prompt': prompt,
                'generated_at': content_obj.generated_at
            }

        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = str(e)

            self._log_processing(
                agent=None,
                operation_type='content_generation',
                input_data={
                    'content_type': content_type,
                    'prompt': prompt
                },
                processing_time=processing_time,
                status='error',
                error_message=error_msg,
                user=user
            )

            raise Exception(f"Content generation failed: {error_msg}")

    def _get_or_create_content_agent(self) -> AIAgent:
        """Get or create a content generation agent"""
        agent, created = AIAgent.objects.get_or_create(
            name="Content Generator",
            agent_type="content_generator",
            defaults={
                'description': "AI specialized in generating various types of content",
                'system_prompt': """You are a creative and versatile content generator.
                Create high-quality, engaging content for various purposes including messages, emails, social posts, and more.
                Always ensure the content is well-written, appropriate for the context, and meets the specified requirements.""",
                'model_name': 'xai/grok-beta',
                'temperature': 0.8,  # Higher creativity for content generation
                'max_tokens': 1500,
                'is_active': True
            }
        )
        return agent

    def bulk_analyze_sentiment(
        self,
        messages: List[Dict[str, Any]],
        include_keywords: bool = False,
        include_entities: bool = False,
        user=None
    ) -> List[Dict[str, Any]]:
        """
        Analyze sentiment for multiple messages
        """
        results = []

        for message_data in messages:
            try:
                message_content = message_data.get('content', '')
                message_id = message_data.get('id')

                analysis = self.analyze_sentiment(
                    message=message_content,
                    include_keywords=include_keywords,
                    include_entities=include_entities,
                    user=user
                )

                analysis['message_id'] = message_id
                results.append(analysis)

            except Exception as e:
                results.append({
                    'message_id': message_data.get('id'),
                    'error': str(e),
                    'sentiment': 'error'
                })

        return results

    def enhance_template(
        self,
        template: AIMessageTemplate,
        enhancement_type: str,
        custom_instructions: Optional[str] = None,
        user=None
    ) -> Dict[str, Any]:
        """
        Enhance a message template using AI
        """
        start_time = time.time()

        try:
            agent = self._get_or_create_redraft_agent()

            if enhancement_type == 'custom' and custom_instructions:
                enhancement_prompt = custom_instructions
            else:
                enhancement_prompts = {
                    'improve_clarity': "Make the template clearer and easier to understand",
                    'make_more_engaging': "Make the template more engaging and compelling",
                    'add_personalization': "Add personalization elements to the template",
                    'optimize_length': "Optimize the length for better engagement",
                    'enhance_cta': "Enhance the call-to-action in the template"
                }
                enhancement_prompt = enhancement_prompts.get(enhancement_type, "Improve the template")

            prompt = f"""
            Enhance the following message template:

            Original Template: {template.content}

            Enhancement Type: {enhancement_type}
            Enhancement Instructions: {enhancement_prompt}

            Placeholders available: {', '.join(template.placeholders)}

            Please provide:
            1. The enhanced template
            2. A list of specific improvements made

            Maintain all placeholder variables in the enhanced version.
            """

            messages = [
                SystemMessage(content=agent.system_prompt),
                HumanMessage(content=prompt)
            ]

            if not self.llm:
                raise Exception("AI service not available")

            response = self.llm.invoke(messages)
            ai_response = response.content

            # Parse response
            lines = ai_response.strip().split('\n')
            enhanced_content = ""
            improvements = []

            parsing_improvements = False
            for line in lines:
                line = line.strip()
                if line.lower().startswith(('enhanced', 'improved')):
                    continue
                elif line.lower().startswith(('improvements', 'changes')):
                    parsing_improvements = True
                    continue
                elif parsing_improvements and line.startswith(('- ', '* ', '• ')):
                    improvements.append(line[2:].strip())
                elif not parsing_improvements and line:
                    if not enhanced_content:
                        enhanced_content = line
                    else:
                        enhanced_content += " " + line

            if not enhanced_content:
                enhanced_content = ai_response.split('\n')[0].strip()

            if not improvements:
                improvements = [f"Applied {enhancement_type} enhancement"]

            processing_time = time.time() - start_time

            # Log processing
            self._log_processing(
                agent=agent,
                operation_type='template_enhancement',
                input_data={
                    'template_id': str(template.id),
                    'enhancement_type': enhancement_type,
                    'custom_instructions': custom_instructions
                },
                output_data={
                    'enhanced_content': enhanced_content,
                    'improvements': improvements
                },
                processing_time=processing_time,
                user=user
            )

            return {
                'enhanced_content': enhanced_content,
                'improvements': improvements,
                'enhancement_type': enhancement_type
            }

        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = str(e)

            self._log_processing(
                agent=None,
                operation_type='template_enhancement',
                input_data={
                    'template_id': str(template.id),
                    'enhancement_type': enhancement_type
                },
                processing_time=processing_time,
                status='error',
                error_message=error_msg,
                user=user
            )

            raise Exception(f"Template enhancement failed: {error_msg}")


class RAGService:
    """
    Retrieval-Augmented Generation service for trip information
    """

    def __init__(self):
        self.api_key = getattr(settings, 'OPENROUTER_API_KEY', os.getenv('OPENROUTER_API_KEY'))
        self.base_url = getattr(settings, 'OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')

        if not self.api_key:
            logger.warning("OpenRouter API key not found. RAG features will not work.")

        # Initialize embeddings and LLM
        self.embeddings = self._initialize_embeddings()
        self.llm = self._initialize_llm()

    def _initialize_embeddings(self):
        """Initialize embeddings model"""
        if not self.api_key:
            return None

        try:
            # Using OpenAI embeddings via OpenRouter
            embeddings = OpenAIEmbeddings(
                model="text-embedding-ada-002",
                api_key=self.api_key,
                base_url=self.base_url,
            )
            return embeddings
        except Exception as e:
            logger.error(f"Failed to initialize embeddings: {str(e)}")
            return None

    def _initialize_llm(self, model_name: str = "xai/grok-beta", temperature: float = 0.3):
        """Initialize the language model for RAG"""
        if not self.api_key:
            return None

        try:
            llm = ChatOpenAI(
                model=model_name,
                temperature=temperature,
                api_key=self.api_key,
                base_url=self.base_url,
                max_tokens=2000,
            )
            return llm
        except Exception as e:
            logger.error(f"Failed to initialize RAG LLM: {str(e)}")
            return None

    def add_trip_to_vector_store(self, trip_data: Dict[str, Any]) -> bool:
        """
        Add trip information to the vector store
        """
        try:
            trip_id = str(trip_data.get('id', ''))
            title = trip_data.get('title', '')
            description = trip_data.get('description', '')
            overview = trip_data.get('overview', '')
            tags = trip_data.get('tags', [])
            price = trip_data.get('price', 0)
            duration = trip_data.get('duration', 0)
            difficulty = trip_data.get('difficulty', 'easy')
            itinerary = trip_data.get('itinerary', [])

            # Debug logging
            logger.info(f"Processing trip: {title}, tags type: {type(tags)}, itinerary type: {type(itinerary)}")

            # Ensure tags is a list
            if isinstance(tags, str):
                try:
                    import json
                    tags = json.loads(tags)
                    logger.info(f"Parsed tags from string: {tags}")
                except Exception as e:
                    logger.warning(f"Failed to parse tags string: {e}")
                    tags = [tags] if tags else []
            elif not isinstance(tags, list):
                tags = []

            # Ensure itinerary is a list
            if isinstance(itinerary, str):
                try:
                    import json
                    itinerary = json.loads(itinerary)
                    logger.info(f"Parsed itinerary from string: {len(itinerary)} items")
                except Exception as e:
                    logger.warning(f"Failed to parse itinerary string: {e}")
                    itinerary = []
            elif not isinstance(itinerary, list):
                itinerary = []

            # Create comprehensive text content for the trip
            content_parts = [
                f"Trip Title: {title}",
                f"Description: {description}",
                f"Overview: {overview}",
                f"Duration: {duration} days",
                f"Difficulty: {difficulty}",
                f"Price: ₹{price}",
                f"Tags: {', '.join(tags)}",
            ]

            # Add itinerary information
            if itinerary:
                content_parts.append("Itinerary:")
                for day in itinerary:
                    if isinstance(day, dict):
                        day_num = day.get('day', '')
                        day_title = day.get('title', '')
                        day_desc = day.get('description', '')
                        content_parts.append(f"Day {day_num}: {day_title} - {day_desc}")
                    else:
                        content_parts.append(f"Day: {str(day)}")

            full_content = "\n".join(content_parts)

            # Split content into chunks if too long
            chunks = self._split_text_into_chunks(full_content, max_length=1000)

            # Generate embeddings and save
            for i, chunk in enumerate(chunks):
                try:
                    if self.embeddings:
                        embedding = self.embeddings.embed_query(chunk)
                    else:
                        # Fallback: create a simple hash-based embedding
                        embedding = self._create_simple_embedding(chunk)
                except Exception as e:
                    logger.warning(f"Failed to generate embeddings for chunk {i}: {str(e)}")
                    # Fallback: create a simple hash-based embedding
                    embedding = self._create_simple_embedding(chunk)

                # Create metadata dict
                metadata = {
                    'trip_id': trip_id,
                    'title': title,
                    'tags': tags,
                    'price': float(price) if price else 0,
                    'duration': duration,
                    'difficulty': difficulty,
                }

                logger.info(f"Creating VectorDocument with metadata: {metadata}")

                VectorDocument.objects.create(
                    content=chunk,
                    title=f"{title} (Part {i+1})" if len(chunks) > 1 else title,
                    source_type='trip',
                    source_id=trip_id,
                    embedding=embedding,
                    embedding_model='text-embedding-ada-002',
                    metadata=metadata,
                    chunk_index=i,
                    total_chunks=len(chunks),
                    is_active=True
                )

            logger.info(f"Added trip '{title}' to vector store with {len(chunks)} chunks")
            return True

        except Exception as e:
            logger.error(f"Failed to add trip to vector store: {str(e)}")
            logger.error(f"Trip data: {trip_data}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return False

    def _split_text_into_chunks(self, text: str, max_length: int = 1000) -> List[str]:
        """Split text into chunks of maximum length"""
        words = text.split()
        chunks = []
        current_chunk = []

        for word in words:
            if len(' '.join(current_chunk + [word])) <= max_length:
                current_chunk.append(word)
            else:
                if current_chunk:
                    chunks.append(' '.join(current_chunk))
                current_chunk = [word]

        if current_chunk:
            chunks.append(' '.join(current_chunk))

        return chunks if chunks else [text]

    def _create_simple_embedding(self, text: str) -> List[float]:
        """Create a simple embedding for fallback when API is not available"""
        # This is a very basic fallback - in production, you'd want proper embeddings
        import hashlib
        hash_obj = hashlib.md5(text.encode())
        hash_bytes = hash_obj.digest()
        # Convert to list of floats between -1 and 1
        embedding = [((b / 255.0) * 2 - 1) for b in hash_bytes]
        # Pad to typical embedding dimension (1536 for text-embedding-ada-002)
        while len(embedding) < 1536:
            embedding.extend(embedding)
        return embedding[:1536]

    def search_similar_documents(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Search for similar documents in the vector store
        """
        try:
            if not self.embeddings:
                # Fallback search using text similarity
                return self._fallback_text_search(query, top_k)

            # Generate embedding for the query
            query_embedding = self.embeddings.embed_query(query)

            # Get all active documents
            documents = VectorDocument.objects.filter(is_active=True)

            if not documents.exists():
                return []

            # Calculate similarities
            similarities = []
            for doc in documents:
                if doc.embedding:
                    # Convert stored embedding back to numpy array
                    doc_embedding = np.array(doc.embedding)
                    similarity = cosine_similarity(
                        [query_embedding],
                        [doc_embedding]
                    )[0][0]
                    similarities.append({
                        'document': doc,
                        'similarity': float(similarity)
                    })

            # Sort by similarity and return top_k
            similarities.sort(key=lambda x: x['similarity'], reverse=True)
            top_results = similarities[:top_k]

            return [{
                'id': result['document'].id,
                'content': result['document'].content,
                'title': result['document'].title,
                'source_type': result['document'].source_type,
                'source_id': result['document'].source_id,
                'similarity': result['similarity'],
                'metadata': result['document'].metadata
            } for result in top_results]

        except Exception as e:
            logger.error(f"Error searching documents: {str(e)}")
            return []

    def _fallback_text_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Fallback text-based search when embeddings are not available"""
        try:
            documents = VectorDocument.objects.filter(is_active=True)

            results = []
            query_lower = query.lower()

            for doc in documents:
                content_lower = doc.content.lower()
                title_lower = doc.title.lower()

                # Simple text matching score
                score = 0
                query_words = query_lower.split()

                for word in query_words:
                    if word in content_lower:
                        score += 1
                    if word in title_lower:
                        score += 2  # Title matches weigh more

                if score > 0:
                    results.append({
                        'id': doc.id,
                        'content': doc.content,
                        'title': doc.title,
                        'source_type': doc.source_type,
                        'source_id': doc.source_id,
                        'similarity': min(score / len(query_words), 1.0),  # Normalize score
                        'metadata': doc.metadata
                    })

            # Sort by score and return top_k
            results.sort(key=lambda x: x['similarity'], reverse=True)
            return results[:top_k]

        except Exception as e:
            logger.error(f"Error in fallback search: {str(e)}")
            return []

    def generate_rag_response(
        self,
        query: str,
        context_documents: List[Dict[str, Any]],
        session_id: Optional[str] = None,
        user=None
    ) -> Dict[str, Any]:
        """
        Generate a response using RAG with retrieved documents
        """
        start_time = time.time()

        try:
            if not self.llm:
                raise Exception("RAG LLM not available")

            # Prepare context from retrieved documents
            context_parts = []
            for doc in context_documents:
                context_parts.append(f"Title: {doc['title']}")
                context_parts.append(f"Content: {doc['content']}")
                if doc.get('metadata'):
                    metadata_str = ", ".join([f"{k}: {v}" for k, v in doc['metadata'].items()])
                    context_parts.append(f"Metadata: {metadata_str}")
                context_parts.append("---")

            context = "\n".join(context_parts)

            # Create RAG prompt
            system_prompt = """You are a helpful travel assistant for Adventure Buddha, specializing in adventure trips and travel experiences in India.

Use the provided context information to answer the user's question accurately. If the context doesn't contain relevant information, say so politely and offer to help with general travel questions.

Key guidelines:
- Be friendly, informative, and enthusiastic about adventure travel
- Provide specific details from the trip information when available
- Mention prices, durations, and key highlights when relevant
- If recommending trips, explain why they might be suitable
- Always be honest about what information you have available
- Encourage users to contact for more details or bookings

Context information:
{context}
"""

            human_prompt = """User Question: {query}

Please provide a helpful, accurate response based on the available trip information."""

            # Generate response
            messages = [
                SystemMessage(content=system_prompt.format(context=context)),
                HumanMessage(content=human_prompt.format(query=query))
            ]

            response = self.llm.invoke(messages)
            ai_response = response.content

            generation_time = time.time() - start_time

            # Log the RAG query
            rag_query = RAGQuery.objects.create(
                query=query,
                retrieved_documents=[
                    {
                        'id': str(doc['id']),
                        'title': doc['title'],
                        'similarity': doc['similarity']
                    } for doc in context_documents
                ],
                context_used=context[:2000],  # Truncate for storage
                response=ai_response,
                search_time=0,  # We don't track this separately
                generation_time=generation_time,
                total_time=generation_time,
                session_id=session_id or str(uuid.uuid4()),
                user=user
            )

            return {
                'response': ai_response,
                'query_id': str(rag_query.id),
                'context_documents': len(context_documents),
                'generation_time': generation_time
            }

        except Exception as e:
            generation_time = time.time() - start_time
            error_msg = str(e)

            # Log failed query
            RAGQuery.objects.create(
                query=query,
                response="",
                search_time=0,
                generation_time=generation_time,
                total_time=generation_time,
                session_id=session_id or str(uuid.uuid4()),
                user=user
            )

            raise Exception(f"RAG response generation failed: {error_msg}")

    def populate_vector_store(self, source_type: str = 'all') -> Dict[str, Any]:
        """
        Populate the vector store with data based on source type
        """
        if source_type == 'trip' or source_type == 'all':
            return self.populate_trip_vector_store()
        else:
            return {
                'total_items': 0,
                'success_count': 0,
                'error_count': 0,
                'message': f"Unsupported source type: {source_type}"
            }

    def process_query(
        self,
        query: str,
        session_id: Optional[str] = None,
        top_k: int = 5,
        user=None
    ) -> Dict[str, Any]:
        """
        Process a RAG query: retrieve relevant documents and generate response
        """
        start_time = time.time()

        try:
            # Search for relevant documents
            context_documents = self.search_similar_documents(query, top_k=top_k)

            # Generate RAG response
            response_data = self.generate_rag_response(
                query=query,
                context_documents=context_documents,
                session_id=session_id,
                user=user
            )

            total_time = time.time() - start_time

            # Update the query record with total time
            if 'query_id' in response_data:
                try:
                    rag_query = RAGQuery.objects.get(id=response_data['query_id'])
                    rag_query.total_time = total_time
                    rag_query.save()
                except:
                    pass

            return response_data

        except Exception as e:
            total_time = time.time() - start_time
            error_msg = str(e)

            # Log failed query
            RAGQuery.objects.create(
                query=query,
                response="",
                search_time=0,
                generation_time=0,
                total_time=total_time,
                session_id=session_id or str(uuid.uuid4()),
                user=user
            )

            raise Exception(f"RAG query processing failed: {error_msg}")

    def populate_trip_vector_store(self) -> Dict[str, Any]:
        """
        Populate the vector store with all existing trips
        """
        from trips.models import Trip

        try:
            trips = Trip.objects.filter(status='published')
            success_count = 0
            error_count = 0

            for trip in trips:
                trip_data = {
                    'id': trip.id,
                    'title': trip.title,
                    'description': trip.description,
                    'overview': trip.overview,
                    'tags': trip.tags,
                    'price': float(trip.price),
                    'duration': trip.duration,
                    'difficulty': trip.difficulty,
                    'itinerary': trip.itinerary,
                }

                if self.add_trip_to_vector_store(trip_data):
                    success_count += 1
                else:
                    error_count += 1

            return {
                'total_trips': trips.count(),
                'success_count': success_count,
                'error_count': error_count,
                'message': f"Successfully added {success_count} trips to vector store"
            }

        except Exception as e:
            logger.error(f"Failed to populate trip vector store: {str(e)}")
            return {
                'error': str(e),
                'message': 'Failed to populate vector store'
            }