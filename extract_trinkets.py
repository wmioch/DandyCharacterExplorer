"""
Extract trinket data from Dandy's World Wiki raw markup.
This script parses the wiki text and extracts trinket names, effects, and generates image filenames.
"""

import re
import json
import os

# We'll fetch this from the browser
wiki_text = ""

def get_wiki_text_from_file():
    """Load wiki text from a temporary file."""
    try:
        with open('wiki_trinkets_raw.txt', 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return ""

def parse_trinkets_from_wiki(text):
    """
    Parse trinkets from the wiki markup.
    Extracts name and effect from table rows.
    """
    trinkets = []
    seen_names = set()
    
    # Split the text into table sections
    # Find all table rows that contain trinket information
    lines = text.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Look for TrinketBox templates
        trinket_match = re.search(r'\{\{TrinketBox\|trinket=([^|}]+)', line)
        
        if trinket_match:
            name = trinket_match.group(1).strip()
            
            # Skip if we've already seen this trinket
            if name in seen_names:
                i += 1
                continue
            
            seen_names.add(name)
            
            # Find the effect in the following lines
            effect = ""
            # Look ahead up to 6 lines for the effect description
            for j in range(1, min(7, len(lines) - i)):
                next_line = lines[i + j]
                
                # Stop at the next trinket or table boundary
                if ('{{TrinketBox' in next_line or 
                    next_line.startswith('|-') or 
                    next_line.startswith('|}')):
                    break
                
                # Check if this line contains the effect
                if next_line.startswith('|') and not next_line.startswith('| style='):
                    # Remove the leading |
                    potential_effect = next_line[1:].strip()
                    
                    # Skip lines that are just wiki markup or empty
                    if potential_effect and not potential_effect.startswith('{') and 'Icon.png' not in potential_effect:
                        # This is likely our effect line
                        if len(potential_effect) > len(effect):
                            effect = potential_effect
            
            # Clean up the effect text
            if effect:
                # Remove wiki links: [[Page|Display]] -> Display, [[Page]] -> Page
                effect = re.sub(r'\[\[([^|\]]+)\|([^\]]+)\]\]', r'\2', effect)
                effect = re.sub(r'\[\[([^\]]+)\]\]', r'\1', effect)
                
                # Remove template calls like {{TI|Ichor}}, {{Type|Common}}, etc.
                effect = re.sub(r'\{\{[^}]+\}\}', '', effect)
                
                # Remove HTML tags
                effect = re.sub(r'<[^>]+>', '', effect)
                
                # Remove wiki formatting
                effect = re.sub(r"'''([^']+)'''", r'\1', effect)  # Bold
                effect = re.sub(r"''([^']+)''", r'\1', effect)    # Italic
                
                # Clean up extra whitespace
                effect = re.sub(r'\s+', ' ', effect).strip()
                effect = re.sub(r'^\s*\|\s*', '', effect)  # Remove leading |
                
                # Only add if we have a meaningful effect
                if len(effect) > 10 and not effect.startswith('style='):
                    trinket = {
                        "name": name,
                        "effect": effect,
                        "image": f"trinket_{name.lower().replace(' ', '_').replace("'", '').replace('(', '').replace(')', '').replace('&', 'and')}.png"
                    }
                    trinkets.append(trinket)
                    print(f"Found: {name}")
        
        i += 1
    
    return trinkets

def main():
    """Main extraction function."""
    
    # Get wiki text
    wiki_text = get_wiki_text_from_file()
    
    if not wiki_text:
        print("Error: Could not load wiki text from wiki_trinkets_raw.txt")
        print("Please create this file with the raw wiki markup first.")
        return
    
    print("Parsing trinkets from wiki text...")
    print(f"Wiki text length: {len(wiki_text)} characters\n")
    
    trinkets = parse_trinkets_from_wiki(wiki_text)
    
    # Sort alphabetically
    trinkets.sort(key=lambda x: x['name'])
    
    # Create output directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Save to JSON
    output = {
        "trinkets": trinkets,
        "count": len(trinkets),
        "source": "Dandy's World Wiki - https://dandys-world-robloxhorror.fandom.com/wiki/Trinkets"
    }
    
    with open('data/trinkets_extracted.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n[OK] Successfully extracted {len(trinkets)} trinkets!")
    print(f"[OK] Saved to data/trinkets_extracted.json")
    
    # Print some samples
    print("\nSample trinkets:")
    for trinket in trinkets[:10]:
        print(f"\n{trinket['name']}:")
        effect_preview = trinket['effect'][:100] + ('...' if len(trinket['effect']) > 100 else '')
        print(f"  Effect: {effect_preview}")
        print(f"  Image: {trinket['image']}")

if __name__ == "__main__":
    main()

