// Configuration module for Web Presence server

// Default configuration values
const defaultConfig = {
  // Discord RPC configuration
  discord: {
    clientId: "1370122815273046117", // Pre-registered ID for Web Presence
    reconnectAttempts: 0,
    maxReconnectAttempts: 10,
  },
  
  // Server configuration
  server: {
    port: 3000,
    activityTimeout: 45000, // 45 seconds timeout for client activity
    inactiveCheckInterval: 15000, // Check for inactive clients every 15 seconds
  },
  
  // Presence configuration
  presence: {
    enabled: true,
    defaultPrefix: "Viewing", // Default prefix for details text
    creditText: "by utkarsh tiwari", // Credit text to show in state
    buttons: [
      {
        label: "GitHub Repository",
        url: "https://github.com/utkarshthedev/webpresence",
      },
      {
        label: "Follow on Twitter",
        url: "https://twitter.com/utkarshthedev",
      },
    ],
    largeImageKey: "web",
    smallImageKey: "me",
    smallImageText: "Utkarsh Tiwari",
  },
};

// Runtime configuration that can be modified
const runtimeConfig = {
  ...defaultConfig,
  
  // User preferences that can be customized
  userPreferences: {
    prefixText: defaultConfig.presence.defaultPrefix,
  },
};

// Export configuration
export const config = {
  // Get the current configuration
  get: () => runtimeConfig,
  
  // Get Discord configuration
  getDiscord: () => runtimeConfig.discord,
  
  // Get server configuration
  getServer: () => runtimeConfig.server,
  
  // Get presence configuration
  getPresence: () => runtimeConfig.presence,
  
  // Get user preferences
  getUserPreferences: () => runtimeConfig.userPreferences,
  
  // Update user preferences
  updateUserPreferences: (preferences: Partial<typeof runtimeConfig.userPreferences>) => {
    runtimeConfig.userPreferences = {
      ...runtimeConfig.userPreferences,
      ...preferences,
    };
    return runtimeConfig.userPreferences;
  },
  
  // Reset user preferences to defaults
  resetUserPreferences: () => {
    runtimeConfig.userPreferences.prefixText = defaultConfig.presence.defaultPrefix;
    return runtimeConfig.userPreferences;
  },
};
