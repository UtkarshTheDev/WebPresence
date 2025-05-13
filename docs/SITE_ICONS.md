# Site Icons Guide

Web Presence shows custom icons for different websites in your Discord presence. This guide explains how site icons work and how to add new ones.

## How Site Icons Work

When you visit a website, Web Presence checks if it matches any domain in its database. If it finds a match, it shows the corresponding icon in your Discord presence instead of the generic web icon.

For example:

- Visit YouTube → Shows YouTube logo
- Visit GitHub → Shows GitHub logo
- Visit a random site → Shows generic web icon

## Supported Websites

Web Presence supports icons for many popular websites, including:

- Development sites (GitHub, Stack Overflow, LeetCode)
- Social media (Twitter, Instagram, LinkedIn)
- Entertainment (YouTube, Netflix, Twitch)
- Gaming platforms (Steam, Epic Games)
- And many more!

For the complete list, see the `server/siteIcons.ts` file.

## Adding Your Own Icons

To add icons for new websites, you need to:

1. Create or find an icon for the website
2. Add it to your Discord application
3. Update the site icons list

### Step 1: Create the Icon

- Find or create a PNG image of the website's logo
- Size should be 512x512 pixels (Discord will resize it)
- Save it with a simple name (e.g., `reddit.png`)

### Step 2: Add to Discord

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application (create one if you don't have one)
3. Go to "Rich Presence" → "Art Assets"
4. Upload your icon
5. Name it exactly as you'll reference it in the code (e.g., `reddit`)

### Step 3: Update Site Icons List

1. Open `server/siteIcons.ts`
2. Add a new entry to the appropriate category:

```typescript
{ domain: "reddit.com", iconKey: "reddit", displayName: "Reddit" }
```

Where:

- `domain`: The domain to match (e.g., "reddit.com")
- `iconKey`: The name you gave the icon in Discord (e.g., "reddit")
- `displayName`: A user-friendly name to show in Discord (e.g., "Reddit")

## Using the Icon Collection Script

Web Presence includes a script to automatically download icons for websites:

```bash
cd scripts
npm install
npm run collect-icons
```

This script:

1. Reads all domains from `siteIcons.ts`
2. Downloads icons from various sources
3. Processes them to the correct size
4. Saves them to the `assets/site-icons` directory

For more details, see the [Scripts README](../scripts/README.md).

## Tips for Good Icons

- Use official logos when possible
- Make sure icons are recognizable at small sizes
- Use transparent backgrounds
- Keep the design simple and clean
- Use high-resolution images

## Contributing Icons

We welcome contributions of new site icons! There are two ways to contribute:

### Option 1: Easy Way (No Coding Required)

If you're not familiar with Git or coding:

1. **Find a good icon** for a website (PNG format, 512x512 pixels ideally)
2. **Create an issue** on our [GitHub repository](https://github.com/utkarshthedev/webpresence/issues/new)
3. **Attach the icon** to the issue
4. **Tell us the website details**:
   - Website domain (e.g., "example.com")
   - Display name (e.g., "Example Site")

That's it! We'll add the icon to the project for you.

### Option 2: Developer Way (Direct Code Contribution)

If you're comfortable with Git and coding:

1. Fork the repository
2. Add your icons to `assets/site-icons`
3. Update `server/siteIcons.ts` with your new entries
4. Submit a pull request

See the [Contributing Guide](../CONTRIBUTING.md) for detailed instructions on how to submit your changes.
