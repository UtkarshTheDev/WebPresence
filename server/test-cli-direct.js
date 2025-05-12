#!/usr/bin/env node

/**
 * Test script for CLI
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, 'dist/cli.js');

// Get command line arguments
const args = process.argv.slice(2);

// Spawn the CLI process
const child = spawn('node', [cliPath, ...args], {
  stdio: 'inherit'
});

// Handle process exit
child.on('exit', (code) => {
  process.exit(code);
});
