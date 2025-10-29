"""
Download all trinket images using the extracted URLs.
"""

import json
import os
import time
import urllib.request

def main():
    # Load trinkets and URLs
    with open('data/trinkets.json', 'r', encoding='utf-8') as f:
        trinkets = {t['name']: t for t in json.load(f)['trinkets']}
    
    with open('trinket_image_urls.json', 'r', encoding='utf-8') as f:
        urls = json.load(f)
    
    output_dir = 'assets/images/trinkets'
    os.makedirs(output_dir, exist_ok=True)
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    success = 0
    failed = []
    
    print(f"Downloading {len(urls)} trinket images...\n")
    
    for i, (name, url) in enumerate(urls.items(), 1):
        if name not in trinkets:
            print(f"[{i}/{len(urls)}] {name} - Not in trinket data, skipping")
            continue
        
        output_path = os.path.join(output_dir, trinkets[name]['image'])
        
        print(f"[{i}/{len(urls)}] {name}...", end=' ')
        
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                data = response.read()
            
            with open(output_path, 'wb') as f:
                f.write(data)
            
            print(f"OK ({len(data)} bytes)")
            success += 1
            
        except Exception as e:
            print(f"FAILED - {e}")
            failed.append(name)
        
        time.sleep(0.3)
    
    print(f"\n{'='*60}")
    print(f"Downloaded: {success}/{len(urls)}")
    
    if failed:
        print(f"\nFailed ({len(failed)}):")
        for name in failed:
            print(f"  - {name}")

if __name__ == "__main__":
    main()

