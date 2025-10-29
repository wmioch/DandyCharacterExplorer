"""Find and download the missing trinket images."""
import re
import urllib.request

def find_image_url(trinket_name_for_url):
    """Find the image URL for a trinket from its wiki page."""
    url = f"https://dandys-world-robloxhorror.fandom.com/wiki/{trinket_name_for_url}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
        
        # Find all image URLs
        pattern = r'(https://static\.wikia\.nocookie\.net/[^"\']+\.png[^"\']*)'
        matches = re.findall(pattern, html)
        
        if matches:
            # Filter for the trinket image (usually contains "Trinket" in the URL)
            for match in matches:
                if 'Trinket' in match or trinket_name_for_url.replace('_', ' ') in match:
                    # Clean up the URL
                    match = re.sub(r'/revision/.*$', '', match)
                    match = re.sub(r'/scale-to-width-down/.*$', '', match)
                    return match
            # If no specific match, return the first one
            return matches[0].split('/revision')[0]
        
    except Exception as e:
        print(f"Error fetching {trinket_name_for_url}: {e}")
    
    return None

def download_image(url, output_path):
    """Download an image from a URL."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            image_data = response.read()
        
        with open(output_path, 'wb') as f:
            f.write(image_data)
        
        return True
    except Exception as e:
        print(f"Error downloading: {e}")
        return False

# Try to download the two missing trinkets
missing_trinkets = [
    ("Cardboard_%27Armor%27", "assets/images/trinkets/trinket_cardboard_armor.png"),
    ("Vee%27s_Remote", "assets/images/trinkets/trinket_vees_remote.png"),
]

for wiki_name, output_path in missing_trinkets:
    print(f"\nProcessing {wiki_name}...")
    image_url = find_image_url(wiki_name)
    
    if image_url:
        print(f"  Found image: {image_url}")
        if download_image(image_url, output_path):
            print(f"  Success! Saved to {output_path}")
        else:
            print(f"  Failed to download")
    else:
        print(f"  Could not find image URL")

