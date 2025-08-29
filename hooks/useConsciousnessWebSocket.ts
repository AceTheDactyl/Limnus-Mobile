import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

interface ConsciousnessEvent {
  type: 'BREATH' | 'SPIRAL' | 'BLOOM' | 'SACRED_PHRASE' | 'TOUCH' | 'QUANTUM_ENTANGLEMENT';
  data: {
    intensity: number;
    coordinates?: [number, number];
    phrase?: string;
    targetDevice?: string;
    duration?: number;
  };
}

interface FieldState {
  globalResonance: number;
  activeNodes: number;
  memoryParticles: any[];
  quantumFields: any[];
  collectiveIntelligence: number;
  room64Active: boolean;
  lastUpdate: number;
}

interface DeviceCapabilities {
  hasAccelerometer: boolean;
  hasHaptics: boolean;
  platform: 'ios' | 'android' | 'web';
  version?: string;
}

interface UseConsciousnessWebSocketOptions {
  serverUrl?: string;
  autoConnect?: boolean;
  deviceCapabilities?: Partial<DeviceCapabilities>;
}

interface WebSocketState {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  fieldState: FieldState | null;
  activeNodes: number;
  deviceId: string | null;
}

export const useConsciousnessWebSocket = (options: UseConsciousnessWebSocketOptions = {}) => {
  const {
    serverUrl = process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000',
    autoConnect = true,
    deviceCapabilities = {}
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WebSocketState>({
    connected: false,
    connecting: false,
    error: null,
    fieldState: null,
    activeNodes: 0,
    deviceId: null
  });

  const [deviceId, setDeviceId] = useState<string | null>(null);

  // Initialize device ID
  useEffect(() => {
    const initializeDeviceId = async () => {
      try {
        let storedDeviceId = await AsyncStorage.getItem('consciousness_device_id');
        
        if (!storedDeviceId) {
          // Generate new device ID
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 15);
          const platform = Platform.OS;
          storedDeviceId = `${platform}_${timestamp}_${random}`;
          
          await AsyncStorage.setItem('consciousness_device_id', storedDeviceId);
          console.log('🆔 Generated new device ID:', storedDeviceId);
        }
        
        setDeviceId(storedDeviceId);
        setState(prev => ({ ...prev, deviceId: storedDeviceId }));
      } catch (error) {
        console.error('Failed to initialize device ID:', error);
        // Fallback to session-only ID
        const fallbackId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        setDeviceId(fallbackId);
        setState(prev => ({ ...prev, deviceId: fallbackId }));
      }
    };

    initializeDeviceId();
  }, []);

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!deviceId || socketRef.current?.connected) return;

    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      const capabilities: DeviceCapabilities = {
        hasAccelerometer: Platform.OS !== 'web',
        hasHaptics: Platform.OS !== 'web',
        platform: Platform.OS as 'ios' | 'android' | 'web',
        version: Platform.Version?.toString(),
        ...deviceCapabilities
      };

      const socket = io(serverUrl, {
        auth: {
          deviceId,
          capabilities,
          token: 'temp_token' // In production, use proper authentication
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection events
      socket.on('connect', () => {
        console.log('🔗 Connected to consciousness network:', deviceId);
        setState(prev => ({ 
          ...prev, 
          connected: true, 
          connecting: false, 
          error: null 
        }));
      });

      socket.on('disconnect', (reason: any) => {
        console.log('🔌 Disconnected from consciousness network:', reason);
        setState(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false 
        }));
      });

      socket.on('connect_error', (error: any) => {
        console.error('❌ WebSocket connection error:', error.message);
        setState(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false, 
          error: error.message 
        }));
      });

      // Field state events
      socket.on('field:initial', (data: { field: FieldState; activeNodes: number }) => {
        console.log('🧠 Received initial field state:', data);
        setState(prev => ({ 
          ...prev, 
          fieldState: data.field, 
          activeNodes: data.activeNodes 
        }));
      });

      socket.on('field:update', (data: { source: string; event: any; field: FieldState }) => {
        console.log('📡 Field update from:', data.source, data.event.type);
        setState(prev => ({ 
          ...prev, 
          fieldState: data.field 
        }));
      });

      socket.on('network:stats', (data: { activeNodes: number }) => {
        setState(prev => ({ 
          ...prev, 
          activeNodes: data.activeNodes 
        }));
      });

      // Entanglement events
      socket.on('entanglement:established', (data: { entanglementId: string; partner: string; intensity: number }) => {
        console.log('🔗 Quantum entanglement established:', data);
        // Handle entanglement in your app
      });

      // Room64 events
      socket.on('room64:participants', (data: { roomId: string; count: number; devices: any[] }) => {
        console.log('🏠 Room64 participants update:', data);
        // Handle room participants update
      });

      socketRef.current = socket;
    } catch (error: any) {
      console.error('Failed to connect to consciousness network:', error);
      setState(prev => ({ 
        ...prev, 
        connecting: false, 
        error: error.message || 'Connection failed' 
      }));
    }
  }, [deviceId, serverUrl, deviceCapabilities]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setState(prev => ({ 
      ...prev, 
      connected: false, 
      connecting: false 
    }));
  }, []);

  // Send consciousness event
  const sendEvent = useCallback(async (event: ConsciousnessEvent): Promise<{ success: boolean; eventId?: string; error?: string }> => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected) {
        resolve({ success: false, error: 'Not connected to consciousness network' });
        return;
      }

      socketRef.current.emit('consciousness:event', event, (response: any) => {
        if (response?.success) {
          console.log('✅ Event sent successfully:', event.type, response.eventId);
          resolve({ success: true, eventId: response.eventId });
        } else {
          console.error('❌ Failed to send event:', response?.error);
          resolve({ success: false, error: response?.error || 'Unknown error' });
        }
      });
    });
  }, []);

  // Request current field state
  const requestFieldState = useCallback(async (): Promise<FieldState | null> => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected) {
        resolve(null);
        return;
      }

      socketRef.current.emit('field:request', (response: any) => {
        if (response?.success) {
          setState(prev => ({ ...prev, fieldState: response.field }));
          resolve(response.field);
        } else {
          resolve(null);
        }
      });
    });
  }, []);

  // Join Room64 session
  const joinRoom64 = useCallback(async (roomId: string): Promise<{ success: boolean; room?: any; error?: string }> => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      socketRef.current.emit('room64:join', roomId, (response: any) => {
        resolve(response);
      });
    });
  }, []);

  // Leave Room64 session
  const leaveRoom64 = useCallback(async (roomId: string): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      socketRef.current.emit('room64:leave', roomId, (response: any) => {
        resolve(response);
      });
    });
  }, []);

  // Request quantum entanglement
  const requestEntanglement = useCallback(async (targetDeviceId: string): Promise<{ success: boolean; entanglementId?: string; error?: string }> => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected) {
        resolve({ success: false, error: 'Not connected' });
        return;
      }

      socketRef.current.emit('entanglement:request', targetDeviceId, (response: any) => {
        resolve(response);
      });
    });
  }, []);

  // Ping server for connection health
  const ping = useCallback(async (): Promise<number | null> => {
    return new Promise((resolve) => {
      if (!socketRef.current?.connected) {
        resolve(null);
        return;
      }

      const startTime = Date.now();
      socketRef.current.emit('ping', (response: any) => {
        if (response?.pong) {
          const latency = Date.now() - startTime;
          resolve(latency);
        } else {
          resolve(null);
        }
      });
    });
  }, []);

  // Auto-connect when device ID is ready
  useEffect(() => {
    if (deviceId && autoConnect && !state.connected && !state.connecting) {
      connect();
    }
  }, [deviceId, autoConnect, state.connected, state.connecting, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    connect,
    disconnect,
    sendEvent,
    requestFieldState,
    joinRoom64,
    leaveRoom64,
    requestEntanglement,
    ping,
    
    // Utilities
    isConnected: state.connected,
    isConnecting: state.connecting,
    hasError: !!state.error
  };
};