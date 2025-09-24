from django.urls import path
from .views import PaymentViewSet

urlpatterns = [
    path('razorpay/create-order/', PaymentViewSet.as_view({'post': 'razorpay_create_order'}), name='razorpay-create-order'),
    path('razorpay/verify/', PaymentViewSet.as_view({'post': 'razorpay_verify'}), name='razorpay-verify'),
    path('upiqr/', PaymentViewSet.as_view({'post': 'upiqr'}), name='upi-qr'),
    path('manual-upload/', PaymentViewSet.as_view({'post': 'manual_upload'}), name='manual-upload'),
]