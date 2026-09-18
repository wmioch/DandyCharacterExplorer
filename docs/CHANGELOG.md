# Changelog

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
