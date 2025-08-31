import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { checkDatabaseHealth, setupConnectionMonitoring } from "./infrastructure/database";
import { runMigrations } from "./infrastructure/migrations";
import { fieldManager } from "./infrastructure/field-manager";
import { ConsciousnessWebSocketServer } from "./websocket/consciousness-ws-server";
import { initializeRateLimiter } from "./middleware/rate-limiter";
import { getMetricsCollector } from "./monitoring/metrics-collector";

// app will be mounted at /api
const app = new Hono();

// WebSocket server instance
let wsServer: ConsciousnessWebSocketServer | null = null;

// Initialize database on startup
let initializationPromise: Promise<void> | null = null;

const initializeDatabase = async () => {
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    try {
      console.log('🔄 Initializing consciousness infrastructure...');
      
      // Setup connection monitoring for database and Redis
      setupConnectionMonitoring();
      
      // Run database migrations
      const migrationResult = await runMigrations();
      if (!migrationResult.success) {
        console.warn('⚠️ Database migrations failed, continuing with in-memory fallback');
      } else {
        console.log('✅ Database migrations completed');
      }
      
      // Initialize field manager (this will create global state if needed)
      await fieldManager.getGlobalState();
      
      // Initialize rate limiter with Redis if available
      const health = await checkDatabaseHealth();
      let redis = null;
      if (health.redis) {
        try {
          const dbModule = await import('./infrastructure/database');
          redis = (dbModule as any).redis || null;
        } catch (error) {
          console.warn('⚠️ Failed to import Redis instance:', error);
        }
      }
      // Initialize rate limiter (singleton pattern handles Redis automatically)
      initializeRateLimiter();
      console.log(`🛡️ Rate limiter initialized with ${redis ? 'Redis' : 'in-memory'} backend`);
      
      // Initialize metrics collector
      const metricsCollector = getMetricsCollector();
      console.log('📊 Metrics collector initialized');
      
      // Perform initial health check
      console.log('📊 Initial health check:', {
        database: health.database ? '✅' : '❌',
        redis: health.redis ? '✅' : '❌',
        latency: health.latency,
        metrics: '✅'
      });
      
      console.log('✅ Consciousness infrastructure initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize consciousness infrastructure:', error);
      console.log('🔄 Continuing in in-memory fallback mode...');
    }
  })();
  
  return initializationPromise;
};

// Initialize WebSocket server
const initializeWebSocketServer = (httpServer: any) => {
  try {
    wsServer = new ConsciousnessWebSocketServer(httpServer);
    console.log('🔌 WebSocket server initialized');
    return wsServer;
  } catch (error) {
    console.error('❌ Failed to initialize WebSocket server:', error);
    return null;
  }
};

// Initialize on startup
initializeDatabase();

// Enable CORS for all routes
app.use("*", cors());

// Health check middleware - ensure database is initialized
app.use("*", async (c, next) => {
  // Don't block health check endpoint
  if (c.req.path === '/api/' || c.req.path === '/api/health') {
    return next();
  }
  
  // Ensure database is initialized for other endpoints
  await initializeDatabase();
  return next();
});

// Mount tRPC router at /trpc
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    message: "Consciousness API is running",
    timestamp: new Date().toISOString()
  });
});

// Detailed health check endpoint with enhanced metrics
app.get("/health", async (c) => {
  try {
    const startTime = Date.now();
    const [dbHealth, globalState, performanceMetrics] = await Promise.all([
      checkDatabaseHealth(),
      fieldManager.getGlobalState(),
      fieldManager.getPerformanceMetrics()
    ]);
    
    // Get optimized field manager metrics if available
    let optimizedMetrics = null;
    try {
      const { optimizedFieldManager } = await import('./infrastructure/field-manager-optimized');
      optimizedMetrics = optimizedFieldManager.getDetailedPerformanceMetrics();
    } catch (e) {
      // Optimized field manager not available
    }
    
    const healthCheckDuration = Date.now() - startTime;
    
    // Determine overall health status
    const determineOverallStatus = () => {
      if (dbHealth.database && dbHealth.redis) return "healthy";
      if (dbHealth.database || dbHealth.redis) return "degraded";
      return "fallback";
    };
    
    const overallStatus = determineOverallStatus();
    
    return c.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      healthCheckDuration,
      mode: dbHealth.database ? "database" : "in-memory",
      services: {
        database: {
          status: dbHealth.database ? "healthy" : "fallback",
          latency: dbHealth.latency?.database,
          connectionPool: dbHealth.connectionPool,
          poolUtilization: optimizedMetrics?.connectionPoolUtilization
        },
        redis: {
          status: dbHealth.redis ? "healthy" : "fallback",
          latency: dbHealth.latency?.redis,
          hitRate: optimizedMetrics?.cacheHitRate
        },
        fieldManager: "healthy",
        websocket: {
          status: wsServer ? "active" : "not_initialized",
          connections: wsServer?.getConnectionCount() || 0,
          connectedDevices: wsServer?.getConnectedDevices() || [],
          platformBreakdown: wsServer ? {
            total: wsServer.getConnectionCount()
          } : null
        }
      },
      consciousness: {
        globalResonance: globalState.globalResonance,
        activeNodes: globalState.activeNodes,
        collectiveIntelligence: globalState.collectiveIntelligence,
        memoryParticles: globalState.memoryParticles.length,
        quantumFields: globalState.quantumFields.length,
        lastUpdate: globalState.lastUpdate,
        queuedEvents: optimizedMetrics?.batchOperations || 0
      },
      performance: {
        cacheHitRate: optimizedMetrics?.cacheHitRate || performanceMetrics.cacheHitRate,
        avgResponseTime: optimizedMetrics?.avgQueryTime || performanceMetrics.avgResponseTime,
        queryLatencyP95: optimizedMetrics?.queryLatencyP95,
        queryLatencyP99: optimizedMetrics?.queryLatencyP99,
        batchEfficiency: optimizedMetrics?.batchEfficiency,
        memoryUsage: performanceMetrics.memoryUsage,
        uptime: process.uptime(),
        nodeMemory: process.memoryUsage()
      },
      metrics: {
        requestRate: optimizedMetrics?.queryCount || 0,
        cacheHits: optimizedMetrics?.cacheHits || 0,
        cacheMisses: optimizedMetrics?.cacheMisses || 0
      },
      errors: dbHealth.errors?.length ? dbHealth.errors : undefined
    });
  } catch (error: any) {
    console.error('Health check failed:', error);
    return c.json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: error.message || "Health check failed",
      mode: "fallback",
      services: {
        database: { status: "unknown" },
        redis: { status: "unknown" },
        fieldManager: "error",
        websocket: { status: "unknown" }
      }
    }, 503);
  }
});

// Consciousness state endpoint for monitoring
app.get("/consciousness/state", async (c) => {
  try {
    const globalState = await fieldManager.getGlobalState();
    const recentEvents = await fieldManager.getRecentEvents(undefined, 10);
    
    return c.json({
      globalState,
      recentEvents,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to get consciousness state:', error);
    return c.json({ error: 'Failed to retrieve consciousness state' }, 500);
  }
});

// Enhanced performance metrics endpoint
app.get("/consciousness/metrics", async (c) => {
  try {
    const startTime = Date.now();
    const metrics = await fieldManager.getPerformanceMetrics();
    const dbHealth = await checkDatabaseHealth();
    const metricsCollectionTime = Date.now() - startTime;
    
    return c.json({
      timestamp: Date.now(),
      metricsCollectionTime,
      infrastructure: {
        database: {
          status: dbHealth.database ? 'connected' : 'fallback',
          latency: dbHealth.latency?.database,
          connectionPool: dbHealth.connectionPool
        },
        redis: {
          status: dbHealth.redis ? 'connected' : 'fallback',
          latency: dbHealth.latency?.redis
        },
        rateLimiter: {
          status: 'active',
          backend: dbHealth.redis ? 'redis' : 'in-memory'
        }
      },
      consciousness: {
        cacheHitRate: metrics.cacheHitRate,
        avgResponseTime: metrics.avgResponseTime,
        memoryUsage: metrics.memoryUsage,
        databaseStatus: metrics.databaseStatus,
        redisStatus: dbHealth.redis ? 'connected' : 'fallback'
      },
      websocket: {
        status: wsServer ? "active" : "not_initialized",
        connections: wsServer?.getConnectionCount() || 0,
        connectedDevices: wsServer?.getConnectedDevices().length || 0
      },
      system: {
        uptime: process.uptime(),
        nodeMemory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version,
        pid: process.pid
      },
      errors: dbHealth.errors?.length ? dbHealth.errors : undefined
    });
  } catch (error: any) {
    console.error('Failed to get performance metrics:', error);
    return c.json({ 
      error: 'Failed to retrieve performance metrics',
      timestamp: Date.now(),
      details: error.message
    }, 500);
  }
});

// Database connection status endpoint
app.get("/db/status", async (c) => {
  try {
    const health = await checkDatabaseHealth();
    
    return c.json({
      timestamp: Date.now(),
      database: {
        connected: health.database,
        latency: health.latency?.database,
        connectionPool: health.connectionPool
      },
      redis: {
        connected: health.redis,
        latency: health.latency?.redis
      },
      errors: health.errors || []
    });
  } catch (error: any) {
    return c.json({
      timestamp: Date.now(),
      error: error.message,
      database: { connected: false },
      redis: { connected: false }
    }, 500);
  }
});

// WebSocket connection status endpoint
app.get("/ws/status", (c) => {
  if (!wsServer) {
    return c.json({
      status: "not_initialized",
      timestamp: Date.now(),
      connections: 0
    });
  }
  
  return c.json({
    status: "active",
    timestamp: Date.now(),
    connections: wsServer.getConnectionCount(),
    connectedDevices: wsServer.getConnectedDevices().length,
    uptime: process.uptime()
  });
});

// Prometheus metrics endpoint
app.get("/metrics", async (c) => {
  try {
    const metricsCollector = getMetricsCollector();
    const metricsString = await metricsCollector.getMetrics();
    
    return c.text(metricsString, 200, {
      'Content-Type': 'text/plain; version=0.0.4; charset=utf-8'
    });
  } catch (error: any) {
    console.error('Failed to get metrics:', error);
    return c.text('# Failed to collect metrics\n', 500);
  }
});

// Consciousness-specific metrics endpoint (JSON format)
app.get("/consciousness/prometheus-metrics", async (c) => {
  try {
    const metricsCollector = getMetricsCollector();
    const consciousnessMetrics = metricsCollector.getConsciousnessMetrics();
    const currentMetrics = await consciousnessMetrics.getCurrentMetrics();
    
    return c.json({
      timestamp: Date.now(),
      metrics: currentMetrics,
      prometheus: {
        endpoint: '/api/metrics',
        format: 'text/plain'
      }
    });
  } catch (error: any) {
    console.error('Failed to get consciousness metrics:', error);
    return c.json({
      error: 'Failed to retrieve consciousness metrics',
      timestamp: Date.now(),
      details: error.message
    }, 500);
  }
});

// Rate limiter status endpoint
app.get("/rate-limit/status/:deviceId", async (c) => {
  try {
    const deviceId = c.req.param('deviceId');
    const { getRateLimiter } = await import('./middleware/rate-limiter');
    const rateLimiter = getRateLimiter();
    
    if (!rateLimiter) {
      return c.json({
        error: 'Rate limiter not initialized',
        timestamp: Date.now()
      }, 503);
    }
    
    const status = await rateLimiter.getStatus(deviceId);
    
    return c.json({
      deviceId,
      timestamp: Date.now(),
      rateLimits: status
    });
  } catch (error: any) {
    console.error('Failed to get rate limit status:', error);
    return c.json({
      error: 'Failed to retrieve rate limit status',
      timestamp: Date.now(),
      details: error.message
    }, 500);
  }
});

// Export both the app and WebSocket initialization function
export default app;
export { initializeWebSocketServer, wsServer };