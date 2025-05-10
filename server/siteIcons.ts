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
  { domain: "dailymotion.com", iconKey: "dailymotion", displayName: "Dailymotion" },
  
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
  
  // Development platforms
  { domain: "github.com", iconKey: "github", displayName: "GitHub" },
  { domain: "gitlab.com", iconKey: "gitlab", displayName: "GitLab" },
  { domain: "bitbucket.org", iconKey: "bitbucket", displayName: "Bitbucket" },
  { domain: "stackoverflow.com", iconKey: "stackoverflow", displayName: "Stack Overflow" },
  { domain: "codepen.io", iconKey: "codepen", displayName: "CodePen" },
  { domain: "replit.com", iconKey: "replit", displayName: "Replit" },
  { domain: "codesandbox.io", iconKey: "codesandbox", displayName: "CodeSandbox" },
  
  // Productivity & Work
  { domain: "notion.so", iconKey: "notion", displayName: "Notion" },
  { domain: "trello.com", iconKey: "trello", displayName: "Trello" },
  { domain: "asana.com", iconKey: "asana", displayName: "Asana" },
  { domain: "slack.com", iconKey: "slack", displayName: "Slack" },
  { domain: "discord.com", iconKey: "discord", displayName: "Discord" },
  { domain: "zoom.us", iconKey: "zoom", displayName: "Zoom" },
  { domain: "meet.google.com", iconKey: "gmeet", displayName: "Google Meet" },
  { domain: "teams.microsoft.com", iconKey: "teams", displayName: "Microsoft Teams" },
  
  // Google services
  { domain: "google.com", iconKey: "google", displayName: "Google" },
  { domain: "gmail.com", iconKey: "gmail", displayName: "Gmail" },
  { domain: "drive.google.com", iconKey: "gdrive", displayName: "Google Drive" },
  { domain: "docs.google.com", iconKey: "gdocs", displayName: "Google Docs" },
  { domain: "sheets.google.com", iconKey: "gsheets", displayName: "Google Sheets" },
  { domain: "slides.google.com", iconKey: "gslides", displayName: "Google Slides" },
  { domain: "calendar.google.com", iconKey: "gcalendar", displayName: "Google Calendar" },
  { domain: "maps.google.com", iconKey: "gmaps", displayName: "Google Maps" },
  
  // Microsoft services
  { domain: "microsoft.com", iconKey: "microsoft", displayName: "Microsoft" },
  { domain: "outlook.com", iconKey: "outlook", displayName: "Outlook" },
  { domain: "office.com", iconKey: "office", displayName: "Microsoft Office" },
  { domain: "onedrive.com", iconKey: "onedrive", displayName: "OneDrive" },
  
  // Shopping
  { domain: "amazon.com", iconKey: "amazon", displayName: "Amazon" },
  { domain: "ebay.com", iconKey: "ebay", displayName: "eBay" },
  { domain: "walmart.com", iconKey: "walmart", displayName: "Walmart" },
  { domain: "etsy.com", iconKey: "etsy", displayName: "Etsy" },
  { domain: "aliexpress.com", iconKey: "aliexpress", displayName: "AliExpress" },
  
  // Education
  { domain: "coursera.org", iconKey: "coursera", displayName: "Coursera" },
  { domain: "udemy.com", iconKey: "udemy", displayName: "Udemy" },
  { domain: "edx.org", iconKey: "edx", displayName: "edX" },
  { domain: "khanacademy.org", iconKey: "khan", displayName: "Khan Academy" },
  { domain: "pw.live", iconKey: "pw", displayName: "Physics Wallah" },
  
  // News & Media
  { domain: "cnn.com", iconKey: "cnn", displayName: "CNN" },
  { domain: "bbc.com", iconKey: "bbc", displayName: "BBC" },
  { domain: "nytimes.com", iconKey: "nytimes", displayName: "New York Times" },
  { domain: "medium.com", iconKey: "medium", displayName: "Medium" },
  
  // Entertainment
  { domain: "spotify.com", iconKey: "spotify", displayName: "Spotify" },
  { domain: "soundcloud.com", iconKey: "soundcloud", displayName: "SoundCloud" },
  { domain: "apple.com/music", iconKey: "applemusic", displayName: "Apple Music" },
  { domain: "music.youtube.com", iconKey: "ytmusic", displayName: "YouTube Music" },
  { domain: "imdb.com", iconKey: "imdb", displayName: "IMDb" },
  
  // Cloud services
  { domain: "aws.amazon.com", iconKey: "aws", displayName: "AWS" },
  { domain: "cloud.google.com", iconKey: "gcloud", displayName: "Google Cloud" },
  { domain: "azure.microsoft.com", iconKey: "azure", displayName: "Microsoft Azure" },
  { domain: "digitalocean.com", iconKey: "digitalocean", displayName: "DigitalOcean" },
  
  // Other popular sites
  { domain: "wikipedia.org", iconKey: "wikipedia", displayName: "Wikipedia" },
  { domain: "quora.com", iconKey: "quora", displayName: "Quora" },
  { domain: "bing.com", iconKey: "bing", displayName: "Bing" },
  { domain: "duckduckgo.com", iconKey: "duckduckgo", displayName: "DuckDuckGo" },
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
  return siteIcons.find(site => lowerDomain.includes(site.domain));
}
