import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { config } from '../lib/config';

export interface WebSocketMessage {
  type: string;
  data?: Record<string, unknown>;
  timestamp?: string;
  activity?: Record<string, unknown>;
  notification?: Record<string, unknown>;
}

export interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: Record<string, unknown>) => void;
  reconnect: () => void;
  close: () => void;
}

export function useWebSocket(
  endpoint: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectAttempts = 3,
    reconnectInterval = 3000,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);
  const { token } = useAuthStore();

  const close = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const connect = useCallback(() => {
    if (!token) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}${config.WS_BASE_URL}${endpoint}`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        // Send authentication message after connection
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'auth',
            token: token,
          }));
        }

        setIsConnected(true);
        reconnectCountRef.current = 0;
        onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();

        // Attempt to reconnect if not manually closed
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      onError?.(error as Event);
    }
  }, [token, endpoint, onConnect, onDisconnect, onError, onMessage, reconnectAttempts, reconnectInterval]);

  const sendMessage = useCallback((message: Record<string, unknown>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  const reconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    reconnectCountRef.current = 0;
    close();
    connect();
  }, [connect, close]);

  useEffect(() => {
    if (token) {
      connect();
    } else {
      close();
    }

    return () => {
      close();
    };
  }, [token, connect, close]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      close();
    };
  }, [close]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect,
    close,
  };
}

// Specialized hooks for different WebSocket endpoints

export function useDashboardWebSocket(options: UseWebSocketOptions = {}) {
  return useWebSocket('/dashboard/', options);
}

export function useNotificationWebSocket(options: UseWebSocketOptions = {}) {
  return useWebSocket('/notifications/', options);
}

// Hook for dashboard real-time updates
export function useRealtimeDashboard() {
  const [dashboardData, setDashboardData] = useState<Record<string, unknown> | null>(null);
  const [activities, setActivities] = useState<Record<string, unknown>[]>([]);

  const { isConnected, sendMessage } = useDashboardWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'dashboard_update':
          setDashboardData(message.data || null);
          break;
        case 'activity_update':
          setActivities(prev => [message.activity || {}, ...prev.slice(0, 9)]); // Keep last 10
          break;
      }
    },
  });

  const requestUpdate = useCallback(() => {
    sendMessage({ type: 'request_update' });
  }, [sendMessage]);

  return {
    dashboardData,
    activities,
    isConnected,
    requestUpdate,
  };
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<Record<string, unknown>[]>([]);

  const { isConnected } = useNotificationWebSocket({
    onMessage: (message) => {
      if (message.type === 'notification') {
        setNotifications(prev => [message.notification || {}, ...prev]);
      }
    },
  });

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    isConnected,
    markAsRead,
    clearNotifications,
  };
}