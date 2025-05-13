import * as DiscordRPC from "discord-rpc";
import { config } from "../config/index.js";
import { findIconForDomain } from "../data/siteIcons.js";
import { logger } from "../utils/logger.js";

// Discord RPC client
let rpc: DiscordRPC.Client | null = null;
let rpcConnected = false;
let rpcReady = false;
let reconnectTimeout: NodeJS.Timeout | null = null;
let connectionInProgress = false; // Flag to prevent multiple simultaneous connection attempts

// Store the initial timestamp for continuous timer
let initialTimestamp: number | null = null;

/**
 * Connect to Discord RPC
 *
 * This function attempts to establish a connection to Discord RPC.
 * It includes robust error handling and automatic reconnection logic.
 */
async function connectToDiscord() {
  // Prevent multiple simultaneous connection attempts
  if (connectionInProgress) {
    logger.info(
      "Discord connection already in progress, skipping duplicate attempt"
    );
    return false;
  }

  // Clear any existing reconnect timeout
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  // Set the connection in progress flag
  connectionInProgress = true;

  const discordConfig = config.getDiscord();
  const maxReconnectAttempts = discordConfig.maxReconnectAttempts || 10;

  try {
    // Destroy existing client if there is one
    if (rpc) {
      try {
        logger.info("Cleaning up previous Discord RPC client...");
        rpc.destroy();
      } catch (e) {
        // Ignore errors during cleanup
        logger.warn("Error during Discord RPC client cleanup (non-critical)", {
          error: e,
        });
      }
    }

    // Create new Discord RPC client
    logger.info("Creating Discord RPC client...");
    rpc = new DiscordRPC.Client({ transport: "ipc" });

    logger.info("Attempting to connect to Discord...");

    // Set up event handlers before login
    rpc.on("ready", () => {
      rpcReady = true;
      discordConfig.reconnectAttempts = 0;
      logger.success(
        "✅ Discord RPC ready - Rich Presence can now be displayed"
      );
      if (rpc && rpc.user) {
        logger.success(
          `✅ Connected as Discord user: ${rpc.user.username}#${rpc.user.discriminator}`
        );
      }
    });

    rpc.on("connected", () => {
      rpcConnected = true;
      logger.success("✅ Connected to Discord RPC service");
    });

    rpc.on("disconnected", () => {
      logger.warn("❌ Disconnected from Discord RPC");
      rpcConnected = false;
      rpcReady = false;

      // Attempt to reconnect with increasing delay
      discordConfig.reconnectAttempts++;

      // Check if we've exceeded the maximum reconnect attempts
      if (discordConfig.reconnectAttempts > maxReconnectAttempts) {
        logger.warn(
          `Maximum reconnect attempts (${maxReconnectAttempts}) reached. Will try again in 60 seconds.`
        );
        // Reset counter but keep trying with a longer delay
        discordConfig.reconnectAttempts = 1;
        reconnectTimeout = setTimeout(connectToDiscord, 60000);
        return;
      }

      const delay = Math.min(
        30000,
        Math.pow(2, Math.min(discordConfig.reconnectAttempts, 5)) * 1000
      );
      logger.info(
        `Will attempt to reconnect in ${delay / 1000} seconds (attempt ${
          discordConfig.reconnectAttempts
        } of ${maxReconnectAttempts})`
      );
      reconnectTimeout = setTimeout(connectToDiscord, delay);
    });

    // Add error handler for the RPC client
    rpc.on("error", (error) => {
      logger.error("Discord RPC client error", { error });
      // Don't disconnect here, let the disconnected event handle reconnection
    });

    // Login to Discord RPC
    logger.info("Logging in with client ID:", discordConfig.clientId);
    try {
      await rpc.login({ clientId: discordConfig.clientId });
    } catch (error) {
      // Handle login errors explicitly
      logger.error("Discord login failed:", { error });

      // Reset connection state
      connectionInProgress = false;
      rpcConnected = false;
      rpcReady = false;

      // Schedule reconnection
      const delay = Math.min(
        30000,
        Math.pow(2, Math.min(discordConfig.reconnectAttempts, 5)) * 1000
      );

      logger.info(
        `Will attempt to reconnect in ${delay / 1000} seconds (attempt ${
          discordConfig.reconnectAttempts
        } of ${maxReconnectAttempts})`
      );

      reconnectTimeout = setTimeout(connectToDiscord, delay);
      return false;
    }
  } catch (error: any) {
    logger.error("❌ Failed to connect to Discord:", {
      error: error.message,
      stack: error.stack,
    });

    // Provide more helpful error messages
    if (error.message === "RPC_CONNECTION_TIMEOUT") {
      logger.info("\n❌ Possible issues:");
      logger.info("1. Discord is running but RPC is disabled");
      logger.info("2. Discord IPC connection is blocked by a firewall");
      logger.info("3. The connection approach might need adjustment");

      logger.info("\n📋 Troubleshooting steps:");
      logger.info("1. Check if 'Game Activity' is enabled in Discord settings");
      logger.info(
        "   - Open Discord Settings > Activity Settings > Activity Status"
      );
      logger.info(
        "   - Make sure 'Display current activity as a status message' is ON"
      );
      logger.info(
        "2. Try restarting Discord completely (close from system tray)"
      );
      logger.info("3. Make sure no firewall is blocking the connection");
    }

    rpcConnected = false;
    rpcReady = false;
    connectionInProgress = false; // Reset the connection in progress flag

    // Check if we've exceeded the maximum reconnect attempts
    discordConfig.reconnectAttempts++;
    if (discordConfig.reconnectAttempts > maxReconnectAttempts) {
      logger.warn(
        `Maximum reconnect attempts (${maxReconnectAttempts}) reached. Will try again in 60 seconds.`
      );
      // Reset counter but keep trying with a longer delay
      discordConfig.reconnectAttempts = 1;
      reconnectTimeout = setTimeout(connectToDiscord, 60000);
      return false;
    }

    // Retry connection with increasing delay
    const delay = Math.min(
      30000,
      Math.pow(2, Math.min(discordConfig.reconnectAttempts, 5)) * 1000
    );
    logger.info(
      `⏱️ Will attempt to reconnect in ${delay / 1000} seconds (attempt ${
        discordConfig.reconnectAttempts
      } of ${maxReconnectAttempts})`
    );
    reconnectTimeout = setTimeout(connectToDiscord, delay);
    return false;
  }

  // If we get here, the connection was successful
  connectionInProgress = false;
  return true;
}

/**
 * Set Discord Rich Presence activity
 *
 * This function updates the Discord Rich Presence with information about the current website.
 * It includes robust error handling and automatic reconnection if needed.
 */
function setActivity(title: string, url: string) {
  if (!rpcConnected || !rpcReady || !rpc) {
    logger.warn("Discord RPC not ready, cannot set activity");
    return false;
  }

  try {
    // Extract domain from URL
    let domain = "";
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      domain = url;
      logger.warn(`Failed to parse URL: ${url}`, { error: e });
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
      logger.info(
        `Domain name too short, using extended name: ${displayDomain}`
      );
    }

    // Log which icon is being used
    if (siteIcon) {
      logger.info(`Using custom icon for ${domain}: ${siteIcon.iconKey}`);
    } else {
      logger.info(`Using default web icon for ${domain}`);
    }

    // Prepare activity data
    const activityData = {
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
    };

    // Set Rich Presence with customized format
    // Wrap in a promise with timeout to prevent hanging
    const setActivityPromise = new Promise<boolean>((resolve, reject) => {
      try {
        if (!rpc) {
          return reject(new Error("RPC client is null"));
        }

        // Set activity
        rpc.setActivity(activityData);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => {
        reject(new Error("setActivity timed out after 5 seconds"));
      }, 5000);
    });

    // Use Promise.race to handle potential timeouts
    return Promise.race([setActivityPromise, timeoutPromise])
      .then(() => true)
      .catch((error) => {
        logger.error("Error setting activity:", {
          error: error.message,
          stack: error.stack,
        });

        // If we get an error here, the connection might be broken
        if (rpcConnected) {
          logger.warn(
            "Discord connection appears broken, attempting to reconnect"
          );
          rpcConnected = false;
          rpcReady = false;
          // Try to reconnect
          connectToDiscord();
        }

        return false;
      });
  } catch (error: any) {
    logger.error("Error in setActivity:", {
      error: error.message,
      stack: error.stack,
    });

    // If we get an error here, the connection might be broken
    if (rpcConnected) {
      logger.warn("Discord connection appears broken, attempting to reconnect");
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
 *
 * This function clears the current Discord Rich Presence.
 * It includes robust error handling and automatic reconnection if needed.
 */
function clearActivity() {
  if (!rpcConnected || !rpcReady || !rpc) {
    logger.warn("Discord RPC not ready, cannot clear activity");
    return false;
  }

  try {
    // Wrap in a promise with timeout to prevent hanging
    const clearActivityPromise = new Promise<boolean>((resolve, reject) => {
      try {
        if (!rpc) {
          return reject(new Error("RPC client is null"));
        }

        // Clear activity
        rpc.clearActivity();
        // Reset the timestamp when clearing activity
        initialTimestamp = null;
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });

    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<boolean>((_, reject) => {
      setTimeout(() => {
        reject(new Error("clearActivity timed out after 5 seconds"));
      }, 5000);
    });

    // Use Promise.race to handle potential timeouts
    return Promise.race([clearActivityPromise, timeoutPromise])
      .then(() => {
        logger.info("Successfully cleared Discord presence");
        return true;
      })
      .catch((error) => {
        logger.error("Error clearing activity:", {
          error: error.message,
          stack: error.stack,
        });

        // If we get an error here, the connection might be broken
        logger.warn(
          "Discord connection appears broken, attempting to reconnect"
        );
        rpcConnected = false;
        rpcReady = false;
        // Try to reconnect
        connectToDiscord();

        return false;
      });
  } catch (error: any) {
    logger.error("Error in clearActivity:", {
      error: error.message,
      stack: error.stack,
    });

    // If we get an error here, the connection might be broken
    logger.warn("Discord connection appears broken, attempting to reconnect");
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
