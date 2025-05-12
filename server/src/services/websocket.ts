import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { config } from "../config/index.js";
import { discord } from "./discord.js";
import { logger } from "../utils/logger.js";

// Client activity tracking
const clientActivity = new Map<WebSocket, number>();
let presenceEnabled = true;

/**
 * Initialize WebSocket server
 *
 * This function sets up the WebSocket server for communication with browser extensions.
 * It includes robust error handling and automatic recovery mechanisms.
 */
export function initWebSocketServer(server: Server) {
  // Create WebSocket server with error handling
  const wss = new WebSocketServer({
    server,
    // Add error handling for the server itself
    clientTracking: true,
    perMessageDeflate: true,
  });

  // Handle server-level errors
  wss.on("error", (error) => {
    logger.error("WebSocket server error:", {
      error: error.message,
      stack: error.stack,
    });
    // The server will continue running despite errors
  });

  // Set up periodic check for inactive clients
  const serverConfig = config.getServer();
  const checkInterval = setInterval(() => {
    try {
      checkInactiveClients(wss);
    } catch (error) {
      logger.error("Error checking inactive clients:", { error });
      // Continue running despite errors
    }
  }, serverConfig.inactiveCheckInterval);

  // Ensure the interval is cleared if the server closes
  wss.on("close", () => {
    logger.info("WebSocket server closing, clearing check interval");
    clearInterval(checkInterval);
  });

  // WebSocket connection handling
  wss.on("connection", (ws, req) => {
    const clientIp = req.socket.remoteAddress || "unknown";
    logger.info(`Browser extension connected from ${clientIp}`);

    // Initialize client activity tracking
    clientActivity.set(ws, Date.now());

    // Handle WebSocket errors
    ws.on("error", (error) => {
      logger.error("WebSocket client error:", {
        error: error.message,
        clientIp,
      });
      // The connection will be handled by the close event
    });

    // Handle incoming messages
    ws.on("message", async (message) => {
      try {
        // Parse message with error handling
        let data;
        try {
          data = JSON.parse(message.toString());
        } catch (parseError) {
          logger.error("Failed to parse WebSocket message:", {
            error: parseError.message,
            message:
              message.toString().substring(0, 100) +
              (message.toString().length > 100 ? "..." : ""),
          });
          return; // Skip processing this message
        }

        // Update client activity timestamp for any message
        clientActivity.set(ws, Date.now());

        // Process message based on type
        switch (data.type) {
          case "presence": {
            const { title, url } = data;
            if (!title || !url) {
              logger.warn("Received presence update with missing data", {
                data,
              });
              return;
            }

            // Extract domain from URL with error handling
            let domain = "";
            try {
              domain = new URL(url).hostname;
            } catch (e) {
              domain = url;
              logger.warn(`Failed to parse URL: ${url}`, { error: e });
            }

            // Check if domain is in disabled sites list
            const userPrefs = config.getUserPreferences();
            const isDisabled = userPrefs.disabledSites.some((site) =>
              domain.includes(site)
            );

            // Check if domain is in always enabled sites list
            const isAlwaysEnabled = userPrefs.alwaysEnabledSites.some((site) =>
              domain.includes(site)
            );

            // Skip if disabled and not always enabled
            if (isDisabled && !isAlwaysEnabled) {
              logger.info(`Skipping presence for disabled site: ${domain}`);
              return;
            }

            // Skip if presence is disabled and site is not always enabled
            if (!presenceEnabled && !isAlwaysEnabled) {
              return;
            }

            // Only log in verbose mode or when running as non-CLI
            if (logger.isVerbose()) {
              logger.info(`Tab updated: ${title} - ${domain}`);
            }

            if (discord.isConnected()) {
              // If this is an always-enabled site and presence is globally disabled,
              // reset the timestamp to start fresh
              const resetTimerForAlwaysEnabled =
                !presenceEnabled && isAlwaysEnabled;

              if (resetTimerForAlwaysEnabled) {
                logger.info(
                  "Resetting timer for always-enabled site with presence disabled"
                );
                discord.resetTimestamp();
              }

              // Set activity with error handling
              try {
                const result = await discord.setActivity(title, url);
                if (!result) {
                  logger.warn(`Failed to set activity for ${domain}`);
                }
              } catch (error) {
                logger.error("Error setting Discord activity:", {
                  error,
                  title,
                  domain,
                });
                // Continue despite errors
              }
            } else {
              logger.info("Discord not connected, skipping presence update");
            }
            break;
          }

          case "toggle": {
            presenceEnabled = data.enabled;
            logger.info(`Presence ${presenceEnabled ? "enabled" : "disabled"}`);

            // Clear presence when disabled
            if (!presenceEnabled && discord.isConnected()) {
              try {
                const result = await discord.clearActivity();
                if (result) {
                  logger.info(
                    "Cleared Discord presence due to presence being disabled"
                  );
                } else {
                  logger.warn("Failed to clear Discord presence");
                }
              } catch (error) {
                logger.error("Error clearing Discord activity:", { error });
                // Continue despite errors
              }
            }

            // The client will send a new presence update for the current tab
            // which will check if the site is always enabled
            break;
          }

          case "updatePreferences": {
            // Handle preference updates
            if (data.preferences) {
              try {
                // Check if continuousTimer preference is being changed
                const oldPrefs = config.getUserPreferences();
                const continuousTimerChanged =
                  "continuousTimer" in data.preferences &&
                  oldPrefs.continuousTimer !== data.preferences.continuousTimer;

                // Update preferences
                const updatedPrefs = config.updateUserPreferences(
                  data.preferences
                );
                logger.info("Updated user preferences:", updatedPrefs);

                // If continuousTimer was disabled, reset the timestamp
                if (continuousTimerChanged && !updatedPrefs.continuousTimer) {
                  logger.info("Continuous timer disabled, resetting timestamp");
                  discord.resetTimestamp();
                }

                // Broadcast updated preferences to all clients
                broadcastState(wss);
              } catch (error) {
                logger.error("Error updating preferences:", {
                  error,
                  preferences: data.preferences,
                });
                // Continue despite errors
              }
            }
            break;
          }

          case "ping": {
            // Respond to heartbeat with error handling
            try {
              ws.send(JSON.stringify({ type: "pong" }));
              logger.debug("Received heartbeat from client");
            } catch (error) {
              logger.warn("Error sending pong response:", { error });
              // The connection will be handled by the close event if needed
            }
            break;
          }

          case "clearPresence": {
            // Clear presence when requested with error handling
            if (discord.isConnected()) {
              try {
                const result = await discord.clearActivity();
                if (result) {
                  logger.info(
                    "Cleared Discord presence as requested by client"
                  );
                } else {
                  logger.warn("Failed to clear Discord presence as requested");
                }
              } catch (error) {
                logger.error("Error clearing Discord activity:", { error });
                // Continue despite errors
              }
            }
            break;
          }

          default: {
            logger.warn(`Received unknown message type: ${data.type}`);
            break;
          }
        }
      } catch (error: any) {
        logger.error("Error processing WebSocket message:", {
          error: error.message,
          stack: error.stack,
          message:
            typeof message === "string"
              ? message.substring(0, 100) + (message.length > 100 ? "..." : "")
              : "binary data",
        });
        // Continue processing other messages despite errors
      }
    });

    ws.on("close", (code, reason) => {
      logger.info(
        `Browser extension disconnected (code: ${code}, reason: ${
          reason || "none"
        })`
      );

      // Remove client from activity tracking
      clientActivity.delete(ws);

      // Clear presence if this was the last client
      if (clientActivity.size === 0 && discord.isConnected()) {
        try {
          discord
            .clearActivity()
            .then((result) => {
              if (result) {
                logger.info(
                  "Cleared Discord presence as all clients disconnected"
                );
              } else {
                logger.warn(
                  "Failed to clear Discord presence after client disconnection"
                );
              }
            })
            .catch((error) => {
              logger.error("Error clearing Discord activity:", { error });
            });
        } catch (error) {
          logger.error("Error initiating Discord activity clear:", { error });
        }
      }
    });

    // Send initial state with error handling
    try {
      sendState(ws);
    } catch (error) {
      logger.error("Error sending initial state to client:", { error });
      // The connection will be handled by the close event if needed
    }
  });

  return wss;
}

/**
 * Check for inactive clients and clear their presence
 *
 * This function periodically checks for clients that haven't sent messages
 * in a while and removes them from tracking.
 */
function checkInactiveClients(wss: WebSocketServer) {
  const now = Date.now();
  const serverConfig = config.getServer();

  // Check each client's last activity time
  clientActivity.forEach((lastActivity, ws) => {
    // If client hasn't sent a heartbeat in the timeout period
    if (now - lastActivity > serverConfig.activityTimeout) {
      logger.info("Client inactive for too long, clearing presence");

      // Clear Discord presence if connected
      if (discord.isConnected()) {
        try {
          discord
            .clearActivity()
            .then((result) => {
              if (result) {
                logger.info(
                  "Cleared Discord presence due to client inactivity"
                );
              } else {
                logger.warn(
                  "Failed to clear Discord presence for inactive client"
                );
              }
            })
            .catch((error) => {
              logger.error(
                "Error clearing Discord activity for inactive client:",
                { error }
              );
            });
        } catch (error) {
          logger.error(
            "Error initiating Discord activity clear for inactive client:",
            { error }
          );
        }
      }

      // Remove the client from tracking
      clientActivity.delete(ws);

      // If the WebSocket is still open, close it with error handling
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.close(1000, "Inactive timeout");
        } catch (error) {
          logger.warn("Error closing inactive WebSocket connection:", {
            error,
          });
          // Continue despite errors
        }
      }
    }
  });
}

/**
 * Send current state to a client
 *
 * This function sends the current application state to a WebSocket client.
 * It includes error handling to prevent crashes.
 */
function sendState(ws: WebSocket) {
  if (ws.readyState !== WebSocket.OPEN) {
    logger.warn("Attempted to send state to non-open WebSocket");
    return;
  }

  try {
    const state = {
      type: "state",
      enabled: presenceEnabled,
      connected: discord.isConnected(),
      preferences: config.getUserPreferences(),
    };

    ws.send(JSON.stringify(state));
  } catch (error) {
    logger.error("Error sending state to client:", { error });
    // The connection will be handled by the close event if needed
  }
}

/**
 * Broadcast current state to all connected clients
 *
 * This function sends the current application state to all connected WebSocket clients.
 * It includes error handling to prevent crashes.
 */
function broadcastState(wss: WebSocketServer) {
  try {
    let sentCount = 0;
    let errorCount = 0;

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          sendState(client);
          sentCount++;
        } catch (error) {
          logger.error("Error broadcasting state to client:", { error });
          errorCount++;
          // Continue to other clients despite errors
        }
      }
    });

    logger.info(
      `Broadcast state to ${sentCount} clients (${errorCount} errors)`
    );
  } catch (error) {
    logger.error("Error during state broadcast:", { error });
    // Continue despite errors
  }
}

/**
 * Toggle presence enabled state
 *
 * This function toggles whether Discord presence is enabled or disabled.
 */
export function togglePresence(enabled: boolean) {
  presenceEnabled = enabled !== undefined ? enabled : !presenceEnabled;

  // We don't clear presence here anymore because there might be always-enabled sites
  // The client will send a new presence update for the current tab
  // which will check if the site is always enabled

  logger.info(
    `Presence toggled to ${presenceEnabled ? "enabled" : "disabled"}`
  );
  return presenceEnabled;
}

/**
 * Get current presence state
 *
 * This function returns the current state of the application.
 */
export function getPresenceState() {
  try {
    return {
      enabled: presenceEnabled,
      connected: discord.isConnected(),
      preferences: config.getUserPreferences(),
    };
  } catch (error) {
    logger.error("Error getting presence state:", { error });
    // Return a default state if there's an error
    return {
      enabled: presenceEnabled,
      connected: false,
      preferences: {
        prefixText: "Viewing",
        disabledSites: [],
        alwaysEnabledSites: [],
        continuousTimer: true,
      },
    };
  }
}
