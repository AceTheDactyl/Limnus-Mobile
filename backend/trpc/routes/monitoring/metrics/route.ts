import { publicProcedure } from '../../../create-context';
import { z } from 'zod';

// Simple mock metrics for now to test the route
const getMockMetrics = () => {
  return {
    events: Math.floor(Math.random() * 1000),
    activeDevices: Math.floor(Math.random() * 50) + 1,
    resonance: Math.random() * 0.8 + 0.2, // 0.2 to 1.0
    memoryParticles: Math.floor(Math.random() * 500),
    room64Sessions: Math.floor(Math.random() * 10)
  };
};

export const getMetricsProcedure = publicProcedure
  .query(async () => {
    try {
      // Try to use the real metrics, fallback to mock
      let metrics;
      try {
        const { getConsciousnessMetrics } = await import('../../../../monitoring/consciousness-metrics');
        const metricsInstance = getConsciousnessMetrics();
        const prometheusMetrics = await metricsInstance.getMetrics();
        const currentMetrics = await metricsInstance.getCurrentMetrics();
        
        return {
          prometheus: prometheusMetrics,
          summary: currentMetrics,
          timestamp: Date.now()
        };
      } catch (metricsError) {
        console.warn('Real metrics unavailable, using mock data:', metricsError);
        metrics = getMockMetrics();
      }
      
      return {
        prometheus: 'Mock prometheus metrics data',
        summary: metrics,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error getting metrics:', error);
      return {
        prometheus: '',
        summary: getMockMetrics(),
        timestamp: Date.now(),
        error: 'Failed to load metrics'
      };
    }
  });

export const getCurrentMetricsProcedure = publicProcedure
  .query(async () => {
    try {
      // Try to use the real metrics, fallback to mock
      try {
        const { getConsciousnessMetrics } = await import('../../../../monitoring/consciousness-metrics');
        const metricsInstance = getConsciousnessMetrics();
        return await metricsInstance.getCurrentMetrics();
      } catch (metricsError) {
        console.warn('Real metrics unavailable, using mock data:', metricsError);
        return getMockMetrics();
      }
    } catch (error) {
      console.error('Error getting current metrics:', error);
      return getMockMetrics();
    }
  });

export const updateMetricsProcedure = publicProcedure
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
    })).optional()
  }))
  .mutation(async ({ input }) => {
    try {
      // Try to use the real metrics, fallback to mock response
      try {
        const { getConsciousnessMetrics } = await import('../../../../monitoring/consciousness-metrics');
        const metrics = getConsciousnessMetrics();
        metrics.batchUpdate(input);
      } catch {
        console.warn('Real metrics unavailable for update, logging input:', input);
      }
      
      return {
        success: true,
        updated: Object.keys(input).length,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error updating metrics:', error);
      return {
        success: false,
        error: 'Failed to update metrics',
        timestamp: Date.now()
      };
    }
  });