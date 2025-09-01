#!/usr/bin/env node

console.log('🔍 Limnus Backend Diagnostic Tool');
console.log('==================================\n');

const { spawn } = require('child_process');
const path = require('path');

// Check if backend dependencies are installed
console.log('📦 Checking dependencies...');
const requiredPackages = ['tsx', 'hono', '@hono/trpc-server', '@trpc/server'];
const missingPackages = [];

for (const pkg of requiredPackages) {
  try {
    require.resolve(pkg);
    console.log(`✅ ${pkg} is installed`);
  } catch (error) {
    console.log(`❌ ${pkg} is NOT installed`);
    missingPackages.push(pkg);
  }
}

if (missingPackages.length > 0) {
  console.log('\n⚠️ Missing packages detected. Please install them with:');
  console.log(`   npm install ${missingPackages.join(' ')}`);
  console.log('   or');
  console.log(`   bun install ${missingPackages.join(' ')}`);
}

console.log('\n🌐 Network Configuration:');
console.log(`   Platform: ${process.platform}`);
console.log(`   Node Version: ${process.version}`);
console.log(`   Current Directory: ${process.cwd()}`);

// Check if port 3000 is available
const net = require('net');
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

(async () => {
  const isPortAvailable = await checkPort(3000);
  
  if (!isPortAvailable) {
    console.log('\n❌ Port 3000 is already in use!');
    console.log('   Please stop any other services running on port 3000');
    console.log('   You can find the process using:');
    console.log('   - Mac/Linux: lsof -i :3000');
    console.log('   - Windows: netstat -ano | findstr :3000');
    process.exit(1);
  } else {
    console.log('✅ Port 3000 is available');
  }
  
  console.log('\n🚀 Starting Backend Server...');
  console.log('================================\n');
  
  // Set environment variables
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000',
    JWT_SECRET: 'consciousness-field-secret-key-dev',
    // Add CORS settings for local development
    CORS_ORIGIN: '*',
    // Enable verbose logging
    DEBUG: 'true'
  };
  
  const serverPath = path.join(process.cwd(), 'backend', 'server.ts');
  
  // Try to start with tsx first, fallback to ts-node if needed
  let command = 'npx';
  let args = ['tsx', serverPath];
  
  console.log(`📂 Starting server from: ${serverPath}`);
  console.log(`🔧 Command: ${command} ${args.join(' ')}\n`);
  
  const server = spawn(command, args, {
    stdio: 'inherit',
    env,
    shell: true
  });
  
  server.on('error', (error) => {
    console.error('\n❌ Failed to start server:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure you have Node.js 16+ installed');
    console.log('2. Run "npm install" or "bun install" to install dependencies');
    console.log('3. Check if the backend/server.ts file exists');
    console.log('4. Try running directly with: npx tsx backend/server.ts');
    process.exit(1);
  });
  
  server.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Server shut down gracefully');
    } else {
      console.log(`\n⚠️ Server process exited with code ${code}`);
      console.log('\nPossible issues:');
      console.log('- TypeScript compilation errors');
      console.log('- Missing environment variables');
      console.log('- Database connection issues');
      console.log('\nCheck the error messages above for details.');
    }
    process.exit(code);
  });
  
  // Handle graceful shutdown
  const shutdown = () => {
    console.log('\n🔄 Shutting down server...');
    server.kill('SIGTERM');
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  
  // Test the connection after a delay
  setTimeout(async () => {
    console.log('\n🔍 Testing backend connection...');
    try {
      const response = await fetch('http://localhost:3000/api/health');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend is responding!');
        console.log('   Health check:', JSON.stringify(data, null, 2));
      } else {
        console.log('⚠️ Backend returned status:', response.status);
      }
    } catch (error) {
      console.log('❌ Could not connect to backend at http://localhost:3000/api/health');
      console.log('   Error:', error.message);
    }
  }, 3000);
})();