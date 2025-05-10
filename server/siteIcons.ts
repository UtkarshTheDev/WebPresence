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
  // Video platforms
  { domain: "youtube.com", iconKey: "youtube", displayName: "YouTube" },
  { domain: "youtu.be", iconKey: "youtube", displayName: "YouTube" },
  { domain: "netflix.com", iconKey: "netflix", displayName: "Netflix" },
  { domain: "twitch.tv", iconKey: "twitch", displayName: "Twitch" },
  { domain: "vimeo.com", iconKey: "vimeo", displayName: "Vimeo" },
  {
    domain: "dailymotion.com",
    iconKey: "dailymotion",
    displayName: "Dailymotion",
  },
  { domain: "hulu.com", iconKey: "hulu", displayName: "Hulu" },
  { domain: "disneyplus.com", iconKey: "disneyplus", displayName: "Disney+" },
  {
    domain: "primevideo.com",
    iconKey: "primevideo",
    displayName: "Prime Video",
  },
  { domain: "hbomax.com", iconKey: "hbomax", displayName: "HBO Max" },
  {
    domain: "crunchyroll.com",
    iconKey: "crunchyroll",
    displayName: "Crunchyroll",
  },

  // Social media
  { domain: "instagram.com", iconKey: "instagram", displayName: "Instagram" },
  { domain: "facebook.com", iconKey: "facebook", displayName: "Facebook" },
  { domain: "twitter.com", iconKey: "twitter", displayName: "Twitter" },
  { domain: "x.com", iconKey: "twitter", displayName: "X" },
  { domain: "threads.net", iconKey: "threads", displayName: "Threads" },
  { domain: "linkedin.com", iconKey: "linkedin", displayName: "LinkedIn" },
  { domain: "pinterest.com", iconKey: "pinterest", displayName: "Pinterest" },
  { domain: "reddit.com", iconKey: "reddit", displayName: "Reddit" },
  { domain: "tumblr.com", iconKey: "tumblr", displayName: "Tumblr" },
  { domain: "tiktok.com", iconKey: "tiktok", displayName: "TikTok" },
  { domain: "snapchat.com", iconKey: "snapchat", displayName: "Snapchat" },
  { domain: "mastodon.social", iconKey: "mastodon", displayName: "Mastodon" },
  { domain: "bluesky.app", iconKey: "bluesky", displayName: "Bluesky" },

  // Development platforms
  { domain: "github.com", iconKey: "github", displayName: "GitHub" },
  { domain: "gitlab.com", iconKey: "gitlab", displayName: "GitLab" },
  { domain: "bitbucket.org", iconKey: "bitbucket", displayName: "Bitbucket" },
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
  { domain: "jsfiddle.net", iconKey: "jsfiddle", displayName: "JSFiddle" },
  { domain: "glitch.com", iconKey: "glitch", displayName: "Glitch" },
  { domain: "vercel.com", iconKey: "vercel", displayName: "Vercel" },
  { domain: "netlify.com", iconKey: "netlify", displayName: "Netlify" },
  { domain: "heroku.com", iconKey: "heroku", displayName: "Heroku" },
  { domain: "npmjs.com", iconKey: "npm", displayName: "npm" },
  { domain: "pypi.org", iconKey: "pypi", displayName: "PyPI" },
  { domain: "maven.org", iconKey: "maven", displayName: "Maven" },
  { domain: "nuget.org", iconKey: "nuget", displayName: "NuGet" },
  { domain: "packagist.org", iconKey: "packagist", displayName: "Packagist" },
  { domain: "rubygems.org", iconKey: "rubygems", displayName: "RubyGems" },
  { domain: "crates.io", iconKey: "crates", displayName: "Crates.io" },
  { domain: "devdocs.io", iconKey: "devdocs", displayName: "DevDocs" },
  { domain: "mdn.dev", iconKey: "mdn", displayName: "MDN Web Docs" },
  {
    domain: "developer.mozilla.org",
    iconKey: "mdn",
    displayName: "MDN Web Docs",
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
  { domain: "topcoder.com", iconKey: "topcoder", displayName: "TopCoder" },
  {
    domain: "hackerearth.com",
    iconKey: "hackerearth",
    displayName: "HackerEarth",
  },
  { domain: "exercism.org", iconKey: "exercism", displayName: "Exercism" },
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
    domain: "pluralsight.com",
    iconKey: "pluralsight",
    displayName: "Pluralsight",
  },
  { domain: "scrimba.com", iconKey: "scrimba", displayName: "Scrimba" },
  {
    domain: "frontendmasters.com",
    iconKey: "frontendmasters",
    displayName: "Frontend Masters",
  },
  { domain: "egghead.io", iconKey: "egghead", displayName: "egghead.io" },

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
    domain: "tensorflow.org",
    iconKey: "tensorflow",
    displayName: "TensorFlow",
  },
  { domain: "pytorch.org", iconKey: "pytorch", displayName: "PyTorch" },
  {
    domain: "deeplearning.ai",
    iconKey: "deeplearning",
    displayName: "DeepLearning.AI",
  },
  { domain: "fast.ai", iconKey: "fastai", displayName: "fast.ai" },
  { domain: "replicate.com", iconKey: "replicate", displayName: "Replicate" },
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
  { domain: "stability.ai", iconKey: "stability", displayName: "Stability AI" },
  { domain: "runwayml.com", iconKey: "runway", displayName: "Runway" },

  // Gaming Platforms
  { domain: "steam.com", iconKey: "steam", displayName: "Steam" },
  { domain: "steampowered.com", iconKey: "steam", displayName: "Steam" },
  { domain: "epicgames.com", iconKey: "epic", displayName: "Epic Games" },
  { domain: "gog.com", iconKey: "gog", displayName: "GOG" },
  { domain: "origin.com", iconKey: "origin", displayName: "Origin" },
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
  {
    domain: "rockstargames.com",
    iconKey: "rockstar",
    displayName: "Rockstar Games",
  },
  { domain: "bethesda.net", iconKey: "bethesda", displayName: "Bethesda" },
  { domain: "valvesoftware.com", iconKey: "valve", displayName: "Valve" },
  { domain: "twitch.tv", iconKey: "twitch", displayName: "Twitch" },
  { domain: "ign.com", iconKey: "ign", displayName: "IGN" },
  { domain: "gamespot.com", iconKey: "gamespot", displayName: "GameSpot" },
  { domain: "pcgamer.com", iconKey: "pcgamer", displayName: "PC Gamer" },
  { domain: "kotaku.com", iconKey: "kotaku", displayName: "Kotaku" },
  { domain: "polygon.com", iconKey: "polygon", displayName: "Polygon" },
  { domain: "gamefaqs.com", iconKey: "gamefaqs", displayName: "GameFAQs" },

  // Productivity & Work
  { domain: "notion.so", iconKey: "notion", displayName: "Notion" },
  { domain: "trello.com", iconKey: "trello", displayName: "Trello" },
  { domain: "asana.com", iconKey: "asana", displayName: "Asana" },
  { domain: "slack.com", iconKey: "slack", displayName: "Slack" },
  { domain: "discord.com", iconKey: "discord", displayName: "Discord" },
  { domain: "zoom.us", iconKey: "zoom", displayName: "Zoom" },
  { domain: "meet.google.com", iconKey: "gmeet", displayName: "Google Meet" },
  {
    domain: "teams.microsoft.com",
    iconKey: "teams",
    displayName: "Microsoft Teams",
  },
  { domain: "figma.com", iconKey: "figma", displayName: "Figma" },
  { domain: "canva.com", iconKey: "canva", displayName: "Canva" },
  { domain: "miro.com", iconKey: "miro", displayName: "Miro" },
  { domain: "airtable.com", iconKey: "airtable", displayName: "Airtable" },
  { domain: "monday.com", iconKey: "monday", displayName: "Monday.com" },
  { domain: "clickup.com", iconKey: "clickup", displayName: "ClickUp" },
  { domain: "linear.app", iconKey: "linear", displayName: "Linear" },
  { domain: "jira.com", iconKey: "jira", displayName: "Jira" },
  { domain: "atlassian.com", iconKey: "atlassian", displayName: "Atlassian" },
  {
    domain: "confluence.com",
    iconKey: "confluence",
    displayName: "Confluence",
  },

  // Google services
  { domain: "google.com", iconKey: "google", displayName: "Google" },
  { domain: "gmail.com", iconKey: "gmail", displayName: "Gmail" },
  {
    domain: "drive.google.com",
    iconKey: "gdrive",
    displayName: "Google Drive",
  },
  { domain: "docs.google.com", iconKey: "gdocs", displayName: "Google Docs" },
  {
    domain: "sheets.google.com",
    iconKey: "gsheets",
    displayName: "Google Sheets",
  },
  {
    domain: "slides.google.com",
    iconKey: "gslides",
    displayName: "Google Slides",
  },
  {
    domain: "calendar.google.com",
    iconKey: "gcalendar",
    displayName: "Google Calendar",
  },
  { domain: "maps.google.com", iconKey: "gmaps", displayName: "Google Maps" },
  {
    domain: "colab.research.google.com",
    iconKey: "colab",
    displayName: "Google Colab",
  },

  // Microsoft services
  { domain: "microsoft.com", iconKey: "microsoft", displayName: "Microsoft" },
  { domain: "outlook.com", iconKey: "outlook", displayName: "Outlook" },
  { domain: "office.com", iconKey: "office", displayName: "Microsoft Office" },
  { domain: "onedrive.com", iconKey: "onedrive", displayName: "OneDrive" },
  {
    domain: "visualstudio.com",
    iconKey: "visualstudio",
    displayName: "Visual Studio",
  },
  {
    domain: "code.visualstudio.com",
    iconKey: "vscode",
    displayName: "VS Code",
  },
  { domain: "github.dev", iconKey: "githubdev", displayName: "GitHub.dev" },

  // Shopping
  { domain: "amazon.com", iconKey: "amazon", displayName: "Amazon" },
  { domain: "ebay.com", iconKey: "ebay", displayName: "eBay" },
  { domain: "walmart.com", iconKey: "walmart", displayName: "Walmart" },
  { domain: "etsy.com", iconKey: "etsy", displayName: "Etsy" },
  {
    domain: "aliexpress.com",
    iconKey: "aliexpress",
    displayName: "AliExpress",
  },

  // Education
  { domain: "coursera.org", iconKey: "coursera", displayName: "Coursera" },
  { domain: "udemy.com", iconKey: "udemy", displayName: "Udemy" },
  { domain: "edx.org", iconKey: "edx", displayName: "edX" },
  { domain: "khanacademy.org", iconKey: "khan", displayName: "Khan Academy" },
  { domain: "pw.live", iconKey: "pw", displayName: "Physics Wallah" },
  {
    domain: "physicswallah.live",
    iconKey: "pw",
    displayName: "Physics Wallah",
  },
  { domain: "brilliant.org", iconKey: "brilliant", displayName: "Brilliant" },
  {
    domain: "skillshare.com",
    iconKey: "skillshare",
    displayName: "Skillshare",
  },
  {
    domain: "masterclass.com",
    iconKey: "masterclass",
    displayName: "MasterClass",
  },
  {
    domain: "codecademy.com",
    iconKey: "codecademy",
    displayName: "Codecademy",
  },
  { domain: "datacamp.com", iconKey: "datacamp", displayName: "DataCamp" },

  // News & Media
  { domain: "cnn.com", iconKey: "cnn", displayName: "CNN" },
  { domain: "bbc.com", iconKey: "bbc", displayName: "BBC" },
  { domain: "nytimes.com", iconKey: "nytimes", displayName: "New York Times" },
  { domain: "medium.com", iconKey: "medium", displayName: "Medium" },
  { domain: "dev.to", iconKey: "devto", displayName: "DEV Community" },
  { domain: "hashnode.com", iconKey: "hashnode", displayName: "Hashnode" },
  {
    domain: "techcrunch.com",
    iconKey: "techcrunch",
    displayName: "TechCrunch",
  },
  { domain: "wired.com", iconKey: "wired", displayName: "WIRED" },
  { domain: "theverge.com", iconKey: "theverge", displayName: "The Verge" },

  // Entertainment
  { domain: "spotify.com", iconKey: "spotify", displayName: "Spotify" },
  {
    domain: "soundcloud.com",
    iconKey: "soundcloud",
    displayName: "SoundCloud",
  },
  {
    domain: "apple.com/music",
    iconKey: "applemusic",
    displayName: "Apple Music",
  },
  {
    domain: "music.youtube.com",
    iconKey: "ytmusic",
    displayName: "YouTube Music",
  },
  { domain: "imdb.com", iconKey: "imdb", displayName: "IMDb" },
  { domain: "netflix.com", iconKey: "netflix", displayName: "Netflix" },

  // Cloud services
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
    domain: "digitalocean.com",
    iconKey: "digitalocean",
    displayName: "DigitalOcean",
  },
  {
    domain: "cloudflare.com",
    iconKey: "cloudflare",
    displayName: "Cloudflare",
  },
  {
    domain: "firebase.google.com",
    iconKey: "firebase",
    displayName: "Firebase",
  },
  { domain: "supabase.com", iconKey: "supabase", displayName: "Supabase" },
  { domain: "mongodb.com", iconKey: "mongodb", displayName: "MongoDB" },
  { domain: "mysql.com", iconKey: "mysql", displayName: "MySQL" },
  {
    domain: "postgresql.org",
    iconKey: "postgresql",
    displayName: "PostgreSQL",
  },
  { domain: "redis.io", iconKey: "redis", displayName: "Redis" },

  // Other popular sites
  { domain: "wikipedia.org", iconKey: "wikipedia", displayName: "Wikipedia" },
  { domain: "quora.com", iconKey: "quora", displayName: "Quora" },
  { domain: "bing.com", iconKey: "bing", displayName: "Bing" },
  {
    domain: "duckduckgo.com",
    iconKey: "duckduckgo",
    displayName: "DuckDuckGo",
  },
  { domain: "yahoo.com", iconKey: "yahoo", displayName: "Yahoo" },
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
