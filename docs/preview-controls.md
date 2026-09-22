# Local preview controls

The user approved this complete feature set on September 22 for release after the Waxwell portrait correction. The reusable local preview remains isolated from production feedback.

## Current preview controls (September 22)

- Reel In and Problem Solver use independent white, checkbox-sized counters. Left click increments, right click decrements; keyboard +/Up and -/Down are also supported. Zero is off, maximum 25. Changing Toon resets player ability counters. The shared completed-machine input is removed.
- Finn retains the existing 35% per-stack movement modifier. The wiki Changelog for June12,2026 (0.22.1), rechecked September22, explicitly records the increase from33% to35%; the older Multipliers value is superseded. This resolves the multiplier discrepancy, not separate star-rating questions.
- Razzle & Dazzle's existing floor choice gates Clown Horn/Ribbon Spool. For other Toons either or both gives one 10% movement modifier. There is no separate floor selector.
- Vanity Mirror leaves normal FINAL speeds unchanged and adds bracketed Panic values. Normal Twisted comparisons use normal player speeds; both Panic columns use Panic player speeds. Sorting preserves this behavior.
- Cards & Debuffs share one tab after Twisted Speed and Machine Stats. Left/right click increases/decreases debuff levels, displayed as 0/I/II/III. Symbols are typographic interface icons. Applied levels are constant snapshots; automatic expiry and simultaneous-source stacking are not simulated.
- Cards show actual faces for Tech Savvy, Well-Paced, Endurance, TIME’S UP and Suppression. Click to toggle each once. Source borders are cropped consistently, then every card receives the same complete white CSS frame. Artwork provenance is in `assets/images/cards/SOURCES.md`. Tech Savvy reduces machine work by five units. TIME’S UP adds 50 stamina after earning its floor reward. Suppression selects existing suppressed Panic speeds. See [card-scope.md](card-scope.md) for all 23 reviewed card names.
- Advanced turns green and enables in-place BASE editing. Invalid values are rejected; empty fields restore defaults. Disabling asks for confirmation: Cancel preserves mode and custom numbers; OK clears them. Changing Toon or reloading clears overrides. The first activation shows tutorial slide six, immediately before Feedback.
- Dandy and Dyle have pale red portraits, a DEV badge and developer-only descriptions. They have five stars in every stat and 99 internal health (displayed compactly as heart × 99). Sources distinguish this from the game's three visible hearts. Their passives have no invented stat effect.

## Manual review

1. Boxten, Clown Horn + Ribbon Spool: 16.5 walk / 27.5 run, not 18.2 / 30.3. Remove either: unchanged. Razzle & Dazzle: only the trinket matching his selected floor applies.
2. Boxten + only Vanity Mirror: normal run 25.0 with (32.5) Panic. Normal Twisted colors should remain unchanged; Panic columns should reflect the faster player. Sort both ways and verify again.
3. Finn/Shelly: counter starts 0; left clicks apply successive existing passive multipliers, right clicks remove them. Verify clamping at both 0 and 25 and unchanged control dimensions.
4. Poppy: Slow II gives displayed 11.3/18.8; Tired II gives 1.2/s; Confused I gives extraction 0.75; Illness III gives skill-check size 75. Right click down to zero. Ribecca disables and ignores applied debuffs while retaining trinket drawbacks.
5. Enable Advanced: first activation opens its slide, subsequent activations do not. Change Poppy's base walk to18; Dog Plush gives19.8. Click Advanced then Cancel: edited values and green mode remain. Click again then OK: defaults return. Reject fractional hearts and chance over100. Other tutorial slides remain reachable.
6. Poppy: Tech Savvy changes base machine time45→40s. Well-Paced plus Endurance gives170 stamina; TIME’S UP alone gives200 and all three stamina cards give220. Suppression changes Twisted Poppy Panic21.6 to20.7 and hides the duplicate reference column; deselect to restore the three original columns. Repeat after sorting and with Vanity Mirror. All five cards show their own artwork with complete, consistent white frames.
7. Dandy/Dyle: correct portraits, pale red background, DEV label, 20/30 speed,200 stamina,20 stealth,1.5 extraction,3 skill-check amount and250 size. Health shows99 without overflowing the table.

Validation is limited to manual source/diff inspection, JSON parsing and `git diff --check`, per repository instructions. No builds, tests, lint or automated browser checks.

The preview changes share calculation/UI plumbing with earlier preview commits. Release only explicitly approved features; isolate unapproved changes if the approved set is smaller than the complete preview.

## Developer Toon evidence and assets

Checked 2026-09-21; publication dates are not established:

- https://dandys-world-robloxhorror.fandom.com/wiki/Statistics — all-five-star spread,99 internal health with three visible hearts.
- https://dandys-world-robloxhorror.fandom.com/wiki/Health —99 hearts for both developer Toons.
- https://dandys-world-robloxhorror.fandom.com/wiki/Abilities — passive names and description.
- https://dandysworld.org/toons/dandy and https://dandysworld.org/toons/dyle — individual numeric stat tables. The three-heart summary is a display value, not the internal health value established above.
- Portraits: https://dandysworld.org/wiki/images/toons/dandy-render.webp and https://dandysworld.org/wiki/images/toons/dyle-render.webp. Downloaded unchanged and visually identified; original artwork belongs to its rights holders, including BlushCrunch Studio, and is not CC0.

## Waxwell — APP-SRC-WAXWELL-IGNITED-TRAIL

The core Toon bundle includes the sourced portrait and stats, permanent Tired II and the standard Ignite checkbox. The user controls activation manually.

- Select Waxwell:20/30 movement,100 stamina,5 stealth,0.85 extraction,3 skill-check amount,250 size,3 hearts. Unbuffed regeneration is1.2/s due to intrinsic Tired II.
- Toggle Ignite on: regeneration becomes2.4/s and intrinsic Tired II becomes0. Toggle off:1.2/s and Tired II return. Change Toon and return: Ignite starts off.
- Add teammate Waxwell to another Toon: no Team Abilities checkbox or cooldown control appears. Cooldown statistics are explicitly deferred by the user. All previous Waxwell time and cooldown controls are removed.
- Additional Tired sources remain unsupported; his debuff icon reflects the checkbox-controlled intrinsic state. Machine estimates use the same selected stat snapshot.

Sources rechecked2026-09-21: https://wikiwiki.jp/dandys-world/Waxwell and https://bloxodes.com/articles/dandys-world-waxwell-toon-guide (updated2026-08-19). Portrait updated September 23: https://media.bloxodes.com/wiki/5569032992/toons/waxwell-9b8f2561ea5d2304.webp, labelled at https://bloxodes.com/wiki/dandys-world/toons. Downloaded unchanged and visually inspected: square transparent head portrait matches the other Toon render portraits, replacing the full-body screenshot. Original artwork belongs to its rights holders; not CC0.

Twisted Waxwell is listed with neutral N/A chase values because his research description says he avoids Toons. Unverified roaming values remain null, not zero. Speed sorting places him after numeric rows; name sorting remains available. Check that his sourced portrait appears. Research description checked September 22 at https://wikiwiki.jp/dandys-world/ツイステッド, corroborated by https://bloxguidesgg.com/games/dandys-world/toons/waxwell (synced August 14). The portrait was downloaded unchanged from the labelled September 2 reference at https://bloxodes.com/wiki/dandys-world/twisteds via https://media.bloxodes.com/wiki/5569032992/twisteds/twisted-waxwell-d4de6f68c264d531.webp and visually inspected. Original game artwork belongs to its rights holders; not CC0. That guide lists roaming states, but its lit Suppression value is inconsistent; those numeric values are not implemented without verification.

Cherished Blanket is intentionally absent from visible trinkets because it affects no currently displayed stat.
