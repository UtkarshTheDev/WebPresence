# CLI Reference

Web Presence comes with a powerful command-line interface (CLI) that lets you control the server from your terminal. This guide explains all available commands and options.

## Basic Commands

| Command              | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `webpresence start`  | Start the Web Presence server                           |
| `webpresence stop`   | Stop the server                                         |
| `webpresence status` | Check if the server is running and connected to Discord |
| `webpresence toggle` | Turn Discord presence on or off                         |
| `webpresence config` | View or change configuration settings                   |
| `webpresence help`   | Show help information                                   |

## Detailed Usage

### Starting the Server

```bash
# Start the server normally
webpresence start

# Start in background (daemon) mode
webpresence start -d

# Start with verbose logging
webpresence start --verbose

# Start on a specific port
webpresence start --port 3001
```

When you start the server in daemon mode (`-d`), you can close the terminal and the server will continue running in the background.

### Checking Status

```bash
# Check if the server is running
webpresence status
```

This will show:

- If the server is running
- If it's connected to Discord
- The current port
- Whether presence is enabled

### Toggling Presence

```bash
# Toggle presence on
webpresence toggle --on

# Toggle presence off
webpresence toggle --off

# Toggle to opposite state
webpresence toggle
```

### Configuration

```bash
# View current configuration
webpresence config --view

# Change the prefix text (shown before website name)
webpresence config --prefix "Browsing"

# Add a site to the disabled list
webpresence config --disable-site "example.com"

# Remove a site from the disabled list
webpresence config --enable-site "example.com"

# Add a site to the always-show list
webpresence config --always-show "github.com"

# Remove a site from the always-show list
webpresence config --remove-always-show "github.com"

# Enable/disable continuous timer
webpresence config --continuous-timer true
webpresence config --continuous-timer false
```

### Stopping the Server

```bash
# Stop the server (works for both normal and daemon mode)
webpresence stop
```

## Advanced Usage

### Daemon Mode (Recommended)

Daemon mode is the recommended way to run Web Presence. It allows the server to run in the background, even after you close your terminal window.

#### Starting in Daemon Mode

```bash
# Start the server in daemon mode
webpresence start -d
```

#### Managing the Daemon

```bash
# Check if the daemon is running
webpresence status

# Stop the daemon
webpresence stop

# Restart the daemon
webpresence stop
webpresence start -d
```

#### How Daemon Mode Works

When running in daemon mode:

1. The server detaches from your terminal and runs in the background
2. It creates these files in your home directory:
   - `~/.webpresence/webpresence.pid` - Contains the process ID
   - `~/.webpresence/webpresence.log` - Log file for server output

#### Troubleshooting Daemon Mode

If you're having issues with daemon mode:

```bash
# View the daemon log
cat ~/.webpresence/webpresence.log

# Check if the process is running
ps -p $(cat ~/.webpresence/webpresence.pid)

# Force stop if needed
kill -9 $(cat ~/.webpresence/webpresence.pid)
```

#### Why Use Daemon Mode?

- **Convenience**: The server keeps running even if you close your terminal
- **Stability**: The server runs independently of your terminal session
- **Persistence**: The server starts automatically when your computer boots (if configured)

> **Note:** If you're developing or debugging, you might want to run without daemon mode to see logs directly in your terminal.

### Environment Variables

You can set these environment variables to change the server behavior:

- `WEBPRESENCE_PORT` - Set the server port (default: 8874)
- `WEBPRESENCE_LOG_LEVEL` - Set log level (default: 'info')
- `WEBPRESENCE_CONFIG_DIR` - Set custom config directory

Example:

```bash
WEBPRESENCE_PORT=3001 webpresence start
```

## Troubleshooting CLI Issues

If you encounter problems with the CLI:

1. Make sure you installed the package globally (`npm install -g webpresence`)
2. Try running with `--verbose` for more detailed logs
3. Check if another instance is already running
4. See the [Troubleshooting Guide](./TROUBLESHOOTING.md) for more help
