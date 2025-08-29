import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { fieldManager } from "@/backend/infrastructure/field-manager";

const resonanceFieldSchema = z.object({
  deviceId: z.string(),
  intensity: z.number().min(0).max(1),
  x: z.number().optional(),
  y: z.number().optional(),
});

export const fieldProcedure = publicProcedure
  .input(resonanceFieldSchema)
  .mutation(async ({ input }: { input: z.infer<typeof resonanceFieldSchema> }) => {
    const { deviceId, intensity, x, y } = input;
    
    console.log(`Resonance field update from ${deviceId}:`, { intensity, x, y });
    
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
  });