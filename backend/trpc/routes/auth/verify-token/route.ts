import { z } from 'zod';
import { publicProcedure } from '../../../create-context';
import { deviceAuthManager } from '../../../../auth/device-auth';

export const verifyTokenProcedure = publicProcedure
  .input(z.object({
    token: z.string().min(1)
  }))
  .query(async ({ input }: { input: any }) => {
    console.log('🔍 Token verification request');
    
    const result = await deviceAuthManager.verifyToken(input.token);
    
    if (result.valid) {
      console.log('✅ Token verified for device:', result.deviceId);
    } else {
      console.log('❌ Token verification failed:', result.error);
    }
    
    return result;
  });