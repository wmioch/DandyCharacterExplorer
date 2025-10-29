/**
 * Script to scrape Twisted data from Dandy's World Wiki using Puppeteer
 * Extracts name, speed stats (6 values), and downloads images for each Twisted
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Base URL for the wiki
const WIKI_BASE = 'https://dandys-world-robloxhorror.fandom.com';

// List of all Twisteds organized by rarity
const TWISTEDS = {
  'Common': [
    'Boxten', 'Brusha', 'Cosmo', 'Looey', 'Poppy', 'Shrimpo', 'Tisha', 'Yatta'
  ],
  'Uncommon': [
    'Brightney', 'Connie', 'Finn', 'Razzle & Dazzle', 'Rodger', 'Teagan', 'Toodles'
  ],
  'Rare': [
    'Blot', 'Flutter', 'Gigi', 'Glisten', 'Goob', 'Scraps'
  ],
  'Main Character': [
    'Astro', 'Pebble', 'Shelly', 'Sprout', 'Vee'
  ],
  'Lethal': [
    'Dandy', 'Dyle'
  ]
};

function getTwistedUrl(name) {
  const urlName = name.replace(/ /g, '_').replace(/&/g, '%26');
  return `${WIKI_BASE}/wiki/Twisted_${urlName}`;
}

function parseSpeedData(speedText) {
  // Parse format: "Average (10 walking, 18 chasing)Panic Mode: (12.5 walking, 22.5 chasing)Suppression: (12 walking, 21.6 chasing)"
  const speeds = {
    normal: { walk: null, run: null },
    panic: { walk: null, run: null },
    panicSuppressed: { walk: null, run: null }
  };

  // Extract normal speeds
  const normalMatch = speedText.match(/\((\d+\.?\d*)\s*walking,\s*(\d+\.?\d*)\s*(?:chasing|running)\)/);
  if (normalMatch) {
    speeds.normal.walk = parseFloat(normalMatch[1]);
    speeds.normal.run = parseFloat(normalMatch[2]);
  }

  // Extract panic speeds
  const panicMatch = speedText.match(/Panic Mode:\s*\((\d+\.?\d*)\s*walking,\s*(\d+\.?\d*)\s*(?:chasing|running)\)/);
  if (panicMatch) {
    speeds.panic.walk = parseFloat(panicMatch[1]);
    speeds.panic.run = parseFloat(panicMatch[2]);
  }

  // Extract suppressed speeds
  const suppressedMatch = speedText.match(/Suppression:\s*\((\d+\.?\d*)\s*walking,\s*(\d+\.?\d*)\s*(?:chasing|running)\)/);
  if (suppressedMatch) {
    speeds.panicSuppressed.walk = parseFloat(suppressedMatch[1]);
    speeds.panicSuppressed.run = parseFloat(suppressedMatch[2]);
  }

  return speeds;
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    // Clean up URL
    const cleanUrl = url.split('/revision/')[0] + '/revision/latest';
    
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = fs.createWriteStream(filepath);
    https.get(cleanUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`  ✓ Downloaded image: ${filepath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.error(`  ✗ Failed to download image: ${err.message}`);
      reject(err);
    });
  });
}

async function scrapeTwistedPage(page, name, rarity) {
  const url = getTwistedUrl(name);
  console.log(`\nScraping: ${name} (${url})`);

  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    const twistedData = await page.evaluate(() => {
      const data = {
        title: null,
        image: null,
        rarity: null,
        speedText: null
      };

      // Get data from portable infobox
      const dataElements = document.querySelectorAll('.pi-data');
      dataElements.forEach(el => {
        const labelEl = el.querySelector('.pi-data-label');
        const valueEl = el.querySelector('.pi-data-value');
        
        if (labelEl && valueEl) {
          const label = labelEl.textContent.trim();
          const value = valueEl.textContent.trim();
          
          if (label === 'Type') {
            data.rarity = value;
          } else if (label === 'Speed') {
            data.speedText = value;
          }
        }
      });

      // Get title
      const titleEl = document.querySelector('.pi-title');
      if (titleEl) {
        data.title = titleEl.textContent.trim();
      }

      // Get image
      const imgEl = document.querySelector('.portable-infobox .pi-image-thumbnail');
      if (imgEl) {
        data.image = imgEl.src;
      }

      return data;
    });

    if (!twistedData.title) {
      console.log(`  ⚠ No data found for ${name}`);
      return null;
    }

    // Parse speed data
    const speeds = twistedData.speedText ? parseSpeedData(twistedData.speedText) : null;

    if (!speeds || !speeds.normal.walk) {
      console.log(`  ⚠ Could not parse speed data for ${name}`);
      console.log(`  Speed text: ${twistedData.speedText}`);
    } else {
      console.log(`  Normal: W=${speeds.normal.walk}, R=${speeds.normal.run}`);
      console.log(`  Panic: W=${speeds.panic.walk}, R=${speeds.panic.run}`);
      console.log(`  Suppressed: W=${speeds.panicSuppressed.walk}, R=${speeds.panicSuppressed.run}`);
    }

    const twistedId = name.toLowerCase().replace(/ /g, '_').replace(/&/g, 'and');
    const imagePath = `assets/images/twisteds/${twistedId}.png`;

    // Download image
    if (twistedData.image) {
      try {
        await downloadImage(twistedData.image, imagePath);
      } catch (err) {
        console.log(`  ⚠ Image download failed`);
      }
    }

    return {
      id: `twisted_${twistedId}`,
      name: twistedData.title || `Twisted ${name}`,
      rarity: rarity,
      speeds: speeds || {
        normal: { walk: null, run: null },
        panic: { walk: null, run: null },
        panicSuppressed: { walk: null, run: null }
      },
      image: `twisteds/${twistedId}.png`
    };

  } catch (error) {
    console.error(`  ✗ Error scraping ${name}: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('DANDY\'S WORLD - TWISTED DATA SCRAPER (Puppeteer)');
  console.log('='.repeat(60));

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const allTwisteds = [];

  // Scrape each Twisted
  for (const [rarity, names] of Object.entries(TWISTEDS)) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`RARITY: ${rarity}`);
    console.log('='.repeat(60));

    for (const name of names) {
      const twistedData = await scrapeTwistedPage(page, name, rarity);
      if (twistedData) {
        allTwisteds.push(twistedData);
      }

      // Be polite to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  await browser.close();

  // Save to JSON file
  const outputData = {
    twisteds: allTwisteds,
    metadata: {
      source: 'Dandy\'s World Wiki',
      url: 'https://dandys-world-robloxhorror.fandom.com/wiki/Twisteds',
      scraped_at: new Date().toISOString(),
      total_count: allTwisteds.length
    }
  };

  const outputFile = 'data/twisteds.json';
  fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✓ SUCCESS! Scraped ${allTwisteds.length} Twisteds`);
  console.log(`✓ Data saved to: ${outputFile}`);
  console.log('='.repeat(60));

  // Print summary
  console.log('\nSummary by Rarity:');
  for (const rarity of Object.keys(TWISTEDS)) {
    const count = allTwisteds.filter(t => t.rarity === rarity).length;
    console.log(`  ${rarity}: ${count}`);
  }

  // Check for missing data
  console.log('\nData Validation:');
  const missingSpeeds = allTwisteds.filter(t => 
    !t.speeds.normal.walk || !t.speeds.normal.run ||
    !t.speeds.panic.walk || !t.speeds.panic.run ||
    !t.speeds.panicSuppressed.walk || !t.speeds.panicSuppressed.run
  );

  const missingImages = allTwisteds.filter(t => 
    !fs.existsSync(`assets/images/${t.image}`)
  );

  if (missingSpeeds.length > 0) {
    console.log(`  ⚠ Missing speed data for: ${missingSpeeds.map(t => t.name).join(', ')}`);
  } else {
    console.log(`  ✓ All speed data complete`);
  }

  if (missingImages.length > 0) {
    console.log(`  ⚠ Missing images for: ${missingImages.map(t => t.name).join(', ')}`);
  } else {
    console.log(`  ✓ All images downloaded`);
  }
}

main().catch(console.error);

