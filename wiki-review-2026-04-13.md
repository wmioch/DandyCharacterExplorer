# Dandy's World Wiki Audit

Date checked: 2026-04-13 (Australia/Sydney)

Sources:
- https://dandys-world-robloxhorror.fandom.com/wiki/Category:Toons
- https://dandys-world-robloxhorror.fandom.com/wiki/Category:Trinkets
- Individual toon/trinket pages on the same wiki

Scope:
- Compared every local toon in `data/toons.json` against the current wiki infobox ability text.
- Compared every local trinket in `data/trinkets.json`, including hidden/removed entries, against the current wiki infobox effect text.
- Flagged only differences that look mechanically meaningful or that would change how the app should describe the entry.

## Approval Candidates

### Confirmed toon mismatches

1. Astro - `Well Rested`
   - Local: only says Astro can see Toons below 50% Stamina.
   - Wiki: adds that Astro can also see the exact amount below 50%.
   - Local entry: `data/toons.json` near `"name": "Astro"` (line 5)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Astro

2. Coal - `Scout`
   - Local cooldown: 100
   - Wiki cooldown: 30
   - Local entry: `data/toons.json` near `"name": "Coal"` (line 308)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Coal

3. Cocoa - `Bonbon`
   - Local buff duration: 5 seconds
   - Wiki buff duration: 10 seconds
   - Local entry: `data/toons.json` near `"name": "Cocoa"` (line 343)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Cocoa

4. Eclipse - `Total Eclipse`
   - Local marks this as `(Toggle)`.
   - Wiki marks this as `(Passive)`.
   - Local entry: `data/toons.json` near `"name": "Eclipse"` (line 448)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Eclipse

5. Eggson - `Fixer Upper`
   - Local: grants 10% completion, once per machine.
   - Wiki: grants 20% total completion, once per machine per player, and can work on multiple machines on the same floor.
   - Local entry: `data/toons.json` near `"name": "Eggson"` (line 491)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Eggson

6. Flutter - `Floaty Dash`
   - Local marks this as `(Toggle)`.
   - Wiki marks this as `(Active)`.
   - Local entry: `data/toons.json` near `"name": "Flutter"` (line 570)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Flutter

7. Flyte - `Windy Day`
   - Local marks this as `(Toggle)`.
   - Wiki marks this as `(Active)`.
   - Local gust buff duration: 5 seconds.
   - Wiki gust buff duration: 3 seconds.
   - Local entry: `data/toons.json` near `"name": "Flyte"` (line 615)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Flyte

8. Ginger - active ability
   - Local: sacrifices one of Ginger's own Hearts to heal a targeted Toon; unusable at 1 Heart.
   - Wiki: heals a nearby targeted Toon to full Hearts for 100 Tapes with 100 cooldown; extra Ginger copies add +50 Tapes and +30 cooldown.
   - Local entry: `data/toons.json` near `"name": "Ginger"` (line 694)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Ginger

9. Gourdy - `Sugar Rush`
   - Local marks this as `(Toggle)`.
   - Wiki marks this as `(Passive)`.
   - Local entry: `data/toons.json` near `"name": "Gourdy"` (line 799)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Gourdy

10. Looey - passive ability wording/mechanics need review
    - Local: +20% walk/run speed per missing Heart, up to +40% at one Heart.
    - Wiki: gains one speed star each time he loses a Heart, up to 5 stars at last Heart.
    - This may be only a rewording, but it may also imply a different stat implementation.
    - Local entry: `data/toons.json` near `"name": "Looey"` (line 854)
    - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Looey

11. Rudie - `Antler Charge`
    - Local marks this as `(Toggle)`.
    - Wiki marks this as `(Active)`.
    - Local also includes specific duration/cooldown text (`0.4` seconds / `23` cooldown) that the current wiki infobox no longer states.
    - Local entry: `data/toons.json` near `"name": "Rudie"` (line 1124)
    - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Rudie

12. Squirm - `Distressed Delicacy`
    - Local omits a cooldown value.
    - Wiki explicitly says cooldown of `80`.
    - Local entry: `data/toons.json` near `"name": "Squirm"` (line 1294)
    - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Squirm

13. Sprout - `Baked Sweets`
    - Local: extra Sprout copies increase both tape cost and cooldown.
    - Wiki: extra Sprout copies only mention increased tape cost.
    - Local entry: `data/toons.json` near `"name": "Sprout"` (line 1369)
    - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Sprout

### Confirmed trinket mismatches

1. Coal (Trinket)
   - Local: `-10%` Stealth and `-20%` Movement Speed.
   - Wiki: `-10%` Stealth and `-10%` Walk/Run Speed.
   - Local entry: `data/trinkets.json` near `"name": "Coal (Trinket)"` (line 126)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Coal_(Trinket)

2. Crayon Set
   - Local: grants an Uncommon item at the start of every floor.
   - Wiki: grants a random Uncommon item every new floor only if inventory has an open slot.
   - Local entry: `data/trinkets.json` near `"name": "Crayon Set"` (line 179)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Crayon_Set

3. Dandy Plush
   - Local: 50% shop discount during intermissions on even floors.
   - Wiki: 50% discount on all Dandy's Shop items; current infobox does not mention the even-floor/intermission restriction.
   - Local entry: `data/trinkets.json` near `"name": "Dandy Plush"` (line 190)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Dandy_Plush

4. Festive Lights
   - Local effect text is missing the highlighted target.
   - Wiki: specifically highlights Ornaments every 10 seconds during matches.
   - Local entry: `data/trinkets.json` near `"name": "Festive Lights"` (line 266)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Festive_Lights

5. Ghost Snakes In A Can
   - Local: reduces active ability cooldown by 5 seconds.
   - Wiki: same reduction, plus explicitly has no effect on Toons without an Active Ability.
   - Local entry: `data/trinkets.json` near `"name": "Ghost Snakes In A Can"` (line 302)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Ghost_Snakes_In_A_Can

6. Night Cap
   - Local is a broken placeholder: `Boring design according to Qwel (Replaced by ).`
   - Wiki effect: `Increases Stamina Regeneration by 40% while extracting from a Machine.`
   - Local entry: `data/trinkets.json` near `"name": "Night Cap"` (line 415)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Night_Cap

7. Savory Charm
   - Local: one-time fatal save, does not save from attacks.
   - Wiki: one-time fatal save per round, does not save from Lethal attacks.
   - Local entry: `data/trinkets.json` near `"name": "Savory Charm"` (line 562)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Savory_Charm

8. Toy Kit
   - Local: refreshes active ability cooldown every new floor.
   - Wiki: if a Toon has a ring-based aura ability, increase the aura radius by 25%.
   - Local entry: `data/trinkets.json` near `"name": "Toy Kit"` (line 720)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Toy_Kit

9. Train Whistle
   - Local: immune to "the Debuff".
   - Wiki: immune to the Slow debuff.
   - Local entry: `data/trinkets.json` near `"name": "Train Whistle"` (line 731)
   - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Train_Whistle

10. Whispering Flower
    - Local: highlights all items on the map during Panic Mode.
    - Wiki: increases Stamina Regeneration by 15% for every item in inventory.
    - Local entry: `data/trinkets.json` near `"name": "Whispering Flower"` (line 792)
    - Wiki: https://dandys-world-robloxhorror.fandom.com/wiki/Whispering_Flower

### Confirmed item mismatches

Source used for item comparison:
- https://dandys-world-robloxhorror.fandom.com/wiki/Items

1. Air Horn
   - Local marks it as Dandy-shop-only and prices it at `60`.
   - Wiki lists it as not shop-exclusive and gives a normal tape price of `55`.
   - Local entry: `data/items.json` near `"name": "Air Horn"` (line 4)

2. Basket
   - Local only says it is Easter event currency.
   - Wiki says picking one up adds `5 Baskets`, and that two spawn on each floor during the event.
   - Local entry: `data/items.json` near `"name": "Basket"` (line 33)

3. BonBon
   - Local duration: `5` seconds.
   - Wiki duration: `10` seconds.
   - Local entry: `data/items.json` near `"name": "BonBon"` (line 44)

4. Bottle o' Pop
   - Local marks it as Dandy-shop-only and prices it at `100`.
   - Wiki lists it as not shop-exclusive and gives a normal tape price of `85`.
   - Local entry: `data/items.json` near `"name": "Bottle o' Pop"` (line 67)

5. Box o' Chocolates
   - Local price: `55`.
   - Wiki price: `88`.
   - Local entry: `data/items.json` near `"name": "Box o' Chocolates"` (line 78)

6. Eject Button
   - Local effect says it increases Stealth by `25`.
   - Wiki says the Stealth increase is `15` points.
   - Local price: `85`.
   - Wiki price: `150`.
   - Local entry: `data/items.json` near `"name": "Eject Button"` (line 124)

7. Extraction Speed Candy
   - Local price: `22`.
   - Wiki price: `35`.
   - Local entry: `data/items.json` near `"name": "Extraction Speed Candy"` (line 152)

8. Health Kit
   - Local: restores `2 Hearts`.
   - Wiki: restores the user to maximum health.
   - This is potentially a real mechanical difference for Toons whose max Hearts are not `2`.
   - Local entry: `data/items.json` near `"name": "Health Kit"` (line 181)

9. Jawbreaker
   - Local price: `45`.
   - Wiki price: `58`.
   - Local entry: `data/items.json` near `"name": "Jawbreaker"` (line 221)

10. Jumper Cable
    - Local marks it as Dandy-shop-only and prices it at `88`.
    - Wiki lists it as not shop-exclusive and gives a normal tape price of `65`.
    - Local entry: `data/items.json` near `"name": "Jumper Cable"` (line 232)

11. Ornament
    - Local only says it is Christmas event currency.
    - Wiki says picking one up adds `5 Ornaments`, and that two spawn on each floor during the event.
    - Local entry: `data/items.json` near `"name": "Ornament"` (line 243)

12. Protein Bar
    - Local price: `65`.
    - Wiki price: `45`.
    - Local entry: `data/items.json` near `"name": "Protein Bar"` (line 266)

13. Pumpkin
    - Local only says it is Halloween event currency.
    - Wiki says picking one up adds `5 Pumpkins`, and that two spawn on each floor during the event.
    - Local entry: `data/items.json` near `"name": "Pumpkin"` (line 284)

14. Skill Check Candy
    - Local price: `40`.
    - Wiki price: `42`.
    - Local entry: `data/items.json` near `"name": "Skill Check Candy"` (line 295)

15. Smoke Bomb
    - Local marks it as Dandy-shop-only.
    - Wiki lists it as not shop-exclusive.
    - Local entry: `data/items.json` near `"name": "Smoke Bomb"` (line 313)

16. Speed Candy
    - Local price: `20`.
    - Wiki price: `45`.
    - Local entry: `data/items.json` near `"name": "Speed Candy"` (line 324)

### Item coverage notes

1. Research Capsules vs Ichor
   - The wiki item list includes `Research Capsules`.
   - Local data instead contains `Ichor`.
   - This looks like a modeling mismatch: the wiki treats the pickup item as the capsule, while local data models the reward currency instead.
   - Local entry: `data/items.json` near `"name": "Ichor"` (line 192)

2. Wiki items missing from local data
   - `Christmas Cookie`
   - `Dandy Easter Egg`
   - `Research Capsules`
   - `Enigma Candy` (removed item on the wiki)

3. Item entries I treated as wording-only
   - `Bandage` (the wiki drops the heart icon in parsed text, but the mechanic still reads as restoring 1 Heart)
   - `Gumballs` (wiki adds Glazed Fondant Bag duration text)
   - `Tapes` (wiki is more explicit about uses, but the underlying concept matches)

### Coverage notes

1. Missing toon entries in the app data
   - The wiki category currently includes `Dandy` and `Dyle`.
   - Neither appears in `data/toons.json`.
   - They are developer-only on the wiki, so this may be intentional, but it is still a content gap relative to "every toon".

2. Water Cooler legacy duplicate
   - Local data still contains a hidden `Water Cooler` entry.
   - The wiki now redirects `Water Cooler` to `Cooler`.
   - If the app still wants a removed/legacy record, the local description currently matches the redirected `Cooler` page.

## Not flagged as approval candidates

I intentionally did not include wording-only differences such as:
- `Movement Speed` vs `Walk and Run Speed`
- `start with` vs `start the round with`
- capitalization and punctuation differences
- simplified wording that does not appear to change the mechanic

Examples I treated as wording-only:
- Alarm
- Blue Bandana
- Bone
- Coin Purse
- Feather Duster
- Friendship Bracelet
- Lucky Coin
- Megaphone
- Mime Makeup
- Pull Toy
- Ribbon Spool
- Wrench
