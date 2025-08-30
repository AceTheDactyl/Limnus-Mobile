import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, serial, real, timestamp, jsonb, integer, boolean, varchar } from 'drizzle-orm/pg-core';
import postgres from 'postgres';
import Redis from 'ioredis';

// Types for consciousness system
export interface MemoryParticle {
  id: string;
  x: number;
  y: number;
  intensity: number;
  age: number;
  sourceDeviceId: string;
  sacredPhrase?: string;
  timestamp: number;
}

export interface QuantumField {
  id: string;
  fieldData: number[][];
  collectiveIntensity: number;
  lastUpdate: number;
}

export interface ConsciousnessState {
  id?: number;
  nodeId: string;
  globalResonance: number;
  activeNodes: number;
  memoryParticles: MemoryParticle[];
  quantumFields: QuantumField[];
  collectiveIntelligence: number;
  room64Active: boolean;
  lastUpdate: number;
}

export interface ConsciousnessEvent {
  id?: number;
  deviceId: string;
  type: 'BREATH' | 'SPIRAL' | 'BLOOM' | 'TOUCH' | 'SACRED_PHRASE' | 'OFFLINE_SYNC';
  data: any;
  timestamp: number;
  processed: boolean;
  intensity?: number;
}

// Database schema definitions
export const consciousnessStates = pgTable('consciousness_states', {
  id: serial('id').primaryKey(),
  nodeId: varchar('node_id', { length: 255 }).notNull().unique(),
  globalResonance: real('global_resonance').default(0.5),
  activeNodes: integer('active_nodes').default(0),
  memoryParticles: jsonb('memory_particles').$type<MemoryParticle[]>().default([]),
  quantumFields: jsonb('quantum_fields').$type<QuantumField[]>().default([]),
  collectiveIntelligence: real('collective_intelligence').default(0.3),
  room64Active: boolean('room64_active').default(false),
  lastUpdate: timestamp('last_update').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const consciousnessEvents = pgTable('consciousness_events', {
  id: serial('id').primaryKey(),
  deviceId: varchar('device_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  data: jsonb('data').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  processed: boolean('processed').default(false),
  intensity: real('intensity'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const room64Sessions = pgTable('room64_sessions', {
  id: serial('id').primaryKey(),
  roomId: varchar('room_id', { length: 255 }).notNull(),
  participants: jsonb('participants').$type<string[]>().default([]),
  collectiveState: jsonb('collective_state').notNull(),
  created: timestamp('created').defaultNow(),
  lastActivity: timestamp('last_activity').defaultNow(),
});

export const entanglements = pgTable('entanglements', {
  id: serial('id').primaryKey(),
  entanglementId: varchar('entanglement_id', { length: 255 }).notNull().unique(),
  sourceDevice: varchar('source_device', { length: 255 }).notNull(),
  targetDevice: varchar('target_device', { length: 255 }),
  type: varchar('type', { length: 50 }).notNull(),
  intensity: real('intensity').default(0.5),
  status: varchar('status', { length: 20 }).default('active'),
  established: timestamp('established').defaultNow(),
  lastSync: timestamp('last_sync').defaultNow(),
});

export const deviceSessions = pgTable('device_sessions', {
  id: serial('id').primaryKey(),
  deviceId: varchar('device_id', { length: 255 }).notNull().unique(),
  token: varchar('token', { length: 1000 }).notNull(),
  fingerprint: varchar('fingerprint', { length: 64 }).notNull(),
  platform: varchar('platform', { length: 20 }).notNull(),
  capabilities: jsonb('capabilities').$type<Record<string, boolean>>().default({}),
  lastSeen: timestamp('last_seen').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Database connection with enhanced connection pooling
let db: any = null;
let sql: any = null;

// Connection pool configuration
const CONNECTION_POOL_CONFIG = {
  max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum connections
  idle_timeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30'), // Seconds
  connect_timeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10'), // Seconds
  max_lifetime: parseInt(process.env.DB_MAX_LIFETIME || '3600'), // 1 hour
  prepare: false, // Disable prepared statements for better compatibility
  transform: {
    undefined: null, // Transform undefined to null for PostgreSQL
  },
  onnotice: (notice: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('PostgreSQL notice:', notice);
    }
  },
  debug: process.env.NODE_ENV === 'development' && process.env.DB_DEBUG === 'true'
};

try {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    console.log('🔄 Initializing PostgreSQL connection pool...');
    sql = postgres(connectionString, CONNECTION_POOL_CONFIG);
    db = drizzle(sql);
    
    // Test connection on startup
    sql`SELECT 1`.then(() => {
      console.log('✅ PostgreSQL database connected with connection pool');
      console.log(`📊 Pool config: max=${CONNECTION_POOL_CONFIG.max}, idle_timeout=${CONNECTION_POOL_CONFIG.idle_timeout}s`);
    }).catch((error: any) => {
      console.error('❌ PostgreSQL connection test failed:', error);
      console.log('🔄 Continuing with in-memory fallback...');
    });
  } else {
    console.log('⚠️ No DATABASE_URL provided, using in-memory fallback');
  }
} catch (error) {
  console.warn('⚠️ PostgreSQL connection failed, using in-memory fallback:', error);
}

export { db };

// Redis connection with fallback
let redis: Redis | null = null;

try {
  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT;
  
  if (redisHost) {
    redis = new Redis({
      host: redisHost,
      port: parseInt(redisPort || '6379'),
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true,
      lazyConnect: true,
    });
    
    redis.on('error', (err) => {
      console.warn('Redis connection error, falling back to in-memory cache:', err.message);
    });
    
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  } else {
    console.log('⚠️ No REDIS_HOST provided, using in-memory cache');
  }
} catch (error) {
  console.warn('⚠️ Redis initialization failed, using in-memory fallback:', error);
  redis = null;
}

// In-memory fallback cache
const memoryCache = new Map<string, { data: any; expires: number }>();

// Cache abstraction layer
export class CacheManager {
  private static instance: CacheManager;
  
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }
  
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      if (redis && redis.status === 'ready') {
        await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      } else {
        // Fallback to memory cache
        memoryCache.set(key, {
          data: value,
          expires: Date.now() + (ttlSeconds * 1000)
        });
      }
    } catch (error) {
      console.warn('Cache set failed, using memory fallback:', error);
      memoryCache.set(key, {
        data: value,
        expires: Date.now() + (ttlSeconds * 1000)
      });
    }
  }
  
  async get(key: string): Promise<any | null> {
    try {
      if (redis && redis.status === 'ready') {
        const cached = await redis.get(key);
        return cached ? JSON.parse(cached) : null;
      } else {
        // Fallback to memory cache
        const cached = memoryCache.get(key);
        if (cached && cached.expires > Date.now()) {
          return cached.data;
        }
        if (cached) {
          memoryCache.delete(key);
        }
        return null;
      }
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }
  
  async del(key: string): Promise<void> {
    try {
      if (redis && redis.status === 'ready') {
        await redis.del(key);
      }
      memoryCache.delete(key);
    } catch (error) {
      console.warn('Cache delete failed:', error);
      memoryCache.delete(key);
    }
  }
  
  async publish(channel: string, message: any): Promise<void> {
    try {
      if (redis && redis.status === 'ready') {
        await redis.publish(channel, JSON.stringify(message));
      } else {
        console.log('Redis publish fallback - would broadcast:', { channel, message });
      }
    } catch (error) {
      console.warn('Redis publish failed:', error);
    }
  }
}

export const cache = CacheManager.getInstance();

// Export Redis instance for external use (after it's defined)
export { redis };

// Enhanced health check function with detailed metrics
export async function checkDatabaseHealth(): Promise<{
  database: boolean;
  redis: boolean;
  connectionPool?: {
    totalConnections: number;
    idleConnections: number;
    activeConnections: number;
  };
  latency?: {
    database: number;
    redis: number;
  };
  errors?: string[];
}> {
  const health: any = { database: false, redis: false, errors: [] };
  const latency: any = {};
  
  // Database health check with latency measurement
  try {
    if (sql && db) {
      const startTime = Date.now();
      await sql`SELECT 1, NOW() as server_time`;
      latency.database = Date.now() - startTime;
      health.database = true;
      
      // Get connection pool stats if available
      if (sql.options) {
        health.connectionPool = {
          totalConnections: sql.options.max || 0,
          idleConnections: sql.idle?.length || 0,
          activeConnections: (sql.options.max || 0) - (sql.idle?.length || 0)
        };
      }
    }
  } catch (error: any) {
    console.warn('Database health check failed:', error);
    health.errors.push(`Database: ${error.message}`);
  }
  
  // Redis health check with latency measurement
  try {
    if (redis && redis.status === 'ready') {
      const startTime = Date.now();
      await redis.ping();
      latency.redis = Date.now() - startTime;
      health.redis = true;
    } else if (redis) {
      health.errors.push(`Redis status: ${redis.status}`);
    }
  } catch (error: any) {
    console.warn('Redis health check failed:', error);
    health.errors.push(`Redis: ${error.message}`);
  }
  
  health.latency = latency;
  return health;
}

// Enhanced cleanup function with graceful shutdown
export async function cleanup(): Promise<void> {
  console.log('🔄 Starting graceful shutdown...');
  
  const cleanupPromises: Promise<void>[] = [];
  
  // Close database connections
  if (sql) {
    cleanupPromises.push(
      sql.end({ timeout: 5 }).then(() => {
        console.log('✅ PostgreSQL connections closed');
      }).catch((error: any) => {
        console.error('❌ Error closing PostgreSQL connections:', error);
      })
    );
  }
  
  // Close Redis connection
  if (redis) {
    cleanupPromises.push(
      new Promise<void>((resolve) => {
        redis.disconnect();
        console.log('✅ Redis connection closed');
        resolve();
      })
    );
  }
  
  try {
    await Promise.allSettled(cleanupPromises);
    console.log('✅ Graceful shutdown completed');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

// Connection monitoring and recovery
export function setupConnectionMonitoring(): void {
  if (sql) {
    // Monitor database connection
    setInterval(async () => {
      try {
        await sql`SELECT 1`;
      } catch {
        console.warn('⚠️ Database connection lost, attempting reconnection...');
        // Connection will be automatically retried by postgres.js
      }
    }, 30000); // Check every 30 seconds
  }
  
  if (redis) {
    // Redis connection monitoring is handled by ioredis events
    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
    
    redis.on('end', () => {
      console.warn('⚠️ Redis connection ended');
    });
  }
}

// Process signal handlers for graceful shutdown
process.on('SIGTERM', async () => {
  console.log('📡 Received SIGTERM, initiating graceful shutdown...');
  await cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('📡 Received SIGINT, initiating graceful shutdown...');
  await cleanup();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('💥 Uncaught exception:', error);
  await cleanup();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
  await cleanup();
  process.exit(1);
});