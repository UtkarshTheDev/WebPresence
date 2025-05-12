#!/usr/bin/env node

/**
 * WebPresence CLI
 *
 * Command-line interface for the WebPresence server.
 */

import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import {
  startServer,
  stopServer,
  isServerRunning,
  getServerStatus,
  togglePresence,
  updatePreferences,
  config,
} from "./index.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { StartOptions, ToggleOptions, ConfigOptions } from "./types/cli.js";
import { logger } from "./utils/logger.js";

// Get package.json for version info
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "..", "package.json");
const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));

// Create CLI program
const program = new Command();

// Set up CLI metadata
program
  .name("webpresence")
  .description(
    "Discord Rich Presence for websites - Show your browsing activity in Discord"
  )
  .version(packageJson.version)
  .option("-v, --verbose", "Enable verbose output")
  .hook("preAction", (thisCommand, actionCommand) => {
    // Set verbosity based on command line option
    const options = actionCommand.opts();
    if (options.verbose) {
      logger.setVerbose(true);
    }
  });

// Start command
program
  .command("start")
  .description("Start the WebPresence server")
  .option("-p, --port <port>", "Port to run the server on", parseInt)
  .action(async (options: StartOptions) => {
    if (isServerRunning()) {
      logger.warn("Server is already running");
      return;
    }

    const spinner = ora("Starting WebPresence server...").start();

    try {
      const result = await startServer({ port: options.port });

      if (result.success) {
        spinner.succeed(`Server started on port ${result.port}`);
        logger.success("✓ WebSocket server running");
        logger.success("✓ Discord RPC initialized");
        logger.important(
          "\nYour browser extension should now be able to connect."
        );
        logger.important("Keep this terminal open to maintain the connection.");
      } else {
        spinner.fail("Failed to start server");
      }
    } catch (error: any) {
      spinner.fail(`Error starting server: ${error.message}`);
    }
  });

// Stop command
program
  .command("stop")
  .description("Stop the WebPresence server")
  .action(async () => {
    if (!isServerRunning()) {
      logger.warn("Server is not running");
      return;
    }

    const spinner = ora("Stopping WebPresence server...").start();

    try {
      const result = await stopServer();

      if (result.success) {
        spinner.succeed("Server stopped");
      } else {
        spinner.fail("Failed to stop server");
      }
    } catch (error: any) {
      spinner.fail(`Error stopping server: ${error.message}`);
    }
  });

// Status command
program
  .command("status")
  .description("Check the status of the WebPresence server")
  .action(() => {
    const status = getServerStatus();

    console.log(chalk.bold("\nWebPresence Status:"));

    // Server status
    process.stdout.write(chalk.blue("Server running: "));
    if (status.running) {
      console.log(chalk.green("Yes"));
    } else {
      console.log(chalk.red("No"));
    }

    if (status.running) {
      // Port
      console.log(chalk.blue("Port:"), chalk.green(status.port));

      // Discord connection
      process.stdout.write(chalk.blue("Discord connected: "));
      if (status.discordConnected) {
        console.log(chalk.green("Yes"));
      } else {
        console.log(chalk.yellow("No"));
      }

      // Presence status
      process.stdout.write(chalk.blue("Presence enabled: "));
      if (status.presenceEnabled) {
        console.log(chalk.green("Yes"));
      } else {
        console.log(chalk.yellow("No"));
      }
    }
  });

// Toggle command
program
  .command("toggle")
  .description("Toggle Discord presence on or off")
  .option("--on", "Enable Discord presence")
  .option("--off", "Disable Discord presence")
  .action(async (options: ToggleOptions) => {
    if (!isServerRunning()) {
      logger.warn("Server is not running. Start it first with:");
      logger.important("  webpresence start");
      return;
    }

    let enabled: boolean | undefined = undefined;
    if (options.on) enabled = true;
    if (options.off) enabled = false;

    const spinner = ora("Toggling Discord presence...").start();

    try {
      const result = await togglePresence(enabled);

      if (result.success) {
        spinner.succeed(
          `Discord presence ${result.enabled ? "enabled" : "disabled"}`
        );
      } else {
        spinner.fail("Failed to toggle Discord presence");
      }
    } catch (error: any) {
      spinner.fail(`Error toggling presence: ${error.message}`);
    }
  });

// Config command
program
  .command("config")
  .description("View or update configuration")
  .option("--view", "View current configuration")
  .option("--prefix <text>", 'Set prefix text (e.g., "Viewing", "Browsing")')
  .option("--disable-site <domain>", "Add a site to the disabled list")
  .option("--enable-site <domain>", "Remove a site from the disabled list")
  .option("--always-show <domain>", "Add a site to the always-enabled list")
  .option(
    "--remove-always-show <domain>",
    "Remove a site from the always-enabled list"
  )
  .option(
    "--continuous-timer <boolean>",
    "Keep timer running when switching tabs",
    (val) => val === "true"
  )
  .action(async (options: ConfigOptions) => {
    if (options.view || Object.keys(options).length === 0) {
      // View configuration
      const userPrefs = config.getUserPreferences();
      const serverConfig = config.getServer();

      console.log(chalk.bold("\nWebPresence Configuration:"));

      // Server port
      console.log(chalk.blue("Server port:"), chalk.green(serverConfig.port));

      // Prefix text
      console.log(
        chalk.blue("Prefix text:"),
        chalk.green(userPrefs.prefixText)
      );

      // Continuous timer
      process.stdout.write(chalk.blue("Continuous timer: "));
      if (userPrefs.continuousTimer) {
        console.log(chalk.green("Enabled"));
      } else {
        console.log(chalk.yellow("Disabled"));
      }

      // Disabled sites
      console.log(chalk.blue("\nDisabled sites:"));
      if (userPrefs.disabledSites.length === 0) {
        console.log(chalk.gray("  None"));
      } else {
        userPrefs.disabledSites.forEach((site) => {
          console.log(chalk.gray(`  - ${site}`));
        });
      }

      // Always-enabled sites
      console.log(chalk.blue("\nAlways-enabled sites:"));
      if (userPrefs.alwaysEnabledSites.length === 0) {
        console.log(chalk.gray("  None"));
      } else {
        userPrefs.alwaysEnabledSites.forEach((site) => {
          console.log(chalk.gray(`  - ${site}`));
        });
      }

      return;
    }

    // Update configuration
    const userPrefs = config.getUserPreferences();
    const updates: any = {};

    if (options.prefix) updates.prefixText = options.prefix;
    if (options.continuousTimer !== undefined)
      updates.continuousTimer = options.continuousTimer;

    // Handle site lists
    if (options.disableSite) {
      updates.disabledSites = [...userPrefs.disabledSites];
      if (!updates.disabledSites.includes(options.disableSite)) {
        updates.disabledSites.push(options.disableSite);
      }
    }

    if (options.enableSite) {
      updates.disabledSites = userPrefs.disabledSites.filter(
        (site) => site !== options.enableSite
      );
    }

    if (options.alwaysShow) {
      updates.alwaysEnabledSites = [...userPrefs.alwaysEnabledSites];
      if (!updates.alwaysEnabledSites.includes(options.alwaysShow)) {
        updates.alwaysEnabledSites.push(options.alwaysShow);
      }
    }

    if (options.removeAlwaysShow) {
      updates.alwaysEnabledSites = userPrefs.alwaysEnabledSites.filter(
        (site) => site !== options.removeAlwaysShow
      );
    }

    if (Object.keys(updates).length > 0) {
      const spinner = ora("Updating configuration...").start();

      try {
        if (isServerRunning()) {
          // If server is running, update via API
          const result = await updatePreferences(updates);

          if (result.success) {
            spinner.succeed("Configuration updated");
          } else {
            spinner.fail("Failed to update configuration");
          }
        } else {
          // If server is not running, update directly
          config.updateUserPreferences(updates);
          spinner.succeed("Configuration updated");
        }
      } catch (error: any) {
        spinner.fail(`Error updating configuration: ${error.message}`);
      }
    }
  });

// Help command (default when no command is specified)
program
  .command("help")
  .description("Display help information")
  .action(() => {
    program.help();
  });

// Parse command line arguments
program.parse();

// If no arguments, show help
if (process.argv.length <= 2) {
  program.help();
}
