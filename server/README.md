# 🌐 WebPresence

<div align="center">
  <img src="../client/chrome/icons/icon128.png" alt="WebPresence Logo" width="100">

  <h2>Discord Rich Presence for Websites</h2>

  <p>
    <b>Show your browsing activity in Discord with custom icons for popular websites</b>
  </p>

  <p>
    <a href="#-installation">Installation</a> •
    <a href="#-usage">Usage</a> •
    <a href="#-features">Features</a> •
    <a href="#-api-reference">API Reference</a> •
    <a href="#-development">Development</a>
  </p>
</div>

## ✨ What is WebPresence?

WebPresence is a Node.js package that connects your browser to Discord, showing your current website in your Discord profile. When you browse websites like YouTube, GitHub, or Twitter, your Discord profile displays what you're doing with custom icons for each site.

<div align="center">
  <img src="../screenshots/discord_profile_example.png" alt="Discord Profile Example" width="500">
</div>

## 🚀 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or higher)
- Discord desktop application

### Option 1: Install as a Package (Recommended)

```bash
# Install globally
npm install -g webpresence

# Start the server
webpresence start

# Or start in daemon mode (runs in background)
webpresence start -d
```

### Option 2: Install from Source

```bash
# Clone the repository
git clone https://github.com/utkarshthedev/webpresence.git
cd webpresence/server

# Install dependencies
npm install

# Build the package
npm run build

# Start the server
npm start
```

## 🔧 Usage

### Command Line Interface (CLI)

WebPresence comes with a powerful CLI that makes it easy to control the server:

```bash
# Start the server
webpresence start

# Start in daemon mode (background)
webpresence start -d

# Configure to start automatically on system boot
webpresence autostart --enable

# Check server status
webpresence status

# Toggle Discord presence on/off
webpresence toggle --on
webpresence toggle --off

# Configure preferences
webpresence config --view
webpresence config --prefix "Browsing"
webpresence config --disable-site "example.com"
webpresence config --always-show "github.com"

# Stop the server
webpresence stop

# Get help
webpresence help
```

### Using as a JavaScript/TypeScript Module

WebPresence can be imported and used in your own Node.js applications:

```javascript
// ESM
import WebPresence from "webpresence";

// Start the server
const { success, port } = await WebPresence.startServer();
if (success) {
  console.log(`Server running on port ${port}`);
}

// Check status
const status = WebPresence.getServerStatus();
console.log(`Discord connected: ${status.discordConnected}`);

// Toggle presence
const result = await WebPresence.togglePresence(true);
console.log(`Presence enabled: ${result.enabled}`);

// Stop the server
await WebPresence.stopServer();
```

### TypeScript Support

WebPresence includes full TypeScript definitions:

```typescript
import WebPresence, { UserPreferences, ServerConfig } from "webpresence";

// Update user preferences
const preferences: UserPreferences = {
  prefixText: "Browsing",
  disabledSites: ["example.com"],
  alwaysEnabledSites: ["github.com"],
  continuousTimer: true,
};

const result = await WebPresence.updatePreferences(preferences);
```

## 🌟 Features

### Daemon Mode

Run WebPresence in the background without keeping a terminal window open:

```bash
# Start in daemon mode
webpresence start -d

# Check daemon status
webpresence status

# Stop the daemon
webpresence stop
```

The daemon creates these files in your home directory:

- `~/.webpresence/webpresence.pid` - Process ID of the daemon
- `~/.webpresence/webpresence.log` - Log file for daemon output

### Autostart Configuration

Configure WebPresence to start automatically when your computer boots:

```bash
# Enable autostart
webpresence autostart --enable

# Disable autostart
webpresence autostart --disable

# Check autostart status
webpresence autostart --status
```

### Configuration Management

Access and modify configuration through the API:

```javascript
import { config } from "webpresence";

// Get current configuration
const serverConfig = config.getServer();
const discordConfig = config.getDiscord();
const userPrefs = config.getUserPreferences();

// Update user preferences
config.updateUserPreferences({
  prefixText: "Exploring",
  continuousTimer: false,
});
```

## 📚 API Reference

### Core Functions

| Function                                          | Description                        |
| ------------------------------------------------- | ---------------------------------- |
| `startServer(options?: { port?: number })`        | Start the WebPresence server       |
| `stopServer()`                                    | Stop the WebPresence server        |
| `isServerRunning()`                               | Check if the server is running     |
| `getServerStatus()`                               | Get current server status          |
| `togglePresence(enabled?: boolean)`               | Enable or disable Discord presence |
| `updatePreferences(preferences: UserPreferences)` | Update user preferences            |

### Configuration API

| Function                              | Description               |
| ------------------------------------- | ------------------------- |
| `config.getServer()`                  | Get server configuration  |
| `config.getDiscord()`                 | Get Discord configuration |
| `config.getUserPreferences()`         | Get user preferences      |
| `config.updateUserPreferences(prefs)` | Update user preferences   |

## 📁 Project Structure

```
src/
├── api.ts                    # Main package entry point
├── index.ts                  # Server implementation
├── config/                   # Configuration files
├── services/                 # Core services (Discord, WebSocket)
├── data/                     # Data files (site icons)
├── routes/                   # API routes
└── utils/                    # Utility functions
```

## 👨‍💻 Development

### Quick Development Setup

```bash
# Clone and setup
git clone https://github.com/utkarshthedev/webpresence.git
cd webpresence/server
npm install

# Start development server with hot reload
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload and verbose logging |
| `npm run build` | Build for production |
| `npm run build:watch` | Build with watch mode |
| `npm run link:dev` | Build and link package locally for CLI testing |
| `npm run unlink:dev` | Unlink local development package |
| `npm run server:start` | Start server using CLI (after linking) |
| `npm run server:daemon` | Start server in daemon mode |
| `npm run server:status` | Check server status |

### Local Development Workflow

1. **CLI Testing** (Recommended):
   ```bash
   npm run link:dev     # Link package locally
   webpresence start -d # Test CLI commands
   webpresence status   # Verify functionality
   npm run unlink:dev   # Unlink when done
   ```

2. **Development Mode** (For core development only):
   ```bash
   npm run dev  # Starts server with hot reload
   ```

**Why CLI testing is preferred:**
- Tests the actual user experience
- Validates complete package functionality
- Ensures CLI commands work correctly

### Testing

```bash
# Run tests (coming soon)
npm test

# Manual testing (recommended method)
npm run link:dev        # Link package locally
webpresence start -d    # Start server via CLI
webpresence status      # Test CLI commands
# Load browser extension and test functionality
npm run unlink:dev      # Unlink when done
```

For comprehensive development instructions, see the [Developer Guide](../docs/DEVELOPER.md).

## 📋 Developer Resources

- [**Developer Guide**](../docs/DEVELOPER.md) - Complete development setup and workflow
- [**API Documentation**](../docs/API.md) - REST API and WebSocket reference
- [**Contributing Guide**](../CONTRIBUTING.md) - Detailed instructions for contributors
- [**Site Icons Guide**](../docs/SITE_ICONS.md) - How to add new website icons
- [**CLI Reference**](../docs/CLI.md) - All command-line options
- [**All Documentation**](../docs/README.md) - Complete documentation index

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes in each version.

## 🤝 Contributing

Contributions are welcome! See the [Contributing Guide](../CONTRIBUTING.md) for more information.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 👤 Author

Made with ❤️ by [Utkarsh Tiwari](https://github.com/utkarshthedev)
