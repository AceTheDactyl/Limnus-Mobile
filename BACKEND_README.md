# LIMNUS Consciousness Backend

## 🚀 IMPORTANT: Start the Backend Server First!

**The backend server MUST be running for the app to work properly!**

If you're seeing "tRPC fetch error: 404" messages, it means the backend server is not running.

### 🔄 Quick Start

```bash
# Start the backend server (choose one method):

# Method 1: Using the start script (recommended)
node backend/start-server.js

# Method 2: Direct with Bun
bun run backend/server.ts

# Method 3: Using tsx
npx tsx backend/server.ts
```

### ✅ Verify Backend is Running

After starting, you should see:
```
🚀 LIMNUS Consciousness Server running on port 3000
📷 HTTP API: http://localhost:3000/api
🔌 WebSocket: ws://localhost:3000
📊 Health Check: http://localhost:3000/api/health
```

Test it by visiting: http://localhost:3000/api/health

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

## 🔧 Troubleshooting

### "tRPC fetch error: 404" - Most Common Issue

This error means the backend server is not running:

1. **Start the backend server**:
   ```bash
   node backend/start-server.js
   ```

2. **Verify it's working**:
   - Look for "🚀 LIMNUS Consciousness Server running on port 3000" in console
   - Visit http://localhost:3000/api/health in your browser
   - Should return JSON with status information

3. **Still not working?**
   - Check if port 3000 is already in use
   - Try a different port: `PORT=3001 node backend/start-server.js`
   - Check firewall settings
   - Look for error messages in the backend console

### Development Workflow

1. **Terminal 1** - Start backend:
   ```bash
   node backend/start-server.js
   ```

2. **Terminal 2** - Start Expo app:
   ```bash
   npm start
   # or npm run start-web
   ```

### Other Issues

- **Database errors**: Backend will automatically fall back to in-memory storage
- **Redis errors**: Backend will automatically fall back to in-memory caching
- **WebSocket errors**: Check port availability and firewall settings

### Debug Mode

```bash
# Enable verbose logging
DEBUG=* node backend/start-server.js
```