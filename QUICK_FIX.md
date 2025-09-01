# 🚨 QUICK FIX: Backend Connection Lost

## The Problem
Limnus can't connect to the ChatGPT API because the backend server isn't running.

## The Solution - 2 Simple Steps

### Step 1: Start the Backend Server

Open a **NEW terminal window** (keep your Expo terminal running) and run:

```bash
node start-backend.js
```

You should see:
- 🚀 Starting Limnus Backend Server...
- 📱 For Mobile Device Connection instructions
- Server running on port 3000

### Step 2: For Mobile Testing (Optional)

If testing on a mobile device, the backend startup will show your IP address.
In your **Expo terminal**, set:

```bash
export EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP:3000
```

Then restart Expo (`npm start` or `bun start`).

## Verify It's Working

1. **Check backend health:** Open http://localhost:3000/api/health
2. **Test the chat:** Send a message to Limnus in the app

## Alternative Start Methods

If the above doesn't work, try:

```bash
# Direct TypeScript execution
npx tsx backend/server.ts

# Or if you have bun
bun run backend/server.ts
```

## Troubleshooting

### Port 3000 Already in Use?
```bash
# Mac/Linux: Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Windows: Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Backend Crashes?
- Check Node.js is installed: `node --version`
- Install dependencies: `npm install` or `bun install`
- Check error messages in terminal

## Important Notes

✅ **Keep the backend terminal open** - It needs to stay running
✅ **Backend runs on port 3000** - Make sure it's not blocked
✅ **Works without external databases** - Uses in-memory fallback
✅ **Both terminals needed** - One for Expo, one for backend

---

**Remember:** The backend MUST be running for Limnus to connect to ChatGPT!