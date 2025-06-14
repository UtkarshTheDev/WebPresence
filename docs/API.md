# 🔌 WebPresence API Documentation

This document provides a complete reference for the WebPresence server API, including REST endpoints and WebSocket communication.

## 📡 Server Information

- **Base URL**: `http://localhost:8874` (default port)
- **WebSocket URL**: `ws://localhost:8874`
- **Content-Type**: `application/json`

## 🌐 REST API Endpoints

### Server Status

#### `GET /api/status`
Get the current server status and Discord connection state.

**Response:**
```json
{
  "running": true,
  "port": 8874,
  "discordConnected": true,
  "presenceEnabled": true,
  "preferences": {
    "prefixText": "Browsing",
    "disabledSites": [],
    "alwaysEnabledSites": [],
    "continuousTimer": true
  }
}
```

### Presence Control

#### `POST /api/toggle`
Toggle Discord presence on/off.

**Request Body:**
```json
{
  "enabled": true  // optional, toggles if not provided
}
```

**Response:**
```json
{
  "success": true,
  "enabled": true,
  "message": "Presence enabled"
}
```

### User Preferences

#### `GET /api/preferences`
Get current user preferences.

**Response:**
```json
{
  "prefixText": "Browsing",
  "disabledSites": ["example.com"],
  "alwaysEnabledSites": ["github.com"],
  "continuousTimer": true
}
```

#### `POST /api/preferences`
Update user preferences.

**Request Body:**
```json
{
  "preferences": {
    "prefixText": "Exploring",
    "disabledSites": ["example.com", "private-site.com"],
    "alwaysEnabledSites": ["github.com"],
    "continuousTimer": false
  }
}
```

**Response:**
```json
{
  "success": true,
  "preferences": {
    "prefixText": "Exploring",
    "disabledSites": ["example.com", "private-site.com"],
    "alwaysEnabledSites": ["github.com"],
    "continuousTimer": false
  }
}
```

### Site Management

#### `POST /api/site/disable`
Disable presence for a specific site.

**Request Body:**
```json
{
  "domain": "example.com"
}
```

#### `POST /api/site/enable`
Enable presence for a specific site (remove from disabled list).

**Request Body:**
```json
{
  "domain": "example.com"
}
```

#### `POST /api/site/always-enable`
Add a site to the always-enabled list.

**Request Body:**
```json
{
  "domain": "github.com"
}
```

## 🔌 WebSocket API

The WebSocket connection is used for real-time communication between the browser extension and the server.

### Connection
Connect to: `ws://localhost:8874`

### Message Types

#### Browser Extension → Server

**Update Presence:**
```json
{
  "type": "updatePresence",
  "data": {
    "url": "https://github.com/user/repo",
    "title": "GitHub Repository",
    "domain": "github.com",
    "timestamp": 1640995200000
  }
}
```

**Clear Presence:**
```json
{
  "type": "clearPresence"
}
```

**Get Status:**
```json
{
  "type": "getStatus"
}
```

#### Server → Browser Extension

**Status Update:**
```json
{
  "type": "status",
  "data": {
    "connected": true,
    "enabled": true,
    "preferences": {
      "prefixText": "Browsing",
      "disabledSites": [],
      "alwaysEnabledSites": [],
      "continuousTimer": true
    }
  }
}
```

**Preferences Update:**
```json
{
  "type": "preferencesUpdate",
  "data": {
    "prefixText": "Exploring",
    "disabledSites": ["example.com"],
    "alwaysEnabledSites": ["github.com"],
    "continuousTimer": false
  }
}
```

## 📊 Data Types

### UserPreferences
```typescript
interface UserPreferences {
  prefixText: string;           // Text shown before website name
  disabledSites: string[];      // Domains to never show presence for
  alwaysEnabledSites: string[]; // Domains to always show (even when globally disabled)
  continuousTimer: boolean;     // Keep timer running when switching tabs
}
```

### PresenceData
```typescript
interface PresenceData {
  url: string;        // Current page URL
  title: string;      // Page title
  domain: string;     // Domain name
  timestamp: number;  // When presence started (Unix timestamp)
}
```

### ServerStatus
```typescript
interface ServerStatus {
  running: boolean;           // Server is running
  port: number | null;        // Server port
  discordConnected: boolean;  // Discord RPC connection status
  presenceEnabled: boolean;   // Presence is enabled
  daemonRunning?: boolean;    // Daemon mode status
  preferences: UserPreferences;
}
```

## 🔧 Error Handling

All API endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid data)
- `500` - Internal Server Error

Error responses include a message:
```json
{
  "success": false,
  "error": "Error description",
  "message": "User-friendly error message"
}
```

## 🚀 Usage Examples

### JavaScript/TypeScript

```javascript
// Get server status
const response = await fetch('http://localhost:8874/api/status');
const status = await response.json();

// Toggle presence
await fetch('http://localhost:8874/api/toggle', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ enabled: true })
});

// Update preferences
await fetch('http://localhost:8874/api/preferences', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    preferences: {
      prefixText: "Working on",
      continuousTimer: true
    }
  })
});
```

### WebSocket Connection

```javascript
const ws = new WebSocket('ws://localhost:8874');

ws.onopen = () => {
  // Request current status
  ws.send(JSON.stringify({ type: 'getStatus' }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

// Update presence
ws.send(JSON.stringify({
  type: 'updatePresence',
  data: {
    url: window.location.href,
    title: document.title,
    domain: window.location.hostname,
    timestamp: Date.now()
  }
}));
```

## 🔍 Testing the API

You can test the API using curl:

```bash
# Get status
curl http://localhost:8874/api/status

# Toggle presence
curl -X POST http://localhost:8874/api/toggle \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# Update preferences
curl -X POST http://localhost:8874/api/preferences \
  -H "Content-Type: application/json" \
  -d '{"preferences": {"prefixText": "Testing"}}'
```

---

For more information, see the [Developer Guide](./DEVELOPER.md) or [Contributing Guide](../CONTRIBUTING.md).
