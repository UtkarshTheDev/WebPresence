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
  { domain: "twitter.com", iconKey: "twitter", displayName: "Twitter" },
  { domain: "x.com", iconKey: "twitter", displayName: "X" },
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
  { domain: "pycharm", iconKey: "pycharm", displayName: "PyCharm" },
  { domain: "webstorm", iconKey: "webstorm", displayName: "WebStorm" },
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

  // AI & ML Platforms
  { domain: "openai.com", iconKey: "openai", displayName: "OpenAI" },
  { domain: "chat.openai.com", iconKey: "chatgpt", displayName: "ChatGPT" },
  { domain: "anthropic.com", iconKey: "anthropic", displayName: "Anthropic" },
  { domain: "claude.ai", iconKey: "claude", displayName: "Claude" },
  { domain: "bard.google.com", iconKey: "bard", displayName: "Google Bard" },
  {
    domain: "gemini.google.com",
    iconKey: "gemini",
    displayName: "Google Gemini",
  },
  {
    domain: "huggingface.co",
    iconKey: "huggingface",
    displayName: "Hugging Face",
  },
  { domain: "kaggle.com", iconKey: "kaggle", displayName: "Kaggle" },
  {
    domain: "colab.research.google.com",
    iconKey: "colab",
    displayName: "Google Colab",
  },
  {
    domain: "perplexity.ai",
    iconKey: "perplexity",
    displayName: "Perplexity AI",
  },
  {
    domain: "midjourney.com",
    iconKey: "midjourney",
    displayName: "Midjourney",
  },

  // Gaming Platforms
  { domain: "steam.com", iconKey: "steam", displayName: "Steam" },
  { domain: "steampowered.com", iconKey: "steam", displayName: "Steam" },
  { domain: "epicgames.com", iconKey: "epic", displayName: "Epic Games" },
  { domain: "ea.com", iconKey: "ea", displayName: "Electronic Arts" },
  { domain: "ubisoft.com", iconKey: "ubisoft", displayName: "Ubisoft" },
  { domain: "battle.net", iconKey: "battlenet", displayName: "Battle.net" },
  { domain: "blizzard.com", iconKey: "blizzard", displayName: "Blizzard" },
  {
    domain: "playstation.com",
    iconKey: "playstation",
    displayName: "PlayStation",
  },
  { domain: "xbox.com", iconKey: "xbox", displayName: "Xbox" },
  { domain: "nintendo.com", iconKey: "nintendo", displayName: "Nintendo" },
  { domain: "riotgames.com", iconKey: "riot", displayName: "Riot Games" },
  {
    domain: "leagueoflegends.com",
    iconKey: "lol",
    displayName: "League of Legends",
  },
  { domain: "minecraft.net", iconKey: "minecraft", displayName: "Minecraft" },
  { domain: "roblox.com", iconKey: "roblox", displayName: "Roblox" },
  { domain: "fortnite.com", iconKey: "fortnite", displayName: "Fortnite" },

  // Productivity & Work
  { domain: "notion.so", iconKey: "notion", displayName: "Notion" },
  { domain: "trello.com", iconKey: "trello", displayName: "Trello" },
  { domain: "slack.com", iconKey: "slack", displayName: "Slack" },
  { domain: "zoom.us", iconKey: "zoom", displayName: "Zoom" },
  { domain: "meet.google.com", iconKey: "gmeet", displayName: "Google Meet" },
  {
    domain: "teams.microsoft.com",
    iconKey: "teams",
    displayName: "Microsoft Teams",
  },
  { domain: "figma.com", iconKey: "figma", displayName: "Figma" },
  { domain: "canva.com", iconKey: "canva", displayName: "Canva" },

  // Google services
  { domain: "google.com", iconKey: "google", displayName: "Google" },
  { domain: "gmail.com", iconKey: "gmail", displayName: "Gmail" },
  {
    domain: "drive.google.com",
    iconKey: "gdrive",
    displayName: "Google Drive",
  },
  { domain: "docs.google.com", iconKey: "gdocs", displayName: "Google Docs" },
  { domain: "maps.google.com", iconKey: "gmaps", displayName: "Google Maps" },

  // Education
  { domain: "coursera.org", iconKey: "coursera", displayName: "Coursera" },
  { domain: "udemy.com", iconKey: "udemy", displayName: "Udemy" },
  { domain: "khanacademy.org", iconKey: "khan", displayName: "Khan Academy" },
  { domain: "pw.live", iconKey: "pw", displayName: "Physics Wallah" },
  {
    domain: "physicswallah.live",
    iconKey: "pw",
    displayName: "Physics Wallah",
  },
  { domain: "unacademy.com", iconKey: "unacademy", displayName: "Unacademy" },
  { domain: "byjus.com", iconKey: "byjus", displayName: "BYJU'S" },
  { domain: "vedantu.com", iconKey: "vedantu", displayName: "Vedantu" },
  { domain: "doubtnut.com", iconKey: "doubtnut", displayName: "Doubtnut" },
  { domain: "edx.org", iconKey: "edx", displayName: "edX" },
  { domain: "brilliant.org", iconKey: "brilliant", displayName: "Brilliant" },
  {
    domain: "codecademy.com",
    iconKey: "codecademy",
    displayName: "Codecademy",
  },
  { domain: "datacamp.com", iconKey: "datacamp", displayName: "DataCamp" },
  { domain: "sololearn.com", iconKey: "sololearn", displayName: "SoloLearn" },

  // News & Media
  { domain: "medium.com", iconKey: "medium", displayName: "Medium" },
  { domain: "dev.to", iconKey: "devto", displayName: "DEV Community" },
  { domain: "hashnode.com", iconKey: "hashnode", displayName: "Hashnode" },
  { domain: "indiatimes.com", iconKey: "toi", displayName: "Times of India" },
  { domain: "ndtv.com", iconKey: "ndtv", displayName: "NDTV" },
  {
    domain: "hindustantimes.com",
    iconKey: "ht",
    displayName: "Hindustan Times",
  },

  // Cloud services & Databases
  { domain: "aws.amazon.com", iconKey: "aws", displayName: "AWS" },
  {
    domain: "cloud.google.com",
    iconKey: "gcloud",
    displayName: "Google Cloud",
  },
  {
    domain: "azure.microsoft.com",
    iconKey: "azure",
    displayName: "Microsoft Azure",
  },
  {
    domain: "firebase.google.com",
    iconKey: "firebase",
    displayName: "Firebase",
  },
  { domain: "supabase.com", iconKey: "supabase", displayName: "Supabase" },
  { domain: "redis.io", iconKey: "redis", displayName: "Redis" },
  { domain: "drizzle.team", iconKey: "drizzle", displayName: "Drizzle ORM" },
  { domain: "prisma.io", iconKey: "prisma", displayName: "Prisma" },
  { domain: "mongodb.com", iconKey: "mongodb", displayName: "MongoDB" },
  {
    domain: "postgresql.org",
    iconKey: "postgresql",
    displayName: "PostgreSQL",
  },

  // E-commerce & Shopping
  { domain: "amazon.com", iconKey: "amazon", displayName: "Amazon" },
  { domain: "amazon.in", iconKey: "amazon", displayName: "Amazon India" },
  { domain: "flipkart.com", iconKey: "flipkart", displayName: "Flipkart" },
  { domain: "myntra.com", iconKey: "myntra", displayName: "Myntra" },
  { domain: "ajio.com", iconKey: "ajio", displayName: "AJIO" },
  { domain: "meesho.com", iconKey: "meesho", displayName: "Meesho" },
  { domain: "nykaa.com", iconKey: "nykaa", displayName: "Nykaa" },
  { domain: "swiggy.com", iconKey: "swiggy", displayName: "Swiggy" },
  { domain: "zomato.com", iconKey: "zomato", displayName: "Zomato" },

  // Other popular sites
  { domain: "wikipedia.org", iconKey: "wikipedia", displayName: "Wikipedia" },
  { domain: "bing.com", iconKey: "bing", displayName: "Bing" },
  {
    domain: "duckduckgo.com",
    iconKey: "duckduckgo",
    displayName: "DuckDuckGo",
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
