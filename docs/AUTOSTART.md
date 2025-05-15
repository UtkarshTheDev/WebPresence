# Autostart Configuration

This guide explains how to configure Web Presence to start automatically when your computer boots up, ensuring Discord presence is always available without manual intervention.

## Quick Setup

The easiest way to enable autostart is using the CLI command:

```bash
# Enable autostart
webpresence autostart --enable

# Check autostart status
webpresence autostart

# Disable autostart
webpresence autostart --disable
```

## How It Works

When you enable autostart, Web Presence creates the appropriate configuration for your operating system:

- **Windows**: Creates a task in Windows Task Scheduler
- **macOS**: Creates a LaunchAgent in `~/Library/LaunchAgents`
- **Linux**: Creates a desktop entry in `~/.config/autostart`

The autostart configuration will launch Web Presence in daemon mode when you log in to your computer.

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

On Linux, Web Presence creates a desktop entry file in `~/.config/autostart/webpresence.desktop`.

#### Manual Setup (if CLI method fails)

1. Create a file at `~/.config/autostart/webpresence.desktop` with the following content:

```
[Desktop Entry]
Type=Application
Name=WebPresence
Exec=webpresence start -d
Terminal=false
X-GNOME-Autostart-enabled=true
Comment=Discord Rich Presence for websites
```

2. Make it executable:

```bash
chmod +x ~/.config/autostart/webpresence.desktop
```

#### Troubleshooting

- Verify the path to `webpresence` is correct (use `which webpresence` to find it)
- Check if your desktop environment supports XDG autostart
- For non-GNOME environments, you may need to use your DE's specific autostart method

## Verifying Autostart Works

To verify that autostart is working correctly:

1. Enable autostart: `webpresence autostart --enable`
2. Restart your computer
3. After logging in, check the status: `webpresence status`

You should see that the server is running and connected to Discord.

## Common Issues

### Server Doesn't Start Automatically

- Check if Discord is installed and running at startup
- Verify that WebPresence is installed globally (`npm list -g webpresence`)
- Check the logs in `~/.webpresence/webpresence.log`
- Try running `webpresence start -d` manually to see if there are any errors

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
