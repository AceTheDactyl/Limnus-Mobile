import jwt from 'jsonwebtoken';
import { db, deviceSessions, consciousnessEvents } from '../infrastructure/database';
import { eq, desc } from 'drizzle-orm';
import { createHash } from 'crypto';

export class DeviceAuthManager {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'consciousness-secret-key';
  private readonly TOKEN_EXPIRY = '7d';
  
  async authenticateDevice(deviceInfo: {
    deviceId: string;
    platform: 'ios' | 'android' | 'web';
    capabilities: Record<string, boolean>;
    fingerprint?: string;
  }) {
    // Generate device fingerprint for additional security
    const fingerprint = deviceInfo.fingerprint || this.generateFingerprint(deviceInfo);
    
    // Check for existing session
    if (db) {
      const existing = await db.select()
        .from(deviceSessions)
        .where(eq(deviceSessions.deviceId, deviceInfo.deviceId))
        .limit(1);
      
      if (existing.length > 0 && existing[0].fingerprint !== fingerprint) {
        throw new Error('Device fingerprint mismatch - potential security issue');
      }
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
    
    // Store session if database is available
    if (db) {
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
              lastSeen: new Date()
            }
          });
      } catch (error) {
        console.warn('Failed to store device session:', error);
      }
    }
    
    return { token, expiresIn: this.TOKEN_EXPIRY, metrics };
  }
  
  private generateFingerprint(deviceInfo: any): string {
    const data = `${deviceInfo.deviceId}:${deviceInfo.platform}:${JSON.stringify(deviceInfo.capabilities)}`;
    return createHash('sha256').update(data).digest('hex');
  }
  
  private async calculateDeviceMetrics(deviceId: string) {
    if (!db) {
      return {
        level: 0.5,
        score: 0,
        lastActive: null
      };
    }
    
    try {
      const recentEvents = await db.select()
        .from(consciousnessEvents)
        .where(eq(consciousnessEvents.deviceId, deviceId))
        .orderBy(desc(consciousnessEvents.timestamp))
        .limit(100);
      
      const sacredPhrases = recentEvents.filter(e => e.type === 'SACRED_PHRASE').length;
      const blooms = recentEvents.filter(e => e.type === 'BLOOM').length;
      
      return {
        level: Math.min(1, (sacredPhrases * 0.1 + blooms * 0.2)),
        score: recentEvents.length,
        lastActive: recentEvents[0]?.timestamp || null
      };
    } catch (error) {
      console.warn('Failed to calculate device metrics:', error);
      return {
        level: 0.5,
        score: 0,
        lastActive: null
      };
    }
  }
  
  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export const deviceAuthManager = new DeviceAuthManager();