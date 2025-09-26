# Deployment Guide

This guide will help you deploy the Adventure Buddha application to a VM.

## Prerequisites

- Ubuntu 20.04+ VM with at least 2GB RAM and 20GB storage
- Domain name (optional but recommended)
- SSH access to your VM

## Quick Deployment

### 1. Server Setup

```bash
# On your VM, update the system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git ufw

# Configure firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable
```

### 2. Clone Repository

```bash
git clone https://github.com/your-username/adventure-buddha.git
cd adventure-buddha
```

### 3. Configure Environment

```bash
cd backend
cp .env.example .env
nano .env  # Edit with your actual values
```

### 4. Run Deployment Script

```bash
chmod +x ../deploy.sh
../deploy.sh
```

## Manual Deployment

If you prefer manual deployment:

### Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Populate vector store
python manage.py populate_vector_store

# Collect static files
python manage.py collectstatic

# Run server
python manage.py runserver 0.0.0.0:8000
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Serve with nginx (configure nginx to serve dist/ folder)
```

## Environment Variables

Make sure to set these in your `.env` file:

- `DEBUG=False` (for production)
- `SECRET_KEY` (generate a secure key)
- `ALLOWED_HOSTS` (your domain/IP)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` (database credentials)
- `OPENROUTER_API_KEY` or `OPENAI_API_KEY` (for RAG functionality)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (payment gateway)

## Nginx Configuration

Create `/etc/nginx/sites-available/adventure-buddha`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /path/to/adventure-buddha/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /path/to/adventure-buddha/backend/staticfiles/;
    }

    # Media files
    location /media/ {
        alias /path/to/adventure-buddha/backend/media/;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/adventure-buddha /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Setup (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Monitoring

Consider setting up:
- Prometheus + Grafana for monitoring
- Log rotation
- Backup scripts for database
- Health checks

## Troubleshooting

### Common Issues

1. **Port 8000 not accessible**: Check firewall settings
2. **Database connection failed**: Verify PostgreSQL is running and credentials are correct
3. **Vector store empty**: Run `python manage.py populate_vector_store`
4. **Static files not loading**: Run `python manage.py collectstatic`

### Logs

```bash
# Backend logs
docker-compose logs backend

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Backup Strategy

```bash
# Database backup
docker-compose exec db pg_dump -U postgres adventure_buddha_prod > backup.sql

# Media files backup
tar -czf media_backup.tar.gz backend/media/

# Full backup
tar -czf full_backup.tar.gz .
```