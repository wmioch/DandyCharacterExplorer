# Local preview controls

These features remain on `codex/local-preview` until explicitly approved for release.

## September 21 revisions

- Reel In and Problem Solver use independent white, checkbox-sized counters. Left click increments, right click decrements; keyboard +/Up and -/Down are also supported. Zero is off, maximum 25. Changing Toon resets player ability counters. The shared completed-machine input is removed.
- Razzle & Dazzle's existing floor choice gates Clown Horn/Ribbon Spool. For other Toons either or both gives one 10% movement modifier. There is no separate floor selector.
- Vanity Mirror leaves normal FINAL speeds unchanged and adds bracketed Panic values. Normal Twisted comparisons use normal player speeds; both Panic columns use Panic player speeds. Sorting preserves this behavior.
- Debuffs has its own tab after Twisted Speed and Machine Stats. Left/right click increases/decreases the selected level, 0–3. Symbols are typographic interface icons, not copied game debuff artwork. Applied levels are constant scenario snapshots; automatic expiry and simultaneous-source stacking are not simulated.
- Cards has its own tab with actual card faces for Tech Savvy, Well-Paced and Endurance. Click to toggle each once. Artwork provenance is in `assets/images/cards/SOURCES.md`. The older Tech Savvy card image says seconds; calculation correctly reduces work by five units. Other cards remain separate work.
- The footer Advanced button turns green when enabled and makes the player table's BASE values editable. Values commit on change/blur; invalid values are rejected. Emptying a field restores its normal value. Turning Advanced off, changing Toon or reloading clears overrides. The one-time Advanced explanation uses a separate local-storage flag and is also slide six in the seven-slide tutorial, immediately before Feedback.
- Dandy and Dyle have pale red portraits, a DEV badge and developer-only descriptions. They have five stars in every stat and 99 internal health (displayed compactly as heart × 99). Sources distinguish this from the game's three visible hearts. Their passives have no invented stat effect.

## Manual review

1. Boxten, Clown Horn + Ribbon Spool: 16.5 walk / 27.5 run, not 18.2 / 30.3. Remove either: unchanged. Razzle & Dazzle: only the trinket matching his selected floor applies.
2. Boxten + only Vanity Mirror: normal run 25.0 with (32.5) Panic. Normal Twisted colors should remain unchanged; Panic columns should reflect the faster player. Sort both ways and verify again.
3. Finn/Shelly: counter starts 0; left clicks apply successive existing passive multipliers, right clicks remove them. Verify clamping at both 0 and 25 and unchanged control dimensions.
4. Poppy: Slow II gives displayed 11.3/18.8; Tired II gives 1.2/s; Confused I gives extraction 0.75; Illness III gives skill-check size 75. Right click down to zero. Ribecca disables and ignores applied debuffs while retaining trinket drawbacks.
5. Enable Advanced: first activation opens its slide, subsequent activations do not. Change Poppy's base walk to18; Dog Plush gives19.8. Clear the field or disable Advanced to restore defaults. Reject fractional hearts and chance over100. Other tutorial slides, including Feedback, remain reachable.
6. Poppy: Tech Savvy changes base machine time45→40s. Both stamina cards give170 stamina. Deselect to restore defaults; all three show their own card face.
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

The core Toon bundle includes the sourced portrait and stats, permanent Tired II, a manual elapsed-time Ignite scenario, and a teammate trail cooldown calculator. These are scenario controls, not a running game or automatic clock.

- Select Waxwell:20/30 movement,100 stamina,5 stealth,0.85 extraction,3 skill-check amount,250 size,3 hearts. Unbuffed regeneration is1.2/s due to intrinsic Tired II.
- Use Ignite: at0–9 seconds regeneration is2.4/s; at10 seconds it returns to1.2/s. Base cooldown is60 minus elapsed seconds. Use is disabled until60 seconds; Reset restarts the scenario. The caster never receives trail cooldown acceleration.
- Select a different Toon and add Waxwell to the team. Enter60 seconds remaining cooldown at contact. At5 seconds the calculator shows50 seconds remaining, versus55 without Ignited; at6 seconds it shows49 versus54. Adding another Waxwell does not multiply this effect. Removing all teammate Waxwells hides the contact scenario.
- Cooldown input means the actual remaining cooldown after other modifiers, avoiding assumptions about modifier order. Only a single contact is represented; repeated-contact refresh and another Waxwell as recipient are not simulated. Additional Tired sources are disabled for Waxwell pending evidence. His Debuffs icon instead shows the intrinsic state.
- Machine estimates retain the selected stat snapshot; the elapsed-time slider does not turn machine estimates into a full event timeline. His intrinsic regeneration does not itself change extraction.

Sources rechecked2026-09-21: https://wikiwiki.jp/dandys-world/Waxwell and https://bloxodes.com/articles/dandys-world-waxwell-toon-guide (updated2026-08-19). Portrait: https://mudae.net/uploads/5471456/JWtfiov~P2Mrj8TIf.png, matched visually to the in-game license screenshot linked by the latter guide. Original artwork belongs to its rights holders; not CC0.

Related Twisted Waxwell exact movement data and Cherished Blanket effects/assets remain unresolved and are not included. Do not describe those related records as implemented.
