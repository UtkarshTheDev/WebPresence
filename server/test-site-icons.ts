/**
 * Test script for site icons mapping
 *
 * This script tests the site icon mapping functionality by checking
 * if various domains correctly map to their expected icons.
 *
 * Run with: npx tsx test-site-icons.ts
 */

import { findIconForDomain, siteIcons } from "./src/data/siteIcons.js";

// Test domains
const testDomains = [
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "github.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "facebook.com",
  "linkedin.com",
  "reddit.com",
  "unknown-site-123.com",
  "physicswallah.live",
  "music.youtube.com",
  "drive.google.com",
  "docs.google.com",
];

console.log("=== Site Icons Test ===");
console.log(`Total site icons defined: ${siteIcons.length}`);
console.log("\nTesting domain matching:");

// Test each domain
testDomains.forEach((domain) => {
  const siteIcon = findIconForDomain(domain);

  if (siteIcon) {
    console.log(
      `✅ ${domain} -> ${siteIcon.iconKey} (${siteIcon.displayName || domain})`
    );
  } else {
    console.log(
      `❌ ${domain} -> No matching icon found, will use default web icon`
    );
  }
});

// Test a few subdomains to ensure they match correctly
console.log("\nTesting subdomain matching:");
const subdomains = [
  "sub.youtube.com",
  "videos.youtube.com",
  "user.github.com",
  "pages.github.com",
];

subdomains.forEach((domain) => {
  const siteIcon = findIconForDomain(domain);

  if (siteIcon) {
    console.log(
      `✅ ${domain} -> ${siteIcon.iconKey} (${siteIcon.displayName || domain})`
    );
  } else {
    console.log(
      `❌ ${domain} -> No matching icon found, will use default web icon`
    );
  }
});

console.log("\n=== Test Complete ===");
