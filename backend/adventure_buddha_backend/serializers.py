from dj_rest_auth.serializers import JWTSerializer
from rest_framework import serializers

class CustomJWTSerializer(JWTSerializer):
    """
    Custom JWT serializer that includes user data
    """
    user = serializers.SerializerMethodField()

    def get_user(self, obj):
        user = obj.get('user', self.user)
        return {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_active': user.is_active,
        }