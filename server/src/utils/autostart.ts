/**
 * Autostart utilities for WebPresence server
 *
 * Provides functionality for configuring the server to start automatically on system boot
 */

import fs from "fs";
import path from "path";
import os from "os";
import { execSync, exec } from "child_process";
import { fileURLToPath } from "url";
import { logger } from "./logger.js";

// Get the directory where the autostart files will be stored
const HOME_DIR = os.homedir();
const AUTOSTART_DIR_LINUX = path.join(HOME_DIR, ".config", "autostart");
const AUTOSTART_FILE_LINUX = path.join(AUTOSTART_DIR_LINUX, "webpresence.desktop");
const LAUNCH_AGENTS_DIR_MAC = path.join(HOME_DIR, "Library", "LaunchAgents");
const LAUNCH_AGENT_FILE_MAC = path.join(LAUNCH_AGENTS_DIR_MAC, "com.utkarsh.webpresence.plist");

/**
 * Check if autostart is enabled
 * @returns True if autostart is enabled, false otherwise
 */
export function isAutostartEnabled(): boolean {
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
      // Linux: Check autostart directory
      return fs.existsSync(AUTOSTART_FILE_LINUX);
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
 * @returns Promise that resolves with the result of enabling autostart
 */
export async function enableAutostart(): Promise<{ success: boolean; message: string }> {
  try {
    const platform = process.platform;
    
    // Get the path to the webpresence executable
    let webpresencePath = "";
    try {
      webpresencePath = execSync("which webpresence", { encoding: "utf8" }).trim();
    } catch (e) {
      // On Windows, try where command
      if (platform === "win32") {
        try {
          webpresencePath = execSync("where webpresence", { encoding: "utf8" }).trim().split("\n")[0];
        } catch (whereError) {
          // If we can't find the path, use a reasonable default based on npm global install location
          if (process.env.APPDATA) {
            webpresencePath = path.join(process.env.APPDATA, "npm", "webpresence.cmd");
          } else {
            webpresencePath = "webpresence";
          }
        }
      } else {
        // For other platforms, if we can't find it, assume it's in the PATH
        webpresencePath = "webpresence";
      }
    }
    
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
      // Linux: Use autostart desktop entry
      // Ensure the autostart directory exists
      if (!fs.existsSync(AUTOSTART_DIR_LINUX)) {
        fs.mkdirSync(AUTOSTART_DIR_LINUX, { recursive: true });
      }
      
      // Create the desktop entry
      const desktopEntryContent = `[Desktop Entry]
Type=Application
Name=WebPresence
Exec=${webpresencePath} start -d
Terminal=false
X-GNOME-Autostart-enabled=true
Comment=Discord Rich Presence for websites
`;
      
      fs.writeFileSync(AUTOSTART_FILE_LINUX, desktopEntryContent);
      logger.success("Enabled autostart on Linux using desktop entry");
      return { 
        success: true, 
        message: "Autostart enabled. WebPresence will start automatically when you log in." 
      };
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
 * @returns Promise that resolves with the result of disabling autostart
 */
export async function disableAutostart(): Promise<{ success: boolean; message: string }> {
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
      // Linux: Remove from autostart
      if (fs.existsSync(AUTOSTART_FILE_LINUX)) {
        fs.unlinkSync(AUTOSTART_FILE_LINUX);
        logger.success("Disabled autostart on Linux");
        return { 
          success: true, 
          message: "Autostart disabled. WebPresence will no longer start automatically when you log in." 
        };
      }
      
      return { 
        success: true, 
        message: "Autostart was not enabled." 
      };
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
