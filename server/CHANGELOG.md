# Changelog

All notable changes to the WebPresence package will be documented in this file.

## [3.1.0] - 2023-07-15

### Fixed

- Fixed update checking logic to correctly detect and display the current package version
- Improved package version detection with multiple fallback methods for more reliable updates
- Enhanced update process to show version change information after successful updates
- Added timeout handling for update checks to prevent CLI commands from hanging
- Improved error handling and logging during the update process

## [3.0.0] - 2023-05-15

### Added

- Autostart feature to configure WebPresence to start automatically on system boot
- New `autostart` command with options to enable, disable, and check status
- OS-specific autostart implementations for Windows, macOS, and Linux
- Multi-method autostart support for Linux with systemd and XDG options
- New `--method` option for the autostart command to select between methods
- Automatic detection of the best autostart method for different Linux distributions

### Changed

- Marked autostart feature as BETA in documentation and CLI
- Improved autostart documentation with method-specific instructions
- Enhanced Linux distribution detection for better autostart method selection
- Updated CLI output to show more detailed autostart status information

### Fixed

- Linux autostart reliability issues
- Added robust startup script for Linux with proper environment setup
- Improved Discord detection and startup timing on Linux
- Enhanced compatibility with various Linux desktop environments

## [2.1.0] - 2023-04-14

### Added

- Auto-update feature that checks for new versions when commands are run
- New `update` command to manually check for and install updates
- Visual notification when updates are available

### Changed

- Improved package management with automatic update checks
- Enhanced user experience with update notifications

## [2.0.0] - 2023-04-13

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

## [1.1.0] - 2023-04-12

### Added

- Clean, colorful CLI UI with minimal noise and clear formatting
- Verbose mode option (`--verbose`) for detailed logging
- Progress indicators for long-running operations

### Changed

- Improved logging system with different verbosity levels
- Reduced unnecessary log output for cleaner CLI experience

## [1.0.0] - 2023-04-10

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
