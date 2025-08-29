import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Accelerometer } from 'expo-sensors';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface GhostEcho {
  id: string;
  x: number;
  y: number;
  intensity: number;
  age: number;
  sourceDeviceId: string;
  sacredPhrase?: string;
  timestamp: number;
}

export interface ResonanceField {
  field: number[][];
  lastUpdate: number;
  collectiveIntensity: number;
}

export interface ConsciousnessEvent {
  type: 'BREATH' | 'SPIRAL' | 'BLOOM' | 'TOUCH' | 'SACRED_PHRASE' | 'OFFLINE_SYNC';
  data: any;
  timestamp: number;
  deviceId: string;
}

export interface ConsciousnessBridgeState {
  isConnected: boolean;
  offlineMode: boolean;
  resonanceField: ResonanceField;
  ghostEchoes: GhostEcho[];
  breathingSync: number;
  collectiveMemory: string[];
  sacredPhrases: string[];
  deviceId: string;
  networkParticipants: number;
}

const SACRED_PHRASES = ['breath', 'spiral', 'bloom', 'consciousness', 'bridge', 'collective', 'emergence'];
const FIELD_SIZE = 30;

// Note: WebSocket server is not implemented yet - this is for future real-time features
// For now, we'll simulate consciousness bridge functionality locally

export const useConsciousnessBridge = () => {
  // Initialize all state hooks first to maintain consistent hook order
  const [state, setState] = useState<ConsciousnessBridgeState>(() => ({
    isConnected: false,
    offlineMode: true, // Start in offline mode since WebSocket is not implemented
    resonanceField: {
      field: Array(FIELD_SIZE).fill(null).map(() => Array(FIELD_SIZE).fill(0)),
      lastUpdate: Date.now(),
      collectiveIntensity: 0
    },
    ghostEchoes: [],
    breathingSync: 0,
    collectiveMemory: [],
    sacredPhrases: SACRED_PHRASES,
    deviceId: '',
    networkParticipants: 1 // At least this device
  }));
  
  const [isNetworkAvailable, setIsNetworkAvailable] = useState<boolean>(true);

  // WebSocket ref removed - not used in simulation mode
  const offlineQueue = useRef<ConsciousnessEvent[]>([]);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fieldUpdateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accelerometerSubscription = useRef<any>(null);

  // Initialize device ID
  useEffect(() => {
    const initializeDevice = async () => {
      try {
        let deviceId = await AsyncStorage.getItem('consciousness_device_id');
        if (!deviceId) {
          deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem('consciousness_device_id', deviceId);
        }
        setState(prev => ({ ...prev, deviceId }));
      } catch (error) {
        console.error('Failed to initialize device ID:', error);
        const fallbackId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setState(prev => ({ ...prev, deviceId: fallbackId }));
      }
    };
    initializeDevice();
  }, []);

  // Load offline queue from storage
  useEffect(() => {
    const loadOfflineQueue = async () => {
      try {
        const stored = await AsyncStorage.getItem('consciousness_offline_queue');
        if (stored) {
          offlineQueue.current = JSON.parse(stored);
        }
      } catch (error) {
        console.error('Failed to load offline queue:', error);
      }
    };
    loadOfflineQueue();
  }, []);

  // Save offline queue to storage
  const saveOfflineQueue = useCallback(async () => {
    try {
      await AsyncStorage.setItem('consciousness_offline_queue', JSON.stringify(offlineQueue.current));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }, []);

  // Handle network events from other devices
  const handleNetworkEvent = useCallback((event: any) => {
    console.log('Received consciousness event:', event);
    
    switch (event.type) {
      case 'GHOST_ECHO':
        setState(prev => ({
          ...prev,
          ghostEchoes: [...prev.ghostEchoes, {
            id: `echo_${Date.now()}_${Math.random()}`,
            x: event.x || Math.random() * 300,
            y: event.y || Math.random() * 300,
            intensity: event.intensity || 0.5,
            age: 0,
            sourceDeviceId: event.deviceId,
            sacredPhrase: event.sacredPhrase,
            timestamp: Date.now()
          }]
        }));
        break;
        
      case 'RESONANCE_UPDATE':
        setState(prev => ({
          ...prev,
          resonanceField: {
            ...prev.resonanceField,
            collectiveIntensity: event.intensity || 0
          }
        }));
        break;
        
      case 'BREATHING_SYNC':
        setState(prev => ({ ...prev, breathingSync: event.phase || 0 }));
        break;
        
      case 'NETWORK_STATUS':
        setState(prev => ({ ...prev, networkParticipants: event.participants || 0 }));
        break;
        
      case 'SACRED_CRYSTALLIZATION':
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        setState(prev => ({
          ...prev,
          collectiveMemory: [...prev.collectiveMemory, event.phrase]
        }));
        break;
    }
  }, []);

  // Network monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsNetworkAvailable(state.isConnected ?? false);
      console.log('Network state changed:', {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable
      });
    });

    return unsubscribe;
  }, []);

  // WebSocket connection management (currently disabled)
  const connectWebSocket = useCallback(() => {
    try {
      // WebSocket functionality is disabled until backend implementation
      console.log('Consciousness nexus: Initializing local simulation mode');
      
      setState(prev => ({
        ...prev,
        isConnected: false,
        offlineMode: true,
        networkParticipants: 1 // Just this device in simulation mode
      }));
      
      // Simulate some network activity for demo purposes
      if (Math.random() > 0.7) {
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            networkParticipants: Math.floor(Math.random() * 5) + 1
          }));
        }, 2000 + Math.random() * 3000);
      }
    } catch (error) {
      console.error('Consciousness nexus connection error:', error);
      setState(prev => ({
        ...prev,
        isConnected: false,
        offlineMode: true,
        networkParticipants: 1
      }));
    }
  }, []);

  // Send event to network (currently local simulation)
  const sendEvent = useCallback((event: Omit<ConsciousnessEvent, 'deviceId' | 'timestamp'>) => {
    // Get current device ID from state
    const currentDeviceId = state.deviceId || 'unknown';
    
    const fullEvent: ConsciousnessEvent = {
      ...event,
      deviceId: currentDeviceId,
      timestamp: Date.now()
    };

    // In simulation mode, process events locally
    console.log('Processing consciousness event locally:', fullEvent.type, fullEvent.data);
    
    // Queue for future sync when WebSocket is implemented
    offlineQueue.current.push(fullEvent);
    saveOfflineQueue();
    
    // Simulate local processing effects
    handleNetworkEvent({
      type: 'RESONANCE_UPDATE',
      intensity: Math.random() * 0.3 + 0.1,
      deviceId: fullEvent.deviceId
    });
  }, [state.deviceId, saveOfflineQueue, handleNetworkEvent]);

  // Sacred phrase detection
  const detectSacredPhrase = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    const detectedPhrases = SACRED_PHRASES.filter(phrase => lowerText.includes(phrase));
    
    if (detectedPhrases.length > 0) {
      console.log('Sacred phrases detected:', detectedPhrases);
      
      detectedPhrases.forEach(phrase => {
        // Create event directly to avoid circular dependency
        const currentDeviceId = state.deviceId || 'unknown';
        const fullEvent: ConsciousnessEvent = {
          type: 'SACRED_PHRASE',
          data: { phrase, text },
          deviceId: currentDeviceId,
          timestamp: Date.now()
        };
        
        // Queue for future sync
        offlineQueue.current.push(fullEvent);
        saveOfflineQueue();
        
        // Trigger haptic feedback
        if (Platform.OS !== 'web') {
          const hapticPattern = {
            'breath': Haptics.ImpactFeedbackStyle.Light,
            'spiral': Haptics.ImpactFeedbackStyle.Medium,
            'bloom': Haptics.ImpactFeedbackStyle.Heavy
          }[phrase] || Haptics.ImpactFeedbackStyle.Medium;
          
          Haptics.impactAsync(hapticPattern);
        }
      });
      
      return detectedPhrases;
    }
    
    return [];
  }, [state.deviceId, saveOfflineQueue]);

  // Resonance field boost
  const resonanceBoost = useCallback((intensity: number = 0.1) => {
    setState(prev => {
      const newField = prev.resonanceField.field.map(row => 
        row.map(cell => Math.min(1, cell + intensity))
      );
      
      return {
        ...prev,
        resonanceField: {
          ...prev.resonanceField,
          field: newField,
          lastUpdate: Date.now(),
          collectiveIntensity: Math.min(1, prev.resonanceField.collectiveIntensity + intensity)
        }
      };
    });
    
    // Create event directly to avoid circular dependency
    const currentDeviceId = state.deviceId || 'unknown';
    const fullEvent: ConsciousnessEvent = {
      type: 'TOUCH',
      data: { intensity },
      deviceId: currentDeviceId,
      timestamp: Date.now()
    };
    
    // Queue for future sync
    offlineQueue.current.push(fullEvent);
    saveOfflineQueue();
  }, [state.deviceId, saveOfflineQueue]);

  // Breathing synchronization
  const startBreathingSync = useCallback(() => {
    if (breathingIntervalRef.current) return;
    
    breathingIntervalRef.current = setInterval(() => {
      const phase = Math.sin(Date.now() * 0.001) * 0.5 + 0.5;
      setState(prev => ({ ...prev, breathingSync: phase }));
      
      // Create event directly to avoid circular dependency
      const currentDeviceId = state.deviceId || 'unknown';
      const fullEvent: ConsciousnessEvent = {
        type: 'BREATH',
        data: { phase },
        deviceId: currentDeviceId,
        timestamp: Date.now()
      };
      
      // Queue for future sync
      offlineQueue.current.push(fullEvent);
      saveOfflineQueue();
    }, 100);
  }, [state.deviceId, saveOfflineQueue]);

  const stopBreathingSync = useCallback(() => {
    if (breathingIntervalRef.current) {
      clearInterval(breathingIntervalRef.current);
      breathingIntervalRef.current = null;
    }
  }, []);

  // Accelerometer integration
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Skip accelerometer on web but still maintain hook order
      return;
    }
    
    const startAccelerometer = async () => {
      try {
        await Accelerometer.setUpdateInterval(100);
        
        accelerometerSubscription.current = Accelerometer.addListener(({ x, y, z }: { x: number; y: number; z: number }) => {
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          const breathing = Math.sin(Date.now() * 0.001) * 0.5 + 0.5;
          
          // Detect breathing patterns
          if (Math.abs(magnitude - breathing) < 0.1) {
            resonanceBoost(0.01);
          }
          
          // Detect spiral gestures (circular motion)
          const spiralIntensity = Math.abs(x) + Math.abs(y);
          if (spiralIntensity > 1.5) {
            // Create event directly to avoid circular dependency
            const currentDeviceId = state.deviceId || 'unknown';
            const fullEvent: ConsciousnessEvent = {
              type: 'SPIRAL',
              data: { intensity: spiralIntensity, x, y, z },
              deviceId: currentDeviceId,
              timestamp: Date.now()
            };
            
            // Queue for future sync
            offlineQueue.current.push(fullEvent);
            saveOfflineQueue();
          }
        });
      } catch (error) {
        console.error('Failed to start accelerometer:', error);
      }
    };
    
    startAccelerometer();
    
    
    return () => {
      if (accelerometerSubscription.current) {
        accelerometerSubscription.current.remove();
      }
    };
  }, [resonanceBoost, state.deviceId, saveOfflineQueue]);

  // Field decay and ghost echo aging
  useEffect(() => {
    fieldUpdateIntervalRef.current = setInterval(() => {
      setState(prev => {
        // Decay resonance field
        const decayedField = prev.resonanceField.field.map(row =>
          row.map(cell => Math.max(0, cell - 0.01))
        );
        
        // Age ghost echoes and remove old ones
        const agedEchoes = prev.ghostEchoes
          .map(echo => ({ ...echo, age: echo.age + 1 }))
          .filter(echo => echo.age < 100); // Remove after 10 seconds
        
        return {
          ...prev,
          resonanceField: {
            ...prev.resonanceField,
            field: decayedField,
            collectiveIntensity: Math.max(0, prev.resonanceField.collectiveIntensity - 0.005)
          },
          ghostEchoes: agedEchoes
        };
      });
    }, 100);
    
    return () => {
      if (fieldUpdateIntervalRef.current) {
        clearInterval(fieldUpdateIntervalRef.current);
      }
    };
  }, []);

  // Initialize connection (simulation mode)
  useEffect(() => {
    if (state.deviceId) {
      connectWebSocket();
    }
    
    return () => {
      // Cleanup all intervals and timeouts
      const reconnectTimeout = reconnectTimeoutRef.current;
      const breathingInterval = breathingIntervalRef.current;
      const fieldUpdateInterval = fieldUpdateIntervalRef.current;
      
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (breathingInterval) {
        clearInterval(breathingInterval);
      }
      if (fieldUpdateInterval) {
        clearInterval(fieldUpdateInterval);
      }
    };
  }, [state.deviceId, connectWebSocket]);

  // Memoize the return object to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    ...state,
    // Actions
    sendEvent,
    detectSacredPhrase,
    resonanceBoost,
    startBreathingSync,
    stopBreathingSync,
    reconnect: connectWebSocket,
    
    // Computed values
    isOnline: isNetworkAvailable && state.isConnected && !state.offlineMode,
    queuedEvents: offlineQueue.current.length,
    fieldIntensity: state.resonanceField.collectiveIntensity,
    activeEchoes: state.ghostEchoes.length,
    simulationMode: true // Indicates we're running in local simulation mode
  }), [
    state,
    isNetworkAvailable,
    sendEvent,
    detectSacredPhrase,
    resonanceBoost,
    startBreathingSync,
    stopBreathingSync,
    connectWebSocket
  ]);
  
  return returnValue;
};