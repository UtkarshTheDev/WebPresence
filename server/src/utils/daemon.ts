/**
 * Daemon utilities for WebPresence server
 *
 * Provides functionality for running the server as a background daemon process
 */

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { logger } from "./logger.js";
import { fileURLToPath } from "url";

// Get the directory where the daemon files will be stored
const DAEMON_DIR = path.join(os.homedir(), ".webpresence");
const PID_FILE = path.join(DAEMON_DIR, "webpresence.pid");
const LOG_FILE = path.join(DAEMON_DIR, "webpresence.log");

/**
 * Ensure the daemon directory exists
 */
function ensureDaemonDir() {
  if (!fs.existsSync(DAEMON_DIR)) {
    try {
      fs.mkdirSync(DAEMON_DIR, { recursive: true });
    } catch (error: any) {
      logger.error(`Failed to create daemon directory: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Start the server as a daemon process
 * @param options Options for starting the daemon
 * @returns Promise that resolves when the daemon is started
 */
export async function startDaemon(options: { port?: number } = {}) {
  // Ensure daemon directory exists
  ensureDaemonDir();

  // Check if daemon is already running
  if (isDaemonRunning()) {
    return { success: false, message: "Daemon is already running" };
  }

  try {
    // Build the command arguments
    const args = ["start"];
    if (options.port) {
      args.push("--port", options.port.toString());
    }

    // Log the daemon startup
    fs.appendFileSync(
      LOG_FILE,
      `[${new Date().toISOString()}] Starting WebPresence daemon\n`
    );

    // Get the path to the CLI script
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const cliPath = path.resolve(__dirname, "../../dist/cli.js");

    // Log the CLI path for debugging
    fs.appendFileSync(
      LOG_FILE,
      `[${new Date().toISOString()}] CLI path: ${cliPath}\n`
    );

    // For daemon mode, we'll use the standalone daemon script
    fs.appendFileSync(
      LOG_FILE,
      `[${new Date().toISOString()}] Starting daemon with standalone script\n`
    );

    // Get the path to the daemon script
    const __filename2 = fileURLToPath(import.meta.url);
    const __dirname2 = path.dirname(__filename2);
    const daemonPath = path.resolve(__dirname2, "../../dist/daemon.js");

    fs.appendFileSync(
      LOG_FILE,
      `[${new Date().toISOString()}] Daemon script path: ${daemonPath}\n`
    );

    // Check if the daemon script exists
    if (!fs.existsSync(daemonPath)) {
      fs.appendFileSync(
        LOG_FILE,
        `[${new Date().toISOString()}] ERROR: Daemon script not found at ${daemonPath}\n`
      );
      throw new Error(`Daemon script not found at ${daemonPath}`);
    }

    // Use node directly with the daemon script
    const child = spawn(process.execPath, [daemonPath], {
      detached: true,
      stdio: ["ignore", fs.openSync(LOG_FILE, "a"), fs.openSync(LOG_FILE, "a")],
      env: {
        ...process.env,
        WEBPRESENCE_DAEMON: "true",
      },
    });

    // Unref the child to allow the parent to exit
    child.unref();

    // Write the PID to the PID file
    fs.writeFileSync(PID_FILE, child.pid!.toString());

    return {
      success: true,
      message: `Daemon started with PID ${child.pid}`,
      pid: child.pid,
    };
  } catch (error: any) {
    logger.error(`Failed to start daemon: ${error.message}`, {
      error: error.stack,
    });
    return {
      success: false,
      message: `Failed to start daemon: ${error.message}`,
    };
  }
}

/**
 * Stop the daemon process
 * @returns Promise that resolves when the daemon is stopped
 */
export async function stopDaemon() {
  if (!isDaemonRunning()) {
    return { success: false, message: "Daemon is not running" };
  }

  try {
    // Read the PID from the PID file
    const pid = parseInt(fs.readFileSync(PID_FILE, "utf8").trim(), 10);

    // Send SIGTERM to the process
    process.kill(pid, "SIGTERM");

    // Wait for the process to exit
    await new Promise<void>((resolve) => {
      const checkInterval = setInterval(() => {
        try {
          // Check if process is still running
          process.kill(pid, 0);
        } catch (error) {
          // Process is no longer running
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Set a timeout in case the process doesn't exit
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });

    // Remove the PID file
    fs.unlinkSync(PID_FILE);

    return { success: true, message: `Daemon with PID ${pid} stopped` };
  } catch (error: any) {
    logger.error(`Failed to stop daemon: ${error.message}`, {
      error: error.stack,
    });
    return {
      success: false,
      message: `Failed to stop daemon: ${error.message}`,
    };
  }
}

/**
 * Check if the daemon is running
 * @returns True if the daemon is running, false otherwise
 */
export function isDaemonRunning(): boolean {
  if (!fs.existsSync(PID_FILE)) {
    return false;
  }

  try {
    // Read the PID from the PID file
    const pidContent = fs.readFileSync(PID_FILE, "utf8").trim();

    // Log the PID content for debugging
    fs.appendFileSync(
      LOG_FILE,
      `[${new Date().toISOString()}] Checking daemon status, PID file content: ${pidContent}\n`
    );

    if (!pidContent || isNaN(parseInt(pidContent, 10))) {
      // Invalid PID, remove the file
      fs.unlinkSync(PID_FILE);
      fs.appendFileSync(
        LOG_FILE,
        `[${new Date().toISOString()}] Invalid PID content, removing PID file\n`
      );
      return false;
    }

    const pid = parseInt(pidContent, 10);

    // First check if the process exists at all
    try {
      process.kill(pid, 0);
    } catch (e) {
      // Process doesn't exist
      fs.unlinkSync(PID_FILE);
      fs.appendFileSync(
        LOG_FILE,
        `[${new Date().toISOString()}] Process with PID ${pid} does not exist, removing PID file\n`
      );
      return false;
    }

    // Now check if it's a node process and looks like our daemon
    try {
      // Use different commands based on platform
      let psCommand;
      if (process.platform === "win32") {
        psCommand = `tasklist /FI "PID eq ${pid}" /FO CSV /NH`;
      } else {
        // On Linux/Unix, get both command and command line
        psCommand = `ps -p ${pid} -o comm=,args=`;
      }

      const output = require("child_process").execSync(psCommand, {
        encoding: "utf8",
      });

      // Log the process info for debugging
      fs.appendFileSync(
        LOG_FILE,
        `[${new Date().toISOString()}] Process info for PID ${pid}: ${output.trim()}\n`
      );

      // Check if it's a node process running our daemon
      const isNodeProcess = output.toLowerCase().includes("node");
      const isWebPresenceProcess =
        output.toLowerCase().includes("webpresence") ||
        output.toLowerCase().includes("daemon.js") ||
        output.toLowerCase().includes("cli.js");

      if (!isNodeProcess) {
        // Not a node process, remove the PID file
        fs.unlinkSync(PID_FILE);
        fs.appendFileSync(
          LOG_FILE,
          `[${new Date().toISOString()}] Process with PID ${pid} is not a Node.js process, removing PID file\n`
        );
        return false;
      }

      // Additional check: see if the server port is in use
      try {
        // Try to check if the port is in use
        const serverPort = 8874; // Default port, could be read from config
        const netstatCommand =
          process.platform === "win32"
            ? `netstat -ano | findstr :${serverPort}`
            : `netstat -tuln | grep :${serverPort}`;

        const netstatOutput = require("child_process").execSync(
          netstatCommand,
          {
            encoding: "utf8",
          }
        );

        fs.appendFileSync(
          LOG_FILE,
          `[${new Date().toISOString()}] Port check for ${serverPort}: ${netstatOutput.trim()}\n`
        );

        // If we get here, the port is in use, which is a good sign
        return true;
      } catch (netstatError) {
        // If netstat fails or port is not in use, we'll still return true if it looks like our process
        fs.appendFileSync(
          LOG_FILE,
          `[${new Date().toISOString()}] Port check failed, but process appears to be running\n`
        );
        return isWebPresenceProcess;
      }
    } catch (e) {
      // Error checking process command
      // If we can't check the process details but the PID exists, assume it's running
      fs.appendFileSync(
        LOG_FILE,
        `[${new Date().toISOString()}] Error checking process details: ${e}\n`
      );
      return true;
    }
  } catch (error) {
    // If the process is not running, remove the PID file
    try {
      fs.unlinkSync(PID_FILE);
      fs.appendFileSync(
        LOG_FILE,
        `[${new Date().toISOString()}] Error checking daemon status, removing PID file: ${error}\n`
      );
    } catch (e) {
      // Ignore errors when removing the PID file
    }
    return false;
  }
}

/**
 * Get the daemon PID if running
 * @returns The daemon PID or null if not running
 */
export function getDaemonPid(): number | null {
  if (!isDaemonRunning()) {
    return null;
  }

  try {
    // Read the PID from the PID file
    return parseInt(fs.readFileSync(PID_FILE, "utf8").trim(), 10);
  } catch (error) {
    return null;
  }
}

/**
 * Get the path to the daemon log file
 * @returns The path to the daemon log file
 */
export function getDaemonLogPath(): string {
  return LOG_FILE;
}
