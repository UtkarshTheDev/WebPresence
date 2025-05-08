import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer } from "ws";
import * as DiscordRPC from "discord-rpc";

// Constants
const PORT = 3000;
// Using a pre-registered application ID (similar to VSCode's approach)
const DISCORD_CLIENT_ID = "1370122815273046117"; // This is a pre-registered ID for Web Presence

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

// Client activity tracking
const clientActivity = new Map<any, number>(); // Using any for WebSocket type compatibility
const ACTIVITY_TIMEOUT = 45000; // 45 seconds timeout

// Using the basic connection method that works perfectly
let rpc: DiscordRPC.Client | null = null;
let rpcConnected = false;
let rpcReady = false;
let presenceEnabled = true;
let connectionAttempts = 0;
let reconnectTimeout: NodeJS.Timeout | null = null;

// No cache management needed

// Function to check if Discord is running is not needed anymore
// We directly connect to Discord using the basic connection method

// Connect to Discord using EXACTLY the same approach as the successful test
async function connectToDiscord() {
  // Clear any existing reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  console.log("🔄 Using EXACTLY the same approach as the successful test");

  try {
    // Destroy existing client if there is one
    if (rpc) {
      try {
        console.log("Cleaning up previous Discord RPC client...");
        rpc.destroy();
      } catch (e) {
        // Ignore errors during cleanup
      }
    }

    // EXACTLY the same client creation as in the successful test
    console.log(
      "Creating client with minimal configuration - EXACTLY as in the test"
    );
    rpc = new DiscordRPC.Client({ transport: "ipc" });

    console.log("Attempting to connect to Discord...");

    // Set up event handlers before login
    rpc.on("ready", () => {
      rpcReady = true;
      connectionAttempts = 0;
      console.log("✅ Discord RPC ready - Rich Presence can now be displayed");
      if (rpc && rpc.user) {
        console.log(
          `✅ Connected as Discord user: ${rpc.user.username}#${rpc.user.discriminator}`
        );
      }
    });

    rpc.on("connected", () => {
      rpcConnected = true;
      console.log("✅ Connected to Discord RPC service");
    });

    rpc.on("disconnected", () => {
      console.log("❌ Disconnected from Discord RPC");
      rpcConnected = false;
      rpcReady = false;

      // Attempt to reconnect with increasing delay
      connectionAttempts++;
      const delay = Math.min(
        30000,
        Math.pow(2, Math.min(connectionAttempts, 5)) * 1000
      );
      console.log(
        `Will attempt to reconnect in ${
          delay / 1000
        } seconds (attempt ${connectionAttempts})`
      );
      reconnectTimeout = setTimeout(connectToDiscord, delay);
    });

    // EXACTLY the same login approach as in the successful test
    console.log("Using EXACTLY the same login approach as the successful test");
    console.log("Logging in with client ID:", DISCORD_CLIENT_ID);
    await rpc.login({ clientId: DISCORD_CLIENT_ID });
  } catch (error: any) {
    console.error("❌ Failed to connect to Discord:", error);

    // Provide more helpful error messages
    if (error.message === "RPC_CONNECTION_TIMEOUT") {
      console.log("\n❌ Possible issues:");
      console.log("1. Discord is running but RPC is disabled");
      console.log("2. Discord IPC connection is blocked by a firewall");
      console.log("3. The connection approach might need adjustment");

      console.log("\n📋 Troubleshooting steps:");
      console.log("1. Check if 'Game Activity' is enabled in Discord settings");
      console.log(
        "   - Open Discord Settings > Activity Settings > Activity Status"
      );
      console.log(
        "   - Make sure 'Display current activity as a status message' is ON"
      );
      console.log(
        "2. Try restarting Discord completely (close from system tray)"
      );
      console.log("3. Make sure no firewall is blocking the connection");
      console.log(
        "\n💡 IMPORTANT: Run 'bun run test-discord' to verify which connection method works"
      );
      console.log(
        "   The test shows that the basic connection method works perfectly"
      );
    }

    rpcConnected = false;
    rpcReady = false;

    // Retry connection with increasing delay
    connectionAttempts++;
    const delay = Math.min(
      30000,
      Math.pow(2, Math.min(connectionAttempts, 5)) * 1000
    );
    console.log(
      `⏱️ Will attempt to reconnect in ${
        delay / 1000
      } seconds (attempt ${connectionAttempts})`
    );
    reconnectTimeout = setTimeout(connectToDiscord, delay);
  }
}

// Try to connect to Discord on startup
console.log("🚀 Initializing Discord RPC connection...");
console.log("💡 Using EXACTLY the same approach as the successful test");
console.log(
  "💡 This approach was verified to work by running 'bun run test-discord'"
);
connectToDiscord();

// No favicon caching needed - using Discord application assets directly

// Function to check for inactive clients and clear their presence
function checkInactiveClients() {
  const now = Date.now();

  // Check each client's last activity time
  clientActivity.forEach((lastActivity, ws) => {
    // If client hasn't sent a heartbeat in the timeout period
    if (now - lastActivity > ACTIVITY_TIMEOUT) {
      console.log("Client inactive for too long, clearing presence");

      // Clear Discord presence if connected
      if (rpcConnected && rpcReady && rpc) {
        try {
          rpc.clearActivity();
          console.log("Cleared Discord presence due to client inactivity");
        } catch (error: any) {
          console.error("Error clearing activity:", error);
        }
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

// Set up periodic check for inactive clients
setInterval(checkInactiveClients, 15000); // Check every 15 seconds

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
          if (!presenceEnabled) {
            return;
          }

          const { title, url } = data;
          console.log(`Tab updated: ${title} - ${url}`);

          if (rpcConnected && rpcReady) {
            // Extract domain from URL
            let domain = "";
            try {
              domain = new URL(url).hostname;
            } catch (e) {
              domain = url;
            }

            // Set Rich Presence with enhanced format:
            // - Title: "Viewing - [page title]"
            // - Description: "Made by Utkarsh Tiwari"
            // - Buttons: GitHub repo and Twitter profile
            // - Using Discord application assets directly
            if (rpc) {
              try {
                rpc.setActivity({
                  // Main title: "Viewing - [page title]"
                  details: `Viewing - ${
                    title.length > 100 ? `${title.substring(0, 97)}...` : title
                  }`,
                  state: `- made by Utkarsh Tiwari`,

                  startTimestamp: Date.now(),

                  // Use Discord application assets directly
                  largeImageKey: "web",
                  largeImageText: domain,

                  // Add small image (avatar)
                  smallImageKey: "me",
                  smallImageText: "Utkarsh Tiwari",

                  // Add buttons
                  buttons: [
                    {
                      label: "GitHub Repository",
                      url: "https://github.com/utkarshthedev/webpresence",
                    },
                    {
                      label: "Follow on Twitter",
                      url: "https://twitter.com/utkarshthedev",
                    },
                  ],

                  instance: false,
                });
              } catch (error: any) {
                console.error("Error setting activity:", error);
                // If we get an error here, the connection might be broken
                if (rpcConnected) {
                  rpcConnected = false;
                  rpcReady = false;
                  // Try to reconnect
                  connectToDiscord();
                }
              }
            }
          }
          break;
        }

        case "toggle": {
          presenceEnabled = data.enabled;
          console.log(`Presence ${presenceEnabled ? "enabled" : "disabled"}`);

          if (!presenceEnabled && rpcConnected && rpc) {
            // Clear presence when disabled
            try {
              rpc.clearActivity();
            } catch (error: any) {
              console.error("Error clearing activity:", error);
              // If we get an error here, the connection might be broken
              rpcConnected = false;
              rpcReady = false;
              // Try to reconnect
              connectToDiscord();
            }
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
    if (clientActivity.size === 0 && rpcConnected && rpcReady && rpc) {
      try {
        rpc.clearActivity();
        console.log("Cleared Discord presence as all clients disconnected");
      } catch (error: any) {
        console.error("Error clearing activity:", error);
      }
    }
  });

  // Send initial state
  ws.send(
    JSON.stringify({
      type: "state",
      enabled: presenceEnabled,
      connected: rpcConnected && rpcReady,
    })
  );
});

// API endpoints
app.get("/status", (_, res) => {
  res.json({
    running: true,
    discordConnected: rpcConnected && rpcReady,
    presenceEnabled,
  });
});

app.post("/toggle", (req, res) => {
  const { enabled } = req.body;
  presenceEnabled = enabled !== undefined ? enabled : !presenceEnabled;

  // Broadcast state to all connected extensions
  wss.clients.forEach((client) => {
    client.send(
      JSON.stringify({
        type: "state",
        enabled: presenceEnabled,
        connected: rpcConnected && rpcReady,
      })
    );
  });

  if (!presenceEnabled && rpcConnected && rpc) {
    try {
      rpc.clearActivity();
    } catch (error: any) {
      console.error("Error clearing activity:", error);
      // If we get an error here, the connection might be broken
      rpcConnected = false;
      rpcReady = false;
      // Try to reconnect
      connectToDiscord();
    }
  }

  res.json({ enabled: presenceEnabled });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
