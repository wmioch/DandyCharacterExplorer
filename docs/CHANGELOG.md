# Changelog

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
