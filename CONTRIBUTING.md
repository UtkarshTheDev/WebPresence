# Contributing to Web Presence

Thank you for your interest in contributing to Web Presence! This guide will help you get started.

## Ways You Can Help

Even if you're not a developer, you can contribute to Web Presence:

1. **Add new site icons** - Help us support more websites (highest priority!)
2. **Improve documentation** - Make our guides clearer and more helpful
3. **Report bugs** - Let us know if something isn't working
4. **Suggest features** - Share your ideas for making Web Presence better
5. **Spread the word** - Tell others about Web Presence

## Adding New Site Icons (Easiest Way to Contribute)

One of the most helpful ways to contribute is by adding icons for new websites. You can do this even if you don't know how to code!

### Option 1: Submit Icons Without Coding (For Beginners)

If you're not familiar with Git or coding, you can still contribute:

1. **Find a good icon** for a website (PNG format, 512x512 pixels ideally)
2. **Create an issue** on our [GitHub repository](https://github.com/utkarshthedev/webpresence/issues/new)
3. **Attach the icon** to the issue
4. **Tell us the website details**:
   - Website domain (e.g., "example.com")
   - Display name (e.g., "Example Site")

That's it! We'll add the icon to the project for you.

### Option 2: Add Icons Directly to the Code (For Developers)

If you're comfortable with Git and want to add icons directly:

#### Step 1: Set Up the Project

1. Fork the repository on GitHub
2. Clone your fork to your computer:
   ```bash
   git clone https://github.com/YOUR_USERNAME/webpresence.git
   cd webpresence
   ```

#### Step 2: Find or Create an Icon

1. Find the official logo for a website you want to add
2. Make sure it's:

   - PNG format
   - 512x512 pixels (or we can resize it)
   - Clear and recognizable
   - Preferably the official logo

3. Save the icon in the `assets/site-icons` directory
   - Name it something simple like `youtube.png` or `github.png`

#### Step 3: Add the Website to Our List

1. Open `server/siteIcons.ts`
2. Add a new entry in the appropriate category:

```typescript
{ domain: "example.com", iconKey: "example", displayName: "Example Site" }
```

Where:

- `domain`: The website address (e.g., "youtube.com")
- `iconKey`: The name of your icon file without .png (e.g., "youtube")
- `displayName`: The name to show in Discord (e.g., "YouTube")

#### Step 4: Share Your Contribution

1. Commit your changes with a message like "Add icon for Example.com"
2. Push to your fork
3. Submit a pull request
4. We'll review it and merge it into the project!

## For Developers

If you want to contribute code:

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/webpresence.git`
3. Install dependencies: `cd server && npm install`
4. Make your changes
5. Test thoroughly

### Pull Request Tips

1. Keep changes focused on a single issue
2. Follow the existing code style
3. Add comments for complex code
4. Test your changes before submitting
5. Describe what your changes do and why they're needed

## Testing Your Changes

Before submitting:

1. For site icons:

   - Test that they appear correctly in Discord
   - Make sure the website is detected properly

2. For code changes:
   - Run the server locally
   - Test with the browser extension
   - Make sure everything works as expected

## Need Help?

If you have questions or need help, you can:

- Open an issue on GitHub
- Reach out to the maintainers
- Check the documentation for guidance

Thank you for helping make Web Presence better!
