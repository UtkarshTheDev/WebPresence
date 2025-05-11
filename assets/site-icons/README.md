# Site Icons

This directory contains icons for websites that can be displayed in the Discord Rich Presence.

## Icon Requirements

- PNG format
- 512x512 pixels recommended (Discord will resize them)
- Named exactly the same as the `iconKey` value in `server/siteIcons.ts`

## Adding New Icons

1. Create or find a suitable icon for the website
2. Save it with the name matching the `iconKey` in `siteIcons.ts` (e.g., `youtube.png`)
3. Add the corresponding entry to `server/siteIcons.ts` if it doesn't exist

## Icon List

The following icons should be included in this directory:

- youtube.png - YouTube
- github.png - GitHub
- twitter.png - Twitter/X
- instagram.png - Instagram
- facebook.png - Facebook
- linkedin.png - LinkedIn
- reddit.png - Reddit
- discord.png - Discord
- twitch.png - Twitch
- netflix.png - Netflix
- spotify.png - Spotify
- amazon.png - Amazon
- google.png - Google
- chatgpt.png - ChatGPT
- leetcode.png - LeetCode
- stackoverflow.png - Stack Overflow
- steam.png - Steam
- ...and many more

See `server/siteIcons.ts` for the complete list of supported websites.

## Note for Contributors

When contributing new icons, please ensure they are:
- High quality and recognizable
- Properly sized (512x512px)
- Properly named to match the `iconKey`
- Added to `siteIcons.ts` with the correct domain mapping
