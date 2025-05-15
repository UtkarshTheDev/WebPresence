/**
 * Autostart utilities for WebPresence server (BETA)
 *
 * Provides functionality for configuring the server to start automatically on system boot
 * Supports multiple methods for different operating systems and Linux distributions
 */

import fs from "fs";
import path from "path";
import os from "os";
import { execSync, exec } from "child_process";
import { fileURLToPath } from "url";
import { logger } from "./logger.js";

// Get the directory where the autostart files will be stored
const HOME_DIR = os.homedir();

// XDG Autostart (Linux)
const AUTOSTART_DIR_LINUX = path.join(HOME_DIR, ".config", "autostart");
const AUTOSTART_FILE_LINUX = path.join(AUTOSTART_DIR_LINUX, "webpresence.desktop");

// systemd user service (Linux)
const SYSTEMD_USER_DIR = path.join(HOME_DIR, ".config", "systemd", "user");
const SYSTEMD_SERVICE_FILE = path.join(SYSTEMD_USER_DIR, "webpresence.service");

// LaunchAgents (macOS)
const LAUNCH_AGENTS_DIR_MAC = path.join(HOME_DIR, "Library", "LaunchAgents");
const LAUNCH_AGENT_FILE_MAC = path.join(LAUNCH_AGENTS_DIR_MAC, "com.utkarsh.webpresence.plist");

// WebPresence directories
const WEBPRESENCE_DIR = path.join(HOME_DIR, ".webpresence");
const STARTUP_SCRIPT_PATH = path.join(WEBPRESENCE_DIR, "startup.sh");
const AUTOSTART_LOG_PATH = path.join(WEBPRESENCE_DIR, "autostart.log");

/**
 * Autostart method types
 */
export type AutostartMethod = "auto" | "xdg" | "systemd";

/**
 * Detect the Linux distribution
 * @returns Information about the Linux distribution
 */
function detectLinuxDistribution(): { 
  isArch: boolean; 
  isSystemd: boolean;
  name: string;
} {
  try {
    // Check if systemd is available
    const hasSystemd = fs.existsSync("/usr/bin/systemctl") || fs.existsSync("/bin/systemctl");
    
    // Check for Arch-based distributions
    let isArch = fs.existsSync("/etc/arch-release");
    let distroName = "Unknown Linux";
    
    // Try to get distribution name from os-release
    if (fs.existsSync("/etc/os-release")) {
      const osRelease = execSync("cat /etc/os-release", { encoding: "utf8" });
      
      // Check for Arch-based distros in os-release
      if (!isArch) {
        isArch = osRelease.toLowerCase().includes("arch") || 
                osRelease.toLowerCase().includes("manjaro") ||
                osRelease.toLowerCase().includes("endeavour");
      }
      
      // Extract distribution name
      const nameMatch = osRelease.match(/NAME="([^"]+)"/);
      if (nameMatch && nameMatch[1]) {
        distroName = nameMatch[1];
      }
    }
    
    return {
      isArch,
      isSystemd: hasSystemd,
      name: distroName
    };
  } catch (error) {
    // If detection fails, assume non-Arch with systemd
    return {
      isArch: false,
      isSystemd: true,
      name: "Unknown Linux"
    };
  }
}

/**
 * Determine the best autostart method for the current system
 * @param preferredMethod Optional preferred method
 * @returns The best autostart method for the current system
 */
function getBestAutostartMethod(preferredMethod?: AutostartMethod): AutostartMethod {
  const platform = process.platform;
  
  // If a specific method is requested and it's not "auto", use it
  if (preferredMethod && preferredMethod !== "auto") {
    return preferredMethod;
  }
  
  // For non-Linux platforms, there's only one method
  if (platform !== "linux") {
    return "auto";
  }
  
  // For Linux, detect the distribution and environment
  const distro = detectLinuxDistribution();
  
  // Log the detected distribution
  logger.info(`Detected Linux distribution: ${distro.name}`);
  
  // Prefer systemd on Arch-based distributions or if systemd is available
  if (distro.isArch && distro.isSystemd) {
    logger.info("Using systemd autostart method (recommended for Arch Linux)");
    return "systemd";
  } else if (distro.isSystemd) {
    logger.info("Using systemd autostart method");
    return "systemd";
  } else {
    logger.info("Using XDG autostart method");
    return "xdg";
  }
}

/**
 * Get the path to the webpresence executable
 * @returns The path to the webpresence executable
 */
function getWebPresencePath(): string {
  const platform = process.platform;
  
  // Try to find the webpresence executable
  try {
    return execSync("which webpresence", { encoding: "utf8" }).trim();
  } catch (e) {
    // On Windows, try where command
    if (platform === "win32") {
      try {
        return execSync("where webpresence", { encoding: "utf8" }).trim().split("\n")[0];
      } catch (whereError) {
        // If we can't find the path, use a reasonable default based on npm global install location
        if (process.env.APPDATA) {
          return path.join(process.env.APPDATA, "npm", "webpresence.cmd");
        }
      }
    }
    
    // For other platforms, check common npm global locations
    const npmGlobalLocations = [
      path.join(HOME_DIR, ".npm-global", "bin", "webpresence"),
      path.join(HOME_DIR, "node_modules", ".bin", "webpresence"),
      path.join(HOME_DIR, ".local", "bin", "webpresence"),
      "/usr/local/bin/webpresence",
      "/usr/bin/webpresence"
    ];
    
    for (const location of npmGlobalLocations) {
      if (fs.existsSync(location)) {
        return location;
      }
    }
    
    // If all else fails, just return the command name and hope it's in the PATH
    return "webpresence";
  }
}

/**
 * Create the startup script for Linux
 * @param webpresencePath Path to the webpresence executable
 * @returns Path to the created startup script
 */
function createLinuxStartupScript(webpresencePath: string): string {
  // Ensure the .webpresence directory exists
  if (!fs.existsSync(WEBPRESENCE_DIR)) {
    fs.mkdirSync(WEBPRESENCE_DIR, { recursive: true });
  }
  
  // Create a startup script with proper environment setup and delay
  const startupScript = `#!/bin/bash
# WebPresence Startup Script (BETA)
# Created: $(new Date().toISOString())

# Wait for desktop environment to fully load
sleep 10

# Ensure PATH includes npm global bin directories
export PATH="$PATH:$HOME/.npm-global/bin:$HOME/.local/bin:/usr/local/bin"

# Log startup attempt
echo "[$(date)] Starting WebPresence..." >> "${AUTOSTART_LOG_PATH}"

# Check if Discord is running
if pgrep -x "Discord" > /dev/null || pgrep -x "discord" > /dev/null; then
    echo "[$(date)] Discord is running, starting WebPresence..." >> "${AUTOSTART_LOG_PATH}"
else
    echo "[$(date)] Discord is not running, waiting 30 seconds..." >> "${AUTOSTART_LOG_PATH}"
    sleep 30
fi

# Start WebPresence
${webpresencePath} start -d >> "${AUTOSTART_LOG_PATH}" 2>&1

# Log completion
echo "[$(date)] Startup script completed" >> "${AUTOSTART_LOG_PATH}"
`;
  
  // Write the startup script
  fs.writeFileSync(STARTUP_SCRIPT_PATH, startupScript);
  
  // Make the script executable
  try {
    execSync(`chmod +x ${STARTUP_SCRIPT_PATH}`);
  } catch (chmodError) {
    logger.warn(`Could not make startup script executable: ${chmodError}`);
  }
  
  return STARTUP_SCRIPT_PATH;
}
/**
 * Enable autostart using systemd user service (Linux)
 * @param webpresencePath Path to the webpresence executable
 * @returns Result of enabling autostart
 */
async function enableSystemdAutostart(webpresencePath: string): Promise<{ success: boolean; message: string }> {
  try {
    // Ensure the systemd user directory exists
    if (!fs.existsSync(SYSTEMD_USER_DIR)) {
      fs.mkdirSync(SYSTEMD_USER_DIR, { recursive: true });
    }
    
    // Create the systemd service file
    const serviceContent = `[Unit]
Description=WebPresence Discord Rich Presence Server
After=network.target graphical-session.target

[Service]
ExecStart=${webpresencePath} start
Restart=on-failure
RestartSec=10
Environment=PATH=${process.env.PATH}:${HOME_DIR}/.npm-global/bin:${HOME_DIR}/.local/bin:/usr/local/bin

[Install]
WantedBy=default.target
`;
    
    fs.writeFileSync(SYSTEMD_SERVICE_FILE, serviceContent);
    
    // Enable and start the service
    try {
      execSync("systemctl --user daemon-reload");
      execSync(`systemctl --user enable webpresence.service`);
      execSync(`systemctl --user start webpresence.service`);
      
      logger.success("Enabled autostart on Linux using systemd user service");
      return {
        success: true,
        message: "Autostart enabled using systemd. WebPresence will start automatically when you log in."
      };
    } catch (systemdError: any) {
      logger.warn(`Could not enable systemd service: ${systemdError.message}`);
      return {
        success: false,
        message: `Failed to enable systemd service: ${systemdError.message}`
      };
    }
  } catch (error: any) {
    logger.error(`Error enabling systemd autostart: ${error.message}`, {
      error: error.stack,
    });
    return {
      success: false,
      message: `Failed to enable systemd autostart: ${error.message}`
    };
  }
}

/**
 * Enable autostart using XDG autostart (Linux)
 * @param webpresencePath Path to the webpresence executable
 * @returns Result of enabling autostart
 */
async function enableXdgAutostart(webpresencePath: string): Promise<{ success: boolean; message: string }> {
  try {
    // Create the startup script
    const startupScriptPath = createLinuxStartupScript(webpresencePath);
    
    // Ensure the autostart directory exists
    if (!fs.existsSync(AUTOSTART_DIR_LINUX)) {
      fs.mkdirSync(AUTOSTART_DIR_LINUX, { recursive: true });
    }
    
    // Create the desktop entry with the startup script
    const desktopEntryContent = `[Desktop Entry]
Type=Application
Name=WebPresence
Exec=${startupScriptPath}
Terminal=false
X-GNOME-Autostart-enabled=true
StartupNotify=false
Hidden=false
NoDisplay=false
Comment=Discord Rich Presence for websites
`;
    
    fs.writeFileSync(AUTOSTART_FILE_LINUX, desktopEntryContent);
    
    // Make the desktop entry executable (some desktop environments require this)
    try {
      execSync(`chmod +x ${AUTOSTART_FILE_LINUX}`);
    } catch (chmodError) {
      logger.warn(`Could not make desktop entry executable: ${chmodError}`);
    }
    
    logger.success("Enabled autostart on Linux using XDG autostart");
    return {
      success: true,
      message: "Autostart enabled using XDG autostart. WebPresence will start automatically when you log in."
    };
  } catch (error: any) {
    logger.error(`Error enabling XDG autostart: ${error.message}`, {
      error: error.stack,
    });
    return {
      success: false,
      message: `Failed to enable XDG autostart: ${error.message}`
    };
  }
}

/**
 * Disable systemd autostart (Linux)
 * @returns Result of disabling autostart
 */
async function disableSystemdAutostart(): Promise<{ success: boolean; message: string }> {
  try {
    let wasEnabled = false;
    
    // Check if the service file exists
    if (fs.existsSync(SYSTEMD_SERVICE_FILE)) {
      // Stop and disable the service
      try {
        execSync(`systemctl --user stop webpresence.service`);
      } catch (stopError) {
        // Ignore stop errors
      }
      
      try {
        execSync(`systemctl --user disable webpresence.service`);
      } catch (disableError) {
        // Ignore disable errors
      }
      
      // Remove the service file
      fs.unlinkSync(SYSTEMD_SERVICE_FILE);
      wasEnabled = true;
      
      // Reload systemd
      try {
        execSync("systemctl --user daemon-reload");
      } catch (reloadError) {
        // Ignore reload errors
      }
    }
    
    if (wasEnabled) {
      logger.success("Disabled autostart on Linux (systemd)");
      return {
        success: true,
        message: "Autostart disabled. WebPresence will no longer start automatically when you log in."
      };
    }
    
    return {
      success: true,
      message: "Autostart was not enabled with systemd."
    };
  } catch (error: any) {
    logger.error(`Error disabling systemd autostart: ${error.message}`, {
      error: error.stack,
    });
    return {
      success: false,
      message: `Failed to disable systemd autostart: ${error.message}`
    };
  }
}

/**
 * Disable XDG autostart (Linux)
 * @returns Result of disabling autostart
 */
async function disableXdgAutostart(): Promise<{ success: boolean; message: string }> {
  try {
    let wasEnabled = false;
    
    // Remove the desktop entry
    if (fs.existsSync(AUTOSTART_FILE_LINUX)) {
      fs.unlinkSync(AUTOSTART_FILE_LINUX);
      wasEnabled = true;
    }
    
    // Remove the startup script
    if (fs.existsSync(STARTUP_SCRIPT_PATH)) {
      fs.unlinkSync(STARTUP_SCRIPT_PATH);
      wasEnabled = true;
    }
    
    if (wasEnabled) {
      logger.success("Disabled autostart on Linux (XDG)");
      return {
        success: true,
        message: "Autostart disabled. WebPresence will no longer start automatically when you log in."
      };
    }
    
    return {
      success: true,
      message: "Autostart was not enabled with XDG autostart."
    };
  } catch (error: any) {
    logger.error(`Error disabling XDG autostart: ${error.message}`, {
      error: error.stack,
    });
    return {
      success: false,
      message: `Failed to disable XDG autostart: ${error.message}`
    };
  }
}
/**
 * Check if autostart is enabled
 * @param method Optional autostart method to check
 * @returns True if autostart is enabled, false otherwise
 */
export function isAutostartEnabled(method?: AutostartMethod): boolean {
  try {
    const platform = process.platform;
    
    if (platform === "win32") {
      // Windows: Check Task Scheduler
      try {
        const output = execSync("schtasks /query /tn WebPresence", { 
          stdio: ["ignore", "pipe", "ignore"],
          encoding: "utf8"
        });
        return output.includes("WebPresence");
      } catch (e) {
        // Task not found
        return false;
      }
    } else if (platform === "darwin") {
      // macOS: Check LaunchAgents
      return fs.existsSync(LAUNCH_AGENT_FILE_MAC);
    } else if (platform === "linux") {
      // Linux: Check based on method
      const bestMethod = getBestAutostartMethod(method);
      
      if (bestMethod === "systemd") {
        // Check systemd service
        try {
          const output = execSync("systemctl --user is-enabled webpresence.service", { 
            stdio: ["ignore", "pipe", "ignore"],
            encoding: "utf8"
          });
          return output.trim() === "enabled";
        } catch (e) {
          // Service not found or not enabled
          return false;
        }
      } else {
        // Check XDG autostart
        return fs.existsSync(AUTOSTART_FILE_LINUX);
      }
    }
    
    return false;
  } catch (error: any) {
    logger.error(`Error checking autostart status: ${error.message}`, {
      error: error.stack,
    });
    return false;
  }
}

/**
 * Enable autostart for the current platform
 * @param method Optional autostart method to use
 * @returns Promise that resolves with the result of enabling autostart
 */
export async function enableAutostart(method?: AutostartMethod): Promise<{ success: boolean; message: string }> {
  try {
    const platform = process.platform;
    const webpresencePath = getWebPresencePath();
    
    if (platform === "win32") {
      // Windows: Use Task Scheduler
      const command = `schtasks /create /tn WebPresence /sc onlogon /rl highest /tr "${webpresencePath} start -d" /f`;
      
      return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            logger.error(`Error enabling autostart on Windows: ${error.message}`);
            resolve({ 
              success: false, 
              message: `Failed to enable autostart: ${error.message}. Try running as administrator.` 
            });
            return;
          }
          
          logger.success("Enabled autostart on Windows using Task Scheduler");
          resolve({ 
            success: true, 
            message: "Autostart enabled. WebPresence will start automatically when you log in." 
          });
        });
      });
    } else if (platform === "darwin") {
      // macOS: Use LaunchAgents
      // Ensure the LaunchAgents directory exists
      if (!fs.existsSync(LAUNCH_AGENTS_DIR_MAC)) {
        fs.mkdirSync(LAUNCH_AGENTS_DIR_MAC, { recursive: true });
      }
      
      // Create the plist file
      const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.utkarsh.webpresence</string>
    <key>ProgramArguments</key>
    <array>
        <string>${webpresencePath}</string>
        <string>start</string>
        <string>-d</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>${path.join(HOME_DIR, ".webpresence", "launchd.log")}</string>
    <key>StandardErrorPath</key>
    <string>${path.join(HOME_DIR, ".webpresence", "launchd.log")}</string>
</dict>
</plist>`;
      
      fs.writeFileSync(LAUNCH_AGENT_FILE_MAC, plistContent);
      
      // Load the launch agent
      try {
        execSync(`launchctl load ${LAUNCH_AGENT_FILE_MAC}`);
        logger.success("Enabled autostart on macOS using LaunchAgents");
        return { 
          success: true, 
          message: "Autostart enabled. WebPresence will start automatically when you log in." 
        };
      } catch (loadError: any) {
        logger.warn(`Could not load launch agent: ${loadError.message}`);
        return { 
          success: true, 
          message: "Autostart configuration created, but you may need to restart your computer for it to take effect." 
        };
      }
    } else if (platform === "linux") {
      // Linux: Use the best method based on the distribution
      const bestMethod = getBestAutostartMethod(method);
      
      if (bestMethod === "systemd") {
        return enableSystemdAutostart(webpresencePath);
      } else {
        return enableXdgAutostart(webpresencePath);
      }
    }
    
    return { 
      success: false, 
      message: `Autostart is not supported on platform: ${platform}` 
    };
  } catch (error: any) {
    logger.error(`Error enabling autostart: ${error.message}`, {
      error: error.stack,
    });
    return { 
      success: false, 
      message: `Failed to enable autostart: ${error.message}` 
    };
  }
}

/**
 * Disable autostart for the current platform
 * @param method Optional autostart method to disable
 * @returns Promise that resolves with the result of disabling autostart
 */
export async function disableAutostart(method?: AutostartMethod): Promise<{ success: boolean; message: string }> {
  try {
    const platform = process.platform;
    
    if (platform === "win32") {
      // Windows: Remove from Task Scheduler
      const command = "schtasks /delete /tn WebPresence /f";
      
      return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            // If the task doesn't exist, that's fine
            if (error.message.includes("The system cannot find the file specified")) {
              resolve({ 
                success: true, 
                message: "Autostart was not enabled." 
              });
              return;
            }
            
            logger.error(`Error disabling autostart on Windows: ${error.message}`);
            resolve({ 
              success: false, 
              message: `Failed to disable autostart: ${error.message}. Try running as administrator.` 
            });
            return;
          }
          
          logger.success("Disabled autostart on Windows");
          resolve({ 
            success: true, 
            message: "Autostart disabled. WebPresence will no longer start automatically when you log in." 
          });
        });
      });
    } else if (platform === "darwin") {
      // macOS: Remove from LaunchAgents
      if (fs.existsSync(LAUNCH_AGENT_FILE_MAC)) {
        // Unload the launch agent
        try {
          execSync(`launchctl unload ${LAUNCH_AGENT_FILE_MAC}`);
        } catch (unloadError) {
          // Ignore unload errors
        }
        
        // Remove the file
        fs.unlinkSync(LAUNCH_AGENT_FILE_MAC);
        logger.success("Disabled autostart on macOS");
        return { 
          success: true, 
          message: "Autostart disabled. WebPresence will no longer start automatically when you log in." 
        };
      }
      
      return { 
        success: true, 
        message: "Autostart was not enabled." 
      };
    } else if (platform === "linux") {
      // Linux: Disable based on method
      const bestMethod = getBestAutostartMethod(method);
      
      // Disable both methods if "auto" is specified
      if (method === "auto" || !method) {
        const systemdResult = await disableSystemdAutostart();
        const xdgResult = await disableXdgAutostart();
        
        // If either method was enabled, return success
        if (systemdResult.success && systemdResult.message.includes("disabled") ||
            xdgResult.success && xdgResult.message.includes("disabled")) {
          return {
            success: true,
            message: "Autostart disabled. WebPresence will no longer start automatically when you log in."
          };
        }
        
        return {
          success: true,
          message: "Autostart was not enabled."
        };
      } else if (bestMethod === "systemd") {
        return disableSystemdAutostart();
      } else {
        return disableXdgAutostart();
      }
    }
    
    return { 
      success: false, 
      message: `Autostart is not supported on platform: ${platform}` 
    };
  } catch (error: any) {
    logger.error(`Error disabling autostart: ${error.message}`, {
      error: error.stack,
    });
    return { 
      success: false, 
      message: `Failed to disable autostart: ${error.message}` 
    };
  }
}
