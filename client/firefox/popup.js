// DOM Elements
const discordStatusEl = document.getElementById("discord-status");
const serverStatusEl = document.getElementById("server-status");
const toggleEl = document.getElementById("presence-toggle");
const previewTitleEl = document.getElementById("preview-title");
const previewUrlEl = document.getElementById("preview-url");
const prefixTextEl = document.getElementById("prefix-text");
const continuousTimerToggleEl = document.getElementById(
  "continuous-timer-toggle"
);
const savePreferencesBtn = document.getElementById("save-preferences");
const resetPreferencesBtn = document.getElementById("reset-preferences");

// Site list elements
const disabledSitesListEl = document.getElementById("disabled-sites-list");
const alwaysEnabledSitesListEl = document.getElementById(
  "always-enabled-sites-list"
);
const disabledSiteInputEl = document.getElementById("disabled-site-input");
const alwaysEnabledSiteInputEl = document.getElementById(
  "always-enabled-site-input"
);
const addDisabledSiteBtn = document.getElementById("add-disabled-site");
const addAlwaysEnabledSiteBtn = document.getElementById(
  "add-always-enabled-site"
);
const addCurrentToDisabledBtn = document.getElementById(
  "add-current-to-disabled"
);
const addCurrentToAlwaysEnabledBtn = document.getElementById(
  "add-current-to-always-enabled"
);

// State
let isEnabled = true;
let isConnected = false;
let userPreferences = {
  prefixText: "Viewing",
  disabledSites: [],
  alwaysEnabledSites: [],
  continuousTimer: true,
};

// Initialize popup
async function initializePopup() {
  // Get current state from background script
  try {
    const response = await browser.runtime.sendMessage({ action: "getState" });
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

    // Update continuous timer toggle
    continuousTimerToggleEl.checked = userPreferences.continuousTimer !== false;

    // Update site lists
    updateSiteLists();
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
    const response = await fetch("http://localhost:8874/api/status");
    const data = await response.json();

    // Update Discord connection status
    discordStatusEl.className = data.discordConnected
      ? "status-indicator connected"
      : "status-indicator";

    // Also update the server connection status
    serverStatusEl.className = data.running
      ? "status-indicator connected"
      : "status-indicator";

    // Update the presence toggle to match server state
    if (toggleEl.checked !== data.presenceEnabled) {
      toggleEl.checked = data.presenceEnabled;
      isEnabled = data.presenceEnabled;
    }

    // Update user preferences if available
    if (data.preferences) {
      userPreferences = data.preferences;
      updateSiteLists();
    }
  } catch (error) {
    console.warn("Unable to connect to server:", error);
    discordStatusEl.className = "status-indicator";
    serverStatusEl.className = "status-indicator";
  }
}

// Update preview with current tab info
async function updatePreviewFromCurrentTab() {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs.length > 0) {
      const tab = tabs[0];

      // Only show preview for http/https pages
      if (tab.url.startsWith("http")) {
        // Format title with customized prefix
        const prefix = userPreferences.prefixText || "Viewing";
        previewTitleEl.textContent = `${prefix} - ${
          tab.title.length > 25 ? tab.title.substring(0, 22) + "..." : tab.title
        }`;

        // Extract domain
        const url = new URL(tab.url);
        previewUrlEl.textContent = `${url.hostname}`;
      } else {
        const prefix = userPreferences.prefixText || "Viewing";
        previewTitleEl.textContent = `${prefix} - Not available`;
        previewUrlEl.textContent = "Not available";
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
    const response = await browser.runtime.sendMessage({
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
    userPreferences.continuousTimer = continuousTimerToggleEl.checked;

    // Send to background script
    const response = await browser.runtime.sendMessage({
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
    const response = await browser.runtime.sendMessage({
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

// Update site lists in the UI
function updateSiteLists() {
  // Update disabled sites list
  disabledSitesListEl.innerHTML = "";
  if (
    userPreferences.disabledSites &&
    userPreferences.disabledSites.length > 0
  ) {
    userPreferences.disabledSites.forEach((site) => {
      const siteItem = document.createElement("div");
      siteItem.className = "site-item";

      const siteDomain = document.createElement("span");
      siteDomain.className = "site-domain";
      siteDomain.textContent = site;

      const removeButton = document.createElement("button");
      removeButton.className = "remove-site";
      removeButton.innerHTML = '<i class="fas fa-times"></i>';
      removeButton.addEventListener("click", () => removeDisabledSite(site));

      siteItem.appendChild(siteDomain);
      siteItem.appendChild(removeButton);
      disabledSitesListEl.appendChild(siteItem);
    });
  } else {
    disabledSitesListEl.innerHTML =
      '<div class="empty-list-message">No sites added</div>';
  }

  // Update always enabled sites list
  alwaysEnabledSitesListEl.innerHTML = "";
  if (
    userPreferences.alwaysEnabledSites &&
    userPreferences.alwaysEnabledSites.length > 0
  ) {
    userPreferences.alwaysEnabledSites.forEach((site) => {
      const siteItem = document.createElement("div");
      siteItem.className = "site-item";

      const siteDomain = document.createElement("span");
      siteDomain.className = "site-domain";
      siteDomain.textContent = site;

      const removeButton = document.createElement("button");
      removeButton.className = "remove-site";
      removeButton.innerHTML = '<i class="fas fa-times"></i>';
      removeButton.addEventListener("click", () =>
        removeAlwaysEnabledSite(site)
      );

      siteItem.appendChild(siteDomain);
      siteItem.appendChild(removeButton);
      alwaysEnabledSitesListEl.appendChild(siteItem);
    });
  } else {
    alwaysEnabledSitesListEl.innerHTML =
      '<div class="empty-list-message">No sites added</div>';
  }
}

// Add a site to the disabled list
async function addDisabledSite(domain) {
  if (!domain) return;

  // Clean up domain (remove protocol, path, etc.)
  domain = cleanDomain(domain);

  try {
    const response = await browser.runtime.sendMessage({
      action: "addDisabledSite",
      domain: domain,
    });

    updateState(response);
    disabledSiteInputEl.value = "";
  } catch (error) {
    console.warn("Unable to add disabled site:", error);
  }
}

// Remove a site from the disabled list
async function removeDisabledSite(domain) {
  try {
    const response = await browser.runtime.sendMessage({
      action: "removeDisabledSite",
      domain: domain,
    });

    updateState(response);
  } catch (error) {
    console.warn("Unable to remove disabled site:", error);
  }
}

// Add a site to the always enabled list
async function addAlwaysEnabledSite(domain) {
  if (!domain) return;

  // Clean up domain (remove protocol, path, etc.)
  domain = cleanDomain(domain);

  try {
    const response = await browser.runtime.sendMessage({
      action: "addAlwaysEnabledSite",
      domain: domain,
    });

    updateState(response);
    alwaysEnabledSiteInputEl.value = "";
  } catch (error) {
    console.warn("Unable to add always enabled site:", error);
  }
}

// Remove a site from the always enabled list
async function removeAlwaysEnabledSite(domain) {
  try {
    const response = await browser.runtime.sendMessage({
      action: "removeAlwaysEnabledSite",
      domain: domain,
    });

    updateState(response);
  } catch (error) {
    console.warn("Unable to remove always enabled site:", error);
  }
}

// Add current site to disabled list
async function addCurrentSiteToDisabled() {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs.length > 0 && tabs[0].url.startsWith("http")) {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;

      addDisabledSite(domain);
    }
  } catch (error) {
    console.warn("Unable to add current site to disabled list:", error);
  }
}

// Add current site to always enabled list
async function addCurrentSiteToAlwaysEnabled() {
  try {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tabs.length > 0 && tabs[0].url.startsWith("http")) {
      const url = new URL(tabs[0].url);
      const domain = url.hostname;

      addAlwaysEnabledSite(domain);
    }
  } catch (error) {
    console.warn("Unable to add current site to always enabled list:", error);
  }
}

// Clean domain (remove protocol, path, etc.)
function cleanDomain(input) {
  try {
    // If it's already a valid URL, extract the hostname
    if (input.startsWith("http")) {
      return new URL(input).hostname;
    }

    // If it's just a domain, return as is
    return input.trim();
  } catch (e) {
    // If parsing fails, just return the trimmed input
    return input.trim();
  }
}

// Toggle continuous timer
async function toggleContinuousTimer() {
  try {
    const newState = continuousTimerToggleEl.checked;

    // Send to background script
    const response = await browser.runtime.sendMessage({
      action: "toggleContinuousTimer",
      enabled: newState,
    });

    // Update UI with response
    updateState(response);
  } catch (error) {
    console.warn("Unable to toggle continuous timer:", error);
    // Revert toggle if there was an error
    continuousTimerToggleEl.checked = userPreferences.continuousTimer;
  }
}

// Add event listeners
toggleEl.addEventListener("change", togglePresence);
continuousTimerToggleEl.addEventListener("change", toggleContinuousTimer);
savePreferencesBtn.addEventListener("click", savePreferences);
resetPreferencesBtn.addEventListener("click", resetPreferences);

// Add site list event listeners
addDisabledSiteBtn.addEventListener("click", () =>
  addDisabledSite(disabledSiteInputEl.value)
);
addAlwaysEnabledSiteBtn.addEventListener("click", () =>
  addAlwaysEnabledSite(alwaysEnabledSiteInputEl.value)
);
addCurrentToDisabledBtn.addEventListener("click", addCurrentSiteToDisabled);
addCurrentToAlwaysEnabledBtn.addEventListener(
  "click",
  addCurrentSiteToAlwaysEnabled
);

// Handle Enter key in input fields
disabledSiteInputEl.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    addDisabledSite(disabledSiteInputEl.value);
  }
});

alwaysEnabledSiteInputEl.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    addAlwaysEnabledSite(alwaysEnabledSiteInputEl.value);
  }
});

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", initializePopup);
