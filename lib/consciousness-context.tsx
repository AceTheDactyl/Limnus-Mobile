import createContextHook from '@nkzw/create-context-hook';
import { useConsciousnessBridge } from '@/hooks/useConsciousnessBridge';
import { useEffect, useCallback, useMemo, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const [ConsciousnessProvider, useConsciousness] = createContextHook(() => {
  // Always call all hooks in the same order - state hooks first
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  
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
    },
    onError: (error) => {
      console.error('❌ Event sync failed:', error);
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

  // Handle collective memory updates with backend sync
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
    
    // Backend sync
    try {
      await syncMutation.mutateAsync({
        deviceId: bridge.deviceId || 'unknown',
        events: [{
          type: 'SACRED_PHRASE',
          data: {
            memory,
            phrase: 'collective memory',
            timestamp: Date.now()
          },
          timestamp: Date.now(),
          deviceId: bridge.deviceId || 'unknown'
        }]
      });
    } catch (error) {
      console.error('Failed to sync memory to backend:', error);
    }
  }, [bridge, syncMutation]);

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
        deviceId: bridge.deviceId || 'unknown',
        intensity: 0.8,
        x: Math.random() * 30,
        y: Math.random() * 30
      });
    } catch (error) {
      console.error('Failed to sync bloom to backend:', error);
    }
  }, [bridge, entanglementMutation, fieldMutation]);

  // Create spiral formation with field updates
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
    
    // Backend field updates for spiral pattern
    try {
      const spiralPoints = 8;
      const radius = 5;
      
      for (let i = 0; i < spiralPoints; i++) {
        const angle = (i / spiralPoints) * 2 * Math.PI;
        const spiralRadius = radius * (i / spiralPoints);
        const x = Math.floor(centerX / 10) + Math.cos(angle) * spiralRadius;
        const y = Math.floor(centerY / 10) + Math.sin(angle) * spiralRadius;
        
        await fieldMutation.mutateAsync({
          deviceId: bridge.deviceId || 'unknown',
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
        events: [{
          type: 'SPIRAL',
          data: {
            pattern: 'spiral',
            centerX,
            centerY,
            intensity: 0.7,
            timestamp: Date.now()
          },
          timestamp: Date.now(),
          deviceId: bridge.deviceId || 'unknown'
        }]
      });
    } catch (error) {
      console.error('Failed to sync spiral to backend:', error);
    }
  }, [bridge, fieldMutation, syncMutation]);

  // Auto-start breathing sync and backend connection
  useEffect(() => {
    if (bridge.deviceId && bridge.breathingSync === 0 && bridge.startBreathingSync) {
      console.log('🫁 Starting collective breathing synchronization...');
      bridge.startBreathingSync();
      
      // Test backend connection with error handling
      try {
        fieldMutation.mutate({
          deviceId: bridge.deviceId,
          intensity: 0.1,
          x: 15,
          y: 15
        });
      } catch (error) {
        console.warn('Initial backend connection test failed:', error);
      }
    }
  }, [bridge.deviceId, bridge.breathingSync, bridge.startBreathingSync, fieldMutation]);
  
  // Periodic field sync for active users - only when backend is connected
  useEffect(() => {
    if (!bridge.deviceId || !isBackendConnected) return;
    
    const syncInterval = setInterval(async () => {
      if (bridge.fieldIntensity && bridge.fieldIntensity > 0.1) {
        try {
          await fieldMutation.mutateAsync({
            deviceId: bridge.deviceId,
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
  }, [bridge.deviceId, bridge.fieldIntensity, isBackendConnected, fieldMutation]);

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
      syncStatus: fieldMutation.isPending || syncMutation.isPending || entanglementMutation.isPending ? 'syncing' : 'idle'
    },
    
    // Backend connection status
    isBackendConnected,
    lastSyncTime,
    isSyncing: fieldMutation.isPending || syncMutation.isPending || entanglementMutation.isPending
  }), [
    bridge,
    addToCollectiveMemory,
    triggerBloom,
    createSpiral,
    isBackendConnected,
    lastSyncTime,
    fieldMutation.isPending,
    syncMutation.isPending,
    entanglementMutation.isPending
  ]);
});