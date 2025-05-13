/**
 * WebPresence Update Checker
 * 
 * Utility to check for and apply package updates
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import chalk from 'chalk';
import { logger } from './logger.js';

// Get package.json for version info
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');

/**
 * Check if a new version of the package is available
 * @returns Promise with update information
 */
export async function checkForUpdates(): Promise<{
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
}> {
  try {
    // Read current version from package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;

    // Check for the latest version on npm
    const npmViewOutput = execSync('npm view webpresence version', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'], // Suppress stderr
    }).trim();

    const latestVersion = npmViewOutput;

    // Compare versions
    const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;

    return {
      hasUpdate,
      currentVersion,
      latestVersion,
    };
  } catch (error: any) {
    // If there's an error checking for updates, assume no update is available
    logger.debug(`Error checking for updates: ${error.message}`);
    
    // Get current version from package.json
    let currentVersion = '0.0.0';
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      currentVersion = packageJson.version;
    } catch (e) {
      // Ignore errors reading package.json
    }
    
    return {
      hasUpdate: false,
      currentVersion,
      latestVersion: currentVersion,
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
}> {
  try {
    // Run npm update globally
    execSync('npm install -g webpresence@latest', {
      stdio: 'inherit', // Show output to user
    });

    return {
      success: true,
      message: 'WebPresence has been updated to the latest version.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to update WebPresence: ${error.message}`,
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
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);

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
export function displayUpdateNotification(currentVersion: string, latestVersion: string): void {
  console.log(
    chalk.yellow('\n┌────────────────────────────────────────────────────────┐')
  );
  console.log(
    chalk.yellow('│ ') + 
    chalk.bold('Update Available!') + 
    chalk.yellow(' '.repeat(43 - 'Update Available!'.length) + '│')
  );
  console.log(
    chalk.yellow('│ ') + 
    `Current version: ${chalk.red(currentVersion)}` + 
    chalk.yellow(' '.repeat(43 - `Current version: ${currentVersion}`.length) + '│')
  );
  console.log(
    chalk.yellow('│ ') + 
    `Latest version: ${chalk.green(latestVersion)}` + 
    chalk.yellow(' '.repeat(43 - `Latest version: ${latestVersion}`.length) + '│')
  );
  console.log(
    chalk.yellow('│ ') + 
    chalk.cyan('To update, run: ') + 
    chalk.bold('webpresence update') + 
    chalk.yellow(' '.repeat(43 - 'To update, run: webpresence update'.length) + '│')
  );
  console.log(
    chalk.yellow('└────────────────────────────────────────────────────────┘')
  );
}
