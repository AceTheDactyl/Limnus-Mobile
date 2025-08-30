import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { TRPCError } from '@trpc/server';
import { redis } from '../infrastructure/database';

class ConsciousnessRateLimiter {
  private limiters: Map<string, RateLimiterMemory | RateLimiterRedis>;
  private static instance: ConsciousnessRateLimiter;
  
  constructor() {
    this.limiters = new Map();
    
    if (redis) {
      this.limiters.set('field_update', new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:field',
        points: 30,
        duration: 60,
        blockDuration: 10
      }));
      this.limiters.set('sacred_phrase', new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:sacred',
        points: 5,
        duration: 60,
        blockDuration: 60
      }));
      this.limiters.set('sync_batch', new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:sync',
        points: 10,
        duration: 60,
        blockDuration: 30
      }));
      this.limiters.set('entanglement', new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:entangle',
        points: 3,
        duration: 300,
        blockDuration: 120
      }));
      this.limiters.set('room64_action', new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:room64',
        points: 20,
        duration: 60,
        blockDuration: 15
      }));
      this.limiters.set('archaeology', new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:arch',
        points: 10,
        duration: 300,
        blockDuration: 60
      }));
      this.limiters.set('chat_message', new RateLimiterRedis({
        storeClient: redis,
        keyPrefix: 'rl:chat',
        points: 20,
        duration: 60,
        blockDuration: 30
      }));
    } else {
      this.limiters.set('field_update', new RateLimiterMemory({
        keyPrefix: 'rl:field',
        points: 30,
        duration: 60,
        blockDuration: 10
      }));
      this.limiters.set('sacred_phrase', new RateLimiterMemory({
        keyPrefix: 'rl:sacred',
        points: 5,
        duration: 60,
        blockDuration: 60
      }));
      this.limiters.set('sync_batch', new RateLimiterMemory({
        keyPrefix: 'rl:sync',
        points: 10,
        duration: 60,
        blockDuration: 30
      }));
      this.limiters.set('entanglement', new RateLimiterMemory({
        keyPrefix: 'rl:entangle',
        points: 3,
        duration: 300,
        blockDuration: 120
      }));
      this.limiters.set('room64_action', new RateLimiterMemory({
        keyPrefix: 'rl:room64',
        points: 20,
        duration: 60,
        blockDuration: 15
      }));
      this.limiters.set('archaeology', new RateLimiterMemory({
        keyPrefix: 'rl:arch',
        points: 10,
        duration: 300,
        blockDuration: 60
      }));
      this.limiters.set('chat_message', new RateLimiterMemory({
        keyPrefix: 'rl:chat',
        points: 20,
        duration: 60,
        blockDuration: 30
      }));
    }
  }
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new ConsciousnessRateLimiter();
    }
    return this.instance;
  }
  
  async consume(key: string, deviceId: string, points = 1) {
    const limiter = this.limiters.get(key);
    if (!limiter) return;
    
    try {
      await limiter.consume(`${deviceId}:${key}`, points);
    } catch (rejRes: any) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded. Retry after ${Math.round(rejRes.msBeforeNext / 1000)}s`
      });
    }
  }
  
  async getRemainingPoints(key: string, deviceId: string): Promise<number> {
    const limiter = this.limiters.get(key);
    if (!limiter) return -1;
    
    try {
      const rateLimitKey = `${key}:${deviceId}`;
      const resRateLimiter = await limiter.get(rateLimitKey);
      return resRateLimiter ? resRateLimiter.remainingPoints || 0 : -1;
    } catch (error) {
      console.warn(`Failed to get remaining points for ${key}:${deviceId}:`, error);
      return -1;
    }
  }
  
  async reset(key: string, deviceId: string): Promise<void> {
    const limiter = this.limiters.get(key);
    if (!limiter) return;
    
    try {
      const rateLimitKey = `${key}:${deviceId}`;
      await limiter.delete(rateLimitKey);
      console.log(`🔄 Rate limit reset for ${deviceId} on ${key}`);
    } catch (error) {
      console.warn(`Failed to reset rate limit for ${key}:${deviceId}:`, error);
    }
  }
  
  // Get rate limit status for monitoring
  async getStatus(deviceId: string): Promise<Record<string, any>> {
    const status: Record<string, any> = {};
    
    for (const [key] of this.limiters) {
      try {
        const remaining = await this.getRemainingPoints(key, deviceId);
        status[key] = {
          remainingPoints: remaining,
          isBlocked: remaining === 0
        };
      } catch {
        status[key] = { error: 'Failed to get status' };
      }
    }
    
    return status;
  }
}

// Middleware factory
export const withRateLimit = (limitKey: string) => {
  return async ({ ctx, next, rawInput }: { ctx: any; next: any; rawInput: any }) => {
    const rateLimiter = ConsciousnessRateLimiter.getInstance();
    const deviceId = rawInput?.deviceId || ctx.device?.deviceId;
    
    if (deviceId) {
      await rateLimiter.consume(limitKey, deviceId);
    }
    
    return next();
  };
};

// Specific rate limit middlewares for different consciousness actions
export const withFieldUpdateLimit = withRateLimit('field_update');
export const withSacredPhraseLimit = withRateLimit('sacred_phrase');
export const withSyncBatchLimit = withRateLimit('sync_batch');
export const withEntanglementLimit = withRateLimit('entanglement');
export const withRoom64Limit = withRateLimit('room64_action');
export const withArchaeologyLimit = withRateLimit('archaeology');
export const withChatLimit = withRateLimit('chat_message');

// Enhanced rate limiting for batch operations
export const withBatchRateLimit = (key: string, pointsPerItem = 1) => {
  return async ({ ctx, next, rawInput }: { ctx: any; next: any; rawInput: any }) => {
    const limiter = ctx.rateLimiter as ConsciousnessRateLimiter;
    const deviceId = rawInput?.deviceId || ctx.device?.deviceId;
    const events = rawInput?.events || [];
    
    if (!deviceId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Device ID is required for rate limiting'
      });
    }
    
    if (limiter && Array.isArray(events)) {
      const totalPoints = events.length * pointsPerItem;
      await limiter.consume(key, deviceId, totalPoints);
    }
    
    return next();
  };
};

// Legacy compatibility functions
export function initializeRateLimiter(redis?: any): ConsciousnessRateLimiter {
  return ConsciousnessRateLimiter.getInstance();
}

export function getRateLimiter(): ConsciousnessRateLimiter | null {
  return ConsciousnessRateLimiter.getInstance();
}