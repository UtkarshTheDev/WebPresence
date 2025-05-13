#!/usr/bin/env node

/**
 * WebPresence Daemon
 *
 * This is a standalone script that runs the WebPresence server as a daemon.
 */

import {
  startServer,
  stopServer,
  isServerRunning,
  config,
  checkPortInUse,
} from "./index.js";
import { logger } from "./utils/logger.js";

// Set up error handlers
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, {
    error: error.stack,
  });
  // Keep the process running despite the error
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Promise Rejection at: ${promise}\nReason: ${reason}`);
  // Keep the process running despite the rejection
});

// Handle termination signals for graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Received SIGINT signal, shutting down gracefully...");
  await stopServer();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM signal, shutting down gracefully...");
  await stopServer();
  process.exit(0);
});

// Start the server only if it's not already running
async function main() {
  logger.info("Starting WebPresence server in daemon mode");

  // Do a thorough check if server is already running
  // Check both the port and the internal state
  const PORT = config.getServer().port;
  const portInUse = await checkPortInUse(PORT);
  const serverRunning = isServerRunning({ checkPort: true });

  if (portInUse || serverRunning) {
    logger.warn(
      "Server is already running or port is in use, not starting again"
    );
    logger.info("Daemon will monitor the existing server");
    return;
  }

  try {
    // Start the server with a flag to prevent auto-initialization
    const result = await startServer();

    if (!result.success) {
      logger.error(`Failed to start server: ${JSON.stringify(result)}`);
      process.exit(1);
    }

    logger.info(
      `Server started successfully in daemon mode on port ${result.port}`
    );
  } catch (error: any) {
    logger.error("Failed to start server:", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
}

// Run the main function
main();
