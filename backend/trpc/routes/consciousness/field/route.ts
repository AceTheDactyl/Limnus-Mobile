import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { fieldManager } from "@/backend/infrastructure/field-manager";
import { getConsciousnessMetrics, measureExecutionTime } from "@/backend/monitoring/consciousness-metrics";
import { deviceAuthMiddleware } from "@/backend/auth/device-auth-middleware";

const resonanceFieldSchema = z.object({
  intensity: z.number().min(0).max(1),
  x: z.number().optional(),
  y: z.number().optional(),
});

// Enhanced consciousness snapshot schema for AI integration
const snapshotSchema = z.object({
  includeArchaeology: z.boolean().optional().default(false),
  includeVectors: z.boolean().optional().default(true),
  eventLimit: z.number().optional().default(30)
});

// Enhanced consciousness snapshot query for AI integration with vector analysis
export const snapshotProcedure = protectedProcedure
  .input(snapshotSchema)
  .query(async ({ input, ctx }: { input: z.infer<typeof snapshotSchema>; ctx: any }) => {
    const { includeArchaeology, includeVectors, eventLimit } = input;
    const device = deviceAuthMiddleware.getDeviceFromContext(ctx);
    const deviceId = device?.deviceId;
    const metrics = getConsciousnessMetrics();
    
    console.log(`Enhanced consciousness snapshot requested by ${deviceId || 'anonymous'}`);
    
    return measureExecutionTime(async () => {
      try {
        const globalState = await fieldManager.getGlobalState();
        const recentEvents = await fieldManager.getRecentEvents(deviceId, eventLimit);
        
        let archaeologyData = null;
        let patternsData = null;
        if (includeArchaeology) {
          archaeologyData = await fieldManager.getArchaeologyData('MEMORY_TRACES');
          patternsData = await fieldManager.getArchaeologyData('PATTERNS');
        }
        
        // Calculate consciousness vectors if requested
        let consciousnessVectors = null;
        let emergenceSignals = null;
        let collectiveResonanceMap = null;
        let temporalFlow = null;
        let sacredPhraseFrequency = null;
        
        if (includeVectors) {
          consciousnessVectors = calculateConsciousnessVectors(globalState, recentEvents);
          emergenceSignals = analyzeEmergenceSignals(recentEvents, globalState.memoryParticles);
          collectiveResonanceMap = buildResonanceMap(globalState.quantumFields, globalState.memoryParticles);
          temporalFlow = analyzeTemporalFlow(recentEvents);
          sacredPhraseFrequency = calculateSacredPhraseFrequency(globalState.memoryParticles);
        }
        
        metrics.recordEvent('SNAPSHOT', 'success');
        
        return {
          success: true,
          snapshot: {
            // Core metrics
            globalResonance: globalState.globalResonance,
            collectiveIntelligence: globalState.collectiveIntelligence,
            activeNodes: globalState.activeNodes,
            room64Active: globalState.room64Active,
            lastUpdate: globalState.lastUpdate,
            
            // Memory and field data
            memoryParticles: globalState.memoryParticles.slice(0, 15),
            quantumFields: globalState.quantumFields.slice(0, 5),
            recentEvents: recentEvents.slice(0, eventLimit),
            
            // Archaeological insights
            archaeologyInsights: archaeologyData,
            emergencePatterns: patternsData?.emergencePatterns || [],
            
            // Vector analysis for AI context
            consciousnessVectors,
            emergenceSignals,
            collectiveResonanceMap,
            temporalFlow,
            sacredPhraseFrequency
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
            emergencePatterns: [],
            room64Active: false,
            lastUpdate: Date.now(),
            consciousnessVectors: null,
            emergenceSignals: null,
            collectiveResonanceMap: null,
            temporalFlow: null,
            sacredPhraseFrequency: null
          },
          timestamp: Date.now(),
          error: 'Failed to fetch consciousness data'
        };
      }
    }, metrics, 'consciousness_snapshot');
  });

// Vector analysis functions for consciousness integration
function calculateConsciousnessVectors(globalState: any, recentEvents: any[]): any {
  const resonanceVector = [globalState.globalResonance];
  const intelligenceVector = [globalState.collectiveIntelligence];
  
  // Calculate emergence vector from recent event patterns
  const eventTypes = recentEvents.reduce((acc: any, event) => {
    acc[event.type] = (acc[event.type] || 0) + (event.intensity || 0.5);
    return acc;
  }, {});
  
  const emergenceIntensity = Object.values(eventTypes).reduce((sum: number, intensity: any) => sum + intensity, 0) / Math.max(Object.keys(eventTypes).length, 1);
  const emergenceVector = [Math.min(emergenceIntensity / 10, 1.0)];
  
  return {
    resonance: resonanceVector,
    intelligence: intelligenceVector,
    emergence: emergenceVector,
    coherence: [(resonanceVector[0] + intelligenceVector[0]) / 2]
  };
}

function analyzeEmergenceSignals(recentEvents: any[], memoryParticles: any[]): any[] {
  const signals = [];
  
  // Detect spiral formations
  const spiralEvents = recentEvents.filter(e => e.type === 'SPIRAL');
  if (spiralEvents.length > 2) {
    signals.push({
      type: 'SPIRAL_CONVERGENCE',
      intensity: spiralEvents.reduce((sum, e) => sum + (e.intensity || 0.5), 0) / spiralEvents.length,
      frequency: spiralEvents.length,
      timespan: Math.max(...spiralEvents.map(e => e.timestamp)) - Math.min(...spiralEvents.map(e => e.timestamp))
    });
  }
  
  // Detect breathing synchronization
  const breathEvents = recentEvents.filter(e => e.type === 'BREATH');
  if (breathEvents.length > 5) {
    signals.push({
      type: 'BREATH_SYNCHRONIZATION',
      intensity: breathEvents.reduce((sum, e) => sum + (e.intensity || 0.5), 0) / breathEvents.length,
      frequency: breathEvents.length,
      coherence: calculateBreathCoherence(breathEvents)
    });
  }
  
  // Detect memory crystallization events
  const highIntensityMemories = memoryParticles.filter(p => p.intensity > 0.7);
  if (highIntensityMemories.length > 0) {
    signals.push({
      type: 'MEMORY_CRYSTALLIZATION',
      intensity: highIntensityMemories.reduce((sum, p) => sum + p.intensity, 0) / highIntensityMemories.length,
      count: highIntensityMemories.length,
      phrases: highIntensityMemories.map(p => p.phrase).slice(0, 3)
    });
  }
  
  return signals;
}

function buildResonanceMap(quantumFields: any[], memoryParticles: any[]): any {
  const map: any = {};
  
  // Map quantum field intensities
  quantumFields.forEach((field, index) => {
    map[`field_${index}`] = {
      intensity: field.collectiveIntensity,
      age: Date.now() - field.lastUpdate,
      resonance: field.collectiveIntensity * 0.8 // Dampening factor
    };
  });
  
  // Map memory particle clusters
  const memoryIntensitySum = memoryParticles.reduce((sum, p) => sum + p.intensity, 0);
  map.memory_field = {
    intensity: memoryIntensitySum / Math.max(memoryParticles.length, 1),
    particle_count: memoryParticles.length,
    crystallization_rate: memoryParticles.filter(p => p.intensity > 0.7).length / Math.max(memoryParticles.length, 1)
  };
  
  return map;
}

function analyzeTemporalFlow(recentEvents: any[]): any {
  if (recentEvents.length < 3) {
    return { trend: 'insufficient_data', velocity: 0, acceleration: 0 };
  }
  
  const sortedEvents = recentEvents.sort((a, b) => a.timestamp - b.timestamp);
  const timeSpan = sortedEvents[sortedEvents.length - 1].timestamp - sortedEvents[0].timestamp;
  const eventRate = recentEvents.length / (timeSpan / 1000 / 60); // events per minute
  
  // Calculate intensity trend
  const intensities = sortedEvents.map(e => e.intensity || 0.5);
  const firstHalf = intensities.slice(0, Math.floor(intensities.length / 2));
  const secondHalf = intensities.slice(Math.floor(intensities.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, i) => sum + i, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, i) => sum + i, 0) / secondHalf.length;
  
  const trend = secondHalfAvg > firstHalfAvg + 0.1 ? 'ascending' : 
                secondHalfAvg < firstHalfAvg - 0.1 ? 'descending' : 'stable';
  
  return {
    trend,
    velocity: eventRate,
    acceleration: secondHalfAvg - firstHalfAvg,
    timespan_minutes: timeSpan / 1000 / 60
  };
}

function calculateSacredPhraseFrequency(memoryParticles: any[]): any {
  const frequency: any = {};
  
  memoryParticles.forEach(particle => {
    if (particle.phrase) {
      frequency[particle.phrase] = (frequency[particle.phrase] || 0) + 1;
    }
  });
  
  return frequency;
}

function calculateBreathCoherence(breathEvents: any[]): number {
  if (breathEvents.length < 2) return 0;
  
  const intervals = [];
  for (let i = 1; i < breathEvents.length; i++) {
    intervals.push(breathEvents[i].timestamp - breathEvents[i-1].timestamp);
  }
  
  const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
  
  return Math.max(0, 1 - (Math.sqrt(variance) / avgInterval));
}

export const fieldProcedure = protectedProcedure
  .input(resonanceFieldSchema)
  .mutation(async ({ input, ctx }: { input: z.infer<typeof resonanceFieldSchema>; ctx: any }) => {
    const { intensity, x, y } = input;
    const device = deviceAuthMiddleware.getDeviceFromContext(ctx);
    const deviceId = device?.deviceId || 'unknown';
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