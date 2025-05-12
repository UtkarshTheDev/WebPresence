# WebPresence

Discord Rich Presence for websites - Show your browsing activity in Discord.

## Installation

### As a Package

```bash
# Install globally
npm install -g webpresence

# Or install locally in your project
npm install webpresence
```

### From Source

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

## Usage

### As a CLI Tool

```bash
# Install globally
npm install -g webpresence

# Start the server
webpresence start

# Start the server in daemon mode (background)
webpresence start -d

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

# Stop the server (works for both normal and daemon mode)
webpresence stop

# Get help
webpresence help
```

### As a Module

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

WebPresence includes TypeScript definitions for all exported functions and types:

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

## API Reference

### Core Functions

- `startServer(options?: { port?: number })` - Start the WebPresence server
- `stopServer()` - Stop the WebPresence server
- `isServerRunning()` - Check if the server is running
- `getServerStatus()` - Get current server status
- `togglePresence(enabled?: boolean)` - Enable or disable Discord presence
- `updatePreferences(preferences: UserPreferences)` - Update user preferences

### Daemon Mode

WebPresence can run as a background daemon process, allowing you to close the terminal while keeping the server running:

```bash
# Start in daemon mode
webpresence start -d

# Check daemon status
webpresence status

# Stop the daemon
webpresence stop
```

The daemon process creates the following files in your home directory:

- `~/.webpresence/webpresence.pid` - Contains the process ID of the daemon
- `~/.webpresence/webpresence.log` - Log file for daemon output

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes in each version.

### Configuration

Access and modify configuration through the `config` object:

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

## Project Structure

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

## Development

To run in development mode with auto-reload:

```bash
npm run dev
```

To build the package:

```bash
npm run build
```
