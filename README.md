# Web Presence

<div align="center">
  <img src="client/chrome/icons/icon128.png" alt="Web Presence Logo" width="80">
  <h3>Share your browsing activity on Discord</h3>

Web Presence shows your friends what websites you're browsing in real-time through Discord Rich Presence. It's easy to set up and works with most popular websites!

</div>

## What is Web Presence?

Web Presence is a simple tool that shows your current website in your Discord profile. When you browse websites like YouTube, GitHub, or Twitter, your Discord profile will display what you're doing with custom icons for each site.

![Discord Profile Example](https://i.imgur.com/example.png)

## Features

- 🌐 **Shows your current website** in Discord profile
- 🎮 **Custom icons** for popular websites (YouTube, GitHub, Twitter, etc.)
- 🔒 **Privacy controls** - easily turn it on/off or disable for specific sites
- 🖥️ **Works on all platforms** - Windows, Mac, and Linux
- 🧩 **Browser extension** for Chrome and Firefox

## Quick Install Guide

### Step 1: Install the Server

```bash
# Install with npm (make sure you have Node.js installed)
npm install -g webpresence

# Start the server in daemon mode (runs in background)
webpresence start -d

# Check if server is running
webpresence status
```

> **Tip:** Using daemon mode (`-d`) lets the server run in the background so you can close your terminal window!

### Step 2: Install the Browser Extension

**For Chrome:**

1. Download the extension files
2. Go to `chrome://extensions/`
3. Turn on "Developer mode" (top-right corner)
4. Click "Load unpacked" and select the `client/chrome` folder

**For Firefox:**

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select any file from the `client/firefox` folder

### Step 3: Start Using It!

1. Make sure Discord is open on your computer
2. Click the Web Presence icon in your browser
3. Toggle the switch to turn it on
4. Start browsing - your activity will show in Discord!

## Need Help?

- [Installation Guide](docs/INSTALLATION.md) - Detailed setup instructions
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Solutions to common problems
- [CLI Guide](docs/CLI.md) - How to use command-line features
- [All Documentation](docs/index.md) - Complete documentation

## For Developers

Want to customize Web Presence or contribute to the project? Check out these resources:

- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- [Site Icons Guide](docs/SITE_ICONS.md) - How to add new website icons
- [CLI Reference](docs/CLI.md) - All command-line options

## Using Your Own Discord Application

You can use your own Discord application instead of the default one:

1. Create a new application at the [Discord Developer Portal](https://discord.com/developers/applications)
2. Copy your Client ID
3. Replace the `clientId` in `server/config.ts`
4. Upload custom icons to your Discord application

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

See [server/CHANGELOG.md](server/CHANGELOG.md) for a list of changes in each version.

## Author

Made with ❤️ by [Utkarsh Tiwari](https://github.com/utkarshthedev)
