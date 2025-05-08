# Web Presence

<div align="center">
  <img src="client/chrome/icons/icon128.png" alt="Web Presence Logo" width="80">
  <h3>Share your browsing activity on Discord</h3>
</div>

Web Presence is a lightweight browser extension that displays your current web browsing activity in Discord through Rich Presence. Show your friends what websites you're exploring in real-time with an elegant, customizable interface.

## ✨ Features

- **Real-time Tracking**: Displays your active tab's information in Discord
- **Cross-browser Support**: Works with Chrome (Manifest V3) and Firefox (Manifest V2)
- **User Privacy**: Toggle presence on/off with a single click
- **Elegant UI**: Clean, Discord-themed interface
- **Cross-platform**: Compatible with Windows, macOS, and Linux

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
3. Replace the `DISCORD_CLIENT_ID` in `server/index.ts`
4. Upload custom assets for your Rich Presence display

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgements

- [discord-rpc](https://www.npmjs.com/package/discord-rpc) for Discord integration
- [ws](https://www.npmjs.com/package/ws) for WebSocket communication

## 👤 Author

Made with ❤️ by [Utkarsh Tiwari](https://github.com/utkarshthedev)
