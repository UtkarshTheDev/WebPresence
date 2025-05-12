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
}

/**
 * Start the Web Presence server
 * @param options Optional configuration options
 * @returns A promise that resolves when the server is started
 */
export async function startServer(options?: { port?: number }) {
  // If server is already running, return
  if (isRunning) {
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

    // Try to connect to Discord
    logger.info("🚀 Initializing Discord RPC connection...");
    await discord.connect();

    // Start the server
    const PORT = config.getServer().port;

    return new Promise<{ success: boolean; port: number }>((resolve) => {
      if (!server) {
        resolve({ success: false, port: PORT });
        return;
      }

      server.listen(PORT, () => {
        logger.success(`Server running on http://localhost:${PORT}`);
        logger.success(`WebSocket server running on ws://localhost:${PORT}`);
        isRunning = true;
        resolve({ success: true, port: PORT });
      });
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
  if (!isRunning || !server) {
    logger.info("Server is not running");
    return { success: true };
  }

  try {
    // Close the server
    return new Promise<{ success: boolean }>((resolve) => {
      if (!server) {
        resolve({ success: false });
        return;
      }

      server.close(async () => {
        logger.info("Server stopped");

        // Clear Discord presence
        if (discord.isConnected()) {
          await discord.clearActivity();
        }

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
    return { success: false };
  }
}

/**
 * Check if the server is running
 * @returns True if the server is running, false otherwise
 */
export function isServerRunning() {
  return isRunning;
}

/**
 * Get the current server status
 * @returns An object with server status information
 */
export function getServerStatus() {
  return {
    running: isRunning,
    port: isRunning ? config.getServer().port : null,
    discordConnected: discord.isConnected(),
    presenceEnabled: isRunning ? true : false, // This will be updated with actual state in future
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
