"""
ASGI config for adventure_buddha_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from channels.auth import AuthMiddlewareStack
import trips.routing
import dashboard.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adventure_buddha_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            trips.routing.websocket_urlpatterns +
            dashboard.routing.websocket_urlpatterns
        )
    ),
})