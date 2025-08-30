import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { TRPCError } from '@trpc/server';

export class ConsciousnessRateLimiter {
  private limiters: Map<string, RateLimiterMemory | RateLimiterRedis>;
  private redis: any;
  
  constructor(redis?: any) {
    this.redis = redis;
    const LimiterClass = redis ? RateLimiterRedis : RateLimiterMemory;
    
    this.limiters = new Map([
      ['field_update', new LimiterClass({
        storeClient: redis,
        points: 30,      // 30 field updates
        duration: 60,    // per minute
        blockDuration: 10, // block for 10 seconds
        keyPrefix: 'rl_field_'
      })],
      ['sacred_phrase', new LimiterClass({
        storeClient: redis,
        points: 5,       // 5 sacred phrases
        duration: 60,    // per minute
        blockDuration: 60, // block for 1 minute
        keyPrefix: 'rl_sacred_'
      })],
      ['sync_batch', new LimiterClass({
        storeClient: redis,
        points: 10,      // 10 batch syncs
        duration: 60,    // per minute
        blockDuration: 30, // block for 30 seconds
        keyPrefix: 'rl_sync_'
      })],
      ['entanglement', new LimiterClass({
        storeClient: redis,
        points: 3,       // 3 entanglements
        duration: 300,   // per 5 minutes
        blockDuration: 120, // block for 2 minutes
        keyPrefix: 'rl_entangle_'
      })],
      ['room64_action', new LimiterClass({
        storeClient: redis,
        points: 20,      // 20 room actions
        duration: 60,    // per minute
        blockDuration: 15, // block for 15 seconds
        keyPrefix: 'rl_room64_'
      })],
      ['archaeology', new LimiterClass({
        storeClient: redis,
        points: 10,      // 10 archaeology queries
        duration: 300,   // per 5 minutes
        blockDuration: 60, // block for 1 minute
        keyPrefix: 'rl_arch_'
      })],
      ['chat_message', new LimiterClass({
        storeClient: redis,
        points: 20,      // 20 chat messages
        duration: 60,    // per minute
        blockDuration: 30, // block for 30 seconds
        keyPrefix: 'rl_chat_'
      })]
    ]);
    
    console.log(`🛡️ Rate limiter initialized with ${redis ? 'Redis' : 'in-memory'} backend`);
  }
  
  async consume(key: string, deviceId: string, points = 1): Promise<void> {
    const limiter = this.limiters.get(key);
    if (!limiter) {
      console.warn(`⚠️ No rate limiter found for key: ${key}`);
      return;
    }
    
    try {
      const rateLimitKey = `${key}:${deviceId}`;
      await limiter.consume(rateLimitKey, points);
      
      // Log successful consumption for monitoring
      console.log(`✅ Rate limit check passed for ${deviceId} on ${key} (consumed ${points} points)`);
    } catch (rejRes: any) {
      console.warn(`🚫 Rate limit exceeded for ${deviceId} on ${key}:`, {
        totalHits: rejRes.totalHits,
        remainingPoints: rejRes.remainingPoints,
        msBeforeNext: rejRes.msBeforeNext
      });
      
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded for ${key}. Try again in ${Math.ceil(rejRes.msBeforeNext / 1000)} seconds.`,
        cause: {
          retryAfter: rejRes.msBeforeNext,
          remainingPoints: rejRes.remainingPoints,
          totalHits: rejRes.totalHits
        }
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

// Integration with existing procedures
export const withRateLimit = (key: string, points = 1) => {
  return async ({ ctx, next, rawInput }: { ctx: any; next: any; rawInput: any }) => {
    const limiter = ctx.rateLimiter as ConsciousnessRateLimiter;
    const deviceId = rawInput?.deviceId || ctx.device?.deviceId;
    
    if (!deviceId) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Device ID is required for rate limiting'
      });
    }
    
    if (limiter) {
      await limiter.consume(key, deviceId, points);
    } else {
      console.warn('⚠️ Rate limiter not available in context');
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

// Singleton instance
let rateLimiterInstance: ConsciousnessRateLimiter | null = null;

export function initializeRateLimiter(redis?: any): ConsciousnessRateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new ConsciousnessRateLimiter(redis);
  }
  return rateLimiterInstance;
}

export function getRateLimiter(): ConsciousnessRateLimiter | null {
  return rateLimiterInstance;
}