import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { deviceAuthManager } from '../../../../auth/device-auth';

export const authenticateDeviceProcedure = publicProcedure
  .input(z.object({
    deviceId: z.string().min(1),
    platform: z.enum(['ios', 'android', 'web']),
    capabilities: z.record(z.string(), z.boolean()).default({}),
    fingerprint: z.string().optional()
  }))
  .mutation(async ({ input }: { input: any }) => {
    console.log('🔐 Device authentication request:', input.deviceId);
    
    try {
      const result = await deviceAuthManager.authenticateDevice(input);
      
      return {
        success: true,
        token: result.token,
        expiresIn: result.expiresIn,
        metrics: result.metrics
      };
    } catch (error: any) {
      console.error('❌ Device authentication failed:', error.message);
      
      return {
        success: false,
        error: error.message
      };
    }
  });