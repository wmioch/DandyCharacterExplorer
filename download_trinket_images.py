"""
Download trinket images from Dandy's World Wiki.
This script fetches the actual trinket images from the Fandom wiki.
"""

import json
import os
import re
import time
import urllib.request
import urllib.parse

def load_trinkets():
    """Load the extracted trinket data."""
    with open('data/trinkets_extracted.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['trinkets']

def get_wiki_image_url(trinket_name):
    """
    Construct the Fandom wiki image URL for a trinket.
    Fandom uses a specific pattern for file URLs.
    """
    # Clean the trinket name for URL
    # Replace spaces with underscores, handle special characters
    clean_name = trinket_name.replace(' ', '_')
    clean_name = clean_name.replace("'", '%27')
    clean_name = urllib.parse.quote(clean_name)
    
    # Fandom wiki file URL pattern
    # Try the direct file page first
    file_url = f"https://dandys-world-robloxhorror.fandom.com/wiki/File:{clean_name}.png"
    
    return file_url

def download_image_from_wiki_page(wiki_page_url, output_path):
    """
    Download image by first fetching the wiki File: page,
    then extracting the actual image URL from it.
    """
    try:
        # Fetch the File: page
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        req = urllib.request.Request(wiki_page_url, headers=headers)
        
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
        
        # Extract the actual image URL from the page
        # Look for the full resolution image link
        # Fandom uses patterns like: https://static.wikia.nocookie.net/.../image.png
        image_patterns = [
            r'href="(https://static\.wikia\.nocookie\.net/[^"]+\.png)"',
            r'src="(https://static\.wikia\.nocookie\.net/[^"]+\.png/[^"]+)"',
            r'data-src="(https://static\.wikia\.nocookie\.net/[^"]+\.png)"',
        ]
        
        image_url = None
        for pattern in image_patterns:
            matches = re.findall(pattern, html)
            if matches:
                # Get the first match (usually the full resolution)
                image_url = matches[0]
                # Remove any size parameters
                image_url = re.sub(r'/revision/.*$', '', image_url)
                break
        
        if not image_url:
            print(f"  Could not find image URL in page: {wiki_page_url}")
            return False
        
        # Download the actual image
        req = urllib.request.Request(image_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            image_data = response.read()
        
        with open(output_path, 'wb') as f:
            f.write(image_data)
        
        return True
        
    except Exception as e:
        print(f"  Error downloading: {e}")
        return False

def main():
    """Main function to download all trinket images."""
    
    # Create output directory
    output_dir = 'assets/images/trinkets'
    os.makedirs(output_dir, exist_ok=True)
    
    # Load trinket data
    trinkets = load_trinkets()
    
    print(f"Downloading images for {len(trinkets)} trinkets...")
    print(f"Output directory: {output_dir}\n")
    
    success_count = 0
    failed = []
    
    for i, trinket in enumerate(trinkets, 1):
        name = trinket['name']
        output_path = os.path.join(output_dir, trinket['image'])
        
        # Skip if already downloaded
        if os.path.exists(output_path):
            print(f"[{i}/{len(trinkets)}] {name} - Already exists")
            success_count += 1
            continue
        
        print(f"[{i}/{len(trinkets)}] Downloading {name}...")
        
        # Get the wiki File: page URL
        wiki_page_url = get_wiki_image_url(name)
        
        # Download the image
        if download_image_from_wiki_page(wiki_page_url, output_path):
            print(f"  Success! Saved to {trinket['image']}")
            success_count += 1
        else:
            print(f"  Failed to download {name}")
            failed.append(name)
        
        # Be nice to the server
        time.sleep(0.5)
    
    print(f"\n{'='*60}")
    print(f"Download complete!")
    print(f"Successfully downloaded: {success_count}/{len(trinkets)}")
    
    if failed:
        print(f"\nFailed to download ({len(failed)}):")
        for name in failed:
            print(f"  - {name}")
    
    print(f"\nImages saved to: {output_dir}")

if __name__ == "__main__":
    main()

