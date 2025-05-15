/**
 * WebPresence Update Checker
 *
 * Utility to check for and apply package updates
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import chalk from "chalk";
import { logger } from "./logger.js";

// Get package.json for version info
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = path.join(__dirname, "..", "..", "package.json");

// Debug the package.json path to ensure it's correct
logger.debug(`Package.json path: ${packageJsonPath}`);

/**
 * Check if a new version of the package is available
 * @returns Promise with update information
 */
export async function checkForUpdates(): Promise<{
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
}> {
  // First, read current version from package.json
  let currentVersion = "0.0.0";

  // Try multiple approaches to get the current version
  try {
    // Approach 1: Read from local package.json
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      currentVersion = packageJson.version;
      logger.debug(
        `Current package version from local package.json: ${currentVersion}`
      );
    } catch (e: any) {
      logger.debug(`Error reading local package.json: ${e.message}`);
    }

    // Approach 2: If version is still 0.0.0, try using npm list
    if (currentVersion === "0.0.0") {
      try {
        const npmListOutput = execSync("npm list -g webpresence --json", {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"], // Suppress stderr
        });

        const npmListData = JSON.parse(npmListOutput);
        if (
          npmListData &&
          npmListData.dependencies &&
          npmListData.dependencies.webpresence
        ) {
          currentVersion = npmListData.dependencies.webpresence.version;
          logger.debug(
            `Current package version from npm list: ${currentVersion}`
          );
        }
      } catch (npmError: any) {
        logger.debug(
          `Error getting version from npm list: ${npmError.message}`
        );
      }
    }

    // Approach 3: If version is still 0.0.0, try using npm view for the current package
    if (currentVersion === "0.0.0") {
      try {
        // Get the directory of the current package
        const packageDir = path.join(__dirname, "..", "..");
        const npmViewOutput = execSync(`npm view --json`, {
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"], // Suppress stderr
          cwd: packageDir,
        });

        const npmViewData = JSON.parse(npmViewOutput);
        if (npmViewData && npmViewData.version) {
          currentVersion = npmViewData.version;
          logger.debug(
            `Current package version from npm view: ${currentVersion}`
          );
        }
      } catch (npmViewError: any) {
        logger.debug(
          `Error getting version from npm view: ${npmViewError.message}`
        );
      }
    }
  } catch (e: any) {
    logger.debug(`Error in version detection: ${e.message}`);
    // Continue with default version if all approaches fail
  }

  try {
    // Check for the latest version on npm
    const npmViewOutput = execSync("npm view webpresence version", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"], // Suppress stderr
    }).trim();

    const latestVersion = npmViewOutput;
    logger.debug(`Latest version on npm: ${latestVersion}`);

    // Compare versions
    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

    return {
      hasUpdate,
      currentVersion,
      latestVersion,
    };
  } catch (error: any) {
    // If there's an error checking for updates from npm, log it
    logger.debug(`Error checking for updates from npm: ${error.message}`);

    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion, // Use current version as latest if we can't check npm
    };
  }
}

/**
 * Update the package to the latest version
 * @returns Promise with update result
 */
export async function updatePackage(): Promise<{
  success: boolean;
  message: string;
  fromVersion?: string;
  toVersion?: string;
}> {
  // First get the current version
  let currentVersion = "0.0.0";
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    currentVersion = packageJson.version;
  } catch (e: any) {
    logger.debug(`Error reading package.json before update: ${e.message}`);
  }

  try {
    // Run npm update globally
    logger.debug("Running npm install -g webpresence@latest");
    execSync("npm install -g webpresence@latest", {
      stdio: "inherit", // Show output to user
    });

    // Get the new version after update
    let newVersion = currentVersion;
    try {
      // We need to read from the global package.json, not our local one
      // Use npm list to get the installed version
      const npmListOutput = execSync("npm list -g webpresence --json", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"], // Suppress stderr
      });

      const npmListData = JSON.parse(npmListOutput);
      if (
        npmListData &&
        npmListData.dependencies &&
        npmListData.dependencies.webpresence
      ) {
        newVersion = npmListData.dependencies.webpresence.version;
        logger.debug(`Updated to version: ${newVersion}`);
      }
    } catch (versionError: any) {
      logger.debug(`Error getting updated version: ${versionError.message}`);
    }

    return {
      success: true,
      message: "WebPresence has been updated to the latest version.",
      fromVersion: currentVersion,
      toVersion: newVersion,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to update WebPresence: ${error.message}`,
      fromVersion: currentVersion,
    };
  }
}

/**
 * Compare two semantic version strings
 * @param v1 First version
 * @param v2 Second version
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
  const v1Parts = v1.split(".").map(Number);
  const v2Parts = v2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }

  return 0;
}

/**
 * Display update notification to the user
 * @param currentVersion Current package version
 * @param latestVersion Latest available version
 */
export function displayUpdateNotification(
  currentVersion: string,
  latestVersion: string
): void {
  console.log(
    chalk.yellow("\n┌────────────────────────────────────────────────────────┐")
  );
  console.log(
    chalk.yellow("│ ") +
      chalk.bold("Update Available!") +
      chalk.yellow(" ".repeat(43 - "Update Available!".length) + "│")
  );
  console.log(
    chalk.yellow("│ ") +
      `Current version: ${chalk.red(currentVersion)}` +
      chalk.yellow(
        " ".repeat(43 - `Current version: ${currentVersion}`.length) + "│"
      )
  );
  console.log(
    chalk.yellow("│ ") +
      `Latest version: ${chalk.green(latestVersion)}` +
      chalk.yellow(
        " ".repeat(43 - `Latest version: ${latestVersion}`.length) + "│"
      )
  );
  console.log(
    chalk.yellow("│ ") +
      chalk.cyan("To update, run: ") +
      chalk.bold("webpresence update") +
      chalk.yellow(
        " ".repeat(43 - "To update, run: webpresence update".length) + "│"
      )
  );
  console.log(
    chalk.yellow("└────────────────────────────────────────────────────────┘")
  );
}
