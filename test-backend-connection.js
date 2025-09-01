#!/usr/bin/env node

const http = require('http');
const https = require('https');

console.log('🔍 Limnus Backend Connection Test\n');

// Test configurations
const tests = [
  {
    name: 'Local Backend (localhost)',
    url: 'http://localhost:3000/api/health',
    expected: 'Backend server'
  },
  {
    name: 'Local Backend (127.0.0.1)',
    url: 'http://127.0.0.1:3000/api/health',
    expected: 'Backend server'
  },
  {
    name: 'Rork Expo Backend',
    url: 'https://toolkit.rork.com/text/llm/',
    expected: 'AI API',
    method: 'POST',
    body: JSON.stringify({ messages: [{ role: 'user', content: 'test' }] })
  }
];

// Get local IP
function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const localIP = getLocalIP();
if (localIP) {
  tests.push({
    name: `Local Backend (${localIP})`,
    url: `http://${localIP}:3000/api/health`,
    expected: 'Backend server'
  });
}

// Test function
async function testConnection(test) {
  return new Promise((resolve) => {
    const url = new URL(test.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: test.method || 'GET',
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        ...(test.body && { 'Content-Length': Buffer.byteLength(test.body) })
      }
    };
    
    console.log(`Testing: ${test.name}`);
    console.log(`  URL: ${test.url}`);
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`  ✅ Success (Status: ${res.statusCode})`);
          try {
            const json = JSON.parse(data);
            console.log(`  Response: ${JSON.stringify(json).substring(0, 100)}...`);
          } catch {
            console.log(`  Response: ${data.substring(0, 100)}...`);
          }
        } else {
          console.log(`  ⚠️ HTTP ${res.statusCode}: ${res.statusMessage}`);
        }
        console.log('');
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log(`  ❌ Connection refused - Server not running`);
      } else if (err.code === 'ETIMEDOUT') {
        console.log(`  ❌ Connection timeout - Server not reachable`);
      } else {
        console.log(`  ❌ Error: ${err.message}`);
      }
      console.log('');
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`  ❌ Request timeout after 5 seconds`);
      console.log('');
      req.destroy();
      resolve(false);
    });
    
    if (test.body) {
      req.write(test.body);
    }
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('📊 System Information:');
  console.log(`  Node Version: ${process.version}`);
  console.log(`  Platform: ${process.platform}`);
  console.log(`  Local IP: ${localIP || 'Unable to detect'}`);
  console.log('');
  console.log('🔄 Running connection tests...\n');
  
  let backendRunning = false;
  
  for (const test of tests) {
    const result = await testConnection(test);
    if (result && test.expected === 'Backend server') {
      backendRunning = true;
    }
  }
  
  console.log('📋 Summary:');
  if (backendRunning) {
    console.log('✅ Backend server is running!');
    console.log('');
    console.log('To connect from your mobile app:');
    console.log(`1. Set environment variable: export EXPO_PUBLIC_RORK_API_BASE_URL=http://${localIP}:3000`);
    console.log('2. Restart your Expo app: npm start');
  } else {
    console.log('❌ Backend server is not running.');
    console.log('');
    console.log('To start the backend:');
    console.log('1. Run: npx tsx backend/server.ts');
    console.log('   OR');
    console.log('   Run: ./run-backend.sh (macOS/Linux)');
    console.log('   Run: run-backend.bat (Windows)');
    console.log('');
    console.log('2. Then run this test again to verify connection');
  }
}

// Run the tests
runTests().catch(console.error);