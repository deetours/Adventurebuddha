#!/bin/bash

# Deployment script for Adventure Buddha
# Run this script on your VM after git pull

set -e

echo "🚀 Starting deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose if not installed
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Navigate to backend directory
cd backend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual configuration values!"
    exit 1
fi

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec backend python manage.py migrate

# Populate vector store
echo "🤖 Populating vector store..."
docker-compose exec backend python manage.py populate_vector_store

# Collect static files
echo "📄 Collecting static files..."
docker-compose exec backend python manage.py collectstatic --noinput

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your application should be available at:"
echo "   Backend API: http://your-vm-ip:8000"
echo "   Admin Panel: http://your-vm-ip:8000/admin/"
echo ""
echo "📝 Next steps:"
echo "1. Configure your reverse proxy (nginx/apache) to serve the frontend"
echo "2. Set up SSL certificates"
echo "3. Configure domain name"
echo "4. Set up monitoring and logging"