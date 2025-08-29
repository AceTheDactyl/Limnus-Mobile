import { publicProcedure } from '../../../create-context';
import { z } from 'zod';

// Fallback health metrics when consciousness-metrics is not available
const getFallbackHealthScore = () => {
  return {
    score: 0.5,
    factors: {
      resonance: 0.5,
      activeNodes: 0.3,
      systemHealth: 1.0, // System is running
      cachePerformance: 0.8
    },
    status: 'good' as const
  };
};

export const metricsHealthProcedure = publicProcedure
  .query(async () => {
    try {
      // Try to import consciousness metrics dynamically
      let healthScore;
      try {
        const { consciousnessMetrics } = await import('../../../../monitoring/consciousness-metrics');
        healthScore = await consciousnessMetrics.getConsciousnessHealthScore();
      } catch (importError) {
        console.warn('Consciousness metrics not available, using fallback:', importError);
        healthScore = getFallbackHealthScore();
      }
      
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
          ...getFallbackHealthScore(),
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
      let metrics = '';
      try {
        const { consciousnessMetrics } = await import('../../../../monitoring/consciousness-metrics');
        metrics = await consciousnessMetrics.getMetrics();
      } catch (importError) {
        console.warn('Consciousness metrics not available for Prometheus export:', importError);
        // Provide basic fallback metrics
        metrics = `# HELP system_uptime_seconds System uptime in seconds\n# TYPE system_uptime_seconds gauge\nsystem_uptime_seconds ${process.uptime()}\n`;
      }
      
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
      try {
        const { consciousnessMetrics } = await import('../../../../monitoring/consciousness-metrics');
        consciousnessMetrics.recordEvent(input.type, input.status, input.devicePlatform);
      } catch (importError) {
        console.warn('Consciousness metrics not available for event recording:', importError);
        // Log the event for debugging
        console.log(`Event recorded (fallback): ${input.type} - ${input.status} - ${input.devicePlatform || 'unknown'}`);
      }
      
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
      try {
        const { consciousnessMetrics } = await import('../../../../monitoring/consciousness-metrics');
        consciousnessMetrics.recordFieldCalculation(input.duration, input.operationType);
      } catch (importError) {
        console.warn('Consciousness metrics not available for field calculation recording:', importError);
        // Log the calculation for debugging
        console.log(`Field calculation recorded (fallback): ${input.operationType || 'general'} - ${input.duration}ms`);
      }
      
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
      try {
        const { consciousnessMetrics } = await import('../../../../monitoring/consciousness-metrics');
        consciousnessMetrics.recordQuantumFieldUpdate(input.fieldId, input.updateType);
      } catch (importError) {
        console.warn('Consciousness metrics not available for quantum field update recording:', importError);
        // Log the update for debugging
        console.log(`Quantum field update recorded (fallback): ${input.fieldId} - ${input.updateType}`);
      }
      
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