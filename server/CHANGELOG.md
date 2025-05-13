# Changelog

All notable changes to the WebPresence package will be documented in this file.

## [2.0.0] - 2025-04-13

### Added

- Daemon mode for running server in background
- Improved server status reporting and management

### Changed

- Enhanced CLI with daemon mode support
- Improved server startup and shutdown processes

### Fixed

- Various stability issues related to daemon mode
- Improved error handling and status detection
- Enhanced cross-platform compatibility

## [1.1.0] - 2025-04-12

### Added

- Clean, colorful CLI UI with minimal noise and clear formatting
- Verbose mode option (`--verbose`) for detailed logging
- Progress indicators for long-running operations

### Changed

- Improved logging system with different verbosity levels
- Reduced unnecessary log output for cleaner CLI experience

## [1.0.0] - 2025-04-12

### Added

- Initial release of WebPresence as an npm package
- CLI functionality with the following commands:
  - `start`: Start the WebPresence server
  - `stop`: Stop the WebPresence server
  - `status`: Check the status of the WebPresence server
  - `toggle`: Toggle Discord presence on or off
  - `config`: View or update configuration
  - `help`: Display help information
- Programmatic API for controlling the WebPresence server
- TypeScript type definitions for all exported functions and types
- Comprehensive documentation in README.md
- Support for customizing presence settings:
  - Prefix text (e.g., "Viewing", "Browsing")
  - Disabled sites list
  - Always-enabled sites list
  - Continuous timer option
- Colorful terminal output with progress indicators
- Robust error handling and reconnection logic for Discord RPC
- Support for site-specific icons in Discord presence

### Changed

- Refactored server code to be importable as a module
- Improved configuration management
- Enhanced WebSocket communication with browser extensions

### Fixed

- Discord connection issues with proper reconnection handling
- Proper cleanup on server exit
- Handling of very short domain names in Discord presence
