/**
 * Logger utility for Web Presence server
 * 
 * Provides consistent logging with different levels and formatting
 */

// Log levels
enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

// Logger interface
interface Logger {
  error: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  debug: (message: string, meta?: any) => void;
}

// Format timestamp for logs
function formatTimestamp(): string {
  return new Date().toISOString();
}

// Format log message
function formatLogMessage(level: LogLevel, message: string, meta?: any): string {
  const timestamp = formatTimestamp();
  let logMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (meta) {
    try {
      if (typeof meta === 'string') {
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

// Create logger instance
const logger: Logger = {
  error: (message: string, meta?: any) => {
    console.error(formatLogMessage(LogLevel.ERROR, message, meta));
  },
  
  warn: (message: string, meta?: any) => {
    console.warn(formatLogMessage(LogLevel.WARN, message, meta));
  },
  
  info: (message: string, meta?: any) => {
    console.log(formatLogMessage(LogLevel.INFO, message, meta));
  },
  
  debug: (message: string, meta?: any) => {
    if (process.env.DEBUG) {
      console.log(formatLogMessage(LogLevel.DEBUG, message, meta));
    }
  },
};

export { logger, LogLevel };
