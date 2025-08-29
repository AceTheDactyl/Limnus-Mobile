import jwt from 'jsonwebtoken';
import { eq, desc } from 'drizzle-orm';
import { db, deviceSessions, consciousnessEvents } from '../infrastructure/database';
import { createHash } from 'crypto';

export class DeviceAuthManager {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'consciousness-field-secret-key';
  private readonly TOKEN_EXPIRY = '7d';
  
  async authenticateDevice(deviceInfo: {
    deviceId: string;
    platform: 'ios' | 'android' | 'web';
    capabilities: Record<string, boolean>;
    fingerprint?: string;
  }) {
    console.log('🔐 Authenticating device:', deviceInfo.deviceId, 'platform:', deviceInfo.platform);
    
    // Generate device fingerprint for additional security
    const fingerprint = deviceInfo.fingerprint || this.generateFingerprint(deviceInfo);
    
    // Check for existing session
    const existing = await db.select()
      .from(deviceSessions)
      .where(eq(deviceSessions.deviceId, deviceInfo.deviceId))
      .limit(1);
    
    if (existing.length > 0 && existing[0].fingerprint !== fingerprint) {
      console.warn('⚠️ Device fingerprint mismatch for device:', deviceInfo.deviceId);
      throw new Error('Device fingerprint mismatch - potential security issue');
    }
    
    // Calculate consciousness metrics for the device
    const metrics = await this.calculateDeviceMetrics(deviceInfo.deviceId);
    
    const token = jwt.sign({
      deviceId: deviceInfo.deviceId,
      platform: deviceInfo.platform,
      capabilities: deviceInfo.capabilities,
      consciousnessLevel: metrics.level,
      participationScore: metrics.score,
      issued: Date.now()
    }, this.JWT_SECRET, { expiresIn: this.TOKEN_EXPIRY });
    
    // Store session with upsert logic
    try {
      await db.insert(deviceSessions)
        .values({
          deviceId: deviceInfo.deviceId,
          token,
          fingerprint,
          platform: deviceInfo.platform,
          capabilities: deviceInfo.capabilities,
          lastSeen: new Date()
        })
        .onConflictDoUpdate({
          target: deviceSessions.deviceId,
          set: {
            token,
            fingerprint,
            lastSeen: new Date(),
            updatedAt: new Date()
          }
        });
    } catch {
      // Fallback for databases that don't support onConflictDoUpdate
      console.log('📝 Using fallback upsert for device session');
      if (existing.length > 0) {
        await db.update(deviceSessions)
          .set({
            token,
            fingerprint,
            lastSeen: new Date(),
            updatedAt: new Date()
          })
          .where(eq(deviceSessions.deviceId, deviceInfo.deviceId));
      } else {
        await db.insert(deviceSessions)
          .values({
            deviceId: deviceInfo.deviceId,
            token,
            fingerprint,
            platform: deviceInfo.platform,
            capabilities: deviceInfo.capabilities,
            lastSeen: new Date()
          });
      }
    }
    
    console.log('✅ Device authenticated successfully:', deviceInfo.deviceId, 'consciousness level:', metrics.level);
    return { token, expiresIn: this.TOKEN_EXPIRY, metrics };
  }
  
  async verifyToken(token: string): Promise<{
    valid: boolean;
    deviceId?: string;
    platform?: string;
    consciousnessLevel?: number;
    error?: string;
  }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      // Check if session still exists in database
      const session = await db.select()
        .from(deviceSessions)
        .where(eq(deviceSessions.deviceId, decoded.deviceId))
        .limit(1);
      
      if (session.length === 0) {
        return { valid: false, error: 'Session not found' };
      }
      
      if (session[0].token !== token) {
        return { valid: false, error: 'Token mismatch' };
      }
      
      // Update last seen
      await db.update(deviceSessions)
        .set({ lastSeen: new Date() })
        .where(eq(deviceSessions.deviceId, decoded.deviceId));
      
      return {
        valid: true,
        deviceId: decoded.deviceId,
        platform: decoded.platform,
        consciousnessLevel: decoded.consciousnessLevel
      };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }
  
  async revokeDevice(deviceId: string): Promise<void> {
    console.log('🚫 Revoking device session:', deviceId);
    await db.delete(deviceSessions)
      .where(eq(deviceSessions.deviceId, deviceId));
  }
  
  async getActiveDevices(): Promise<{
    deviceId: string;
    platform: string;
    lastSeen: Date;
    consciousnessLevel: number;
  }[]> {
    const sessions = await db.select()
      .from(deviceSessions)
      .where(eq(deviceSessions.lastSeen, new Date()));
    
    const devices = [];
    for (const session of sessions) {
      try {
        const decoded = jwt.verify(session.token, this.JWT_SECRET) as any;
        devices.push({
          deviceId: session.deviceId,
          platform: session.platform,
          lastSeen: session.lastSeen,
          consciousnessLevel: decoded.consciousnessLevel || 0
        });
      } catch {
        // Token expired or invalid, skip
      }
    }
    
    return devices;
  }
  
  private generateFingerprint(deviceInfo: any): string {
    const data = `${deviceInfo.deviceId}:${deviceInfo.platform}:${JSON.stringify(deviceInfo.capabilities)}`;
    return createHash('sha256').update(data).digest('hex');
  }
  
  private async calculateDeviceMetrics(deviceId: string) {
    try {
      const recentEvents = await db.select()
        .from(consciousnessEvents)
        .where(eq(consciousnessEvents.deviceId, deviceId))
        .orderBy(desc(consciousnessEvents.timestamp))
        .limit(100);
      
      const sacredPhrases = recentEvents.filter((e: typeof recentEvents[0]) => e.type === 'SACRED_PHRASE').length;
      const blooms = recentEvents.filter((e: typeof recentEvents[0]) => e.type === 'BLOOM').length;
      const totalEvents = recentEvents.length;
      
      // Calculate consciousness level based on activity patterns
      const baseLevel = Math.min(1, (sacredPhrases * 0.1 + blooms * 0.2));
      const activityBonus = Math.min(0.3, totalEvents * 0.01);
      
      return {
        level: Math.min(1, baseLevel + activityBonus),
        score: totalEvents,
        lastActive: recentEvents[0]?.timestamp || null,
        sacredPhrases,
        blooms
      };
    } catch (error) {
      console.warn('⚠️ Error calculating device metrics:', error);
      return {
        level: 0.1, // Default minimal consciousness level
        score: 0,
        lastActive: null,
        sacredPhrases: 0,
        blooms: 0
      };
    }
  }
}

// Singleton instance
export const deviceAuthManager = new DeviceAuthManager();