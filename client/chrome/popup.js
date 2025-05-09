// DOM Elements
const discordStatusEl = document.getElementById("discord-status");
const serverStatusEl = document.getElementById("server-status");
const toggleEl = document.getElementById("presence-toggle");
const previewTitleEl = document.getElementById("preview-title");
const previewUrlEl = document.getElementById("preview-url");
const prefixTextEl = document.getElementById("prefix-text");
const savePreferencesBtn = document.getElementById("save-preferences");
const resetPreferencesBtn = document.getElementById("reset-preferences");

// State
let isEnabled = true;
let isConnected = false;
let userPreferences = {
  prefixText: "Viewing",
};

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
function updateState({ enabled, connected, preferences }) {
  isEnabled = enabled;
  isConnected = connected;

  // Update user preferences if provided
  if (preferences) {
    userPreferences = preferences;

    // Update form fields with current preferences
    prefixTextEl.value = userPreferences.prefixText || "Viewing";
  }

  // Update toggle
  toggleEl.checked = isEnabled;

  // Update status indicators
  serverStatusEl.className = isConnected
    ? "status-indicator connected"
    : "status-indicator";

  // Make a request to check if Discord is connected
  checkDiscordConnection();

  // Update preview with current tab info
  updatePreviewFromCurrentTab();
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
        // Format title with customized prefix
        const prefix = userPreferences.prefixText || "Viewing";
        previewTitleEl.textContent = `${prefix} - ${
          tab.title.length > 30 ? tab.title.substring(0, 27) + "..." : tab.title
        }`;

        // Extract domain and add the credit (changed to "by utkarsh tiwari")
        const url = new URL(tab.url);
        previewUrlEl.textContent = `${url.hostname} - by utkarsh tiwari`;
      } else {
        const prefix = userPreferences.prefixText || "Viewing";
        previewTitleEl.textContent = `${prefix} - Not available`;
        previewUrlEl.textContent = "Not available - by utkarsh tiwari";
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

// Save user preferences
async function savePreferences() {
  try {
    // Update local preferences
    userPreferences.prefixText = prefixTextEl.value || "Viewing";

    // Send to background script
    const response = await chrome.runtime.sendMessage({
      action: "updatePreferences",
      preferences: userPreferences,
    });

    // Update UI with response
    updateState(response);

    // Show success indicator
    savePreferencesBtn.classList.add("success");
    setTimeout(() => {
      savePreferencesBtn.classList.remove("success");
    }, 1500);
  } catch (error) {
    console.warn("Unable to save preferences:", error);
  }
}

// Reset preferences to defaults
async function resetPreferences() {
  try {
    // Reset form fields
    prefixTextEl.value = "Viewing";

    // Send reset request to background script
    const response = await chrome.runtime.sendMessage({
      action: "resetPreferences",
    });

    // Update UI with response
    updateState(response);

    // Show success indicator
    resetPreferencesBtn.classList.add("success");
    setTimeout(() => {
      resetPreferencesBtn.classList.remove("success");
    }, 1500);
  } catch (error) {
    console.warn("Unable to reset preferences:", error);
  }
}

// Add event listeners
toggleEl.addEventListener("change", togglePresence);
savePreferencesBtn.addEventListener("click", savePreferences);
resetPreferencesBtn.addEventListener("click", resetPreferences);

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", initializePopup);
