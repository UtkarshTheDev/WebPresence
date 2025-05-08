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
const DISCORD_CLIENT_ID = "1157438221865717891"; // This is a pre-registered ID for Web Presence
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

// Initialize Discord RPC with VSCode-like approach
const rpc = new DiscordRPC.Client({
  transport: "ipc",
  // Using a more permissive connection approach
  clientId: DISCORD_CLIENT_ID,
  // Adding additional options for better compatibility
  debug: false,
  // Using a more reliable connection method
  useRpcConnection: true,
});

let rpcConnected = false;
let rpcReady = false;
let presenceEnabled = true;

// Cache management
const faviconCache = new Map<string, { timestamp: number; path: string }>();

// Connect to Discord with improved error handling
async function connectToDiscord() {
  try {
    // Using a more reliable connection method
    await rpc.login({
      clientId: DISCORD_CLIENT_ID,
      // Adding scopes for better compatibility
      scopes: ["rpc", "rpc.api", "rpc.voice.read"],
      // Using a more permissive connection approach
      clientSecret: undefined,
    });

    rpcConnected = true;
    console.log("Connected to Discord RPC");

    rpc.on("ready", () => {
      rpcReady = true;
      console.log("Discord RPC ready");
    });

    // Add error handling for disconnection
    rpc.on("disconnected", () => {
      console.log("Disconnected from Discord RPC");
      rpcConnected = false;
      rpcReady = false;
      // Attempt to reconnect
      setTimeout(connectToDiscord, 5000);
    });
  } catch (error) {
    console.error("Failed to connect to Discord:", error);
    rpcConnected = false;
    // Retry connection with exponential backoff
    setTimeout(connectToDiscord, Math.min(30000, Math.pow(2, 3) * 1000));
  }
}

// Try to connect to Discord on startup
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

            // Set Rich Presence
            rpc.setActivity({
              details:
                title.length > 128 ? `${title.substring(0, 125)}...` : title,
              state:
                domain.length > 128 ? `${domain.substring(0, 125)}...` : domain,
              startTimestamp: Date.now(),
              largeImageKey,
              largeImageText: domain,
              instance: false,
            });
          }
          break;
        }

        case "toggle": {
          presenceEnabled = data.enabled;
          console.log(`Presence ${presenceEnabled ? "enabled" : "disabled"}`);

          if (!presenceEnabled && rpcConnected) {
            // Clear presence when disabled
            rpc.clearActivity();
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
app.get("/status", (req, res) => {
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

  if (!presenceEnabled && rpcConnected) {
    rpc.clearActivity();
  }

  res.json({ enabled: presenceEnabled });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
