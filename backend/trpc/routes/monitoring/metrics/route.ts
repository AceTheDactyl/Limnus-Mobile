import { publicProcedure } from '../../../create-context';
import { getConsciousnessMetrics } from '../../../../monitoring/consciousness-metrics';
import { z } from 'zod';

export const getMetricsProcedure = publicProcedure
  .query(async () => {
    const metrics = getConsciousnessMetrics();
    const prometheusMetrics = await metrics.getMetrics();
    const currentMetrics = await metrics.getCurrentMetrics();
    
    return {
      prometheus: prometheusMetrics,
      summary: currentMetrics,
      timestamp: Date.now()
    };
  });

export const getCurrentMetricsProcedure = publicProcedure
  .query(async () => {
    const metrics = getConsciousnessMetrics();
    return await metrics.getCurrentMetrics();
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
    const metrics = getConsciousnessMetrics();
    metrics.batchUpdate(input);
    
    return {
      success: true,
      updated: Object.keys(input).length,
      timestamp: Date.now()
    };
  });