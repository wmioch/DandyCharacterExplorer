# Dandy's World Character Explorer

A web application for exploring and calculating detailed character statistics for the Roblox game **Dandy's World**.

## Features

- 📊 Real-time stat calculations based on Toons, Trinkets, and Items
- 👥 Team composition planning with ability toggles
- 🎯 Color-coded Twisted enemy speed comparisons
- ⚙️ Machine extraction time calculator with skill check success rate slider
- 🔗 Shareable builds via URL parameters
- 📱 Fully responsive design for desktop, tablet, and mobile

## How to Run

### Option 1: Double-click the Batch File (Easiest)
1. Double-click `start-server.bat`
2. Wait for the server to start
3. Open your browser to: **http://localhost:8000**

### Option 2: PowerShell
1. Right-click `start-server.ps1` → "Run with PowerShell"
2. Open your browser to: **http://localhost:8000**

### Option 3: Manual Python Command
```bash
python -m http.server 8000
```
Then open: **http://localhost:8000**

### ⚠️ Important: Do NOT open index.html directly
Opening the HTML file directly in your browser (`file://` protocol) will **not work** due to CORS security restrictions. You **must** use a local web server.

## Usage

1. **Select a Toon** - Choose your playable character
2. **Equip Trinkets** - Check up to 2 trinkets (or more for experimentation)
3. **Choose Team Members** - Select up to 7 other Toons
4. **Toggle Abilities & Items** - See real-time stat changes
5. **Review Twisted Speeds** - Color-coded enemy speed comparisons
6. **Adjust Machine Stats** - Use the skill check slider to see extraction times

## Project Structure

```
DandyCharacterExplorer/
├── index.html              # Main application page
├── start-server.bat        # Windows batch server launcher
├── start-server.ps1        # PowerShell server launcher
├── css/
│   ├── main.css           # Core styles and layout
│   ├── components.css     # UI component styles
│   └── responsive.css     # Mobile/tablet responsive styles
├── js/
│   ├── app.js            # Main application logic
│   ├── ui.js             # UI rendering functions
│   ├── data-loader.js    # JSON data loading
│   ├── calculator.js     # Stat calculation engine
│   └── url-params.js     # URL parameter encoding/decoding
├── data/
│   ├── stat-mappings.json # Star rating → number conversions
│   ├── toons.json         # Character data
│   ├── trinkets.json      # Equipment data
│   ├── items.json         # Consumable items data
│   └── twisteds.json      # Enemy data
├── assets/
│   └── images/
│       ├── toons/         # Character images (place here)
│       ├── trinkets/      # Trinket images (place here)
│       ├── items/         # Item images (place here)
│       └── twisteds/      # Enemy images (place here)
└── generator_models.py    # Machine extraction formula reference

```

## Adding Images

To add images, place PNG files in the appropriate folders under `assets/images/`:

- **Toons**: `assets/images/toons/{toon-id}.png` (e.g., `poppy.png`)
- **Trinkets**: `assets/images/trinkets/{trinket-id}.png` (e.g., `speedy_shoes.png`)
- **Items**: `assets/images/items/{item-id}.png` (e.g., `speed_candy.png`)
- **Twisteds**: `assets/images/twisteds/{twisted-id}.png` (e.g., `twisted_poppy.png`)

If images are missing, colorful letter placeholders will display automatically.

## Fonts Used

- **Fredoka One** (Google Fonts) - Main UI text
- **ITC Kabel Bold** - Logo and headings (with fallbacks)

## Technology Stack

- Pure HTML5, CSS3, and Vanilla JavaScript
- No build tools or dependencies required
- Static hosting compatible (GitHub Pages, Netlify, Vercel)

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Requires modern browser with ES6+ support

## Future Enhancements

- [ ] Extract complete data from Dandy's World wiki
- [ ] Implement full machine extraction formula
- [ ] Add ability/item stacking calculations
- [ ] Create build sharing functionality
- [ ] Add more conditional stat scenarios

## Credits

Based on the Roblox game **Dandy's World**
- Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Main_Page

---

**Made with 💜 for the Dandy's World community**
