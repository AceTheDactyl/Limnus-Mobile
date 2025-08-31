import jwt from 'jsonwebtoken';
import { eq, and, gte } from 'drizzle-orm';
import { db, deviceSessions } from '../infrastructure/database';
import { TRPCError } from '@trpc/server';

export class DeviceAuthMiddleware {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'consciousness-field-secret-key';
  
  async validateWebSocketAuth(deviceId: string, token: string): Promise<boolean> {
    if (!token || !deviceId) {
      console.warn(`Missing auth data: deviceId=${!!deviceId}, token=${!!token}`);
      return false;
    }
    
    try {
      // Verify JWT signature and expiration
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      // Ensure token matches device
      if (decoded.deviceId !== deviceId) {
        console.warn(`Token mismatch: expected ${deviceId}, got ${decoded.deviceId}`);
        return false;
      }
      
      // Check if database is available
      if (!db) {
        console.warn('⚠️ Database not available, allowing WebSocket connection in fallback mode');
        return true; // Allow connection in fallback mode
      }
      
      // Check session exists, token matches, and not expired
      const [session] = await db.select()
        .from(deviceSessions)
        .where(and(
          eq(deviceSessions.deviceId, deviceId),
          eq(deviceSessions.token, token),
          gte(deviceSessions.expiresAt, new Date())
        ))
        .limit(1);
      
      if (!session) {
        console.warn(`No active session found for device ${deviceId}`);
        return false;
      }
      
      // Update last seen timestamp
      await db.update(deviceSessions)
        .set({ lastSeen: new Date() })
        .where(eq(deviceSessions.deviceId, deviceId));
      
      return true;
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        console.warn(`Token expired for device ${deviceId}`);
      } else if (error.name === 'JsonWebTokenError') {
        console.warn(`Invalid token for device ${deviceId}: ${error.message}`);
      } else {
        console.error('Auth validation error:', error);
      }
      return false;
    }
  }
  
  // For tRPC procedures - creates a middleware that can be used with procedures
  createAuthMiddleware() {
    return async ({ ctx, next }: { ctx: any; next: any }) => {
      const authHeader = ctx.req?.headers?.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
      
      if (!token) {
        throw new TRPCError({ 
          code: 'UNAUTHORIZED',
          message: 'No authentication token provided'
        });
      }
      
      try {
        // Verify JWT signature and expiration
        const decoded = jwt.verify(token, this.JWT_SECRET) as any;
        
        // Check if database is available
        if (!db) {
          console.warn('⚠️ Database not available, allowing tRPC request in fallback mode');
          ctx.device = decoded;
          return next();
        }
        
        // Verify session exists in database, token matches, and not expired
        const [session] = await db.select()
          .from(deviceSessions)
          .where(and(
            eq(deviceSessions.deviceId, decoded.deviceId),
            eq(deviceSessions.token, token),
            gte(deviceSessions.expiresAt, new Date())
          ))
          .limit(1);
        
        if (!session) {
          throw new TRPCError({ 
            code: 'UNAUTHORIZED',
            message: 'Session not found or token mismatch'
          });
        }
        
        // Update last seen timestamp
        await db.update(deviceSessions)
          .set({ lastSeen: new Date() })
          .where(eq(deviceSessions.deviceId, decoded.deviceId));
        
        ctx.device = decoded;
        return next();
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        // Handle JWT-specific errors
        if (error.name === 'TokenExpiredError') {
          throw new TRPCError({ 
            code: 'UNAUTHORIZED',
            message: 'Authentication token has expired'
          });
        } else if (error.name === 'JsonWebTokenError') {
          throw new TRPCError({ 
            code: 'UNAUTHORIZED',
            message: 'Invalid authentication token'
          });
        }
        
        throw new TRPCError({ 
          code: 'UNAUTHORIZED',
          message: 'Authentication failed'
        });
      }
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