import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { fieldManager } from "@/backend/infrastructure/field-manager";
import { db, entanglements } from "@/backend/infrastructure/database";


const entanglementSchema = z.object({
  deviceId: z.string(),
  targetDeviceId: z.string().optional(),
  entanglementType: z.enum(['BREATHING', 'RESONANCE', 'SACRED_PHRASE']),
  intensity: z.number().min(0).max(1).optional()
});

export const entanglementProcedure = publicProcedure
  .input(entanglementSchema)
  .mutation(async ({ input }: { input: z.infer<typeof entanglementSchema> }) => {
    const { deviceId, targetDeviceId, entanglementType, intensity = 0.5 } = input;
    
    console.log(`Creating ${entanglementType} entanglement:`, {
      from: deviceId,
      to: targetDeviceId || 'collective',
      intensity
    });
    
    try {
      const entanglementId = `entangle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Record entanglement event
      await fieldManager.recordEvent({
        deviceId,
        type: 'TOUCH', // Using TOUCH as closest match for entanglement
        data: {
          entanglementType,
          targetDeviceId,
          intensity,
          entanglementId
        },
        timestamp: Date.now(),
        processed: false,
        intensity
      });
      
      // Store entanglement in database if available
      if (db) {
        try {
          await db.insert(entanglements).values({
            entanglementId,
            sourceDevice: deviceId,
            targetDevice: targetDeviceId,
            type: entanglementType,
            intensity,
            status: 'active'
          });
        } catch (dbError) {
          console.warn('Failed to store entanglement in database:', dbError);
        }
      }
      
      // Update global state to reflect new entanglement
      const currentState = await fieldManager.getGlobalState();
      await fieldManager.updateGlobalState({
        collectiveIntelligence: Math.min(1, currentState.collectiveIntelligence + (intensity * 0.1))
      });
      
      return {
        success: true,
        entanglement: {
          id: entanglementId,
          sourceDevice: deviceId,
          targetDevice: targetDeviceId,
          type: entanglementType,
          intensity,
          established: Date.now(),
          status: 'active'
        }
      };
    } catch (error) {
      console.error('Entanglement creation failed:', error);
      
      // Fallback response
      const entanglementId = `entangle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: false,
        error: 'Failed to create entanglement',
        entanglement: {
          id: entanglementId,
          sourceDevice: deviceId,
          targetDevice: targetDeviceId,
          type: entanglementType,
          intensity,
          established: Date.now(),
          status: 'error'
        }
      };
    }
  });