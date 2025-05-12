/**
 * Logger utility for Web Presence server
 *
 * Provides consistent logging with different levels and formatting
 * Supports both standard logging and CLI-friendly colored output
 */

import chalk from "chalk";

// Log levels
enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

// Logger interface
interface Logger {
  error: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
  // Special methods for CLI-friendly logging
  success: (message: string) => void;
  important: (message: string) => void;
  // Control verbosity
  setVerbose: (verbose: boolean) => void;
  isVerbose: () => boolean;
}

// Format timestamp for logs
function formatTimestamp(): string {
  return new Date().toISOString();
}

// Format log message for file/standard logging
function formatLogMessage(
  level: LogLevel,
  message: string,
  meta?: any
): string {
  const timestamp = formatTimestamp();
  let logMessage = `[${timestamp}] [${level}] ${message}`;

  if (meta) {
    try {
      if (typeof meta === "string") {
        logMessage += ` - ${meta}`;
      } else {
        logMessage += ` - ${JSON.stringify(meta)}`;
      }
    } catch (error) {
      logMessage += ` - [Error serializing metadata: ${error}]`;
    }
  }

  return logMessage;
}

// Determine if we're running in CLI mode
const isRunningAsCLI =
  process.argv.length > 1 && process.argv[1].includes("cli");

// Default verbosity - less verbose when running as CLI
let verbose = !isRunningAsCLI;

// Create logger instance
const logger: Logger = {
  error: (message: string, meta?: any) => {
    // Always show errors
    if (isRunningAsCLI) {
      console.error(chalk.red(`ERROR: ${message}`));
      if (verbose && meta) {
        console.error(chalk.gray(JSON.stringify(meta, null, 2)));
      }
    } else {
      console.error(formatLogMessage(LogLevel.ERROR, message, meta));
    }
  },

  warn: (message: string, meta?: any) => {
    if (isRunningAsCLI) {
      if (
        verbose ||
        message.includes("Discord") ||
        message.includes("connection")
      ) {
        console.warn(chalk.yellow(`WARNING: ${message}`));
        if (verbose && meta) {
          console.warn(chalk.gray(JSON.stringify(meta, null, 2)));
        }
      }
    } else {
      console.warn(formatLogMessage(LogLevel.WARN, message, meta));
    }
  },

  info: (message: string, meta?: any) => {
    if (isRunningAsCLI) {
      // Only show important info messages in CLI mode unless verbose
      const isImportant =
        message.includes("Server") ||
        message.includes("Discord") ||
        message.includes("connected") ||
        message.includes("presence");

      if (verbose || isImportant) {
        // Don't show timestamps and other noise in CLI mode
        console.log(chalk.blue(message));
        if (verbose && meta) {
          console.log(chalk.gray(JSON.stringify(meta, null, 2)));
        }
      }
    } else {
      console.log(formatLogMessage(LogLevel.INFO, message, meta));
    }
  },

  debug: (message: string, meta?: any) => {
    if (process.env.DEBUG) {
      if (isRunningAsCLI && verbose) {
        console.log(chalk.gray(`DEBUG: ${message}`));
        if (meta) {
          console.log(chalk.gray(JSON.stringify(meta, null, 2)));
        }
      } else if (!isRunningAsCLI) {
        console.log(formatLogMessage(LogLevel.DEBUG, message, meta));
      }
    }
  },

  // CLI-specific methods for better UX
  success: (message: string) => {
    console.log(chalk.green(message));
  },

  important: (message: string) => {
    console.log(chalk.cyan(message));
  },

  // Control verbosity
  setVerbose: (v: boolean) => {
    verbose = v;
  },

  isVerbose: () => verbose,
};

export { logger, LogLevel };
