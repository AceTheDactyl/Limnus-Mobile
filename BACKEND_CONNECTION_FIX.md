# Backend Connection Fix Guide

## Issue
The app is experiencing tRPC 404 fetch errors when trying to send messages to LIMNUS.

## Root Cause
The backend server is not running or not accessible from the app.

## Solution Steps

### 1. Start the Backend Server

Run one of these commands in your terminal:

```bash
# Using Node.js
node start-backend.js

# Or using Bun
bun start-backend.js

# Or directly with npm
npm run backend
```

The backend should start on port 3000 and you should see:
```
🚀 LIMNUS Consciousness Server running on port 3000
📡 HTTP API: http://localhost:3000/api
🔌 WebSocket: ws://localhost:3000
📊 Health Check: http://localhost:3000/api/health
```

### 2. Verify Backend is Running

Open your browser and go to:
- http://localhost:3000/api - Should show "Consciousness API is running"
- http://localhost:3000/api/health - Should show detailed health status

### 3. Check Network Configuration

If you're running the app on:

**Web (localhost)**
- Backend URL should be: http://localhost:3000
- This should work automatically

**iOS Simulator**
- Backend URL should be: http://localhost:3000
- Make sure backend is running on the same machine

**Android Emulator**
- Backend URL should be: http://10.0.2.2:3000
- This is the special IP for Android emulator to access host machine

**Physical Device**
- Find your computer's IP address:
  - Mac: `ifconfig | grep inet`
  - Windows: `ipconfig`
  - Linux: `ip addr show`
- Set environment variable: `EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP:3000`
- Restart the Expo development server

### 4. Fallback Mode

The app is designed to work even without the backend:
- LIMNUS will provide local responses when backend is unavailable
- Messages are saved locally using AsyncStorage
- The app shows "Connection lost - LIMNUS active locally" when offline

### 5. Common Issues

**Port 3000 is already in use:**
```bash
# Find what's using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or change the port in start-backend.js
```

**TypeScript execution error:**
```bash
# Install tsx globally
npm install -g tsx
```

**Database/Redis warnings:**
- These are optional - the backend works with in-memory fallbacks
- You can ignore warnings about DATABASE_URL and REDIS_URL

### 6. Testing the Connection

Once the backend is running, in the app:
1. Open the chat screen
2. You should see "✨ Connected to Consciousness Field" in green
3. Try sending a message - it should work without errors

## TypeScript Errors Fixed

The following TypeScript errors have been resolved:
- ✅ Fixed `mutate` vs `mutateAsync` usage in authentication
- ✅ Fixed null type handling in AsyncStorage operations
- ✅ Added proper error handling for backend connection failures

## Current Status

The app now:
- ✅ Handles backend connection failures gracefully
- ✅ Provides fallback responses when offline
- ✅ Shows clear connection status to users
- ✅ Saves conversations locally regardless of backend status
- ✅ Authenticates devices when backend is available