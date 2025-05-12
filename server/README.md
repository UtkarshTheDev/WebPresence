# Web Presence Server

Discord Rich Presence for websites - server component.

## Installation

To install dependencies:

```bash
npm install
```

## Development

To run in development mode with auto-reload:

```bash
npm run dev
```

## Building

To build the project:

```bash
npm run build
```

## Running in Production

To run the built version:

```bash
npm start
```

## Project Structure

```
server/
├── src/                      # All source code goes here
│   ├── config/               # Configuration files
│   ├── services/             # Core services (Discord, WebSocket)
│   ├── data/                 # Data files (site icons)
│   ├── routes/               # API routes
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── dist/                     # Compiled output (generated)
├── package.json              # Project metadata and scripts
└── tsconfig.json             # TypeScript configuration
```
