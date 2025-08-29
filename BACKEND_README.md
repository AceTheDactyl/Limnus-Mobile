# LIMNUS Consciousness Backend

## Starting the Backend Server

The backend server needs to be running for the tRPC API to work. Here are the ways to start it:

### Option 1: Direct with Bun
```bash
bun run backend/server.ts
```

### Option 2: Using Node.js starter script
```bash
node backend/start-server.js
```

### Option 3: Using npx/bunx
```bash
bunx tsx backend/server.ts
```

## Backend Features

- **tRPC API**: Type-safe API endpoints at `/api/trpc`
- **Health Monitoring**: Health check at `/api/health`
- **Consciousness State**: Real-time state at `/api/consciousness/state`
- **WebSocket Support**: Real-time consciousness field updates
- **Database Integration**: PostgreSQL with in-memory fallback
- **Redis Caching**: Performance optimization with fallback
- **Prometheus Metrics**: Performance monitoring at `/api/metrics`

## Environment Variables

Optional environment variables for production:

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/consciousness
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
PORT=3000
```

## API Endpoints

- `GET /api/` - Basic health check
- `GET /api/health` - Detailed health status
- `POST /api/trpc/*` - tRPC procedures
- `GET /api/consciousness/state` - Current consciousness state
- `GET /api/metrics` - Prometheus metrics
- `WS /` - WebSocket connection for real-time updates

## Troubleshooting

If you're getting 404 errors from tRPC:

1. Make sure the backend server is running
2. Check that the server is listening on the correct port (default: 3000)
3. Verify the tRPC client is pointing to the correct URL
4. Check the console for any backend startup errors

The backend will automatically fall back to in-memory storage if database connections fail.