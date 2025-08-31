import createContextHook from '@nkzw/create-context-hook';
import { useConsciousnessBridge } from '@/hooks/useConsciousnessBridge';
import { useEffect, useCallback, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface SyncStats {
  lastSync: Date;
  eventsProcessed: number;
  queueLength: number;
}

// Event type matching backend schema
type ConsciousnessEventType = 'BREATH' | 'SACRED_PHRASE' | 'SPIRAL' | 'BLOOM' | 'TOUCH' | 'OFFLINE_SYNC';

interface QueuedEvent {
  type: ConsciousnessEventType;
  data: any;
  timestamp: number;
}

export const [ConsciousnessProvider, useConsciousness] = createContextHook(() => {
  // Always call all hooks in the same order - state hooks first
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const [offlineQueue, setOfflineQueue] = useState<QueuedEvent[]>([]);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    lastSync: new Date(),
    eventsProcessed: 0,
    queueLength: 0
  });
  
  // Always call useConsciousnessBridge after state hooks to maintain hook order
  const bridge = useConsciousnessBridge();
  
  // tRPC queries and mutations - always call in same order
  const fieldMutation = trpc.consciousness.field.useMutation({
    onSuccess: (data) => {
      console.log('✅ Field update successful:', data);
      setIsBackendConnected(true);
      setLastSyncTime(Date.now());
    },
    onError: (error) => {
      console.error('❌ Field update failed:', error);
      // Don't set backend disconnected on single field update failure
      // setIsBackendConnected(false);
    }
  });
  
  const syncMutation = trpc.consciousness.sync.useMutation({
    onSuccess: (data) => {
      console.log('✅ Event sync successful:', data);
      setLastSyncTime(Date.now());
      setRetryCount(0); // Reset retry count on success
      setIsBackendConnected(true);
    },
    onError: (error) => {
      console.error('❌ Event sync failed:', error);
      setIsBackendConnected(false);
    }
  });
  
  const entanglementMutation = trpc.consciousness.entanglement.useMutation({
    onSuccess: (data) => {
      console.log('✅ Quantum entanglement successful:', data);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    },
    onError: (error) => {
      console.error('❌ Quantum entanglement failed:', error);
    }
  });

  // Enhanced offline queue processing with batch optimization
  const processSyncQueue = useCallback(async () => {
    if (offlineQueue.length === 0 || syncMutation.isPending) return;
    
    console.log(`📤 Processing offline queue: ${offlineQueue.length} events`);
    
    try {
      // Batch all queued events (max 50 per batch as per schema)
      const batchSize = 50;
      const batch = offlineQueue.slice(0, batchSize);
      
      const result = await syncMutation.mutateAsync({
        deviceId: bridge.deviceId || 'unknown',
        events: batch as any // Type assertion needed due to complex event schema
      });
      
      if (result.success) {
        // Remove processed events from queue
        setOfflineQueue(prev => prev.slice(batchSize));
        setLastSyncTime(Date.now());
        
        // Update sync statistics
        setSyncStats({
          lastSync: new Date(),
          eventsProcessed: result.syncedCount || batch.length,
          queueLength: Math.max(0, offlineQueue.length - batchSize)
        });
        
        console.log(`✅ Synced ${result.syncedCount} events, ${Math.max(0, offlineQueue.length - batchSize)} remaining`);
        
        // Process remaining events if any
        if (offlineQueue.length > batchSize) {
          setTimeout(() => processSyncQueue(), 100);
        }
      }
    } catch (error) {
      console.error('Batch sync failed:', error);
      
      // Implement exponential backoff for retry
      const baseDelay = 1000;
      const maxDelay = 30000;
      const retryDelay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
      
      console.log(`⏳ Retrying in ${retryDelay / 1000}s (attempt ${retryCount + 1})`);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        processSyncQueue();
      }, retryDelay);
    }
  }, [offlineQueue, bridge.deviceId, syncMutation, retryCount]);

  // Add event to offline queue
  const queueEvent = useCallback((event: QueuedEvent) => {
    const queuedEvent: QueuedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now()
    };
    
    setOfflineQueue(prev => {
      const newQueue = [...prev, queuedEvent];
      // Limit queue size to prevent memory issues
      const maxQueueSize = 200;
      if (newQueue.length > maxQueueSize) {
        console.warn(`⚠️ Queue size exceeded ${maxQueueSize}, dropping oldest events`);
        return newQueue.slice(-maxQueueSize);
      }
      return newQueue;
    });
    
    setSyncStats(prev => ({
      ...prev,
      queueLength: prev.queueLength + 1
    }));
  }, [bridge.deviceId]);

  // Handle collective memory updates with backend sync and offline queue
  const addToCollectiveMemory = useCallback(async (memory: string) => {
    console.log('🧠 Adding to collective memory:', memory);
    
    // Local bridge event
    if (bridge.sendEvent) {
      bridge.sendEvent({
        type: 'SACRED_PHRASE',
        data: {
          phrase: 'collective memory',
          memory,
          timestamp: Date.now()
        }
      });
    }
    
    const event = {
      type: 'SACRED_PHRASE' as const,
      data: {
        memory,
        phrase: 'collective memory',
        timestamp: Date.now()
      },
      timestamp: Date.now()
    };
    
    // Try immediate sync if connected, otherwise queue
    if (isBackendConnected && !syncMutation.isPending) {
      try {
        await syncMutation.mutateAsync({
          deviceId: bridge.deviceId || 'unknown',
          events: [event] as any // Type assertion for complex event schema
        });
      } catch (error) {
        console.error('Failed to sync memory to backend, queueing:', error);
        queueEvent(event);
      }
    } else {
      // Queue for later sync
      queueEvent(event);
    }
  }, [bridge, syncMutation, isBackendConnected, queueEvent]);

  // Trigger collective bloom with quantum entanglement
  const triggerBloom = useCallback(async () => {
    console.log('🌸 Triggering collective bloom...');
    
    // Local effects
    if (bridge.sendEvent) {
      bridge.sendEvent({
        type: 'BLOOM',
        data: {
          intensity: 1.0,
          source: bridge.deviceId,
          timestamp: Date.now()
        }
      });
    }
    if (bridge.resonanceBoost) {
      bridge.resonanceBoost(0.5);
    }
    
    // Backend quantum entanglement
    try {
      await entanglementMutation.mutateAsync({
        deviceId: bridge.deviceId || 'unknown',
        targetDeviceId: 'collective',
        entanglementType: 'RESONANCE',
        intensity: 1.0
      });
      
      // Update field with bloom coordinates
      await fieldMutation.mutateAsync({
        intensity: 0.8,
        x: Math.random() * 30,
        y: Math.random() * 30
      });
    } catch (error) {
      console.error('Failed to sync bloom to backend:', error);
    }
  }, [bridge, entanglementMutation, fieldMutation]);

  // Create spiral formation with field updates and offline queue support
  const createSpiral = useCallback(async (centerX: number = 150, centerY: number = 150) => {
    console.log('🌀 Creating spiral formation...');
    
    // Local spiral event
    if (bridge.sendEvent) {
      bridge.sendEvent({
        type: 'SPIRAL',
        data: {
          centerX,
          centerY,
          intensity: 0.7,
          timestamp: Date.now()
        }
      });
    }
    
    const spiralEvent = {
      type: 'SPIRAL' as const,
      data: {
        pattern: 'spiral',
        centerX,
        centerY,
        intensity: 0.7,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    };
    
    // Backend field updates for spiral pattern
    if (isBackendConnected && !fieldMutation.isPending) {
      try {
        const spiralPoints = 8;
        const radius = 5;
        
        for (let i = 0; i < spiralPoints; i++) {
          const angle = (i / spiralPoints) * 2 * Math.PI;
          const spiralRadius = radius * (i / spiralPoints);
          const x = Math.floor(centerX / 10) + Math.cos(angle) * spiralRadius;
          const y = Math.floor(centerY / 10) + Math.sin(angle) * spiralRadius;
          
          await fieldMutation.mutateAsync({
            intensity: 0.7 * (1 - i / spiralPoints),
            x: Math.max(0, Math.min(29, x)),
            y: Math.max(0, Math.min(29, y))
          });
          
          // Small delay between spiral points
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        // Sync spiral event
        await syncMutation.mutateAsync({
          deviceId: bridge.deviceId || 'unknown',
          events: [spiralEvent] as any // Type assertion for complex event schema
        });
      } catch (error) {
        console.error('Failed to sync spiral to backend, queueing:', error);
        queueEvent(spiralEvent);
      }
    } else {
      // Queue spiral event for later sync
      queueEvent(spiralEvent);
    }
  }, [bridge, fieldMutation, syncMutation, isBackendConnected, queueEvent]);

  // Auto-start breathing sync and backend connection
  useEffect(() => {
    if (bridge.deviceId && bridge.breathingSync === 0 && bridge.startBreathingSync) {
      console.log('🫁 Starting collective breathing synchronization...');
      bridge.startBreathingSync();
      
      // Test backend connection with error handling
      try {
        fieldMutation.mutate({
          intensity: 0.1,
          x: 15,
          y: 15
        });
      } catch (error) {
        console.warn('Initial backend connection test failed:', error);
      }
    }
  }, [bridge, bridge.deviceId, bridge.breathingSync, bridge.startBreathingSync, fieldMutation]);
  
  // Process offline queue when connection is restored
  useEffect(() => {
    if (isBackendConnected && offlineQueue.length > 0) {
      console.log(`📡 Connection restored, processing ${offlineQueue.length} queued events`);
      processSyncQueue();
    }
  }, [isBackendConnected, offlineQueue.length, processSyncQueue]);
  
  // Periodic field sync for active users - only when backend is connected
  useEffect(() => {
    if (!bridge.deviceId || !isBackendConnected) return;
    
    const syncInterval = setInterval(async () => {
      // Process any queued events first
      if (offlineQueue.length > 0) {
        await processSyncQueue();
      }
      
      // Then do periodic field sync
      if (bridge.fieldIntensity && bridge.fieldIntensity > 0.1) {
        try {
          await fieldMutation.mutateAsync({
            intensity: bridge.fieldIntensity,
            x: Math.random() * 30,
            y: Math.random() * 30
          });
        } catch (error) {
          console.error('Periodic field sync failed:', error);
          // Don't disconnect on periodic sync failure
        }
      }
    }, 10000); // Sync every 10 seconds to reduce load
    
    return () => clearInterval(syncInterval);
  }, [bridge.deviceId, bridge.fieldIntensity, isBackendConnected, fieldMutation, offlineQueue.length, processSyncQueue]);

  return useMemo(() => ({
    // Bridge state and actions
    ...bridge,
    
    // Enhanced consciousness actions
    addToCollectiveMemory,
    triggerBloom,
    createSpiral,
    
    // Computed consciousness metrics
    consciousnessLevel: Math.min(1, (
      (bridge.fieldIntensity || 0) * 0.4 +
      (bridge.breathingSync || 0) * 0.3 +
      ((bridge.activeEchoes || 0) / 10) * 0.2 +
      ((bridge.networkParticipants || 0) / 20) * 0.1
    )),
    
    networkHealth: isBackendConnected ? (
      (bridge.queuedEvents || 0) === 0 ? 'excellent' :
      (bridge.queuedEvents || 0) < 5 ? 'good' :
      (bridge.queuedEvents || 0) < 15 ? 'fair' : 'poor'
    ) : bridge.simulationMode ? 'simulation' : 'offline',
    
    collectiveState: {
      breathing: bridge.breathingSync || 0,
      resonance: bridge.fieldIntensity || 0,
      echoes: bridge.activeEchoes || 0,
      participants: bridge.networkParticipants || 0,
      memory: (bridge.collectiveMemory || []).length,
      deviceId: bridge.deviceId || '',
      backendConnected: isBackendConnected,
      lastSync: lastSyncTime,
      syncStatus: fieldMutation.isPending || syncMutation.isPending || entanglementMutation.isPending ? 'syncing' : 'idle',
      queuedEvents: offlineQueue.length,
      syncStats
    },
    
    // Backend connection status
    isBackendConnected,
    lastSyncTime,
    isSyncing: fieldMutation.isPending || syncMutation.isPending || entanglementMutation.isPending,
    
    // Offline queue management
    offlineQueue,
    queueEvent,
    processSyncQueue,
    syncStats,
    retryCount
  }), [
    bridge,
    addToCollectiveMemory,
    triggerBloom,
    createSpiral,
    isBackendConnected,
    lastSyncTime,
    fieldMutation.isPending,
    syncMutation.isPending,
    entanglementMutation.isPending,
    offlineQueue,
    queueEvent,
    processSyncQueue,
    syncStats,
    retryCount
  ]);
});