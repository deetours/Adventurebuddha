#!/bin/bash

# Backend-specific deployment script
# This handles backend services deployment

set -euo pipefail

DEPLOYMENT_DIR="/home/ubuntu/adventure-buddha/backend"
LOG_FILE="/home/ubuntu/backend_deployment_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2 | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" | tee -a "$LOG_FILE"
}

cd "$DEPLOYMENT_DIR" || exit 1

log "🚀 Starting backend deployment..."

# Stop existing services
log "🛑 Stopping existing backend services..."
docker-compose down || true

# Build and start services
log "🏗️  Building backend services..."
docker-compose build --no-cache

log "🏃 Starting backend services..."
docker-compose up -d

# Wait for database to be ready
log "⏳ Waiting for database to be ready..."
sleep 20

# Run migrations
log "🗄️  Running database migrations..."
docker-compose exec -T backend python manage.py migrate

# Create superuser if it doesn't exist (optional)
log "👤 Ensuring admin user exists..."
docker-compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Admin user created')
else:
    print('Admin user already exists')
" || warning "Could not create admin user"

# Collect static files
log "📄 Collecting static files..."
docker-compose exec -T backend python manage.py collectstatic --noinput --clear

# Run additional setup tasks
log "🔧 Running additional setup tasks..."
# docker-compose exec -T backend python manage.py populate_trips || warning "Data population failed"
log "⚠️  Skipping trip population to preserve manual database changes"

success "✅ Backend deployment completed successfully!"