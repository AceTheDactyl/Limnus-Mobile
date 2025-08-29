#!/usr/bin/env node
/* eslint-env node */

// Simple Node.js script to start the backend server
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting LIMNUS Consciousness Backend Server...');

// Get current directory
const serverPath = path.join(process.cwd(), 'backend', 'server.ts');
const server = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000',
    JWT_SECRET: 'consciousness-field-secret-key'
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`🔄 Server process exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Shutting down server...');
  server.kill('SIGTERM');
});