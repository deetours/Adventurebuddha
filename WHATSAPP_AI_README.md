# WhatsApp Automation + AI Agent Module

This module provides comprehensive WhatsApp automation capabilities with AI-powered features for bulk messaging, contact management, and intelligent campaign management.

## Features

### WhatsApp Automation
- **Bulk Messaging**: Send personalized messages to multiple contacts
- **Contact Management**: Upload and manage contact lists via Excel/CSV
- **Campaign Management**: Create, schedule, and monitor messaging campaigns
- **Message Templates**: Pre-defined templates with personalization
- **Real-time Status Tracking**: Monitor message delivery and read status
- **Attachment Support**: Send images, documents, and other media
- **Multi-method Support**: pywhatkit, WhatsApp Business API, or mock mode

### AI Agent Features
- **Message Redrafting**: AI-powered message improvement and tone adjustment
- **Sentiment Analysis**: Analyze message sentiment and emotions
- **Content Generation**: Generate various types of content (messages, emails, posts)
- **Chatbot**: Intelligent conversational AI for customer interactions
- **Template Enhancement**: Improve message templates using AI
- **Reply Analysis**: Analyze and categorize customer replies

### Background Processing
- **Celery Integration**: Asynchronous processing for bulk operations
- **Redis Backend**: Reliable task queuing and result storage
- **Error Handling**: Comprehensive retry logic and error recovery
- **Rate Limiting**: Prevent API rate limit violations
- **Monitoring**: Detailed logging and performance tracking

## Installation

### Prerequisites
- Python 3.8+
- Django 4.2+
- PostgreSQL
- Redis
- OpenRouter API key (for AI features)

### Package Installation
```bash
pip install -r requirements.txt
```

### Environment Variables
Add these to your `.env` file:

```env
# WhatsApp Settings
WHATSAPP_USE_MOCK=True  # Set to False for production
WHATSAPP_API_KEY=your_whatsapp_api_key
WHATSAPP_API_URL=https://api.whatsapp.com/v1
WHATSAPP_SESSION_FILE=whatsapp_session.txt

# AI Settings
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Redis/Celery
REDIS_URL=redis://localhost:6379/0
```

## Setup

### 1. Database Migration
```bash
python manage.py makemigrations messaging ai_agent
python manage.py migrate
```

### 2. Create Superuser
```bash
python manage.py createsuperuser
```

### 3. Start Redis Server
```bash
redis-server
```

### 4. Start Celery Worker
```bash
celery -A adventure_buddha_backend worker --loglevel=info
```

### 5. Start Django Server
```bash
python manage.py runserver
```

## API Endpoints

### WhatsApp Messaging

#### Campaigns
- `GET/POST /api/messaging/campaigns/` - List/Create campaigns
- `GET/PUT/DELETE /api/messaging/campaigns/{id}/` - Campaign details
- `POST /api/messaging/campaigns/{id}/start/` - Start campaign
- `POST /api/messaging/campaigns/{id}/pause/` - Pause campaign
- `POST /api/messaging/campaigns/{id}/resume/` - Resume campaign

#### Contacts
- `GET/POST /api/messaging/contact-lists/` - List/Create contact lists
- `POST /api/messaging/contact-lists/{id}/upload/` - Upload Excel/CSV
- `GET /api/messaging/contacts/` - List contacts

#### Templates
- `GET/POST /api/messaging/templates/` - List/Create templates
- `GET/PUT/DELETE /api/messaging/templates/{id}/` - Template details

### AI Agent

#### Agents
- `GET/POST /api/ai/agents/` - List/Create AI agents
- `GET/PUT/DELETE /api/ai/agents/{id}/` - Agent details
- `POST /api/ai/agents/{id}/test/` - Test agent

#### Conversations
- `GET /api/ai/conversations/` - List conversations
- `DELETE /api/ai/conversations/{id}/clear-history/` - Clear history

#### AI Operations
- `POST /api/ai/chat/` - Chat with AI
- `POST /api/ai/redraft-message/` - Redraft message
- `POST /api/ai/analyze-sentiment/` - Analyze sentiment
- `POST /api/ai/generate-content/` - Generate content
- `POST /api/ai/bulk-sentiment-analysis/` - Bulk sentiment analysis

#### Templates
- `GET/POST /api/ai/templates/` - List/Create AI templates
- `POST /api/ai/templates/{id}/enhance/` - Enhance template

## Usage Examples

### Creating a WhatsApp Campaign

```python
import requests

# Create contact list
contact_list_data = {
    'name': 'Customer List',
    'description': 'VIP customers'
}
response = requests.post('/api/messaging/contact-lists/', json=contact_list_data)

# Upload contacts via Excel
files = {'file': open('contacts.xlsx', 'rb')}
data = {'has_header': True}
response = requests.post('/api/messaging/contact-lists/1/upload/', files=files, data=data)

# Create message template
template_data = {
    'name': 'Welcome Message',
    'content': 'Hello {{name}}, welcome to our service!',
    'template_type': 'greeting'
}
response = requests.post('/api/messaging/templates/', json=template_data)

# Create campaign
campaign_data = {
    'name': 'Welcome Campaign',
    'message_template': 1,
    'contact_list': 1,
    'scheduled_time': '2024-01-01T10:00:00Z'
}
response = requests.post('/api/messaging/campaigns/', json=campaign_data)

# Start campaign
response = requests.post('/api/messaging/campaigns/1/start/')
```

### Using AI Features

```python
import requests

# Redraft a message
redraft_data = {
    'original_message': 'hey can u help me',
    'tone': 'professional',
    'context': 'Customer support'
}
response = requests.post('/api/ai/redraft-message/', json=redraft_data)

# Analyze sentiment
sentiment_data = {
    'message': 'I love your product! It works great.',
    'include_keywords': True
}
response = requests.post('/api/ai/analyze-sentiment/', json=sentiment_data)

# Generate content
content_data = {
    'content_type': 'social_post',
    'prompt': 'Create a post about our new adventure travel package',
    'max_length': 200
}
response = requests.post('/api/ai/generate-content/', json=content_data)
```

## Configuration

### WhatsApp Methods

#### Mock Mode (Development)
```env
WHATSAPP_USE_MOCK=True
```
- No actual WhatsApp messages sent
- Useful for development and testing

#### pywhatkit (Web-based)
```env
WHATSAPP_USE_MOCK=False
```
- Uses WhatsApp Web interface
- Requires Chrome browser
- Limited attachment support

#### WhatsApp Business API
```env
WHATSAPP_USE_MOCK=False
WHATSAPP_API_KEY=your_api_key
WHATSAPP_API_URL=https://api.whatsapp.com/v1
```
- Official WhatsApp Business API
- Full attachment support
- Requires WhatsApp Business account

### AI Configuration

#### OpenRouter API
The system uses OpenRouter API for AI features. Supported models:
- GPT-3.5-turbo (default)
- GPT-4
- Claude
- Gemini
- And many more

Configure your API key:
```env
OPENROUTER_API_KEY=your_api_key_here
```

## Excel/CSV Upload Format

### Contact List Format
Your Excel/CSV file should have these columns:

| Column Name | Required | Description |
|-------------|----------|-------------|
| name | Yes | Contact's full name |
| phone | Yes | Phone number with country code (e.g., +1234567890) |
| email | No | Email address |
| company | No | Company/organization name |
| notes | No | Additional notes |

Example:
```csv
name,phone,email,company
John Doe,+1234567890,john@example.com,ABC Corp
Jane Smith,+1987654321,jane@example.com,XYZ Ltd
```

## Monitoring and Logging

### Celery Monitoring
```bash
# Check active tasks
celery -A adventure_buddha_backend inspect active

# Check worker stats
celery -A adventure_buddha_backend inspect stats

# View task results
celery -A adventure_buddha_backend inspect registered
```

### Django Admin
Access the Django admin at `/admin/` to:
- View and manage campaigns
- Monitor message logs
- Review AI processing logs
- Manage AI agents and templates

## Troubleshooting

### Common Issues

#### WhatsApp Connection Issues
- Ensure WhatsApp Web is logged in (for pywhatkit)
- Check API credentials (for Business API)
- Verify phone number format

#### AI Service Issues
- Check OpenRouter API key
- Verify internet connection
- Check API rate limits

#### Celery Issues
- Ensure Redis is running
- Check Celery worker status
- Review task logs

### Logs Location
- Django logs: Check your Django logging configuration
- Celery logs: Usually in `celery.log`
- AI processing logs: Available in Django admin

## Security Considerations

- Store API keys securely using environment variables
- Use HTTPS in production
- Implement rate limiting for API endpoints
- Regularly rotate API keys
- Monitor for unusual activity

## Performance Optimization

- Use background tasks for bulk operations
- Implement caching for frequently accessed data
- Monitor database query performance
- Use pagination for large datasets
- Optimize AI model selection based on needs

## Contributing

1. Follow Django best practices
2. Add comprehensive tests
3. Update documentation
4. Use meaningful commit messages
5. Test with mock mode before production

## License

This module is part of the Adventure Buddha project.