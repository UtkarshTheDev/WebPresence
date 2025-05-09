// Configuration
const SERVER_URL = "ws://localhost:3000";
let websocket = null;
let connected = false;
let enabled = true;
let currentTabId = null;
let reconnectAttempts = 0;
let reconnectInterval = null;
let heartbeatInterval = null;
const HEARTBEAT_INTERVAL = 45000; // 45 seconds heartbeat

// User preferences
let userPreferences = {
  prefixText: "Viewing",
  disabledSites: [], // Sites where presence should be disabled
  alwaysEnabledSites: [], // Sites where presence should always be shown
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

// Connect to the WebSocket server
function connectWebSocket() {
  if (
    websocket &&
    (websocket.readyState === WebSocket.OPEN ||
      websocket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }

  websocket = new WebSocket(SERVER_URL);

  websocket.onopen = () => {
    console.log("Connected to WebSocket server");
    connected = true;
    reconnectAttempts = 0;

    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }

    // Start heartbeat
    startHeartbeat();

    // Send current tab information if enabled
    if (enabled) {
      sendCurrentTabInfo();
    }
  };

  websocket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);

      if (message.type === "state") {
        // Update enabled state if it's different from server
        if (message.enabled !== enabled) {
          enabled = message.enabled;
          chrome.storage.local.set({ enabled });
        }

        // Update preferences if provided
        if (message.preferences) {
          userPreferences = message.preferences;
          chrome.storage.local.set({ userPreferences });
        }
      }
    } catch (error) {
      console.log("Unable to parse WebSocket message:", error);
    }
  };

  websocket.onclose = () => {
    console.log("Disconnected from WebSocket server");
    connected = false;

    // Stop heartbeat
    stopHeartbeat();

    // Attempt to reconnect with exponential backoff
    if (!reconnectInterval) {
      reconnectInterval = setInterval(() => {
        reconnectAttempts++;
        const maxDelay = Math.min(30000, Math.pow(2, reconnectAttempts) * 1000);
        console.log(
          `Attempting to reconnect (attempt ${reconnectAttempts})...`
        );
        connectWebSocket();
      }, Math.min(30000, Math.pow(2, reconnectAttempts) * 1000));
    }
  };

  websocket.onerror = (error) => {
    console.warn("WebSocket connection issue:", error);
  };
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

// Send current tab information to the server
async function sendCurrentTabInfo() {
  if (!currentTabId) {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) return;
    currentTabId = tabs[0].id;
  }

  try {
    const tab = await chrome.tabs.get(currentTabId);
    // Skip sending for chrome:// urls, extension pages, etc.
    if (!tab.url.startsWith("http")) return;

    // Extract domain from URL for client-side checks
    let domain = "";
    try {
      domain = new URL(tab.url).hostname;
    } catch (e) {
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
      return;
    }

    // Skip if presence is disabled and site is not always enabled (client-side optimization)
    if (!enabled && !isAlwaysEnabled) {
      return;
    }

    if (tab && websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(
        JSON.stringify({
          type: "presence",
          title: tab.title,
          url: tab.url,
          faviconUrl: tab.favIconUrl,
          preferences: userPreferences, // Send user preferences with presence update
        })
      );
    }
  } catch (error) {
    console.log("Tab info not available:", error);
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
  }
  return true;
});

// Start heartbeat mechanism
function startHeartbeat() {
  // Clear any existing heartbeat
  stopHeartbeat();

  // Set up new heartbeat interval
  heartbeatInterval = setInterval(() => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      console.log("Sending heartbeat to server");
      websocket.send(JSON.stringify({ type: "ping" }));
    }
  }, HEARTBEAT_INTERVAL);
}

// Stop heartbeat mechanism
function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

// Initialize on startup
initialize();
