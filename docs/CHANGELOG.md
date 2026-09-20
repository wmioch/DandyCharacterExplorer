# Changelog

## 2026-09-21 — stationary Twisted display

- Twisted Blot, Razzle & Dazzle, and Rodger now show neutral N/A chase-speed cells with a stationary tooltip, instead of green 0.0 comparisons. Numeric storage and sorting are unchanged; both initial rendering and subsequent updates use the label.
- Source: [Movement Speed](https://dandys-world-robloxhorror.fandom.com/wiki/Movement_Speed), checked September 21, 2026, identifies these Twisteds as stationary.
- Validation: manual review of both rendering paths and `git diff --check`. No builds, tests, lint or browser checks. Manual check: switch Toons and sort the table; stationary rows should remain neutral N/A while moving rows keep numeric comparisons.

## 2026-09-21 — Toon descriptions

- Corrected Blot to an ink blob, Coal to a dog-like rock, and Cocoa to a chocolate bunny. Stats and abilities are unchanged.
- Sources: [Blot](https://dandys-world-robloxhorror.fandom.com/wiki/Blot), [Coal](https://dandys-world-robloxhorror.fandom.com/wiki/Coal), and [Cocoa](https://dandys-world-robloxhorror.fandom.com/wiki/Cocoa), checked September 21, 2026.
- Validation: JSON parsing, manual diff review and `git diff --check`; no builds, tests, lint or app-browser checks.

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
