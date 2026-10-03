# Card scope review — October 3, 2026

Rechecked the current table in [Cards revision 265850](https://dandys-world-robloxhorror.fandom.com/wiki/Cards?oldid=265850) (October 3), retrieved October 3 at 20:00 Australia/Sydney. It lists 24 names: 21 regular cards plus the Christmas, Easter and Halloween cards. The earlier September 25 revision listed only 23 names; the new table adds Party Crashers and specifies its effect. With that card, Haunted Gala's per-floor chance increase falls from 2 to 1.5 percentage points and its maximum chance falls from 30% to 25%. The page names its icon and card files, but their pixels have not been checked. The [cards guide](https://dandysworld.org/mechanics/cards) has no established publication date or independent source lineage. Floor-event probability is not currently displayed; Gala-mask transitions and authentic artwork remain under investigation. Each named card below has an individual disposition; the five selectors cover the represented stamina, Machine-work and Twisted-speed scenarios. Healing and Item gifts can also affect displayed stats through the separate scenarios described below; their transitions are not automatic.

| Card | Effect checked | Explorer disposition |
|---|---|---|
| Tech Savvy | Five fewer machine work units | Selectable; 45 to 40 units |
| Well-Paced | +10 maximum stamina | Selectable |
| Endurance | +10 maximum stamina | Selectable independently |
| TIME’S UP | +50 maximum stamina after completing Dyle’s floor | Selectable earned reward, not merely voting for the card |
| Suppression | Panic speed bonus reduced from 20% to 15% | Selectable; uses existing per-Twisted suppressed values |
| First Aid | Restore one missing Heart | Can reduce Looey's missing-heart speed bonus; change his heart selector manually after healing |
| Medical Attention | Restore one missing Heart | Same Looey interaction; each healing card restores one current Heart, not maximum health |
| Blind Grab | Grant one random inventory Item when a slot is open | Can increase Whispering Flower's held-item bonus; select any resulting Item buff separately |
| Lost and Found | Grant one random inventory Item when a slot is open | Same held-item interaction; the random Item's type is not inferred |
| Spare Change | Grant 45 Tapes | Currency not displayed |
| Penny Pincher | Grant 45 Tapes | Currency not displayed |
| Frugal | Shop discount | Prices not displayed |
| Decency | +5 seconds elevator timer | Timer not displayed; no movement speed effect |
| Etiquette | +5 seconds elevator timer | Timer not displayed; no movement speed effect |
| Sparkplug | Greater blackout light radius | Light radius not displayed |
| Piping Tape | Reduced Ichor Leak probability | Floor probability not displayed |
| Frost Shield | Reduced Iced Over probability; Christmas | Floor probability not displayed |
| Air Freshener | Reduced Spring Fever probability; Easter | Floor probability not displayed |
| Electrician | Reduced blackout probability | Floor probability not displayed |
| Avaricious | Greater rare-item probability | Exact numerical odds unavailable; no direct stat modifier |
| Covetous | Greater rare-item probability | Exact numerical odds unavailable; no direct stat modifier |
| Rehearsal | Ability cooldown reduced by five seconds | Explicitly deferred with cooldown statistics |
| Practice | Ability cooldown reduced by five seconds | Explicitly deferred with cooldown statistics |
| Party Crashers | Haunted Gala chance increase: 2 to 1.5 percentage points per floor; cap: 30% to 25%; Halloween | Floor-event probability not displayed. Gala mask transitions and authentic artwork remain under investigation |

First Aid and Medical Attention can affect a displayed stat indirectly. [Looey revision 260288](https://dandys-world-robloxhorror.fandom.com/wiki/Looey?oldid=260288) (September 4), checked October 3, says his Walk and Run bonus falls when he is healed. After one healing card, change his existing selector from 1 Heart to 2 Hearts, or from 2 Hearts to 3 Hearts. Both cards can take a 1-Heart scenario to 3 Hearts. The explorer does not perform this transition automatically: its Health row displays maximum Hearts, and there are no healing-card controls or general current-health state. A coupled healing scenario remains separate implementation work; healing must not be modeled as extra maximum Hearts.

Blind Grab and Lost and Found each add one held Item if a slot is free. [Whispering Flower revision 254343](https://dandys-world-robloxhorror.fandom.com/wiki/Whispering_Flower?oldid=254343) (August 8), checked October 2, gives a 15% Stamina Regeneration bonus per held Item. A gift can therefore change its bonus even before that Item is used. Selecting an Item buff does not model a pickup or change the held-inventory scenario. No gift-card control performs that transition, and the explorer does not choose a random Item type. A coupled gift/held-inventory scenario remains separate implementation work alongside the healing scenarios.

Tech Savvy's card text says five seconds, but the Cards page's explicit Trivia correction and extraction-rate examples establish five fewer work units. The calculator uses 45 to 40 units, so the time saved depends on extraction speed.

Suppression does not multiply normal speed by 0.95. The existing table already distinguishes normal, Panic and suppressed Panic states. Selecting the card uses the suppressed state in the Panic column and hides the duplicate reference column. Deselecting restores the original comparison columns. Vanity Mirror's player Panic value remains independent.

No card artwork was invented. See [artwork sources](../assets/images/cards/SOURCES.md). All five card crops omit the source border and use a complete, consistent white CSS frame. UI inspection in a browser remains for the user under repository policy.
