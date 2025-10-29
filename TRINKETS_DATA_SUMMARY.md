# Trinkets Data Summary

## Overview
Successfully downloaded and extracted all trinket data from the Dandy's World Wiki.

## Data Collected

### Total Trinkets: 57

### Files Created
- `data/trinkets.json` - Complete trinket data with names, effects, images, categories, and rarities
- `assets/images/trinkets/` - 57 trinket images downloaded from the wiki

### Data Structure
Each trinket includes:
- **name**: The trinket's name
- **effect**: Description of what the trinket does
- **image**: Filename for the trinket's image
- **category**: Type of effect (movement_speed, stealth, extraction, stamina, skill_check, other)
- **rarity**: How the trinket is obtained (common, uncommon, rare, main, lethal, event, store, removed)

### Category Breakdown
- **Extraction**: 7 trinkets (affect extraction/machine completion speed)
- **Movement Speed**: 13 trinkets (affect walk or run speed)
- **Stamina**: 4 trinkets (affect stamina capacity or regeneration)
- **Skill Check**: 5 trinkets (affect skill check size, chance, or rewards)
- **Stealth**: 1 trinket (affect stealth stat)
- **Other**: 27 trinkets (miscellaneous effects like abilities, items, discounts, etc.)

### Rarity Breakdown
- **Store** (purchasable in Dandy's Store): 15 trinkets
- **Common** (from common twisted research): 8 trinkets
- **Uncommon** (from uncommon twisted research): 7 trinkets
- **Rare** (from rare twisted research): 6 trinkets
- **Main** (from main character twisted research): 5 trinkets
- **Lethal** (from lethal twisted research): 2 trinkets
- **Event** (from seasonal/event twisted research): 12 trinkets
- **Removed** (no longer available): 2 trinkets

## Sample Trinkets

### Store Trinkets
- **Alarm**: Increases Movement Speed by 25% when Panic Mode activates for 10 seconds.
- **Speedy Shoes**: Increases both Walk and Run Speed by 5%.
- **Wrench**: Instantly adds a large amount of completion to the first Machine you extract from on any Floor.

### Research Trinkets
- **Blue Bandana** (Common): Increases your Extraction Speed by 7.5%, but reduces Skill Check chances by 5%.
- **Diary** (Rare): Increases Stealth by 25%.
- **Savory Charm** (Main): Saves the user from a fatal attack, granting them invincibility for 10 seconds.

### Event Trinkets
- **Bone Needle and Thread** (Halloween): Highlights Pumpkins in your vicinity every 10 seconds.
- **Festive Lights** (Christmas): Highlights Ornaments in your vicinity every 10 seconds.
- **Egg Radar** (Easter): Highlights Baskets in your vicinity every 10 seconds.

## Data Source
All data extracted from: https://dandys-world-robloxhorror.fandom.com/wiki/Trinkets

## Next Steps
The trinket data can now be:
1. Integrated into the character explorer UI
2. Used in the trinket selection system
3. Referenced for build optimization calculations
4. Displayed with proper images in the interface

## Notes
- All images are in PNG format
- Effects have been cleaned and formatted
- Special characters in filenames have been normalized
- Two trinkets (Night Cap, Water Cooler) are marked as removed

