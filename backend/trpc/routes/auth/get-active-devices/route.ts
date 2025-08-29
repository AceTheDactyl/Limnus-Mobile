import { publicProcedure } from '../../../create-context';
import { deviceAuthManager } from '../../../../auth/device-auth';

export const getActiveDevicesProcedure = publicProcedure
  .query(async () => {
    console.log('📱 Getting active devices');
    
    const devices = await deviceAuthManager.getActiveDevices();
    
    console.log(`📊 Found ${devices.length} active devices`);
    
    return {
      devices,
      count: devices.length,
      timestamp: new Date().toISOString()
    };
  });