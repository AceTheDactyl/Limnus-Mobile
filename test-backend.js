#!/usr/bin/env node

console.log('🔍 Testing Backend Connection...\n');

const os = require('os');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();
const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || `http://localhost:3000`;

console.log('📱 Connection Details:');
console.log(`   Base URL: ${baseUrl}`);
console.log(`   Local IP: ${localIP}`);
console.log(`   For mobile: export EXPO_PUBLIC_RORK_API_BASE_URL=http://${localIP}:3000\n`);

// Test endpoints
const endpoints = [
  { path: '/api/health', name: 'Health Check' },
  { path: '/api/trpc', name: 'tRPC Endpoint' },
  { path: '/api/consciousness/state', name: 'Consciousness State' }
];

async function testEndpoint(url, name) {
  try {
    console.log(`Testing ${name}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${name}: Connected (Status: ${response.status})`);
      if (data.status) console.log(`   Status: ${data.status}`);
      if (data.message) console.log(`   Message: ${data.message}`);
      return true;
    } else {
      console.log(`⚠️ ${name}: Response ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`❌ ${name}: Timeout (5s)`);
    } else {
      console.log(`❌ ${name}: ${error.message}`);
    }
    return false;
  }
}

async function testChatAPI() {
  console.log('\n📨 Testing Chat API...');
  try {
    const response = await fetch(`${baseUrl}/api/trpc/chat.sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: {
          conversationId: 'test',
          message: 'Hello, can you hear me?'
        }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Chat API: Connected');
      if (data.result?.data?.json?.message?.content) {
        console.log('   Response:', data.result.data.json.message.content.substring(0, 100) + '...');
      }
      return true;
    } else {
      console.log(`⚠️ Chat API: Response ${response.status}`);
      const text = await response.text();
      console.log('   Error:', text.substring(0, 200));
      return false;
    }
  } catch (error) {
    console.log(`❌ Chat API: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🔄 Starting connection tests...\n');
  
  let allPassed = true;
  
  // Test each endpoint
  for (const endpoint of endpoints) {
    const passed = await testEndpoint(baseUrl + endpoint.path, endpoint.name);
    if (!passed) allPassed = false;
  }
  
  // Test chat API
  const chatPassed = await testChatAPI();
  if (!chatPassed) allPassed = false;
  
  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('✅ All tests passed! Backend is running correctly.');
    console.log('\n💡 If you still see "Connection lost" in the app:');
    console.log('   1. Make sure you\'re using the correct URL in the app');
    console.log('   2. For mobile: Set EXPO_PUBLIC_RORK_API_BASE_URL');
    console.log('   3. Restart the Expo app after setting the environment variable');
  } else {
    console.log('❌ Some tests failed. Backend may not be running properly.');
    console.log('\n🔧 To fix:');
    console.log('   1. Make sure backend is running: node start-backend.js');
    console.log('   2. Check if port 3000 is available');
    console.log('   3. Check for any error messages in the backend console');
    console.log('\n📝 Quick start:');
    console.log('   Terminal 1: node start-backend.js');
    console.log(`   Terminal 2: export EXPO_PUBLIC_RORK_API_BASE_URL=http://${localIP}:3000`);
    console.log('   Terminal 2: npm start');
  }
}

// Check if backend process is running
const { exec } = require('child_process');

exec('lsof -i :3000 || netstat -an | grep :3000', (error, stdout) => {
  if (stdout && stdout.includes('3000')) {
    console.log('✅ Port 3000 is in use (backend likely running)\n');
  } else {
    console.log('⚠️ Port 3000 appears to be free (backend may not be running)\n');
  }
  
  runTests();
});