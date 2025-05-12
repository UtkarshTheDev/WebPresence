// Configuration
const SERVER_URL = "ws://localhost:8874";
let websocket = null;
let connected = false;
let enabled = true;
let currentTabId = null;
let reconnectAttempts = 0;
let reconnectInterval = null;
let heartbeatInterval = null;
const HEARTBEAT_INTERVAL = 45000; // 45 seconds heartbeat
const MAX_RECONNECT_ATTEMPTS = 20; // Maximum number of reconnection attempts before slowing down
const MAX_RECONNECT_DELAY = 60000; // Maximum delay between reconnection attempts (1 minute)
let lastAlwaysEnabledSite = null; // Track the last always-enabled site
let lastError = null; // Track the last error for debugging

// User preferences
let userPreferences = {
  prefixText: "Viewing",
  disabledSites: [], // Sites where presence should be disabled
  alwaysEnabledSites: [], // Sites where presence should always be shown
  continuousTimer: true, // Keep timer running when switching tabs (enabled by default)
};

// Initialize the extension
async function initialize() {
  // Load settings from storage
  const data = await chrome.storage.local.get(["enabled", "userPreferences"]);
  enabled = data.enabled !== undefined ? data.enabled : true;

  // Load user preferences if available
  if (data.userPreferences) {
    userPreferences = data.userPreferences;
  }

  // Connect to WebSocket server
  connectWebSocket();

  // Set up tab change listener
  chrome.tabs.onActivated.addListener(handleTabChange);
  chrome.tabs.onUpdated.addListener(handleTabUpdate);
}

// Connect to the WebSocket server with enhanced error handling
function connectWebSocket() {
  // Prevent multiple connection attempts
  if (
    websocket &&
    (websocket.readyState === WebSocket.OPEN ||
      websocket.readyState === WebSocket.CONNECTING)
  ) {
    console.log(
      "WebSocket already connected or connecting, skipping connection attempt"
    );
    return;
  }

  try {
    console.log(`Connecting to WebSocket server at ${SERVER_URL}...`);
    websocket = new WebSocket(SERVER_URL);

    // Connection successful
    websocket.onopen = () => {
      console.log("✅ Connected to WebSocket server");
      connected = true;
      reconnectAttempts = 0;
      lastError = null;

      // Clear reconnect interval if it exists
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }

      // Start heartbeat mechanism
      startHeartbeat();

      // Send current tab information if enabled
      if (enabled) {
        try {
          sendCurrentTabInfo();
        } catch (error) {
          console.error("Error sending initial tab info:", error);
          // Non-critical error, continue execution
        }
      }
    };

    // Handle incoming messages with robust error handling
    websocket.onmessage = (event) => {
      try {
        // Parse message
        const message = JSON.parse(event.data);

        // Process message based on type
        if (message.type === "state") {
          // Update enabled state if it's different from server
          if (message.enabled !== enabled) {
            enabled = message.enabled;
            try {
              chrome.storage.local.set({ enabled });
            } catch (storageError) {
              console.warn(
                "Failed to save enabled state to storage:",
                storageError
              );
              // Non-critical error, continue execution
            }
          }

          // Update preferences if provided
          if (message.preferences) {
            userPreferences = message.preferences;
            try {
              chrome.storage.local.set({ userPreferences });
            } catch (storageError) {
              console.warn(
                "Failed to save preferences to storage:",
                storageError
              );
              // Non-critical error, continue execution
            }
          }
        } else if (message.type === "pong") {
          // Heartbeat response received
          console.log("Heartbeat acknowledged by server");
        } else {
          console.log(`Received message of type: ${message.type}`);
        }
      } catch (error) {
        console.warn("Unable to parse WebSocket message:", error);
        console.log(
          "Raw message:",
          event.data ? event.data.substring(0, 100) : "empty"
        );
        // Non-critical error, continue execution
      }
    };

    // Handle connection close with reconnection logic
    websocket.onclose = (event) => {
      const reason = event.reason || "No reason provided";
      const code = event.code || "No code provided";
      console.log(
        `Disconnected from WebSocket server (Code: ${code}, Reason: ${reason})`
      );
      connected = false;

      // Stop heartbeat
      stopHeartbeat();

      // Implement reconnection with exponential backoff
      if (!reconnectInterval) {
        reconnectInterval = setInterval(() => {
          // Increment attempt counter
          reconnectAttempts++;

          // Calculate delay with capped exponential backoff
          let delay;
          if (reconnectAttempts > MAX_RECONNECT_ATTEMPTS) {
            // After max attempts, use a consistent longer delay
            delay = MAX_RECONNECT_DELAY;
            console.log(
              `Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) exceeded, using consistent delay`
            );
          } else {
            // Exponential backoff with maximum cap
            delay = Math.min(
              MAX_RECONNECT_DELAY,
              Math.pow(2, Math.min(reconnectAttempts, 10)) * 1000
            );
          }

          console.log(
            `Attempting to reconnect (attempt ${reconnectAttempts}) in ${
              delay / 1000
            } seconds...`
          );

          // Attempt reconnection
          try {
            connectWebSocket();
          } catch (reconnectError) {
            console.error("Error during reconnection attempt:", reconnectError);
            // Continue with next attempt despite errors
          }
        }, Math.min(MAX_RECONNECT_DELAY, Math.pow(2, Math.min(reconnectAttempts, 10)) * 1000));
      }
    };

    // Handle connection errors
    websocket.onerror = (error) => {
      lastError = error;
      console.error("WebSocket connection error:", error);
      // The onclose handler will be called after this and handle reconnection
    };
  } catch (error) {
    console.error("Failed to create WebSocket connection:", error);
    connected = false;

    // Set up reconnection if not already in progress
    if (!reconnectInterval) {
      reconnectInterval = setInterval(() => {
        reconnectAttempts++;
        console.log(
          `Attempting to reconnect after error (attempt ${reconnectAttempts})...`
        );
        try {
          connectWebSocket();
        } catch (reconnectError) {
          console.error("Error during reconnection attempt:", reconnectError);
          // Continue with next attempt despite errors
        }
      }, Math.min(MAX_RECONNECT_DELAY, Math.pow(2, Math.min(reconnectAttempts, 10)) * 1000));
    }
  }
}

// Toggle presence state
function togglePresence(state) {
  enabled = state;
  chrome.storage.local.set({ enabled });

  if (connected) {
    websocket.send(
      JSON.stringify({
        type: "toggle",
        enabled,
      })
    );

    // Reset the last always-enabled site tracking when disabling
    if (!enabled) {
      lastAlwaysEnabledSite = null;
    }

    // Always send current tab info, even when disabled
    // sendCurrentTabInfo will check if the site is always enabled
    sendCurrentTabInfo();
  }
}

// Handle active tab change
function handleTabChange(activeInfo) {
  currentTabId = activeInfo.tabId;
  if (connected) {
    // Always send tab info, sendCurrentTabInfo will check if the site is always enabled
    sendCurrentTabInfo();
  }
}

// Handle tab updates
function handleTabUpdate(tabId, changeInfo, tab) {
  if (tabId === currentTabId && changeInfo.status === "complete" && connected) {
    // Always send tab info, sendCurrentTabInfo will check if the site is always enabled
    sendCurrentTabInfo();
  }
}

// Send current tab information to the server with enhanced error handling
async function sendCurrentTabInfo() {
  // Don't attempt to send if not connected
  if (!connected || !websocket || websocket.readyState !== WebSocket.OPEN) {
    console.log("Not connected to server, skipping tab info update");
    return;
  }

  try {
    // Get current tab ID if not already set
    if (!currentTabId) {
      try {
        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tabs.length === 0) {
          console.log("No active tabs found");
          return;
        }
        currentTabId = tabs[0].id;
      } catch (queryError) {
        console.error("Error querying tabs:", queryError);
        return;
      }
    }

    // Get tab information
    let tab;
    try {
      tab = await chrome.tabs.get(currentTabId);
    } catch (tabError) {
      console.error("Error getting tab info:", tabError);
      // Tab might have been closed or doesn't exist
      currentTabId = null;
      return;
    }

    // Skip sending for chrome:// urls, extension pages, etc.
    if (!tab.url || !tab.url.startsWith("http")) {
      console.log("Skipping non-http URL:", tab.url);
      return;
    }

    // Extract domain from URL for client-side checks with error handling
    let domain = "";
    try {
      domain = new URL(tab.url).hostname;
    } catch (urlError) {
      console.warn("Error parsing URL:", urlError);
      domain = tab.url;
    }

    // Check if domain is in disabled sites list (client-side check)
    const isDisabled = userPreferences.disabledSites.some((site) =>
      domain.includes(site)
    );

    // Check if domain is in always enabled sites list (client-side check)
    const isAlwaysEnabled = userPreferences.alwaysEnabledSites.some((site) =>
      domain.includes(site)
    );

    // Skip if disabled and not always enabled (client-side optimization)
    if (isDisabled && !isAlwaysEnabled) {
      console.log(`Skipping presence for disabled site: ${domain}`);

      // If we were previously showing an always-enabled site, clear it
      if (lastAlwaysEnabledSite && websocket.readyState === WebSocket.OPEN) {
        try {
          websocket.send(JSON.stringify({ type: "clearPresence" }));
          lastAlwaysEnabledSite = null;
        } catch (sendError) {
          console.error("Error sending clearPresence message:", sendError);
        }
      }

      return;
    }

    // Handle presence disabled case
    if (!enabled) {
      // If site is not always enabled, skip it
      if (!isAlwaysEnabled) {
        // If we were previously showing an always-enabled site, clear it
        if (lastAlwaysEnabledSite && websocket.readyState === WebSocket.OPEN) {
          try {
            websocket.send(JSON.stringify({ type: "clearPresence" }));
            lastAlwaysEnabledSite = null;
          } catch (sendError) {
            console.error("Error sending clearPresence message:", sendError);
          }
        }

        return;
      }

      // Site is always enabled, track it
      lastAlwaysEnabledSite = domain;
      console.log(`Always-enabled site detected: ${domain}`);
    } else {
      // Presence is enabled, reset tracking
      lastAlwaysEnabledSite = null;
    }

    // Send presence update with error handling
    if (tab && websocket.readyState === WebSocket.OPEN) {
      try {
        const message = {
          type: "presence",
          title: tab.title || "Unknown",
          url: tab.url,
          faviconUrl: tab.favIconUrl || "",
          preferences: userPreferences, // Send user preferences with presence update
        };

        websocket.send(JSON.stringify(message));
        console.log(`Sent presence update for: ${domain}`);
      } catch (sendError) {
        console.error("Error sending presence update:", sendError);

        // If there's a WebSocket error, it might need reconnection
        if (sendError.name === "InvalidStateError") {
          console.log(
            "WebSocket appears to be in an invalid state, reconnecting..."
          );
          connected = false;

          // Force reconnection
          try {
            websocket.close();
          } catch (closeError) {
            console.warn("Error closing broken WebSocket:", closeError);
          }

          // Attempt to reconnect
          setTimeout(connectWebSocket, 1000);
        }
      }
    }
  } catch (error) {
    console.error("Error in sendCurrentTabInfo:", error);
    // Non-critical error, continue execution
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "getState") {
    sendResponse({
      enabled,
      connected,
      preferences: userPreferences,
    });
  } else if (message.action === "toggle") {
    togglePresence(message.enabled);
    sendResponse({
      enabled,
      connected,
      preferences: userPreferences,
    });
  } else if (message.action === "updatePreferences") {
    // Update preferences
    userPreferences = message.preferences;
    chrome.storage.local.set({ userPreferences });

    // Send to server if connected
    if (connected && websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          type: "updatePreferences",
          preferences: userPreferences,
        })
      );

      // Always update presence with new preferences
      // sendCurrentTabInfo will check if the site is always enabled
      sendCurrentTabInfo();
    }

    sendResponse({
      enabled,
      connected,
      preferences: userPreferences,
    });
  } else if (message.action === "resetPreferences") {
    // Reset to default
    userPreferences = {
      prefixText: "Viewing",
      disabledSites: [],
      alwaysEnabledSites: [],
      continuousTimer: true,
    };
    chrome.storage.local.set({ userPreferences });

    // Send to server if connected
    if (connected && websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          type: "updatePreferences",
          preferences: userPreferences,
        })
      );

      // Always update presence with new preferences
      // sendCurrentTabInfo will check if the site is always enabled
      sendCurrentTabInfo();
    }

    sendResponse({
      enabled,
      connected,
      preferences: userPreferences,
    });
  } else if (message.action === "addDisabledSite") {
    // Add site to disabled list
    const domain = message.domain;
    if (domain && !userPreferences.disabledSites.includes(domain)) {
      userPreferences.disabledSites.push(domain);
      chrome.storage.local.set({ userPreferences });

      // Send to server if connected
      if (connected && websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(
          JSON.stringify({
            type: "updatePreferences",
            preferences: userPreferences,
          })
        );
      }
    }

    sendResponse({
      enabled,
      connected,
      preferences: userPreferences,
    });
  } else if (message.action === "removeDisabledSite") {
    // Remove site from disabled list
    const domain = message.domain;
    userPreferences.disabledSites = userPreferences.disabledSites.filter(
      (site) => site !== domain
    );
    chrome.storage.local.set({ userPreferences });

    // Send to server if connected
    if (connected && websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          type: "updatePreferences",
          preferences: userPreferences,
        })
      );

      // Always update presence with new preferences
      // sendCurrentTabInfo will check if the site is always enabled
      sendCurrentTabInfo();
    }

    sendResponse({
      enabled,
      connected,
      preferences: userPreferences,
    });
  } else if (message.action === "addAlwaysEnabledSite") {
    // Add site to always enabled list
    const domain = message.domain;
    if (domain && !userPreferences.alwaysEnabledSites.includes(domain)) {
      userPreferences.alwaysEnabledSites.push(domain);
      chrome.storage.local.set({ userPreferences });

      // Send to server if connected
      if (connected && websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(
          JSON.stringify({
            type: "updatePreferences",
            preferences: userPreferences,
          })
        );
      }
    }

    sendResponse({
      enabled,
      connected,
      preferences: userPreferences,
    });
  } else if (message.action === "removeAlwaysEnabledSite") {
    // Remove site from always enabled list
    const domain = message.domain;
    userPreferences.alwaysEnabledSites =
      userPreferences.alwaysEnabledSites.filter((site) => site !== domain);
    chrome.storage.local.set({ userPreferences });

    // Send to server if connected
    if (connected && websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          type: "updatePreferences",
          preferences: userPreferences,
        })
      );

      // Always update presence with new preferences
      // sendCurrentTabInfo will check if the site is always enabled
      sendCurrentTabInfo();
    }

    sendResponse({
      enabled,
      connected,
      preferences: userPreferences,
    });
  } else if (message.action === "toggleContinuousTimer") {
    // Toggle continuous timer
    userPreferences.continuousTimer = message.enabled;
    chrome.storage.local.set({ userPreferences });

    // Send to server if connected
    if (connected && websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          type: "updatePreferences",
          preferences: userPreferences,
        })
      );
    }

    sendResponse({
      enabled,
      connected,
      preferences: userPreferences,
    });
  }
  return true;
});

// Start heartbeat mechanism with enhanced error handling
function startHeartbeat() {
  // Clear any existing heartbeat
  stopHeartbeat();

  // Set up new heartbeat interval with error handling
  heartbeatInterval = setInterval(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      try {
        console.log("Sending heartbeat to server");
        websocket.send(JSON.stringify({ type: "ping" }));
      } catch (error) {
        console.error("Error sending heartbeat:", error);

        // If there's a WebSocket error, it might need reconnection
        if (error.name === "InvalidStateError") {
          console.log(
            "WebSocket appears to be in an invalid state during heartbeat, reconnecting..."
          );
          connected = false;

          // Force reconnection
          try {
            websocket.close();
          } catch (closeError) {
            console.warn("Error closing broken WebSocket:", closeError);
          }

          // Stop heartbeat as we're reconnecting
          stopHeartbeat();

          // Attempt to reconnect
          setTimeout(connectWebSocket, 1000);
        }
      }
    } else if (websocket && websocket.readyState === WebSocket.CLOSED) {
      console.log(
        "WebSocket closed during heartbeat interval, attempting to reconnect"
      );
      connected = false;

      // Stop heartbeat as we're reconnecting
      stopHeartbeat();

      // Attempt to reconnect
      setTimeout(connectWebSocket, 1000);
    }
  }, HEARTBEAT_INTERVAL);

  console.log(
    `Heartbeat mechanism started (interval: ${HEARTBEAT_INTERVAL}ms)`
  );
}

// Stop heartbeat mechanism
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    console.log("Heartbeat mechanism stopped");
  }
}

// Initialize on startup
initialize();
