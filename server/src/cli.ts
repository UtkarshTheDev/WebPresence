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
import fs from "fs";
import path, { join, dirname } from "path";
import os from "os";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { StartOptions, ToggleOptions, ConfigOptions } from "./types/cli.js";
import { logger } from "./utils/logger.js";
import {
  startDaemon,
  stopDaemon,
  isDaemonRunning,
  getDaemonPid,
  getDaemonLogPath,
} from "./utils/daemon.js";
// For TypeScript type definitions
import type { Response } from "node-fetch";

// Get package.json for version info
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

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
  .option("-d, --daemon", "Run server in background (daemon mode)")
  .action(async (options: StartOptions) => {
    // Skip normal start command if we're in a daemon child process
    // The daemon-start command will handle this case
    if (process.env.WEBPRESENCE_DAEMON_CHILD === "true") {
      logger.warn("This command should not be called directly in daemon mode");
      logger.info("Use the daemon-start command instead");
      return;
    }

    // Check if server is already running
    if (isServerRunning()) {
      logger.warn("Server is already running");
      return;
    }

    // Check if daemon is already running
    if (isDaemonRunning()) {
      logger.warn("Daemon is already running");
      return;
    }

    // Start in daemon mode if requested
    if (options.daemon) {
      const spinner = ora(
        "Starting WebPresence server in daemon mode..."
      ).start();

      try {
        // Ensure daemon directory exists
        const daemonDir = path.join(os.homedir(), ".webpresence");
        if (!fs.existsSync(daemonDir)) {
          fs.mkdirSync(daemonDir, { recursive: true });
        }

        // Create log file
        const logFile = path.join(daemonDir, "webpresence.log");

        // Clear previous log file to avoid confusion
        fs.writeFileSync(logFile, "");

        // Open file descriptors for the child process
        const out = fs.openSync(logFile, "a");
        const err = fs.openSync(logFile, "a");

        // Get the path to the current script
        const __filename = fileURLToPath(import.meta.url);

        // Log the start of daemon mode
        fs.appendFileSync(
          logFile,
          `[${new Date().toISOString()}] Starting daemon process\n`
        );

        // Spawn a detached process with special flags
        // IMPORTANT: We use a special command that bypasses the normal CLI flow
        // to avoid double initialization of Discord RPC
        const child = spawn(process.execPath, [__filename, "daemon-start"], {
          detached: true,
          stdio: ["ignore", out, err],
          env: {
            ...process.env,
            WEBPRESENCE_DAEMON_CHILD: "true", // Special flag for the daemon child
          },
        });

        // Unref the child to allow the parent to exit
        child.unref();

        // Write the PID to the PID file
        const pidFile = path.join(daemonDir, "webpresence.pid");

        // Write the PID
        fs.writeFileSync(pidFile, child.pid!.toString());

        // Log the PID
        fs.appendFileSync(
          logFile,
          `[${new Date().toISOString()}] Daemon started with PID: ${
            child.pid
          }\n`
        );

        // Wait a moment to ensure the child process has started
        await new Promise((resolve) => setTimeout(resolve, 500));

        spinner.succeed(`Server started in daemon mode (PID: ${child.pid})`);
        logger.success("✓ Server is running in the background");
        logger.important(
          "\nYour browser extension should now be able to connect."
        );
        logger.important(`Log file: ${logFile}`);
        logger.important("\nTo stop the daemon, run:");
        logger.important("  webpresence stop");
      } catch (error: any) {
        spinner.fail(`Error starting daemon: ${error.message}`);
      }
      return;
    }

    // Start in normal mode
    const spinner = ora("Starting WebPresence server...").start();

    try {
      // In normal mode, we don't need to skip Discord initialization
      const result = await startServer({ port: options.port });

      if (result.success) {
        spinner.succeed(`Server started on port ${result.port}`);
        logger.success("✓ WebSocket server running");
        logger.success("✓ Discord RPC initialized");
        logger.important(
          "\nYour browser extension should now be able to connect."
        );
        logger.important("Keep this terminal open to maintain the connection.");
        logger.important("\nTo run in background mode, use:");
        logger.important("  webpresence start -d");
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
  .option("--force", "Force kill the process if it doesn't stop gracefully")
  .action(async (options) => {
    const spinner = ora("Checking WebPresence server status...").start();

    try {
      // Get comprehensive server status
      const status = getServerStatus({
        checkPort: true,
        checkApi: true,
        checkDaemon: true,
      });

      if (!status.running) {
        spinner.info("No WebPresence server is running");
        return;
      }

      // If daemon is running, stop it
      const daemonRunning = isDaemonRunning();
      const pid = getDaemonPid();

      if (daemonRunning && pid) {
        spinner.text = `Stopping WebPresence daemon (PID: ${pid})...`;

        // Get the log file path
        const logFile = getDaemonLogPath();

        // Log the stop attempt
        fs.appendFileSync(
          logFile,
          `[${new Date().toISOString()}] Attempting to stop daemon with PID ${pid}\n`
        );

        // Send SIGTERM to the process
        try {
          process.kill(pid, "SIGTERM");

          // Wait for the process to exit
          let exited = false;
          await new Promise<void>((resolve) => {
            const checkInterval = setInterval(() => {
              try {
                // Check if process is still running
                process.kill(pid, 0);
              } catch (error) {
                // Process is no longer running
                clearInterval(checkInterval);
                exited = true;
                resolve();
              }
            }, 100);

            // Set a timeout in case the process doesn't exit
            setTimeout(() => {
              clearInterval(checkInterval);

              // If process is still running, try SIGKILL if force option is provided
              if (!exited) {
                if (options.force) {
                  try {
                    process.kill(pid, "SIGKILL");
                    fs.appendFileSync(
                      logFile,
                      `[${new Date().toISOString()}] Sent SIGKILL to daemon process ${pid}\n`
                    );
                  } catch (e) {
                    // Ignore errors
                  }
                } else {
                  spinner.warn(
                    "Daemon process is not responding. Use --force to kill it."
                  );
                }
              }

              resolve();
            }, 5000);
          });

          // Check if the PID file exists and remove it
          const daemonDir = path.join(os.homedir(), ".webpresence");
          const pidFile = path.join(daemonDir, "webpresence.pid");
          if (fs.existsSync(pidFile)) {
            fs.unlinkSync(pidFile);
          }

          // Log the successful stop
          fs.appendFileSync(
            logFile,
            `[${new Date().toISOString()}] Daemon process ${pid} stopped\n`
          );

          spinner.succeed("Daemon stopped");
        } catch (e) {
          // Process is not running
          spinner.info("Daemon was not running");

          // Check if the PID file exists and remove it
          const daemonDir = path.join(os.homedir(), ".webpresence");
          const pidFile = path.join(daemonDir, "webpresence.pid");
          if (fs.existsSync(pidFile)) {
            fs.unlinkSync(pidFile);
            spinner.info("Removed stale PID file");
          }
        }
      } else {
        // No daemon, but server is running - try API
        const serverPort = config.getServer().port;
        spinner.text = `Stopping WebPresence server on port ${serverPort}...`;

        // Try to use the API to stop the server
        try {
          const { default: fetch } = await import("node-fetch");

          // Use a promise with timeout instead of AbortController
          const fetchWithTimeout = async (
            url: string,
            options: Record<string, any>,
            timeout = 2000
          ) => {
            return Promise.race([
              fetch(url, options),
              new Promise((_, reject) =>
                setTimeout(
                  () => reject(new Error("Request timed out")),
                  timeout
                )
              ),
            ]);
          };

          try {
            await fetchWithTimeout(`http://localhost:${serverPort}/api/stop`, {
              method: "POST",
            });

            spinner.succeed("Server stopping via API");
          } catch (fetchError: any) {
            // If timeout or other error, we need to try another approach
            spinner.warn(
              "Could not stop server via API. Trying alternative methods..."
            );

            // Try to find and kill the process using the port
            try {
              // Find process using the port
              let pid;
              if (process.platform === "win32") {
                const output = require("child_process").execSync(
                  `netstat -ano | findstr :${serverPort}`,
                  { encoding: "utf8" }
                );
                // Extract PID from the last column
                const match = output.match(/(\d+)$/m);
                if (match) {
                  pid = parseInt(match[1], 10);
                }
              } else {
                // Linux/Unix
                const output = require("child_process").execSync(
                  `lsof -i :${serverPort} -t`,
                  { encoding: "utf8" }
                );
                pid = parseInt(output.trim(), 10);
              }

              if (pid) {
                spinner.text = `Found process using port ${serverPort} (PID: ${pid}). Stopping...`;

                if (process.platform === "win32") {
                  require("child_process").execSync(`taskkill /PID ${pid} /F`);
                } else {
                  process.kill(pid, "SIGTERM");

                  // If force option is provided, also try SIGKILL after a short delay
                  if (options.force) {
                    setTimeout(() => {
                      try {
                        process.kill(pid, "SIGKILL");
                      } catch (e) {
                        // Process might already be gone
                      }
                    }, 1000);
                  }
                }

                spinner.succeed(`Stopped process with PID ${pid}`);
              } else {
                spinner.warn("Could not find process using the server port");
              }
            } catch (e) {
              spinner.warn(
                "Could not stop server. You may need to manually kill the process."
              );
            }
          }

          // Wait a moment for the server to stop
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Check if port is still in use
          try {
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

            if (netstatOutput.trim().length > 0) {
              spinner.warn(
                "Server port still in use. Use --force to kill the process or manually terminate it."
              );
            } else {
              spinner.succeed("Server stopped successfully");
            }
          } catch (e) {
            // If netstat fails, assume port is no longer in use
            spinner.succeed("Server appears to be stopped");
          }
        } catch (e) {
          spinner.warn(
            "Could not stop server. You may need to manually kill the process."
          );
        }
      }

      // Final check to see if the server is still running
      try {
        const finalStatus = getServerStatus({ checkPort: true });
        if (finalStatus.running) {
          spinner.warn(
            "Server may still be running. Use --force to kill it or check running processes manually."
          );
        }
      } catch (e) {
        // Ignore errors in final check
      }
    } catch (error: any) {
      spinner.fail(`Error stopping server: ${error.message}`);
      logger.error(`Error details: ${error.stack}`);
    }
  });

// Status command
program
  .command("status")
  .description("Check the status of the WebPresence server")
  .action(async () => {
    console.log(chalk.bold("\nWebPresence Status:"));

    // Check daemon status using the improved isDaemonRunning function
    process.stdout.write(chalk.blue("Daemon running: "));
    const daemonRunning = isDaemonRunning();
    const daemonPid = getDaemonPid();

    if (daemonRunning) {
      console.log(chalk.green("Yes"));
      console.log(chalk.blue("Daemon PID:"), chalk.green(daemonPid));
      console.log(chalk.blue("Log file:"), chalk.green(getDaemonLogPath()));
    } else {
      console.log(chalk.red("No"));
    }

    // Get comprehensive server status using our improved function
    // This checks port usage, daemon status, and more
    const status = getServerStatus({
      checkPort: true,
      checkApi: true,
      checkDaemon: true,
    });

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

      // If the server is running but we want to stop it
      console.log(chalk.cyan("\nTo stop the server, run:"));
      console.log(chalk.cyan("  webpresence stop"));
    }

    // If nothing is running, show help
    if (!status.running) {
      console.log(chalk.cyan("\nTo start the server, run:"));
      console.log(chalk.cyan("  webpresence start"));
      console.log(chalk.cyan("\nTo start in daemon mode, run:"));
      console.log(chalk.cyan("  webpresence start -d"));
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

// Special daemon-start command (hidden from help)
program
  .command("daemon-start")
  .description("Start the server in daemon mode (internal use only)")
  .action(async () => {
    try {
      // Get the daemon log file path
      const logFile = path.join(
        os.homedir(),
        ".webpresence",
        "webpresence.log"
      );

      // Log the daemon start
      fs.appendFileSync(
        logFile,
        `[${new Date().toISOString()}] Daemon child process started\n`
      );

      // Check if server is already running to prevent multiple listen calls
      if (isServerRunning()) {
        fs.appendFileSync(
          logFile,
          `[${new Date().toISOString()}] Server is already running, not starting again\n`
        );
        return;
      }

      // Start the server directly
      // We don't need to skip Discord initialization in the daemon child process
      // as this is the only process that should be connecting to Discord
      const result = await startServer();

      if (!result.success) {
        fs.appendFileSync(
          logFile,
          `[${new Date().toISOString()}] Failed to start server: ${JSON.stringify(
            result
          )}\n`
        );
        process.exit(1);
      }

      fs.appendFileSync(
        logFile,
        `[${new Date().toISOString()}] Server started successfully on port ${
          result.port
        }\n`
      );
    } catch (error: any) {
      // Log the error
      const logFile = path.join(
        os.homedir(),
        ".webpresence",
        "webpresence.log"
      );
      fs.appendFileSync(
        logFile,
        `[${new Date().toISOString()}] Error in daemon child: ${
          error.message
        }\n${error.stack}\n`
      );
      process.exit(1);
    }
  }); // This command is not listed in help because it's for internal use only

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
