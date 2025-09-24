import { useEffect, useRef, useCallback } from 'react';
import { useBookingStore } from '../stores/bookingStore';
import { config } from '../lib/config';
import type { WSMessage } from '../lib/types';

export function useSeatWebSocket(slotId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const { handleSeatUpdate } = useBookingStore();

  const connect = useCallback(() => {
    if (!slotId || config.USE_MOCK_API) {
      // In mock mode, simulate periodic seat updates
      if (config.USE_MOCK_API && slotId) {
        const interval = setInterval(() => {
          // Simulate random seat events
          const events = ['seat_locked', 'seat_unlocked', 'seat_booked'] as const;
          const seats = ['A1', 'B2', 'C3'];
          const randomEvent = events[Math.floor(Math.random() * events.length)];
          const randomSeat = seats[Math.floor(Math.random() * seats.length)];
          
          handleSeatUpdate(randomEvent, randomSeat);
        }, 10000); // Every 10 seconds

        return () => clearInterval(interval);
      }
      return;
    }

    const wsUrl = `${config.WS_BASE_URL}/seats/${slotId}/`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          handleSeatUpdate(message.event, message.seat_id);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000;
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [slotId, handleSeatUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    reconnectAttempts.current = 0;
  }, []);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    isConnected: config.USE_MOCK_API ? true : wsRef.current?.readyState === WebSocket.OPEN,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
}