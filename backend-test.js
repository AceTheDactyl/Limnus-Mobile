#!/usr/bin/env node

console.log('🔍 Limnus Backend Connection Test');
console.log('==================================\n');

const http = require('http');
const https = require('https');

// Test configuration
const tests = [
  { name: 'Local Backend', url: 'http://localhost:3000/api/health', timeout: 5000 },
  { name: 'Local tRPC', url: 'http://localhost:3000/api/trpc', timeout: 5000 },
  { name: 'Android Emulator', url: 'http://10.0.2.2:3000/api/health', timeout: 5000 },
];

// Function to test a URL
function testUrl(url, timeout = 5000) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const timeoutId = setTimeout(() => {
      resolve({ success: false, error: 'Timeout', time: timeout });
    }, timeout);
    
    const startTime = Date.now();
    
    protocol.get(url, (res) => {
      clearTimeout(timeoutId);
      const time = Date.now() - startTime;
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ 
          success: res.statusCode === 200, 
          statusCode: res.statusCode,
          time,
          data: data.substring(0, 100) // First 100 chars
        });
      });
    }).on('error', (err) => {
      clearTimeout(timeoutId);
      const time = Date.now() - startTime;
      resolve({ success: false, error: err.message, time });
    });
  });
}

// Run tests
async function runTests() {
  console.log('📊 Testing backend connectivity...\n');
  
  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    const result = await testUrl(test.url, test.timeout);
    
    if (result.success) {
      console.log(`✅ SUCCESS (${result.time}ms)`);
      if (result.data) {
        console.log(`   Response: ${result.data}...`);
      }
    } else {
      console.log(`❌ FAILED`);
      console.log(`   Error: ${result.error || `Status ${result.statusCode}`}`);
    }
    console.log();
  }
  
  // Check if backend process is running
  console.log('\n📊 Checking for backend process...');
  const { exec } = require('child_process');
  
  exec('ps aux | grep -E "tsx.*server\\.ts|node.*server" | grep -v grep', (error, stdout) => {
    if (stdout.trim()) {
      console.log('✅ Backend process found:');
      console.log(stdout.trim());
    } else {
      console.log('❌ No backend process found');
      console.log('\n💡 To start the backend, run:');
      console.log('   node start-backend.js');
      console.log('   OR');
      console.log('   npx tsx backend/server.ts');
    }
    
    console.log('\n==================================');
    console.log('Test complete!');
  });
}

// Run the tests
runTests().catch(console.error);