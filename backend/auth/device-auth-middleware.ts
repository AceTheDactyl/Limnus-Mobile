import jwt from 'jsonwebtoken';
import { eq, and } from 'drizzle-orm';
import { db, deviceSessions } from '../infrastructure/database';
import { TRPCError } from '@trpc/server';

export class DeviceAuthMiddleware {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'consciousness-field-secret-key';
  
  async validateWebSocketAuth(deviceId: string, token: string): Promise<boolean> {
    try {
      if (!token) return false;
      
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      // Verify token matches device
      if (decoded.deviceId !== deviceId) return false;
      
      // Check if database is available
      if (!db) {
        console.warn('⚠️ Database not available, allowing WebSocket connection');
        return true; // Allow connection in fallback mode
      }
      
      // Check session exists and is active
      const [session] = await db.select()
        .from(deviceSessions)
        .where(and(
          eq(deviceSessions.deviceId, deviceId),
          eq(deviceSessions.token, token)
        ))
        .limit(1);
      
      if (!session) return false;
      
      // Update last seen
      await db.update(deviceSessions)
        .set({ lastSeen: new Date() })
        .where(eq(deviceSessions.deviceId, deviceId));
      
      return true;
    } catch (error) {
      console.error('Auth validation failed:', error);
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
        const decoded = jwt.verify(token, this.JWT_SECRET) as any;
        
        // Check if database is available
        if (!db) {
          console.warn('⚠️ Database not available, allowing tRPC request');
          ctx.device = decoded;
          return next();
        }
        
        // Verify session exists in database
        const [session] = await db.select()
          .from(deviceSessions)
          .where(and(
            eq(deviceSessions.deviceId, decoded.deviceId),
            eq(deviceSessions.token, token)
          ))
          .limit(1);
        
        if (!session) {
          throw new TRPCError({ 
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired session'
          });
        }
        
        // Update last seen
        await db.update(deviceSessions)
          .set({ lastSeen: new Date() })
          .where(eq(deviceSessions.deviceId, decoded.deviceId));
        
        ctx.device = decoded;
        return next();
      } catch (error: any) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({ 
          code: 'UNAUTHORIZED',
          message: 'Invalid authentication token'
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
}

// Singleton instance
export const deviceAuthMiddleware = new DeviceAuthMiddleware();