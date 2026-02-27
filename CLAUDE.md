# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

This is a static site that requires a local web server due to CORS restrictions — **never open `index.html` directly via `file://`**.

```bash
python -m http.server 8000
# Then open http://localhost:8000
```

Alternatively, `start_server.bat` handles server lifecycle (kills existing, auto-detects http-server / live-server / python).

**Do NOT run `start index.html` or any command that opens a browser.** No build step, no tests, no linting — changes are visible immediately on page refresh.

## Architecture

Pure HTML/CSS/Vanilla JS — no frameworks, no bundler, no npm dependencies.

### JS Modules (loaded as globals via `<script>` tags)

| File | Role |
|------|------|
| `js/data-loader.js` | `DataLoader` — fetches all JSON data at startup via `Promise.all`, exposes typed accessors |
| `js/calculator.js` | `Calculator` — pure stat calculation engine; applies base stats → conditional overrides → multiplicative/additive modifiers → final values |
| `js/ui.js` | `UI` — DOM manipulation; renders toon grid, trinket list, stat displays, Twisted speed table |
| `js/app.js` | `App` — central controller; owns all state, wires DOM events to Calculator + UI updates |

### Data Flow

```
App.init()
  → DataLoader.loadAllData()   (fetches 5 JSON files)
  → App.populateUI()           (calls UI.populate* functions)
  → user interaction
  → App.handleToonChange() etc.
      → Calculator.calculateFinalStats(toon, trinkets, teamAbilities, items, conditionalStat, teamSize)
      → UI.updateStatDisplay(finalStats)
```

### Stat Calculation Order (in `calculator.js`)

1. Start with `toon.baseStats`
2. Apply conditional stat set overrides (e.g., Looey's hearts, Razzle & Dazzle floors)
3. Apply base stat overrides from player abilities (Flutter, Rudie, Eclipse)
4. Apply `baseStatIncrease` effects from trinkets/items (e.g., +50 stamina flat)
5. Collect multiplicative and additive modifiers from: player abilities → conditional modifier overrides → trinket effects → team abilities → item effects
6. Apply Bone trinket with special 40-unit stealth cap logic
7. Apply all modifiers and compute final display stats

### Data Files (`data/`)

- `toons.json` — character definitions: `baseStats`, `starRatings`, `ability`, `ability2`, optional `conditionalStats`
- `trinkets.json` — each trinket has `effects[]` with `applicationType`: `multiplicative | additive | baseStatIncrease`. `hidden: true` trinkets are excluded from the visible list.
- `items.json` — consumable items with stackable counts
- `twisteds.json` — enemy speed data for the comparison table
- `stat-mappings.json` — maps star ratings (1–5) to numeric stat values

### Key App State (`App.state`)

- `selectedToon` — current player toon object
- `equippedTrinkets` — array of `{trinket, count}` for stackable trinkets
- `teamMembers[7]` — team slots (null = empty)
- `teamToons` — map of toonId → count for team selection UI
- `activeAbilities` / `activeItems` — toggled buffs
- `currentStarFilters` — per-stat star rating filter active in the toon grid modal
- `skillCheckSuccessRate` — slider value (0–1) for machine extraction time calculation
