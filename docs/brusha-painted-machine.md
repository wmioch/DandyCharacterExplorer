# Brusha painted-Machine preview

Feature `PREVIEW-SRC-BRUSHA-PAINTED-MACHINE` replaces the retired aura with a static painted-Machine scenario. It requires explicit release approval together with its Paint Bucket control, duplicate-buff handling, Chance display precision and regression checks. No other preview feature is a dependency.

Checked October 30, 2026 against [Brusha revision271743](https://dandys-world-robloxhorror.fandom.com/wiki/Brusha?oldid=271743) (October24) and [Paint Bucket revision272789](https://dandys-world-robloxhorror.fandom.com/wiki/Paint_Bucket?oldid=272789) (October27).

Artistic Inspiration's player checkbox and Team Abilities checkboxes mean the selected Toon is extracting from a painted Machine. They apply +25% Extraction and a relative +15% Skill Check chance once, even if several Brushas are checked. At the usual base, Chance is 25% × 1.15 = 28.75%; with Paint Bucket it is (25% + 10 percentage points) × 1.15 = 40.25%. Other teammate abilities keep their existing stacking rules. Painting no longer slows Brusha or enlarges the Skill Check window. Chance and its absolute MOD difference show up to two decimals when needed; engine precision is unchanged.

Paint Bucket retains its universal +10% Skill Check size and +10 percentage-point Chance effects. Equipping it as Brusha reveals an independent checkbox for the +25% Movement Speed snapshot in the first five seconds after successfully painting. This does not require the player to be extracting from paint. Unchecking, removing the trinket or changing Toon clears the speed snapshot; re-equipping starts unchecked. `App.state.paintBucketBoost` is temporary and survives calculation-state cloning, not page reloads.

No painting minigame, proximity, successful-paint detection, duration/cooldown timer, paint removal, Treadmill Machine behavior or Peppermint activation is simulated. Paint remains selected until the user changes the scenario. The documented 15-second ability cooldown is descriptive; cooldown statistics remain deferred. Existing authentic portraits and trinket artwork are reused.

## Manual acceptance

1. Select Brusha and check Artistic Inspiration. Extraction becomes 1.25, Chance 28.75% (MOD +3.75%) and Walk/Run stay 15/25. Machine Base Time becomes 36 seconds, without expiring after 15 seconds.
2. Add two Brusha teammates and check both painted-Machine abilities. Effects still apply once, including with the player checkbox checked. Uncheck the player and leave one teammate checked: the buff remains. Uncheck all: it disappears. Shelly's Inspiration remains an independent boost.
3. Equip Paint Bucket. Chance becomes 35% without paint and 40.25% with paint. Check the separate speed boost: Walk/Run become 18.75/31.25 whether paint extraction is checked or not. Uncheck it to return to 15/25.
4. Remove/re-equip Paint Bucket and change away from/back to Brusha. The speed snapshot starts unchecked. Other Toons retain the universal trinket effects without the Brusha-only control.

`npm run validate` covers arithmetic, player/team duplicate handling, independent Shelly boosts, persistent machine snapshots, Paint Bucket state cloning, and actual desktop/mobile Chromium controls including removal and Toon-change resets. It does not prove in-game mechanics or real iOS behavior.
