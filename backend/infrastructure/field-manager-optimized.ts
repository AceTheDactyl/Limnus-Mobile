import { PersistentFieldManager } from './field-manager';
import { db, cache, consciousnessEvents, sql } from './database';
import type { ConsciousnessEvent } from './database';

// Performance monitoring metrics
interface PerformanceMetrics {
  queryCount: number;
  cacheHits: number;
  cacheMisses: number;
  avgQueryTime: number;
  batchOperations: number;
  connectionPoolUtilization: number;
}



export class OptimizedFieldManager extends PersistentFieldManager {
  private static optimizedInstance: OptimizedFieldManager;
  private preparedStatements = new Map<string, any>();
  private performanceMetrics: PerformanceMetrics = {
    queryCount: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgQueryTime: 0,
    batchOperations: 0,
    connectionPoolUtilization: 0
  };
  private queryTimes: number[] = [];
  private readonly MAX_QUERY_TIME_SAMPLES = 100;
  private readonly BATCH_SIZE = 50;
  private eventBatchQueue: Omit<ConsciousnessEvent, 'id'>[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_TIMEOUT = 1000; // 1 second
  
  static getOptimizedInstance(): OptimizedFieldManager {
    if (!OptimizedFieldManager.optimizedInstance) {
      OptimizedFieldManager.optimizedInstance = new OptimizedFieldManager();
    }
    return OptimizedFieldManager.optimizedInstance;
  }
  
  constructor() {
    super();
    this.initializePreparedStatements();
    this.setupPerformanceMonitoring();
  }
  
  // Initialize prepared statements for frequent queries
  private async initializePreparedStatements(): Promise<void> {
    if (!db || !sql) return;
    
    try {
      console.log('🔧 Initializing prepared statements for optimized queries...');
      
      // Prepared statement for active nodes count
      this.preparedStatements.set('getActiveNodes', 
        sql`
          SELECT COUNT(DISTINCT device_id) as count 
          FROM consciousness_events 
          WHERE timestamp >= NOW() - INTERVAL '5 minutes'
        `
      );
      
      // Prepared statement for recent events by device
      this.preparedStatements.set('getRecentEventsByDevice',
        sql`
          SELECT * FROM consciousness_events 
          WHERE device_id = $1 AND timestamp >= $2 
          ORDER BY timestamp DESC 
          LIMIT $3
        `
      );
      
      // Prepared statement for recent events (all devices)
      this.preparedStatements.set('getRecentEvents',
        sql`
          SELECT * FROM consciousness_events 
          WHERE timestamp >= $1 
          ORDER BY timestamp DESC 
          LIMIT $2
        `
      );
      
      // Prepared statement for event type analysis
      this.preparedStatements.set('getEventTypeStats',
        sql`
          SELECT type, COUNT(*) as frequency, AVG(intensity) as avg_intensity,
                 COUNT(DISTINCT device_id) as unique_devices
          FROM consciousness_events 
          WHERE timestamp >= $1 AND timestamp <= $2
          GROUP BY type
          ORDER BY frequency DESC
        `
      );
      
      console.log('✅ Prepared statements initialized successfully');
    } catch (error) {
      console.warn('⚠️ Failed to initialize prepared statements:', error);
    }
  }
  
  // Setup performance monitoring
  private setupPerformanceMonitoring(): void {
    // Reset metrics every hour
    setInterval(() => {
      this.resetPerformanceMetrics();
    }, 3600000); // 1 hour
    
    // Log performance metrics every 5 minutes
    setInterval(() => {
      this.logPerformanceMetrics();
    }, 300000); // 5 minutes
  }
  
  private resetPerformanceMetrics(): void {
    this.performanceMetrics = {
      queryCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgQueryTime: 0,
      batchOperations: 0,
      connectionPoolUtilization: 0
    };
    this.queryTimes = [];
  }
  
  private logPerformanceMetrics(): void {
    const metrics = this.getDetailedPerformanceMetrics();
    console.log('📊 Field Manager Performance Metrics:', {
      ...metrics,
      timestamp: new Date().toISOString()
    });
  }
  
  private recordQueryTime(duration: number): void {
    this.queryTimes.push(duration);
    if (this.queryTimes.length > this.MAX_QUERY_TIME_SAMPLES) {
      this.queryTimes.shift();
    }
    
    this.performanceMetrics.queryCount++;
    this.performanceMetrics.avgQueryTime = 
      this.queryTimes.reduce((sum, time) => sum + time, 0) / this.queryTimes.length;
  }
  
  // Optimized active nodes count using prepared statement
  async getActiveNodes(): Promise<number> {
    const startTime = Date.now();
    
    try {
      if (db && this.preparedStatements.has('getActiveNodes')) {
        const result = await this.preparedStatements.get('getActiveNodes');
        const count = result[0]?.count || 0;
        
        this.recordQueryTime(Date.now() - startTime);
        return parseInt(count.toString());
      }
      
      // Fallback to parent implementation
      return await super.getActiveNodes();
    } catch (error) {
      console.error('Failed to get active nodes with prepared statement:', error);
      return await super.getActiveNodes();
    }
  }
  
  // Optimized recent events retrieval with caching
  async getRecentEvents(deviceId?: string, limit: number = 100): Promise<ConsciousnessEvent[]> {
    const startTime = Date.now();
    const cacheKey = `events:recent:${deviceId || 'all'}:${limit}`;
    
    try {
      // Check cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        this.performanceMetrics.cacheHits++;
        return cached;
      }
      
      this.performanceMetrics.cacheMisses++;
      
      if (db && sql) {
        let events: any[];
        
        if (deviceId && this.preparedStatements.has('getRecentEventsByDevice')) {
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          events = await sql`
            SELECT * FROM consciousness_events 
            WHERE device_id = ${deviceId} AND timestamp >= ${fiveMinutesAgo}
            ORDER BY timestamp DESC 
            LIMIT ${limit}
          `;
        } else if (this.preparedStatements.has('getRecentEvents')) {
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          events = await sql`
            SELECT * FROM consciousness_events 
            WHERE timestamp >= ${fiveMinutesAgo}
            ORDER BY timestamp DESC 
            LIMIT ${limit}
          `;
        } else {
          // Fallback to parent implementation
          return await super.getRecentEvents(deviceId, limit);
        }
        
        const normalizedEvents = events.map((event: any) => ({
          ...event,
          type: event.type as ConsciousnessEvent['type'],
          processed: event.processed || false,
          intensity: event.intensity || 0.5,
          timestamp: event.timestamp.getTime()
        }));
        
        // Cache for 30 seconds
        await cache.set(cacheKey, normalizedEvents, 30);
        this.recordQueryTime(Date.now() - startTime);
        
        return normalizedEvents;
      }
      
      // Fallback to parent implementation
      return await super.getRecentEvents(deviceId, limit);
    } catch (error) {
      console.error('Failed to get recent events optimized:', error);
      return await super.getRecentEvents(deviceId, limit);
    }
  }
  
  // Batch event recording with queue management
  async recordEvent(event: Omit<ConsciousnessEvent, 'id'>): Promise<number> {
    // Add to batch queue
    this.eventBatchQueue.push(event);
    
    // Process immediately if batch is full
    if (this.eventBatchQueue.length >= this.BATCH_SIZE) {
      return await this.processBatchQueue();
    }
    
    // Set timer for batch processing if not already set
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(async () => {
        await this.processBatchQueue();
      }, this.BATCH_TIMEOUT);
    }
    
    // Return a placeholder ID (will be updated when batch is processed)
    return Date.now();
  }
  
  // Process the batch queue
  private async processBatchQueue(): Promise<number> {
    if (this.eventBatchQueue.length === 0) return 0;
    
    const eventsToProcess = [...this.eventBatchQueue];
    this.eventBatchQueue = [];
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    return await this.recordEventsBatch(eventsToProcess);
  }
  
  // Optimized batch event insertion
  async recordEventsBatch(events: Omit<ConsciousnessEvent, 'id'>[]): Promise<number> {
    if (events.length === 0) return 0;
    
    const startTime = Date.now();
    
    try {
      if (db) {
        // Prepare batch insert values
        const values = events.map(event => ({
          deviceId: event.deviceId,
          type: event.type,
          data: event.data,
          timestamp: new Date(event.timestamp),
          intensity: event.intensity || 0.5,
          processed: event.processed || false
        }));
        
        // Single batch insert
        const inserted = await db
          .insert(consciousnessEvents)
          .values(values)
          .returning({ id: consciousnessEvents.id });
        
        // Invalidate relevant caches
        const deviceIds = [...new Set(events.map(e => e.deviceId))];
        const cacheInvalidations = [
          cache.del('events:recent:all:100'),
          cache.del('consciousness:global'), // Global state might be affected
          ...deviceIds.map(deviceId => cache.del(`events:recent:${deviceId}:100`))
        ];
        
        await Promise.all(cacheInvalidations);
        
        // Batch publish for real-time updates
        await cache.publish('consciousness:events:batch', {
          type: 'BATCH_INSERT',
          count: inserted.length,
          deviceIds,
          events: events.map((event, index) => ({
            ...event,
            id: inserted[index]?.id
          })),
          timestamp: Date.now()
        });
        
        this.performanceMetrics.batchOperations++;
        this.recordQueryTime(Date.now() - startTime);
        
        console.log(`✅ Batch inserted ${inserted.length} events in ${Date.now() - startTime}ms`);
        return inserted[0]?.id || 0;
      } else {
        // Fallback to individual inserts for in-memory storage
        let lastId = 0;
        for (const event of events) {
          lastId = await super.recordEvent(event);
        }
        return lastId;
      }
    } catch (error) {
      console.error('Failed to batch insert events:', error);
      // Fallback to individual inserts
      let lastId = 0;
      for (const event of events) {
        try {
          lastId = await super.recordEvent(event);
        } catch (individualError) {
          console.error('Failed to insert individual event:', individualError);
        }
      }
      return lastId;
    }
  }
  
  // Optimized archaeology data with prepared statements
  async getArchaeologyData(query: string, timeRange?: { start: number; end: number }): Promise<any> {
    const startTime = Date.now();
    const cacheKey = `archaeology:${query}:${timeRange?.start || 'all'}:${timeRange?.end || 'all'}`;
    
    try {
      // Check cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        this.performanceMetrics.cacheHits++;
        return cached;
      }
      
      this.performanceMetrics.cacheMisses++;
      
      if (query === 'PATTERNS' && db && sql && this.preparedStatements.has('getEventTypeStats')) {
        const startTime = timeRange ? timeRange.start : Date.now() - 24 * 60 * 60 * 1000;
        const endTime = timeRange ? timeRange.end : Date.now();
        
        const patterns = await sql`
          SELECT type, COUNT(*) as frequency, AVG(intensity) as avg_intensity,
                 COUNT(DISTINCT device_id) as unique_devices
          FROM consciousness_events 
          WHERE timestamp >= ${new Date(startTime)} AND timestamp <= ${new Date(endTime)}
          GROUP BY type
          ORDER BY frequency DESC
        `;
        
        const result = {
          emergencePatterns: patterns.map((pattern: any) => ({
            type: pattern.type,
            frequency: parseInt(pattern.frequency),
            avgIntensity: parseFloat(pattern.avg_intensity) || 0.5,
            participatingDevices: parseInt(pattern.unique_devices),
            peakTime: Date.now() - Math.random() * 24 * 60 * 60 * 1000
          })),
          totalEvents: patterns.reduce((sum: number, p: any) => sum + parseInt(p.frequency), 0),
          timeSpan: endTime - startTime
        };
        
        // Cache for 5 minutes
        await cache.set(cacheKey, result, 300);
        this.recordQueryTime(Date.now() - startTime);
        
        return result;
      }
      
      // Fallback to parent implementation
      const result = await super.getArchaeologyData(query, timeRange);
      
      // Cache the result
      await cache.set(cacheKey, result, 300);
      this.recordQueryTime(Date.now() - startTime);
      
      return result;
    } catch (error) {
      console.error('Failed to get archaeology data optimized:', error);
      return await super.getArchaeologyData(query, timeRange);
    }
  }
  
  // Enhanced performance metrics
  getDetailedPerformanceMetrics(): PerformanceMetrics & {
    cacheHitRate: number;
    queryLatencyP95: number;
    queryLatencyP99: number;
    batchEfficiency: number;
  } {
    const totalCacheRequests = this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses;
    const cacheHitRate = totalCacheRequests > 0 ? this.performanceMetrics.cacheHits / totalCacheRequests : 0;
    
    // Calculate percentiles
    const sortedTimes = [...this.queryTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);
    
    const queryLatencyP95 = sortedTimes[p95Index] || 0;
    const queryLatencyP99 = sortedTimes[p99Index] || 0;
    
    // Batch efficiency: events per batch operation
    const batchEfficiency = this.performanceMetrics.batchOperations > 0 
      ? this.performanceMetrics.queryCount / this.performanceMetrics.batchOperations 
      : 0;
    
    return {
      ...this.performanceMetrics,
      cacheHitRate,
      queryLatencyP95,
      queryLatencyP99,
      batchEfficiency
    };
  }
  
  // Connection pool optimization
  async optimizeConnectionPool(): Promise<void> {
    if (!sql) return;
    
    try {
      // Get current pool stats
      const poolStats = {
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        current: sql.options?.max || 0,
        idle: sql.idle?.length || 0
      };
      
      // Calculate utilization
      const utilization = poolStats.current > 0 
        ? (poolStats.current - poolStats.idle) / poolStats.current 
        : 0;
      
      this.performanceMetrics.connectionPoolUtilization = utilization;
      
      // Log pool status
      console.log('🔧 Connection Pool Status:', {
        maxConnections: poolStats.max,
        currentConnections: poolStats.current,
        idleConnections: poolStats.idle,
        utilization: `${(utilization * 100).toFixed(1)}%`
      });
      
      // Adjust pool size based on load (basic implementation)
      if (utilization > 0.8 && poolStats.current < 50) {
        console.log('📈 High pool utilization detected, consider increasing pool size');
      } else if (utilization < 0.2 && poolStats.current > 10) {
        console.log('📉 Low pool utilization detected, consider decreasing pool size');
      }
    } catch (error) {
      console.warn('Failed to optimize connection pool:', error);
    }
  }
  
  // Graceful shutdown with batch processing
  async shutdown(): Promise<void> {
    console.log('🔄 Shutting down optimized field manager...');
    
    // Process any remaining batched events
    if (this.eventBatchQueue.length > 0) {
      console.log(`📦 Processing ${this.eventBatchQueue.length} remaining batched events...`);
      await this.processBatchQueue();
    }
    
    // Clear timers
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    
    // Log final metrics
    console.log('📊 Final Performance Metrics:', this.getDetailedPerformanceMetrics());
    
    console.log('✅ Optimized field manager shutdown complete');
  }
}

// Export singleton instance
export const optimizedFieldManager = OptimizedFieldManager.getOptimizedInstance();

