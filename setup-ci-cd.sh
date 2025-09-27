#!/bin/bash

# CI/CD Setup Script for Adventure Buddha
# This script helps set up the CI/CD environment

set -e

echo "🚀 Adventure Buddha CI/CD Setup"
echo "================================"

# Check if running on Ubuntu
if ! grep -q "Ubuntu" /etc/os-release; then
    echo "❌ This script is designed for Ubuntu Linux"
    exit 1
fi

echo "✅ Ubuntu detected"

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt install -y curl wget git ufw fail2ban unattended-upgrades

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create deployment directories
echo "📁 Creating deployment directories..."
sudo mkdir -p /home/ubuntu/adventure-buddha
sudo mkdir -p /home/ubuntu/adventure-buddha-backups
sudo chown -R ubuntu:ubuntu /home/ubuntu/

# Set up SSH key for deployment (optional)
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "🔑 Generating SSH key for deployment..."
    ssh-keygen -t rsa -b 4096 -C "deployment@adventure-buddha" -f ~/.ssh/id_rsa -N ""
    echo ""
    echo "📋 Add this public key to your GitHub repository deploy keys:"
    echo "GitHub → Repository → Settings → Deploy keys → Add deploy key"
    cat ~/.ssh/id_rsa.pub
    echo ""
    read -p "Press Enter after adding the key to GitHub..."
fi

# Clone repository (if not already cloned)
if [ ! -d "/home/ubuntu/adventure-buddha/.git" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/deetours/Adventurebuddha.git /home/ubuntu/adventure-buddha
fi

cd /home/ubuntu/adventure-buddha

# Make scripts executable
chmod +x deploy.sh
chmod +x backend/deploy.sh

# Create environment files if they don't exist
if [ ! -f .env ]; then
    echo "📋 Creating frontend .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your actual configuration"
fi

if [ ! -f backend/.env ]; then
    echo "📋 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your actual configuration"
fi

# Set up automatic security updates
echo "🔒 Setting up automatic security updates..."
sudo dpkg-reconfigure --priority=low unattended-upgrades

# Set up log rotation
echo "📊 Setting up log rotation..."
sudo tee /etc/logrotate.d/adventure-buddha > /dev/null <<EOF
/home/ubuntu/deployment_*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 ubuntu ubuntu
}
EOF

echo ""
echo "✅ CI/CD setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit /home/ubuntu/adventure-buddha/.env with your configuration"
echo "2. Edit /home/ubuntu/adventure-buddha/backend/.env with your configuration"
echo "3. Add the following secrets to your GitHub repository:"
echo "   - VM_HOST: $(curl -s ifconfig.me)"
echo "   - VM_USER: ubuntu"
echo "   - VM_SSH_PRIVATE_KEY: (content of ~/.ssh/id_rsa)"
echo "4. Push to main branch to trigger deployment"
echo ""
echo "🔗 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Restart services: docker-compose restart"
echo "  Check status: docker-compose ps"
echo "  View deployment logs: tail -f /home/ubuntu/deployment_*.log"