## 2026-10-02 - Trinket description cleanup

- Removed literal wiki italic delimiters from Brick's native tooltip; the effect is displayed as plain text, and its speed modifiers are unchanged. [Brick revision 262948](https://dandys-world-robloxhorror.fandom.com/wiki/Brick?oldid=262948) (September 20), checked October 2, states the same effect and flavor text without those delimiters.
- Narrowed Bone Needle and Thread's description to the Halloween Event, matching the strategy in [revision 265285](https://dandys-world-robloxhorror.fandom.com/wiki/Bone_Needle_and_Thread?oldid=265285) (October 1) and the [current guide](https://dandysworld.org/trinkets/bone-needle-and-thread), checked October 2. It remains hidden and has no highlighting simulation; this does not claim the announced 2026 event has shipped.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-10-02 - Squirm ability description

- Clarified that Distressed Delicacy's extraction boost follows a wind-up. [Squirm revision 264717](https://dandys-world-robloxhorror.fandom.com/wiki/Squirm?oldid=264717) (September 28) and the [Squirm guide](https://www.dandysworld.org/toons/squirm), checked October 2, both describe that sequence. The wind-up duration is not established by these sources; the existing ability checkbox and Machine estimate continue to represent the active boost, without a pre-activation timing or slowdown scenario.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-10-02 - Gourdy random-boost description

- Included Trick or Treat's Stealth exclusion and 50% Skill Check chance exception from the tooltip in [Gourdy revision 264712](https://dandys-world-robloxhorror.fandom.com/wiki/Gourdy?oldid=264712) (September 28), checked October 2. The [Gourdy guide's trivia](https://dandysworld.org/toons/gourdy) also confirms the Stealth exclusion. This remains a description of the ability; no random outcomes, probabilities or chance arithmetic are simulated.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-10-02 - Ginger healing description

- Added the wind-up to Baked with Care!'s displayed description. [Ginger revision 263142](https://dandys-world-robloxhorror.fandom.com/wiki/Ginger?oldid=263142) (September 20) and the [current Ginger guide's strategy](https://dandysworld.org/toons/ginger), checked October 2, both describe the wind-up before the Tapes-based full heal. The current page does not quantify the duration, so the text does not add a number or a healing simulation.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-10-02 - Gumballs description

- Removed unsupported advice to consume all three Gumballs uses at once. [Items revision 264825](https://dandys-world-robloxhorror.fandom.com/wiki/Items?oldid=264825) (September 28) and the [independent item guide](https://www.dandysworld.org/items), checked October 2, support a random 10% stat boost for five seconds and three uses. Gumballs remains hidden from production controls; its separate preview outcome selector still awaits release approval.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-28 - Water Cooler legacy stamina effect

- Matched hidden Water Cooler's +50 Stamina calculation stage to current Cooler. [Cooler revision 256903](https://dandys-world-robloxhorror.fandom.com/wiki/Cooler?oldid=256903) (August 16), checked September 28, says the former Water Cooler changed only its name and appearance, not its effect. The legacy entry remains hidden; its description and movement penalty are unchanged.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-28 - Health Kit description

- Restored the missing word “Health” in hidden Health Kit’s description, matching the [current Items revision 264293](https://dandys-world-robloxhorror.fandom.com/wiki/Items?oldid=264293) (September 26) and [independent item guide](https://www.dandysworld.org/items), checked September 28. The explorer does not model current health or a healing action, so the item remains hidden and no calculation changed.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-28 - Pop Pack category metadata

- Classified hidden Pop Pack as a Stamina trinket in both stored category fields, matching [Pop Pack revision 260938](https://dandys-world-robloxhorror.fandom.com/wiki/Pop_Pack?oldid=260938) (September 7), checked September 28. Its floor-entry Pop grant remains hidden and unsimulated; no player control or calculation changed.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-28 - Razzle & Dazzle extraction rating

- Corrected the stored extraction baseline from an impossible 1.6/six-star value to the sourced even-floor peak 1.5/five stars. Odd-floor 0.75/one star and even-floor 1.5/five stars remain in the existing conditional fields. The grid's maximum-star count now includes this Toon in a valid one-to-five bucket; the selected floor still controls the player stat display. [Razzle & Dazzle revision 260329](https://dandys-world-robloxhorror.fandom.com/wiki/Razzle_%26_Dazzle?oldid=260329) (September 4), checked September 28, states both floor ratings.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-28 - Gigi Surprise! item-pool wording

- Clarified that event-exclusive Items and BonBons cannot appear in Gigi's Surprise! roll, as the current [Gigi revision 264220](https://dandys-world-robloxhorror.fandom.com/wiki/Gigi?oldid=264220) (September 26) states. This is descriptive only; the explorer does not roll or simulate generated Items.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-28 - Party Popper machine-buff trigger wording

- Added applying a Machine buff to hidden Party Popper's trigger description. [Party Popper revision 260718](https://dandys-world-robloxhorror.fandom.com/wiki/Party_Popper?oldid=260718) (September 6) and the [August 14 v0.26.1 changelog, revision 264154](https://dandys-world-robloxhorror.fandom.com/wiki/Changelog/2026?oldid=264154), checked September 28, explicitly include this trigger. Its five-second nearby highlighting effect and hidden status are unchanged; no highlighting or machine-buff simulation was added.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-28 - Basket pickup bonus wording

- Clarified Basket pickups as normally 5, or 10 during the Easter Event's active 2x Baskets bonus. [Baskets revision 264159](https://dandys-world-robloxhorror.fandom.com/wiki/Baskets?oldid=264159) (September 25), checked September 28, documents 5 per pickup, two pickups per Floor and the 2x bonus, currently inactive. The description does not infer an active event or bonus from the calendar. Basket remains hidden from player stat controls; no currency-counter mechanic was added.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-28 - Waxwell Ignite recipient description

- Clarified that Ignite's trail does not affect any Waxwell, replacing the narrower caster-only wording. [Waxwell revision 263511](https://dandys-world-robloxhorror.fandom.com/wiki/Waxwell?oldid=263511) (September 23), checked September 28 during the September 27 maintenance cycle, explicitly excludes all Waxwells. The existing player checkbox and intrinsic Tired II behavior are unchanged; no teammate cooldown controls or cooldown statistics were added.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-27 - Peppermint Icing exception wording

- Added the confirmed Bassie exception to hidden Peppermint Icing's description and removed the exception-free wording. [Peppermint Icing revision 256749](https://dandys-world-robloxhorror.fandom.com/wiki/Peppermint_Icing?oldid=256749) (August 16), checked September 27, explicitly says it does not work with Bassie. The +30 amount and hidden status are unchanged. Brusha's trigger interaction remains unresolved; no cooldown-trigger or current-stamina model was added.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-27 - Ginger overview matches reworked healing

- Updated Ginger's short overview to describe spending Tapes to fully heal nearby teammates, replacing the obsolete heart-sacrifice claim. The existing ability record already describes the current mechanic. [Ginger revision 263142](https://dandys-world-robloxhorror.fandom.com/wiki/Ginger?oldid=263142) (September 20) and [obsolete mechanics history, revision 262851](https://dandys-world-robloxhorror.fandom.com/wiki/Unused_Content/Game_Mechanics?oldid=262851) (September 19), checked September 27, distinguish the old ability from its rework. No stats, healing simulation or Twisted Ginger speeds changed.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-27 - Cosmo targeting description

- Added Sharing is Caring's teammate silhouette and animation highlighting to its description. [Cosmo revision 263931](https://dandys-world-robloxhorror.fandom.com/wiki/Cosmo?oldid=263931) (September 24) and the [Cosmo guide](https://www.dandysworld.org/toons/cosmo), checked September 27, agree on this secondary targeting effect. Heart transfer, cooldown, base values and star ratings are unchanged; the explorer does not simulate targeting or through-wall vision.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-27 - Gigi current cooldown description

- Corrected Surprise!'s description from 80 to 60 seconds. The [September 18 change history, revision 264154](https://dandys-world-robloxhorror.fandom.com/wiki/Changelog/2026?oldid=264154), [obsolete mechanics history, revision 262851](https://dandys-world-robloxhorror.fandom.com/wiki/Unused_Content/Game_Mechanics?oldid=262851), and [current Gigi definition, revision 264220](https://dandys-world-robloxhorror.fandom.com/wiki/Gigi?oldid=264220), checked September 27, explicitly distinguish the old 80-second ability from the 60-second v0.28.1 rework. September 25 removed the weekly event without reverting this ability. The conflicting independent guide still describes the old cooldown; its publication date is unknown. No cooldown statistic, item-generation model or ability controls were added.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-27 - Twisted Gourdy enraged profile

- Made the existing enraged speed row internally consistent: normal 18/26, Panic 21.6/31.2 and suppressed Panic 20.7/29.9. Its normal run speed remains 26. The rendered [Twisted Gourdy infobox, revision 262328](https://dandys-world-robloxhorror.fandom.com/wiki/Twisted_Gourdy?oldid=262328), the specific [Panic Mode table, revision 247683](https://dandys-world-robloxhorror.fandom.com/wiki/Panic_Mode?oldid=247683), and the [independent Panic guide](https://dandysworld.org/mechanics/panic-mode), checked September 27, agree on the complete profile. The data note distinguishes the stationary passive state from these enraged speeds; the table does not simulate the rage meter or item gifts.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. Manual check: Twisted Gourdy's run-speed row shows normal 26, Panic 31.2 and suppressed 29.9. No builds, tests, lint or app-browser checks.

## 2026-09-27 - Twisted Glisten conditional speeds

- Corrected the existing enraged profile's Panic speeds to 18/28.8 and suppressed Panic speeds to 17.25/27.6. Normal 15/24 remains unchanged. The rendered [Twisted Glisten infobox, revision 263080](https://dandys-world-robloxhorror.fandom.com/wiki/Twisted_Glisten?oldid=263080), the specific [Panic Mode table, revision 247683](https://dandys-world-robloxhorror.fandom.com/wiki/Panic_Mode?oldid=247683), and the [independent Panic guide](https://dandysworld.org/mechanics/panic-mode), checked September 27, agree on these tuples. The existing row compares the enraged profile; it does not simulate Glisten's passive 6-speed state or proximity meter.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. Manual check: inspect Twisted Glisten's run-speed row: normal 24, Panic 28.8, suppressed 27.6. No builds, tests, lint or app-browser checks.

## 2026-09-27 - Protein Bar effect grouping

- Corrected Protein Bar's internal category from extraction to stamina, consistent with its existing Stamina Regeneration effect and the local category definitions. The [Items wiki revision 264293](https://dandys-world-robloxhorror.fandom.com/wiki/Items?oldid=264293) (September 26), checked September 27, confirms the effect. Item categories currently have no interface or calculation consumer; values and behavior are unchanged.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-27 - Wrench completion description

- Made Wrench's description specify its source-supported 15-unit completion bonus, retaining first-Machine and once-per-Floor limits. The [Wrench wiki revision 263296](https://dandys-world-robloxhorror.fandom.com/wiki/Wrench?oldid=263296) (September 21) and [Wrench guide](https://www.dandysworld.org/trinkets/wrench), checked September 27, agree. The existing calculation already subtracts 15 units; no calculation changed.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-27 - Bone architecture documentation

- Corrected the architecture note to identify Bone's 40-unit cap as a movement-speed cap. The source and current stack-selection code cap Walk and Run Speed, not Stealth. No calculation or game data changed.
- Reviewed the documentation diff with `git diff --check`; no builds, tests, lint or app-browser checks.

## 2026-09-27 - Tisha puddle-clearing description

- Added Tidy Up!'s Ichor-puddle removal to its description, supported by the ability text and Toon of the Week quest in [Tisha wiki revision 262950](https://dandys-world-robloxhorror.fandom.com/wiki/Tisha?oldid=262950) (September 20), checked September 27. The older [Tisha guide](https://www.dandysworld.org/toons/tisha) omits this detail. Speed, duration and cooldown are unchanged; the explorer does not simulate puddle clearing.
- Parsed the changed JSON and reviewed the scoped diff with `git diff --check`. No builds, tests, lint or app-browser checks.

## 2026-09-27 - Eclipse manual-check setup

- Clarified that the496-capacity example requires all three stamina cards as well as Cooler and a full-team Friendship Bracelet. The two trinkets without cards give384; no calculation or game value changed.
- Reviewed the setup against the card/trinket definitions and capacity formula, then checked the documentation diff. No builds, tests, lint or app-browser checks.

## 2026-09-27 - Scraps grapple-protection description

- Added invincibility frames while grappling to Crafty Grapple's description, supported by the [Scraps wiki revision 264163](https://dandys-world-robloxhorror.fandom.com/wiki/Scraps?oldid=264163) (September 25) and [Scraps guide](https://www.dandysworld.org/toons/scraps), checked September 27. Targeting, direct line of sight and the 25-second cooldown are unchanged; the explorer does not simulate the grapple or protection.
- Manual check: select Scraps and inspect the ability description. Changed JSON parsed and diff checked; no builds, tests, lint or app-browser checks.

## 2026-09-27 — Bounded stat and scenario corrections

- Eject Button clears the currently selected Slow snapshot on an accepted use without granting continuing immunity. Machine state cloning preserves0% Great Rate.
- Eclipse uses a60% stamina-capacity modifier after flat gains; base150 becomes240. Corrected existing Twisted Soulvester and maximum Dyle Panic/Suppression values.
- Ornament and Pumpkin descriptions distinguish normal5 pickups from10 only during an active2x event bonus. No event or bonus is inferred from the calendar.
- Added the source-supported protection during Goob's pull to Hug!'s description; no pull/protection simulation is implied.
- Source/code/diff review and changed JSON parsing only; no builds, tests, lint or app-browser checks. Larger preview features are excluded from this batch.

## 2026-09-25 — Bobette Festive Aura non-stacking

- Apply Festive Aura's selected team modifiers once even when more than one Bobette teammate has the ability enabled. The existing data already marks it non-stackable; the team calculation now respects that specific behavior.
- Current sources disagree on Bobette's heart count, so no health value changes. The aura remains a manually selected snapshot without a proximity or expiry timer. Source and manual checks: [preview controls](preview-controls.md).
- Reviewed the diff and ran `git diff --check`; no build, tests, lint or automated app-browser checks.

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

## 2026-09-24 — Preserve movement-speed hundredths in the stat table

- Display a second decimal for walking, running and bracketed Panic speed when needed. A four-star 17.5 walk with Dog Plush now shows 19.25 instead of rounding to 19.3; values without hundredths retain one decimal.
- Source: [Dog Plush](https://dandys-world-robloxhorror.fandom.com/wiki/Dog_Plush), latest wiki revision August 25, 2026, confirms +10% walk speed; older feedback ID 33 identified the expected value. Reviewed the diff and ran `git diff --check`; no builds, tests, lint or automated browser checks.
- Manual check: select a Toon with 17.5 base walk and Dog Plush, then inspect FINAL Walk Speed; it should read 19.25. Remove Dog Plush and confirm 17.5. Other ordinary speeds should retain one decimal.

## 2026-09-24 — Toon grid long press on mobile

- Suppressed the follow-up synthetic click that can occur after a touch long press on a Toon grid entry. The long press still selects a teammate; a fresh tap still selects the player Toon.
- Trigger: older Dandy feedback ID 40 and the existing grid handlers, which handled `contextmenu` and `click` independently. Reviewed the diff and ran `git diff --check`; no builds, tests, lint or automated browser checks.
- Manual check on a touch device: select one player Toon, long press another to add it to the team, and confirm the player selection does not change. Then tap a Toon normally and confirm the player selection changes.

## 2026-09-24 — Train Whistle Slow immunity

- Exposed the existing Train Whistle trinket and made it block the applied Slow debuff without blocking Confused, Tired, Illness or trinket drawbacks. The Cards & Debuffs tab explains the interaction while it is equipped.
- Source: [Train Whistle](https://dandys-world-robloxhorror.fandom.com/wiki/Train_Whistle), latest wiki revision August 31, 2026, checked September 24. Reviewed the diff, parsed changed JSON and ran `git diff --check`; no builds, tests, lint or automated browser checks.
- Manual check: select Poppy, apply Slow II and note reduced movement; equip Train Whistle and movement returns to the unslowed value. Confused still lowers extraction. Remove Train Whistle and the selected Slow II again applies.

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
- Add TIME’S UP and selectable Suppression; crop all five card faces with complete, consistent white frames.
- Replace Waxwell timeline and cooldown scenarios with the standard Ignite checkbox; no teammate cooldown control.
- Add non-chasing Twisted Waxwell with neutral N/A values. His sourced portrait is included; inconsistent secondary roaming values remain unverified.
- Keep Cherished Blanket out of visible trinkets and ability cooldown statistics deferred.
- Confirm Finn's existing35% modifier against the June12,2026 (0.22.1) wiki change history; remove the outdated preview multiplier warning. No numeric change.
- Validation: manual source/diff review, JSON parsing and git diff --check only. User browser testing remains pending.

## 2026-09-23 — Approved feature release

- Replace Waxwell’s full-body screenshot with the unchanged, sourced square transparent Toon portrait; use the existing image_name field.
- Release the user-approved Cards & Debuffs, Advanced stat editing, ability counters, floor-trinket/Panic comparisons, developer Toons and Waxwell bundle after focused source/diff/JSON checks.
- Production feedback configuration is preserved; local-only feedback overrides remain outside release commits. Cooldown statistics remain deferred.

## 2026-09-24 — Lucky Coin Skill Check roll

- Correct the visible Lucky Coin Skill Check choice to boost both window size and chance. At the usual 25% base chance, the sourced 12-percentage-point bonus displays as 37%; window size receives a 12% multiplier.
- The user still selects the observed floor roll manually. Gigi's Common-item exclusion is not simulated because the explorer has no item-generation pool.
- Source: [Lucky Coin](https://dandys-world-robloxhorror.fandom.com/wiki/Lucky_Coin) and [Multipliers](https://dandys-world-robloxhorror.fandom.com/wiki/Multipliers), checked September 24, 2026. Review the diff and run `git diff --check`; no builds, tests, lint or automated browser checks.
- Manual check: select a Toon with 25% base Skill Check chance, equip Lucky Coin, choose Skill Check and confirm 37% chance and 12% larger window. Choose Movement Speed to confirm chance returns to 25%.

## 2026-09-24 — Hidden trinket categories

- Classify Moon Pack Heirloom and Party Popper as Other rather than Extraction. Their effects reveal teammate or Twisted locations; neither changes Extraction Speed. Both remain hidden because the explorer does not simulate location highlighting.
- Sources: [Moon Pack Heirloom](https://dandys-world-robloxhorror.fandom.com/wiki/Moon_Pack_Heirloom) (revision August 26, 2026) and [Party Popper](https://dandys-world-robloxhorror.fandom.com/wiki/Party_Popper) (revision September 6, 2026), checked September 24. Parsed changed JSON and ran `git diff --check`; no builds, tests, lint or automated browser checks.

## 2026-09-24 — Christmas Cookie player-stat correction

- Hide Christmas Cookie from the player-only Item controls. Its 15% speed pulse targets nearby teammates, not the user who activates it; the previous control incorrectly increased the selected Toon's speed.
- Retain the item record for a later teammate-targeted item model. Dandy Easter Egg's recipient rule remains under investigation rather than being inferred from Christmas Cookie.
- Sources checked September 24: [Items](https://dandys-world-robloxhorror.fandom.com/wiki/Items) (latest revision September 3, 2026) and the [Japanese item wiki](https://wikiwiki.jp/dandys-world/%E3%82%A2%E3%82%A4%E3%83%86%E3%83%A0), which specifies that the activating user does not receive the Cookie effect. Parsed changed JSON and ran `git diff --check`; no builds, tests, lint or automated browser checks.

## 2026-09-24 — Tape pickup reference

- Clarify the retained, hidden Tape record: a floor pickup grants 5 Tapes to the in-run balance, which is spent at Dandy's Shop and by some Toon abilities. The explorer still does not simulate a currency balance.
- Sources checked September 24: [Tapes](https://dandys-world-robloxhorror.fandom.com/wiki/Tapes) (latest revision June 18, 2026) and the [current item guide](https://dandysworld.org/items). Parsed changed JSON and ran `git diff --check`; no builds, tests, lint or automated browser checks.
