import express from "express";
import http from "http";
import cors from "cors";
import { WebSocketServer } from "ws";
import * as DiscordRPC from "discord-rpc";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Constants
const PORT = 3000;
// Using a pre-registered application ID (similar to VSCode's approach)
const DISCORD_CLIENT_ID = "1370122815273046117"; // This is a pre-registered ID for Web Presence
const CACHE_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "cache"
);
const MAX_CACHE_SIZE = 50; // Maximum number of cached favicons

// Create cache directory if it doesn't exist
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server });

// Using the basic connection method that works perfectly
let rpc: DiscordRPC.Client | null = null;
let rpcConnected = false;
let rpcReady = false;
let presenceEnabled = true;
let connectionAttempts = 0;
let reconnectTimeout: NodeJS.Timeout | null = null;

// Cache management
const faviconCache = new Map<string, { timestamp: number; path: string }>();

// Function to check if Discord is running
// Using the exact same approach as the successful test
async function isDiscordRunning(): Promise<boolean> {
  try {
    console.log("Testing Discord connection...");

    // Create client with minimal configuration - EXACTLY as in the test
    const tempRpc = new DiscordRPC.Client({ transport: "ipc" });

    // Simple approach with timeout
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => reject(new Error("Connection test timed out")), 5000);
    });

    try {
      // Use the exact same approach as the successful test
      await tempRpc.login({ clientId: DISCORD_CLIENT_ID });

      console.log("✅ Discord connection test successful!");

      try {
        tempRpc.destroy();
      } catch (e) {
        // Ignore cleanup errors
      }

      return true;
    } catch (error) {
      console.log(`❌ Discord connection test failed: ${error.message}`);

      try {
        tempRpc.destroy();
      } catch (e) {
        // Ignore cleanup errors
      }

      return false;
    }
  } catch (error) {
    console.log("Error checking if Discord is running:", error);
    return false;
  }
}

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
  } catch (error) {
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

// Handle favicon caching and retrieval
async function getFaviconPath(faviconUrl: string): Promise<string | null> {
  // Check if favicon is already cached
  if (faviconCache.has(faviconUrl)) {
    const cached = faviconCache.get(faviconUrl);
    if (cached && fs.existsSync(cached.path)) {
      // Update access timestamp
      cached.timestamp = Date.now();
      return cached.path;
    }
  }

  try {
    // Make a hash of the URL to use as filename
    const urlHash = Buffer.from(faviconUrl)
      .toString("base64")
      .replace(/[\/\\:]/g, "_");
    const filePath = path.join(CACHE_DIR, urlHash);

    // Download favicon
    const response = await fetch(faviconUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch favicon: ${response.status} ${response.statusText}`
      );
    }

    // Save to disk
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Add to cache
    faviconCache.set(faviconUrl, {
      timestamp: Date.now(),
      path: filePath,
    });

    // Check cache size and prune if needed
    if (faviconCache.size > MAX_CACHE_SIZE) {
      pruneCache();
    }

    return filePath;
  } catch (error) {
    console.error("Error downloading favicon:", error);
    return null;
  }
}

// Prune old cache entries
function pruneCache() {
  const entries = [...faviconCache.entries()];
  entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

  // Remove oldest entries to bring cache size back to limit
  for (let i = 0; i < entries.length - MAX_CACHE_SIZE; i++) {
    const [url, { path: filePath }] = entries[i];
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      faviconCache.delete(url);
    } catch (error) {
      console.error("Error removing cached favicon:", error);
    }
  }
}

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("Browser extension connected");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case "presence": {
          if (!presenceEnabled) {
            return;
          }

          const { title, url, faviconUrl } = data;
          console.log(`Tab updated: ${title} - ${url}`);

          if (rpcConnected && rpcReady) {
            let largeImageKey: string | undefined;

            // Get favicon for large image
            if (faviconUrl) {
              const faviconPath = await getFaviconPath(faviconUrl);
              if (faviconPath) {
                // Use local file path for the image
                largeImageKey = faviconPath;
              }
            }

            // Extract domain from URL
            let domain = "";
            try {
              domain = new URL(url).hostname;
            } catch (e) {
              domain = url;
            }

            // Set Rich Presence with enhanced format:
            // - Main title: "Viewing - [page title]"
            // - Description: URL + "Made by Utkarsh Tiwari"
            // - Buttons: GitHub repo and Twitter profile
            // - Small image: Utkarsh's avatar
            if (rpc) {
              try {
                rpc.setActivity({
                  // Main title: "Viewing - [page title]"
                  details: `Viewing - ${
                    title.length > 100 ? `${title.substring(0, 97)}...` : title
                  }`,

                  // Description: URL + Made by Utkarsh Tiwari
                  state: `- Made by Utkarsh Tiwari`,

                  startTimestamp: Date.now(),
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
              } catch (error) {
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
            } catch (error) {
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
          ws.send(JSON.stringify({ type: "pong" }));
          break;
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Browser extension disconnected");
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
    } catch (error) {
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
