#!/bin/bash

# Manual Deployment Script for Adventure Buddha
# Run this locally to deploy to VM

set -e

# Configuration - Update these with your VM details
VM_HOST="68.233.115.38"
VM_USER="ubuntu"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"  # Update this path to your SSH key

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" >&2
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $*" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $*" >&2
}

# Test SSH connection
log "Testing SSH connection to $VM_HOST..."
if ! ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$VM_USER@$VM_HOST" "echo 'SSH connection successful'" 2>/dev/null; then
    error "Cannot connect to VM via SSH. Please check:"
    error "  1. SSH key path: $SSH_KEY_PATH"
    error "  2. VM is running: $VM_HOST"
    error "  3. SSH key is added to VM authorized_keys"
    exit 1
fi

success "SSH connection successful"

# Create deployment directory
log "Creating deployment directory on VM..."
ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_HOST" "mkdir -p /home/ubuntu/adventure-buddha-deploy"

# Copy files to VM
log "Copying deployment files to VM..."
scp -i "$SSH_KEY_PATH" deploy.sh "$VM_USER@$VM_HOST:/home/ubuntu/adventure-buddha-deploy/"
scp -i "$SSH_KEY_PATH" backend/adventure-buddha-backend.service "$VM_USER@$VM_HOST:/home/ubuntu/adventure-buddha-deploy/"
scp -i "$SSH_KEY_PATH" backend/.env.example "$VM_USER@$VM_HOST:/home/ubuntu/adventure-buddha-deploy/backend-env.example"
scp -i "$SSH_KEY_PATH" .env.example "$VM_USER@$VM_HOST:/home/ubuntu/adventure-buddha-deploy/"

# Copy entire backend directory
log "Copying backend code to VM..."
scp -i "$SSH_KEY_PATH" -r backend "$VM_USER@$VM_HOST:/home/ubuntu/adventure-buddha-deploy/"

# Make scripts executable and run deployment
log "Running deployment on VM..."
ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_HOST" "cd /home/ubuntu/adventure-buddha-deploy && chmod +x deploy.sh && ./deploy.sh"

# Wait for deployment to complete
log "Waiting for deployment to complete..."
sleep 30

# Test the deployment
log "Testing deployed API..."
if ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_HOST" "curl -f http://localhost:8000/api/health/ 2>/dev/null"; then
    success "Deployment successful! API is responding."
    success "Your app should be available at: http://$VM_HOST:8000/api/trips/"
else
    warning "API health check failed. Checking service status..."
    ssh -i "$SSH_KEY_PATH" "$VM_USER@$VM_HOST" "sudo systemctl status adventure-buddha-backend"
fi

success "Manual deployment completed!"