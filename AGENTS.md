# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Character Explorer Videos

For video creation or revision, read [docs/video-style-guide.md](docs/video-style-guide.md) before production. It records the user's approved website walkthrough style and links the reference video, renderer and visual examples. Keep the actual website as the main visual, demonstrate real controls and results, and use narration/captions/highlights to support the walkthrough. Save production artifacts outside the application repository by default. Video creation does not authorize uploading or scheduling.

## Running the App

This is a static site that requires a local web server due to CORS restrictions — **never open `index.html` directly via `file://`**.

```bash
python -m http.server 8000
# Then open http://localhost:8000
```

Alternatively, `start_server.bat` handles server lifecycle (kills existing, auto-detects http-server / live-server / python).

**Do NOT run `start index.html` or any command that opens a browser.** No build step, no tests, no linting — changes are visible immediately on page refresh.

## Architecture

Pure HTML/CSS/Vanilla JS for the frontend. The feedback backend lives in `api/` as a small Node.js Azure Functions app.

### JS Modules (loaded as globals via `<script>` tags)

| File | Role |
|------|------|
| `js/data-loader.js` | `DataLoader` — fetches all JSON data at startup via `Promise.all`, exposes typed accessors |
| `js/calculator.js` | `Calculator` — pure stat calculation engine; applies base stats → conditional overrides → multiplicative/additive modifiers → final values |
| `js/ui.js` | `UI` — DOM manipulation; renders toon grid, trinket list, stat displays, Twisted speed table |
| `js/app.js` | `App` — central controller; owns all state, wires DOM events to Calculator + UI updates |
| `js/feedback-config.js` | static feedback deployment config; holds the Azure Function `POST /api/feedback` URL and frontend app version |
| `js/feedback.js` | `Feedback` — modal controller; builds PollingStation-compatible feedback payloads and posts them to the backend |

### Backend (`api/`)

- Azure Functions Node v4 app
- Entry point: `api/src/index.js`
- Endpoints:
  - `POST /api/feedback`
  - `GET /api/feedback`
  - `GET /api/healthz`
- Uses Azure Table Storage via `AzureWebJobsStorage`
- Install backend deps with `npm ci` inside `api/`

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

### Feedback Notes

### Floor scenario

`App.state.cards` tracks Tech Savvy, Well-Paced and Endurance selections. Stamina cards add capacity before percentage modifiers; Tech Savvy changes the cascading machine work target to40 rather than45 units. State clones preserve card selections. This is selected-card modeling, not voting simulation.

`App.state.customStats` holds temporary numeric base overrides, applied after conditional/ability base replacements and before buffs. The selected data record is not mutated. Apply validates all entered values; blank fields use normal values; Reset, Toon changes and reload clear overrides. Calculator independently validates allowed keys/ranges. Machine-state cloning preserves overrides. `statsResult.customOverrides` supports honest display labels, including separate Skill Check Size and Stamina Regeneration values.

`App.state.debuffs` stores selected Slow, Confused, Tired and Illness levels (0–3). Calculator applies one multiplicative reduction per selected status; applied-debuff immunity skips these, not trinket penalties. Machine snapshots preserve selections and assume constant duration. Source triggers and expiry are not inferred.

`App.state.floorParity` (default `odd`) and `panicMode` (default `false`) are controlled in Machine Stats. The floor selector and Razzle & Dazzle's conditional-stat radios synchronize in both directions. `Calculator.calculateFinalStats` accepts an optional final scenario argument and gates Clown Horn, Ribbon Spool and Vanity Mirror before applying modifiers. State-based machine calculations preserve the same scenario. Callers without a scenario retain their existing snapshot behavior.

- The frontend feedback button is always present, but submission stays unconfigured until `js/feedback-config.js` contains the deployed Azure Function URL.
- Dandy-specific context stays embedded inside `feedback.message`; `ecg_case` remains `null`.
- The live site still runs as a static GitHub Pages site; only the feedback backend deploys through GitHub Actions.
