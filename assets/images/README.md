# Image Assets for Dandy's World Character Explorer

## Directory Structure

```
assets/images/
├── toons/           # Toon character images
├── trinkets/        # Trinket item images
├── items/           # Consumable item images
├── twisteds/        # Twisted enemy images
└── placeholder.png  # Default placeholder image
```

## Image Specifications

### Toons (Character Images)
- **Location**: `assets/images/toons/`
- **Naming**: `{toon_id}.png` (e.g., `poppy.png`, `astro.png`)
- **Recommended Size**: 100x100px
- **Format**: PNG with transparency preferred
- **Status**: ✅ All 38 toon images downloaded from Dandy's World Wiki

### Trinkets
- **Location**: `assets/images/trinkets/`
- **Naming**: `{trinket_id}.png` (e.g., `speedy_shoes.png`, `blue_bandana.png`)
- **Recommended Size**: 32x32px or 48x48px
- **Format**: PNG with transparency preferred

### Items
- **Location**: `assets/images/items/`
- **Naming**: `{item_id}.png` (e.g., `speed_candy.png`, `stealth_juice.png`)
- **Recommended Size**: 32x32px or 48x48px
- **Format**: PNG with transparency preferred

### Twisteds (Enemy Images)
- **Location**: `assets/images/twisteds/`
- **Naming**: `{twisted_id}.png` (e.g., `twisted_poppy.png`, `twisted_shrimpo.png`)
- **Recommended Size**: 48x48px
- **Format**: PNG with transparency preferred

## Image Sources

Images can be obtained from:
1. **Dandy's World Wiki**: https://dandys-world-robloxhorror.fandom.com/wiki/Main_Page
2. **Roblox Game Assets**: Screenshots from in-game
3. **Community Resources**: Fan art (with permission)

## Missing Images

If an image is missing, the application will display a placeholder icon with the first letter of the name.

## Adding New Images

1. Save the image with the correct naming convention
2. Place it in the appropriate folder
3. No code changes required - images will load automatically
4. Refresh the page to see the new image

## Optimization Tips

- Keep file sizes small (< 50KB per image)
- Use PNG-8 or PNG-24 with alpha transparency
- Consider using WebP format for better compression (fallback to PNG)
- Optimize images with tools like TinyPNG or ImageOptim

