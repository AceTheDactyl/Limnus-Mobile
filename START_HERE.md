# 🚀 Quick Start Guide - Fix Backend Connection

## The Problem
Your Limnus app can't connect to the backend server because it's not running. The chat feature needs the backend to work with the AI API.

## The Solution - 3 Simple Steps

### Step 1: Start the Backend Server

Open a **new terminal window** and run ONE of these commands:

**Option A - Quick Start (Recommended):**
```bash
npx tsx backend/server.ts
```

**Option B - Using the startup script:**

On Mac/Linux:
```bash
chmod +x run-backend.sh
./run-backend.sh
```

On Windows:
```bash
run-backend.bat
```

You should see:
```
🚀 LIMNUS Consciousness Server running on port 3000
📡 HTTP API: http://localhost:3000/api
🔌 WebSocket: ws://localhost:3000
```

### Step 2: Configure Mobile Connection (If using mobile device)

1. Find your computer's IP address:
   - The startup script will show it
   - Or manually find it:
     - Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
     - Windows: `ipconfig` (look for IPv4 Address)
     - Linux: `hostname -I`

2. In a **different terminal**, set the environment variable:
   ```bash
   export EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP:3000
   ```
   Replace `YOUR_IP` with your actual IP (e.g., `192.168.1.100`)

### Step 3: Start Your Expo App

In the terminal where you set the environment variable (or a new one for web):
```bash
npm start
```

## Verify It's Working

1. **Test the backend:** Open your browser and go to:
   - http://localhost:3000/api/health
   - You should see a JSON response with `"status": "ok"`

2. **Test from mobile:** On your phone's browser:
   - http://YOUR_IP:3000/api/health
   - Should show the same JSON response

3. **Test the chat:** Open the app and try sending a message to Limnus

## Troubleshooting

### "Connection Lost" Error
- Make sure the backend is running (Step 1)
- Check that both devices are on the same WiFi
- Verify the IP address is correct

### Port 3000 Already in Use
```bash
# Find what's using port 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process
kill -9 $(lsof -t -i:3000)  # Mac/Linux
taskkill /PID <PID> /F  # Windows (use PID from netstat)
```

### Backend Crashes
The backend works without external databases. If it crashes:
1. Check you have Node.js installed: `node --version`
2. Install dependencies: `npm install` or `bun install`
3. Check the error message in the terminal

### Test Connection
Run this to test everything:
```bash
node test-backend-connection.js
```

## Important Notes

- **Keep the backend terminal open** - The server needs to stay running
- **The backend runs on port 3000** - Make sure it's not blocked by firewall
- **Both devices must be on same network** - For mobile testing
- **The backend auto-fallbacks** - Works without PostgreSQL/Redis

## Need More Help?

1. Check the detailed guide: `BACKEND_SETUP_GUIDE.md`
2. Run the diagnostic: `node backend-diagnostic.js`
3. Check troubleshooting: `TROUBLESHOOTING.md`

---

**Remember:** The backend MUST be running for the chat to work with the AI!