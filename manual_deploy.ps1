# Manual Deployment Script for Adventure Buddha (Windows PowerShell)
# Run this locally to deploy to VM

param(
    [string]$VMHost = "68.233.115.38",
    [string]$VMUser = "ubuntu",
    [string]$SSHKeyPath = "$env:USERPROFILE\.ssh\id_rsa"
)

# Configuration
$VM_HOST = $VMHost
$VM_USER = $VMUser
$SSH_KEY_PATH = $SSHKeyPath

# Colors for output
$RED = "Red"
$GREEN = "Green"
$YELLOW = "Yellow"
$BLUE = "Blue"

function Write-Log {
    param([string]$Message, [string]$Color = $BLUE)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

function Write-Error {
    param([string]$Message)
    Write-Log "ERROR: $Message" $RED
}

function Write-Success {
    param([string]$Message)
    Write-Log "SUCCESS: $Message" $GREEN
}

function Write-Warning {
    param([string]$Message)
    Write-Log "WARNING: $Message" $YELLOW
}

# Test SSH connection
Write-Log "Testing SSH connection to $VM_HOST..."
try {
    $testCmd = "echo 'SSH connection successful'"
    $result = ssh -i $SSH_KEY_PATH -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$VM_USER@$VM_HOST" $testCmd 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "SSH connection successful"
    } else {
        throw "SSH connection failed"
    }
} catch {
    Write-Error "Cannot connect to VM via SSH. Please check:"
    Write-Error "  1. SSH key path: $SSH_KEY_PATH"
    Write-Error "  2. VM is running: $VM_HOST"
    Write-Error "  3. SSH key is added to VM authorized_keys"
    Write-Error "  4. OpenSSH is installed (run: winget install --id Microsoft.OpenSSH.Beta)"
    exit 1
}

# Create deployment directory
Write-Log "Creating deployment directory on VM..."
ssh -i $SSH_KEY_PATH "$VM_USER@$VM_HOST" "mkdir -p /home/ubuntu/adventure-buddha-deploy"

# Copy files to VM
Write-Log "Copying deployment files to VM..."
scp -i $SSH_KEY_PATH deploy.sh "$VM_USER@$VM_HOST`:/home/ubuntu/adventure-buddha-deploy/"
scp -i $SSH_KEY_PATH backend/adventure-buddha-backend.service "$VM_USER@$VM_HOST`:/home/ubuntu/adventure-buddha-deploy/"
scp -i $SSH_KEY_PATH backend/.env.example "$VM_USER@$VM_HOST`:/home/ubuntu/adventure-buddha-deploy/backend-env.example"
scp -i $SSH_KEY_PATH .env.example "$VM_USER@$VM_HOST`:/home/ubuntu/adventure-buddha-deploy/"

# Copy entire backend directory
Write-Log "Copying backend code to VM..."
scp -i $SSH_KEY_PATH -r backend "$VM_USER@$VM_HOST`:/home/ubuntu/adventure-buddha-deploy/"

# Make scripts executable and run deployment
Write-Log "Running deployment on VM..."
ssh -i $SSH_KEY_PATH "$VM_USER@$VM_HOST" "cd /home/ubuntu/adventure-buddha-deploy && chmod +x deploy.sh && ./deploy.sh"

# Wait for deployment to complete
Write-Log "Waiting for deployment to complete..."
Start-Sleep -Seconds 30

# Test the deployment
Write-Log "Testing deployed API..."
$healthCheck = ssh -i $SSH_KEY_PATH "$VM_USER@$VM_HOST" "curl -f http://localhost:8000/api/health/ 2>/dev/null"
if ($LASTEXITCODE -eq 0) {
    Write-Success "Deployment successful! API is responding."
    Write-Success "Your app should be available at: http://$VM_HOST`:8000/api/trips/"
} else {
    Write-Warning "API health check failed. Checking service status..."
    ssh -i $SSH_KEY_PATH "$VM_USER@$VM_HOST" "sudo systemctl status adventure-buddha-backend"
}

Write-Success "Manual deployment completed!"