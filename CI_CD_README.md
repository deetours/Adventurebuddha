# CI/CD Setup for Adventure Buddha

This document explains how to set up automated CI/CD for the Adventure Buddha application using GitHub Actions.

## Overview

The CI/CD pipeline provides:
- Automated testing on every push and PR
- Automated deployment to Ubuntu VM on main branch pushes
- Automatic rollback on deployment failures
- Health checks and monitoring
- No manual intervention required

## Prerequisites

### 1. GitHub Repository Setup
- Repository must be public or have GitHub Actions enabled
- Main branch protection rules (recommended)

### 2. Ubuntu VM Setup
- Ubuntu 20.04+ server
- SSH access configured
- Sudo privileges for deployment user
- Firewall configured (ports 22, 80, 443, 3000, 8000)

### 3. Required Secrets in GitHub
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```
VM_HOST=your-vm-ip-or-domain.com
VM_USER=ubuntu
VM_SSH_PRIVATE_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
                   your-private-key-here
                   -----END OPENSSH PRIVATE KEY-----
WEBHOOK_URL=https://hooks.slack.com/... (optional)
```

## Setup Instructions

### 1. VM Preparation

SSH into your VM and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git ufw

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 8000/tcp
sudo ufw --force enable

# Create deployment user (optional, but recommended)
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy
sudo mkdir -p /home/deploy/.ssh
sudo chown deploy:deploy /home/deploy/.ssh

# Copy your SSH public key
# (You'll need this for GitHub Actions)
```

### 2. Environment Configuration

Create environment files on your VM:

```bash
# Frontend .env
sudo mkdir -p /home/ubuntu/adventure-buddha
cat > /home/ubuntu/adventure-buddha/.env << EOF
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws
VITE_RAZORPAY_KEY=your_razorpay_key
VITE_USE_MOCK_API=false
EOF

# Backend .env
sudo mkdir -p /home/ubuntu/adventure-buddha/backend
cat > /home/ubuntu/adventure-buddha/backend/.env << EOF
DEBUG=False
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=your-domain.com,your-vm-ip

DB_NAME=adventure_buddha
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

REDIS_URL=redis://redis:6379/0

# Add other required environment variables
OPENROUTER_API_KEY=your-key
# ... etc
EOF
```

### 3. GitHub Actions Setup

The CI/CD pipeline is already configured in `.github/workflows/deploy.yml`. It will:

1. **Test Stage**: Run tests for both frontend and backend
2. **Deploy Stage**: Deploy to VM if tests pass
3. **Health Check**: Verify deployment success
4. **Rollback**: Automatic rollback on failure

### 4. Initial Deployment

For the first deployment, you need to manually set up the VM:

```bash
# On your VM
git clone https://github.com/your-username/adventure-buddha.git
cd adventure-buddha
chmod +x deploy.sh
./deploy.sh
```

## How It Works

### Automatic Triggers

- **Push to main**: Full CI/CD pipeline (test + deploy)
- **Pull Request**: Only testing (no deployment)
- **Manual trigger**: Can be triggered manually from GitHub Actions tab

### Deployment Process

1. **Code Checkout**: Latest code is pulled from GitHub
2. **Testing**: Frontend and backend tests run
3. **Backup**: Current deployment is backed up
4. **Build**: Docker images are built
5. **Deploy**: Services are updated with zero downtime
6. **Health Check**: Services are verified to be working
7. **Cleanup**: Old backups are removed

### Rollback Process

If deployment fails:
1. Previous version is automatically restored
2. GitHub issue is created with failure details
3. Notification is sent (if webhook configured)

## Monitoring

### Health Checks

The system includes health checks for:
- Database connectivity
- Redis connectivity
- API endpoints
- Frontend availability

### Logs

Deployment logs are stored on the VM:
- `/home/ubuntu/deployment_*.log`
- Docker container logs: `docker-compose logs`

### Notifications

Configure webhooks for notifications:
- Slack, Discord, or custom webhooks
- Email notifications via GitHub

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Check VM_HOST secret
   - Verify SSH key is correct
   - Ensure VM is accessible

2. **Health Check Failed**
   - Check service logs: `docker-compose logs`
   - Verify environment variables
   - Check database connectivity

3. **Deployment Timeout**
   - Increase timeout in workflow
   - Check VM resources
   - Verify Docker services start properly

### Manual Intervention

If automatic deployment fails, you can:

1. **Manual Deploy**: SSH into VM and run `./deploy.sh`
2. **Check Status**: `docker-compose ps`
3. **View Logs**: `docker-compose logs -f`
4. **Restart Services**: `docker-compose restart`

## Security Considerations

- SSH keys are encrypted in GitHub secrets
- Environment variables contain sensitive data
- VM should have minimal exposed services
- Regular security updates via automated scripts

## Cost Optimization

- GitHub Actions minutes are free for public repos
- VM costs depend on your cloud provider
- Consider spot instances for cost savings
- Set up auto-scaling if needed

## Advanced Configuration

### Custom Domains

Update nginx configuration for custom domains:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL Certificates

Use Let's Encrypt for free SSL:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Monitoring

Add monitoring with Prometheus/Grafana:

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

## Support

For issues with CI/CD setup:
1. Check GitHub Actions logs
2. Review deployment logs on VM
3. Test locally before pushing
4. Check GitHub repository settings

The CI/CD pipeline ensures reliable, automated deployments with automatic rollback capabilities.