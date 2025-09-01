# Limnus Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
# Using npm
npm install

# Or using bun
bun install
```

### 2. Start the Backend Server

#### Option A: Using the startup scripts (Recommended)

**On macOS/Linux:**
```bash
chmod +x run-backend.sh
./run-backend.sh
```

**On Windows:**
```bash
run-backend.bat
```

#### Option B: Manual startup
```bash
# Set environment variables
export NODE_ENV=development
export PORT=3000
export JWT_SECRET=consciousness-field-secret-key-dev

# Run the server
npx tsx backend/server.ts
```

### 3. Configure Mobile App Connection

The backend server runs on `http://localhost:3000` by default. To connect from a mobile device:

1. **Find your computer's IP address:**
   - macOS: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - Linux: `hostname -I`
   - Windows: `ipconfig` (look for IPv4 Address)

2. **Set the environment variable before starting the Expo app:**
   ```bash
   export EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP:3000
   ```
   Replace `YOUR_IP` with your actual IP address (e.g., `192.168.1.100`)

3. **Start the Expo app:**
   ```bash
   npm start
   ```

## Troubleshooting

### Backend Not Starting

1. **Check if port 3000 is in use:**
   ```bash
   # macOS/Linux
   lsof -i :3000
   
   # Windows
   netstat -ano | findstr :3000
   ```

2. **Kill the process using port 3000:**
   ```bash
   # macOS/Linux
   kill -9 $(lsof -t -i:3000)
   
   # Windows (use the PID from netstat output)
   taskkill /PID <PID> /F
   ```

### Connection Issues from Mobile

1. **Ensure both devices are on the same WiFi network**

2. **Check firewall settings:**
   - Allow Node.js through your firewall
   - Allow port 3000 for incoming connections

3. **Test the connection:**
   ```bash
   # From your mobile device's browser, try:
   http://YOUR_IP:3000/api/health
   ```

### Backend Crashes

The backend is designed to work in fallback mode without external databases:
- **PostgreSQL**: Falls back to in-memory storage
- **Redis**: Falls back to in-memory caching
- **WebSocket**: Falls back to polling mode

If it still crashes, check the logs for specific errors.

## API Endpoints

### Health Check
- `GET http://localhost:3000/api/health` - Basic health check
- `GET http://localhost:3000/api/trpc/system.health` - Detailed system health

### Authentication
- `POST http://localhost:3000/api/trpc/auth.authenticateDevice` - Device authentication

### Chat API
- `POST http://localhost:3000/api/trpc/chat.sendMessage` - Send a message
- `GET http://localhost:3000/api/trpc/chat.getConversations` - Get conversations
- `GET http://localhost:3000/api/trpc/chat.getMessages` - Get messages

## Environment Variables (Optional)

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key-here

# Database (Optional - falls back to in-memory if not set)
DATABASE_URL=postgresql://user:password@localhost:5432/limnus

# Redis (Optional - falls back to in-memory if not set)
REDIS_URL=redis://localhost:6379

# OpenAI API (Required for AI features)
OPENAI_API_KEY=your-openai-api-key
```

## Development Mode Features

In development mode, the backend includes:
- Detailed logging
- In-memory fallbacks for all external services
- Auto-reload on file changes (if using nodemon)
- CORS enabled for all origins
- Extended request timeouts

## Production Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Configure proper database and Redis connections
3. Set a secure `JWT_SECRET`
4. Configure CORS for your specific domain
5. Use a process manager like PM2 or systemd