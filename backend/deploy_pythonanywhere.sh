#!/bin/bash
# PythonAnywhere Deployment Script
# Run this in PythonAnywhere bash console

echo "🚀 Starting PythonAnywhere Deployment..."

# Navigate to project directory
cd ~/adventure-buddha-backend

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install requirements
echo "📚 Installing requirements..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Collect static files
echo "📄 Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser (optional - comment out if not needed)
echo "👤 Creating superuser..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@adventurebuddha.com', 'admin123')" | python manage.py shell

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your app should now be available at:"
echo "https://yourusername.pythonanywhere.com"
echo ""
echo "🔧 Next steps:"
echo "1. Update ALLOWED_HOSTS in settings.py"
echo "2. Update CORS_ALLOWED_ORIGINS with your Netlify URL"
echo "3. Configure environment variables in PythonAnywhere dashboard"
echo "4. Test the API endpoints"