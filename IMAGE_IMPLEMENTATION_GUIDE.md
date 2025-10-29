# Image Implementation Guide

## Overview
Images have been added throughout the interface for Toons, Trinkets, Items, and Twisteds. The system includes automatic fallback to placeholder images when assets are missing.

## Where Images Appear

### 1. **Toon Selection** (Left Column)
- **60x60px image** appears next to the dropdown when a toon is selected
- Shows the selected character's portrait
- Styled with purple border and shadow
- Location: Left of "Select Your Toon" dropdown

### 2. **Trinkets** (Middle Column)
- **32x32px icons** appear in each trinket checkbox row
- Shows trinket visual next to name and effect
- Scrollable list with all trinkets visible
- Location: In the trinket list checkbox items

### 3. **Items** (Right Column, Bottom)
- **28x28px icons** appear next to each item name
- Compact display with counter buttons
- Location: In the active items list

### 4. **Twisted Table** (Bottom Row, Left)
- **32x32px icons** appear in the first column next to twisted names
- Makes it easy to visually identify enemies
- Location: In the twisted name cell of the comparison table

## Image Directory Structure

```
assets/images/
├── toons/
│   ├── poppy.png
│   ├── astro.png
│   ├── vee.png
│   ├── shrimpo.png
│   ├── looey.png
│   └── ...
├── trinkets/
│   ├── speedy_shoes.png
│   ├── blue_bandana.png
│   ├── bone.png
│   ├── pink_bow.png
│   ├── machine_manual.png
│   ├── dog_plush.png
│   ├── participation_award.png
│   └── ...
├── items/
│   ├── speed_candy.png
│   ├── stealth_juice.png
│   ├── box_of_chocolate.png
│   ├── protein_bar.png
│   ├── bandage.png
│   └── ...
├── twisteds/
│   ├── twisted_poppy.png
│   ├── twisted_boxten.png
│   ├── twisted_shrimpo.png
│   ├── twisted_vee.png
│   ├── twisted_pebble.png
│   ├── twisted_astro.png
│   ├── twisted_sprout.png
│   ├── twisted_goob.png
│   └── ...
├── placeholder.png (fallback for missing images)
└── README.md
```

## Image Requirements

### Toons
- **Size**: 100x100px (displayed at 60x60px)
- **Format**: PNG with transparency
- **Style**: Character portraits or full-body sprites
- **Naming**: `{toon_id}.png` (e.g., `poppy.png`)

### Trinkets
- **Size**: 48x48px or 32x32px
- **Format**: PNG with transparency
- **Style**: Item icons, clear and recognizable
- **Naming**: `{trinket_id}.png` (e.g., `speedy_shoes.png`)

### Items
- **Size**: 32x32px or 48x48px
- **Format**: PNG with transparency
- **Style**: Consumable item icons
- **Naming**: `{item_id}.png` (e.g., `speed_candy.png`)

### Twisteds
- **Size**: 48x48px
- **Format**: PNG with transparency
- **Style**: Enemy portraits or icons
- **Naming**: `{twisted_id}.png` (e.g., `twisted_poppy.png`)

## How to Add Images

### Step 1: Obtain Images
Get images from:
1. **Dandy's World Wiki**: https://dandys-world-robloxhorror.fandom.com/wiki/Main_Page
   - Right-click images → Save Image As...
   - Download character portraits and item icons
   
2. **Roblox Game Screenshots**
   - Take screenshots in-game
   - Crop to appropriate size
   - Remove background if needed

3. **Fan Resources**
   - Community art (with permission)
   - Fan wikis and databases

### Step 2: Prepare Images
1. **Resize** to recommended dimensions
2. **Optimize** file size (< 50KB per image)
3. **Remove background** (make transparent) if needed
4. **Save as PNG** with correct naming convention

### Step 3: Add to Project
1. Place image in appropriate folder (`assets/images/toons/`, etc.)
2. Name exactly as the ID in the JSON files
3. Refresh the page - images load automatically!

## Tools for Image Preparation

### Free Tools
- **Remove Background**: https://remove.bg
- **Resize Images**: https://www.iloveimg.com/resize-image
- **Optimize PNG**: https://tinypng.com
- **Image Editor**: GIMP (free), Photoshop, or online editors

### Recommended Workflow
1. Download image from wiki
2. Remove background (remove.bg)
3. Resize to recommended size
4. Optimize with TinyPNG
5. Save with correct naming
6. Add to appropriate folder

## Automatic Fallback System

The application includes automatic fallback handling:
- If an image fails to load, it shows `placeholder.png`
- No broken image icons
- Graceful degradation

This means **you can launch without all images** and add them gradually!

## Creating a Placeholder Image

Replace `assets/images/placeholder.png` with a better default:
- Use a generic icon or logo
- Make it 64x64px
- Use a neutral color (gray)
- Add a "?" or generic symbol

Example: A simple colored square with the first letter of the name.

## Performance Tips

1. **Keep files small**: Target < 30KB per icon
2. **Use PNG-8** when possible (fewer colors = smaller file)
3. **Batch optimize**: Use TinyPNG to compress all at once
4. **Consider WebP**: Modern format with better compression (needs fallback)
5. **Lazy load**: Images only load when visible (automatic in modern browsers)

## Example: Getting Poppy's Image

1. Go to: https://dandys-world-robloxhorror.fandom.com/wiki/Poppy
2. Right-click the character portrait
3. Save as `poppy.png`
4. Open in image editor
5. Resize to 100x100px
6. Remove background (make transparent)
7. Save to `assets/images/toons/poppy.png`
8. Refresh the explorer page
9. Select Poppy from dropdown - her image appears!

## Bulk Image Extraction

For extracting many images at once:

### From Wiki
1. Visit each character/item page
2. Right-click → Inspect Element
3. Find image URL
4. Download programmatically (Python script, etc.)

### Python Script Example
```python
import requests
from bs4 import BeautifulSoup

# Fetch wiki page
url = "https://dandys-world-robloxhorror.fandom.com/wiki/Poppy"
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

# Find character image
img = soup.find('img', {'class': 'character-portrait'})
img_url = img['src']

# Download image
img_data = requests.get(img_url).content
with open('assets/images/toons/poppy.png', 'wb') as f:
    f.write(img_data)
```

## Testing

To test image implementation:
1. Add at least one image per category
2. Open the application
3. Select a toon with an image → Should display
4. Check trinket list → Icons should appear
5. Verify placeholder appears for missing images

## Next Steps

1. **Priority images** to add first:
   - Most popular toons (Poppy, Vee, Astro, etc.)
   - Common trinkets (Speedy Shoes, etc.)
   - Fastest/most dangerous twisteds
   
2. **Gradually fill in** remaining images

3. **Community contributions**: 
   - Share on Reddit/Discord
   - Ask for help gathering images
   - Credit contributors

## Credits

Remember to credit image sources:
- Dandy's World (Roblox game)
- Wiki contributors
- Community artists
- Screenshot providers

Add attribution in footer or about section.

