"""
Finalize the trinket data by cleaning up effects and fixing any issues.
"""

import json
import re

def load_trinkets():
    """Load the extracted trinket data."""
    with open('data/trinkets_extracted.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def fix_effect_text(name, effect):
    """Fix specific known issues with effect text."""
    
    # Remove remaining wiki markup
    effect = re.sub(r'\[\[([^|\]]+)\|([^\]]+)\]\]', r'\2', effect)
    effect = re.sub(r'\[\[([^\]]+)\]\]', r'\1', effect)
    effect = re.sub(r"'''?([^']+)'''?", r'\1', effect)
    
    # Fix specific trinket effects that were malformed
    fixes = {
        "Cardboard 'Armor'": "Protects the user from long-ranged Twisted attacks. Limit of 1 activation per Floor.",
        "Cooler": "Grants the user 50 more Stamina, but lowers Movement Speed by 5%.",
        "Water Cooler": "Grants the user 50 more Stamina, but lowers Movement Speed by 5%.",
        "Bone Needle and Thread": "Highlights Pumpkins in your vicinity every 10 seconds during matches, making them easier to spot during Events.",
        "Egg Radar": "Highlights Baskets in your vicinity every 10 seconds during matches, making them easier to spot during events.",
    }
    
    if name in fixes:
        return fixes[name]
    
    # Clean up any remaining issues
    effect = effect.strip()
    effect = re.sub(r'\s+', ' ', effect)  # Collapse multiple spaces
    effect = re.sub(r'<br\s*/?>', ' ', effect)  # Remove HTML br tags
    
    return effect

def categorize_trinket(name, effect):
    """Determine the category/type of a trinket based on its effect."""
    effect_lower = effect.lower()
    
    if 'movement speed' in effect_lower or 'walk speed' in effect_lower or 'run speed' in effect_lower:
        return 'movement_speed'
    elif 'stealth' in effect_lower:
        return 'stealth'
    elif 'extraction' in effect_lower or 'machine' in effect_lower:
        return 'extraction'
    elif 'stamina' in effect_lower:
        return 'stamina'
    elif 'skill check' in effect_lower:
        return 'skill_check'
    else:
        return 'other'

def determine_rarity(name):
    """Determine trinket rarity based on known categorizations."""
    # Based on the wiki structure
    common_research = ['Blue Bandana', 'Paint Bucket', 'Sweet Charm', 'Clown Horn', 'Pink Bow', 
                      'Brick', 'Feather Duster', 'Party Popper']
    
    uncommon_research = ['Spare Bulb', 'Ghost Snakes In A Can', 'Fishing Rod', 'Ribbon Spool',
                         'Magnifying Glass', 'Fancy Purse', 'Dog Plush']
    
    rare_research = ['Mime Makeup', 'Diary', 'Lucky Coin', 'Vanity Mirror', 
                    'Friendship Bracelet', 'Crayon Set']
    
    main_research = ['Star Pillow', 'Bone', 'Participation Award', 'Savory Charm', "Vee's Remote"]
    
    lethal_research = ['Dandy Plush', 'Train Whistle']
    
    event_trinkets = ['Egg Radar', 'Bone Needle and Thread', 'Festive Lights', 'Scrapbook',
                     'Peppermint Icing', 'Soul Sword', 'Glazed Fondant Bag', 'Coal (Trinket)',
                     'Moon Pack Heirloom', 'Whispering Flower', 'Toy Kit', 'Memory Locket']
    
    removed = ['Night Cap', 'Water Cooler']
    
    if name in common_research:
        return 'common'
    elif name in uncommon_research:
        return 'uncommon'
    elif name in rare_research:
        return 'rare'
    elif name in main_research:
        return 'main'
    elif name in lethal_research:
        return 'lethal'
    elif name in event_trinkets:
        return 'event'
    elif name in removed:
        return 'removed'
    else:
        return 'store'  # Available in Dandy's Store

def main():
    """Main function to finalize trinket data."""
    
    data = load_trinkets()
    trinkets = data['trinkets']
    
    print(f"Finalizing {len(trinkets)} trinkets...\n")
    
    # Process each trinket
    for trinket in trinkets:
        name = trinket['name']
        
        # Fix effect text
        original_effect = trinket['effect']
        trinket['effect'] = fix_effect_text(name, original_effect)
        
        # Add category
        trinket['category'] = categorize_trinket(name, trinket['effect'])
        
        # Add rarity
        trinket['rarity'] = determine_rarity(name)
        
        if original_effect != trinket['effect']:
            print(f"Fixed effect for {name}")
    
    # Sort by name
    trinkets.sort(key=lambda x: x['name'])
    
    # Save the finalized data
    output = {
        "trinkets": trinkets,
        "count": len(trinkets),
        "source": "Dandy's World Wiki - https://dandys-world-robloxhorror.fandom.com/wiki/Trinkets",
        "categories": {
            "movement_speed": "Trinkets that affect walk or run speed",
            "stealth": "Trinkets that affect stealth",
            "extraction": "Trinkets that affect extraction speed",
            "stamina": "Trinkets that affect stamina",
            "skill_check": "Trinkets that affect skill checks",
            "other": "Trinkets with miscellaneous effects"
        }
    }
    
    with open('data/trinkets.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n[OK] Finalized {len(trinkets)} trinkets!")
    print(f"[OK] Saved to data/trinkets.json")
    
    # Print category breakdown
    print("\nCategory breakdown:")
    categories = {}
    for trinket in trinkets:
        cat = trinket['category']
        categories[cat] = categories.get(cat, 0) + 1
    
    for cat, count in sorted(categories.items()):
        print(f"  {cat}: {count}")
    
    # Print rarity breakdown
    print("\nRarity breakdown:")
    rarities = {}
    for trinket in trinkets:
        rarity = trinket['rarity']
        rarities[rarity] = rarities.get(rarity, 0) + 1
    
    for rarity, count in sorted(rarities.items()):
        print(f"  {rarity}: {count}")
    
    print("\nSample trinkets:")
    for trinket in trinkets[:5]:
        print(f"\n{trinket['name']} ({trinket['rarity']}, {trinket['category']}):")
        print(f"  Effect: {trinket['effect'][:100]}...")
        print(f"  Image: {trinket['image']}")

if __name__ == "__main__":
    main()

