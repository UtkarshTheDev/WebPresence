# Troubleshooting Guide

Having trouble with Web Presence? This guide covers common issues and their solutions.

## Common Issues

### Server Won't Start

**Symptoms:**
- Error message when running `webpresence start`
- No response when starting the server

**Solutions:**
1. Check if the server is already running: `webpresence status`
2. Make sure no other application is using port 8874
3. Try running with verbose logging: `webpresence start --verbose`
4. Check for Node.js errors:
   ```bash
   # Check your Node.js version
   node -v
   
   # Make sure it's v16 or higher
   ```

### Discord Connection Issues

**Symptoms:**
- "Failed to connect to Discord" error
- Extension shows "Discord: No" even though Discord is running

**Solutions:**
1. Make sure Discord desktop app is running
2. Restart Discord completely
3. Restart the Web Presence server: `webpresence stop` then `webpresence start`
4. Check if Discord is running with administrator privileges (if so, run the server with admin privileges too)

### Extension Not Working

**Symptoms:**
- Extension icon is grayed out
- Toggling presence has no effect
- Discord doesn't show your browsing activity

**Solutions:**
1. Make sure the server is running: `webpresence status`
2. Check if the extension is properly installed
3. Try reloading the extension:
   - Chrome: Go to `chrome://extensions/`, find Web Presence, and click the refresh icon
   - Firefox: Reinstall the temporary extension
4. Check if you're on a supported website (some websites may not show icons)

### Incorrect Status Reporting

**Symptoms:**
- Extension shows "Connected: No" but presence is working
- Server status doesn't match actual state

**Solutions:**
1. Click the refresh button in the extension popup
2. Restart the server: `webpresence stop` then `webpresence start`
3. Make sure you're using the latest version of both the server and extension

### Daemon Mode Problems

**Symptoms:**
- Server doesn't stay running in daemon mode
- Error: "Listen method has been called more than once without closing"

**Solutions:**
1. Stop all instances first: `webpresence stop`
2. Check if any processes are still running: `ps aux | grep webpresence`
3. Kill any remaining processes: `kill -9 [PID]`
4. Start fresh in daemon mode: `webpresence start -d`
5. Check the daemon log: `cat ~/.webpresence/webpresence.log`

## Specific Error Messages

### "Failed to connect to Discord: Error: connection closed"

This usually means:
1. Discord isn't running
2. Discord RPC port is blocked
3. There's a connection issue between the server and Discord

**Solutions:**
1. Restart Discord
2. Restart the Web Presence server
3. Make sure no firewall is blocking the connection

### "Dynamic require of child_process is not supported"

This error occurs in certain environments when checking daemon status.

**Solutions:**
1. Update to the latest version of Web Presence
2. Try running without daemon mode: `webpresence start` (without `-d`)

## Still Having Problems?

If you've tried these solutions and still have issues:

1. Check the [GitHub Issues](https://github.com/utkarshthedev/webpresence/issues) to see if others have reported the same problem
2. Open a new issue with:
   - Detailed description of the problem
   - Steps to reproduce
   - Your operating system and browser
   - Any error messages you're seeing
   - Output of `webpresence status --verbose`
