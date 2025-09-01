#!/bin/bash

echo "🚀 Starting Limnus Backend Server..."
echo ""
echo "📋 Prerequisites:"
echo "   - Node.js installed"
echo "   - Dependencies installed (npm install or bun install)"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if tsx is available
if ! npx tsx --version &> /dev/null 2>&1; then
    echo "📦 Installing tsx..."
    npm install -g tsx
fi

# Get local IP address for different OS
get_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}'
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        hostname -I | awk '{print $1}'
    else
        # Windows (Git Bash) or other
        ipconfig | grep -A 4 "Wireless LAN adapter Wi-Fi" | grep "IPv4" | awk '{print $NF}'
    fi
}

LOCAL_IP=$(get_ip)

echo "🌐 Network Configuration:"
echo "   Local IP: ${LOCAL_IP:-Unable to detect}"
echo "   Port: 3000"
echo ""
echo "📱 For mobile device connection:"
echo "   1. Make sure your phone is on the same WiFi network"
echo "   2. Set this environment variable in a new terminal:"
echo ""
echo "   export EXPO_PUBLIC_RORK_API_BASE_URL=http://${LOCAL_IP:-YOUR_IP}:3000"
echo ""
echo "   3. Then run your Expo app: npm start"
echo ""
echo "🔧 Starting backend server..."
echo "================================"
echo ""

# Set environment variables
export NODE_ENV=development
export PORT=3000
export JWT_SECRET=consciousness-field-secret-key-dev

# Run the backend server
npx tsx backend/server.ts