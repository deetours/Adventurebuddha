from rest_framework import serializers
from .models import Lead

class LeadSerializer(serializers.ModelSerializer):
    """Serializer for Lead model"""

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'destination', 'travel_date',
            'travelers', 'budget', 'experience_level', 'interests',
            'status', 'source', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'status', 'source', 'created_at', 'updated_at']

    def validate_email(self, value):
        """Ensure email is unique for new leads"""
        if Lead.objects.filter(email=value).exists():
            # Allow updates to existing leads with same email
            if self.instance and self.instance.email == value:
                return value
            raise serializers.ValidationError("A lead with this email already exists.")
        return value

    def validate_phone(self, value):
        """Basic phone number validation"""
        if not value.replace('+', '').replace('-', '').replace(' ', '').isdigit():
            raise serializers.ValidationError("Please enter a valid phone number.")
        return value

    def validate_travelers(self, value):
        """Ensure travelers count is reasonable"""
        if value < 1 or value > 20:
            raise serializers.ValidationError("Number of travelers must be between 1 and 20.")
        return value

class LeadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new leads with simplified fields"""

    class Meta:
        model = Lead
        fields = [
            'name', 'email', 'phone', 'destination', 'travel_date',
            'travelers', 'budget', 'experience_level', 'interests'
        ]

    def create(self, validated_data):
        # Add source and extract IP from request if available
        request = self.context.get('request')
        if request:
            validated_data['ip_address'] = self.get_client_ip(request)
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')

        return super().create(validated_data)

    def get_client_ip(self, request):
        """Get client IP address from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip