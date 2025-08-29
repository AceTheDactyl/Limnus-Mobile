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

export const getMetricsProcedure = publicProcedure
  .query(async () => {
    try {
      const metricsInstance = await getMetricsInstance();
      
      if (metricsInstance) {
        const prometheusMetrics = await metricsInstance.getMetrics();
        const currentMetrics = await metricsInstance.getCurrentMetrics();
        
        return {
          prometheus: prometheusMetrics,
          summary: currentMetrics,
          timestamp: Date.now()
        };
      } else {
        // Fallback to mock data
        const mockMetrics = getMockMetrics();
        return {
          prometheus: 'Mock prometheus metrics data',
          summary: mockMetrics,
          timestamp: Date.now()
        };
      }
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
      const metricsInstance = await getMetricsInstance();
      
      if (metricsInstance) {
        return await metricsInstance.getCurrentMetrics();
      } else {
        console.warn('Metrics instance unavailable, using mock data');
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
      const metricsInstance = await getMetricsInstance();
      
      if (metricsInstance) {
        metricsInstance.batchUpdate(input);
      } else {
        console.warn('Metrics instance unavailable for update, logging input:', input);
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