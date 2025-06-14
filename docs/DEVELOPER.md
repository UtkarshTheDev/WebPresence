# 👨‍💻 WebPresence Developer Guide

This comprehensive guide will help you set up a development environment, understand the codebase, and contribute to WebPresence.

## 🚀 Quick Start for Developers

### Prerequisites

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Discord Desktop App** - Required for testing
- **Chrome or Firefox** - For testing browser extension

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/utkarshthedev/webpresence.git
cd webpresence

# Navigate to server directory
cd server

# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Development Workflow (Recommended: Link Package Method)

#### Option A: Link Package Locally (Recommended)

```bash
# Build and link the package locally
npm run link:dev

# Now you can use the CLI globally for testing
webpresence start -d
webpresence status
webpresence toggle --on
webpresence config --view

# When done developing, unlink
npm run unlink:dev
```

**Why this method is preferred:**
- Tests the actual CLI commands that users will use
- Validates the complete package build process
- Ensures CLI functionality works correctly
- Simulates real-world usage scenarios

#### Option B: Direct Development (For Core Development)

```bash
# Start development server with hot reload
npm run dev
```

Use this only for:
- Core server development
- Debugging server internals
- When you need hot reload for rapid iteration

### 3. Testing Your Changes (Recommended Workflow)

```bash
# 1. Build and link your changes
npm run link:dev

# 2. Test all CLI commands
webpresence --help
webpresence start -d
webpresence status
webpresence toggle --on
webpresence config --view
webpresence autostart --status
webpresence stop

# 3. Test with browser extension
# Load extension in browser and test functionality

# 4. When done testing, unlink
npm run unlink:dev
```

## 📁 Project Structure

```
webpresence/
├── client/                 # Browser extensions
│   ├── chrome/            # Chrome extension
│   └── firefox/           # Firefox extension
├── server/                # Node.js server package
│   ├── src/              # TypeScript source code
│   │   ├── api.ts        # Public API exports
│   │   ├── index.ts      # Main server implementation
│   │   ├── cli.ts        # Command-line interface
│   │   ├── config/       # Configuration management
│   │   ├── services/     # Core services (Discord, WebSocket)
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utility functions
│   ├── dist/             # Compiled JavaScript (generated)
│   └── package.json      # Package configuration
├── docs/                 # Documentation
├── scripts/              # Utility scripts
└── assets/               # Static assets (icons, etc.)
```

## 🔧 Available Scripts

### Development Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build the project for production |
| `npm run build:watch` | Build with watch mode |
| `npm run clean` | Clean build artifacts |

### Local Package Management

| Script | Description |
|--------|-------------|
| `npm run link:dev` | Build and link package locally |
| `npm run unlink:dev` | Unlink local package |

### Server Management (after linking)

| Script | Description |
|--------|-------------|
| `npm run server:start` | Start server normally |
| `npm run server:daemon` | Start server in daemon mode |
| `npm run server:stop` | Stop the server |
| `npm run server:status` | Check server status |

### Testing

| Script | Description |
|--------|-------------|
| `npm test` | Run tests (placeholder for now) |

## 🛠️ Development Tips

### 1. Recommended Development Workflow

**Always use the link package method for testing:**

```bash
# Make your changes to the code
# Then build and test with CLI
npm run link:dev

# Test your changes
webpresence start -d
webpresence status

# Test browser extension
# Load the extension from client/chrome or client/firefox

# Unlink when done
npm run unlink:dev
```

### 2. Hot Reload Development (Only for Core Development)

Use `npm run dev` only when working on core server functionality:

```bash
# Only use this for internal server development
npm run dev
```

### 3. Testing CLI Commands (Primary Testing Method)

**This is the recommended way to test your changes:**

```bash
# Link your changes
npm run link:dev

# Test all CLI commands
webpresence --help
webpresence start -d
webpresence status
webpresence stop
webpresence config --view
webpresence autostart --status
webpresence toggle --on

# Unlink when done
npm run unlink:dev
```

### 4. Debugging

For debugging, use the CLI method with verbose output:

```bash
# Link package first
npm run link:dev

# Start with verbose logging
webpresence start --verbose

# Or check logs
webpresence logs
```

### 5. Browser Extension Development

**Important:** Always start the server using the CLI method before testing the extension:

```bash
# 1. Link and start server
npm run link:dev
webpresence start -d

# 2. Load browser extension
```

**Chrome:**
- Go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select `client/chrome` folder

**Firefox:**
- Go to `about:debugging#/runtime/this-firefox`
- Click "Load Temporary Add-on..."
- Select `manifest.json` from `client/firefox`

**Testing:**
```bash
# Check server status
webpresence status

# Test extension functionality by visiting websites
# Check Discord profile for presence updates
```

## 🔍 Understanding the Codebase

### Core Components

1. **Server (`src/index.ts`)**
   - Main server implementation
   - Express.js HTTP server
   - WebSocket server for browser communication
   - Discord RPC integration

2. **CLI (`src/cli.ts`)**
   - Command-line interface
   - Uses Commander.js for argument parsing
   - Daemon management utilities

3. **API (`src/api.ts`)**
   - Public API exports for npm package
   - TypeScript type definitions

4. **Services**
   - `services/discord.js` - Discord RPC connection
   - `services/websocket.js` - WebSocket server management

5. **Configuration (`config/`)**
   - Server configuration
   - User preferences
   - Site icons database

### Key Files to Know

| File | Purpose |
|------|---------|
| `src/index.ts` | Main server entry point |
| `src/cli.ts` | Command-line interface |
| `src/api.ts` | Public API exports |
| `src/services/discord.js` | Discord integration |
| `src/services/websocket.js` | Browser communication |
| `src/config/index.ts` | Configuration management |

## 🧪 Testing Your Changes

### 1. CLI Testing (Primary Method)

**This is the main way to test your changes:**

```bash
# Build and link your changes
npm run link:dev

# Test all CLI functionality
webpresence --help
webpresence start -d
webpresence status
webpresence toggle --on
webpresence config --view
webpresence autostart --enable
webpresence stop

# Unlink when done
npm run unlink:dev
```

### 2. Browser Extension Testing

**Always test with the CLI-started server:**

```bash
# 1. Start server via CLI
npm run link:dev
webpresence start -d

# 2. Load extension in browser
# 3. Visit websites and check Discord profile
# 4. Test extension popup functionality
# 5. Verify WebSocket connection

# 6. Clean up
webpresence stop
npm run unlink:dev
```

### 3. API Testing

```bash
# Start server
npm run dev

# Test API endpoints
curl http://localhost:8874/api/status
curl -X POST http://localhost:8874/api/toggle
```

## 🚀 Building and Publishing

### Local Build

```bash
# Clean and build
npm run clean
npm run build

# Test the built package
npm run start
```

### Package Validation

```bash
# Check package contents
npm pack --dry-run

# Test installation
npm install -g ./webpresence-*.tgz
```

## 🐛 Common Development Issues

### Server Won't Start

```bash
# Check if port is in use
netstat -tulpn | grep :8874

# Kill existing processes
pkill -f webpresence

# Clear any daemon processes
webpresence stop
```

### Extension Not Connecting

1. Check server is running: `webpresence status`
2. Check browser console for errors
3. Reload the extension
4. Verify WebSocket connection in Network tab

### Build Issues

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
npm run clean
npm run build
```

## 📚 Additional Resources

- [API Documentation](./API.md) - Complete API reference
- [Contributing Guide](../CONTRIBUTING.md) - Contribution guidelines
- [Site Icons Guide](./SITE_ICONS.md) - Adding new website icons
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

## 🤝 Contributing

Ready to contribute? Check out our [Contributing Guide](../CONTRIBUTING.md) for:

- Code style guidelines
- Pull request process
- Issue reporting
- Feature requests

---

**Need help?** [Open an issue](https://github.com/utkarshthedev/webpresence/issues) or ask in our community!
