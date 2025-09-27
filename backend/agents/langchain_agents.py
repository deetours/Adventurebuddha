from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain, ConversationChain
from langchain.agents import AgentType, initialize_agent, Tool
from langchain.memory import ConversationBufferWindowMemory
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import OpenAIEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain.tools import tool
from typing import List, Dict, Any, Optional
import os
import json
from datetime import datetime

# Initialize the LLM (only if API key is available)
llm = None
embeddings = None

if os.getenv("OPENROUTER_API_KEY"):
    try:
        llm = ChatOpenAI(
            temperature=0.7,
            model_name="xai/grok-beta",
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            openai_api_base="https://openrouter.ai/api/v1"
        )
        embeddings = OpenAIEmbeddings(
            openai_api_key=os.getenv("OPENROUTER_API_KEY"),
            openai_api_base="https://openrouter.ai/api/v1"
        )
    except Exception as e:
        print(f"Warning: Could not initialize OpenRouter models: {e}")
        llm = None
        embeddings = None
else:
    print("Warning: OPENROUTER_API_KEY not found. AI agents will not be available.")

# Knowledge base for RAG
TRIP_KNOWLEDGE_BASE = """
Adventure Buddha Trip Information:

Ladakh Adventure (7 Days):
- Duration: 7 days, 6 nights
- Price: ₹35,000 per person
- Difficulty: Challenging
- Best time: June to September
- Highlights: Leh Palace, Pangong Lake, Nubra Valley, Tso Moriri
- Inclusions: Transportation, accommodation, meals, guide, permits
- Exclusions: Personal expenses, insurance, tips, airport transfers

Goa Beach Retreat (5 Days):
- Duration: 5 days, 4 nights
- Price: ₹18,000 per person
- Difficulty: Easy
- Best time: November to May
- Highlights: Beach relaxation, water sports, local cuisine
- Inclusions: Beach resort accommodation, breakfast, welcome drinks
- Exclusions: Lunch, dinner, activities, personal expenses

Kashmir Valley Tour (6 Days):
- Duration: 6 days, 5 nights
- Price: ₹28,000 per person
- Difficulty: Moderate
- Best time: April to October
- Highlights: Srinagar, Gulmarg, Pahalgam, houseboat stay
- Inclusions: Transportation, houseboat stay, meals, guide
- Exclusions: Personal expenses, pony rides, shikara rides

Rajasthan Heritage (8 Days):
- Duration: 8 days, 7 nights
- Price: ₹42,000 per person
- Difficulty: Moderate
- Best time: October to March
- Highlights: Jaipur, Jodhpur, Udaipur, Jaisalmer
- Inclusions: Transportation, heritage hotels, meals, guide
- Exclusions: Entry fees, personal expenses, tips

Payment Policies:
- Full payment required for confirmation
- Cancellation: 30 days - 90% refund, 15 days - 50% refund, <15 days - no refund
- Payment methods: Razorpay, UPI, bank transfer
- Group discounts: 5+ people get 10% off
- Early bird discount: Book 60 days in advance for 15% off

Booking Process:
1. Choose your trip and date
2. Select seats (max 12 per Tempo Traveller, 45 per AC Bus)
3. Enter passenger details
4. Make payment
5. Receive confirmation email and WhatsApp updates

Customer Support:
- 24/7 WhatsApp support: +91-9876543210
- Email: support@adventurebuddha.com
- Emergency contact: +91-9876543211
"""

FAQ_KNOWLEDGE_BASE = """
Frequently Asked Questions:

Q: What is the minimum age for trips?
A: Minimum age is 5 years for most trips. Children under 12 get 50% discount.

Q: Are meals included?
A: Breakfast is included in all trips. Lunch and dinner depend on the package.

Q: What should I pack?
A: Comfortable clothes, good walking shoes, sunscreen, hat, water bottle, medications.

Q: Is travel insurance included?
A: No, we recommend purchasing travel insurance separately.

Q: Can I change my booking date?
A: Date changes are allowed up to 15 days before travel with ₹2,000 fee.

Q: What happens if the trip gets cancelled due to weather?
A: Full refund or date change option available.

Q: Are there group discounts?
A: Yes, groups of 5+ get 10% discount, 10+ get 15% discount.

Q: Can I book for just myself?
A: Yes, solo travelers are welcome. We can help find travel companions.

Q: What languages do guides speak?
A: English, Hindi. Local language guides available for some regions.

Q: Is WiFi available during trips?
A: Limited WiFi at hotels. We recommend carrying portable WiFi devices.
"""

# Create vector stores for RAG
def create_knowledge_base(text: str, name: str):
    """Create a FAISS vector store from text"""
    if not embeddings:
        print(f"Warning: Cannot create knowledge base {name} - embeddings not available")
        return None

    try:
        documents = [text]
        text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        docs = text_splitter.create_documents(documents)
        vectorstore = FAISS.from_documents(docs, embeddings)
        return vectorstore
    except Exception as e:
        print(f"Error creating knowledge base {name}: {e}")
        return None

# Initialize knowledge bases
trip_vectorstore = create_knowledge_base(TRIP_KNOWLEDGE_BASE, "trips")
faq_vectorstore = create_knowledge_base(FAQ_KNOWLEDGE_BASE, "faq")

# Tool Functions
@tool("get_trip_info", return_direct=False)
def get_trip_info(trip_id: str = "", query: str = "") -> str:
    """
    Get information about trips using RAG.
    Use this for trip-related queries.
    """
    if trip_vectorstore:
        if query:
            docs = trip_vectorstore.similarity_search(query, k=3)
            return "\n".join([doc.page_content for doc in docs])
        elif trip_id:
            docs = trip_vectorstore.similarity_search(f"trip {trip_id}", k=2)
            return "\n".join([doc.page_content for doc in docs])

    return "I can help you find information about our amazing trips. What specific trip are you interested in?"

@tool("get_faq_answer", return_direct=False)
def get_faq_answer(question: str) -> str:
    """
    Get answers from FAQ knowledge base using RAG.
    Use this for frequently asked questions.
    """
    if faq_vectorstore:
        docs = faq_vectorstore.similarity_search(question, k=2)
        return "\n".join([doc.page_content for doc in docs])

    return "I can help answer common questions about our trips and services."

@tool("get_booking_status", return_direct=False)
def get_booking_status(booking_id: str) -> str:
    """
    Get the status of a booking by ID.
    """
    # In a real implementation, this would query the database
    return f"Booking {booking_id} is confirmed. You'll receive updates via WhatsApp and email."

@tool("get_payment_options", return_direct=False)
def get_payment_options() -> str:
    """
    Get available payment options and policies.
    """
    return """
Payment Options:
💳 Razorpay (Credit/Debit Cards, Net Banking, UPI, Wallets)
📱 UPI QR Code (PhonePe, Google Pay, Paytm)
🏦 Bank Transfer (NEFT/RTGS/IMPS)

Payment Policies:
✅ Full payment required for confirmation
✅ Secure SSL encryption
✅ Instant confirmation via email/WhatsApp
✅ Multiple currency support (INR/USD/EUR)
"""

@tool("get_customer_support", return_direct=False)
def get_customer_support(query: str = "") -> str:
    """
    Provide customer support information and handle support queries.
    """
    return """
🆘 Customer Support:
📞 WhatsApp: +91-9876543210 (24/7)
📧 Email: support@adventurebuddha.com
🚨 Emergency: +91-9876543211

Common Support Topics:
• Booking modifications
• Payment issues
• Trip changes
• Cancellation policies
• Emergency assistance
• Feedback & complaints

How can I help you today?
"""

@tool("check_trip_availability", return_direct=False)
def check_trip_availability(trip_name: str, date: str = "") -> str:
    """
    Check availability for specific trips and dates.
    """
    # Mock availability check
    available_trips = {
        "ladakh": "Available - Next slots: June 15, June 22, July 1",
        "goa": "Available - Next slots: June 20, June 27, July 5",
        "kashmir": "Limited availability - Next slot: June 25",
        "rajasthan": "Available - Next slots: June 18, July 2, July 10"
    }

    trip_key = trip_name.lower()
    for key, availability in available_trips.items():
        if key in trip_key:
            return f"{trip_name.title()}: {availability}"

    return f"I can check availability for {trip_name}. Please provide more details about your preferred dates."

# Agent Creation Functions
def create_trip_guidance_agent():
    """Create RAG-enabled trip guidance agent"""
    if not llm:
        return {
            'agent': None,
            'type': 'trip_guidance',
            'description': 'RAG-enabled trip planning and information agent (unavailable - no API key)',
            'error': 'OpenAI API key not configured'
        }

    tools = [
        Tool.from_function(
            func=get_trip_info,
            name="Trip Information",
            description="Get detailed information about trips using our knowledge base"
        ),
        Tool.from_function(
            func=check_trip_availability,
            name="Check Availability",
            description="Check trip availability and upcoming slots"
        )
    ]

    memory = ConversationBufferWindowMemory(k=5, memory_key="chat_history")

    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
        memory=memory,
        verbose=False,
        handle_parsing_errors=True,
        max_iterations=3
    )

    return {
        'agent': agent,
        'type': 'trip_guidance',
        'description': 'RAG-enabled trip planning and information agent'
    }

def create_faq_agent():
    """Create FAQ agent"""
    if not llm:
        return {
            'agent': None,
            'type': 'faq',
            'description': 'Frequently asked questions agent (unavailable - no API key)',
            'error': 'OpenAI API key not configured'
        }

    tools = [
        Tool.from_function(
            func=get_faq_answer,
            name="FAQ Search",
            description="Search FAQ knowledge base for answers"
        )
    ]

    memory = ConversationBufferWindowMemory(k=3, memory_key="chat_history")

    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
        memory=memory,
        verbose=False,
        handle_parsing_errors=True
    )

    return {
        'agent': agent,
        'type': 'faq',
        'description': 'Frequently asked questions agent'
    }

def create_payment_agent():
    """Create payment and booking agent"""
    if not llm:
        return {
            'agent': None,
            'type': 'payment',
            'description': 'Payment processing and booking management agent (unavailable - no API key)',
            'error': 'OpenAI API key not configured'
        }

    tools = [
        Tool.from_function(
            func=get_payment_options,
            name="Payment Options",
            description="Get payment methods and policies"
        ),
        Tool.from_function(
            func=get_booking_status,
            name="Booking Status",
            description="Check booking status and details"
        )
    ]

    memory = ConversationBufferWindowMemory(k=5, memory_key="chat_history")

    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
        memory=memory,
        verbose=False,
        handle_parsing_errors=True
    )

    return {
        'agent': agent,
        'type': 'payment',
        'description': 'Payment processing and booking management agent'
    }

def create_customer_care_agent():
    """Create customer care agent"""
    if not llm:
        return {
            'agent': None,
            'type': 'customer_care',
            'description': 'Comprehensive customer care and support agent (unavailable - no API key)',
            'error': 'OpenAI API key not configured'
        }

    tools = [
        Tool.from_function(
            func=get_customer_support,
            name="Customer Support",
            description="Provide customer support information and assistance"
        ),
        Tool.from_function(
            func=get_faq_answer,
            name="FAQ Support",
            description="Answer common customer questions"
        )
    ]

    memory = ConversationBufferWindowMemory(k=10, memory_key="chat_history")

    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
        memory=memory,
        verbose=False,
        handle_parsing_errors=True,
        max_iterations=5
    )

    return {
        'agent': agent,
        'type': 'customer_care',
        'description': 'Comprehensive customer care and support agent'
    }

def create_lead_qualification_agent():
    """Create lead qualification agent"""
    if not llm:
        return {
            'agent': None,
            'type': 'lead_qualification',
            'description': 'Lead qualification and conversion agent (unavailable - no API key)',
            'error': 'OpenAI API key not configured'
        }

    tools = [
        Tool.from_function(
            func=get_trip_info,
            name="Trip Interest",
            description="Assess interest in specific trips"
        ),
        Tool.from_function(
            func=check_trip_availability,
            name="Availability Check",
            description="Check trip availability for qualification"
        )
    ]

    memory = ConversationBufferWindowMemory(k=8, memory_key="chat_history")

    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
        memory=memory,
        verbose=False,
        handle_parsing_errors=True
    )

    return {
        'agent': agent,
        'type': 'lead_qualification',
        'description': 'Lead qualification and conversion agent'
    }


def create_whatsapp_agent():
    """Create WhatsApp communication agent"""
    if not llm:
        return {
            'agent': None,
            'type': 'whatsapp',
            'description': 'WhatsApp communication and updates agent (unavailable - no API key)',
            'error': 'OpenAI API key not configured'
        }

    tools = [
        Tool.from_function(
            func=get_customer_support,
            name="WhatsApp Support",
            description="Handle WhatsApp customer communications"
        ),
        Tool.from_function(
            func=get_booking_status,
            name="Booking Updates",
            description="Send booking status updates via WhatsApp"
        )
    ]

    memory = ConversationBufferWindowMemory(k=5, memory_key="chat_history")

    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
        memory=memory,
        verbose=False,
        handle_parsing_errors=True
    )

    return {
        'agent': agent,
        'type': 'whatsapp',
        'description': 'WhatsApp communication and updates agent'
    }


def create_payment_policy_agent():
    """Create payment policy agent"""
    if not llm:
        return {
            'agent': None,
            'type': 'payment_policy',
            'description': 'Payment policy explanation agent (unavailable - no API key)',
            'error': 'OpenAI API key not configured'
        }

    tools = [
        Tool.from_function(
            func=get_payment_options,
            name="Payment Policies",
            description="Explain payment policies and procedures"
        )
    ]

    memory = ConversationBufferWindowMemory(k=3, memory_key="chat_history")

    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
        memory=memory,
        verbose=False,
        handle_parsing_errors=True
    )

    return {
        'agent': agent,
        'type': 'payment_policy',
        'description': 'Payment policy explanation agent'
    }

# Chain Prompting System
class ChainPromptingOrchestrator:
    """Orchestrate multiple agents using chain prompting"""

    def __init__(self):
        self.agents = {
            'trip_guidance': create_trip_guidance_agent(),
            'faq': create_faq_agent(),
            'payment': create_payment_agent(),
            'customer_care': create_customer_care_agent(),
            'lead_qualification': create_lead_qualification_agent(),
            'whatsapp': create_whatsapp_agent(),
            'payment_policy': create_payment_policy_agent()
        }

    def classify_query(self, query: str, context: Dict[str, Any]) -> str:
        """Classify the user query to determine which agent to use"""
        if not llm:
            return 'customer_care'  # Default fallback when no AI available

        classification_prompt = f"""
        Classify this user query into one of these categories:
        - trip_guidance: Questions about trips, destinations, itineraries, planning
        - faq: Frequently asked questions, general information
        - payment: Payment methods, booking payments, transactions
        - customer_care: Support requests, complaints, help, issues
        - lead_qualification: Interest in booking, trip recommendations, availability
        - whatsapp: Communication preferences, updates, notifications
        - payment_policy: Refund policies, cancellation, payment rules

        Query: "{query}"
        Context: Page - {context.get('page', 'general')}, Has booking ID: {bool(context.get('bookingId'))}

        Return only the category name:
        """

        try:
            response = llm.predict(classification_prompt).strip().lower()
            if response in self.agents:
                return response
            else:
                return 'customer_care'  # Default fallback
        except Exception as e:
            print(f"Classification error: {e}")
            return 'customer_care'

    def process_query(self, query: str, context: Dict[str, Any], conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """Process a query using the appropriate agent via chain prompting"""

        # Classify the query
        agent_type = self.classify_query(query, context)

        # Get the appropriate agent
        agent_config = self.agents.get(agent_type, self.agents['customer_care'])
        agent = agent_config['agent']

        # Prepare conversation context
        conversation_context = ""
        if conversation_history:
            recent_messages = conversation_history[-3:]  # Last 3 messages
            conversation_context = "\n".join([
                f"{'User' if msg['type'] == 'user' else 'Assistant'}: {msg['content']}"
                for msg in recent_messages
            ])

        # Enhanced prompt with context
        enhanced_query = f"""
        Context: User is on {context.get('page', 'general')} page
        {f"Booking ID: {context.get('bookingId')}" if context.get('bookingId') else ""}
        {f"Trip ID: {context.get('tripId')}" if context.get('tripId') else ""}

        Recent conversation:
        {conversation_context}

        User query: {query}

        Please provide a helpful, contextual response.
        """

        try:
            # Run the agent
            response = agent.run(enhanced_query)

            return {
                'content': response,
                'agentType': agent_type,
                'confidence': 0.9,  # Could be improved with actual confidence scoring
                'context': context
            }

        except Exception as e:
            print(f"Agent processing error: {e}")
            # Fallback to customer care
            fallback_agent = self.agents['customer_care']['agent']
            try:
                response = fallback_agent.run(f"I need help with: {query}")
                return {
                    'content': response,
                    'agentType': 'customer_care',
                    'confidence': 0.5,
                    'context': context
                }
            except Exception as e2:
                print(f"Fallback agent error: {e2}")
                return {
                    'content': "I apologize, but I'm experiencing some technical difficulties. Please contact our support team at support@adventurebuddha.com or call +91-9876543210.",
                    'agentType': 'error',
                    'confidence': 0.0,
                    'context': context
                }

# Global orchestrator instance
orchestrator = ChainPromptingOrchestrator()

# Main interface functions
def chat_with_agent(query: str, context: Dict[str, Any] = None, conversation_history: List[Dict] = None) -> Dict[str, Any]:
    """Main function to chat with the appropriate agent"""
    if context is None:
        context = {}

    return orchestrator.process_query(query, context, conversation_history)

# Test functions
if __name__ == "__main__":
    # Test the system
    test_queries = [
        "Tell me about the Ladakh trip",
        "How do I pay for my booking?",
        "I need help with my booking",
        "What's the cancellation policy?",
        "Is Goa available next month?"
    ]

    for query in test_queries:
        print(f"\nQuery: {query}")
        result = chat_with_agent(query)
        print(f"Agent: {result['agentType']}")
        print(f"Response: {result['content'][:200]}...")