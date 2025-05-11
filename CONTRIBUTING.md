# Contributing to Web Presence

Thank you for your interest in contributing to Web Presence! This document provides guidelines and instructions for contributing to this project.

## Ways to Contribute

There are several ways you can contribute to Web Presence:

1. **Adding new site icons** (highest priority)
2. Improving documentation
3. Fixing bugs
4. Adding new features
5. Improving existing code

## Adding New Site Icons (Priority Contribution)

One of the most valuable ways to contribute is by adding new site icons for the Discord presence feature.

### Step 1: Create the Icon

1. Create or find a suitable icon for the website
   - PNG format
   - 512x512 pixels recommended (Discord will resize it)
   - Clear, recognizable design
   - Preferably the official logo of the website

2. Save the icon in the `assets/site-icons` directory
   - Name the file according to the `iconKey` you'll use in `siteIcons.ts`
   - Example: `youtube.png`, `github.png`, etc.

### Step 2: Update the Site Icons List

Add the website to the `siteIcons.ts` file:

1. Open `server/siteIcons.ts`
2. Add a new entry to the `siteIcons` array in the appropriate category:

```typescript
{ domain: "example.com", iconKey: "example", displayName: "Example Site" }
```

Where:
- `domain`: The domain or part of domain to match (e.g., "youtube.com", "github")
- `iconKey`: The key that matches your icon filename (without .png extension)
- `displayName`: A user-friendly name to display in the Discord presence

### Step 3: Submit a Pull Request

1. Commit your changes with a descriptive message
2. Push to your fork
3. Submit a pull request with a clear description of the sites you've added

## General Contribution Guidelines

### Setting Up for Development

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/webpresence.git`
3. Install dependencies: `cd server && bun install`
4. Make your changes
5. Test your changes thoroughly

### Pull Request Process

1. Ensure your code follows the existing style
2. Update documentation if necessary
3. Test your changes thoroughly
4. Create a pull request with a clear description of the changes

### Code Style Guidelines

- Use TypeScript for all new code
- Follow the existing code style
- Add comments for complex logic
- Use meaningful variable and function names

## Testing Your Changes

Before submitting a pull request, please test your changes:

1. For site icons:
   - Upload your icons to your Discord Developer Portal
   - Test that they appear correctly in Discord presence
   - Verify that the domain matching works correctly

2. For code changes:
   - Run the server locally
   - Test with the browser extension
   - Verify that your changes work as expected

## Questions?

If you have any questions about contributing, please open an issue or reach out to the maintainers.

Thank you for helping improve Web Presence!
