# Dandy's World Character Explorer - Implementation Plan

## Project Overview
A web-based character statistics explorer for Roblox game "Dandy's World" that allows players to calculate and visualize their Toon's stats with various equipment, team compositions, and compare against enemy (Twisted) speeds.

**Target Audience**: Children/adolescents who play Dandy's World  
**Hosting**: Static site (GitHub Pages, Netlify, or Vercel - free tier)  
**Platform**: Responsive web (desktop & mobile)

---

## Technology Stack

### Core Technologies
- **HTML5**: Structure and semantic markup
- **CSS3**: Styling with responsive design (CSS Grid/Flexbox)
- **Vanilla JavaScript (ES6+)**: All interactivity and calculations
- **JSON**: Data storage for all game entities

### Why This Stack?
- Zero build process required
- No dependencies or package management
- Easy to update data files
- Works anywhere (can even be run locally by opening index.html)
- Free hosting on multiple platforms
- Fast load times

### Optional Enhancements (Future)
- LocalStorage for saving user preferences
- URL parameter sharing for build sharing
- Service Worker for offline functionality

---

## Project Structure

```
dandy-character-explorer/
├── index.html                      # Main application file
├── css/
│   ├── main.css                    # Core styles
│   ├── components.css              # UI component styles
│   └── responsive.css              # Mobile/tablet breakpoints
├── js/
│   ├── app.js                      # Main application controller
│   ├── calculator.js               # Stat calculation engine
│   ├── ui.js                       # UI update functions
│   └── data-loader.js              # JSON data loading
├── data/
│   ├── toons.json                  # All Toon data
│   ├── trinkets.json               # All Trinket data
│   ├── twisteds.json               # All Twisted enemy data
│   ├── items.json                  # All consumable items
│   ├── abilities.json              # Ability definitions
│   └── stat-mappings.json          # Star rating to number conversions
├── assets/
│   └── images/                     # (Optional) Toon/Trinket icons
└── README.md                       # Usage and update instructions
```

---

## Data Schema Design

### 1. `stat-mappings.json`
Converts star ratings to actual numerical values for each stat type.

```json
{
  "movementSpeed": {
    "1": 12.0,
    "2": 14.0,
    "3": 16.0,
    "4": 18.0,
    "5": 20.0
  },
  "stealthRating": {
    "1": 5.0,
    "2": 10.0,
    "3": 15.0,
    "4": 20.0,
    "5": 25.0
  },
  "extractionSpeed": {
    "1": 1.0,
    "2": 2.0,
    "3": 3.0,
    "4": 4.0,
    "5": 5.0
  },
  "skillCheckDifficulty": {
    "1": 10.0,
    "2": 20.0,
    "3": 30.0,
    "4": 40.0,
    "5": 50.0
  },
  "stamina": {
    "1": 50.0,
    "2": 100.0,
    "3": 150.0,
    "4": 200.0,
    "5": 250.0
  }
}
```

### 2. `toons.json`
All playable Toons with their base stats.

```json
{
  "toons": [
    {
      "id": "poppy",
      "name": "Poppy",
      "description": "A cheerful Toon",
      "baseStats": {
        "movementSpeed": {"walk": 16.0, "run": 20.0},
        "stealthRating": 15.0,
        "extractionSpeed": 1.0,
        "skillCheckDifficulty": 30.0,
        "stamina": 100.0,
        "hearts": 2
      },
      "ability": {
        "name": "Poppy's Bubble",
        "description": "Increases movement speed nearby allies",
        "effectType": "teamBuff",
        "targetStat": "movementSpeed",
        "value": 0.1,
        "applicationType": "multiplicative",
        "affectsSelf": false
      },
      "conditionalStats": null,
      "starRatings": {
        "movementSpeed": 3,
        "stealthRating": 3,
        "extractionSpeed": 1,
        "skillCheckDifficulty": 3,
        "stamina": 2
      }
    },
    {
      "id": "looey",
      "name": "Looey",
      "description": "Changes stats based on hearts remaining",
      "baseStats": {
        "movementSpeed": {"walk": 18.0, "run": 22.0},
        "stealthRating": 10.0,
        "extractionSpeed": 2.0,
        "skillCheckDifficulty": 25.0,
        "stamina": 150.0,
        "hearts": 3
      },
      "ability": null,
      "conditionalStats": [
        {
          "id": "looey_3hearts",
          "name": "3 Hearts",
          "condition": "hearts === 3",
          "statModifiers": {
            "movementSpeed": {"walk": 18.0, "run": 22.0},
            "extractionSpeed": 2.0
          }
        },
        {
          "id": "looey_2hearts",
          "name": "2 Hearts",
          "condition": "hearts === 2",
          "statModifiers": {
            "movementSpeed": {"walk": 19.0, "run": 23.0},
            "extractionSpeed": 2.5
          }
        },
        {
          "id": "looey_1heart",
          "name": "1 Heart",
          "condition": "hearts === 1",
          "statModifiers": {
            "movementSpeed": {"walk": 20.0, "run": 24.0},
            "extractionSpeed": 3.0
          }
        }
      ],
      "starRatings": {
        "movementSpeed": 4,
        "stealthRating": 2,
        "extractionSpeed": 2,
        "skillCheckDifficulty": 2,
        "stamina": 3
      }
    }
  ]
}
```

### 3. `trinkets.json`
All equippable trinkets with their effects.

```json
{
  "trinkets": [
    {
      "id": "speedy_shoes",
      "name": "Speedy Shoes",
      "description": "Increases movement speed by 10%",
      "rarity": "common",
      "effects": [
        {
          "targetStat": "movementSpeed",
          "value": 0.1,
          "applicationType": "multiplicative"
        }
      ],
      "conditional": false,
      "activationCondition": null
    },
    {
      "id": "bone",
      "name": "Bone",
      "description": "Increases extraction speed after picking up an item (caps at specific value)",
      "rarity": "rare",
      "effects": [
        {
          "targetStat": "extractionSpeed",
          "value": 0.5,
          "applicationType": "multiplicative",
          "cap": 10.0
        }
      ],
      "conditional": true,
      "activationCondition": "itemPickedUp"
    },
    {
      "id": "blue_bandana",
      "name": "Blue Bandana",
      "description": "Increases stealth by 15%",
      "rarity": "uncommon",
      "effects": [
        {
          "targetStat": "stealthRating",
          "value": 0.15,
          "applicationType": "multiplicative"
        }
      ],
      "conditional": false,
      "activationCondition": null
    }
  ]
}
```

### 4. `items.json`
Consumable items with temporary effects.

```json
{
  "items": [
    {
      "id": "speed_candy",
      "name": "Speed Candy",
      "description": "Temporarily increases movement speed by 20%",
      "duration": "temporary",
      "stackable": true,
      "effects": [
        {
          "targetStat": "movementSpeed",
          "value": 0.2,
          "applicationType": "multiplicative"
        }
      ]
    },
    {
      "id": "stealth_juice",
      "name": "Stealth Juice",
      "description": "Increases stealth rating by 25%",
      "duration": "temporary",
      "stackable": true,
      "effects": [
        {
          "targetStat": "stealthRating",
          "value": 0.25,
          "applicationType": "multiplicative"
        }
      ]
    }
  ]
}
```

### 5. `twisteds.json`
All enemy Twisted data with their various speeds.

```json
{
  "twisteds": [
    {
      "id": "twisted_poppy",
      "name": "Twisted Poppy",
      "description": "A corrupted version of Poppy",
      "speeds": {
        "normal": {
          "walk": 14.0,
          "run": 18.0
        },
        "panic": {
          "walk": 16.0,
          "run": 20.0
        },
        "panicSuppressed": {
          "walk": 15.0,
          "run": 19.0
        }
      },
      "notes": "Standard twisted enemy"
    },
    {
      "id": "twisted_shrimpo",
      "name": "Twisted Shrimpo",
      "description": "Fast and dangerous",
      "speeds": {
        "normal": {
          "walk": 18.0,
          "run": 24.0
        },
        "panic": {
          "walk": 20.0,
          "run": 26.0
        },
        "panicSuppressed": {
          "walk": 19.0,
          "run": 25.0
        }
      },
      "notes": "One of the fastest twisteds"
    }
  ]
}
```

### 6. `abilities.json`
Standalone ability definitions (for reference and UI).

```json
{
  "abilities": [
    {
      "id": "poppy_bubble",
      "name": "Poppy's Bubble",
      "toonId": "poppy",
      "description": "Increases movement speed of nearby allies by 10%",
      "effectType": "teamBuff",
      "targetStat": "movementSpeed",
      "value": 0.1,
      "applicationType": "multiplicative",
      "affectsSelf": false,
      "stackable": true
    }
  ]
}
```

---

## UI Layout & Components

### Overall Layout Structure

```
┌────────────────────────────────────────────────────────────┐
│                    HEADER                                  │
│  Dandy's World Character Explorer                          │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│                 TOON SELECTION                             │
│  [Dropdown: Select Your Toon]                              │
└────────────────────────────────────────────────────────────┘
┌──────────────────────────┬─────────────────────────────────┐
│  EQUIPMENT & MODIFIERS   │   STATS DISPLAY                 │
│                          │                                 │
│  Trinkets (2 slots)      │   ┌─Radio─┬─Radio─┬─Radio─┐    │
│  [Slot 1: Dropdown]      │   │ Set 1 │ Set 2 │ Set 3 │    │
│  [Slot 2: Dropdown]      │   └───────┴───────┴───────┘    │
│                          │                                 │
│  Team (7 slots)          │   Walk Speed:  16.0 (+25%) 20.0│
│  [1: Dropdown]           │   Run Speed:   20.0 (+25%) 25.0│
│  [2: Dropdown]           │   Stealth:     15.0 (+10%) 16.5│
│  ... (7 total)           │   Extraction:   1.0 (+50%)  1.5│
│                          │   Skill Check: 30.0 (+0%)  30.0│
│  Team Abilities:         │   Stamina:    100.0 (+0%) 100.0│
│  ☐ Poppy's Bubble (x2)   │                                 │
│  ☐ Astro's Boost         │                                 │
│                          │                                 │
│  Items:                  │   MACHINE EXTRACTION            │
│  ☐ Speed Candy (x2)      │   Base Time: 45.0s              │
│  ☐ Stealth Juice         │   With Buffs: 30.0s             │
│                          │   Skill Checks: [Slider: 0-10]  │
│                          │   Adjusted: 27.5s               │
└──────────────────────────┴─────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│              TWISTED COMPARISON TABLE                      │
│  [Sort: Speed ▼] [Sort: Name]                              │
│                                                            │
│  Twisted Name  │ Normal │ Normal │ Panic │ Panic │ P+Sup │P+Sup│
│                │  Walk  │  Run   │ Walk  │  Run  │ Walk  │ Run │
│  ───────────────┼────────┼────────┼───────┼───────┼───────┼─────│
│  Twisted X     │  14.0  │  18.0  │ 16.0  │ 20.0  │ 15.0  │19.0 │
│                │  🟢    │  🟢    │  🟡   │  🟢   │  🟡   │ 🟢  │
│  Twisted Y     │  20.0  │  26.0  │ 22.0  │ 28.0  │ 21.0  │27.0 │
│                │  🔴    │  🟡    │  🔴   │  🔴   │  🔴   │ 🔴  │
└────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────┐
│                    FOOTER                                  │
│  [Share Build URL] | Data from Dandy's World Wiki          │
└────────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### 1. **Toon Selection Component**
- Dropdown with all available Toons
- On selection, loads base stats and available abilities
- Triggers conditional stat radio buttons if applicable

#### 2. **Equipment Panel**
- **Trinket Slots (2)**
  - Dropdown selectors
  - Shows trinket name and brief description
  - "None" option available
  - Visual indicator if trinket is conditional (needs activation)
  
- **Team Composition (7 slots)**
  - Dropdown selectors for each team member
  - Can select same Toon multiple times
  - "Empty Slot" option available
  
- **Team Abilities Section**
  - Checkboxes for each ability from team members
  - Shows count if multiple instances (e.g., "Poppy's Bubble (x2)")
  - Only shows abilities that can affect the player
  
- **Items Section**
  - Checkboxes for all available items
  - Counter showing how many instances are active
  - "+/-" buttons to add/remove item stacks

#### 3. **Stats Display Panel**
- **Conditional Stats Radio Buttons** (if applicable)
  - Only visible for Toons with multiple stat sets
  - Clearly labeled (e.g., "3 Hearts", "2 Hearts", "1 Heart")
  
- **Stats Table**
  - Column 1: Stat Name
  - Column 2: Base Value
  - Column 3: Modifier (as percentage)
  - Column 4: Final Value (calculated)
  - Color coding: Green for positive changes
  
- **Machine Extraction Info Box**
  - Base completion time (45 seconds / extraction speed)
  - Modified completion time with all buffs
  - Skill check slider (0-10 successful checks)
  - Final adjusted time

#### 4. **Twisted Comparison Table**
- Sortable by speed (fastest first) or name (alphabetical)
- 6 speed columns with color-coded indicators
- Color legend at top of table
- Sticky header for scrolling
- Responsive: Collapses to cards on mobile

#### 5. **Share Build Feature**
- Button to generate shareable URL
- Encodes: Toon, Trinkets, Team, Active Abilities, Active Items, Conditional Stat Selection
- Copy to clipboard functionality
- Toast notification on copy success

---

## Implementation Phases

### Phase 1: Foundation & Data Setup
**Goal**: Set up project structure and load static data

**Tasks**:
1. Create project folder structure
2. Create all JSON data files with initial schema
3. Populate JSON files with data from wiki (manual entry or scraping)
4. Create `data-loader.js` to fetch and parse JSON files
5. Create basic `index.html` with semantic structure
6. Create basic CSS framework with responsive grid

**Deliverables**:
- Complete project structure
- Populated data files
- Functional data loading system
- Basic HTML structure

---

### Phase 2: UI Implementation
**Goal**: Build all UI components without functionality

**Tasks**:
1. **Toon Selection**
   - Create dropdown populated from `toons.json`
   - Style dropdown with proper spacing
   
2. **Equipment Panel**
   - Create 2 trinket dropdowns from `trinkets.json`
   - Create 7 team member dropdowns from `toons.json`
   - Create team abilities checkbox section (dynamic)
   - Create items checkbox/counter section from `items.json`
   
3. **Stats Display Panel**
   - Create conditional stats radio button group (dynamic, hidden by default)
   - Create stats table with 4 columns
   - Create machine extraction info box with slider
   
4. **Twisted Comparison Table**
   - Create table with 6 speed columns
   - Add sort buttons
   - Populate with all Twisteds from `twisteds.json`
   - Add color indicator cells (placeholder)
   
5. **Responsive Design**
   - Mobile breakpoints for panels
   - Twisted table converts to cards on mobile
   - Touch-friendly controls

**Deliverables**:
- Complete UI with all components
- Responsive layout working on desktop and mobile
- All controls present (non-functional)

---

### Phase 3: Core Calculation Engine
**Goal**: Implement all stat calculations

**Tasks**:
1. **Create `calculator.js` module with functions**:
   - `calculateFinalStats(toon, trinkets, teamAbilities, items, conditionalStatSet)`
   - `applyMultiplicativeModifier(baseStat, modifiers)`
   - `applyAdditiveModifier(baseStat, modifiers)` (for rare cases)
   - `checkStatCap(stat, value, cap)`
   - `calculateMachineTime(extractionSpeed, skillChecks)`
   - `compareTwistedSpeed(playerWalk, playerRun, twistedSpeed)`
   
2. **Implement stat calculation logic**:
   - Load base stats from selected Toon
   - Apply conditional stat set if selected
   - Apply trinket modifiers (with cap handling for Bone)
   - Apply team ability modifiers (stacking)
   - Apply item modifiers (stacking)
   - Calculate final values with proper rounding
   
3. **Implement machine extraction formula**:
   - Base: 45 seconds / extraction speed
   - Apply skill check modifiers (formula TBD, placeholder for now)
   
4. **Implement Twisted comparison logic**:
   - For each Twisted speed value:
     - Green: playerWalk >= twistedSpeed
     - Yellow: playerWalk < twistedSpeed AND playerRun >= twistedSpeed
     - Red: playerRun < twistedSpeed

**Deliverables**:
- Fully functional calculation engine
- Unit-testable functions
- Proper handling of edge cases (caps, stacking, etc.)

---

### Phase 4: UI Interactivity & Data Binding
**Goal**: Connect UI to calculation engine

**Tasks**:
1. **Toon Selection Handler**
   - On change: Load base stats
   - Show/hide conditional stat radio buttons
   - Reset trinkets, team, abilities, items
   - Trigger stat recalculation
   
2. **Trinket Selection Handlers**
   - On change: Add/remove trinket from active list
   - Mark conditional trinkets that need activation
   - Trigger stat recalculation
   
3. **Team Composition Handlers**
   - On change: Update team member list
   - Rebuild team abilities checkbox section
   - Count duplicate Toons for ability stacking
   - Trigger stat recalculation
   
4. **Ability Toggle Handlers**
   - On toggle: Add/remove ability from active list
   - Trigger stat recalculation
   
5. **Item Toggle Handlers**
   - On toggle/counter change: Update active items list with counts
   - Trigger stat recalculation
   
6. **Conditional Stat Radio Handler**
   - On change: Switch active stat set
   - Trigger stat recalculation
   
7. **Skill Check Slider Handler**
   - On change: Recalculate machine extraction time
   
8. **Stats Display Update**
   - Update all stat values in real-time
   - Update percentage modifiers
   - Highlight changed values
   
9. **Twisted Table Update**
   - Recalculate all color indicators
   - Update table cells with proper colors
   - Maintain sort order
   
10. **Sort Handlers**
    - Sort by speed (descending)
    - Sort by name (alphabetical)

**Deliverables**:
- Fully interactive application
- Real-time stat updates
- Working Twisted comparison colors
- Smooth user experience

---

### Phase 5: Polish & Enhanced Features
**Goal**: Add quality-of-life features and polish

**Tasks**:
1. **URL Parameter Sharing**
   - Encode all selections into URL parameters
   - Decode URL on page load
   - Generate shareable link
   - Add "Copy Link" button with clipboard API
   
2. **LocalStorage Persistence** (Optional)
   - Save user's last configuration
   - Auto-load on return visit
   - "Clear All" button
   
3. **Visual Polish**
   - Add hover effects
   - Add transitions for value changes
   - Add tooltips for abilities/items
   - Add icons/images if available
   - Color theme matching game aesthetic
   
4. **Accessibility**
   - Proper ARIA labels
   - Keyboard navigation
   - Focus indicators
   - Screen reader support
   
5. **Performance Optimization**
   - Debounce rapid changes
   - Optimize recalculation triggers
   - Lazy load images
   
6. **Mobile Enhancements**
   - Touch gesture support
   - Optimized layout for small screens
   - Prevent zoom on input focus

**Deliverables**:
- Polished, production-ready application
- Share functionality working
- Excellent mobile experience
- Accessible to all users

---

### Phase 6: Testing & Deployment
**Goal**: Test thoroughly and deploy to hosting

**Tasks**:
1. **Manual Testing**
   - Test all Toon/Trinket/Item combinations
   - Verify calculations against known values
   - Test on multiple browsers (Chrome, Firefox, Safari, Edge)
   - Test on mobile devices (iOS, Android)
   - Test sharing functionality
   
2. **Data Validation**
   - Cross-reference all wiki data
   - Verify all Twisted speeds
   - Check ability descriptions
   - Validate formulas
   
3. **Bug Fixes**
   - Fix any calculation errors
   - Fix UI issues
   - Fix responsive layout problems
   
4. **Documentation**
   - Create README with:
     - How to update data files
     - How to add new Toons/Trinkets
     - How to host locally
     - How to deploy
   
5. **Deployment**
   - Set up GitHub repository
   - Deploy to GitHub Pages / Netlify / Vercel
   - Test live deployment
   - Share link

**Deliverables**:
- Tested and verified application
- Complete documentation
- Live hosted application
- Public URL

---

## Detailed Calculation Specifications

### Stat Calculation Flow

1. **Start with Base Stats** (from selected Toon)
   ```
   baseStats = toon.baseStats
   ```

2. **Apply Conditional Stat Set** (if selected and applicable)
   ```
   if (conditionalStatSet) {
     baseStats = merge(baseStats, conditionalStatSet.statModifiers)
   }
   ```

3. **Collect All Multiplicative Modifiers** (from trinkets, abilities, items)
   ```
   modifiers = {
     movementSpeed: [],
     stealthRating: [],
     extractionSpeed: [],
     // ... etc
   }
   
   // Add trinket modifiers
   for (trinket in equippedTrinkets) {
     for (effect in trinket.effects) {
       if (effect.applicationType === "multiplicative") {
         modifiers[effect.targetStat].push(effect.value)
       }
     }
   }
   
   // Add ability modifiers
   for (ability in activeAbilities) {
     if (ability.applicationType === "multiplicative") {
       modifiers[ability.targetStat].push(ability.value)
     }
   }
   
   // Add item modifiers
   for (item in activeItems) {
     for (i = 0; i < item.count; i++) {
       for (effect in item.effects) {
         if (effect.applicationType === "multiplicative") {
           modifiers[effect.targetStat].push(effect.value)
         }
       }
     }
   }
   ```

4. **Apply Multiplicative Modifiers**
   ```
   for (stat in baseStats) {
     finalValue = baseStat
     totalMultiplier = 1.0
     
     for (modifier in modifiers[stat]) {
       totalMultiplier *= (1 + modifier)
     }
     
     finalValue = baseStat * totalMultiplier
     
     // Check for caps (special case: Bone trinket)
     if (hasCap(stat)) {
       finalValue = Math.min(finalValue, cap)
     }
     
     // Round to 1 decimal place
     finalValue = Math.round(finalValue * 10) / 10
     
     // Calculate percentage change
     percentageChange = ((totalMultiplier - 1.0) * 100).toFixed(0)
   }
   ```

5. **Handle Walk/Run Speed Separately**
   ```
   finalWalkSpeed = baseWalkSpeed * walkSpeedMultiplier
   finalRunSpeed = baseRunSpeed * runSpeedMultiplier
   // Movement speed modifiers apply to both walk and run
   ```

### Machine Extraction Time Formula

**Basic Formula** (placeholder for now):
```
baseTime = 45 / extractionSpeed
skillCheckBonus = skillChecksSuccessful * (to be determined)
finalTime = baseTime - skillCheckBonus
```

**Will be updated** when you provide the complex formula.

### Twisted Speed Comparison Logic

For each Twisted speed value (6 total per Twisted):
```
function getTwistedSpeedColor(playerWalkSpeed, playerRunSpeed, twistedSpeed) {
  if (playerWalkSpeed >= twistedSpeed) {
    return "green"
  } else if (playerRunSpeed >= twistedSpeed) {
    return "yellow"
  } else {
    return "red"
  }
}
```

Apply this to each of the 6 speed columns:
- Normal Walk
- Normal Run
- Panic Walk
- Panic Run
- Panic+Suppression Walk
- Panic+Suppression Run

---

## URL Parameter Encoding Specification

### Format
```
?toon=poppy&t1=speedy_shoes&t2=bone&team=poppy,astro,,,,,&abilities=poppy_bubble,astro_boost&items=speed_candy:2,stealth_juice:1&cond=looey_2hearts
```

### Parameters
- `toon`: Selected Toon ID
- `t1`: Trinket slot 1 ID (or empty)
- `t2`: Trinket slot 2 ID (or empty)
- `team`: Comma-separated list of 7 team member IDs (empty string for empty slot)
- `abilities`: Comma-separated list of active ability IDs
- `items`: Comma-separated list of `itemId:count` pairs
- `cond`: Selected conditional stat set ID (if applicable)

### Encoding/Decoding
- Use `encodeURIComponent()` for all values
- On page load, check `window.location.search`
- Parse parameters and populate UI
- Trigger calculation with loaded values

---

## Mobile Responsive Breakpoints

### Desktop (> 1024px)
- Two-column layout (Equipment | Stats & Twisted Table)
- Full table for Twisted comparison
- All features visible simultaneously

### Tablet (768px - 1024px)
- Single column layout
- Stacked sections
- Full table maintained
- Slightly reduced padding

### Mobile (< 768px)
- Single column layout
- Collapsible sections (accordions)
- Twisted table converts to cards:
  ```
  ┌─────────────────────────┐
  │ Twisted Poppy           │
  │ Normal Walk:  14.0 🟢   │
  │ Normal Run:   18.0 🟢   │
  │ Panic Walk:   16.0 🟡   │
  │ Panic Run:    20.0 🟢   │
  │ P+Sup Walk:   15.0 🟡   │
  │ P+Sup Run:    19.0 🟢   │
  └─────────────────────────┘
  ```
- Larger touch targets (min 44x44px)
- Bottom-anchored action buttons

---

## Data Update Workflow

To make it easy to update data when the game patches:

1. **Adding a New Toon**:
   - Open `data/toons.json`
   - Copy an existing Toon object
   - Update all fields with new Toon data
   - Save file, refresh page

2. **Adding a New Trinket**:
   - Open `data/trinkets.json`
   - Copy an existing Trinket object
   - Update fields
   - Save file, refresh page

3. **Updating Twisted Speeds**:
   - Open `data/twisteds.json`
   - Find the Twisted by ID
   - Update speed values
   - Save file, refresh page

4. **Adding a New Item**:
   - Open `data/items.json`
   - Copy an existing Item object
   - Update fields
   - Save file, refresh page

No code changes required for data updates!

---

## Future Enhancement Ideas

### Short-term
- Export/import builds as JSON file
- Favorite/save multiple builds
- Build comparison mode (side-by-side)
- Search/filter for Toons, Trinkets, Items

### Medium-term
- Dark mode toggle
- Custom color themes
- Build ratings/voting system (if community-hosted)
- Calculate "optimal" builds for specific goals
- Show stat breakpoints (e.g., "Need 18.5 speed to outrun all Twisteds in Normal mode")

### Long-term
- Integration with game data API (if available)
- Automatic data updates from wiki
- Community build sharing platform
- Mobile app wrapper (PWA or native)
- Tier lists and meta analysis
- Video/screenshot generation of builds

---

## Technical Notes

### Browser Compatibility
- Minimum: ES6 support (Chrome 51+, Firefox 54+, Safari 10+, Edge 15+)
- Use vanilla JS only (no transpilation needed)
- Test on: Chrome, Firefox, Safari, Edge
- Mobile: iOS Safari 10+, Chrome Android 51+

### Performance Considerations
- JSON files are small (<100KB total), load quickly
- Calculations are lightweight (run in <1ms)
- Use event delegation for dynamic elements
- Debounce rapid slider changes (16ms for 60fps)
- Lazy load images if used

### Accessibility Requirements
- Semantic HTML5 elements
- ARIA labels on all interactive elements
- Keyboard navigation (Tab, Enter, Arrow keys)
- Focus indicators on all focusable elements
- Color contrast ratio 4.5:1 minimum
- Screen reader friendly descriptions
- Skip links for navigation

### Security
- No user data stored on server (static site)
- No authentication required
- No external API calls (except data loading)
- Sanitize URL parameters before use
- Content Security Policy headers

---

## Testing Checklist

### Functional Testing
- [ ] Toon selection loads correct base stats
- [ ] Trinket selection applies correct modifiers
- [ ] Team member selection populates abilities
- [ ] Ability toggles affect stats correctly
- [ ] Item counters stack multiplicatively
- [ ] Conditional stat switching works
- [ ] Skill check slider updates machine time
- [ ] Twisted colors are accurate
- [ ] Sort by speed works
- [ ] Sort by name works
- [ ] Share URL generates correctly
- [ ] Share URL loads configuration correctly
- [ ] All calculations match expected values

### Cross-browser Testing
- [ ] Chrome (Windows, Mac, Android)
- [ ] Firefox (Windows, Mac)
- [ ] Safari (Mac, iOS)
- [ ] Edge (Windows)

### Device Testing
- [ ] Desktop (1920x1080, 1366x768)
- [ ] Laptop (1440x900)
- [ ] Tablet (iPad, 768x1024)
- [ ] Mobile (iPhone, 375x667)
- [ ] Mobile (Android, various sizes)

### Accessibility Testing
- [ ] Keyboard navigation only
- [ ] Screen reader (NVDA, JAWS, VoiceOver)
- [ ] Color contrast checker
- [ ] Focus indicators visible
- [ ] Alt text on images

### Performance Testing
- [ ] Initial load time < 2 seconds
- [ ] Calculation time < 50ms
- [ ] Smooth scrolling
- [ ] No layout shifts
- [ ] Lighthouse score > 90

---

## Deployment Options

### Option 1: GitHub Pages (Recommended)
**Pros**: Free, easy, version controlled, automatic HTTPS
**Steps**:
1. Create GitHub repository
2. Push all files to `main` branch
3. Go to Settings > Pages
4. Select `main` branch, root folder
5. Save, wait for deployment
6. Access at `https://username.github.io/repo-name/`

### Option 2: Netlify
**Pros**: Free tier, drag-and-drop, automatic HTTPS, form handling
**Steps**:
1. Create Netlify account
2. Drag project folder to Netlify dashboard
3. Wait for deployment
4. Access at `https://random-name.netlify.app/` (can customize)

### Option 3: Vercel
**Pros**: Free tier, fast CDN, great DX
**Steps**:
1. Create Vercel account
2. Import Git repository or drag folder
3. Deploy
4. Access at `https://project-name.vercel.app/`

### Option 4: Local Hosting
**Pros**: No internet required, full control
**Steps**:
1. Open `index.html` in browser
2. Share entire folder with others
3. They open `index.html` locally

---

## Development Timeline Estimate

Assuming 2-4 hours per day:

- **Phase 1** (Foundation & Data): 3-5 days
- **Phase 2** (UI Implementation): 4-6 days
- **Phase 3** (Calculation Engine): 2-3 days
- **Phase 4** (Interactivity): 3-4 days
- **Phase 5** (Polish): 2-3 days
- **Phase 6** (Testing & Deployment): 2-3 days

**Total: 16-24 days** (about 3-4 weeks)

Can be faster if working full-time, or if some phases are simplified.

---

## Next Steps

1. **Data Collection**: Gather all Toon, Trinket, Twisted, and Item data from wiki
2. **Star Rating Conversion**: Get the exact numerical values for each star rating per stat
3. **Machine Extraction Formula**: Receive the complete formula for extraction calculations
4. **Begin Phase 1**: Set up project structure and create JSON data files

---

## Questions for Follow-up

1. Do you have access to extract data from the wiki programmatically, or will it be manual entry?
2. Are there any other conditional mechanics besides Looey's hearts and the Bone trinket?
3. Should the app support multiple languages (internationalization)?
4. Do you want analytics tracking (e.g., Google Analytics) to see usage?
5. Should there be a "Report Incorrect Data" feature?
6. Any specific color scheme or branding guidelines to follow?

---

**End of Implementation Plan**

This plan is comprehensive and ready for implementation. The next step is to begin Phase 1 by gathering all necessary data and setting up the project structure. Once you provide the star rating conversions and machine extraction formula details, we can proceed with populating the data files and beginning development.
