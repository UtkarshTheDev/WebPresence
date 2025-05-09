import express from "express";
import http from "http";
import cors from "cors";
import { discord } from "./discord.ts";
import {
  initWebSocketServer,
  togglePresence,
  getPresenceState,
} from "./websocket.ts";
import { config } from "./config.ts";

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = initWebSocketServer(server);

// Try to connect to Discord on startup
console.log("🚀 Initializing Discord RPC connection...");
discord.connect();

// API endpoints
app.get("/status", (_, res) => {
  const state = getPresenceState();
  res.json({
    running: true,
    discordConnected: state.connected,
    presenceEnabled: state.enabled,
    preferences: state.preferences,
  });
});

app.post("/toggle", (req, res) => {
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

app.post("/preferences", (req, res) => {
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

// Start the server
const PORT = config.getServer().port;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
