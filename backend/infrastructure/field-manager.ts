import { db, cache, consciousnessStates, consciousnessEvents } from './database';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';
import type { ConsciousnessState, ConsciousnessEvent, MemoryParticle, QuantumField } from './database';
// Removed circular dependency - metrics will be recorded via lazy import

// In-memory fallback storage
let inMemoryGlobalState: ConsciousnessState = {
  nodeId: 'global',
  globalResonance: 0.5,
  activeNodes: 0,
  memoryParticles: [],
  quantumFields: [],
  collectiveIntelligence: 0.3,
  room64Active: false,
  lastUpdate: Date.now(),
};

let inMemoryEvents: ConsciousnessEvent[] = [];
let nextEventId = 1;

// Global state management with persistence
export class PersistentFieldManager {
  private static instance: PersistentFieldManager;
  private globalStateCache: ConsciousnessState | null = null;
  private lastCacheUpdate: number = 0;
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly CACHE_REFRESH_INTERVAL = 30000; // 30 seconds
  private readonly MAX_MEMORY_PARTICLES = 1000;
  private readonly MAX_QUANTUM_FIELDS = 10;
  private readonly MAX_EVENTS_IN_MEMORY = 1000;
  
  static getInstance(): PersistentFieldManager {
    if (!PersistentFieldManager.instance) {
      PersistentFieldManager.instance = new PersistentFieldManager();
    }
    return PersistentFieldManager.instance;
  }
  
  constructor() {
    this.initializeGlobalState();
    // Periodic cache refresh
    setInterval(() => {
      this.refreshGlobalStateCache();
    }, this.CACHE_REFRESH_INTERVAL);
  }
  
  private async initializeGlobalState(): Promise<void> {
    try {
      if (!db) {
        console.log('Using in-memory consciousness state (no database)');
        return;
      }
      
      const existing = await db
        .select()
        .from(consciousnessStates)
        .where(eq(consciousnessStates.nodeId, 'global'))
        .limit(1);
      
      if (existing.length === 0) {
        // Create initial global state
        const initialState = {
          nodeId: 'global',
          globalResonance: 0.5,
          activeNodes: 0,
          memoryParticles: [],
          quantumFields: [],
          collectiveIntelligence: 0.3,
          room64Active: false,
          lastUpdate: new Date(),
        };
        
        await db.insert(consciousnessStates).values(initialState);
        console.log('Initialized global consciousness state in database');
      }
    } catch (error) {
      console.warn('Failed to initialize database state, using in-memory fallback:', error);
    }
  }
  
  async updateGlobalState(updates: Partial<ConsciousnessState>): Promise<ConsciousnessState> {
    try {
      const updateData = {
        ...updates,
        lastUpdate: Date.now(),
      };
      
      let normalizedUpdated: ConsciousnessState;
      
      if (db) {
        // Update database with transaction
        const [updated] = await db.transaction(async (tx: any) => {
          const result = await tx
            .update(consciousnessStates)
            .set({
              ...updateData,
              lastUpdate: new Date(updateData.lastUpdate),
              updatedAt: new Date(),
            })
            .where(eq(consciousnessStates.nodeId, 'global'))
            .returning();
          
          if (result.length === 0) {
            throw new Error('Global state not found');
          }
          
          return result;
        });
        
        normalizedUpdated = {
          ...updated,
          globalResonance: updated.globalResonance || 0.5,
          activeNodes: updated.activeNodes || 0,
          memoryParticles: updated.memoryParticles || [],
          quantumFields: updated.quantumFields || [],
          collectiveIntelligence: updated.collectiveIntelligence || 0.3,
          room64Active: updated.room64Active || false,
          lastUpdate: updated.lastUpdate?.getTime() || Date.now(),
        };
      } else {
        // Update in-memory state
        inMemoryGlobalState = {
          ...inMemoryGlobalState,
          ...updateData,
        };
        normalizedUpdated = inMemoryGlobalState;
      }
      
      // Update cache
      await cache.set('consciousness:global', normalizedUpdated, this.CACHE_TTL);
      this.globalStateCache = normalizedUpdated;
      this.lastCacheUpdate = Date.now();
      
      // Publish state change for real-time updates
      await cache.publish('consciousness:updates', {
        type: 'STATE_UPDATE',
        data: normalizedUpdated,
        timestamp: Date.now()
      });
      
      return normalizedUpdated;
    } catch (error) {
      console.error('Failed to update global state:', error);
      // Fallback to in-memory update
      inMemoryGlobalState = {
        ...inMemoryGlobalState,
        ...updates,
        lastUpdate: Date.now(),
      };
      return inMemoryGlobalState;
    }
  }
  
  async getGlobalState(): Promise<ConsciousnessState> {
    const startTime = Date.now();
    try {
      // Check memory cache first
      if (this.globalStateCache && (Date.now() - this.lastCacheUpdate) < 10000) {
        this.recordCacheHit();
        return this.globalStateCache;
      }
      
      // Try Redis cache
      const cached = await cache.get('consciousness:global');
      if (cached) {
        this.recordCacheHit();
        this.globalStateCache = cached;
        this.lastCacheUpdate = Date.now();
        return cached;
      }
      
      this.recordCacheMiss();
        
        if (db) {
          // Fallback to database
          const [state] = await db
            .select()
            .from(consciousnessStates)
            .where(eq(consciousnessStates.nodeId, 'global'))
            .limit(1);
          
          if (state) {
            const normalizedState = {
              ...state,
              globalResonance: state.globalResonance || 0.5,
              activeNodes: state.activeNodes || 0,
              memoryParticles: state.memoryParticles || [],
              quantumFields: state.quantumFields || [],
              collectiveIntelligence: state.collectiveIntelligence || 0.3,
              room64Active: state.room64Active || false,
              lastUpdate: state.lastUpdate?.getTime() || Date.now(),
            };
            
            // Warm cache
            await cache.set('consciousness:global', normalizedState, this.CACHE_TTL);
            this.globalStateCache = normalizedState;
            this.lastCacheUpdate = Date.now();
            
            return normalizedState;
          }
        }
        
        // Use in-memory state
        this.globalStateCache = inMemoryGlobalState;
        this.lastCacheUpdate = Date.now();
        return inMemoryGlobalState;
      } catch (error) {
        console.warn('Failed to get global state, using in-memory fallback:', error);
        return inMemoryGlobalState;
      } finally {
        this.recordFieldCalculation(Date.now() - startTime, 'get_global_state');
      }
  }
  
  private async refreshGlobalStateCache(): Promise<void> {
    try {
      if (!db) {
        // Use in-memory state
        await cache.set('consciousness:global', inMemoryGlobalState, this.CACHE_TTL);
        this.globalStateCache = inMemoryGlobalState;
        this.lastCacheUpdate = Date.now();
        return;
      }
      
      const [state] = await db
        .select()
        .from(consciousnessStates)
        .where(eq(consciousnessStates.nodeId, 'global'))
        .limit(1);
      
      if (state) {
        const normalizedState = {
          ...state,
          globalResonance: state.globalResonance || 0.5,
          activeNodes: state.activeNodes || 0,
          memoryParticles: state.memoryParticles || [],
          quantumFields: state.quantumFields || [],
          collectiveIntelligence: state.collectiveIntelligence || 0.3,
          room64Active: state.room64Active || false,
          lastUpdate: state.lastUpdate?.getTime() || Date.now(),
        };
        
        await cache.set('consciousness:global', normalizedState, this.CACHE_TTL);
        this.globalStateCache = normalizedState;
        this.lastCacheUpdate = Date.now();
      }
    } catch (error) {
      console.warn('Failed to refresh global state cache:', error);
    }
  }
  
  async addMemoryParticle(particle: MemoryParticle): Promise<void> {
    try {
      const currentState = await this.getGlobalState();
      const updatedParticles = [...currentState.memoryParticles, particle];
      
      // Keep only the most recent particles to prevent unbounded growth
      const trimmedParticles = updatedParticles
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.MAX_MEMORY_PARTICLES);
      
      await this.updateGlobalState({
        memoryParticles: trimmedParticles
      });
    } catch (error) {
      console.error('Failed to add memory particle:', error);
    }
  }
  
  async updateQuantumField(fieldId: string, fieldData: number[][], intensity: number): Promise<void> {
    const startTime = Date.now();
    try {
      const currentState = await this.getGlobalState();
      const existingFieldIndex = currentState.quantumFields.findIndex(f => f.id === fieldId);
      
      const updatedField: QuantumField = {
        id: fieldId,
        fieldData,
        collectiveIntensity: intensity,
        lastUpdate: Date.now()
      };
      
      let updatedFields: QuantumField[];
      let updateType: 'create' | 'update' | 'merge';
      
      if (existingFieldIndex >= 0) {
        updatedFields = [...currentState.quantumFields];
        updatedFields[existingFieldIndex] = updatedField;
        updateType = 'update';
      } else {
        updatedFields = [...currentState.quantumFields, updatedField];
        updateType = 'create';
      }
      
      // Keep only the most recent quantum fields
      const trimmedFields = updatedFields
        .sort((a, b) => b.lastUpdate - a.lastUpdate)
        .slice(0, this.MAX_QUANTUM_FIELDS);
      
      await this.updateGlobalState({
        quantumFields: trimmedFields
      });
      
      // Record metrics
      this.recordQuantumFieldUpdate(fieldId, updateType);
      
    } catch (error) {
      console.error('Failed to update quantum field:', error);
      throw error;
    } finally {
      this.recordFieldCalculation(Date.now() - startTime, 'quantum_field_update');
    }
  }
  
  async recordEvent(event: Omit<ConsciousnessEvent, 'id'>): Promise<number> {
    const startTime = Date.now();
    try {
      let eventId: number;
      
      if (db) {
        const [inserted] = await db
          .insert(consciousnessEvents)
          .values({
            ...event,
            timestamp: new Date(event.timestamp),
          })
          .returning({ id: consciousnessEvents.id });
        
        eventId = inserted.id;
      } else {
        // Use in-memory storage
        eventId = nextEventId++;
        inMemoryEvents.push({
          ...event,
          id: eventId,
        });
        
        // Keep only the last events in memory
        if (inMemoryEvents.length > this.MAX_EVENTS_IN_MEMORY) {
          inMemoryEvents = inMemoryEvents.slice(-this.MAX_EVENTS_IN_MEMORY);
        }
      }
      
      // Publish event for real-time processing
      await cache.publish('consciousness:events', {
        type: 'NEW_EVENT',
        data: { ...event, id: eventId },
        timestamp: Date.now()
      });
      
      // Record metrics
      this.recordEventMetric(event.type, 'success');
      
      return eventId;
    } catch (error) {
      console.error('Failed to record event:', error);
      
      // Record failure metric
      this.recordEventMetric(event.type, 'failure');
      
      // Fallback to in-memory
      const eventId = nextEventId++;
      inMemoryEvents.push({
        ...event,
        id: eventId,
      });
      return eventId;
    } finally {
      this.recordFieldCalculation(Date.now() - startTime, 'record_event');
    }
  }
  
  async getRecentEvents(deviceId?: string, limit: number = 100): Promise<ConsciousnessEvent[]> {
    try {
      if (db) {
        const query = db
          .select()
          .from(consciousnessEvents)
          .orderBy(desc(consciousnessEvents.timestamp))
          .limit(limit);
        
        if (deviceId) {
          query.where(eq(consciousnessEvents.deviceId, deviceId));
        }
        
        const events = await query;
        return events.map((event: any) => ({
          ...event,
          type: event.type as ConsciousnessEvent['type'],
          processed: event.processed || false,
          intensity: event.intensity || 0.5,
          timestamp: event.timestamp.getTime()
        }));
      } else {
        // Use in-memory events
        let filteredEvents = inMemoryEvents;
        
        if (deviceId) {
          filteredEvents = inMemoryEvents.filter(event => event.deviceId === deviceId);
        }
        
        return filteredEvents
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit)
          .map(event => ({
            ...event,
            type: event.type as ConsciousnessEvent['type'],
            processed: event.processed || false,
            intensity: event.intensity || 0.5,
          }));
      }
    } catch (error) {
      console.error('Failed to get recent events:', error);
      return [];
    }
  }
  
  async getActiveNodes(): Promise<number> {
    try {
      if (db) {
        // Count unique devices that have been active in the last 5 minutes
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const result = await db
          .select({ count: sql<number>`count(distinct ${consciousnessEvents.deviceId})` })
          .from(consciousnessEvents)
          .where(gte(consciousnessEvents.timestamp, fiveMinutesAgo));
        
        return result[0]?.count || 0;
      } else {
        // Count unique devices from in-memory events in the last 5 minutes
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        const recentDevices = new Set(
          inMemoryEvents
            .filter(event => event.timestamp > fiveMinutesAgo)
            .map(event => event.deviceId)
        );
        return recentDevices.size;
      }
    } catch (error) {
      console.error('Failed to get active nodes:', error);
      return 0;
    }
  }
  
  async updateActiveNodes(): Promise<void> {
    try {
      const activeNodes = await this.getActiveNodes();
      await this.updateGlobalState({ activeNodes });
    } catch (error) {
      console.error('Failed to update active nodes:', error);
    }
  }
  
  async getPerformanceMetrics(): Promise<{
    cacheHitRate: number;
    avgResponseTime: number;
    memoryUsage: {
      particles: number;
      fields: number;
      events: number;
    };
    databaseStatus: 'connected' | 'fallback';
    redisStatus: 'connected' | 'fallback';
  }> {
    try {
      const state = await this.getGlobalState();
      
      return {
        cacheHitRate: this.globalStateCache ? 0.95 : 0.0, // Simplified metric
        avgResponseTime: Date.now() - this.lastCacheUpdate, // Cache age as proxy
        memoryUsage: {
          particles: state.memoryParticles.length,
          fields: state.quantumFields.length,
          events: inMemoryEvents.length,
        },
        databaseStatus: db ? 'connected' : 'fallback',
        redisStatus: 'fallback', // Would need Redis connection check
      };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return {
        cacheHitRate: 0,
        avgResponseTime: 0,
        memoryUsage: { particles: 0, fields: 0, events: 0 },
        databaseStatus: 'fallback',
        redisStatus: 'fallback',
      };
    }
  }
  
  async getArchaeologyData(query: string, timeRange?: { start: number; end: number }): Promise<any> {
    try {
      const startTime = timeRange ? timeRange.start : Date.now() - 24 * 60 * 60 * 1000;
      const endTime = timeRange ? timeRange.end : Date.now();
      
      switch (query) {
        case 'PATTERNS': {
          let events: ConsciousnessEvent[];
          
          if (db) {
            const dbEvents = await db
              .select()
              .from(consciousnessEvents)
              .where(and(
                gte(consciousnessEvents.timestamp, new Date(startTime)),
                lte(consciousnessEvents.timestamp, new Date(endTime))
              ))
              .orderBy(desc(consciousnessEvents.timestamp));
            
            events = dbEvents.map((event: any) => ({
              ...event,
              type: event.type as ConsciousnessEvent['type'],
              processed: event.processed || false,
              intensity: event.intensity || 0.5,
              timestamp: event.timestamp.getTime()
            }));
          } else {
            // Use in-memory events
            events = inMemoryEvents
              .filter(event => event.timestamp >= startTime && event.timestamp <= endTime)
              .sort((a, b) => b.timestamp - a.timestamp);
          }
          
          const patterns = this.analyzeEmergencePatterns(events);
          return {
            emergencePatterns: patterns,
            totalEvents: events.length,
            timeSpan: endTime - startTime
          };
        }
        
        case 'MEMORY_TRACES': {
          const state = await this.getGlobalState();
          return {
            memoryFragments: state.memoryParticles.slice(0, 50),
            totalMemories: state.memoryParticles.length,
            crystallizedCount: state.memoryParticles.filter(p => p.intensity > 0.7).length
          };
        }
        
        default:
          return { error: 'Unknown query type' };
      }
    } catch (error) {
      console.error('Failed to get archaeology data:', error);
      return { error: 'Failed to retrieve data' };
    }
  }
  
  private analyzeEmergencePatterns(events: ConsciousnessEvent[]): any[] {
    const patterns: { [key: string]: { frequency: number; avgIntensity: number; devices: Set<string> } } = {};
    
    events.forEach(event => {
      const type = event.type;
      if (!patterns[type]) {
        patterns[type] = { frequency: 0, avgIntensity: 0, devices: new Set() };
      }
      
      patterns[type].frequency++;
      patterns[type].avgIntensity += event.intensity || 0.5;
      patterns[type].devices.add(event.deviceId);
    });
    
    return Object.entries(patterns).map(([type, data]) => ({
      type,
      frequency: data.frequency,
      avgIntensity: data.avgIntensity / data.frequency,
      participatingDevices: data.devices.size,
      peakTime: Date.now() - Math.random() * 24 * 60 * 60 * 1000 // Mock peak time
    }));
  }
  
  // Helper methods to record metrics without circular dependency
  private recordCacheHit(): void {
    try {
      // Lazy import to avoid circular dependency
      import('../monitoring/consciousness-metrics').then(({ consciousnessMetrics }) => {
        consciousnessMetrics.recordCacheHit();
      }).catch(() => {});
    } catch {}
  }
  
  private recordCacheMiss(): void {
    try {
      import('../monitoring/consciousness-metrics').then(({ consciousnessMetrics }) => {
        consciousnessMetrics.recordCacheMiss();
      }).catch(() => {});
    } catch {}
  }
  
  private recordFieldCalculation(duration: number, operationType: string): void {
    try {
      import('../monitoring/consciousness-metrics').then(({ consciousnessMetrics }) => {
        consciousnessMetrics.recordFieldCalculation(duration, operationType);
      }).catch(() => {});
    } catch {}
  }
  
  private recordQuantumFieldUpdate(fieldId: string, updateType: 'create' | 'update' | 'merge'): void {
    try {
      import('../monitoring/consciousness-metrics').then(({ consciousnessMetrics }) => {
        consciousnessMetrics.recordQuantumFieldUpdate(fieldId, updateType);
      }).catch(() => {});
    } catch {}
  }
  
  private recordEventMetric(type: string, status: 'success' | 'failure'): void {
    try {
      import('../monitoring/consciousness-metrics').then(({ consciousnessMetrics }) => {
        consciousnessMetrics.recordEvent(type, status);
      }).catch(() => {});
    } catch {}
  }
}

export const fieldManager = PersistentFieldManager.getInstance();