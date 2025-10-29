"""
Parse Dandy's World Trinkets wiki markup to extract trinket data.
Extracts: name, effect, and image filename from the raw wiki text.
"""

import re
import json

# The wiki markup text (to be filled from Puppeteer)
WIKI_TEXT = ""

def parse_trinket_box(text):
    """
    Extract trinket information from TrinketBox template calls.
    Format: {{TrinketBox|trinket=NAME|...}}
    """
    trinkets = []
    
    # Pattern to match TrinketBox templates
    trinket_box_pattern = r'\{\{TrinketBox\|trinket=([^|}]+)'
    matches = re.findall(trinket_box_pattern, text)
    
    for name in matches:
        trinkets.append(name.strip())
    
    return trinkets


def parse_trinket_table_rows(text):
    """
    Parse table rows to extract trinket names and their effects.
    Returns a list of (name, effect) tuples.
    """
    trinket_data = []
    
    # Split into different sections
    sections = text.split('|-|')
    
    for section in sections:
        # Look for table rows
        # Pattern: |{{TrinketBox|trinket=NAME...}} followed by effect description
        rows = section.split('|-\n')
        
        for row in rows:
            # Extract trinket name from TrinketBox
            name_match = re.search(r'\{\{TrinketBox\|trinket=([^|}]+)', row)
            if name_match:
                name = name_match.group(1).strip()
                
                # Extract effect - usually the last cell in the row
                # Effect is typically after the last | and before the next |-
                cells = row.split('|')
                if len(cells) > 1:
                    # Get the last non-empty cell as the effect
                    effect = ""
                    for cell in reversed(cells):
                        cleaned = cell.strip()
                        # Skip empty cells and cells with just wiki markup
                        if cleaned and not cleaned.startswith('{') and not cleaned.startswith('style='):
                            # Remove wiki markup from effect
                            effect = re.sub(r'\[\[([^|\]]+)\|?([^\]]*)\]\]', r'\2' if r'\2' else r'\1', cleaned)
                            effect = re.sub(r'\{\{[^}]+\}\}', '', effect)  # Remove templates
                            effect = re.sub(r'<[^>]+>', '', effect)  # Remove HTML tags
                            effect = effect.strip()
                            break
                    
                    if effect:
                        trinket_data.append((name, effect))
    
    return trinket_data


def clean_effect_text(effect):
    """
    Clean up wiki markup from effect text.
    """
    # Remove wiki links but keep the display text
    effect = re.sub(r'\[\[([^|\]]+)\|([^\]]+)\]\]', r'\2', effect)  # [[Link|Display]] -> Display
    effect = re.sub(r'\[\[([^\]]+)\]\]', r'\1', effect)  # [[Link]] -> Link
    
    # Remove templates like {{TI|...}}
    effect = re.sub(r'\{\{[^}]+\}\}', '', effect)
    
    # Remove HTML tags
    effect = re.sub(r'<[^>]+>', '', effect)
    
    # Clean up extra whitespace
    effect = re.sub(r'\s+', ' ', effect).strip()
    
    return effect


def extract_all_trinkets(wiki_text):
    """
    Main extraction function that parses the wiki text and returns structured data.
    """
    trinkets = {}
    
    # Pattern to capture trinket entries with their effects
    # Looking for patterns like:
    # |{{TrinketBox|trinket=NAME|...}}
    # |...  (other cells)
    # |Effect description here
    
    # Split by table rows
    lines = wiki_text.split('\n')
    current_trinket = None
    
    for i, line in enumerate(lines):
        # Check if line contains a TrinketBox
        trinket_match = re.search(r'\{\{TrinketBox\|trinket=([^|}]+)', line)
        if trinket_match:
            current_trinket = trinket_match.group(1).strip()
            
            # Look ahead for the effect in subsequent lines
            # Effect is usually in the last column of the table row
            effect = ""
            for j in range(i+1, min(i+10, len(lines))):
                next_line = lines[j]
                # Stop at next row or section
                if next_line.startswith('|-') or next_line.startswith('|}') or '{{TrinketBox' in next_line:
                    break
                # Check if this line looks like an effect description
                if next_line.startswith('|') and not next_line.startswith('| style='):
                    potential_effect = next_line[1:].strip()
                    # Longer text is more likely to be the effect
                    if len(potential_effect) > len(effect) and not potential_effect.startswith('{'):
                        effect = potential_effect
            
            if current_trinket and effect:
                cleaned_effect = clean_effect_text(effect)
                if cleaned_effect and len(cleaned_effect) > 10:  # Reasonable effect length
                    trinkets[current_trinket] = {
                        "name": current_trinket,
                        "effect": cleaned_effect,
                        "image": f"{current_trinket.lower().replace(' ', '_')}.png"
                    }
    
    return list(trinkets.values())


def main():
    """Main function to parse and save trinket data."""
    
    # This will be filled with the actual wiki text from Puppeteer
    if not WIKI_TEXT:
        print("Error: WIKI_TEXT is empty. Please fill it with the raw wiki markup.")
        return
    
    trinkets = extract_all_trinkets(WIKI_TEXT)
    
    # Sort by name
    trinkets.sort(key=lambda x: x['name'])
    
    # Save to JSON
    output = {
        "trinkets": trinkets,
        "count": len(trinkets)
    }
    
    with open('data/trinkets.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(trinkets)} trinkets")
    print("\nSample trinkets:")
    for trinket in trinkets[:5]:
        print(f"  - {trinket['name']}: {trinket['effect'][:80]}...")


if __name__ == "__main__":
    main()

