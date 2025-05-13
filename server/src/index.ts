import express from "express";
import http from "http";
import cors from "cors";
import { execSync } from "child_process";
import net from "net";
import { discord } from "./services/discord.js";
import { initWebSocketServer, getPresenceState } from "./services/websocket.js";
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
 * Check if a port is in use
 * @param port The port to check
 * @returns A promise that resolves to true if the port is in use, false otherwise
 */
async function checkPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let timeoutId: NodeJS.Timeout;

    // Set up a timeout to handle connection failures
    timeoutId = setTimeout(() => {
      socket.destroy();
      resolve(false);
    }, 500);

    // Try to connect to the port
    socket.once("connect", () => {
      clearTimeout(timeoutId);
      socket.destroy();
      resolve(true);
    });

    socket.once("error", (err) => {
      clearTimeout(timeoutId);
      if ((err as any).code === "ECONNREFUSED") {
        // Port is not in use
        resolve(false);
      } else {
        // Other error, assume port is in use to be safe
        resolve(true);
      }
    });

    socket.connect(port, "127.0.0.1");
  });
}

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

  // Override port if provided
  if (options?.port) {
    config.getServer().port = options.port;
  }

  // Check if port is already in use before attempting to start
  const PORT = config.getServer().port;
  const portInUse = await checkPortInUse(PORT);

  if (portInUse) {
    logger.error(`Port ${PORT} is already in use. Cannot start server.`);
    return { success: false, port: PORT, error: "PORT_IN_USE" };
  }

  // Setup error handlers
  setupErrorHandlers();

  try {
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
    const serverPort = config.getServer().port;

    // Try using a simple socket check
    try {
      // Use a synchronous approach with TCP socket
      const net = require("net");
      const socket = new net.Socket();
      let isConnected = false;

      // Try to connect to the port
      socket.connect(serverPort, "127.0.0.1");

      // Set a timeout for the connection attempt
      socket.setTimeout(500);

      // If we can connect, the port is in use
      socket.on("connect", () => {
        isConnected = true;
        socket.destroy();
      });

      // Wait a moment for the connection attempt
      try {
        execSync("sleep 0.2", { stdio: "ignore" });
      } catch (e) {
        // Ignore sleep errors on Windows
        // On Windows, use a different approach
        if (process.platform === "win32") {
          try {
            execSync(`ping -n 1 -w 200 127.0.0.1 >nul`, { stdio: "ignore" });
          } catch (pingError) {
            // Ignore ping errors
          }
        }
      }

      if (isConnected) {
        return true;
      }
    } catch (socketError) {
      // Ignore socket errors
    }

    // Try using netstat as a fallback, but suppress errors
    try {
      const netstatCommand =
        process.platform === "win32"
          ? `netstat -ano | findstr :${serverPort}`
          : `netstat -tuln | grep :${serverPort}`;

      // Use the imported execSync instead of dynamic require
      const output = execSync(netstatCommand, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"], // Suppress stderr to avoid showing command not found errors
      });

      if (output && output.trim().length > 0) {
        // Port is in use, which suggests the server is running
        return true;
      }
    } catch (netstatError) {
      // If netstat fails, try using lsof on Unix-like systems
      if (process.platform !== "win32") {
        try {
          const lsofOutput = execSync(`lsof -i :${serverPort} -t`, {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"], // Suppress stderr
          });

          if (lsofOutput && lsofOutput.trim()) {
            return true;
          }
        } catch (lsofError) {
          // Ignore lsof errors
        }
      }

      // If all command-line checks fail, continue with other checks
    }
  }

  // Check if the API is responding (if requested)
  if (opts.checkApi) {
    try {
      const serverPort = config.getServer().port;

      // Use a more reliable method to check if the API is responding
      try {
        // Try a simple HTTP request to check if the server is responding
        const testCommand =
          process.platform === "win32"
            ? `curl -s -o nul -w "%{http_code}" http://localhost:${serverPort}/api/status`
            : `curl -s -o /dev/null -w "%{http_code}" http://localhost:${serverPort}/api/status`;

        const statusCode = execSync(testCommand, { encoding: "utf8" });

        // If we get a 2xx or 3xx status code, the server is running
        if (
          parseInt(statusCode.trim()) >= 200 &&
          parseInt(statusCode.trim()) < 400
        ) {
          return true;
        }
      } catch (curlError) {
        // If curl fails, the server is probably not running
        return false;
      }
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
      // Import the daemon utilities
      const { isDaemonRunning } = require("./utils/daemon.js");
      daemonRunning = isDaemonRunning();
    } catch (e) {
      // Error importing daemon utilities
      logger.warn(`Error checking daemon status: ${e}`);

      // Fallback method if the import fails
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
      } catch (fallbackError) {
        // Error in fallback method
        logger.warn(`Error in fallback daemon check: ${fallbackError}`);
      }
    }
  }

  // Check if the port is in use (additional check)
  let portInUse = false;
  try {
    const serverPort = config.getServer().port;

    // Try using a simple socket check first
    try {
      // Use a synchronous approach with TCP socket
      const net = require("net");
      const socket = new net.Socket();
      let isConnected = false;

      // Try to connect to the port
      socket.connect(serverPort, "127.0.0.1");

      // Set a timeout for the connection attempt
      socket.setTimeout(500);

      // If we can connect, the port is in use
      socket.on("connect", () => {
        isConnected = true;
        socket.destroy();
      });

      // Wait a moment for the connection attempt
      try {
        execSync("sleep 0.2", { stdio: "ignore" });
      } catch (e) {
        // Ignore sleep errors on Windows
        // On Windows, use a different approach
        if (process.platform === "win32") {
          try {
            execSync(`ping -n 1 -w 200 127.0.0.1 >nul`, { stdio: "ignore" });
          } catch (pingError) {
            // Ignore ping errors
          }
        }
      }

      if (isConnected) {
        portInUse = true;
      }
    } catch (socketError) {
      // Ignore socket errors
    }

    // If socket check failed, try netstat as a fallback
    if (!portInUse) {
      try {
        const netstatCommand =
          process.platform === "win32"
            ? `netstat -ano | findstr :${serverPort}`
            : `netstat -tuln | grep :${serverPort}`;

        // Use the imported execSync instead of dynamic require
        const output = execSync(netstatCommand, {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"], // Suppress stderr to avoid showing command not found errors
        });

        if (output && output.trim().length > 0) {
          // Port is in use, which suggests the server is running
          portInUse = true;
        }
      } catch (netstatError) {
        // If netstat fails, try using lsof on Unix-like systems
        if (process.platform !== "win32") {
          try {
            const lsofOutput = execSync(`lsof -i :${serverPort} -t`, {
              encoding: "utf8",
              stdio: ["ignore", "pipe", "ignore"], // Suppress stderr
            });

            if (lsofOutput && lsofOutput.trim()) {
              portInUse = true;
            }
          } catch (lsofError) {
            // Ignore lsof errors
          }
        }
      }
    }
  } catch (e) {
    // If all checks fail, continue with other checks
  }

  // Determine if the server is running based on all checks
  const running = isRunning || serverRunning || portInUse;

  // If the daemon is running but the server appears to not be running,
  // this indicates a potential issue that should be fixed
  if (daemonRunning && !running) {
    logger.warn(
      "Daemon is running but server appears to be down. This may indicate an issue."
    );
  }

  // Get the actual presence state from the WebSocket service if the server is running
  let presenceState = {
    enabled: false,
    connected: false,
    preferences: config.getUserPreferences(),
  };

  if (running) {
    try {
      presenceState = getPresenceState();
    } catch (error) {
      logger.warn("Error getting presence state from WebSocket service:", {
        error,
      });
      // Fall back to default values if there's an error
    }
  }

  return {
    running: running || daemonRunning, // Consider the server running if either the server or daemon is running
    port: running || daemonRunning ? config.getServer().port : null,
    discordConnected: presenceState.connected || discord.isConnected(),
    presenceEnabled: running || daemonRunning ? presenceState.enabled : false,
    daemonRunning: daemonRunning,
    preferences: presenceState.preferences,
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

// Only auto-start if not in daemon mode to prevent duplicate starts
if (
  import.meta.url === `file://${process.argv[1]}` &&
  process.env.WEBPRESENCE_DAEMON_CHILD !== "true" &&
  process.env.WEBPRESENCE_DAEMON !== "true"
) {
  startServer().catch((error) => {
    logger.error("Failed to start server:", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });
}

// Export the config and utility functions for external use
export { config, checkPortInUse };
