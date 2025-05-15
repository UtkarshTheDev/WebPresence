# Installation Guide

This guide will walk you through installing Web Presence step by step.

## What You'll Need

- A computer with Windows, macOS, or Linux
- Discord desktop app installed and running
- A web browser (Chrome or Firefox)
- Basic knowledge of using the command line (for server installation)

## Step 1: Install the Server

The server is the part that connects your browser to Discord. You have two options:

### Option A: Using npm package (Recommended for beginners)

This is the easiest way to install Web Presence.

1. Make sure you have [Node.js](https://nodejs.org/) installed (version 16 or higher)

   - To check if Node.js is installed, open a terminal/command prompt and type: `node -v`
   - If you see a version number, you're good to go
   - If not, download and install Node.js from [nodejs.org](https://nodejs.org/)

2. Install the Web Presence package globally:

   ```bash
   npm install -g webpresence
   ```

3. Start the server in daemon mode (recommended):

   ```bash
   webpresence start -d
   ```

4. (Optional) Configure the server to start automatically on system boot:

   ```bash
   webpresence autostart --enable
   ```

5. Check that the server is running:

   ```bash
   webpresence status
   ```

   You should see a message confirming the server is running.

   > **What is daemon mode?**
   >
   > Daemon mode (using the `-d` flag) runs the server in the background, so you can close your terminal window and the server will keep running. This is the recommended way to run Web Presence.
   >
   > **What is autostart?**
   >
   > Autostart configures Web Presence to start automatically when your computer boots up, ensuring Discord presence is always available without manual intervention. See the [Autostart Configuration](./AUTOSTART.md) guide for more details.

### Option B: From source code (For developers)

If you want to modify the code or contribute to the project:

1. Clone the repository:

   ```bash
   git clone https://github.com/utkarshthedev/webpresence.git
   cd webpresence
   ```

2. Install and start the server:
   ```bash
   cd server
   npm install
   npm start
   ```

## Step 2: Install the Browser Extension

### For Chrome:

1. Open Chrome and go to `chrome://extensions/`
2. Toggle on "Developer mode" in the top-right corner
3. Click "Load unpacked" button
4. Navigate to the `client/chrome` directory in the Web Presence folder
5. Click "Select Folder"
6. The Web Presence extension icon will appear in your toolbar

### For Firefox:

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on..."
3. Navigate to the `client/firefox` directory and select any file
4. The Web Presence extension icon will appear in your toolbar

## Step 3: Verify Everything Works

1. Make sure Discord is open on your computer
2. Click the Web Presence extension icon in your browser
3. Toggle the switch to enable Discord presence
4. Visit a website (like YouTube or GitHub)
5. Check your Discord profile - you should see your browsing activity displayed

## Troubleshooting

If something isn't working:

1. Make sure Discord is running
2. Check that the server is running (you should see a terminal window with server logs)
3. Try restarting the server
4. See the [Troubleshooting Guide](./TROUBLESHOOTING.md) for more help

## Next Steps

- Learn about the [CLI commands](./CLI.md) to control Web Presence
- Customize your settings through the extension popup
- Check out how to [contribute](../CONTRIBUTING.md) to the project
