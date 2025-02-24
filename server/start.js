const { spawn } = require('child_process');
const path = require('path');

// Get the environment from command line argument or default to development
const env = process.argv[2] || 'development';

// Set environment variable
process.env.NODE_ENV = env;

console.log(`Starting server in ${env} mode...`);

// Start the server
const server = spawn('node', ['server.js'], {
    env: { ...process.env },
    stdio: 'inherit'
});

server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
}); 