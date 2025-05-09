// DOM Elements
const discordStatusEl = document.getElementById("discord-status");
const serverStatusEl = document.getElementById("server-status");
const toggleEl = document.getElementById("presence-toggle");
const previewTitleEl = document.getElementById("preview-title");
const previewUrlEl = document.getElementById("preview-url");

// State
let isEnabled = true;
let isConnected = false;

// Initialize popup
async function initializePopup() {
  // Get current state from background script
  try {
    const response = await chrome.runtime.sendMessage({ action: "getState" });
    updateState(response);

    // Update preview from current tab
    updatePreviewFromCurrentTab();
  } catch (error) {
    console.log("Extension state not available:", error);
  }
}

// Update the UI based on state
function updateState({ enabled, connected }) {
  isEnabled = enabled;
  isConnected = connected;

  // Update toggle
  toggleEl.checked = isEnabled;

  // Update status indicators
  serverStatusEl.className = isConnected
    ? "status-indicator connected"
    : "status-indicator";

  // Make a request to check if Discord is connected
  checkDiscordConnection();
}

// Check if the Discord connection is active
async function checkDiscordConnection() {
  try {
    const response = await fetch("http://localhost:3000/status");
    const data = await response.json();

    discordStatusEl.className = data.discordConnected
      ? "status-indicator connected"
      : "status-indicator";
  } catch (error) {
    console.warn("Unable to connect to server:", error);
    discordStatusEl.className = "status-indicator";
  }
}

// Update preview with current tab info
async function updatePreviewFromCurrentTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const tab = tabs[0];

      // Only show preview for http/https pages
      if (tab.url.startsWith("http")) {
        // Format title with "Viewing - " prefix
        previewTitleEl.textContent = `Viewing - ${
          tab.title.length > 30 ? tab.title.substring(0, 27) + "..." : tab.title
        }`;

        // Extract domain and add the credit
        const url = new URL(tab.url);
        previewUrlEl.textContent = `${url.hostname} - made by utkarsh tiwari`;
      } else {
        previewTitleEl.textContent = "Viewing - Not available";
        previewUrlEl.textContent = "Not available - made by utkarsh tiwari";
      }
    }
  } catch (error) {
    console.log("Tab info not available:", error);
  }
}

// Toggle presence state
async function togglePresence() {
  const newState = toggleEl.checked;

  try {
    const response = await chrome.runtime.sendMessage({
      action: "toggle",
      enabled: newState,
    });

    updateState(response);
  } catch (error) {
    console.warn("Unable to toggle presence:", error);
    // Revert toggle if there was an error
    toggleEl.checked = isEnabled;
  }
}

// Add event listeners
toggleEl.addEventListener("change", togglePresence);

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", initializePopup);
