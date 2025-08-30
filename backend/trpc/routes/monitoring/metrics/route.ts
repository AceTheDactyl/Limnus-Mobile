import { publicProcedure } from '../../../create-context';
import { z } from 'zod';
import { getMetricsCollector, createMetricsMiddleware } from '../../../../monitoring/metrics-collector';

// Simple mock metrics for fallback scenarios
const getMockMetrics = () => {
  return {
    events: Math.floor(Math.random() * 1000),
    activeDevices: Math.floor(Math.random() * 50) + 1,
    resonance: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
    memoryParticles: Math.floor(Math.random() * 500),
    room64Sessions: Math.floor(Math.random() * 10)
  };
};

// Helper function to safely get metrics
const getMetricsInstance = async () => {
  try {
    const { getConsciousnessMetrics } = await import('../../../../monitoring/consciousness-metrics');
    return getConsciousnessMetrics();
  } catch (error) {
    console.warn('Failed to load consciousness metrics:', error);
    return null;
  }
};

// Helper function to get the metrics collector
const getCollectorInstance = () => {
  try {
    return getMetricsCollector();
  } catch (error) {
    console.warn('Failed to get metrics collector:', error);
    return null;
  }
};

export const getMetricsProcedure = publicProcedure
  .use(createMetricsMiddleware('monitoring.getMetrics'))
  .query(async () => {
    try {
      const collector = getCollectorInstance();
      
      if (collector) {
        const prometheusMetrics = await collector.getMetrics();
        const consciousnessMetrics = collector.getConsciousnessMetrics();
        const currentMetrics = await consciousnessMetrics.getCurrentMetrics();
        
        return {
          prometheus: prometheusMetrics,
          summary: currentMetrics,
          timestamp: Date.now(),
          format: 'prometheus'
        };
      } else {
        // Fallback to mock data
        const mockMetrics = getMockMetrics();
        return {
          prometheus: '# Metrics collector unavailable\n',
          summary: mockMetrics,
          timestamp: Date.now(),
          format: 'mock'
        };
      }
    } catch (error) {
      console.error('Error getting metrics:', error);
      return {
        prometheus: '# Error collecting metrics\n',
        summary: getMockMetrics(),
        timestamp: Date.now(),
        error: 'Failed to load metrics',
        format: 'error'
      };
    }
  });

export const getCurrentMetricsProcedure = publicProcedure
  .use(createMetricsMiddleware('monitoring.getCurrentMetrics'))
  .query(async () => {
    try {
      const collector = getCollectorInstance();
      
      if (collector) {
        const consciousnessMetrics = collector.getConsciousnessMetrics();
        const currentMetrics = await consciousnessMetrics.getCurrentMetrics();
        
        return {
          ...currentMetrics,
          timestamp: Date.now(),
          source: 'prometheus'
        };
      } else {
        console.warn('Metrics collector unavailable, using mock data');
        return {
          ...getMockMetrics(),
          timestamp: Date.now(),
          source: 'mock'
        };
      }
    } catch (error) {
      console.error('Error getting current metrics:', error);
      return {
        ...getMockMetrics(),
        timestamp: Date.now(),
        source: 'error',
        error: error.message
      };
    }
  });

export const updateMetricsProcedure = publicProcedure
  .use(createMetricsMiddleware('monitoring.updateMetrics'))
  .input(z.object({
    events: z.array(z.object({
      type: z.string(),
      status: z.enum(['success', 'failure']),
      platform: z.string().optional()
    })).optional(),
    fieldCalculations: z.array(z.object({
      duration: z.number(),
      operationType: z.string().optional()
    })).optional(),
    activeDevices: z.object({
      count: z.number(),
      platform: z.string().optional()
    }).optional(),
    resonance: z.number().min(0).max(1).optional(),
    cacheHitRates: z.array(z.object({
      rate: z.number().min(0).max(100),
      type: z.string().optional()
    })).optional(),
    entanglements: z.array(z.object({
      count: z.number(),
      type: z.string().optional()
    })).optional(),
    memoryParticles: z.number().optional(),
    room64Sessions: z.number().optional(),
    errors: z.array(z.object({
      type: z.string(),
      operation: z.string()
    })).optional(),
    websocketConnections: z.array(z.object({
      count: z.number(),
      type: z.string().optional()
    })).optional(),
    // Additional fields for database and cache operations
    databaseOperations: z.array(z.object({
      operation: z.string(),
      table: z.string(),
      status: z.enum(['success', 'error'])
    })).optional(),
    cacheOperations: z.array(z.object({
      operation: z.string(),
      cacheType: z.string(),
      status: z.enum(['hit', 'miss', 'error'])
    })).optional()
  }))
  .mutation(async ({ input }) => {
    try {
      const collector = getCollectorInstance();
      
      if (collector) {
        const consciousnessMetrics = collector.getConsciousnessMetrics();
        
        // Update consciousness metrics
        consciousnessMetrics.batchUpdate(input);
        
        // Update additional collector metrics
        if (input.databaseOperations) {
          input.databaseOperations.forEach(op => {
            collector.recordDatabaseOperation(op.operation, op.table, op.status);
          });
        }
        
        if (input.cacheOperations) {
          input.cacheOperations.forEach(op => {
            collector.recordCacheOperation(op.operation, op.cacheType, op.status);
          });
        }
        
        return {
          success: true,
          updated: Object.keys(input).length,
          timestamp: Date.now(),
          source: 'prometheus'
        };
      } else {
        console.warn('Metrics collector unavailable for update, logging input:', input);
        return {
          success: false,
          error: 'Metrics collector unavailable',
          updated: 0,
          timestamp: Date.now(),
          source: 'unavailable'
        };
      }
    } catch (error) {
      console.error('Error updating metrics:', error);
      return {
        success: false,
        error: 'Failed to update metrics',
        timestamp: Date.now(),
        source: 'error',
        details: error.message
      };
    }
  });

// New procedure to get health metrics
export const getHealthMetricsProcedure = publicProcedure
  .use(createMetricsMiddleware('monitoring.getHealthMetrics'))
  .query(async () => {
    try {
      const collector = getCollectorInstance();
      
      if (collector) {
        const healthMetrics = collector.getHealthMetrics();
        
        return {
          health: {
            totalRequests: 'Available via Prometheus',
            avgResponseTime: 'Available via Prometheus',
            activeConnections: 'Available via Prometheus'
          },
          timestamp: Date.now(),
          source: 'prometheus',
          prometheusEndpoint: '/api/metrics'
        };
      } else {
        return {
          health: {
            status: 'unavailable'
          },
          timestamp: Date.now(),
          source: 'unavailable'
        };
      }
    } catch (error) {
      console.error('Error getting health metrics:', error);
      return {
        health: {
          status: 'error'
        },
        timestamp: Date.now(),
        source: 'error',
        error: error.message
      };
    }
  });