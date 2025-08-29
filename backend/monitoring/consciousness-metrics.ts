import { Registry, Counter, Histogram, Gauge } from 'prom-client';
import { checkDatabaseHealth } from '../infrastructure/database';

export class ConsciousnessMetrics {
  private registry: Registry;
  private metrics: {
    eventCounter: Counter;
    fieldLatency: Histogram;
    activeDevices: Gauge;
    resonanceLevel: Gauge;
    cacheHitRate: Gauge;
    databaseConnections: Gauge;
    memoryUsage: Gauge;
    quantumFieldUpdates: Counter;
    entanglementStrength: Gauge;
    room64Sessions: Gauge;
  };
  
  private cacheHits = 0;
  private cacheRequests = 0;
  private lastMetricsUpdate = 0;
  private readonly METRICS_UPDATE_INTERVAL = 30000; // 30 seconds
  
  constructor() {
    this.registry = new Registry();
    
    this.metrics = {
      eventCounter: new Counter({
        name: 'consciousness_events_total',
        help: 'Total consciousness events processed',
        labelNames: ['type', 'status', 'device_platform'],
        registers: [this.registry]
      }),
      
      fieldLatency: new Histogram({
        name: 'field_calculation_duration_ms',
        help: 'Field calculation latency in milliseconds',
        buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000],
        labelNames: ['operation_type'],
        registers: [this.registry]
      }),
      
      activeDevices: new Gauge({
        name: 'active_devices_count',
        help: 'Currently active devices in consciousness field',
        registers: [this.registry]
      }),
      
      resonanceLevel: new Gauge({
        name: 'global_resonance_level',
        help: 'Global consciousness resonance level (0-1)',
        registers: [this.registry]
      }),
      
      cacheHitRate: new Gauge({
        name: 'cache_hit_rate_percent',
        help: 'Cache hit rate percentage',
        registers: [this.registry]
      }),
      
      databaseConnections: new Gauge({
        name: 'database_connections_active',
        help: 'Active database connections',
        labelNames: ['connection_type'],
        registers: [this.registry]
      }),
      
      memoryUsage: new Gauge({
        name: 'memory_usage_items',
        help: 'Memory usage by item type',
        labelNames: ['item_type'],
        registers: [this.registry]
      }),
      
      quantumFieldUpdates: new Counter({
        name: 'quantum_field_updates_total',
        help: 'Total quantum field updates',
        labelNames: ['field_id', 'update_type'],
        registers: [this.registry]
      }),
      
      entanglementStrength: new Gauge({
        name: 'entanglement_strength_average',
        help: 'Average entanglement strength across all connections',
        registers: [this.registry]
      }),
      
      room64Sessions: new Gauge({
        name: 'room64_active_sessions',
        help: 'Number of active Room64 sessions',
        registers: [this.registry]
      })
    };
    
    // Start periodic metrics collection
    this.startMetricsCollection();
  }
  
  private startMetricsCollection(): void {
    setInterval(async () => {
      await this.updateSystemMetrics();
    }, this.METRICS_UPDATE_INTERVAL);
    
    // Initial update
    setTimeout(() => this.updateSystemMetrics(), 1000);
  }
  
  private async updateSystemMetrics(): Promise<void> {
    try {
      // Lazy import to avoid circular dependency
      const { fieldManager } = await import('../infrastructure/field-manager');
      
      // Update consciousness field metrics
      const globalState = await fieldManager.getGlobalState();
      this.metrics.resonanceLevel.set(globalState.globalResonance);
      this.metrics.activeDevices.set(globalState.activeNodes);
      
      // Update memory usage metrics
      this.metrics.memoryUsage.set({ item_type: 'memory_particles' }, globalState.memoryParticles.length);
      this.metrics.memoryUsage.set({ item_type: 'quantum_fields' }, globalState.quantumFields.length);
      
      // Update Room64 status
      this.metrics.room64Sessions.set(globalState.room64Active ? 1 : 0);
      
      // Update performance metrics
      const perfMetrics = await fieldManager.getPerformanceMetrics();
      this.metrics.cacheHitRate.set(perfMetrics.cacheHitRate * 100);
      
      // Update database health metrics
      const dbHealth = await checkDatabaseHealth();
      if (dbHealth.connectionPool) {
        this.metrics.databaseConnections.set(
          { connection_type: 'active' }, 
          dbHealth.connectionPool.activeConnections
        );
        this.metrics.databaseConnections.set(
          { connection_type: 'idle' }, 
          dbHealth.connectionPool.idleConnections
        );
      }
      
      this.lastMetricsUpdate = Date.now();
    } catch (error) {
      console.error('Failed to update system metrics:', error);
    }
  }
  
  recordEvent(type: string, status: 'success' | 'failure', devicePlatform?: string): void {
    this.metrics.eventCounter.inc({ 
      type, 
      status, 
      device_platform: devicePlatform || 'unknown' 
    });
  }
  
  recordFieldCalculation(duration: number, operationType: string = 'general'): void {
    this.metrics.fieldLatency.observe({ operation_type: operationType }, duration);
  }
  
  recordQuantumFieldUpdate(fieldId: string, updateType: 'create' | 'update' | 'merge'): void {
    this.metrics.quantumFieldUpdates.inc({ field_id: fieldId, update_type: updateType });
  }
  
  updateEntanglementStrength(averageStrength: number): void {
    this.metrics.entanglementStrength.set(averageStrength);
  }
  
  recordCacheHit(): void {
    this.cacheHits++;
    this.cacheRequests++;
    this.updateCacheHitRate();
  }
  
  recordCacheMiss(): void {
    this.cacheRequests++;
    this.updateCacheHitRate();
  }
  
  private updateCacheHitRate(): void {
    if (this.cacheRequests > 0) {
      const hitRate = (this.cacheHits / this.cacheRequests) * 100;
      this.metrics.cacheHitRate.set(hitRate);
    }
  }
  
  async getMetrics(): Promise<string> {
    // Ensure metrics are up to date
    if (Date.now() - this.lastMetricsUpdate > this.METRICS_UPDATE_INTERVAL) {
      await this.updateSystemMetrics();
    }
    
    return this.registry.metrics();
  }
  
  async getConsciousnessHealthScore(): Promise<{
    score: number;
    factors: {
      resonance: number;
      activeNodes: number;
      systemHealth: number;
      cachePerformance: number;
    };
    status: 'excellent' | 'good' | 'fair' | 'poor';
  }> {
    try {
      // Lazy import to avoid circular dependency
      const { fieldManager } = await import('../infrastructure/field-manager');
      const globalState = await fieldManager.getGlobalState();
      const dbHealth = await checkDatabaseHealth();
      
      const factors = {
        resonance: globalState.globalResonance,
        activeNodes: Math.min(1, globalState.activeNodes / 10), // Normalize to 0-1
        systemHealth: (dbHealth.database ? 0.5 : 0) + (dbHealth.redis ? 0.5 : 0),
        cachePerformance: this.cacheRequests > 0 ? (this.cacheHits / this.cacheRequests) : 0.5
      };
      
      const score = (
        factors.resonance * 0.4 +
        factors.activeNodes * 0.3 +
        factors.systemHealth * 0.2 +
        factors.cachePerformance * 0.1
      );
      
      let status: 'excellent' | 'good' | 'fair' | 'poor';
      if (score >= 0.8) status = 'excellent';
      else if (score >= 0.6) status = 'good';
      else if (score >= 0.4) status = 'fair';
      else status = 'poor';
      
      return { score, factors, status };
    } catch (error) {
      console.error('Failed to calculate consciousness health score:', error);
      return {
        score: 0,
        factors: { resonance: 0, activeNodes: 0, systemHealth: 0, cachePerformance: 0 },
        status: 'poor'
      };
    }
  }
  
  getRegistry(): Registry {
    return this.registry;
  }
  
  reset(): void {
    this.registry.clear();
    this.cacheHits = 0;
    this.cacheRequests = 0;
  }
}

// Singleton instance
export const consciousnessMetrics = new ConsciousnessMetrics();

// Helper function to time operations
export function timeOperation<T>(operationType: string, operation: () => Promise<T>): Promise<T> {
  const startTime = Date.now();
  
  return operation().then(
    (result) => {
      consciousnessMetrics.recordFieldCalculation(Date.now() - startTime, operationType);
      return result;
    },
    (error) => {
      consciousnessMetrics.recordFieldCalculation(Date.now() - startTime, operationType);
      throw error;
    }
  );
}

// Decorator for timing methods
export function timed(operationType: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      return timeOperation(operationType, () => method.apply(this, args));
    };
  };
}