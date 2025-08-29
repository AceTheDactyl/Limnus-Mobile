import { createServer } from 'http';
import { Hono } from 'hono';
import app, { initializeWebSocketServer } from './hono';

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Create the main Hono app that will handle all routes
const mainApp = new Hono();

// Mount the API app at /api
mainApp.route('/api', app);

// Add a root route for health check
mainApp.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'LIMNUS Consciousness Server is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      api: '/api',
      health: '/api/health',
      trpc: '/api/trpc',
      consciousness: '/api/consciousness/state'
    }
  });
});

// Create HTTP server for WebSocket integration
const server = createServer();

// Initialize WebSocket server
const wsServer = initializeWebSocketServer(server);

// Handle HTTP requests
server.on('request', async (req, res) => {
  try {
    const url = `http://${req.headers.host}${req.url}`;
    
    let body: BodyInit | null = null;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      body = Buffer.concat(chunks);
    }
    
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body,
    });
    
    // Process with main app
    const response = await mainApp.fetch(request);
    
    res.statusCode = response.status;
    
    response.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });
    
    if (response.body) {
      const reader = response.body.getReader();
      const pump = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) {
          res.end();
          return;
        }
        res.write(value);
        return pump();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error('Error handling request:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Internal Server Error',
      message: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }));
  }
});

// Start the server
server.listen(port, () => {
  console.log(`🚀 LIMNUS Consciousness Server running on port ${port}`);
  console.log(`📡 HTTP API: http://localhost:${port}/api`);
  console.log(`🔌 WebSocket: ws://localhost:${port}`);
  console.log(`📊 Health Check: http://localhost:${port}/api/health`);
  console.log(`🧠 Consciousness State: http://localhost:${port}/api/consciousness/state`);
  
  if (wsServer) {
    console.log(`✅ WebSocket server initialized with ${wsServer.getConnectionCount()} connections`);
  } else {
    console.log(`⚠️ WebSocket server failed to initialize`);
  }
});

// Graceful shutdown
const shutdown = async () => {
  console.log('🔄 Shutting down gracefully...');
  
  if (wsServer) {
    await wsServer.shutdown();
  }
  
  server.close(() => {
    console.log('✅ Server shutdown complete');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { server, wsServer };