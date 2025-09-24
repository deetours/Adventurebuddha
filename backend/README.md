# Adventure Buddha Backend

This is the backend API for the Adventure Buddha travel booking application, built with Django, Django REST Framework, and Langchain for AI-powered agents.

## Features

- Trip management (CRUD operations)
- Real-time seat selection with WebSocket support
- Booking system with seat locking
- Multiple payment methods (Razorpay, UPI, manual upload)
- AI-powered support agents using Langchain
- User authentication with JWT
- Docker support for easy deployment

## Tech Stack

- **Python 3.11**
- **Django 4.2**
- **Django REST Framework**
- **PostgreSQL**
- **Redis** (for caching and WebSocket)
- **Langchain** (for AI agents)
- **OpenAI** (for LLM integration)
- **Docker** (for containerization)

## Project Structure

```
backend/
├── adventure_buddha_backend/  # Main Django project
│   ├── settings.py            # Django settings
│   ├── urls.py               # Main URL configuration
│   └── ...                   # Other Django files
├── trips/                    # Trip management app
├── bookings/                 # Booking system app
├── payments/                 # Payment processing app
├── agents/                   # AI agents app (Langchain)
├── manage.py                # Django management script
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
└── docker-compose.yml      # Multi-container setup
```

## Setup Instructions

### Prerequisites

- Python 3.11
- PostgreSQL
- Redis
- Docker (optional, for containerized setup)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run database migrations:**
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

### Docker Setup

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Run migrations:**
   ```bash
   docker-compose exec backend python manage.py migrate
   ```

3. **Create a superuser:**
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

## API Endpoints

### Authentication
- `POST /api/auth/token/` - Obtain JWT token
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Trips
- `GET /api/trips/` - List all trips
- `GET /api/trips/{id}/` - Get trip details
- `GET /api/trips/{id}/availability/` - Get trip availability

### Bookings
- `GET /api/bookings/` - List user bookings
- `POST /api/bookings/lock_seats/` - Lock seats
- `POST /api/bookings/unlock_seats/` - Unlock seats
- `POST /api/bookings/create_booking/` - Create booking draft

### Payments
- `POST /api/payments/razorpay/create-order/` - Create Razorpay order
- `POST /api/payments/razorpay/verify/` - Verify Razorpay payment
- `POST /api/payments/upiqr/` - Generate UPI QR code
- `POST /api/payments/manual-upload/` - Upload payment screenshot

### Agents
- `POST /api/agents/discovery_query/` - Query support agent
- `POST /api/agents/chat_message/` - Send chat message to agent

## WebSocket Endpoints

- `ws://localhost:8000/ws/seats/{slot_id}/` - Real-time seat updates

## Langchain Agents

The agents app uses Langchain to provide AI-powered support. Agents have access to tools for:
- Retrieving trip information
- Checking booking status
- Providing payment options

## Development

### Running Tests

```bash
python manage.py test
```

### Code Quality

```bash
# Run linting
flake8 .

# Format code
black .
```

## Deployment

The application is configured to run with Gunicorn in production. For deployment:

1. Set `DEBUG=False` in environment variables
2. Configure a production database
3. Set up a reverse proxy (nginx) for static files
4. Use the Docker setup for containerized deployment

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.