#!/bin/bash

# Simplified VM Deployment script for Adventure Buddha
# Uses SQLite instead of Docker containers for resource efficiency

set -euo pipefail

# Configuration
DEPLOYMENT_DIR="/home/ubuntu/adventure-buddha"
BACKUP_DIR="/home/ubuntu/adventure-buddha-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/home/ubuntu/deployment_$TIMESTAMP.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2 | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*" | tee -a "$LOG_FILE"
}

# Function to create backup
create_backup() {
    log "Creating backup of current deployment..."
    mkdir -p "$BACKUP_DIR"

    if [ -d "$DEPLOYMENT_DIR" ]; then
        cp -r "$DEPLOYMENT_DIR" "$BACKUP_DIR/backup_$TIMESTAMP"
        success "Backup created: $BACKUP_DIR/backup_$TIMESTAMP"
    else
        warning "No existing deployment found, skipping backup"
    fi
}

# Function to rollback deployment
rollback() {
    error "Deployment failed! Initiating rollback..."

    if [ -d "$BACKUP_DIR/backup_$TIMESTAMP" ]; then
        log "Rolling back to previous version..."
        rm -rf "$DEPLOYMENT_DIR"
        mv "$BACKUP_DIR/backup_$TIMESTAMP" "$DEPLOYMENT_DIR"
        success "Rollback completed"
    else
        error "No backup found for rollback!"
        exit 1
    fi
}

# Function to check service health
check_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    log "Checking $service health at $url..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f --max-time 10 "$url" >/dev/null 2>&1; then
            success "$service is healthy"
            return 0
        fi

        log "Waiting for $service to be ready... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done

    error "$service failed to become healthy after $max_attempts attempts"
    return 1
}

# Trap for cleanup on error
trap 'error "Deployment failed!"; rollback' ERR

log "🚀 Starting simplified VM deployment..."
log "Deployment timestamp: $TIMESTAMP"
log "Log file: $LOG_FILE"

# Create backup before deployment
create_backup

# Update system packages (minimal update)
log "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y python3 python3-pip python3-venv

# Install Python dependencies if not installed
if ! command -v python3 &> /dev/null; then
    log "🐍 Installing Python3..."
    sudo apt install -y python3 python3-pip python3-venv
fi

# Create deployment directory if it doesn't exist
mkdir -p "$DEPLOYMENT_DIR"

# Navigate to deployment directory
cd "$DEPLOYMENT_DIR"

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    log "📋 Setting up environment file..."
    if [ -f /home/ubuntu/adventure-buddha-deploy/.env.example ]; then
        cp /home/ubuntu/adventure-buddha-deploy/.env.example .env
        warning "⚠️  Please ensure .env file has correct configuration values!"
    else
        error "No .env.example file found!"
        exit 1
    fi
fi

# Copy backend environment file
if [ ! -f backend/.env ]; then
    log "📋 Setting up backend environment file..."
    mkdir -p backend
    if [ -f /home/ubuntu/adventure-buddha-deploy/backend-env.example ]; then
        cp /home/ubuntu/adventure-buddha-deploy/backend-env.example backend/.env
        warning "⚠️  Please ensure backend/.env file has correct configuration values!"
    fi
fi

# Stop existing services gracefully
log "🛑 Stopping existing services..."
sudo systemctl stop adventure-buddha-backend || true
pkill -f "python manage.py runserver" || true

# Install/update Python dependencies
log "📦 Installing Python dependencies..."
cd backend
python3 -m pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
log "🗄️  Running database migrations..."
python3 manage.py migrate

# Populate data (optional)
log "📊 Populating database..."
python3 manage.py populate_trips || warning "Data population failed, but continuing..."

# Collect static files
log "📄 Collecting static files..."
python3 manage.py collectstatic --noinput --clear

cd ..

# Start the backend service using systemd
log "🏗️  Starting backend service..."
sudo cp /home/ubuntu/adventure-buddha-deploy/adventure-buddha-backend.service /etc/systemd/system/ || true
sudo systemctl daemon-reload
sudo systemctl enable adventure-buddha-backend
sudo systemctl start adventure-buddha-backend

# Wait for service to start
log "⏳ Waiting for backend service to start..."
sleep 30

# Health checks
log "🔍 Performing health checks..."

# Check backend health
if check_health "Backend API" "http://localhost:8000/api/health/"; then
    success "Backend health check passed"
else
    error "Backend health check failed"
    exit 1
fi

# Cleanup old backups
log "🧹 Cleaning up old backups..."
cd "$BACKUP_DIR" || exit 1
ls -t backup_* | tail -n +6 | xargs -r rm -rf
success "Old backups cleaned up"

success "✅ Deployment completed successfully!"
success "🌐 Application is available at:"
success "   Backend API: http://$(curl -s ifconfig.me):8000/api/"
success "   Admin Panel: http://$(curl -s ifconfig.me):8000/admin/"

log "🎉 Deployment finished successfully!"

# Function to cleanup old backups (keep last 5)
cleanup_backups() {
    log "Cleaning up old backups..."
    cd "$BACKUP_DIR" || exit 1
    ls -t backup_* | tail -n +6 | xargs -r rm -rf
    success "Old backups cleaned up"
}

# Function to check service health
check_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=1

    log "Checking $service health at $url..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f --max-time 10 "$url" >/dev/null 2>&1; then
            success "$service is healthy"
            return 0
        fi

        log "Waiting for $service to be ready... (attempt $attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done

    error "$service failed to become healthy after $max_attempts attempts"
    return 1
}

# Trap for cleanup on error
trap 'error "Deployment failed!"; rollback' ERR

log "🚀 Starting automated deployment..."
log "Deployment timestamp: $TIMESTAMP"
log "Log file: $LOG_FILE"

# Create backup before deployment
create_backup

# Update system packages
log "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose if not installed
if ! command -v docker &> /dev/null; then
    log "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

if ! command -v docker-compose &> /dev/null; then
    log "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create deployment directory if it doesn't exist
mkdir -p "$DEPLOYMENT_DIR"

# Navigate to deployment directory
cd "$DEPLOYMENT_DIR"

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    log "📋 Setting up environment file..."
    if [ -f /home/ubuntu/adventure-buddha-deploy/.env.example ]; then
        cp /home/ubuntu/adventure-buddha-deploy/.env.example .env
        warning "⚠️  Please ensure .env file has correct configuration values!"
    else
        error "No .env.example file found!"
        exit 1
    fi
fi

# Copy backend environment file
if [ ! -f backend/.env ]; then
    log "📋 Setting up backend environment file..."
    mkdir -p backend
    if [ -f /home/ubuntu/adventure-buddha-deploy/backend-env.example ]; then
        cp /home/ubuntu/adventure-buddha-deploy/backend-env.example backend/.env
        warning "⚠️  Please ensure backend/.env file has correct configuration values!"
    fi
fi

# Stop existing services gracefully
log "🛑 Stopping existing services..."
docker-compose down || true
cd backend
docker-compose down || true
cd ..

# Build and start frontend
log "🏗️  Building and starting frontend..."
docker-compose up -d frontend

# Build and start backend services
log "🏗️  Building and starting backend services..."
cd backend
docker-compose up -d

# Wait for services to be ready
log "⏳ Waiting for services to be ready..."
sleep 30

# Run database migrations
log "🗄️  Running database migrations..."
docker-compose exec -T backend python manage.py migrate

# Populate data (optional - comment out if not needed)
log "📊 Populating database..."
docker-compose exec -T backend python manage.py populate_trips || warning "Data population failed, but continuing..."

# Collect static files
log "📄 Collecting static files..."
docker-compose exec -T backend python manage.py collectstatic --noinput --clear

cd ..

# Health checks
log "🔍 Performing health checks..."

# Check backend health
if check_health "Backend API" "http://localhost:8000/api/health/"; then
    success "Backend health check passed"
else
    error "Backend health check failed"
    exit 1
fi

# Check frontend health
if check_health "Frontend" "http://localhost:3000"; then
    success "Frontend health check passed"
else
    error "Frontend health check failed"
    exit 1
fi

# Cleanup old backups
cleanup_backups

success "✅ Deployment completed successfully!"
success "🌐 Application is available at:"
success "   Frontend: http://$(curl -s ifconfig.me):3000"
success "   Backend API: http://$(curl -s ifconfig.me):8000/api/"
success "   Admin Panel: http://$(curl -s ifconfig.me):8000/admin/"

# Send notification (optional - requires webhook URL)
if [ -n "${WEBHOOK_URL:-}" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"✅ Deployment successful! Application updated at $(date)\"}"
fi

log "🎉 Deployment finished successfully!"