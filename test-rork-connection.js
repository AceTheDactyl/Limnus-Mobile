#!/usr/bin/env node

/**
 * Test connection to Rork backend
 * This script tests the connection to the Rork backend service
 */

const https = require('https');

console.log('🔍 Testing Rork Backend Connection...\n');

// Test the Rork backend API
function testRorkBackend() {
  const options = {
    hostname: 'rork.com',
    path: '/api/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log('📡 Testing Rork backend at https://rork.com/api/health...');
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`✅ Response Status: ${res.statusCode}`);
      console.log('📦 Response Headers:', res.headers);
      
      try {
        const parsed = JSON.parse(data);
        console.log('✅ Backend Response:', JSON.stringify(parsed, null, 2));
        
        if (parsed.status === 'ok' || parsed.status === 'healthy') {
          console.log('\n🎉 Rork backend is accessible and healthy!');
        } else {
          console.log('\n⚠️ Rork backend responded but may have issues:', parsed.status);
        }
      } catch (error) {
        console.log('📄 Raw Response:', data);
        console.log('\n⚠️ Backend responded but with non-JSON data');
      }
      
      // Test tRPC endpoint
      testTRPCEndpoint();
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Connection Error:', error.message);
    console.log('\n💡 The Rork backend may not be accessible from this environment.');
    console.log('   In the Rork platform, the backend should be available at the same origin.');
  });
  
  req.end();
}

// Test tRPC endpoint
function testTRPCEndpoint() {
  console.log('\n📡 Testing tRPC endpoint at https://rork.com/api/trpc...');
  
  const options = {
    hostname: 'rork.com',
    path: '/api/trpc',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = https.request(options, (res) => {
    console.log(`✅ tRPC Response Status: ${res.statusCode}`);
    
    if (res.statusCode === 404) {
      console.log('⚠️ tRPC endpoint returned 404 - this is expected for GET requests');
      console.log('   tRPC endpoints require POST requests with proper formatting');
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ tRPC endpoint is accessible');
    } else {
      console.log('⚠️ Unexpected status code from tRPC endpoint');
    }
    
    console.log('\n📋 Summary:');
    console.log('===========');
    console.log('The Rork backend should be automatically available when running on rork.com');
    console.log('The app will use window.location.origin to connect to the backend');
    console.log('\nIf you\'re seeing connection issues in the app:');
    console.log('1. Make sure you\'re running the app on rork.com');
    console.log('2. Check the browser console for any CORS or network errors');
    console.log('3. The backend endpoints should be available at:');
    console.log('   - Health: /api/health');
    console.log('   - tRPC: /api/trpc/*');
    console.log('   - WebSocket: /api/ws (if configured)');
  });
  
  req.on('error', (error) => {
    console.error('❌ tRPC Connection Error:', error.message);
  });
  
  req.end();
}

// Run the test
testRorkBackend();