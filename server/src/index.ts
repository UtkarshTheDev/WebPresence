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

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`, { error: error.stack });
  // Keep the process running despite the error
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Promise Rejection at: ${promise}\nReason: ${reason}`);
  // Keep the process running despite the rejection
});

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = initWebSocketServer(server);

// Initialize API routes
app.use("/api", initRoutes(wss));

// Try to connect to Discord on startup
console.log("🚀 Initializing Discord RPC connection...");
discord.connect();

// Start the server
const PORT = config.getServer().port;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
