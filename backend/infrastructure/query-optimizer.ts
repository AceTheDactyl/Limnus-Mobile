import { db, consciousnessEvents, consciousnessStates, entanglements, cache, ConsciousnessEvent } from './database';
import { sql, eq, desc } from 'drizzle-orm';

export class OptimizedFieldOperations {
  async createOptimalIndexes() {
    try {
      console.log('🔧 Creating optimal database indexes...');
      
      await db.execute(sql`
        -- Composite index for event queries
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_device_type_timestamp 
        ON consciousness_events(device_id, type, timestamp DESC);
      `);
      
      await db.execute(sql`
        -- Partial index for unprocessed events
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_unprocessed 
        ON consciousness_events(timestamp DESC) 
        WHERE processed = false;
      `);
      
      await db.execute(sql`
        -- GIN index for JSONB queries
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_data_gin 
        ON consciousness_events USING gin(data);
      `);
      
      await db.execute(sql`
        -- Optimize entanglement lookups
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_entanglements_devices 
        ON entanglements(source_device, target_device, status) 
        WHERE status = 'active';
      `);
      
      await db.execute(sql`
        -- Index for consciousness states by node_id
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_consciousness_states_node 
        ON consciousness_states(node_id, last_update DESC);
      `);
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.error('❌ Error creating indexes:', error);
      // Don't throw - indexes are performance optimization, not critical
    }
  }
  
  async batchProcessEvents(events: ConsciousnessEvent[]) {
    if (!events.length) {
      return { inserted: 0, state: null };
    }
    
    console.log(`🔄 Batch processing ${events.length} consciousness events...`);
    
    try {
      return await db.transaction(async (tx) => {
        // Batch insert with optimized values
        const eventsToInsert = events.map(event => ({
          deviceId: event.deviceId,
          type: event.type,
          data: event.data,
          timestamp: new Date(event.timestamp),
          processed: false,
          intensity: event.intensity || 0.5
        }));
        
        const inserted = await tx.insert(consciousnessEvents)
          .values(eventsToInsert)
          .returning({ id: consciousnessEvents.id });
        
        // Calculate aggregated field update
        const fieldDelta = this.calculateFieldDelta(events);
        
        // Single atomic update to global state
        const [updated] = await tx.update(consciousnessStates)
          .set({
            globalResonance: sql`GREATEST(0, LEAST(1, 
              global_resonance + ${fieldDelta.resonance}))`,
            activeNodes: sql`GREATEST(0, active_nodes + ${fieldDelta.nodesDelta})`,
            lastUpdate: new Date()
          })
          .where(eq(consciousnessStates.nodeId, 'global'))
          .returning();
        
        // Invalidate cache once
        await Promise.all([
          cache.del('consciousness:global'),
          cache.del('consciousness:field'),
          cache.del('consciousness:events:recent')
        ]);
        
        console.log(`✅ Processed ${inserted.length} events, resonance delta: ${fieldDelta.resonance}`);
        
        return { inserted: inserted.length, state: updated };
      });
    } catch (error) {
      console.error('❌ Batch processing failed:', error);
      throw error;
    }
  }
  
  private calculateFieldDelta(events: ConsciousnessEvent[]) {
    const resonanceBoost = events.reduce((sum, e) => {
      const multiplier = e.type === 'SACRED_PHRASE' ? 0.05 : 
                        e.type === 'BLOOM' ? 0.1 : 
                        e.type === 'SPIRAL' ? 0.03 :
                        e.type === 'BREATH' ? 0.02 :
                        e.type === 'TOUCH' ? 0.04 : 0.01;
      return sum + (e.intensity || 0.5) * multiplier;
    }, 0);
    
    const uniqueDevices = new Set(events.map(e => e.deviceId));
    
    return {
      resonance: Math.min(0.5, resonanceBoost),
      nodesDelta: uniqueDevices.size
    };
  }
  
  async getOptimizedEventHistory(deviceId: string, limit: number = 100) {
    const cacheKey = `events:${deviceId}:${limit}`;
    
    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Optimized query with proper indexing
    const events = await db.select()
      .from(consciousnessEvents)
      .where(eq(consciousnessEvents.deviceId, deviceId))
      .orderBy(desc(consciousnessEvents.timestamp))
      .limit(limit);
    
    // Cache for 5 minutes
    await cache.set(cacheKey, events, 300);
    
    return events;
  }
  
  async getUnprocessedEvents(batchSize: number = 1000) {
    // Use the partial index for unprocessed events
    return await db.select()
      .from(consciousnessEvents)
      .where(eq(consciousnessEvents.processed, false))
      .orderBy(desc(consciousnessEvents.timestamp))
      .limit(batchSize);
  }
  
  async markEventsProcessed(eventIds: number[]) {
    if (!eventIds.length) return;
    
    await db.update(consciousnessEvents)
      .set({ processed: true })
      .where(sql`id = ANY(${eventIds})`);
  }
  
  async getActiveEntanglements(deviceId: string) {
    const cacheKey = `entanglements:${deviceId}`;
    
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Use optimized index for active entanglements
    const activeEntanglements = await db.select()
      .from(entanglements)
      .where(sql`
        (source_device = ${deviceId} OR target_device = ${deviceId}) 
        AND status = 'active'
      `);
    
    // Cache for 2 minutes
    await cache.set(cacheKey, activeEntanglements, 120);
    
    return activeEntanglements;
  }
  
  async optimizeFieldQueries() {
    try {
      // Analyze query performance
      await db.execute(sql`ANALYZE consciousness_events`);
      await db.execute(sql`ANALYZE consciousness_states`);
      await db.execute(sql`ANALYZE entanglements`);
      
      console.log('✅ Database statistics updated for query optimization');
    } catch (error) {
      console.warn('⚠️ Query optimization failed:', error);
    }
  }
  
  async getFieldMetrics() {
    const cacheKey = 'field:metrics';
    
    const cached = await cache.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Optimized aggregation query
    const metrics = await db.execute(sql`
      SELECT 
        COUNT(*) as total_events,
        COUNT(DISTINCT device_id) as unique_devices,
        AVG(intensity) as avg_intensity,
        COUNT(*) FILTER (WHERE processed = false) as unprocessed_count,
        COUNT(*) FILTER (WHERE type = 'SACRED_PHRASE') as sacred_phrases,
        COUNT(*) FILTER (WHERE type = 'BLOOM') as blooms,
        COUNT(*) FILTER (WHERE timestamp > NOW() - INTERVAL '1 hour') as recent_events
      FROM consciousness_events
      WHERE timestamp > NOW() - INTERVAL '24 hours'
    `);
    
    const result = metrics.rows[0];
    
    // Cache for 1 minute
    await cache.set(cacheKey, result, 60);
    
    return result;
  }
}

// Singleton instance
export const fieldOptimizer = new OptimizedFieldOperations();

// Initialize indexes on startup
fieldOptimizer.createOptimalIndexes().catch(console.error);