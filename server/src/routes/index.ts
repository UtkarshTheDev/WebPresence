import { Router } from "express";
import { config } from "../config/index.js";
import { getPresenceState, togglePresence } from "../services/websocket.js";
import { WebSocketServer } from "ws";

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

  return router;
}
