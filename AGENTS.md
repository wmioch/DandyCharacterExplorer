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

### Preview scenarios

See [preview-controls.md](docs/preview-controls.md) for the current controls and manual acceptance steps. The September 22 feature set is approved for release; the reusable local preview stays separate with production feedback disabled.

`App.state.abilityStacks` holds independent 0–25 player-passive counters. `advancedMode` enables inline BASE editors backed by validated, temporary `customStats`; confirmed disabling or changing Toon clears overrides. Cancel preserves mode and values. The tutorial has seven slides, with Advanced before Feedback and a separate first-use flag.

`debuffs` holds levels 0–3, displayed as Roman numerals in Cards & Debuffs; `cards` holds five selections. State clones preserve both and ability counters for machine estimates. Debuffs remain constant snapshots. Stamina cards add before percentage modifiers; Tech Savvy changes work45→40 units. TIME’S UP adds50 stamina after its reward is earned. Suppression selects the existing suppressed Panic comparison and hides the duplicate column.

Train Whistle is visible among trinkets. When equipped, it blocks only the applied Slow debuff in Cards & Debuffs. Other debuffs and trinket drawbacks still apply; the selected Slow scenario takes effect again if the trinket is removed.

On touch screens, a long press on a Toon selects a teammate through the context menu event. The grid suppresses the compatibility click that some browsers send after that gesture, so the player Toon is not replaced. A new deliberate tap can still select the player Toon.

Movement speeds in the player stat table and bracketed Vanity Mirror Panic values show a second decimal only when needed; for example, 17.5 with Dog Plush appears as 19.25 while 15 remains 15.0. The calculation precision is unchanged.
Lucky Coin's selected Skill Check roll applies +12% window size and +12 percentage points Skill Check chance (25% to 37% at the usual base). The manual selector represents the observed floor roll; the app does not roll a random result itself.

Razzle & Dazzle uses its own conditional floor selector. Other Toons receive one floor-trinket bonus even with both equipped. Normal and Panic results are calculated separately for Vanity Mirror; Panic comparison columns receive the Panic result, including after sorting.

Toons may specify `image_name` and `developerOnly`. Dandy/Dyle use pale red portraits with DEV labels and compact99-health display. Custom health edits support1–99 integer hearts.

- The frontend feedback button is always present, but submission stays unconfigured until `js/feedback-config.js` contains the deployed Azure Function URL.
- Dandy-specific context stays embedded inside `feedback.message`; `ecg_case` remains `null`.
- The live site still runs as a static GitHub Pages site; only the feedback backend deploys through GitHub Actions.

### Waxwell preview controls

Ignite uses the standard player ability checkbox and saved-state mechanism. Off applies intrinsic Tired II; on removes it. Changing Toon resets it. No Waxwell timers or teammate cooldown controls remain; cooldown statistics are deferred. Additional Tired sources remain unsupported.

Twisteds may specify `noChase: true` with null speeds and no image. The table displays neutral N/A and the existing letter placeholder, without treating null as comparable speed. Twisted Waxwell uses non-chasing N/A values with a sourced portrait; numeric roaming states await verification. Cherished Blanket is intentionally not visible.
