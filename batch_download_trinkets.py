"""
Batch download trinket images from the Fandom wiki.
Uses the known URL pattern from the working examples.
"""

import json
import os
import time
import urllib.request

def load_trinkets():
    """Load trinket data."""
    with open('data/trinkets.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data['trinkets']

def download_image(url, filepath):
    """Download image from URL to filepath."""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as response:
            data = response.read()
        
        with open(filepath, 'wb') as f:
            f.write(data)
        return True
    except Exception as e:
        print(f"    Error: {e}")
        return False

def main():
    trinkets = load_trinkets()
    output_dir = 'assets/images/trinkets'
    
    # URLs found from the wiki (using known working URLs)
    trinket_urls = {
        "Alarm": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/e/e3/Alarm.png",
        "Blue Bandana": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/8/8d/Blue_Bandana.png",
        "Blushy Bat": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/a/ab/Blushy_Bat.png",
        "Bone": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/c/c0/Bone.png",
        "Bone Needle and Thread": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/5/5c/Bone_Needle_and_Thread.png",
        "Brick": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/a/a0/Brick.png",
        "Clown Horn": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/b/bc/Clown_Horn.png",
        "Coal (Trinket)": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/b/ba/Coal_%28Trinket%29.png",
        "Coin Purse": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/5/56/Coin_Purse.png",
        "Cooler": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/5/5f/Cooler.png",
        "Crayon Set": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/d/d0/Crayon_Set.png",
        "Dandy Plush": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/4/4f/Dandy_Plush.png",
        "Diary": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/e/e2/Diary.png",
        "Dog Plush": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/1/11/Dog_Plush.png",
        "Egg Radar": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/f/f5/Egg_Radar.png",
        "Fancy Purse": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/b/b9/Fancy_Purse.png",
        "Feather Duster": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/8/86/Feather_Duster.png",
        "Festive Lights": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/2/2a/Festive_Lights.png",
        "Fishing Rod": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/8/80/Fishing_Rod.png",
        "Friendship Bracelet": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/1/1f/Friendship_Bracelet.png",
        "Ghost Snakes In A Can": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/e/e3/Ghost_Snakes_In_A_Can.png",
        "Glazed Fondant Bag": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/f/ff/Glazed_Fondant_Bag.png",
        "Lucky Coin": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/d/d8/Lucky_Coin.png",
        "Machine Manual": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/c/cd/Machine_Manual.png",
        "Magnifying Glass": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/c/c9/Magnifying_Glass.png",
        "Megaphone": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/c/c0/Megaphone.png",
        "Memory Locket": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/3/3f/Memory_Locket.png",
        "Mime Makeup": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/d/d2/Mime_Makeup.png",
        "Moon Pack Heirloom": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/1/18/Moon_Pack_Heirloom.png",
        "Night Cap": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/d/d3/Night_Cap.png",
        "Paint Bucket": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/b/b7/Paint_Bucket.png",
        "Participation Award": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/b/b0/Participation_Award.png",
        "Party Popper": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/6/6c/Party_Popper.png",
        "Peppermint Icing": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/6/61/Peppermint_Icing.png",
        "Pink Bow": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/0/06/Pink_Bow.png",
        "Pop Pack": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/8/8c/Pop_Pack.png",
        "Pull Toy": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/3/33/Pull_Toy.png",
        "Research Map": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/6/6b/Research_Map.png",
        "Ribbon Spool": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/5/54/Ribbon_Spool.png",
        "Savory Charm": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/6/68/Savory_Charm.png",
        "Scrapbook": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/5/54/Scrapbook.png",
        "Soul Sword": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/4/4b/Soul_Sword.png",
        "Spare Bulb": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/7/70/Spare_Bulb.png",
        "Speedometer": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/f/fd/Speedometer.png",
        "Speedy Shoes": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/c/c8/Speedy_Shoes.png",
        "Star Pillow": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/6/66/Star_Pillow.png",
        "Sweet Charm": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/4/43/Sweet_Charm.png",
        "Thermos": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/d/d6/Thermos.png",
        "Thinking Cap": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/4/40/Thinking_Cap.png",
        "Toy Kit": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/d/d4/Toy_Kit.png",
        "Train Whistle": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/8/8d/Train_Whistle.png",
        "Vanity Mirror": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/a/a4/Vanity_Mirror.png",
        "Water Cooler": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/e/ee/Water_Cooler.png",
        "Whispering Flower": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/d/dd/Whispering_Flower.png",
        "Wrench": "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/5/5d/Wrench.png",
    }
    
    skip = ["Cardboard 'Armor'", "Vee's Remote"]
    
    print(f"Downloading {len(trinket_urls)} trinket images...\n")
    
    success = 0
    failed = []
    
    for trinket in trinkets:
        name = trinket['name']
        
        if name in skip:
            print(f"[SKIP] {name} - Already correct")
            success += 1
            continue
        
        if name not in trinket_urls:
            print(f"[WARN] {name} - No URL found")
            failed.append(name)
            continue
        
        output_path = os.path.join(output_dir, trinket['image'])
        url = trinket_urls[name]
        
        print(f"[{success+len(failed)+1}/{len(trinkets)}] {name}")
        
        if download_image(url, output_path):
            print(f"    [OK] Downloaded to {trinket['image']}")
            success += 1
        else:
            print(f"    [FAIL] Failed")
            failed.append(name)
        
        time.sleep(0.3)
    
    print(f"\n{'='*60}")
    print(f"Complete: {success}/{len(trinkets)} successful")
    
    if failed:
        print(f"\nFailed ({len(failed)}):")
        for name in failed:
            print(f"  - {name}")

if __name__ == "__main__":
    main()

