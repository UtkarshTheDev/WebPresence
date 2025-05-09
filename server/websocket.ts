import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { config } from "./config.ts";
import { discord } from "./discord.ts";

// Client activity tracking
const clientActivity = new Map<WebSocket, number>();
let presenceEnabled = true;

/**
 * Initialize WebSocket server
 */
export function initWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server });

  // Set up periodic check for inactive clients
  const serverConfig = config.getServer();
  setInterval(
    () => checkInactiveClients(wss),
    serverConfig.inactiveCheckInterval
  );

  // WebSocket connection handling
  wss.on("connection", (ws) => {
    console.log("Browser extension connected");

    // Initialize client activity tracking
    clientActivity.set(ws, Date.now());

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());

        // Update client activity timestamp for any message
        clientActivity.set(ws, Date.now());

        switch (data.type) {
          case "presence": {
            const { title, url } = data;

            // Extract domain from URL
            let domain = "";
            try {
              domain = new URL(url).hostname;
            } catch (e) {
              domain = url;
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
              console.log(`Skipping presence for disabled site: ${domain}`);
              return;
            }

            // Skip if presence is disabled and site is not always enabled
            if (!presenceEnabled && !isAlwaysEnabled) {
              return;
            }

            console.log(`Tab updated: ${title} - ${domain}`);

            if (discord.isConnected()) {
              discord.setActivity(title, url);
            }
            break;
          }

          case "toggle": {
            presenceEnabled = data.enabled;
            console.log(`Presence ${presenceEnabled ? "enabled" : "disabled"}`);

            if (!presenceEnabled && discord.isConnected()) {
              // Clear presence when disabled
              discord.clearActivity();
            }
            break;
          }

          case "updatePreferences": {
            // Handle preference updates
            if (data.preferences) {
              const updatedPrefs = config.updateUserPreferences(
                data.preferences
              );
              console.log("Updated user preferences:", updatedPrefs);

              // Broadcast updated preferences to all clients
              broadcastState(wss);
            }
            break;
          }

          case "ping": {
            // Respond to heartbeat
            ws.send(JSON.stringify({ type: "pong" }));
            console.log("Received heartbeat from client");
            break;
          }
        }
      } catch (error: any) {
        console.error("Error processing message:", error);
      }
    });

    ws.on("close", () => {
      console.log("Browser extension disconnected");

      // Remove client from activity tracking
      clientActivity.delete(ws);

      // Clear presence if this was the last client
      if (clientActivity.size === 0 && discord.isConnected()) {
        discord.clearActivity();
        console.log("Cleared Discord presence as all clients disconnected");
      }
    });

    // Send initial state
    sendState(ws);
  });

  return wss;
}

/**
 * Check for inactive clients and clear their presence
 */
function checkInactiveClients(wss: WebSocketServer) {
  const now = Date.now();
  const serverConfig = config.getServer();

  // Check each client's last activity time
  clientActivity.forEach((lastActivity, ws) => {
    // If client hasn't sent a heartbeat in the timeout period
    if (now - lastActivity > serverConfig.activityTimeout) {
      console.log("Client inactive for too long, clearing presence");

      // Clear Discord presence if connected
      if (discord.isConnected()) {
        discord.clearActivity();
        console.log("Cleared Discord presence due to client inactivity");
      }

      // Remove the client from tracking
      clientActivity.delete(ws);

      // If the WebSocket is still open, close it
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    }
  });
}

/**
 * Send current state to a client
 */
function sendState(ws: WebSocket) {
  ws.send(
    JSON.stringify({
      type: "state",
      enabled: presenceEnabled,
      connected: discord.isConnected(),
      preferences: config.getUserPreferences(),
    })
  );
}

/**
 * Broadcast current state to all connected clients
 */
function broadcastState(wss: WebSocketServer) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendState(client);
    }
  });
}

/**
 * Toggle presence enabled state
 */
export function togglePresence(enabled: boolean) {
  presenceEnabled = enabled !== undefined ? enabled : !presenceEnabled;

  if (!presenceEnabled && discord.isConnected()) {
    discord.clearActivity();
  }

  return presenceEnabled;
}

/**
 * Get current presence state
 */
export function getPresenceState() {
  return {
    enabled: presenceEnabled,
    connected: discord.isConnected(),
    preferences: config.getUserPreferences(),
  };
}
