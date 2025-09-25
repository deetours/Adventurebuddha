#!/usr/bin/env python
"""
Setup script for authentication with Google OAuth
Run this after installing new requirements
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to the Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adventure_buddha_backend.settings')

django.setup()

def setup_auth():
    """Setup authentication with Google OAuth"""
    from django.core.management import execute_from_command_line

    print("Setting up authentication with Google OAuth...")

    # Run migrations for allauth
    print("Running migrations...")
    execute_from_command_line(['manage.py', 'migrate', '--verbosity=1'])

    print("\n✅ Authentication setup complete!")
    print("\nNext steps:")
    print("1. Set up Google OAuth credentials in Google Cloud Console")
    print("2. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file")
    print("3. Run the Django server: python manage.py runserver")
    print("4. Test the authentication endpoints")

if __name__ == '__main__':
    setup_auth()