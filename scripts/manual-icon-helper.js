/**
 * Manual Icon Helper
 * 
 * This script helps with manual collection of icons that failed automated download.
 * It generates an HTML file with links to various icon sources for each failed site.
 * 
 * Usage:
 * node manual-icon-helper.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  reportPath: path.join(__dirname, 'icon-collection-report.json'),
  outputHtmlPath: path.join(__dirname, 'manual-icon-collection.html'),
  outputDir: path.join(__dirname, '../assets/site-icons')
};

// Main function
async function generateHelperHtml() {
  // Check if report exists
  if (!fs.existsSync(CONFIG.reportPath)) {
    console.error('No icon collection report found. Run icon-collector.js first.');
    return;
  }

  // Read the report
  const report = JSON.parse(fs.readFileSync(CONFIG.reportPath, 'utf8'));
  const { failed } = report;

  if (failed.length === 0) {
    console.log('No failed icons found in the report. Great job!');
    return;
  }

  console.log(`Generating helper HTML for ${failed.length} failed icons...`);

  // Generate HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manual Icon Collection Helper</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
    }
    .instructions {
      background-color: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .site-card {
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 20px;
      background-color: #fff;
    }
    .site-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .site-title {
      font-size: 18px;
      font-weight: bold;
      margin: 0;
    }
    .site-domain {
      color: #666;
    }
    .links-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 10px;
    }
    .link-card {
      border: 1px solid #eee;
      border-radius: 5px;
      padding: 10px;
      background-color: #f9f9f9;
    }
    .link-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .status-bar {
      background-color: #333;
      color: white;
      padding: 10px;
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      justify-content: space-between;
    }
    .completed {
      background-color: #e6f7e6;
      border-left: 5px solid #4CAF50;
    }
    .mark-complete {
      background-color: #4CAF50;
      color: white;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      cursor: pointer;
    }
    .mark-complete:hover {
      background-color: #45a049;
    }
  </style>
</head>
<body>
  <div class="status-bar">
    <div>Failed Icons: <span id="total-count">${failed.length}</span></div>
    <div>Completed: <span id="completed-count">0</span></div>
  </div>

  <h1>Manual Icon Collection Helper</h1>
  
  <div class="instructions">
    <h2>Instructions</h2>
    <p>This page helps you find icons for websites that couldn't be automatically downloaded. For each site:</p>
    <ol>
      <li>Click the links to open potential icon sources</li>
      <li>Download the best quality icon you can find</li>
      <li>Resize it to 1024x1024 pixels and save as PNG</li>
      <li>Save it to <code>assets/site-icons/[iconKey].png</code></li>
      <li>Click "Mark as Complete" when done</li>
    </ol>
    <p><strong>Tip:</strong> For best results, look for SVG or high-resolution PNG logos.</p>
  </div>

  <div id="sites-container">
    ${failed.map(site => `
      <div class="site-card" id="site-${site.iconKey}">
        <div class="site-header">
          <div>
            <h3 class="site-title">${site.iconKey}</h3>
            <div class="site-domain">${site.domain}</div>
          </div>
          <button class="mark-complete" onclick="markComplete('${site.iconKey}')">Mark as Complete</button>
        </div>
        <div class="links-container">
          <div class="link-card">
            <div class="link-title">Website</div>
            <a href="https://${site.domain}" target="_blank">Visit ${site.domain}</a>
          </div>
          <div class="link-card">
            <div class="link-title">Brand Assets</div>
            <a href="https://${site.domain}/brand" target="_blank">Brand Page</a><br>
            <a href="https://${site.domain}/about" target="_blank">About Page</a>
          </div>
          <div class="link-card">
            <div class="link-title">Simple Icons</div>
            <a href="https://simpleicons.org/?q=${site.domain.split('.')[0]}" target="_blank">Search Simple Icons</a>
          </div>
          <div class="link-card">
            <div class="link-title">Icon Finder</div>
            <a href="https://www.iconfinder.com/search?q=${site.domain.split('.')[0]}" target="_blank">Search Icon Finder</a>
          </div>
          <div class="link-card">
            <div class="link-title">Clearbit</div>
            <a href="https://logo.clearbit.com/${site.domain}" target="_blank">Try Clearbit Direct</a>
          </div>
          <div class="link-card">
            <div class="link-title">Google Search</div>
            <a href="https://www.google.com/search?q=${site.domain.split('.')[0]}+logo+png+high+resolution" target="_blank">Search for Logo</a>
          </div>
        </div>
      </div>
    `).join('')}
  </div>

  <script>
    // Load completed state from localStorage
    const completedIcons = JSON.parse(localStorage.getItem('completedIcons') || '[]');
    
    // Update UI based on completed state
    function updateUI() {
      document.getElementById('completed-count').textContent = completedIcons.length;
      
      completedIcons.forEach(iconKey => {
        const element = document.getElementById('site-' + iconKey);
        if (element) {
          element.classList.add('completed');
        }
      });
    }
    
    // Mark an icon as complete
    function markComplete(iconKey) {
      if (!completedIcons.includes(iconKey)) {
        completedIcons.push(iconKey);
        localStorage.setItem('completedIcons', JSON.stringify(completedIcons));
        updateUI();
      }
    }
    
    // Initialize UI
    updateUI();
  </script>
</body>
</html>
  `;

  // Write HTML file
  fs.writeFileSync(CONFIG.outputHtmlPath, html);
  console.log(`Helper HTML generated at ${CONFIG.outputHtmlPath}`);
  console.log(`Open this file in your browser to help with manual icon collection.`);
}

// Run the script
generateHelperHtml().catch(console.error);
