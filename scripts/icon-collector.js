/**
 * Icon Collector Script
 * 
 * This script automatically downloads icons for all websites listed in siteIcons.ts.
 * It uses multiple sources to find the best quality icons and processes them to the
 * required format and size.
 * 
 * Features:
 * - Parallel processing with configurable concurrency
 * - Rate limiting to avoid being blocked
 * - Proxy support for large-scale scraping
 * - Multiple icon sources (Clearbit, Simple Icons, website favicons)
 * - Detailed reporting of successes and failures
 * 
 * Usage:
 * node icon-collector.js [--concurrency=10] [--use-proxies]
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const sharp = require('sharp');
const cheerio = require('cheerio');
const { HttpsProxyAgent } = require('https-proxy-agent');
const pLimit = require('p-limit');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  concurrency: 10,  // How many parallel downloads
  rateLimit: 500,   // Milliseconds between requests to the same domain
  useProxies: false, // Whether to use proxy rotation
  outputDir: path.join(__dirname, '../assets/site-icons'),
  siteIconsPath: path.join(__dirname, '../server/siteIcons.ts'),
  targetSize: 1024, // Target size for icons (1024x1024)
  proxies: [
    // Add your proxies here in the format 'http://username:password@host:port'
    // Example: 'http://user:pass@proxy.example.com:8080'
  ]
};

// Parse command line arguments
process.argv.slice(2).forEach(arg => {
  const [key, value] = arg.replace('--', '').split('=');
  if (key === 'concurrency') CONFIG.concurrency = parseInt(value);
  if (key === 'use-proxies') CONFIG.useProxies = true;
});

// Domain-specific rate limiting
const domainTimestamps = {};
const domainLimiters = {};

// Proxy rotation
let currentProxyIndex = 0;
function getNextProxy() {
  if (!CONFIG.useProxies || CONFIG.proxies.length === 0) return null;
  const proxy = CONFIG.proxies[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % CONFIG.proxies.length;
  return new HttpsProxyAgent(proxy);
}

// Create axios instance with optional proxy
function createAxiosInstance(domain) {
  // Check if we need to wait due to rate limiting
  const now = Date.now();
  if (domainTimestamps[domain]) {
    const timeSinceLastRequest = now - domainTimestamps[domain];
    if (timeSinceLastRequest < CONFIG.rateLimit) {
      // Need to wait
      const delay = CONFIG.rateLimit - timeSinceLastRequest;
      return new Promise(resolve => {
        setTimeout(() => {
          domainTimestamps[domain] = Date.now();
          resolve(axios.create({ httpsAgent: getNextProxy() }));
        }, delay);
      });
    }
  }
  
  // No need to wait
  domainTimestamps[domain] = now;
  return Promise.resolve(axios.create({ httpsAgent: getNextProxy() }));
}

// Extract site data from siteIcons.ts
async function extractSiteData() {
  try {
    // Read the file content
    const content = fs.readFileSync(CONFIG.siteIconsPath, 'utf8');
    
    // Use regex to extract the array entries
    const regex = /{\s*domain:\s*"([^"]+)",\s*iconKey:\s*"([^"]+)"(?:,\s*displayName:\s*"([^"]+)")?\s*}/g;
    const sites = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      sites.push({
        domain: match[1],
        iconKey: match[2],
        displayName: match[3] || match[1]
      });
    }
    
    console.log(`Extracted ${sites.length} sites from siteIcons.ts`);
    return sites;
  } catch (error) {
    console.error('Error extracting site data:', error);
    return [];
  }
}

// Try to get logo from Clearbit
async function tryGetClearbitLogo(domain) {
  try {
    const axiosInstance = await createAxiosInstance('logo.clearbit.com');
    const response = await axiosInstance.get(`https://logo.clearbit.com/${domain}`, { 
      responseType: 'arraybuffer',
      timeout: 5000
    });
    console.log(`✅ Found Clearbit logo for ${domain}`);
    return response.data;
  } catch (error) {
    return null;
  }
}

// Try to get favicon from website
async function tryGetFavicon(domain) {
  try {
    const axiosInstance = await createAxiosInstance(domain);
    
    // First try to get the HTML
    const response = await axiosInstance.get(`https://${domain}`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Look for various icon links, prioritizing larger icons
    const iconLinks = [
      ...($('link[rel="apple-touch-icon"]').map((i, el) => $(el).attr('href')).get()),
      ...($('link[rel="icon"][sizes]').map((i, el) => $(el).attr('href')).get()),
      ...($('link[rel="shortcut icon"]').map((i, el) => $(el).attr('href')).get()),
      ...($('link[rel="icon"]').map((i, el) => $(el).attr('href')).get())
    ];
    
    // Try each icon link
    for (const iconLink of iconLinks) {
      try {
        let iconUrl = iconLink;
        
        // Handle relative URLs
        if (iconUrl.startsWith('//')) {
          iconUrl = `https:${iconUrl}`;
        } else if (iconUrl.startsWith('/')) {
          iconUrl = `https://${domain}${iconUrl}`;
        } else if (!iconUrl.startsWith('http')) {
          iconUrl = `https://${domain}/${iconUrl}`;
        }
        
        const iconResponse = await axiosInstance.get(iconUrl, { 
          responseType: 'arraybuffer',
          timeout: 5000
        });
        
        console.log(`✅ Found favicon for ${domain}: ${iconUrl}`);
        return iconResponse.data;
      } catch (error) {
        // Try next icon link
        continue;
      }
    }
    
    // If no specific icons found, try the default favicon.ico
    try {
      const faviconResponse = await axiosInstance.get(`https://${domain}/favicon.ico`, { 
        responseType: 'arraybuffer',
        timeout: 5000
      });
      console.log(`✅ Found favicon.ico for ${domain}`);
      return faviconResponse.data;
    } catch (error) {
      return null;
    }
  } catch (error) {
    return null;
  }
}

// Process the icon (resize, convert, etc.)
async function processIcon(iconData, iconKey) {
  try {
    // Ensure output directory exists
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
    
    // Process the image
    await sharp(iconData)
      .resize(CONFIG.targetSize, CONFIG.targetSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(CONFIG.outputDir, `${iconKey}.png`));
    
    return true;
  } catch (error) {
    console.error(`Error processing ${iconKey}:`, error.message);
    return false;
  }
}

// Process a single site
async function processSite(site) {
  console.log(`Processing ${site.domain} (${site.iconKey})...`);
  
  // Try each method in sequence until one works
  let iconData = await tryGetClearbitLogo(site.domain);
  
  // If Clearbit failed, try favicon
  if (!iconData) {
    iconData = await tryGetFavicon(site.domain);
  }
  
  if (iconData) {
    const success = await processIcon(iconData, site.iconKey);
    return { 
      site, 
      success, 
      source: iconData ? 'clearbit or favicon' : 'none'
    };
  }
  
  return { site, success: false, source: 'none' };
}

// Main function
async function collectIcons() {
  // Extract site data
  const sites = await extractSiteData();
  
  if (sites.length === 0) {
    console.error('No sites found in siteIcons.ts. Exiting.');
    return;
  }
  
  // Create concurrency limit
  const limit = pLimit(CONFIG.concurrency);
  
  // Process all sites in parallel with concurrency limit
  const results = await Promise.all(
    sites.map(site => limit(() => processSite(site)))
  );
  
  // Analyze results
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  // Generate report
  console.log('\n===== ICON COLLECTION REPORT =====');
  console.log(`Total sites: ${sites.length}`);
  console.log(`Successfully downloaded: ${successful.length}`);
  console.log(`Failed to download: ${failed.length}`);
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    config: CONFIG,
    stats: {
      total: sites.length,
      successful: successful.length,
      failed: failed.length
    },
    successful: successful.map(r => ({ 
      domain: r.site.domain, 
      iconKey: r.site.iconKey,
      source: r.source
    })),
    failed: failed.map(r => ({ 
      domain: r.site.domain, 
      iconKey: r.site.iconKey 
    }))
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'icon-collection-report.json'), 
    JSON.stringify(report, null, 2)
  );
  
  console.log('\nFailed downloads:');
  failed.forEach(f => console.log(`- ${f.site.domain} (${f.site.iconKey})`));
  console.log('\nReport saved to icon-collection-report.json');
}

// Run the script
collectIcons().catch(console.error);
