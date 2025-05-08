// Configuration
const SERVER_URL = "ws://localhost:3000";
let websocket = null;
let connected = false;
let enabled = true;
let currentTabId = null;
let reconnectAttempts = 0;
let reconnectInterval = null;

// Initialize the extension
function initialize() {
  // Load settings from storage
  browser.storage.local.get(["enabled"]).then((data) => {
    enabled = data.enabled !== undefined ? data.enabled : true;

    // Connect to WebSocket server
    connectWebSocket();
  });

  // Set up tab change listener
  browser.tabs.onActivated.addListener(handleTabChange);
  browser.tabs.onUpdated.addListener(handleTabUpdate);
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
          browser.storage.local.set({ enabled });
        }
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  };

  websocket.onclose = () => {
    console.log("Disconnected from WebSocket server");
    connected = false;

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
    console.error("WebSocket error:", error);
  };
}

// Toggle presence state
function togglePresence(state) {
  enabled = state;
  browser.storage.local.set({ enabled });

  if (connected) {
    websocket.send(
      JSON.stringify({
        type: "toggle",
        enabled,
      })
    );

    if (enabled) {
      sendCurrentTabInfo();
    }
  }
}

// Handle active tab change
function handleTabChange(activeInfo) {
  currentTabId = activeInfo.tabId;
  if (enabled && connected) {
    sendCurrentTabInfo();
  }
}

// Handle tab updates
function handleTabUpdate(tabId, changeInfo, tab) {
  if (
    tabId === currentTabId &&
    changeInfo.status === "complete" &&
    enabled &&
    connected
  ) {
    sendCurrentTabInfo();
  }
}

// Send current tab information to the server
function sendCurrentTabInfo() {
  if (!currentTabId) {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs.length === 0) return;
      currentTabId = tabs[0].id;
      getAndSendTabInfo(currentTabId);
    });
  } else {
    getAndSendTabInfo(currentTabId);
  }
}

function getAndSendTabInfo(tabId) {
  browser.tabs
    .get(tabId)
    .then((tab) => {
      // Skip sending for about:, moz-extension://, etc. urls
      if (!tab.url.startsWith("http")) return;

      if (tab && websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(
          JSON.stringify({
            type: "presence",
            title: tab.title,
            url: tab.url,
            faviconUrl: tab.favIconUrl,
          })
        );
      }
    })
    .catch((error) => {
      console.error("Error getting tab info:", error);
    });
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getState") {
    return Promise.resolve({ enabled, connected });
  } else if (message.action === "toggle") {
    togglePresence(message.enabled);
    return Promise.resolve({ enabled, connected });
  }
});

// Initialize on startup
initialize();
