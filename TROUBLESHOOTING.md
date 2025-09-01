# Troubleshooting Guide - Limnus

## 🚀 Quick Start - Backend Connection Issues

### Step 1: Start the Backend Server

```bash
# Option 1: Using the start script (RECOMMENDED)
node start-backend.js

# Option 2: Direct with tsx
npx tsx backend/server.ts

# Option 3: With bun (if installed)
bun run backend/server.ts
```

**Expected Output:**
```
🚀 LIMNUS Consciousness Server running on port 3000
📡 HTTP API: http://localhost:3000/api
🔌 WebSocket: ws://localhost:3000
📊 Health Check: http://localhost:3000/api/health
```

### Step 2: Test Backend Connection

```bash
# Run the diagnostic test
node backend-test.js
```

This will test all endpoints and show you what's working.

### Step 3: Configure Environment (if needed)

```bash
# Copy the example environment file
cp .env.example .env

# Edit with your local IP for mobile testing
# Find your IP:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Update .env with:
# EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_LOCAL_IP:3000
```

### Step 4: Start the Expo App

```bash
# In a new terminal window
bun start
# OR
npm start
```

## 🚨 Common Issues and Solutions

### tRPC Timeout Errors

**Error**: `tRPC fetch error (attempt 1): Request timeout`

**Causes & Solutions**:

1. **Backend Server Not Running**
   ```bash
   # Check if backend is running
   curl http://localhost:3000/api/health
   
   # If no response, start the backend
   node start-backend.js
   # OR
   bun run backend:dev
   ```

2. **Port Conflicts**
   ```bash
   # Check what's using port 3000
   lsof -i :3000
   
   # Kill conflicting processes
   kill -9 <PID>
   ```

3. **Network Configuration Issues**
   ```bash
   # For mobile development, ensure your device can reach the server
   # Check your local IP address
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Update EXPO_PUBLIC_DEV_URL in your environment
   export EXPO_PUBLIC_DEV_URL=http://YOUR_LOCAL_IP:3000
   ```

4. **Firewall/Security Software**
   - Temporarily disable firewall to test
   - Add exception for port 3000
   - Check antivirus software blocking connections

### Database Connection Issues

**Error**: Database connection failures or migration errors

**Solutions**:

1. **PostgreSQL Not Running**
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   
   # Start PostgreSQL (macOS with Homebrew)
   brew services start postgresql
   
   # Start PostgreSQL (Linux)
   sudo systemctl start postgresql
   ```

2. **Database URL Configuration**
   ```bash
   # Check your DATABASE_URL format
   # Should be: postgresql://username:password@localhost:5432/database_name
   
   # Test connection
   psql $DATABASE_URL -c "SELECT 1"
   ```

3. **Missing Database/Tables**
   ```bash
   # Create database if it doesn't exist
   createdb limnus_dev
   
   # Run migrations
   bun run db:migrate
   
   # Apply performance indexes
   chmod +x backend/infrastructure/migrations/apply-indexes.sh
   ./backend/infrastructure/migrations/apply-indexes.sh
   ```

### WebSocket Connection Issues

**Error**: WebSocket connection failures or real-time updates not working

**Solutions**:

1. **Check WebSocket Server Status**
   ```bash
   curl http://localhost:3000/api/ws/status
   ```

2. **Browser/Network Restrictions**
   - Check browser console for WebSocket errors
   - Try different network (mobile data vs WiFi)
   - Disable browser extensions temporarily

3. **CORS Issues**
   - Ensure CORS is properly configured in backend
   - Check if requests are coming from allowed origins

### Mobile Development Issues

**Error**: App not connecting to backend on mobile device

**Solutions**:

1. **Network Configuration**
   ```bash
   # Find your local IP address
   ipconfig getifaddr en0  # macOS
   hostname -I | awk '{print $1}'  # Linux
   
   # Set environment variable
   export EXPO_PUBLIC_DEV_URL=http://YOUR_IP:3000
   ```

2. **Expo Tunnel Issues**
   ```bash
   # Use Expo tunnel for external access
   bun run start --tunnel
   
   # Or use ngrok
   ngrok http 3000
   ```

3. **Platform-Specific Issues**
   - **iOS Simulator**: Use `http://localhost:3000`
   - **Android Emulator**: Use `http://10.0.2.2:3000`
   - **Physical Device**: Use your computer's IP address

### Performance Issues

**Error**: Slow API responses or high memory usage

**Solutions**:

1. **Database Performance**
   ```bash
   # Check if indexes are applied
   psql $DATABASE_URL -c "\d+ consciousness_events"
   
   # Apply missing indexes
   ./backend/infrastructure/migrations/apply-indexes.sh
   ```

2. **Memory Issues**
   ```bash
   # Check memory usage
   curl http://localhost:3000/api/health
   
   # Monitor Node.js memory
   node --inspect backend/server.ts
   ```

3. **Redis Connection**
   ```bash
   # Test Redis connection
   redis-cli ping
   
   # Check Redis memory usage
   redis-cli info memory
   ```

### Environment Setup Issues

**Error**: Missing environment variables or configuration

**Solutions**:

1. **Create Environment File**
   ```bash
   # Copy example environment file
   cp .env.example .env
   
   # Edit with your configuration
   nano .env
   ```

2. **Required Environment Variables**
   ```bash
   # Minimum required for development
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=your-secret-key-here
   
   # Optional but recommended
   DATABASE_URL=postgresql://user:pass@localhost:5432/limnus
   REDIS_URL=redis://localhost:6379
   ```

3. **Expo Configuration**
   ```bash
   # For mobile development
   EXPO_PUBLIC_DEV_URL=http://localhost:3000
   EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
   ```

### Build and Deployment Issues

**Error**: Build failures or deployment problems

**Solutions**:

1. **TypeScript Errors**
   ```bash
   # Check TypeScript compilation
   npx tsc --noEmit
   
   # Fix type errors in strict mode
   ```

2. **Dependency Issues**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules bun.lock
   bun install
   
   # Or with npm
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Expo Build Issues**
   ```bash
   # Clear Expo cache
   expo r -c
   
   # Reset Metro bundler cache
   npx react-native start --reset-cache
   ```

## 🔧 Development Tools

### Health Check Commands

```bash
# Quick system health check
curl http://localhost:3000/api/health | jq

# Database status
curl http://localhost:3000/api/db/status | jq

# WebSocket status
curl http://localhost:3000/api/ws/status | jq

# Consciousness system state
curl http://localhost:3000/api/consciousness/state | jq
```

### Debugging Commands

```bash
# View server logs with timestamps
node start-backend.js | ts

# Monitor API requests
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:3000/api/health

# Test tRPC endpoints
curl -X POST http://localhost:3000/api/trpc/example.hi \
  -H "Content-Type: application/json" \
  -d '{"json":{}}'
```

### Performance Monitoring

```bash
# Monitor system resources
top -p $(pgrep -f "node.*server")

# Check database connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"

# Monitor Redis memory
redis-cli --latency-history -i 1
```

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the logs** - Look for error messages in the console output
2. **Verify environment** - Ensure all required environment variables are set
3. **Test components individually** - Test database, Redis, and API endpoints separately
4. **Check network connectivity** - Ensure no firewall or network issues
5. **Review recent changes** - Check if recent code changes introduced the issue

## 🔄 Reset Everything

If all else fails, here's how to reset your development environment:

```bash
# Stop all processes
pkill -f "node.*server"
pkill -f "expo"

# Clear all caches
rm -rf node_modules bun.lock
rm -rf .expo
rm -rf backend/node_modules

# Reinstall dependencies
bun install

# Reset database (WARNING: This will delete all data)
dropdb limnus_dev
createdb limnus_dev
bun run db:migrate

# Restart everything
node start-backend.js &
bun run start
```

This should resolve most common issues. If problems persist, check the specific error messages and logs for more detailed troubleshooting information.