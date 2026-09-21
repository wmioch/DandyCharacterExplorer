## 2026-09-21 — Waxwell core bundle (local preview only)

- Added Waxwell's portrait and verified base stats, intrinsic Tired II and10-second Ignite fatigue removal with a60-second base cooldown scenario.
- Added non-stacking5-second teammate Ignited recovery calculation with caster exclusion. Manual elapsed controls show expiration and cooldown progress; no unsupported repeated-contact or modifier-order assumptions.
- Related Twisted speeds and Cherished Blanket remain separate evidence investigations. Manual checks and source/asset details are in [preview controls](preview-controls.md).
- ChangedJSON parsed; diff reviewed and whitespace checks passed. No tests, builds, lint, browser checks or publication.

## 2026-09-21 — requested preview revisions and developer Toons (unreleased)

- Replaced the shared machine-stack input with independent0–25 Reel In/Problem Solver counters. Removed standalone floor and Panic selectors; implemented Razzle & Dazzle conditional floor logic, a single combined floor-trinket bonus for other Toons, bracketed Vanity Mirror Panic speeds and appropriate Twisted comparisons.
- Moved debuffs and cards into tabs with clickable controls; card faces use sourced artwork. Added green-enabled Advanced mode for inline BASE editing and a one-time tutorial explanation before Feedback.
- Added Dandy and Dyle with developer-only pale red portraits, sourced stats and99 internal health. See [preview controls and evidence](preview-controls.md) for manual checks, scope and limitations.
- Validation: source/diff review, changedJSON parsing and `git diff --check`. No tests, builds, lint or app-browser checks; no publication.

# Changelog

## 2026-09-21 — stationary Twisted display

- Twisted Blot, Razzle & Dazzle, and Rodger now show neutral N/A chase-speed cells with a stationary tooltip, instead of green 0.0 comparisons. Numeric storage and sorting are unchanged; both initial rendering and subsequent updates use the label.
- Source: [Movement Speed](https://dandys-world-robloxhorror.fandom.com/wiki/Movement_Speed), checked September 21, 2026, identifies these Twisteds as stationary.
- Validation: manual review of both rendering paths and `git diff --check`. No builds, tests, lint or browser checks. Manual check: switch Toons and sort the table; stationary rows should remain neutral N/A while moving rows keep numeric comparisons.

## 2026-09-21 — Toon descriptions

- Corrected Blot to an ink blob, Coal to a dog-like rock, and Cocoa to a chocolate bunny. Stats and abilities are unchanged.
- Sources: [Blot](https://dandys-world-robloxhorror.fandom.com/wiki/Blot), [Coal](https://dandys-world-robloxhorror.fandom.com/wiki/Coal), and [Cocoa](https://dandys-world-robloxhorror.fandom.com/wiki/Cocoa), checked September 21, 2026.
- Validation: JSON parsing, manual diff review and `git diff --check`; no builds, tests, lint or app-browser checks.
## 2026-09-20 — requested gameplay cards (local preview)

- Added Tech Savvy, Well-Paced and Endurance controls. Tech Savvy reduces the machine work target from 45 to 40 units before existing progress reductions. Each stamina card adds 10 capacity before percentage modifiers; each can be selected once.
- [Cards source](https://dandys-world-robloxhorror.fandom.com/wiki/Cards), indexed content checked September 20: Tech Savvy removes five units, despite the displayed five-second wording. Broader voting and other card effects are separate unfinished work.
- Manual acceptance: unmodified Poppy with Tech Savvy has base machine time 40s instead of45s; with custom extraction2 it is20s instead of22.5s. Both stamina cards give170 maximum stamina before other modifiers. Turning cards off restores defaults.
- Validation: manual diff review and `git diff --check`; no tests, build, lint or browser checks. Local preview only.

## 2026-09-20 — custom base stats (local preview)

- Added temporary custom base-stat inputs in Machine Stats with Apply and Reset controls. Blank values keep normal stats; changing Toon or refreshing clears overrides. Stored Toon records are never mutated.
- Overrides apply after conditional/ability base replacements and before trinket/item increases and modifiers. Skill Check Size and Stamina Regeneration have separate overrides. Custom values are labelled in the stat table and carried into machine estimates.
- Manual acceptance: select Poppy, set Walk Speed to 18, Apply, and check Base/Final 18 with no movement buffs. Equip Dog Plush: final walk becomes 19.8. Set extraction to 2: a default 45-unit machine's base time is 22.5 seconds with no extraction buffs. Reset or change Toon: normal values return. Invalid negative stamina, fractional hearts, or chance above 100 must prevent Apply.
- Validation: diff review and `git diff --check` only. No builds, tests, lint or browser checks; awaiting user testing/release.

## 2026-09-20 — applied debuff scenarios (local preview)

- Added None/I/II/III selectors for Slow, Confused, Tired and Illness. Their reductions multiply existing stat modifiers; state-based machine estimates retain the selected snapshot throughout the calculation. Triggers and expiry are not simulated.
- Ribecca's applied-debuff immunity disables these controls and ignores their effects; trinket penalties remain active.
- Sources: [status effect tables](https://dandys-world-robloxhorror.fandom.com/wiki/Status_Effects), [Ribecca](https://dandys-world-robloxhorror.fandom.com/wiki/Ribecca), indexed wiki content checked September 20, 2026.
- Manual acceptance: unmodified Poppy with Slow II has walk/run 11.25/18.75 (displayed 11.3/18.8); Confused I extraction is 0.75; Tired II regeneration is 1.2/s; Illness III skill size is 75. Clear statuses to restore defaults. Ribecca ignores them; changing back restores selections. Buff/debuff combinations multiply (a 10% movement buff with Slow II gives 0.825 times base movement).
- Validation: manual diff review and `git diff --check`; no automated tests, builds, lint or browser checks. Not released.

## 2026-09-20 — floor and Panic Mode scenarios (local preview)

- Added odd/even-floor and Panic Mode controls in Machine Stats. Clown Horn and Ribbon Spool apply on their respective floors; Vanity Mirror applies only during Panic Mode.
- Razzle & Dazzle's existing floor radios and the new selector stay synchronized. Other conditional Toon states are unchanged.
- Sources checked September 20: [Clown Horn](https://dandys-world-robloxhorror.fandom.com/wiki/Clown_Horn), [Ribbon Spool](https://dandys-world-robloxhorror.fandom.com/wiki/Ribbon_Spool), [Vanity Mirror](https://dandys-world-robloxhorror.fandom.com/wiki/Vanity_Mirror). Indexed wiki descriptions agree with the stored values; this change implements their conditions.
- Manual acceptance: with Boxten and only Clown Horn/Ribbon Spool equipped, either floor gives 16.5 walk / 27.5 run (one 10% boost, never two). With only Vanity Mirror, Panic Mode off gives 15/25; on gives 15/32.5. Switching Razzle & Dazzle's floor by either control must update both controls and calculated stats.
- Validation: manual diff review and `git diff --check`; no build, tests, lint or browser checks. Not released to production.

## 2026-09-20 — Rudie ability timing text

- Added Antler Charge’s omitted 0.4-second duration and 23-second cooldown to Rudie’s description. The existing dash calculation and active-state toggle are unchanged.
- Sources: [Rudie](https://dandysworld.org/toons/rudie), [ability reference](https://dandys-world-robloxhorror.fandom.com/wiki/Abilities), and [multiplier durations](https://dandys-world-robloxhorror.fandom.com/wiki/Multipliers), checked September 20, 2026.
- Validation: JSON parsing, manual diff review and `git diff --check`; no builds, tests, lint or app-browser checks.

## 2026-09-20 — Bandage price

- Corrected Bandage’s normal shop price from 25 to 60 Tapes. Its healing effect is unchanged.
- Sources: [wiki item price table](https://dandys-world-robloxhorror.fandom.com/wiki/Items) and [health reference](https://dandysworld.org/mechanics/health), checked September 20, 2026; both specify 60 Tapes before discounts.
- Validation: parsed the changed JSON, reviewed the diff and ran `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-20 — Yatta text encoding

- Corrected the corrupted spelling of piñata in Yatta’s description and Piñata Party ability name. No stat or calculation changes.
- Source: [Yatta reference](https://dandys-world-robloxhorror.fandom.com/wiki/Yatta), checked September 20, 2026.
- Validation: JSON parsing, manual diff review and `git diff --check`; no builds, tests, lint or app-browser checks.

## 2026-09-19 — Gigi release descriptions

- Updated Gigi's Surprise! description with the improved rare-item odds and Lucky Coin's exclusion of common items.
- Updated Lucky Coin's effect description with its Gigi interaction and clarified its existing per-floor reroll.
- Corrected Fishing Rod's stored description to the machine-highlighting rework announced in the official 0.22.1 changelog on June 13, 2026 (Australia/Sydney). Its existing hidden status is preserved.

Source: [official 0.28.1 changelog](https://discord.com/channels/969934252844138496/969959279626960926/1550582380631429211), posted September 19, 2026 at 05:00 Australia/Sydney and read that day. The release does not specify exact item probabilities or a cooldown change; the existing cooldown remains unchanged. These are description updates only. Item-generation simulation and Twisted Gigi's new stash/inventory behavior remain outside the current calculator.

Fishing Rod source: [official changelog channel](https://discord.com/channels/969934252844138496/969959279626960926), 0.22.1 entry, read September 19. The community page still carried the old starting-item effect; the explicit developer rework takes precedence.

Validation: parsed both changed JSON files, reviewed the diff and ran `git diff --check`. No build, tests, lint or app-browser checks were run.

## 2026-09-18 — routine data corrections

- Corrected Boxten's Wind-Up description to match the existing compounded calculation: `1.06` per alive Toon, approximately `59.4%` more Extraction Speed with eight Toons. No calculation change.
- Clarified that Ichor is currency; the Research Capsule pickup grants research progress.
- Corrected Twisted Finn's normal chase speed from `15.5` to `16`.
- Updated Panic and Suppression walk/run values for 31 reviewed standard Twisted records using normal speed multiplied by `1.20` and `1.15`. Products retain their numeric precision; the existing UI still rounds for display.

Updated records: Astro, Bassie, Bobette, Boxten, Brightney, Brusha, Coal (normal and Blackout), Cocoa, Cosmo, Dandy, Eclipse, Eggson, Finn, Flutter, Flyte, Gigi, Goob, Looey, Poppy, Ribecca, Rudie, Scraps, Shelly, Shrimpo, Sprout, Teagan, Tisha, Toodles, Vee and Yatta.

Connie, Ginger, Glisten, Gourdy, Soulvester and Dyle retain their previous values pending resolution of base-speed or state-specific evidence. Pebble already has the supported multipliers. Stationary records are unchanged. These pending cases must not be treated as newly verified by this correction.

Sources rechecked September 18, 2026:

- [Panic Mode](https://dandys-world-robloxhorror.fandom.com/wiki/Panic_Mode) and [Movement Speed](https://dandysworld.org/mechanics/movement-speed): corroborate the standard 20% / 15% modifiers.
- [Twisted Finn](https://dandys-world-robloxhorror.fandom.com/wiki/Twisted_Finn) and [Twisted Looey](https://dandys-world-robloxhorror.fandom.com/wiki/Twisted_Looey): corroborate the affected chase and derived speeds.
- [Ichor](https://dandys-world-robloxhorror.fandom.com/wiki/Ichor): distinguishes currency from Research Capsule rewards.

Fandom evidence was available through indexed page text; direct page access was blocked. The exact developer-announced date of the Panic modifier change remains unverified. No new mechanics, assets or feedback-backend changes are included.

Validation: JSON parsing and Git whitespace checks only, in accordance with repository instructions.
## 2026-09-22 — Local preview corrections (unreleased)

- Merge Cards & Debuffs, display debuffs as I/II/III, and confirm before Advanced mode clears custom values.
- Add TIME’S UP and selectable Suppression; crop all five card faces without white borders.
- Replace Waxwell timeline and cooldown scenarios with the standard Ignite checkbox; no teammate cooldown control.
- Add non-chasing Twisted Waxwell with neutral N/A values. His portrait remains unavailable; the existing letter placeholder is used.
- Keep Cherished Blanket out of visible trinkets and ability cooldown statistics deferred.
- Confirm Finn's existing35% modifier against the June12,2026 (0.22.1) wiki change history; remove the outdated preview multiplier warning. No numeric change.
- Validation: manual source/diff review, JSON parsing and git diff --check only. User browser testing remains pending.
