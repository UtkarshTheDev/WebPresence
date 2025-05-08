# Discord Web Presence Troubleshooting Guide

If you're experiencing issues with the Discord Web Presence extension, this guide will help you diagnose and fix common problems.

## Common Issues

### 1. "RPC_CONNECTION_TIMEOUT" Error

This error occurs when the server can't establish a connection with Discord's Rich Presence service.

**Possible causes:**
- Discord desktop app is not running
- Discord's Game Activity feature is disabled
- Firewall is blocking the connection
- Discord is running with insufficient permissions
- Discord's RPC server is not responding

**Solutions:**

1. **Make sure Discord is running**
   - Ensure you're running the Discord desktop application (not the web or mobile version)
   - Restart Discord completely (close it from the system tray and reopen)

2. **Check Discord settings**
   - Open Discord
   - Go to User Settings (gear icon)
   - Navigate to "Activity Settings" > "Activity Status"
   - Make sure the toggle for "Display current activity as a status message" is ON

3. **Run the Discord connection checker**
   ```bash
   cd server
   bun run check-discord
   ```
   This will tell you if your Discord installation is properly configured for RPC connections.

4. **Check firewall settings**
   - Make sure your firewall isn't blocking Discord or the Web Presence server
   - Try temporarily disabling your firewall to test if that's the issue

5. **Run Discord as administrator** (Windows only)
   - Right-click on Discord shortcut
   - Select "Run as administrator"

6. **Clear Discord cache**
   - Close Discord completely
   - Press Win+R (or open terminal on Mac/Linux)
   - Type `%appdata%\discord\Cache` on Windows or `~/Library/Application Support/discord/Cache` on Mac
   - Delete the contents of this folder
   - Restart Discord

### 2. Extension Shows "Server Disconnected"

This means your browser extension can't connect to the local server.

**Solutions:**

1. **Make sure the server is running**
   - Open a terminal
   - Navigate to the server directory
   - Run `bun start`
   - Verify it shows "Server running on http://localhost:3000"

2. **Check for port conflicts**
   - Make sure no other application is using port 3000
   - You can change the port in `server/index.ts` if needed

3. **Check browser permissions**
   - Make sure your browser allows connections to localhost
   - Check if any browser extensions might be blocking the connection

### 3. Extension Shows "Discord Disconnected"

This means the server is running but can't connect to Discord.

**Solutions:**
- Follow the solutions for "RPC_CONNECTION_TIMEOUT" above
- Try restarting both Discord and the server

### 4. Rich Presence Not Showing in Discord

If the extension appears to be working but your presence isn't showing up in Discord:

**Solutions:**

1. **Check Discord status**
   - Make sure your Discord status is not set to "Invisible"
   - Check if "Display current activity as a status message" is enabled

2. **Toggle the extension**
   - Try turning the extension off and on again
   - Check the server logs for any errors

3. **Verify Discord permissions**
   - Make sure Discord has permission to detect games and activities
   - Some antivirus software can block this functionality

## Advanced Troubleshooting

### Checking Discord RPC Logs

1. Enable Discord debug logging:
   - Close Discord
   - Open Discord with the `--debug` flag:
     - Windows: `discord.exe --debug`
     - Mac: `open -a Discord --args --debug`
     - Linux: `discord --debug`
   
2. Open Discord Developer Tools:
   - Press Ctrl+Shift+I (or Cmd+Option+I on Mac)
   - Go to the "Console" tab
   - Look for any errors related to RPC

### Checking Server Logs

Run the server in development mode for more detailed logs:
```bash
cd server
bun run dev
```

### Reinstalling Discord

If all else fails, try reinstalling Discord:
1. Uninstall Discord
2. Delete any remaining Discord folders:
   - Windows: `%appdata%\Discord` and `%localappdata%\Discord`
   - Mac: `~/Library/Application Support/discord`
   - Linux: `~/.config/discord`
3. Reinstall Discord from the official website

## Still Having Issues?

If you've tried all the steps above and are still experiencing problems:

1. Check the [GitHub Issues](https://github.com/yourusername/webpresence/issues) to see if others are experiencing the same problem
2. Create a new issue with:
   - Your operating system and version
   - Your Discord version
   - Browser type and version
   - Detailed description of the problem
   - Any error messages from the server console
   - Steps you've already tried

## Common Error Messages and Solutions

### "Failed to connect to Discord: RPC_CONNECTION_TIMEOUT"

This means the server can't establish a connection with Discord's RPC service.

**Solution:** Make sure Discord is running and properly configured as described above.

### "Error setting activity: CONNECTION_CLOSED"

This means the connection to Discord was established but then closed unexpectedly.

**Solution:** Restart Discord and the server.

### "WebSocket connection failed"

This means the browser extension can't connect to the local server.

**Solution:** Make sure the server is running and accessible at http://localhost:3000.
