#!/usr/bin/env node

/**
 * Test script for daemon mode
 */

import {
  startDaemon,
  stopDaemon,
  isDaemonRunning,
  getDaemonPid,
  getDaemonLogPath,
} from "./dist/utils/daemon.js";

// Simple CLI for testing daemon mode
const command = process.argv[2] || "help";

async function main() {
  switch (command) {
    case "start":
      if (isDaemonRunning()) {
        console.log("Daemon is already running");
        return;
      }

      console.log("Starting daemon...");
      const result = await startDaemon();

      if (result.success) {
        console.log(`Daemon started with PID ${result.pid}`);
        console.log(`Log file: ${getDaemonLogPath()}`);
      } else {
        console.error(`Failed to start daemon: ${result.message}`);
      }
      break;

    case "stop":
      if (!isDaemonRunning()) {
        console.log("Daemon is not running");
        return;
      }

      console.log("Stopping daemon...");
      const stopResult = await stopDaemon();

      if (stopResult.success) {
        console.log("Daemon stopped");
      } else {
        console.error(`Failed to stop daemon: ${stopResult.message}`);
      }
      break;

    case "status":
      if (isDaemonRunning()) {
        const pid = getDaemonPid();
        console.log(`Daemon is running with PID ${pid}`);
        console.log(`Log file: ${getDaemonLogPath()}`);
      } else {
        console.log("Daemon is not running");
      }
      break;

    default:
      console.log("Usage: node test-daemon.js [start|stop|status]");
      break;
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
