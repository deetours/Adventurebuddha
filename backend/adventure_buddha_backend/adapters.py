from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.utils import user_email
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def populate_user(self, request, sociallogin, data):
        """
        Populates user with data from social account.
        """
        user = super().populate_user(request, sociallogin, data)

        # Extract additional data from Google
        if sociallogin.account.provider == 'google':
            user.first_name = data.get('given_name', '')
            user.last_name = data.get('family_name', '')
            # Email is already handled by allauth

        return user

    def save_user(self, request, sociallogin, form=None):
        """
        Saves a newly created user.
        """
        user = super().save_user(request, sociallogin, form)

        # Additional user setup can go here
        if sociallogin.account.provider == 'google':
            # Mark user as verified since Google accounts are pre-verified
            user.is_active = True
            user.save()

        return user