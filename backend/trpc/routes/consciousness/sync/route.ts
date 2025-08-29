import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { fieldManager } from "@/backend/infrastructure/field-manager";

const syncEventSchema = z.object({
  deviceId: z.string(),
  events: z.array(z.object({
    type: z.enum(['BREATH', 'SPIRAL', 'BLOOM', 'TOUCH', 'SACRED_PHRASE', 'OFFLINE_SYNC']),
    data: z.any(),
    timestamp: z.number(),
    deviceId: z.string()
  }))
});

export const syncProcedure = publicProcedure
  .input(syncEventSchema)
  .mutation(async ({ input }: { input: z.infer<typeof syncEventSchema> }) => {
    const { deviceId, events } = input;
    
    console.log(`Syncing ${events.length} events from ${deviceId}`);
    
    try {
      const processedEvents = [];
      
      // Process each event with persistent storage
      for (const event of events) {
        console.log(`Processing ${event.type} event:`, event.data);
        
        // Record event in database
        const eventId = await fieldManager.recordEvent({
          deviceId: event.deviceId,
          type: event.type,
          data: event.data,
          timestamp: event.timestamp,
          processed: false,
          intensity: event.data?.intensity || 0.5
        });
        
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
      
      // Update active nodes count
      await fieldManager.updateActiveNodes();
      
      // Get updated global state
      const globalState = await fieldManager.getGlobalState();
      
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