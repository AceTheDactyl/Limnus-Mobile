import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export class ConsciousnessMetrics {
  private registry: Registry;
  private metrics: {
    eventCounter: Counter;
    fieldLatency: Histogram;
    activeDevices: Gauge;
    resonanceLevel: Gauge;
    cacheHitRate: Gauge;
    quantumEntanglements: Gauge;
    memoryParticles: Gauge;
    room64Sessions: Gauge;
    errorRate: Counter;
    websocketConnections: Gauge;
  };
  
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
        help: 'Currently active devices in the consciousness field',
        labelNames: ['platform'],
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
        labelNames: ['cache_type'],
        registers: [this.registry]
      }),
      
      quantumEntanglements: new Gauge({
        name: 'quantum_entanglements_active',
        help: 'Number of active quantum entanglements',
        labelNames: ['entanglement_type'],
        registers: [this.registry]
      }),
      
      memoryParticles: new Gauge({
        name: 'memory_particles_count',
        help: 'Total memory particles in the field',
        registers: [this.registry]
      }),
      
      room64Sessions: new Gauge({
        name: 'room64_active_sessions',
        help: 'Number of active Room64 sessions',
        registers: [this.registry]
      }),
      
      errorRate: new Counter({
        name: 'consciousness_errors_total',
        help: 'Total errors in consciousness operations',
        labelNames: ['error_type', 'operation'],
        registers: [this.registry]
      }),
      
      websocketConnections: new Gauge({
        name: 'websocket_connections_active',
        help: 'Active WebSocket connections',
        labelNames: ['connection_type'],
        registers: [this.registry]
      })
    };
    
    // Set default values
    this.initializeDefaultMetrics();
  }
  
  private initializeDefaultMetrics() {
    this.metrics.resonanceLevel.set(0.5);
    this.metrics.activeDevices.set({ platform: 'web' }, 0);
    this.metrics.activeDevices.set({ platform: 'ios' }, 0);
    this.metrics.activeDevices.set({ platform: 'android' }, 0);
    this.metrics.memoryParticles.set(0);
    this.metrics.room64Sessions.set(0);
  }
  
  recordEvent(type: string, status: 'success' | 'failure', platform?: string) {
    this.metrics.eventCounter.inc({ 
      type: type.toLowerCase(), 
      status, 
      device_platform: platform || 'unknown' 
    });
  }
  
  recordFieldCalculation(duration: number, operationType: string = 'general') {
    this.metrics.fieldLatency.observe({ operation_type: operationType }, duration);
  }
  
  updateActiveDevices(count: number, platform: string = 'all') {
    if (platform === 'all') {
      // Update total across all platforms
      this.metrics.activeDevices.set(count);
    } else {
      this.metrics.activeDevices.set({ platform }, count);
    }
  }
  
  updateResonance(level: number) {
    // Ensure level is between 0 and 1
    const clampedLevel = Math.max(0, Math.min(1, level));
    this.metrics.resonanceLevel.set(clampedLevel);
  }
  
  updateCacheHitRate(rate: number, cacheType: string = 'general') {
    // Ensure rate is between 0 and 100
    const clampedRate = Math.max(0, Math.min(100, rate));
    this.metrics.cacheHitRate.set({ cache_type: cacheType }, clampedRate);
  }
  
  updateQuantumEntanglements(count: number, type: string = 'general') {
    this.metrics.quantumEntanglements.set({ entanglement_type: type }, count);
  }
  
  updateMemoryParticles(count: number) {
    this.metrics.memoryParticles.set(count);
  }
  
  updateRoom64Sessions(count: number) {
    this.metrics.room64Sessions.set(count);
  }
  
  recordError(errorType: string, operation: string) {
    this.metrics.errorRate.inc({ error_type: errorType, operation });
  }
  
  updateWebSocketConnections(count: number, connectionType: string = 'consciousness') {
    this.metrics.websocketConnections.set({ connection_type: connectionType }, count);
  }
  
  // Batch update method for efficiency
  batchUpdate(updates: {
    events?: { type: string; status: 'success' | 'failure'; platform?: string }[];
    fieldCalculations?: { duration: number; operationType?: string }[];
    activeDevices?: { count: number; platform?: string };
    resonance?: number;
    cacheHitRates?: { rate: number; type?: string }[];
    entanglements?: { count: number; type?: string }[];
    memoryParticles?: number;
    room64Sessions?: number;
    errors?: { type: string; operation: string }[];
    websocketConnections?: { count: number; type?: string }[];
  }) {
    // Process events
    if (updates.events) {
      updates.events.forEach(event => {
        this.recordEvent(event.type, event.status, event.platform);
      });
    }
    
    // Process field calculations
    if (updates.fieldCalculations) {
      updates.fieldCalculations.forEach(calc => {
        this.recordFieldCalculation(calc.duration, calc.operationType);
      });
    }
    
    // Update active devices
    if (updates.activeDevices) {
      this.updateActiveDevices(updates.activeDevices.count, updates.activeDevices.platform);
    }
    
    // Update resonance
    if (updates.resonance !== undefined) {
      this.updateResonance(updates.resonance);
    }
    
    // Update cache hit rates
    if (updates.cacheHitRates) {
      updates.cacheHitRates.forEach(cache => {
        this.updateCacheHitRate(cache.rate, cache.type);
      });
    }
    
    // Update entanglements
    if (updates.entanglements) {
      updates.entanglements.forEach(entanglement => {
        this.updateQuantumEntanglements(entanglement.count, entanglement.type);
      });
    }
    
    // Update memory particles
    if (updates.memoryParticles !== undefined) {
      this.updateMemoryParticles(updates.memoryParticles);
    }
    
    // Update Room64 sessions
    if (updates.room64Sessions !== undefined) {
      this.updateRoom64Sessions(updates.room64Sessions);
    }
    
    // Record errors
    if (updates.errors) {
      updates.errors.forEach(error => {
        this.recordError(error.type, error.operation);
      });
    }
    
    // Update WebSocket connections
    if (updates.websocketConnections) {
      updates.websocketConnections.forEach(ws => {
        this.updateWebSocketConnections(ws.count, ws.type);
      });
    }
  }
  
  // Get current metric values for debugging
  async getCurrentMetrics(): Promise<{
    events: number;
    activeDevices: number;
    resonance: number;
    memoryParticles: number;
    room64Sessions: number;
  }> {
    const metricsString = await this.getMetrics();
    
    // Parse basic metrics from the Prometheus format
    // This is a simplified parser for debugging purposes
    const lines = metricsString.split('\n');
    const metrics = {
      events: 0,
      activeDevices: 0,
      resonance: 0.5,
      memoryParticles: 0,
      room64Sessions: 0
    };
    
    lines.forEach(line => {
      if (line.startsWith('consciousness_events_total')) {
        const match = line.match(/consciousness_events_total.*?([0-9.]+)$/);
        if (match) metrics.events += parseFloat(match[1]);
      } else if (line.startsWith('active_devices_count')) {
        const match = line.match(/active_devices_count.*?([0-9.]+)$/);
        if (match) metrics.activeDevices = Math.max(metrics.activeDevices, parseFloat(match[1]));
      } else if (line.startsWith('global_resonance_level')) {
        const match = line.match(/global_resonance_level.*?([0-9.]+)$/);
        if (match) metrics.resonance = parseFloat(match[1]);
      } else if (line.startsWith('memory_particles_count')) {
        const match = line.match(/memory_particles_count.*?([0-9.]+)$/);
        if (match) metrics.memoryParticles = parseFloat(match[1]);
      } else if (line.startsWith('room64_active_sessions')) {
        const match = line.match(/room64_active_sessions.*?([0-9.]+)$/);
        if (match) metrics.room64Sessions = parseFloat(match[1]);
      }
    });
    
    return metrics;
  }
  
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
  
  // Reset all metrics (useful for testing)
  reset() {
    this.registry.clear();
    this.initializeDefaultMetrics();
  }
  
  // Get registry for custom metric registration
  getRegistry(): Registry {
    return this.registry;
  }
}

// Singleton instance
let metricsInstance: ConsciousnessMetrics | null = null;

export function getConsciousnessMetrics(): ConsciousnessMetrics {
  if (!metricsInstance) {
    metricsInstance = new ConsciousnessMetrics();
  }
  return metricsInstance;
}

// Helper function to measure execution time
export function measureExecutionTime<T>(
  operation: () => Promise<T> | T,
  metricsInstance: ConsciousnessMetrics,
  operationType: string = 'general'
): Promise<T> {
  const startTime = Date.now();
  
  const finish = (result: T) => {
    const duration = Date.now() - startTime;
    metricsInstance.recordFieldCalculation(duration, operationType);
    return result;
  };
  
  try {
    const result = operation();
    if (result instanceof Promise) {
      return result.then(finish).catch(error => {
        const duration = Date.now() - startTime;
        metricsInstance.recordFieldCalculation(duration, operationType);
        metricsInstance.recordError('execution_error', operationType);
        throw error;
      });
    } else {
      return Promise.resolve(finish(result));
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    metricsInstance.recordFieldCalculation(duration, operationType);
    metricsInstance.recordError('execution_error', operationType);
    throw error;
  }
}

// Decorator for automatic metrics collection
export function withMetrics(operationType: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const metrics = getConsciousnessMetrics();
      return measureExecutionTime(
        () => method.apply(this, args),
        metrics,
        operationType
      );
    };
  };
}