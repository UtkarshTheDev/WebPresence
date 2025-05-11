# Web Presence

<div align="center">
  <img src="client/chrome/icons/icon128.png" alt="Web Presence Logo" width="80">
  <h3>Share your browsing activity on Discord</h3>

Web Presence is a lightweight browser extension that displays your current web browsing activity in Discord through Rich Presence. Show your friends what websites you're exploring in real-time with an elegant, customizable interface.

</div>

## ✨ Features

- **Real-time Tracking**: Displays your active tab's information in Discord
- **Custom Site Icons**: Shows site-specific icons for popular websites
- **Focused Site Support**: Prioritizes development, gaming, and entertainment sites
- **Cross-browser Support**: Works with Chrome (Manifest V3) and Firefox (Manifest V2)
- **User Privacy**: Toggle presence on/off with a single click
- **Elegant UI**: Clean, Discord-themed interface
- **Cross-platform**: Compatible with Windows, macOS, and Linux
- **Expandable**: Easy to add support for more websites

## 🖼️ Screenshots

<div align="center">
  <p><i>Coming Soon</i></p>
</div>

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) or [Node.js](https://nodejs.org/) (v16+)
- Discord desktop application

### Installation

#### 1. Server Setup

```bash
# Clone the repository
git clone https://github.com/utkarshthedev/webpresence.git
cd webpresence

# Install and start the server
cd server
bun install
bun start
```

#### 2. Browser Extension Setup

**For Chrome:**

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `client/chrome` directory
4. The extension icon will appear in your toolbar

**For Firefox:**

1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select any file from the `client/firefox` directory
4. The extension icon will appear in your toolbar

## 💡 How to Use

1. Ensure the server is running (`bun start` in the server directory)
2. Verify Discord is open on your computer
3. Click the Web Presence extension icon in your browser
4. Toggle the switch to enable Rich Presence
5. Your browsing activity will now appear in your Discord profile

## 🔧 Troubleshooting

If you encounter any issues with the extension or Discord connection, please refer to the [Troubleshooting Guide](TROUBLESHOOTING.md) for detailed solutions to common problems.

## 🛠️ Development

### Building for Production

```bash
bun build index.ts --target node --outfile dist/index.js
```

### Using Your Own Discord Application

1. Create a new application at the [Discord Developer Portal](https://discord.com/developers/applications)
2. Copy your Client ID
3. Replace the `clientId` in `server/config.ts`
4. Upload custom assets for your Rich Presence display

### Custom Site Icons

Web Presence now supports custom icons for popular websites. When you visit a supported site, the Discord presence will show a site-specific icon instead of the generic web icon.

#### Automatic Icon Collection

We've included a script to automatically download icons for all the websites listed in `siteIcons.ts`:

```bash
cd scripts
npm install
npm run collect-icons
```

This script will:

1. Parse all domains from `siteIcons.ts`
2. Download icons from multiple sources
3. Process them to the correct size and format
4. Save them to the `assets/site-icons` directory
5. Generate a report of successful and failed downloads

For icons that couldn't be automatically downloaded, the script also generates a helper HTML file to assist with manual collection.

#### Adding Icons to Discord

Once you have the icons:

1. Go to your application in the [Discord Developer Portal](https://discord.com/developers/applications)
2. Navigate to the "Rich Presence" > "Art Assets" section
3. Upload your icons with names matching the `iconKey` values in `server/siteIcons.ts`
4. For example, upload an icon named `youtube` for YouTube, `github` for GitHub, etc.

The default configuration includes mappings for the most popular websites that users would want to show in their Discord presence, focusing on development, gaming, and entertainment sites. You can customize this list by editing the `siteIcons.ts` file.

### Contributing Icons

We welcome contributions of new site icons! If you'd like to add support for more websites:

1. Create a 512x512 PNG icon for the website
2. Add it to the `assets/site-icons` directory
3. Update the `server/siteIcons.ts` file with the new website entry
4. Submit a pull request

See the [CONTRIBUTING.md](CONTRIBUTING.md) file for detailed guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- [discord-rpc](https://www.npmjs.com/package/discord-rpc) for Discord integration
- [ws](https://www.npmjs.com/package/ws) for WebSocket communication

## 👤 Author

Made with ❤️ by [Utkarsh Tiwari](https://github.com/utkarshthedev)
