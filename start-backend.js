#!/usr/bin/env node

console.log('🚀 Starting Limnus Backend Server...');
console.log('📊 Checking system requirements...');

// Check if we have the required dependencies
try {
  require('tsx');
  console.log('✅ TypeScript execution environment ready');
} catch (_error) {
  console.error('❌ tsx not found. Installing...');
  require('child_process').execSync('npm install -g tsx', { stdio: 'inherit' });
}

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables for development
const env = {
  ...process.env,
  NODE_ENV: 'development',
  PORT: '3000',
  JWT_SECRET: 'consciousness-field-secret-key-dev',
  // Add any other default environment variables here
};

console.log('🔧 Environment Configuration:');
console.log(`   NODE_ENV: ${env.NODE_ENV}`);
console.log(`   PORT: ${env.PORT}`);
console.log(`   JWT_SECRET: ${env.JWT_SECRET ? '[SET]' : '[NOT SET]'}`);
console.log(`   DATABASE_URL: ${env.DATABASE_URL ? '[SET]' : '[FALLBACK TO IN-MEMORY]'}`);
console.log(`   REDIS_URL: ${env.REDIS_URL ? '[SET]' : '[FALLBACK TO IN-MEMORY]'}`);

const serverPath = path.join(process.cwd(), 'backend', 'server.ts');
console.log(`📂 Server path: ${serverPath}`);

console.log('🔄 Starting server process...');

const server = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure you have Node.js installed');
  console.log('2. Run "npm install" or "bun install" to install dependencies');
  console.log('3. Check if port 3000 is available');
  process.exit(1);
});

server.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Server shut down gracefully');
  } else {
    console.log(`🔄 Server process exited with code ${code}`);
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

// Keep the process alive
process.on('exit', () => {
  console.log('👋 Limnus Backend Server stopped');
});