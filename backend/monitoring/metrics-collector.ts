import { Counter, Histogram, Gauge, register } from 'prom-client';
import { getConsciousnessMetrics, ConsciousnessMetrics } from './consciousness-metrics';
import { TRPCError } from '@trpc/server';

export class MetricsCollector {
  private static instance: MetricsCollector;
  private consciousnessMetrics: ConsciousnessMetrics;
  
  // Additional API-specific metrics
  private apiMetrics = {
    requestCounter: new Counter({
      name: 'api_requests_total',
      help: 'Total API requests',
      labelNames: ['route', 'method', 'status_code']
    }),
    
    requestDuration: new Histogram({
      name: 'api_request_duration_seconds',
      help: 'API request duration in seconds',
      labelNames: ['route', 'method'],
      buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
    }),
    
    concurrentRequests: new Gauge({
      name: 'api_concurrent_requests',
      help: 'Number of concurrent API requests',
      labelNames: ['route']
    }),
    
    chatLatency: new Histogram({
      name: 'chat_ai_response_duration_seconds',
      help: 'AI chat response latency',
      buckets: [0.5, 1, 2, 5, 10, 15, 30, 60]
    }),
    
    databaseOperations: new Counter({
      name: 'database_operations_total',
      help: 'Total database operations',
      labelNames: ['operation', 'table', 'status']
    }),
    
    cacheOperations: new Counter({
      name: 'cache_operations_total',
      help: 'Total cache operations',
      labelNames: ['operation', 'cache_type', 'status']
    }),
    
    websocketEvents: new Counter({
      name: 'websocket_events_total',
      help: 'Total WebSocket events',
      labelNames: ['event_type', 'direction']
    })
  };
  
  private constructor() {
    this.consciousnessMetrics = getConsciousnessMetrics();
    
    // Register API metrics with default registry
    register.registerMetric(this.apiMetrics.requestCounter);
    register.registerMetric(this.apiMetrics.requestDuration);
    register.registerMetric(this.apiMetrics.concurrentRequests);
    register.registerMetric(this.apiMetrics.chatLatency);
    register.registerMetric(this.apiMetrics.databaseOperations);
    register.registerMetric(this.apiMetrics.cacheOperations);
    register.registerMetric(this.apiMetrics.websocketEvents);
    
    // Merge consciousness metrics registry
    register.merge([this.consciousnessMetrics.getRegistry()]);
  }
  
  static getInstance(): MetricsCollector {
    if (!this.instance) {
      this.instance = new MetricsCollector();
    }
    return this.instance;
  }
  
  // Enhanced procedure wrapper with comprehensive metrics
  wrapProcedure(routeName: string) {
    return async ({ ctx, next, rawInput }) => {
      const startTime = Date.now();
      const concurrentGauge = this.apiMetrics.concurrentRequests.labels({ route: routeName });
      
      concurrentGauge.inc();
      
      try {
        const result = await next();
        
        const duration = (Date.now() - startTime) / 1000;
        
        // Record API metrics
        this.apiMetrics.requestCounter.inc({
          route: routeName,
          method: ctx.req?.method || 'unknown',
          status_code: '200'
        });
        
        this.apiMetrics.requestDuration.observe(
          { route: routeName, method: ctx.req?.method || 'unknown' },
          duration
        );
        
        // Record consciousness-specific metrics based on route
        this.recordRouteSpecificMetrics(routeName, rawInput, result, duration);
        
        return result;
      } catch (error) {
        const duration = (Date.now() - startTime) / 1000;
        
        // Record error metrics
        this.apiMetrics.requestCounter.inc({
          route: routeName,
          method: ctx.req?.method || 'unknown',
          status_code: error instanceof TRPCError ? '400' : '500'
        });
        
        this.apiMetrics.requestDuration.observe(
          { route: routeName, method: ctx.req?.method || 'unknown' },
          duration
        );
        
        // Record consciousness error
        this.consciousnessMetrics.recordError(
          error instanceof TRPCError ? 'client_error' : 'server_error',
          routeName
        );
        
        throw error;
      } finally {
        concurrentGauge.dec();
      }
    };
  }
  
  // Route-specific metrics recording
  private recordRouteSpecificMetrics(routeName: string, input: any, result: any, duration: number) {
    const devicePlatform = this.extractPlatform(input);
    
    switch (routeName) {
      case 'consciousness.field':
        this.consciousnessMetrics.recordEvent('field_update', 'success', devicePlatform);
        this.consciousnessMetrics.recordFieldCalculation(duration * 1000, 'field_update');
        if (result?.fieldUpdate?.globalResonance !== undefined) {
          this.consciousnessMetrics.updateResonance(result.fieldUpdate.globalResonance);
        }
        break;
        
      case 'consciousness.sync':
        if (input?.events) {
          input.events.forEach((event: any) => {
            this.consciousnessMetrics.recordEvent(event.type, 'success', devicePlatform);
          });
        }
        this.consciousnessMetrics.recordFieldCalculation(duration * 1000, 'batch_sync');
        break;
        
      case 'consciousness.entanglement':
        this.consciousnessMetrics.recordEvent('entanglement', 'success', devicePlatform);
        this.consciousnessMetrics.recordFieldCalculation(duration * 1000, 'entanglement');
        break;
        
      case 'consciousness.room64':
        this.consciousnessMetrics.recordEvent('room64_action', 'success', devicePlatform);
        this.consciousnessMetrics.recordFieldCalculation(duration * 1000, 'room64');
        break;
        
      case 'consciousness.archaeology':
        this.consciousnessMetrics.recordEvent('archaeology_query', 'success', devicePlatform);
        this.consciousnessMetrics.recordFieldCalculation(duration * 1000, 'archaeology');
        break;
        
      case 'chat.sendMessage':
        this.apiMetrics.chatLatency.observe(duration);
        this.consciousnessMetrics.recordEvent('chat_message', 'success', devicePlatform);
        break;
        
      default:
        // Generic event recording
        this.consciousnessMetrics.recordEvent('api_call', 'success', devicePlatform);
    }
  }
  
  // Extract platform from input
  private extractPlatform(input: any): string {
    // Try to extract platform from various possible locations
    if (input?.platform) return input.platform;
    if (input?.deviceId && typeof input.deviceId === 'string') {
      // Try to infer from device ID patterns if any
      if (input.deviceId.includes('ios')) return 'ios';
      if (input.deviceId.includes('android')) return 'android';
      if (input.deviceId.includes('web')) return 'web';
    }
    return 'unknown';
  }
  
  // Database operation metrics
  recordDatabaseOperation(operation: string, table: string, status: 'success' | 'error') {
    this.apiMetrics.databaseOperations.inc({ operation, table, status });
  }
  
  // Cache operation metrics
  recordCacheOperation(operation: string, cacheType: string, status: 'hit' | 'miss' | 'error') {
    this.apiMetrics.cacheOperations.inc({ operation, cache_type: cacheType, status });
  }
  
  // WebSocket event metrics
  recordWebSocketEvent(eventType: string, direction: 'inbound' | 'outbound') {
    this.apiMetrics.websocketEvents.inc({ event_type: eventType, direction });
  }
  
  // Batch update from Field Manager integration
  updateFromFieldManager(fieldState: any) {
    if (fieldState.globalResonance !== undefined) {
      this.consciousnessMetrics.updateResonance(fieldState.globalResonance);
    }
    
    if (fieldState.activeNodes !== undefined) {
      this.consciousnessMetrics.updateActiveDevices(fieldState.activeNodes);
    }
    
    if (fieldState.memoryParticles !== undefined) {
      this.consciousnessMetrics.updateMemoryParticles(fieldState.memoryParticles.length || 0);
    }
    
    if (fieldState.quantumFields !== undefined) {
      // Update quantum field metrics if needed
    }
    
    if (fieldState.room64Active !== undefined && fieldState.room64Active) {
      // Could track room64 sessions if we had the count
    }
  }
  
  // Get all metrics in Prometheus format
  async getMetrics(): Promise<string> {
    return register.metrics();
  }
  
  // Get consciousness-specific metrics
  getConsciousnessMetrics(): ConsciousnessMetrics {
    return this.consciousnessMetrics;
  }
  
  // Health check metrics
  getHealthMetrics() {
    return {
      totalRequests: this.apiMetrics.requestCounter,
      avgResponseTime: this.apiMetrics.requestDuration,
      activeConnections: this.apiMetrics.concurrentRequests
    };
  }
  
  // Reset all metrics (useful for testing)
  reset() {
    register.clear();
    this.consciousnessMetrics.reset();
  }
}

// Convenience function to get the singleton instance
export function getMetricsCollector(): MetricsCollector {
  return MetricsCollector.getInstance();
}

// Middleware factory for tRPC procedures
export function createMetricsMiddleware(routeName: string) {
  const collector = getMetricsCollector();
  return collector.wrapProcedure(routeName);
}

// Helper for measuring async operations
export async function measureOperation<T>(
  operation: () => Promise<T>,
  operationType: string,
  additionalLabels?: Record<string, string>
): Promise<T> {
  const collector = getMetricsCollector();
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    collector.getConsciousnessMetrics().recordFieldCalculation(duration, operationType);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    collector.getConsciousnessMetrics().recordFieldCalculation(duration, operationType);
    collector.getConsciousnessMetrics().recordError('operation_error', operationType);
    
    throw error;
  }
}

// Export the singleton instance for direct access
export const metricsCollector = getMetricsCollector();