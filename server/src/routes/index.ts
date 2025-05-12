import { Router } from "express";
import { config } from "../config/index.js";
import { getPresenceState, togglePresence } from "../services/websocket.js";
import { WebSocketServer } from "ws";
import { stopServer } from "../index.js";

/**
 * Initialize API routes
 */
export function initRoutes(wss: WebSocketServer) {
  const router = Router();

  // Status endpoint
  router.get("/status", (_, res) => {
    const state = getPresenceState();
    res.json({
      running: true,
      discordConnected: state.connected,
      presenceEnabled: state.enabled,
      preferences: state.preferences,
    });
  });

  // Toggle presence endpoint
  router.post("/toggle", (req, res) => {
    const { enabled } = req.body;
    const newState = togglePresence(enabled);

    // Broadcast state to all connected extensions
    wss.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "state",
          ...getPresenceState(),
        })
      );
    });

    res.json({ enabled: newState });
  });

  // Update preferences endpoint
  router.post("/preferences", (req, res) => {
    const { preferences } = req.body;

    if (preferences) {
      const updatedPrefs = config.updateUserPreferences(preferences);

      // Broadcast updated preferences to all clients
      wss.clients.forEach((client) => {
        client.send(
          JSON.stringify({
            type: "state",
            ...getPresenceState(),
          })
        );
      });

      res.json({ preferences: updatedPrefs });
    } else {
      res.status(400).json({ error: "Invalid preferences" });
    }
  });

  // Stop server endpoint
  router.post("/stop", async (req, res) => {
    // Notify all clients that the server is shutting down
    wss.clients.forEach((client) => {
      client.send(
        JSON.stringify({
          type: "shutdown",
          message: "Server is shutting down",
        })
      );
    });

    // Send response before stopping the server
    res.json({ success: true, message: "Server is shutting down" });

    // Wait a moment to ensure the response is sent
    setTimeout(async () => {
      try {
        await stopServer();
        // The server will be stopped, so no need to do anything else
      } catch (error) {
        // If there's an error, we can't send it to the client as the response is already sent
        console.error("Error stopping server:", error);
      }
    }, 500);
  });

  return router;
}
