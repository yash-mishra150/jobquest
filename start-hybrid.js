// We're not using microservices anymore, but keeping this file for compatibility
const path = require('path');
const { exec } = require('child_process');

console.log('Starting JobQuest in standard mode...');

// Start the application with standard main.js (no microservices)
const command = 'node dist/main.js';
console.log(`Executing command: ${command}`);
const child = exec(command);

child.stdout.on('data', (data) => {
  console.log(data.toString().trim());
});

child.stderr.on('data', (data) => {
  console.error(data.toString().trim());
});

child.on('error', (error) => {
  console.error(`Failed to start process: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code) => {
  console.log(`Process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  child.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  child.kill('SIGTERM');
});