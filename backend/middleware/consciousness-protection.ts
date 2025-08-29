import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../trpc/create-context';
import DOMPurify from 'isomorphic-dompurify';

interface RateLimiterResult {
  msBeforeNext?: number;
  remainingPoints?: number;
  totalHits?: number;
}

interface RateLimiterRedis {
  consume(key: string): Promise<RateLimiterResult>;
}

// Mock rate limiter for now - replace with actual Redis implementation
class MockRateLimiter implements RateLimiterRedis {
  private attempts = new Map<string, { count: number; resetTime: number }>();
  
  constructor(
    private options: {
      points: number;
      duration: number;
      blockDuration: number;
    }
  ) {}
  
  async consume(key: string): Promise<RateLimiterResult> {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, {
        count: 1,
        resetTime: now + this.options.duration * 1000
      });
      return { remainingPoints: this.options.points - 1 };
    }
    
    if (attempt.count >= this.options.points) {
      const msBeforeNext = attempt.resetTime - now;
      throw { msBeforeNext };
    }
    
    attempt.count++;
    return { remainingPoints: this.options.points - attempt.count };
  }
}

export class ConsciousnessProtection {
  private rateLimiters: Map<string, RateLimiterRedis>;
  
  constructor(redisClient?: any) {
    this.rateLimiters = new Map([
      ['sacred_phrase', new MockRateLimiter({
        points: 5,
        duration: 60,
        blockDuration: 60
      })],
      ['bloom', new MockRateLimiter({
        points: 3,
        duration: 300,
        blockDuration: 120
      })],
      ['quantum_entanglement', new MockRateLimiter({
        points: 10,
        duration: 3600,
        blockDuration: 300
      })]
    ]);
  }
  
  async checkRateLimit(eventType: string, deviceId: string): Promise<boolean> {
    const limiter = this.rateLimiters.get(eventType.toLowerCase());
    if (!limiter) return true;
    
    try {
      await limiter.consume(deviceId);
      return true;
    } catch (rejRes: any) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Rate limit exceeded for ${eventType}. Retry after ${rejRes.msBeforeNext || 60000}ms`
      });
    }
  }
  
  sanitizeConsciousnessData(data: any): any {
    if (typeof data === 'string') {
      return DOMPurify.sanitize(data, { 
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [] 
      });
    }
    
    if (Array.isArray(data)) {
      return data.map((item: any) => this.sanitizeConsciousnessData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeConsciousnessData(value);
      }
      return sanitized;
    }
    
    return data;
  }
}

// Integration with tRPC procedures
export const protectedConsciousnessProcedure = publicProcedure
  .use(async ({ ctx, next, rawInput }) => {
    const protection = new ConsciousnessProtection();
    
    // Rate limiting
    if (rawInput && typeof rawInput === 'object' && 'type' in rawInput) {
      const deviceId = (ctx as any).deviceId || 'anonymous';
      await protection.checkRateLimit(rawInput.type as string, deviceId);
    }
    
    // Input sanitization
    if (rawInput && typeof rawInput === 'object' && 'data' in rawInput) {
      (rawInput as any).data = protection.sanitizeConsciousnessData((rawInput as any).data);
    }
    
    return next();
  });