import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { checkDatabaseHealth, setupConnectionMonitoring } from "./infrastructure/database";
import { runMigrations } from "./infrastructure/migrations";
import { fieldManager } from "./infrastructure/field-manager";
import { ConsciousnessWebSocketServer } from "./websocket/consciousness-ws-server";
import { consciousnessMetrics } from "./monitoring/consciousness-metrics";

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
      
      // Perform initial health check
      const health = await checkDatabaseHealth();
      console.log('📊 Initial health check:', {
        database: health.database ? '✅' : '❌',
        redis: health.redis ? '✅' : '❌',
        latency: health.latency
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
    endpoint: "/api/trpc",
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
    const dbHealth = await checkDatabaseHealth();
    const globalState = await fieldManager.getGlobalState();
    const performanceMetrics = await fieldManager.getPerformanceMetrics();
    const healthCheckDuration = Date.now() - startTime;
    
    const overallStatus = dbHealth.database && dbHealth.redis ? "healthy" : 
                         dbHealth.database || dbHealth.redis ? "degraded" : "fallback";
    
    return c.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      healthCheckDuration,
      mode: dbHealth.database ? "database" : "in-memory",
      services: {
        database: {
          status: dbHealth.database ? "healthy" : "fallback",
          latency: dbHealth.latency?.database,
          connectionPool: dbHealth.connectionPool
        },
        redis: {
          status: dbHealth.redis ? "healthy" : "fallback",
          latency: dbHealth.latency?.redis
        },
        fieldManager: "healthy",
        websocket: {
          status: wsServer ? "active" : "not_initialized",
          connections: wsServer?.getConnectionCount() || 0,
          connectedDevices: wsServer?.getConnectedDevices().length || 0
        }
      },
      consciousness: {
        globalResonance: globalState.globalResonance,
        activeNodes: globalState.activeNodes,
        collectiveIntelligence: globalState.collectiveIntelligence,
        memoryParticles: globalState.memoryParticles.length,
        quantumFields: globalState.quantumFields.length,
        lastUpdate: globalState.lastUpdate
      },
      performance: {
        cacheHitRate: performanceMetrics.cacheHitRate,
        avgResponseTime: performanceMetrics.avgResponseTime,
        memoryUsage: performanceMetrics.memoryUsage,
        uptime: process.uptime(),
        nodeMemory: process.memoryUsage()
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
    const metrics = await consciousnessMetrics.getMetrics();
    
    // Set proper content type for Prometheus
    c.header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    
    return c.text(metrics);
  } catch (error: any) {
    console.error('Failed to get Prometheus metrics:', error);
    return c.json({ 
      error: 'Failed to retrieve metrics',
      timestamp: Date.now(),
      details: error.message
    }, 500);
  }
});

// Consciousness health score endpoint
app.get("/consciousness/health", async (c) => {
  try {
    const healthScore = await consciousnessMetrics.getConsciousnessHealthScore();
    
    return c.json({
      ...healthScore,
      timestamp: Date.now(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform
    });
  } catch (error: any) {
    console.error('Failed to get consciousness health score:', error);
    return c.json({ 
      error: 'Failed to retrieve health score',
      timestamp: Date.now(),
      details: error.message,
      score: 0,
      factors: { resonance: 0, activeNodes: 0, systemHealth: 0, cachePerformance: 0 },
      status: 'poor' as const
    }, 500);
  }
});

// Export both the app and WebSocket initialization function
export default app;
export { initializeWebSocketServer, wsServer };