# Changelog

All notable changes to the WebPresence package will be documented in this file.

## [Unreleased]

### Added

- Daemon mode to run server in background with `-d` flag
- PID file management for daemon processes
- Graceful shutdown handling for SIGTERM and SIGINT signals
- Daemon status information in the status command
- Daemon log file for troubleshooting

### Changed

- Improved CLI with daemon mode instructions
- Enhanced server startup and shutdown process

### Fixed

- Proper cleanup of resources when server is terminated
- Improved error handling for daemon processes
- Fixed "Listen method has been called more than once without closing" error in daemon mode
- Added safeguards to prevent multiple server instances from starting
- Enhanced server shutdown process with timeout protection
- Improved state management to ensure clean server restarts
- Fixed daemon detection in status command
- Added port-in-use detection for more accurate server status reporting
- Improved stop command to handle various edge cases
- Added API endpoint for stopping the server remotely
- Enhanced daemon process detection with multiple verification methods
- Fixed TypeScript errors in fetch API usage
- Improved timeout handling for network requests
- Added proper type definitions for better code reliability
- Fixed server status detection when running as daemon
- Added comprehensive server status checking with multiple verification methods
- Improved process detection and termination in stop command
- Added force option to stop command for handling stubborn processes
- Fixed "Dynamic require of child_process is not supported" error in bundled code
- Improved PID file cleanup to prevent stale PID files
- Enhanced status command to show more accurate server state
- Fixed inconsistency between daemon status and server status
- Improved error handling in process detection and termination
- Added automatic cleanup of stale PID files in status and stop commands
- Fixed status command showing incorrect server state when daemon is running
- Added more reliable port checking methods that don't rely on netstat
- Suppressed command not found errors when checking server status
- Implemented fallback mechanisms for checking if server is running
- Added socket-based port checking for better cross-platform compatibility
- Fixed error messages appearing in status command output
- Fixed inconsistency between Discord connection status and presence status
- Added helpful warning when Discord is disconnected but presence is enabled
- Improved Discord connection status detection using log file analysis
- Fixed netstat command errors appearing in stop command output
- Suppressed all command not found errors in CLI commands

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
