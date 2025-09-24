from rest_framework import serializers
from .models import ChatSession, ChatMessage, SupportAgent

class SupportAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportAgent
        fields = '__all__'

class ChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatSession
        fields = '__all__'

class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = '__all__'