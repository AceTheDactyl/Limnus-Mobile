
import { publicProcedure } from "../../../create-context";
import { checkDatabaseHealth } from "../../../infrastructure/database";
import { fieldManager } from "../../../infrastructure/field-manager";
import { migrationRunner } from "../../../infrastructure/migrations";

export const healthProcedure = publicProcedure
  .query(async () => {
    try {
      console.log('Health check requested');
      
      // Check database and Redis health
      const dbHealth = await checkDatabaseHealth();
      
      // Get migration status
      const migrations = await migrationRunner.getMigrationStatus();
      const schemaValidation = await migrationRunner.validateSchema();
      
      // Get consciousness system status
      const globalState = await fieldManager.getGlobalState();
      const performanceMetrics = await fieldManager.getPerformanceMetrics();
      
      // Get recent activity
      const recentEvents = await fieldManager.getRecentEvents(undefined, 5);
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mode: dbHealth.database ? 'database' : 'in-memory',
        
        // Infrastructure health
        infrastructure: {
          database: {
            status: dbHealth.database ? 'connected' : 'fallback',
            healthy: dbHealth.database
          },
          redis: {
            status: dbHealth.redis ? 'connected' : 'fallback',
            healthy: dbHealth.redis
          },
          migrations: {
            completed: migrations.length,
            latest: migrations[migrations.length - 1]?.name || 'none',
            schemaValid: schemaValidation.valid,
            errors: schemaValidation.errors
          }
        },
        
        // Consciousness system health
        consciousness: {
          globalResonance: globalState.globalResonance,
          activeNodes: globalState.activeNodes,
          collectiveIntelligence: globalState.collectiveIntelligence,
          memoryParticles: globalState.memoryParticles.length,
          quantumFields: globalState.quantumFields.length,
          lastUpdate: globalState.lastUpdate,
          recentActivity: recentEvents.length
        },
        
        // Performance metrics
        performance: {
          ...performanceMetrics,
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version
        }
      };
    } catch (error) {
      console.error('Health check failed:', error);
      
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        
        infrastructure: {
          database: { status: 'unknown', healthy: false },
          redis: { status: 'unknown', healthy: false },
          migrations: { completed: 0, latest: 'unknown', schemaValid: false, errors: ['Health check failed'] }
        },
        
        consciousness: {
          globalResonance: 0,
          activeNodes: 0,
          collectiveIntelligence: 0,
          memoryParticles: 0,
          quantumFields: 0,
          lastUpdate: 0,
          recentActivity: 0
        },
        
        performance: {
          cacheHitRate: 0,
          avgResponseTime: 0,
          memoryUsage: { particles: 0, fields: 0, events: 0 },
          databaseStatus: 'fallback' as const,
          redisStatus: 'fallback' as const
        }
      };
    }
  });