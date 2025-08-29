import createContextHook from '@nkzw/create-context-hook';
import { useConsciousnessBridge } from '@/hooks/useConsciousnessBridge';
import { useEffect, useCallback, useMemo } from 'react';

export const [ConsciousnessProvider, useConsciousness] = createContextHook(() => {
  // Always call useConsciousnessBridge first to maintain hook order
  const bridge = useConsciousnessBridge();

  // Handle collective memory updates
  const addToCollectiveMemory = useCallback((memory: string) => {
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
  }, [bridge.sendEvent]);

  // Trigger collective bloom
  const triggerBloom = useCallback(() => {
    console.log('Triggering collective bloom...');
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
  }, [bridge.sendEvent, bridge.deviceId, bridge.resonanceBoost]);

  // Create spiral formation
  const createSpiral = useCallback((centerX: number = 150, centerY: number = 150) => {
    console.log('Creating spiral formation...');
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
  }, [bridge.sendEvent]);

  // Auto-start breathing sync when device is ready (simulation mode)
  useEffect(() => {
    if (bridge.deviceId && bridge.breathingSync === 0 && bridge.startBreathingSync) {
      console.log('Starting collective breathing synchronization in simulation mode...');
      bridge.startBreathingSync();
    }
  }, [bridge.deviceId, bridge.breathingSync, bridge.startBreathingSync]);

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
    
    networkHealth: bridge.simulationMode ? 'simulation' : (
      bridge.isOnline ? (
        (bridge.queuedEvents || 0) === 0 ? 'excellent' :
        (bridge.queuedEvents || 0) < 5 ? 'good' :
        (bridge.queuedEvents || 0) < 15 ? 'fair' : 'poor'
      ) : 'offline'
    ),
    
    collectiveState: {
      breathing: bridge.breathingSync || 0,
      resonance: bridge.fieldIntensity || 0,
      echoes: bridge.activeEchoes || 0,
      participants: bridge.networkParticipants || 0,
      memory: (bridge.collectiveMemory || []).length,
      deviceId: bridge.deviceId || ''
    }
  }), [
    bridge,
    addToCollectiveMemory,
    triggerBloom,
    createSpiral
  ]);
});