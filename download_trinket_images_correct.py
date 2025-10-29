"""
Download trinket images from Dandy's World Wiki using correct image URLs.
Uses the infobox images which are the actual trinket images.
"""

import json
import os
import time
import urllib.request
import urllib.parse

def load_trinkets():
    """Load the trinket data."""
    with open('data/trinkets.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['trinkets']

def get_trinket_image_url(trinket_name):
    """
    Get the direct image URL for a trinket from its wiki page.
    Uses the File: page to get the full resolution image.
    """
    # Clean the trinket name for URL
    clean_name = trinket_name.replace(' ', '_')
    clean_name = clean_name.replace("'", '%27')
    clean_name = clean_name.replace("(", "%28").replace(")", "%29")
    
    # Try the File: page directly - this usually has the full resolution image
    file_url = f"https://dandys-world-robloxhorror.fandom.com/wiki/File:{clean_name}.png"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        req = urllib.request.Request(file_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
        
        # Look for the full media file link
        # Pattern: <a href="FULL_URL" class="internal"
        import re
        
        # Try to find the full resolution image URL
        patterns = [
            r'<a href="(https://static\.wikia\.nocookie\.net/[^"]+\.png)"[^>]*class="internal"',
            r'href="(https://static\.wikia\.nocookie\.net/[^"]+\.png)"',
            r'src="(https://static\.wikia\.nocookie\.net/[^"]+\.png)"',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, html)
            if matches:
                # Get the first match and clean it
                url = matches[0]
                # Remove the scale parameters to get full resolution
                url = re.sub(r'/revision/.*$', '', url)
                url = re.sub(r'/scale-to-width-down/.*$', '', url)
                return url
        
        print(f"  Could not find image URL for {trinket_name}")
        return None
        
    except Exception as e:
        print(f"  Error fetching {trinket_name}: {e}")
        return None

def download_image(url, output_path):
    """Download an image from URL to output path."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Clean the URL - remove query parameters if any
        base_url = url.split('?')[0] if '?' in url else url
        
        req = urllib.request.Request(base_url, headers=headers)
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
    
    # Skip the two that are already correct
    skip_names = ["Cardboard 'Armor'", "Vee's Remote"]
    
    print(f"Re-downloading images for {len(trinkets) - len(skip_names)} trinkets...")
    print(f"Skipping: {', '.join(skip_names)}")
    print(f"Output directory: {output_dir}\n")
    
    success_count = 0
    failed = []
    skipped = []
    
    for i, trinket in enumerate(trinkets, 1):
        name = trinket['name']
        output_path = os.path.join(output_dir, trinket['image'])
        
        # Skip the two correct ones
        if name in skip_names:
            print(f"[{i}/{len(trinkets)}] {name} - Skipping (already correct)")
            skipped.append(name)
            success_count += 1
            continue
        
        print(f"[{i}/{len(trinkets)}] Downloading {name}...")
        
        # Get the image URL
        image_url = get_trinket_image_url(name)
        
        if image_url:
            print(f"  Found: {image_url}")
            
            # Download the image
            if download_image(image_url, output_path):
                print(f"  Success! Saved to {trinket['image']}")
                success_count += 1
            else:
                print(f"  Failed to download")
                failed.append(name)
        else:
            print(f"  Failed to find image URL")
            failed.append(name)
        
        # Be nice to the server
        time.sleep(0.5)
    
    print(f"\n{'='*60}")
    print(f"Download complete!")
    print(f"Successfully processed: {success_count}/{len(trinkets)}")
    print(f"Skipped (already correct): {len(skipped)}")
    
    if failed:
        print(f"\nFailed to download ({len(failed)}):")
        for name in failed:
            print(f"  - {name}")
    
    print(f"\nImages saved to: {output_dir}")

if __name__ == "__main__":
    main()

