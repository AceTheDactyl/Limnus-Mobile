import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { fieldManager } from "@/backend/infrastructure/field-manager";
import { getConsciousnessMetrics, measureExecutionTime } from "@/backend/monitoring/consciousness-metrics";

const resonanceFieldSchema = z.object({
  deviceId: z.string(),
  intensity: z.number().min(0).max(1),
  x: z.number().optional(),
  y: z.number().optional(),
});

// Consciousness snapshot schema for AI integration
const snapshotSchema = z.object({
  deviceId: z.string().optional(),
  includeArchaeology: z.boolean().optional().default(false)
});

// Consciousness snapshot query for AI integration
export const snapshotProcedure = publicProcedure
  .input(snapshotSchema)
  .query(async ({ input }: { input: z.infer<typeof snapshotSchema> }) => {
    const { deviceId, includeArchaeology } = input;
    const metrics = getConsciousnessMetrics();
    
    console.log(`Consciousness snapshot requested by ${deviceId || 'anonymous'}`);
    
    return measureExecutionTime(async () => {
      try {
        const globalState = await fieldManager.getGlobalState();
        const recentEvents = await fieldManager.getRecentEvents(deviceId, 20);
        
        let archaeologyData = null;
        if (includeArchaeology) {
          archaeologyData = await fieldManager.getArchaeologyData('MEMORY_TRACES');
        }
        
        metrics.recordEvent('SNAPSHOT', 'success');
        
        return {
          success: true,
          snapshot: {
            globalResonance: globalState.globalResonance,
            collectiveIntelligence: globalState.collectiveIntelligence,
            activeNodes: globalState.activeNodes,
            memoryParticles: globalState.memoryParticles.slice(0, 10),
            quantumFields: globalState.quantumFields.slice(0, 3),
            recentEvents: recentEvents.slice(0, 10),
            archaeologyInsights: archaeologyData,
            room64Active: globalState.room64Active,
            lastUpdate: globalState.lastUpdate
          },
          timestamp: Date.now()
        };
      } catch (error) {
        console.error('Consciousness snapshot failed:', error);
        metrics.recordEvent('SNAPSHOT', 'failure');
        metrics.recordError('snapshot_error', 'snapshot_procedure');
        
        return {
          success: false,
          snapshot: {
            globalResonance: 0.5,
            collectiveIntelligence: 0.3,
            activeNodes: 0,
            memoryParticles: [],
            quantumFields: [],
            recentEvents: [],
            archaeologyInsights: null,
            room64Active: false,
            lastUpdate: Date.now()
          },
          timestamp: Date.now(),
          error: 'Failed to fetch consciousness data'
        };
      }
    }, metrics, 'consciousness_snapshot');
  });

export const fieldProcedure = publicProcedure
  .input(resonanceFieldSchema)
  .mutation(async ({ input }: { input: z.infer<typeof resonanceFieldSchema> }) => {
    const { deviceId, intensity, x, y } = input;
    const metrics = getConsciousnessMetrics();
    
    console.log(`Resonance field update from ${deviceId}:`, { intensity, x, y });
    
    return measureExecutionTime(async () => {
      try {
      // Record the field update event
      await fieldManager.recordEvent({
        deviceId,
        type: 'TOUCH',
        data: { intensity, x, y },
        timestamp: Date.now(),
        processed: false,
        intensity
      });
      
      // Update quantum field if coordinates provided
      if (x !== undefined && y !== undefined) {
        const fieldSize = 30;
        const fieldData = Array(fieldSize).fill(null).map(() => Array(fieldSize).fill(0));
        const fieldX = Math.floor(Math.min(Math.max(x, 0), fieldSize - 1));
        const fieldY = Math.floor(Math.min(Math.max(y, 0), fieldSize - 1));
        fieldData[fieldY][fieldX] = intensity;
        
        await fieldManager.updateQuantumField(
          `field_${deviceId}_${Date.now()}`,
          fieldData,
          intensity
        );
      }
      
      // Update global resonance
      const currentState = await fieldManager.getGlobalState();
      const newResonance = Math.min(1, currentState.globalResonance + (intensity * 0.1));
      await fieldManager.updateGlobalState({ globalResonance: newResonance });
      
      // Update active nodes count
      await fieldManager.updateActiveNodes();
      
        // Update metrics
        metrics.recordEvent('TOUCH', 'success');
        metrics.updateResonance(newResonance);
        
        return {
          success: true,
          fieldUpdate: {
            deviceId,
            intensity,
            x: x || Math.random() * 30,
            y: y || Math.random() * 30,
            timestamp: Date.now(),
            globalResonance: newResonance,
            activeNodes: currentState.activeNodes
          }
        };
      } catch (error) {
        console.error('Field update failed:', error);
        metrics.recordEvent('TOUCH', 'failure');
        metrics.recordError('field_update_error', 'field_procedure');
        
        return {
          success: false,
          error: 'Failed to update resonance field',
          fieldUpdate: {
            deviceId,
            intensity,
            x: x || Math.random() * 30,
            y: y || Math.random() * 30,
            timestamp: Date.now()
          }
        };
      }
    }, metrics, 'field_update');
  });