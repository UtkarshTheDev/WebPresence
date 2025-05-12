/**
 * CLI Types
 *
 * Type definitions for the WebPresence CLI.
 */

/**
 * Options for the start command
 */
export interface StartOptions {
  port?: number;
  daemon?: boolean;
}

/**
 * Options for the toggle command
 */
export interface ToggleOptions {
  on?: boolean;
  off?: boolean;
}

/**
 * Options for the config command
 */
export interface ConfigOptions {
  view?: boolean;
  prefix?: string;
  disableSite?: string;
  enableSite?: string;
  alwaysShow?: string;
  removeAlwaysShow?: string;
  continuousTimer?: boolean;
}

/**
 * Result of a CLI command
 */
export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}
