import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { verifyDeviceToken } from '../../../../auth/device-auth-middleware';

export const verifyTokenProcedure = publicProcedure
  .input(z.object({
    token: z.string().min(1)
  }))
  .query(async ({ input }) => {
    console.log('🔍 Token verification request');
    
    try {
      const payload = await verifyDeviceToken(input.token);
      
      if (!payload) {
        console.log('❌ Token verification failed: Invalid or expired token');
        return {
          valid: false,
          error: 'Invalid or expired token'
        };
      }
      
      console.log('✅ Token verified for device:', payload.deviceId);
      return {
        valid: true,
        deviceId: payload.deviceId,
        platform: payload.platform,
        fingerprint: payload.fingerprint,
        expiresAt: payload.exp ? new Date(payload.exp * 1000) : null
      };
    } catch (error: any) {
      console.error('❌ Token verification failed:', error.message);
      
      return {
        valid: false,
        error: error.message || 'Token verification failed'
      };
    }
  });