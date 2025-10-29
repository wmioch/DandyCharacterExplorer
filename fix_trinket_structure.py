"""
Fix trinket data structure to match what the UI expects.
Adds ID field and ensures categories match the filter system.
"""

import json
import re

def name_to_id(name):
    """Convert name to a simple ID."""
    # Remove special characters and convert to lowercase
    id_str = name.lower()
    id_str = re.sub(r"['\(\)]", '', id_str)  # Remove quotes and parentheses
    id_str = re.sub(r'[^a-z0-9]+', '_', id_str)  # Replace non-alphanumeric with underscore
    id_str = id_str.strip('_')  # Remove leading/trailing underscores
    return id_str

def map_category_to_filter(category):
    """Map our category names to match filter system."""
    mapping = {
        'movement_speed': 'movementSpeed',
        'stealth': 'stealth',
        'extraction': 'extractionSpeed',
        'stamina': 'stamina',
        'skill_check': 'skillCheckAmount',
        'other': 'other'
    }
    return mapping.get(category, 'other')

def main():
    # Load existing trinket data
    with open('data/trinkets.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    trinkets = data['trinkets']
    
    print(f"Processing {len(trinkets)} trinkets...\n")
    
    # Add ID field to each trinket and map categories
    for trinket in trinkets:
        # Generate ID from name
        trinket['id'] = name_to_id(trinket['name'])
        
        # Map category to filter-compatible name
        original_category = trinket['category']
        trinket['filterCategory'] = map_category_to_filter(original_category)
        
        print(f"  {trinket['name']}")
        print(f"    ID: {trinket['id']}")
        print(f"    Image: {trinket['image']}")
        print(f"    Category: {original_category} -> {trinket['filterCategory']}")
    
    # Save updated data
    with open('data/trinkets.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n[OK] Updated {len(trinkets)} trinkets with IDs and filter categories")
    print(f"[OK] Saved to data/trinkets.json")

if __name__ == "__main__":
    main()

