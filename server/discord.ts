import * as DiscordRPC from "discord-rpc";
import { config } from "./config.ts";

// Discord RPC client
let rpc: DiscordRPC.Client | null = null;
let rpcConnected = false;
let rpcReady = false;
let reconnectTimeout: NodeJS.Timeout | null = null;

/**
 * Connect to Discord RPC
 */
async function connectToDiscord() {
  // Clear any existing reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  const discordConfig = config.getDiscord();

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

    // Create new Discord RPC client
    console.log("Creating Discord RPC client...");
    rpc = new DiscordRPC.Client({ transport: "ipc" });

    console.log("Attempting to connect to Discord...");

    // Set up event handlers before login
    rpc.on("ready", () => {
      rpcReady = true;
      discordConfig.reconnectAttempts = 0;
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
      discordConfig.reconnectAttempts++;
      const delay = Math.min(
        30000,
        Math.pow(2, Math.min(discordConfig.reconnectAttempts, 5)) * 1000
      );
      console.log(
        `Will attempt to reconnect in ${delay / 1000} seconds (attempt ${
          discordConfig.reconnectAttempts
        })`
      );
      reconnectTimeout = setTimeout(connectToDiscord, delay);
    });

    // Login to Discord RPC
    console.log("Logging in with client ID:", discordConfig.clientId);
    await rpc.login({ clientId: discordConfig.clientId });
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
    }

    rpcConnected = false;
    rpcReady = false;

    // Retry connection with increasing delay
    discordConfig.reconnectAttempts++;
    const delay = Math.min(
      30000,
      Math.pow(2, Math.min(discordConfig.reconnectAttempts, 5)) * 1000
    );
    console.log(
      `⏱️ Will attempt to reconnect in ${delay / 1000} seconds (attempt ${
        discordConfig.reconnectAttempts
      })`
    );
    reconnectTimeout = setTimeout(connectToDiscord, delay);
  }
}

/**
 * Set Discord Rich Presence activity
 */
function setActivity(title: string, url: string) {
  if (!rpcConnected || !rpcReady || !rpc) {
    console.warn("Discord RPC not ready, cannot set activity");
    return false;
  }

  try {
    // Extract domain from URL
    let domain = "";
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      domain = url;
    }

    const presenceConfig = config.getPresence();
    const userPrefs = config.getUserPreferences();

    // Set Rich Presence with customized format
    rpc.setActivity({
      // Main title with customized prefix: "[prefix] - [page title]"
      details: `${userPrefs.prefixText} - ${
        title.length > 40 ? `${title.substring(0, 37)}...` : title
      }`,

      // Credit text: "by utkarsh tiwari"
      state: `- ${presenceConfig.creditText}`,

      startTimestamp: Date.now(),

      // Use Discord application assets
      largeImageKey: presenceConfig.largeImageKey,
      largeImageText: domain,

      // Add small image (avatar)
      smallImageKey: presenceConfig.smallImageKey,
      smallImageText: presenceConfig.smallImageText,

      // Add buttons
      buttons: presenceConfig.buttons,

      instance: false,
    });

    return true;
  } catch (error: any) {
    console.error("Error setting activity:", error);

    // If we get an error here, the connection might be broken
    if (rpcConnected) {
      rpcConnected = false;
      rpcReady = false;
      // Try to reconnect
      connectToDiscord();
    }

    return false;
  }
}

/**
 * Clear Discord Rich Presence activity
 */
function clearActivity() {
  if (!rpcConnected || !rpcReady || !rpc) {
    console.warn("Discord RPC not ready, cannot clear activity");
    return false;
  }

  try {
    rpc.clearActivity();
    return true;
  } catch (error: any) {
    console.error("Error clearing activity:", error);

    // If we get an error here, the connection might be broken
    rpcConnected = false;
    rpcReady = false;
    // Try to reconnect
    connectToDiscord();

    return false;
  }
}

/**
 * Check if Discord RPC is connected and ready
 */
function isConnected() {
  return rpcConnected && rpcReady;
}

// Export Discord RPC functions
export const discord = {
  connect: connectToDiscord,
  setActivity,
  clearActivity,
  isConnected,
};
