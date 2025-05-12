/**
 * Site Icons Configuration
 *
 * This file contains mappings between website domains and their corresponding
 * Discord presence large image keys. When a user visits a website that matches
 * one of these domains, the corresponding icon will be shown in the Discord presence.
 *
 * The keys should match the asset keys uploaded to the Discord Developer Portal
 * for the application.
 */

// Interface for site icon mapping
export interface SiteIcon {
  // The domain or part of domain to match (e.g., "youtube.com", "github")
  domain: string;
  // The Discord asset key for the large image
  iconKey: string;
  // Optional display name override for the site
  displayName?: string;
}

/**
 * List of site icons
 *
 * Format:
 * { domain: "example.com", iconKey: "example_icon", displayName: "Example Site" }
 *
 * The domain is matched using includes(), so partial matches work.
 * For example, "youtube" will match "youtube.com" and "m.youtube.com"
 */
export const siteIcons: SiteIcon[] = [
  // Video & Entertainment platforms
  { domain: "youtube.com", iconKey: "youtube", displayName: "YouTube" },
  { domain: "youtu.be", iconKey: "youtube", displayName: "YouTube" },
  { domain: "netflix.com", iconKey: "netflix", displayName: "Netflix" },
  { domain: "twitch.tv", iconKey: "twitch", displayName: "Twitch" },
  { domain: "spotify.com", iconKey: "spotify", displayName: "Spotify" },
  {
    domain: "soundcloud.com",
    iconKey: "soundcloud",
    displayName: "SoundCloud",
  },
  {
    domain: "music.youtube.com",
    iconKey: "ytmusic",
    displayName: "YouTube Music",
  },
  { domain: "disneyplus.com", iconKey: "disneyplus", displayName: "Disney+" },
  {
    domain: "primevideo.com",
    iconKey: "primevideo",
    displayName: "Prime Video",
  },
  { domain: "hotstar.com", iconKey: "hotstar", displayName: "Disney+ Hotstar" },
  { domain: "hbomax.com", iconKey: "hbomax", displayName: "HBO Max" },
  { domain: "sonyliv.com", iconKey: "sonyliv", displayName: "Sony LIV" },
  { domain: "zee5.com", iconKey: "zee5", displayName: "ZEE5" },
  { domain: "jiocinema.com", iconKey: "jiocinema", displayName: "JioCinema" },
  {
    domain: "crunchyroll.com",
    iconKey: "crunchyroll",
    displayName: "Crunchyroll",
  },
  { domain: "imdb.com", iconKey: "imdb", displayName: "IMDb" },

  // Social media
  { domain: "instagram.com", iconKey: "instagram", displayName: "Instagram" },
  { domain: "facebook.com", iconKey: "facebook", displayName: "Facebook" },
  { domain: "x.com", iconKey: "twitter", displayName: "Twitter (X)" },
  { domain: "threads.net", iconKey: "threads", displayName: "Threads" },
  { domain: "linkedin.com", iconKey: "linkedin", displayName: "LinkedIn" },
  { domain: "reddit.com", iconKey: "reddit", displayName: "Reddit" },
  { domain: "tiktok.com", iconKey: "tiktok", displayName: "TikTok" },
  { domain: "discord.com", iconKey: "discord", displayName: "Discord" },
  { domain: "pinterest.com", iconKey: "pinterest", displayName: "Pinterest" },
  { domain: "whatsapp.com", iconKey: "whatsapp", displayName: "WhatsApp" },
  {
    domain: "web.whatsapp.com",
    iconKey: "whatsapp",
    displayName: "WhatsApp Web",
  },
  { domain: "telegram.org", iconKey: "telegram", displayName: "Telegram" },
  {
    domain: "web.telegram.org",
    iconKey: "telegram",
    displayName: "Telegram Web",
  },
  { domain: "snapchat.com", iconKey: "snapchat", displayName: "Snapchat" },

  // Development platforms
  { domain: "github.com", iconKey: "github", displayName: "GitHub" },
  { domain: "gitlab.com", iconKey: "gitlab", displayName: "GitLab" },
  {
    domain: "stackoverflow.com",
    iconKey: "stackoverflow",
    displayName: "Stack Overflow",
  },
  { domain: "codepen.io", iconKey: "codepen", displayName: "CodePen" },
  { domain: "replit.com", iconKey: "replit", displayName: "Replit" },
  {
    domain: "codesandbox.io",
    iconKey: "codesandbox",
    displayName: "CodeSandbox",
  },
  { domain: "vercel.com", iconKey: "vercel", displayName: "Vercel" },
  { domain: "netlify.com", iconKey: "netlify", displayName: "Netlify" },
  { domain: "heroku.com", iconKey: "heroku", displayName: "Heroku" },
  { domain: "npmjs.com", iconKey: "npm", displayName: "npm" },
  { domain: "github.dev", iconKey: "githubdev", displayName: "GitHub.dev" },
  {
    domain: "code.visualstudio.com",
    iconKey: "vscode",
    displayName: "VS Code",
  },
  { domain: "vscode.dev", iconKey: "vscode", displayName: "VS Code Web" },
  { domain: "jetbrains.com", iconKey: "jetbrains", displayName: "JetBrains" },
  {
    domain: "intellij-idea",
    iconKey: "intellij",
    displayName: "IntelliJ IDEA",
  },
  { domain: "render.com", iconKey: "render", displayName: "Render" },
  { domain: "railway.app", iconKey: "railway", displayName: "Railway" },
  { domain: "fly.io", iconKey: "flyio", displayName: "Fly.io" },
  {
    domain: "digitalocean.com",
    iconKey: "digitalocean",
    displayName: "DigitalOcean",
  },
  // Coding & Learning Platforms
  { domain: "leetcode.com", iconKey: "leetcode", displayName: "LeetCode" },
  {
    domain: "hackerrank.com",
    iconKey: "hackerrank",
    displayName: "HackerRank",
  },
  { domain: "codewars.com", iconKey: "codewars", displayName: "Codewars" },
  {
    domain: "codeforces.com",
    iconKey: "codeforces",
    displayName: "Codeforces",
  },
  {
    domain: "interviewbit.com",
    iconKey: "interviewbit",
    displayName: "InterviewBit",
  },
  {
    domain: "codingninjas.com",
    iconKey: "codingninjas",
    displayName: "Coding Ninjas",
  },
  { domain: "scaler.com", iconKey: "scaler", displayName: "Scaler Academy" },
  {
    domain: "freecodecamp.org",
    iconKey: "freecodecamp",
    displayName: "freeCodeCamp",
  },
  { domain: "w3schools.com", iconKey: "w3schools", displayName: "W3Schools" },
  {
    domain: "geeksforgeeks.org",
    iconKey: "geeksforgeeks",
    displayName: "GeeksforGeeks",
  },
  {
    domain: "tutorialspoint.com",
    iconKey: "tutorialspoint",
    displayName: "TutorialsPoint",
  },
  {
    domain: "javatpoint.com",
    iconKey: "javatpoint",
    displayName: "JavaTpoint",
  },
  { domain: "mdn.dev", iconKey: "mdn", displayName: "MDN Web Docs" },
  {
    domain: "developer.mozilla.org",
    iconKey: "mdn",
    displayName: "MDN Web Docs",
  },
];

/**
 * Find the icon for a given domain
 * @param domain The domain to find an icon for
 * @returns The matching site icon or undefined if not found
 */
export function findIconForDomain(domain: string): SiteIcon | undefined {
  // Convert domain to lowercase for case-insensitive matching
  const lowerDomain = domain.toLowerCase();

  // Find the first matching site icon
  return siteIcons.find((site) => lowerDomain.includes(site.domain));
}
