"""
Extract all trinket image URLs from their wiki pages.
"""

import json
import re
import urllib.request
import time

def load_trinkets():
    with open('data/trinkets.json', 'r', encoding='utf-8') as f:
        return json.load(f)['trinkets']

def get_image_url_from_page(trinket_name):
    """Fetch the trinket's wiki page and extract the image URL."""
    page_name = trinket_name.replace(' ', '_')
    url = f"https://dandys-world-robloxhorror.fandom.com/wiki/{page_name}"
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode('utf-8')
        
        # Look for the static.wikia URL pattern
        pattern = r'(https://static\.wikia\.nocookie\.net/dandys-world-robloxhorror/images/[^/]+/[^/]+/' + re.escape(page_name) + r'\.png)'
        matches = re.findall(pattern, html)
        
        if matches:
            return matches[0]
        
        # Try without https
        pattern2 = r'(static\.wikia\.nocookie\.net/dandys-world-robloxhorror/images/[^/]+/[^/]+/' + re.escape(page_name) + r'\.png)'
        matches2 = re.findall(pattern2, html)
        
        if matches2:
            return f"https://{matches2[0]}"
        
        return None
    except Exception as e:
        print(f"Error fetching {trinket_name}: {e}")
        return None

def main():
    trinkets = load_trinkets()
    skip = ["Cardboard 'Armor'", "Vee's Remote"]
    
    url_map = {}
    
    print(f"Extracting image URLs for {len(trinkets)} trinkets...\n")
    
    for i, trinket in enumerate(trinkets, 1):
        name = trinket['name']
        
        if name in skip:
            print(f"[{i}/{len(trinkets)}] {name} - Skipping")
            continue
        
        print(f"[{i}/{len(trinkets)}] {name}...", end=' ')
        
        url = get_image_url_from_page(name)
        
        if url:
            url_map[name] = url
            print(f"OK")
        else:
            print(f"FAILED")
        
        time.sleep(0.4)  # Be nice to the server
    
    # Save the URL map
    with open('trinket_image_urls.json', 'w', encoding='utf-8') as f:
        json.dump(url_map, f, indent=2)
    
    print(f"\nExtracted {len(url_map)} URLs")
    print(f"Saved to trinket_image_urls.json")

if __name__ == "__main__":
    main()

