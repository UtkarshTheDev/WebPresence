/**
 * WebPresence API
 * 
 * This file exports the public API for the WebPresence package.
 */

import { 
  startServer, 
  stopServer, 
  isServerRunning, 
  getServerStatus, 
  togglePresence, 
  updatePreferences,
  config
} from './index.js';

// Re-export all public functions and types
export {
  startServer,
  stopServer,
  isServerRunning,
  getServerStatus,
  togglePresence,
  updatePreferences,
  config
};

// Export types for configuration
export type UserPreferences = {
  prefixText: string;
  disabledSites: string[];
  alwaysEnabledSites: string[];
  continuousTimer: boolean;
};

export type ServerConfig = {
  port: number;
  activityTimeout: number;
  inactiveCheckInterval: number;
};

export type DiscordConfig = {
  clientId: string;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
};

export type PresenceConfig = {
  enabled: boolean;
  defaultPrefix: string;
  creditText: string;
  buttons: Array<{
    label: string;
    url: string;
  }>;
  largeImageKey: string;
  smallImageKey: string;
  smallImageText: string;
};

// Export a default object for easier imports
export default {
  startServer,
  stopServer,
  isServerRunning,
  getServerStatus,
  togglePresence,
  updatePreferences,
  config
};
