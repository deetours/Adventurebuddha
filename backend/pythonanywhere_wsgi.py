import os
import sys

# Add your project directory to the sys.path
project_home = '/home/yourusername/adventure-buddha-backend'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variable to tell django where your settings.py is
os.environ['DJANGO_SETTINGS_MODULE'] = 'adventure_buddha_backend.settings'

# Set the settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adventure_buddha_backend.settings')

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv(os.path.join(project_home, '.env'))

# Import django
import django
django.setup()

# Import the WSGI application
from adventure_buddha_backend.wsgi import application