# Web Presence

A browser extension that displays your current browsing activity in Discord via Rich Presence.

## Features

- Tracks currently active tab's metadata (title, URL, favicon)
- Updates Discord Rich Presence in real-time
- Works with both Chrome (Manifest V3) and Firefox (Manifest V2)
- Elegant UI with toggle to enable/disable presence
- Cross-platform compatibility (Windows, Mac, Linux)

## Screenshots

(Add screenshots here)

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) or [Bun](https://bun.sh/) installed
- Discord desktop application installed and running

### Server Setup

1. Clone this repository:

   ```
   git clone https://github.com/yourusername/webpresence.git
   cd webpresence
   ```

2. Change to the server directory:

   ```
   cd server
   ```

3. Install dependencies:

   ```
   bun install
   ```

4. Start the server:
   ```
   bun start
   ```

### Chrome Extension Setup

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top-right corner)
3. Click "Load unpacked" and select the `client/chrome` directory from this project
4. The extension should now appear in your browser toolbar

### Firefox Extension Setup

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Select any file within the `client/firefox` directory from this project
4. The extension should now appear in your browser toolbar

## Usage

1. Start the local server (`bun start` in the server directory)
2. Make sure Discord is running
3. Click the Web Presence extension icon in your browser toolbar
4. Toggle the switch to enable/disable Rich Presence
5. Your current browsing activity will now appear in your Discord status

### Checking Discord Connection

If you're having trouble connecting to Discord, you can run the connection checker:

```bash
cd server
bun run check-discord
```

This will tell you if Discord is properly configured for Rich Presence.

### Troubleshooting

If you encounter any issues, please refer to the [Troubleshooting Guide](TROUBLESHOOTING.md) for detailed solutions to common problems.

## Development

### Building the server for production

```
bun build index.ts --target node --outfile dist/index.js
```

### Modifying the Discord Client ID

If you want to use your own Discord application:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Copy the Client ID
4. Replace the `DISCORD_CLIENT_ID` constant in `server/index.ts` with your ID

## License

MIT

## Acknowledgements

- [discord-rpc](https://www.npmjs.com/package/discord-rpc) - Discord Rich Presence client library
- [ws](https://www.npmjs.com/package/ws) - WebSocket implementation for Node.js
