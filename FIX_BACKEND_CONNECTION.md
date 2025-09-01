# 🚀 Fix Backend Connection for Limnus

## Quick Solution (2 Steps)

### Step 1: Start the Backend Server
Open a **new terminal window** and run:
```bash
node start-backend.js
```

Keep this terminal open! The backend must stay running.

### Step 2: For Mobile Testing
If testing on a mobile device, in your **Expo terminal**, run:
```bash
# Find your IP (the backend startup will show it)
export EXPO_PUBLIC_RORK_API_BASE_URL=http://YOUR_IP:3000

# Then restart Expo
npm start
```

## 🔍 Test the Connection

Run this to verify everything is working:
```bash
node test-backend.js
```

## 📱 What You Should See

When the backend is running correctly:
- Terminal shows: `🚀 LIMNUS Consciousness Server running on port 3000`
- Health check: `http://localhost:3000/api/health`
- Limnus can connect to ChatGPT API
- No more "Connection lost" messages

## 🛠️ Troubleshooting

### "Connection lost" still showing?
1. **Backend not running**: Make sure `node start-backend.js` is running in a separate terminal
2. **Wrong URL**: Check that EXPO_PUBLIC_RORK_API_BASE_URL matches your backend URL
3. **Firewall**: Make sure port 3000 is not blocked

### "tRPC 404 fetch error"?
This means the backend is not running or not accessible. Start it with:
```bash
node start-backend.js
```

### Mobile device can't connect?
1. Make sure your phone and computer are on the same WiFi network
2. Use your computer's IP address (shown when backend starts)
3. Set the environment variable before starting Expo

## 🎯 Complete Setup Process

1. **Terminal 1 - Backend**:
   ```bash
   node start-backend.js
   # Leave this running!
   ```

2. **Terminal 2 - Frontend** (for mobile):
   ```bash
   # Use the IP shown by the backend
   export EXPO_PUBLIC_RORK_API_BASE_URL=http://192.168.x.x:3000
   npm start
   ```

3. **For Web Only** (localhost):
   ```bash
   # No export needed, just:
   npm start
   ```

## ✅ Success Indicators

- Backend console shows incoming requests
- No "Connection lost" messages in the app
- Limnus responds to messages
- Chat functionality works

## 📝 Important Notes

- The backend runs in **fallback mode** (no external databases needed)
- All data is stored in memory (resets when backend restarts)
- ChatGPT API integration works through the backend proxy
- Keep the backend terminal open while using the app

## 🆘 Still Having Issues?

Run the diagnostic:
```bash
node test-backend.js
```

This will show you exactly what's working and what's not.