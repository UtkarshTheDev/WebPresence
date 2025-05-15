# Autostart Configuration (BETA)

This guide explains how to configure Web Presence to start automatically when your computer boots up, ensuring Discord presence is always available without manual intervention.

> **Note**: The autostart feature is currently in BETA. While it works well on most systems, you may encounter issues on some configurations. Please report any problems you encounter.

## Quick Setup

The easiest way to enable autostart is using the CLI command:

```bash
# Enable autostart (uses the best method for your system)
webpresence autostart --enable

# Check autostart status
webpresence autostart

# Disable autostart
webpresence autostart --disable
```

### Linux-Specific Options

On Linux, you can choose between different autostart methods:

```bash
# Enable autostart using systemd (recommended for Arch Linux)
webpresence autostart --enable --method=systemd

# Enable autostart using XDG autostart
webpresence autostart --enable --method=xdg

# Disable a specific method
webpresence autostart --disable --method=systemd
```

## How It Works

When you enable autostart, Web Presence creates the appropriate configuration for your operating system:

- **Windows**: Creates a task in Windows Task Scheduler
- **macOS**: Creates a LaunchAgent in `~/Library/LaunchAgents`
- **Linux**: Uses one of two methods:
  - **systemd**: Creates a user service in `~/.config/systemd/user/` (recommended for Arch Linux)
  - **XDG autostart**: Creates a desktop entry in `~/.config/autostart`

The autostart configuration will launch Web Presence when you log in to your computer.

### Automatic Method Selection

On Linux, Web Presence automatically selects the best method for your distribution:

- For Arch Linux and other systemd-based distributions, it uses systemd user services
- For other distributions, it uses XDG autostart

You can override this selection with the `--method` option.

## OS-Specific Details

### Windows

On Windows, Web Presence uses Task Scheduler to create a login task that runs `webpresence start -d` when you log in.

#### Manual Setup (if CLI method fails)

1. Open Task Scheduler (search for it in the Start menu)
2. Click "Create Basic Task..."
3. Name it "WebPresence" and click Next
4. Select "When I log on" and click Next
5. Select "Start a program" and click Next
6. In "Program/script", enter the full path to `webpresence.cmd` (usually in `%APPDATA%\npm\webpresence.cmd`)
7. In "Add arguments", enter `start -d`
8. Click Next, then Finish

#### Troubleshooting

- If you get "Access denied" errors, try running the CLI command as Administrator
- Verify the task exists in Task Scheduler under "Task Scheduler Library"

### macOS

On macOS, Web Presence creates a LaunchAgent plist file in `~/Library/LaunchAgents/com.utkarsh.webpresence.plist`.

#### Manual Setup (if CLI method fails)

1. Create a file at `~/Library/LaunchAgents/com.utkarsh.webpresence.plist` with the following content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.utkarsh.webpresence</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/webpresence</string>
        <string>start</string>
        <string>-d</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>~/.webpresence/launchd.log</string>
    <key>StandardErrorPath</key>
    <string>~/.webpresence/launchd.log</string>
</dict>
</plist>
```

2. Load the LaunchAgent:

```bash
launchctl load ~/Library/LaunchAgents/com.utkarsh.webpresence.plist
```

#### Troubleshooting

- Check the log file at `~/.webpresence/launchd.log` for errors
- Verify the path to `webpresence` is correct (use `which webpresence` to find it)
- Make sure the LaunchAgent is loaded with `launchctl list | grep webpresence`

### Linux

On Linux, Web Presence supports two autostart methods:

#### Method 1: systemd User Service (Recommended for Arch Linux)

This method creates a systemd user service that starts WebPresence when you log in.

```bash
# Enable with systemd method
webpresence autostart --enable --method=systemd
```

The systemd service:

- Is created at `~/.config/systemd/user/webpresence.service`
- Automatically restarts if it crashes
- Starts after the network and graphical session are ready
- Includes proper environment variables for npm global binaries

##### Manual Setup (if CLI method fails)

1. Create a systemd user service file at `~/.config/systemd/user/webpresence.service`:

```ini
[Unit]
Description=WebPresence Discord Rich Presence Server
After=network.target graphical-session.target

[Service]
ExecStart=/home/YOUR_USERNAME/.npm-global/bin/webpresence start
Restart=on-failure
RestartSec=10
Environment=PATH=/home/YOUR_USERNAME/.npm-global/bin:/usr/local/bin:/usr/bin:/bin

[Install]
WantedBy=default.target
```

2. Enable and start the service:

```bash
systemctl --user daemon-reload
systemctl --user enable webpresence.service
systemctl --user start webpresence.service
```

##### Troubleshooting systemd

- Check service status: `systemctl --user status webpresence.service`
- View logs: `journalctl --user -u webpresence.service -f`
- Verify the path to `webpresence` is correct (use `which webpresence` to find it)
- Make sure systemd user services are enabled: `loginctl enable-linger $USER`

#### Method 2: XDG Autostart

This method creates:

1. A startup script at `~/.webpresence/startup.sh` that handles proper environment setup
2. A desktop entry file at `~/.config/autostart/webpresence.desktop` that runs the startup script

```bash
# Enable with XDG method
webpresence autostart --enable --method=xdg
```

The startup script includes:

- A delay to ensure the desktop environment is fully loaded
- Path setup to find npm global binaries
- Checks to ensure Discord is running
- Detailed logging to `~/.webpresence/autostart.log`

##### Manual Setup (if CLI method fails)

1. Create a startup script at `~/.webpresence/startup.sh`:

```bash
#!/bin/bash
# Wait for desktop environment to fully load
sleep 10

# Ensure PATH includes npm global bin directories
export PATH="$PATH:$HOME/.npm-global/bin:/usr/local/bin:$HOME/.local/bin"

# Log startup attempt
echo "[$(date)] Starting WebPresence..." >> "$HOME/.webpresence/autostart.log"

# Check if Discord is running
if pgrep -x "Discord" > /dev/null || pgrep -x "discord" > /dev/null; then
    echo "[$(date)] Discord is running, starting WebPresence..." >> "$HOME/.webpresence/autostart.log"
else
    echo "[$(date)] Discord is not running, waiting 30 seconds..." >> "$HOME/.webpresence/autostart.log"
    sleep 30
fi

# Start WebPresence
webpresence start -d >> "$HOME/.webpresence/autostart.log" 2>&1

# Log completion
echo "[$(date)] Startup script completed" >> "$HOME/.webpresence/autostart.log"
```

2. Make the script executable:

```bash
chmod +x ~/.webpresence/startup.sh
```

3. Create a desktop entry at `~/.config/autostart/webpresence.desktop`:

```
[Desktop Entry]
Type=Application
Name=WebPresence
Exec=/home/YOUR_USERNAME/.webpresence/startup.sh
Terminal=false
X-GNOME-Autostart-enabled=true
StartupNotify=false
Hidden=false
NoDisplay=false
Comment=Discord Rich Presence for websites
```

4. Make the desktop entry executable:

```bash
chmod +x ~/.config/autostart/webpresence.desktop
```

##### Troubleshooting XDG Autostart

- Check the log file at `~/.webpresence/autostart.log` for errors
- Verify the path to `webpresence` is correct (use `which webpresence` to find it)
- Make sure both the startup script and desktop entry are executable
- For non-GNOME environments, check if your desktop environment supports XDG autostart
- Try increasing the sleep time in the startup script if Discord isn't ready when WebPresence starts

## Verifying Autostart Works

To verify that autostart is working correctly:

1. Enable autostart: `webpresence autostart --enable`
2. Restart your computer
3. After logging in, check the status: `webpresence status`

You should see that the server is running and connected to Discord.

## Common Issues

### Server Doesn't Start Automatically

#### General Troubleshooting

- Check if Discord is installed and running at startup
- Verify that WebPresence is installed globally (`npm list -g webpresence`)
- Check the logs in `~/.webpresence/webpresence.log`
- Try running `webpresence start -d` manually to see if there are any errors

#### Linux-Specific Issues

For systemd method:

- Check service status: `systemctl --user status webpresence.service`
- View logs: `journalctl --user -u webpresence.service -f`
- Make sure systemd user services are enabled: `loginctl enable-linger $USER`
- Try manually starting the service: `systemctl --user start webpresence.service`

For XDG autostart method:

- Check the autostart log: `cat ~/.webpresence/autostart.log`
- Verify that the startup script is executable: `ls -la ~/.webpresence/startup.sh`
- Try running the startup script manually: `~/.webpresence/startup.sh`
- Check if your desktop environment supports XDG autostart
- Some desktop environments may need additional configuration:
  - KDE: Try using KDE's System Settings > Startup and Shutdown > Autostart
  - XFCE: Try using Session and Startup > Application Autostart
  - i3/Sway: Add the startup script to your config file
- If using Wayland, some autostart methods may behave differently

For all methods:

- Make sure npm's global bin directory is in your PATH
- For Arch Linux, we recommend using the systemd method: `webpresence autostart --enable --method=systemd`
- Try both methods to see which works best for your system

### Discord Connection Issues

If the server starts but doesn't connect to Discord:

- Make sure Discord is running before the server starts
- Check if Discord's "Game Activity" setting is enabled
- Try restarting Discord and then the WebPresence server

### Permission Issues

- On Windows, you may need to run the autostart command as Administrator
- On macOS/Linux, check file permissions for the autostart configuration files

## Additional Resources

- [CLI Reference](CLI.md) - Complete command-line reference
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Solutions to common problems
