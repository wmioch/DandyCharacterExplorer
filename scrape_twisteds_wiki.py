"""
Script to scrape Twisted data from Dandy's World Wiki
Extracts name, speed stats (6 values), and downloads images for each Twisted
"""

import json
import os
import sys
import requests
from bs4 import BeautifulSoup
import time
import re

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# Base URL for the wiki
WIKI_BASE = "https://dandys-world-robloxhorror.fandom.com"

# List of all Twisteds organized by rarity
TWISTEDS = {
    "Common": [
        "Boxten", "Brusha", "Cosmo", "Looey", "Poppy", "Shrimpo", "Tisha", "Yatta"
    ],
    "Uncommon": [
        "Brightney", "Connie", "Finn", "Razzle & Dazzle", "Rodger", "Teagan", "Toodles"
    ],
    "Rare": [
        "Blot", "Flutter", "Gigi", "Glisten", "Goob", "Scraps"
    ],
    "Main Character": [
        "Astro", "Pebble", "Shelly", "Sprout", "Vee"
    ],
    "Lethal": [
        "Dandy", "Dyle"
    ]
}

def get_twisted_url(name):
    """Generate the wiki URL for a specific Twisted"""
    # Handle special cases
    url_name = name.replace(" ", "_").replace("&", "%26")
    return f"{WIKI_BASE}/wiki/Twisted_{url_name}"

def download_image(image_url, save_path):
    """Download an image from URL to local path"""
    try:
        # Make sure it's a full URL
        if image_url.startswith("//"):
            image_url = "https:" + image_url
        elif image_url.startswith("/"):
            image_url = WIKI_BASE + image_url
        
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        
        with open(save_path, 'wb') as f:
            f.write(response.content)
        
        print(f"✓ Downloaded image: {save_path}")
        return True
    except Exception as e:
        print(f"✗ Failed to download image from {image_url}: {e}")
        return False

def extract_speed_from_text(text):
    """Extract numeric speed value from text"""
    if not text:
        return None
    # Remove any non-numeric characters except decimal point
    match = re.search(r'(\d+\.?\d*)', text.strip())
    if match:
        return float(match.group(1))
    return None

def parse_speed_text(speed_text):
    """Parse speed text from wiki format"""
    speeds = {
        "normal": {"walk": None, "run": None},
        "panic": {"walk": None, "run": None},
        "panicSuppressed": {"walk": None, "run": None}
    }
    
    # Parse format: "Average (10 walking, 18 chasing)Panic Mode: (12.5 walking, 22.5 chasing)Suppression: (12 walking, 21.6 chasing)"
    import re
    
    # Extract normal speeds (first set of numbers)
    normal_match = re.search(r'\((\d+\.?\d*)\s*walking,\s*(\d+\.?\d*)\s*(?:chasing|running)\)', speed_text)
    if normal_match:
        speeds["normal"]["walk"] = float(normal_match.group(1))
        speeds["normal"]["run"] = float(normal_match.group(2))
    
    # Extract panic speeds
    panic_match = re.search(r'Panic Mode:\s*\((\d+\.?\d*)\s*walking,\s*(\d+\.?\d*)\s*(?:chasing|running)\)', speed_text)
    if panic_match:
        speeds["panic"]["walk"] = float(panic_match.group(1))
        speeds["panic"]["run"] = float(panic_match.group(2))
    
    # Extract suppressed speeds
    suppressed_match = re.search(r'Suppression:\s*\((\d+\.?\d*)\s*walking,\s*(\d+\.?\d*)\s*(?:chasing|running)\)', speed_text)
    if suppressed_match:
        speeds["panicSuppressed"]["walk"] = float(suppressed_match.group(1))
        speeds["panicSuppressed"]["run"] = float(suppressed_match.group(2))
    
    return speeds

def scrape_twisted_page(name, rarity):
    """Scrape individual Twisted page for stats and image"""
    url = get_twisted_url(name)
    print(f"\nScraping: {name} ({url})")
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        twisted_data = {
            "id": f"twisted_{name.lower().replace(' ', '_').replace('&', 'and')}",
            "name": f"Twisted {name}",
            "rarity": rarity,
            "speeds": {
                "normal": {"walk": None, "run": None},
                "panic": {"walk": None, "run": None},
                "panicSuppressed": {"walk": None, "run": None}
            },
            "image": f"twisteds/{name.lower().replace(' ', '_').replace('&', 'and')}.png"
        }
        
        # Find the portable-infobox
        infobox = soup.find('aside', class_='portable-infobox')
        if not infobox:
            print(f"  ⚠ No portable-infobox found for {name}")
            return None
        
        # Extract data from pi-data elements
        data_items = infobox.find_all('div', class_='pi-data')
        speed_text = None
        
        for item in data_items:
            label_elem = item.find('h3', class_='pi-data-label')
            value_elem = item.find('div', class_='pi-data-value')
            
            if label_elem and value_elem:
                label = label_elem.get_text(strip=True)
                value = value_elem.get_text(strip=True)
                
                if label == 'Speed':
                    speed_text = value
                    break
        
        # Parse the speed text
        if speed_text:
            print(f"  Speed text: {speed_text[:100]}...")
            twisted_data['speeds'] = parse_speed_text(speed_text)
            
            if twisted_data['speeds']['normal']['walk']:
                print(f"  Normal: W={twisted_data['speeds']['normal']['walk']}, R={twisted_data['speeds']['normal']['run']}")
                print(f"  Panic: W={twisted_data['speeds']['panic']['walk']}, R={twisted_data['speeds']['panic']['run']}")
                print(f"  Suppressed: W={twisted_data['speeds']['panicSuppressed']['walk']}, R={twisted_data['speeds']['panicSuppressed']['run']}")
            else:
                print(f"  ⚠ Failed to parse speed data")
        else:
            print(f"  ⚠ No speed data found")
        
        # Find and download the main image from portable-infobox
        img = infobox.find('img', class_='pi-image-thumbnail')
        if img and 'src' in img.attrs:
            image_url = img['src']
            # Clean up the URL to get higher quality version
            if '/revision/latest/scale-to-width-down/' in image_url:
                # Get the full resolution version
                image_url = image_url.split('/revision/')[0] + '/revision/latest'
            elif '/revision/' in image_url:
                image_url = image_url.split('/revision/')[0] + '/revision/latest'
            
            save_path = f"assets/images/{twisted_data['image']}"
            download_image(image_url, save_path)
        
        return twisted_data
        
    except Exception as e:
        print(f"✗ Error scraping {name}: {e}")
        return None

def main():
    """Main function to scrape all Twisteds"""
    print("=" * 60)
    print("DANDY'S WORLD - TWISTED DATA SCRAPER")
    print("=" * 60)
    
    all_twisteds = []
    
    # Scrape each Twisted
    for rarity, names in TWISTEDS.items():
        print(f"\n{'=' * 60}")
        print(f"RARITY: {rarity}")
        print(f"{'=' * 60}")
        
        for name in names:
            twisted_data = scrape_twisted_page(name, rarity)
            if twisted_data:
                all_twisteds.append(twisted_data)
            
            # Be polite to the server
            time.sleep(1)
    
    # Save to JSON file
    output_data = {
        "twisteds": all_twisteds,
        "metadata": {
            "source": "Dandy's World Wiki",
            "url": "https://dandys-world-robloxhorror.fandom.com/wiki/Twisteds",
            "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_count": len(all_twisteds)
        }
    }
    
    output_file = "data/twisteds.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'=' * 60}")
    print(f"✓ SUCCESS! Scraped {len(all_twisteds)} Twisteds")
    print(f"✓ Data saved to: {output_file}")
    print(f"{'=' * 60}")
    
    # Print summary
    print("\nSummary by Rarity:")
    for rarity in TWISTEDS.keys():
        count = sum(1 for t in all_twisteds if t.get('rarity') == rarity)
        print(f"  {rarity}: {count}")
    
    # Check for missing data
    print("\nData Validation:")
    missing_speeds = []
    missing_images = []
    
    for twisted in all_twisteds:
        name = twisted['name']
        speeds = twisted['speeds']
        
        # Check if all speeds are present
        if not all([
            speeds['normal']['walk'],
            speeds['normal']['run'],
            speeds['panic']['walk'],
            speeds['panic']['run']
        ]):
            missing_speeds.append(name)
        
        # Check if image exists
        image_path = f"assets/images/{twisted['image']}"
        if not os.path.exists(image_path):
            missing_images.append(name)
    
    if missing_speeds:
        print(f"  ⚠ Missing speed data for: {', '.join(missing_speeds)}")
    else:
        print(f"  ✓ All speed data complete")
    
    if missing_images:
        print(f"  ⚠ Missing images for: {', '.join(missing_images)}")
    else:
        print(f"  ✓ All images downloaded")

if __name__ == "__main__":
    main()

