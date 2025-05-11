# Web Presence Scripts

This directory contains utility scripts for the Web Presence project.

## Icon Collector

The `icon-collector.js` script automatically downloads icons for all websites listed in `siteIcons.ts`. It uses multiple sources to find the best quality icons and processes them to the required format and size.

### Features

- Parallel processing with configurable concurrency
- Rate limiting to avoid being blocked
- Proxy support for large-scale scraping
- Multiple icon sources (Clearbit, website favicons)
- Detailed reporting of successes and failures

### Installation

```bash
cd scripts
npm install
```

### Usage

Basic usage:

```bash
npm run collect-icons
```

With custom concurrency:

```bash
node icon-collector.js --concurrency=20
```

With proxy support (requires configuring proxies in the script):

```bash
npm run collect-icons-with-proxy
```

Or:

```bash
node icon-collector.js --use-proxies
```

### Configuration

You can configure the script by editing the `CONFIG` object at the top of `icon-collector.js`:

- `concurrency`: Number of parallel downloads (default: 10)
- `rateLimit`: Milliseconds between requests to the same domain (default: 500ms)
- `useProxies`: Whether to use proxy rotation (default: false)
- `outputDir`: Directory to save icons (default: '../assets/site-icons')
- `siteIconsPath`: Path to siteIcons.ts file (default: '../server/siteIcons.ts')
- `targetSize`: Target size for icons (default: 1024x1024)
- `proxies`: Array of proxy URLs to use for rotation

### Adding Proxies

To use proxy rotation, add your proxies to the `proxies` array in the `CONFIG` object:

```javascript
proxies: [
  "http://username:password@host:port",
  "http://username:password@host2:port",
  // Add more proxies as needed
];
```

### Output

The script generates:

1. PNG icons in the `assets/site-icons` directory
2. A detailed report in `scripts/icon-collection-report.json`

### Report Format

The report includes:

- Timestamp of the run
- Configuration used
- Statistics (total, successful, failed)
- List of successful downloads with source information
- List of failed downloads

### Handling Failed Downloads

Icons that couldn't be automatically downloaded are listed in the report. You'll need to manually find and create these icons.

#### Manual Icon Helper

To assist with manual icon collection, you can use the `manual-icon-helper.js` script:

```bash
node manual-icon-helper.js
```

This script:

1. Reads the failed downloads from the icon collection report
2. Generates an HTML file with helpful links for each failed icon
3. Provides a user interface to track your progress

Open the generated `manual-icon-collection.html` file in your browser to:

- See a list of all failed icons
- Get direct links to various icon sources for each site
- Track which icons you've already completed

#### Other Sources for Manual Icon Collection

- Brand guidelines pages of the websites
- Icon repositories like IconFinder or Flaticon
- Simple Icons (https://simpleicons.org/)
- SVG Repo (https://www.svgrepo.com/)
- Brand logos from Wikipedia
