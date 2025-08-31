import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { generateDeviceToken } from '../../../../auth/device-auth-middleware';
import { createHash } from 'crypto';

export const authenticateDeviceProcedure = publicProcedure
  .input(z.object({
    deviceId: z.string().uuid('Invalid device ID format'),
    platform: z.enum(['ios', 'android', 'web']),
    capabilities: z.record(z.string(), z.boolean()).default({}),
    fingerprint: z.string().optional()
  }))
  .mutation(async ({ input }) => {
    console.log('🔐 Device authentication request:', input.deviceId, 'platform:', input.platform);
    
    try {
      // Generate device fingerprint if not provided
      const fingerprint = input.fingerprint || createHash('sha256')
        .update(`${input.deviceId}:${input.platform}:${JSON.stringify(input.capabilities)}`)
        .digest('hex');
      
      const token = await generateDeviceToken(
        input.deviceId,
        fingerprint,
        input.platform
      );
      
      console.log('✅ Device authenticated successfully:', input.deviceId);
      
      return {
        success: true,
        token,
        expiresIn: '7d',
        deviceId: input.deviceId,
        platform: input.platform
      };
    } catch (error: any) {
      console.error('❌ Device authentication failed:', error.message);
      
      return {
        success: false,
        error: error.message || 'Authentication failed'
      };
    }
  });