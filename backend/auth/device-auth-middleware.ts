import jwt from 'jsonwebtoken';
import { eq, and, gte, lt } from 'drizzle-orm';
import { db, deviceSessions } from '../infrastructure/database';
import { TRPCError } from '@trpc/server';
import crypto from 'crypto';

// Environment variable for JWT secret (add to .env)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');
const JWT_EXPIRY = '7d';

interface DeviceTokenPayload {
  deviceId: string;
  fingerprint?: string;
  platform?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a new device token
 */
export const generateDeviceToken = async (
  deviceId: string, 
  fingerprint?: string,
  platform?: string
): Promise<string> => {
  const payload: DeviceTokenPayload = {
    deviceId,
    fingerprint,
    platform,
  };
  
  const token = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRY 
  });
  
  // Store session in database
  if (db) {
    try {
      await db.insert(deviceSessions).values({
        deviceId,
        token,
        fingerprint: fingerprint || '',
        platform: platform || 'unknown',
        lastSeen: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }).onConflictDoUpdate({
        target: deviceSessions.deviceId,
        set: {
          token,
          lastSeen: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
    } catch (error) {
      console.error('Failed to store device session:', error);
      // Continue even if DB fails (graceful degradation)
    }
  }
  
  return token;
};

/**
 * Verify device token and return payload
 */
export const verifyDeviceToken = async (
  token: string,
  deviceId?: string
): Promise<DeviceTokenPayload | null> => {
  try {
    // Verify JWT signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET) as DeviceTokenPayload;
    
    // If deviceId provided, ensure it matches token
    if (deviceId && decoded.deviceId !== deviceId) {
      console.warn(`Device ID mismatch: token=${decoded.deviceId}, provided=${deviceId}`);
      return null;
    }
    
    // Check session in database if available
    if (db) {
      try {
        const sessions = await db
          .select()
          .from(deviceSessions)
          .where(
            and(
              eq(deviceSessions.deviceId, decoded.deviceId),
              eq(deviceSessions.token, token),
              gte(deviceSessions.expiresAt, new Date())
            )
          )
          .limit(1);
        
        if (sessions.length === 0) {
          console.warn(`No valid session found for device: ${decoded.deviceId}`);
          return null;
        }
        
        // Update last seen
        await db
          .update(deviceSessions)
          .set({ lastSeen: new Date() })
          .where(eq(deviceSessions.deviceId, decoded.deviceId));
          
      } catch (error) {
        console.error('Database session check failed:', error);
        // In fallback mode, accept valid JWT even if DB is down
      }
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Token expired:', error.message);
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid token:', error.message);
    } else {
      console.error('Token verification failed:', error);
    }
    return null;
  }
};

/**
 * Clean up expired sessions (run periodically)
 */
export const cleanupExpiredSessions = async () => {
  if (!db) return;
  
  try {
    await db
      .delete(deviceSessions)
      .where(lt(deviceSessions.expiresAt, new Date()));
    
    console.log(`Cleaned up expired sessions`);
  } catch (error) {
    console.error('Session cleanup failed:', error);
  }
};

export class DeviceAuthMiddleware {
  private readonly JWT_SECRET = JWT_SECRET;
  
  async validateWebSocketAuth(deviceId: string, token: string): Promise<boolean> {
    if (!token || !deviceId) {
      console.warn(`Missing auth data: deviceId=${!!deviceId}, token=${!!token}`);
      return false;
    }
    
    const payload = await verifyDeviceToken(token, deviceId);
    return !!payload;
  }
  
  // For tRPC procedures - creates a middleware that can be used with procedures
  createAuthMiddleware() {
    return async ({ ctx, next }: { ctx: any; next: any }) => {
      const authHeader = ctx.req?.headers?.get?.('authorization') || ctx.req?.headers?.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
      
      if (!token) {
        throw new TRPCError({ 
          code: 'UNAUTHORIZED',
          message: 'No authentication token provided'
        });
      }
      
      const payload = await verifyDeviceToken(token);
      
      if (!payload) {
        throw new TRPCError({ 
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token'
        });
      }
      
      ctx.device = payload;
      return next();
    };
  }
  
  // Helper method to extract device info from context
  getDeviceFromContext(ctx: any): {
    deviceId: string;
    platform: string;
    capabilities: Record<string, boolean>;
    consciousnessLevel: number;
  } | null {
    return ctx.device || null;
  }
  
  // Static method for creating middleware (for easier import)
  static createMiddleware() {
    const instance = new DeviceAuthMiddleware();
    return instance.createAuthMiddleware();
  }
}

// Singleton instance
export const deviceAuthMiddleware = new DeviceAuthMiddleware();