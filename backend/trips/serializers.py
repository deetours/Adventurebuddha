from rest_framework import serializers
from .models import Trip, TripSlot, SeatMap

class TripSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripSlot
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    upcoming_slots = TripSlotSerializer(many=True, read_only=True)
    
    class Meta:
        model = Trip
        fields = '__all__'

class SeatMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatMap
        fields = '__all__'