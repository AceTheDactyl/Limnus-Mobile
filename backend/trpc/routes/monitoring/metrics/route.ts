import { publicProcedure } from '@/backend/trpc/create-context';
import { consciousnessMetrics } from '@/backend/monitoring/consciousness-metrics';
import { z } from 'zod';

export const metricsHealthProcedure = publicProcedure
  .query(async () => {
    try {
      const healthScore = await consciousnessMetrics.getConsciousnessHealthScore();
      
      return {
        success: true,
        data: {
          ...healthScore,
          timestamp: Date.now(),
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform
        }
      };
    } catch (error) {
      console.error('Failed to get consciousness health metrics:', error);
      return {
        success: false,
        error: 'Failed to retrieve health metrics',
        data: {
          score: 0,
          factors: { resonance: 0, activeNodes: 0, systemHealth: 0, cachePerformance: 0 },
          status: 'poor' as const,
          timestamp: Date.now(),
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: process.platform
        }
      };
    }
  });

export const metricsPrometheusProcedure = publicProcedure
  .query(async () => {
    try {
      const metrics = await consciousnessMetrics.getMetrics();
      
      return {
        success: true,
        data: {
          metrics,
          contentType: 'text/plain; version=0.0.4; charset=utf-8',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      console.error('Failed to get Prometheus metrics:', error);
      return {
        success: false,
        error: 'Failed to retrieve Prometheus metrics',
        data: {
          metrics: '',
          contentType: 'text/plain; version=0.0.4; charset=utf-8',
          timestamp: Date.now()
        }
      };
    }
  });

export const metricsRecordEventProcedure = publicProcedure
  .input(z.object({
    type: z.string(),
    status: z.enum(['success', 'failure']),
    devicePlatform: z.string().optional()
  }))
  .mutation(async ({ input }) => {
    try {
      consciousnessMetrics.recordEvent(input.type, input.status, input.devicePlatform);
      
      return {
        success: true,
        message: 'Event recorded successfully'
      };
    } catch (error) {
      console.error('Failed to record event metric:', error);
      return {
        success: false,
        error: 'Failed to record event'
      };
    }
  });

export const metricsRecordFieldCalculationProcedure = publicProcedure
  .input(z.object({
    duration: z.number(),
    operationType: z.string().optional()
  }))
  .mutation(async ({ input }) => {
    try {
      consciousnessMetrics.recordFieldCalculation(input.duration, input.operationType);
      
      return {
        success: true,
        message: 'Field calculation metric recorded successfully'
      };
    } catch (error) {
      console.error('Failed to record field calculation metric:', error);
      return {
        success: false,
        error: 'Failed to record field calculation'
      };
    }
  });

export const metricsRecordQuantumFieldUpdateProcedure = publicProcedure
  .input(z.object({
    fieldId: z.string(),
    updateType: z.enum(['create', 'update', 'merge'])
  }))
  .mutation(async ({ input }) => {
    try {
      consciousnessMetrics.recordQuantumFieldUpdate(input.fieldId, input.updateType);
      
      return {
        success: true,
        message: 'Quantum field update metric recorded successfully'
      };
    } catch (error) {
      console.error('Failed to record quantum field update metric:', error);
      return {
        success: false,
        error: 'Failed to record quantum field update'
      };
    }
  });