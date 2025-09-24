# Custom Messaging API - Similar to WaSenderAPI

This is your own custom messaging API that provides phone number input and message sending capabilities, designed to be easily integrated with WhatsApp API later.

## 🚀 Features

- **Phone Number Input**: Enter any phone number to send messages
- **Message Sending**: Send text messages with priority levels
- **Bulk Messaging**: Send multiple messages at once
- **Phone Validation**: Validate phone numbers and check deliverability
- **Message Status**: Track delivery status of sent messages
- **Account Management**: Monitor balance and usage statistics
- **Campaign Support**: Create and manage messaging campaigns
- **Rate Limiting**: Built-in rate limiting and batch processing
- **REST API**: Complete REST API for easy integration
- **Mock Mode**: Development mode with realistic simulation

## 📱 API Endpoints

### Send Single Message
```http
POST /api/messaging/send-message/
Authorization: Bearer your_api_key
Content-Type: application/json

{
    "phone_number": "+1234567890",
    "message": "Hello from Custom API!",
    "campaign_id": "optional-campaign-uuid",
    "priority": "normal",
    "attachment_url": "optional-url"
}
```

**Response:**
```json
{
    "success": true,
    "message_id": "custom_msg_1234567890_1234567890",
    "status": "sent",
    "priority": "normal",
    "estimated_delivery": "2025-09-24T18:00:00Z"
}
```

### Send Bulk Messages
```http
POST /api/messaging/send-bulk/
Authorization: Bearer your_api_key
Content-Type: application/json

{
    "messages": [
        {
            "phone_number": "+1234567890",
            "message": "Hello User 1!",
            "priority": "normal"
        },
        {
            "phone_number": "+0987654321",
            "message": "Hello User 2!",
            "priority": "high"
        }
    ],
    "campaign_id": "optional-campaign-uuid"
}
```

### Validate Phone Number
```http
POST /api/messaging/validate-phone/
Authorization: Bearer your_api_key
Content-Type: application/json

{
    "phone_number": "+1234567890"
}
```

**Response:**
```json
{
    "is_valid": true,
    "formatted_number": "+1234567890",
    "can_receive_messages": true,
    "carrier_info": "Mock Carrier",
    "checked_at": 1758736926.44
}
```

### Get Message Status
```http
GET /api/messaging/message/{message_id}/status/
Authorization: Bearer your_api_key
```

### Get Account Balance
```http
GET /api/messaging/account/balance/
Authorization: Bearer your_api_key
```

**Response:**
```json
{
    "balance": 1000.50,
    "currency": "USD",
    "messages_sent_today": 150,
    "messages_limit_daily": 1000,
    "messages_remaining": 850
}
```

### Create Campaign and Send
```http
POST /api/messaging/create-campaign-send/
Authorization: Bearer your_api_key
Content-Type: application/json

{
    "campaign_name": "My Marketing Campaign",
    "message_template": "Hello {{name}}! Special offer for you!",
    "phone_numbers": ["+1234567890", "+0987654321"],
    "priority": "normal",
    "use_ai_personalization": false
}
```

### Get Messaging Statistics
```http
GET /api/messaging/stats/?days=30
Authorization: Bearer your_api_key
```

## ⚙️ Configuration

Add these settings to your Django settings:

```python
# Custom Messaging API Settings
CUSTOM_MESSAGING_API_KEY = 'your_custom_api_key'
CUSTOM_MESSAGING_API_URL = 'http://localhost:8001/api'  # For external API
CUSTOM_MESSAGING_USE_MOCK = True  # Set to False for production
MESSAGING_RATE_LIMIT = 60  # Messages per minute
MAX_MESSAGES_PER_BATCH = 100  # Max messages per bulk request
```

## 🔧 Priority Levels

- `low`: For non-urgent messages
- `normal`: Default priority
- `high`: Important messages
- `urgent`: Time-sensitive messages

## 📊 Message Statuses

- `queued`: Message queued for sending
- `sending`: Currently being sent
- `sent`: Successfully sent
- `delivered`: Delivered to recipient
- `read`: Read by recipient
- `failed`: Failed to send

## 🚀 Integration with WhatsApp API

When you're ready to integrate with WhatsApp API:

1. Set `CUSTOM_MESSAGING_USE_MOCK = False`
2. Configure `CUSTOM_MESSAGING_API_URL` to point to your WhatsApp API endpoint
3. Update the `CUSTOM_MESSAGING_API_KEY` with your WhatsApp API key
4. The same API endpoints will work with real WhatsApp messaging

## 🧪 Testing

Run the test suite:

```bash
cd backend
python test_custom_messaging.py
```

This will test all features and show available API endpoints.

## 💡 Usage Examples

### Python Example
```python
import requests

# Send single message
response = requests.post('http://localhost:8000/api/messaging/send-message/', 
    headers={'Authorization': 'Bearer your_api_key'},
    json={
        'phone_number': '+1234567890',
        'message': 'Hello World!',
        'priority': 'normal'
    }
)

print(response.json())
```

### JavaScript Example
```javascript
// Send bulk messages
fetch('/api/messaging/send-bulk/', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer your_api_key',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        messages: [
            { phone_number: '+1234567890', message: 'Hello!' },
            { phone_number: '+0987654321', message: 'Hi there!' }
        ]
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

## 🔒 Security

- All endpoints require authentication
- Rate limiting prevents abuse
- Phone number validation ensures proper formatting
- API keys should be kept secure

## 📈 Monitoring

- Message delivery statistics
- Account balance tracking
- Rate limit monitoring
- Campaign performance analytics

This custom messaging API gives you full control over messaging functionality while maintaining compatibility with your existing WhatsApp automation system!