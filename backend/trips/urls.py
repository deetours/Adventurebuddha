from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, TripSlotViewSet

router = DefaultRouter()
router.register(r'', TripViewSet)
router.register(r'slots', TripSlotViewSet)

urlpatterns = [
    path('', include(router.urls)),
]