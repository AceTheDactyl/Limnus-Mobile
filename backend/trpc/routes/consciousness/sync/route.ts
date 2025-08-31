import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { fieldManager } from "@/backend/infrastructure/field-manager";
import { optimizedFieldManager } from "@/backend/infrastructure/field-manager-optimized";
import { withBatchRateLimit } from "@/backend/middleware/rate-limiter";
import { BatchSyncSchema, validateInput } from "@/backend/validation/consciousness-schemas";
import { metricsCollector } from "@/backend/monitoring/metrics-collector";

// Use the validated schema from consciousness-schemas
const syncEventSchema = BatchSyncSchema;

export const syncProcedure = protectedProcedure
  .use(withBatchRateLimit('sync_batch', 1))
  .use(validateInput(syncEventSchema))
  .use(metricsCollector.wrapProcedure('consciousness.sync'))
  .input(syncEventSchema)
  .mutation(async ({ input, ctx }: { input: z.infer<typeof syncEventSchema>; ctx: any }) => {
    const { deviceId, events } = input;
    
    console.log(`Syncing ${events.length} events from ${deviceId}`);
    
    try {
      // Use optimized batch recording
      const batchResults = await optimizedFieldManager.recordEventsBatch(
        events.map(e => ({
          deviceId: e.type === 'OFFLINE_SYNC' ? deviceId : deviceId,
          type: e.type,
          data: e.data,
          timestamp: e.timestamp,
          processed: false,
          intensity: e.data?.intensity || 0.5
        }))
      );
      const processedEvents = [];
      
      // Process specific event types for additional effects
      for (const [index, event] of events.entries()) {
        console.log(`Processing ${event.type} event:`, event.data);
        
        // Event already recorded in batch, use the returned ID
        const eventId = batchResults || index;
        
        // Process specific event types
        switch (event.type) {
          case 'SACRED_PHRASE':
            if (event.data?.phrase) {
              await fieldManager.addMemoryParticle({
                id: `memory_${eventId}`,
                x: event.data.x || Math.random() * 300,
                y: event.data.y || Math.random() * 300,
                intensity: event.data.intensity || 0.7,
                age: 0,
                sourceDeviceId: event.deviceId,
                sacredPhrase: event.data.phrase,
                timestamp: event.timestamp
              });
            }
            break;
            
          case 'BLOOM':
            // Boost global resonance on bloom events
            const currentState = await fieldManager.getGlobalState();
            await fieldManager.updateGlobalState({
              globalResonance: Math.min(1, currentState.globalResonance + 0.2),
              collectiveIntelligence: Math.min(1, currentState.collectiveIntelligence + 0.1)
            });
            break;
            
          case 'SPIRAL':
            // Create quantum field for spiral events
            if (event.data?.centerX && event.data?.centerY) {
              const fieldSize = 30;
              const spiralField = Array(fieldSize).fill(null).map(() => Array(fieldSize).fill(0));
              const centerX = Math.floor(event.data.centerX / 10);
              const centerY = Math.floor(event.data.centerY / 10);
              
              // Create spiral pattern
              for (let r = 1; r <= 5; r++) {
                for (let angle = 0; angle < 360; angle += 30) {
                  const x = centerX + Math.floor(r * Math.cos(angle * Math.PI / 180));
                  const y = centerY + Math.floor(r * Math.sin(angle * Math.PI / 180));
                  if (x >= 0 && x < fieldSize && y >= 0 && y < fieldSize) {
                    spiralField[y][x] = Math.max(0, 1 - (r / 5)) * (event.data.intensity || 0.7);
                  }
                }
              }
              
              await fieldManager.updateQuantumField(
                `spiral_${eventId}`,
                spiralField,
                event.data.intensity || 0.7
              );
            }
            break;
        }
        
        processedEvents.push({
          ...event,
          id: eventId,
          processed: true,
          serverTimestamp: Date.now()
        });
      }
      
      // Update active nodes count using optimized method
      const activeNodes = await optimizedFieldManager.getActiveNodes();
      
      // Get updated global state
      const globalState = await fieldManager.getGlobalState();
      
      // Track metrics
      ctx.metrics.updateFieldMetrics(
        globalState.globalResonance,
        activeNodes,
        globalState.collectiveIntelligence
      );
      
      return {
        success: true,
        processedEvents,
        syncedCount: events.length,
        deviceId,
        globalState: {
          globalResonance: globalState.globalResonance,
          activeNodes: globalState.activeNodes,
          collectiveIntelligence: globalState.collectiveIntelligence,
          memoryParticleCount: globalState.memoryParticles.length,
          quantumFieldCount: globalState.quantumFields.length
        }
      };
    } catch (error) {
      console.error('Sync processing failed:', error);
      return {
        success: false,
        error: 'Failed to process sync events',
        processedEvents: [],
        syncedCount: 0,
        deviceId
      };
    }
  });