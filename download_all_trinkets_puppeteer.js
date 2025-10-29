/**
 * Download all trinket images using Puppeteer
 * This script navigates to each trinket's wiki page and extracts the correct image
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

// Load trinket data
const trinketsData = JSON.parse(fs.readFileSync('data/trinkets.json', 'utf8'));
const trinkets = trinketsData.trinkets;

// Skip these two as they're already correct
const skipNames = ["Cardboard 'Armor'", "Vee's Remote"];

console.log(`Processing ${trinkets.length - skipNames.length} trinkets...`);
console.log(`Skipping: ${skipNames.join(', ')}\n`);

async function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        // Remove query parameters and get base URL
        const baseUrl = url.split('?')[0];
        const protocol = baseUrl.startsWith('https') ? https : http;
        
        protocol.get(baseUrl, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            
            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);
            
            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });
            
            fileStream.on('error', reject);
        }).on('error', reject);
    });
}

async function getTrinketImageUrl(trinketName) {
    // Construct wiki page URL
    const pageName = trinketName.replace(/ /g, '_');
    const url = `https://dandys-world-robloxhorror.fandom.com/wiki/${encodeURIComponent(pageName)}`;
    
    console.log(`  Fetching: ${url}`);
    
    // This would need to be run in a browser context
    // For now, return null to indicate we need Puppeteer
    return null;
}

// Export for use in Node
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { trinkets, skipNames, downloadImage };
}

console.log('\nThis script needs to be run with Puppeteer from Python.');
console.log('Use the Python script instead.');

