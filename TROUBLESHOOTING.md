# Web Presence Troubleshooting

Having trouble with Web Presence? This guide will help you solve common problems.

> **Note:** For a more detailed troubleshooting guide, see [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## Quick Solutions to Common Problems

### Discord Connection Issues

**Problem:** Server can't connect to Discord or shows "Discord: No" in the extension.

**Quick fixes:**

1. Make sure Discord desktop app is running (not web or mobile version)
2. Restart Discord completely (close from system tray and reopen)
3. Check Discord settings:
   - Go to User Settings > Activity Status
   - Make sure "Display current activity as a status message" is ON
4. Restart the Web Presence server:
   ```bash
   webpresence stop
   webpresence start
   ```

### Server Connection Issues

**Problem:** Extension shows "Server Disconnected" or can't connect to the server.

**Quick fixes:**

1. Make sure the server is running:
   ```bash
   webpresence status
   ```
2. If not running, start it:
   ```bash
   webpresence start
   ```
3. Check for port conflicts (default is port 8874)
4. Make sure your browser allows connections to localhost

### Presence Not Showing in Discord

**Problem:** Everything seems to be working, but presence doesn't appear in Discord.

**Quick fixes:**

1. Make sure your Discord status is not set to "Invisible"
2. Toggle the extension off and on again
3. Visit a supported website (like YouTube, GitHub, etc.)
4. Check if presence is disabled for the current site in extension settings

## Need More Help?

For more detailed troubleshooting:

1. See our [Complete Troubleshooting Guide](docs/TROUBLESHOOTING.md)
2. Check [GitHub Issues](https://github.com/utkarshthedev/webpresence/issues)
3. Run the server with verbose logging:
   ```bash
   webpresence start --verbose
   ```

If you're still having problems, please open an issue with:

- Your operating system and browser
- Steps to reproduce the problem
- Any error messages you see
