"""
URL configuration for adventure_buddha_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import GoogleCallbackView, health_check
from .firebase_auth import FirebaseAuthView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/trips/', include('trips.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/agents/', include('agents.urls')),
    path('api/messaging/', include('messaging.urls')),
    path('api/ai/', include('ai_agent.urls')),
    path('api/leads/', include('leads.urls')),
    path('', include('dashboard.urls')),  # Dashboard URLs
    
    # Authentication URLs
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/auth/social/', include('allauth.socialaccount.urls')),
    path('api/auth/social/google/', GoogleCallbackView.as_view(), name='google_callback'),
    path('api/auth/firebase/', FirebaseAuthView.as_view(), name='firebase_auth'),

    # JWT token endpoints (fallback)
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]