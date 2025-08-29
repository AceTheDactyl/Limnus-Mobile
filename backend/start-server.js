#!/usr/bin/env node

// Simple script to start the backend server
// Run with: node backend/start-server.js

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting LIMNUS Consciousness Backend Server...');

const serverPath = path.join(__dirname, 'server.ts');
const child = spawn('bun', ['run', serverPath], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('error', (error) => {
  console.error('❌ Failed to start backend server:', error);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`🔄 Backend server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🔄 Shutting down backend server...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🔄 Shutting down backend server...');
  child.kill('SIGTERM');
});