import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import TripSlot

class SeatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.slot_id = self.scope['url_route']['kwargs']['slot_id']
        self.room_group_name = f'seat_updates_{self.slot_id}'
        
        # Check if slot exists
        slot_exists = await self.slot_exists(self.slot_id)
        if not slot_exists:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        # Handle incoming messages if needed
        pass
    
    async def seat_update(self, event):
        # Send seat update to WebSocket
        await self.send(text_data=json.dumps({
            'event': event['event'],
            'seat_id': event['seat_id'],
            'by_user': event.get('by_user', None)
        }))
    
    @database_sync_to_async
    def slot_exists(self, slot_id):
        try:
            TripSlot.objects.get(id=slot_id)
            return True
        except TripSlot.DoesNotExist:
            return False