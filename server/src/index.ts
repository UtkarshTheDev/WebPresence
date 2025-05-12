import express from "express";
import http from "http";
import cors from "cors";
import { discord } from "./services/discord.js";
import { initWebSocketServer } from "./services/websocket.js";
import { config } from "./config/index.js";
import { initRoutes } from "./routes/index.js";
import { logger } from "./utils/logger.js";

/**
 * Web Presence Server
 *
 * This server provides Discord Rich Presence for websites
 * by connecting to a browser extension via WebSocket.
 */

// Server instance and state
let server: http.Server | null = null;
let wss: any = null;
let isRunning = false;

/**
 * Initialize global error handlers to prevent crashes
 */
function setupErrorHandlers() {
  process.on("uncaughtException", (error) => {
    logger.error(`Uncaught Exception: ${error.message}`, {
      error: error.stack,
    });
    // Keep the process running despite the error
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error(
      `Unhandled Promise Rejection at: ${promise}\nReason: ${reason}`
    );
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
}

/**
 * Start the Web Presence server
 * @param options Optional configuration options
 * @returns A promise that resolves when the server is started
 */
export async function startServer(options?: {
  port?: number;
  skipDiscord?: boolean;
}) {
  // If server is already running, return
  if (isRunning || server !== null) {
    logger.info("Server is already running");
    return { success: true, port: config.getServer().port };
  }

  // Setup error handlers
  setupErrorHandlers();

  try {
    // Override port if provided
    if (options?.port) {
      config.getServer().port = options.port;
    }

    // Initialize Express app
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Create HTTP server
    server = http.createServer(app);

    // Initialize WebSocket server
    wss = initWebSocketServer(server);

    // Initialize API routes
    app.use("/api", initRoutes(wss));

    // Try to connect to Discord (unless skipDiscord is true)
    if (!options?.skipDiscord) {
      logger.info("🚀 Initializing Discord RPC connection...");
      await discord.connect();
    }

    // Start the server
    const PORT = config.getServer().port;

    return new Promise<{ success: boolean; port: number }>((resolve) => {
      if (!server) {
        resolve({ success: false, port: PORT });
        return;
      }

      // Add error handler for the server
      server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          logger.error(
            `Port ${PORT} is already in use. Server may already be running.`
          );
          isRunning = true; // Mark as running since something is using the port
          resolve({ success: false, port: PORT });
        } else {
          logger.error(`Server error: ${err.message}`, { error: err.stack });
          resolve({ success: false, port: PORT });
        }
      });

      try {
        server.listen(PORT, () => {
          logger.success(`Server running on http://localhost:${PORT}`);
          logger.success(`WebSocket server running on ws://localhost:${PORT}`);
          isRunning = true;
          resolve({ success: true, port: PORT });
        });
      } catch (listenError: any) {
        logger.error(`Failed to start server: ${listenError.message}`, {
          error: listenError.stack,
        });
        resolve({ success: false, port: PORT });
      }
    });
  } catch (error: any) {
    logger.error("Failed to start server:", {
      error: error.message,
      stack: error.stack,
    });
    return { success: false, port: config.getServer().port };
  }
}

/**
 * Stop the Web Presence server
 * @returns A promise that resolves when the server is stopped
 */
export async function stopServer() {
  if (!isRunning && !server) {
    logger.info("Server is not running");
    return { success: true };
  }

  try {
    // Close the server
    return new Promise<{ success: boolean }>((resolve) => {
      if (!server) {
        // Reset state even if server is null
        isRunning = false;
        wss = null;
        resolve({ success: true });
        return;
      }

      // Set a timeout in case server.close hangs
      const timeout = setTimeout(() => {
        logger.warn("Server close operation timed out, forcing cleanup");
        isRunning = false;
        server = null;
        wss = null;
        resolve({ success: true });
      }, 5000);

      // Try to close the server gracefully
      server.close(async () => {
        clearTimeout(timeout);
        logger.info("Server stopped");

        // Clear Discord presence
        try {
          if (discord.isConnected()) {
            await discord.clearActivity();
          }
        } catch (discordError: any) {
          logger.warn(
            `Error clearing Discord activity: ${discordError.message}`
          );
        }

        // Reset state
        isRunning = false;
        server = null;
        wss = null;

        resolve({ success: true });
      });
    });
  } catch (error: any) {
    logger.error("Failed to stop server:", {
      error: error.message,
      stack: error.stack,
    });

    // Force reset state even on error
    isRunning = false;
    server = null;
    wss = null;

    return { success: false };
  }
}

/**
 * Check if the server is running
 * @param options Optional configuration options
 * @returns True if the server is running, false otherwise
 */
export function isServerRunning(options?: {
  checkPort?: boolean;
  checkApi?: boolean;
}) {
  // Default options
  const opts = {
    checkPort: true,
    checkApi: false,
    ...options,
  };

  // If the server is running in the current process, return true
  if (isRunning) {
    return true;
  }

  // If we're not checking additional methods, return false
  if (!opts.checkPort && !opts.checkApi) {
    return false;
  }

  // Check if the port is in use (if requested)
  if (opts.checkPort) {
    try {
      const serverPort = config.getServer().port;
      const netstatCommand =
        process.platform === "win32"
          ? `netstat -ano | findstr :${serverPort}`
          : `netstat -tuln | grep :${serverPort}`;

      const output = require("child_process").execSync(netstatCommand, {
        encoding: "utf8",
      });

      if (output.trim().length > 0) {
        // Port is in use, which suggests the server is running
        return true;
      }
    } catch (e) {
      // If netstat fails, continue with other checks
    }
  }

  // Check if the API is responding (if requested)
  if (opts.checkApi) {
    try {
      const serverPort = config.getServer().port;
      const http = require("http");

      // Try to connect to the server (synchronous check)
      const req = http.get(`http://localhost:${serverPort}/api/status`, {
        timeout: 500, // Short timeout to avoid hanging
      });

      // If we get here without an error, the server is likely running
      req.on("response", () => {
        req.destroy(); // Clean up the request
        return true;
      });

      req.on("error", () => {
        // Error connecting, server might not be running
        return false;
      });

      // Wait a short time for the request to complete
      require("child_process").execSync("sleep 0.5", { stdio: "ignore" });
    } catch (e) {
      // If the request fails, continue with other checks
    }
  }

  // If we get here, all checks have failed
  return false;
}

/**
 * Get the current server status
 * @param options Optional configuration options
 * @returns An object with server status information
 */
export function getServerStatus(options?: {
  checkPort?: boolean;
  checkApi?: boolean;
  checkDaemon?: boolean;
}) {
  // Default options
  const opts = {
    checkPort: true,
    checkApi: false,
    checkDaemon: false,
    ...options,
  };

  // Check if the server is running using our improved function
  const serverRunning = isServerRunning({
    checkPort: opts.checkPort,
    checkApi: opts.checkApi,
  });

  // Check if the daemon is running (if requested)
  let daemonRunning = false;
  if (opts.checkDaemon) {
    try {
      const fs = require("fs");
      const os = require("os");
      const path = require("path");

      // Check if the PID file exists
      const pidFile = path.join(
        os.homedir(),
        ".webpresence",
        "webpresence.pid"
      );
      if (fs.existsSync(pidFile)) {
        const pid = parseInt(fs.readFileSync(pidFile, "utf8").trim(), 10);

        // Check if the process is running
        try {
          process.kill(pid, 0);
          daemonRunning = true;
        } catch (e) {
          // Process is not running
        }
      }
    } catch (e) {
      // Error checking daemon status
    }
  }

  // Check if the port is in use (additional check)
  let portInUse = false;
  try {
    const serverPort = config.getServer().port;
    const netstatCommand =
      process.platform === "win32"
        ? `netstat -ano | findstr :${serverPort}`
        : `netstat -tuln | grep :${serverPort}`;

    const output = require("child_process").execSync(netstatCommand, {
      encoding: "utf8",
    });

    if (output.trim().length > 0) {
      // Port is in use, which suggests the server is running
      portInUse = true;
    }
  } catch (e) {
    // If netstat fails, continue with other checks
  }

  // Determine if the server is running based on all checks
  const running = isRunning || serverRunning || daemonRunning || portInUse;

  return {
    running,
    port: running ? config.getServer().port : null,
    discordConnected: discord.isConnected(),
    presenceEnabled: running ? true : false, // This will be updated with actual state in future
    daemonRunning: daemonRunning,
  };
}

/**
 * Toggle Discord presence
 * @param enabled Whether to enable or disable presence
 * @returns A promise that resolves with the new presence state
 */
export async function togglePresence(enabled?: boolean) {
  if (!isRunning) {
    logger.warn("Server is not running, cannot toggle presence");
    return { success: false, enabled: false };
  }

  try {
    // Make API request to toggle presence
    const response = await fetch(
      `http://localhost:${config.getServer().port}/api/toggle`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      }
    );

    const data = await response.json();
    return { success: true, enabled: data.enabled };
  } catch (error: any) {
    logger.error("Failed to toggle presence:", {
      error: error.message,
      stack: error.stack,
    });
    return { success: false, enabled: false };
  }
}

/**
 * Update user preferences
 * @param preferences User preferences to update
 * @returns A promise that resolves with the updated preferences
 */
export async function updatePreferences(preferences: any) {
  if (!isRunning) {
    logger.warn("Server is not running, cannot update preferences");
    return { success: false, preferences: null };
  }

  try {
    // Make API request to update preferences
    const response = await fetch(
      `http://localhost:${config.getServer().port}/api/preferences`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences }),
      }
    );

    const data = await response.json();
    return { success: true, preferences: data.preferences };
  } catch (error: any) {
    logger.error("Failed to update preferences:", {
      error: error.message,
      stack: error.stack,
    });
    return { success: false, preferences: null };
  }
}

// If this file is executed directly, start the server
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((error) => {
    logger.error("Failed to start server:", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
}

// Export the config for external use
export { config };
