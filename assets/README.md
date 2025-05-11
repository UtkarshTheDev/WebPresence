# Web Presence Assets

This directory contains assets used by the Web Presence extension.

## Site Icons

The `site-icons` directory contains icons for various websites that can be displayed in the Discord Rich Presence. These icons should be:

- PNG format
- 512x512 pixels (Discord will resize them)
- Named exactly the same as the `iconKey` value in `server/siteIcons.ts`

### How to Use These Icons

1. Download the icons you want to use
2. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
3. Select your application
4. Navigate to "Rich Presence" > "Art Assets"
5. Upload the icons with the exact same names as the files (without the .png extension)

### Contributing Icons

If you'd like to contribute new icons:

1. Create a 512x512 PNG icon for the website
2. Name it according to the `iconKey` in `server/siteIcons.ts` (e.g., `youtube.png`)
3. Add it to the `site-icons` directory
4. Update `server/siteIcons.ts` with the new website entry
5. Submit a pull request

Please see the [CONTRIBUTING.md](../CONTRIBUTING.md) file for more detailed guidelines.
