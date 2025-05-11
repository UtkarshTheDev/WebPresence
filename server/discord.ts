import * as DiscordRPC from "discord-rpc";
import { config } from "./config.ts";
import { findIconForDomain } from "./siteIcons.ts";

// Discord RPC client
let rpc: DiscordRPC.Client | null = null;
let rpcConnected = false;
let rpcReady = false;
let reconnectTimeout: NodeJS.Timeout | null = null;

// Store the initial timestamp for continuous timer
let initialTimestamp: number | null = null;

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

    // Handle continuous timer
    const now = Date.now();
    if (initialTimestamp === null || !userPrefs.continuousTimer) {
      // Initialize timestamp if it's not set or continuous timer is disabled
      initialTimestamp = now;
    }

    // Find site-specific icon if available
    const siteIcon = findIconForDomain(domain);

    // Use site-specific display name if available
    let displayDomain = siteIcon?.displayName || domain;

    // Ensure displayDomain is at least 2 characters long for Discord RPC validation
    if (displayDomain.length < 2) {
      // For very short domains like "x.com", use a more descriptive name
      displayDomain = siteIcon?.displayName || `${domain} website`;
      console.log(
        `Domain name too short, using extended name: ${displayDomain}`
      );
    }

    // Log which icon is being used
    if (siteIcon) {
      console.log(`Using custom icon for ${domain}: ${siteIcon.iconKey}`);
    } else {
      console.log(`Using default web icon for ${domain}`);
    }

    // Set Rich Presence with customized format
    rpc.setActivity({
      // Main title with customized prefix: "[prefix] - [page title]"
      details: `${userPrefs.prefixText} - ${
        title.length > 40 ? `${title.substring(0, 37)}...` : title
      }`,

      // Credit text: "by utkarsh tiwari"
      state: `- ${presenceConfig.creditText}`,

      // Use continuous timer if enabled, otherwise use current time
      startTimestamp: initialTimestamp,

      // Use site-specific icon if available, otherwise use default web icon
      largeImageKey: siteIcon?.iconKey || presenceConfig.largeImageKey,
      largeImageText: displayDomain,

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
    // Reset the timestamp when clearing activity
    initialTimestamp = null;
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

/**
 * Reset the activity timestamp
 */
function resetTimestamp() {
  initialTimestamp = null;
  return true;
}

// Export Discord RPC functions
export const discord = {
  connect: connectToDiscord,
  setActivity,
  clearActivity,
  isConnected,
  resetTimestamp,
};
