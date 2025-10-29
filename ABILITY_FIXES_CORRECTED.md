# Toon Ability Fixes - Corrected Implementation

This document outlines the CORRECTED fixes for all 8 Toon abilities based on user feedback.

## Key Implementation Principles

1. **Toggleable abilities control their effects via checkbox** - No separate conditional stat selectors
2. **Base stat changes are applied BEFORE modifiers** - Using `baseStatOverrides` property
3. **Team abilities work when toon is on the team** - Using `teamEffect` property
4. **Player abilities work when toon is selected** - Using `playerEffect` property

---

## Fixed Abilities

### 1. ✅ Brusha - Artistic Inspiration
**What it does**: When toggled on (as player or team member), provides skill check boosts to teammates while slowing Brusha down.

**Implementation**:
- **playerEffect**: -25% movement speed (applies to Brusha when she's the player)
- **teamEffect**: +50% skill check amount AND +25% skill check chance (applies to player when Brusha is on team)
- Checkbox toggles BOTH effects

**Expected behavior**:
- **As player**: When toggled, Brusha gets -25% movement speed
- **On team**: When toggled, player gets +50% skill check amount and +25% skill check chance

---

### 2. ✅ Eclipse - Total Eclipse  
**What it does**: When toggled on, Eclipse transforms gaining stamina and movement speed.

**Implementation**:
- **playerEffect** with **baseStatOverrides**: 
  - Sets stamina to 200 (5★ from 3★/150)
  - Applies +20% movement speed modifier
- Checkbox directly controls the transformation

**Expected behavior**:
- When OFF: Base stats (3★ stamina = 150, 4★ movement)
- When ON: 5★ stamina (200 base) + 20% movement speed boost (21/33 speeds)
- Stars update dynamically to show 5★ stamina when active

---

### 3. ✅ Flutter - Floaty Dash
**What it does**: When toggled on, adds 50 points to walk and run speed.

**Implementation**:
- **playerEffect** with **baseStatOverrides**: 
  - Adds 50 to walkSpeed base (17.5 → 67.5)
  - Adds 50 to runSpeed base (27.5 → 77.5)
- Checkbox directly controls the dash

**Expected behavior**:
- When OFF: Normal speeds (17.5/27.5)
- When ON: Dash speeds (67.5/77.5) shown as BASE stats, not modifiers
- No conditional selector - just the toggle checkbox

---

### 4. ✅ Flyte - Gust
**What it does**: When toggled on (as player or team member), provides movement speed boost.

**Implementation**:
- **playerEffect**: +15% movement speed (applies to Flyte when player)
- **teamEffect**: +15% movement speed (applies to player when Flyte on team)
- Checkbox toggles BOTH effects

**Expected behavior**:
- **As player**: When toggled, Flyte gets +15% movement speed
- **On team**: When toggled, player gets +15% movement speed

---

### 5. ✅ Gourdy - Sugar Rush (ability2)
**What it does**: When toggled on (as player or team member), provides movement speed boost.

**Implementation**:
- **playerEffect**: +20% movement speed (applies to Gourdy when player)
- **teamEffect**: +20% movement speed (applies to player when Gourdy on team)
- Checkbox toggles BOTH effects

**Expected behavior**:
- **As player**: When toggled, Gourdy gets +20% movement speed
- **On team**: When toggled, player gets +20% movement speed

---

### 6. ✅ Looey - Heart of Helium
**What it does**: Uses conditional selector to choose heart level, applies appropriate speed modifier.

**Implementation**:
- **conditionalStats** with **modifierOverrides**:
  - "3 Hearts": No modifier (base speed)
  - "2 Hearts": +20% movement speed modifier
  - "1 Heart": +40% movement speed modifier
- Selector controls which mode is active

**Expected behavior**:
- User selects heart level from dropdown
- Speed boost shows as MODIFIER percentage, not base stat change
- Names simplified to just "3 Hearts", "2 Hearts", "1 Heart"

---

### 7. ✅ Razzle & Dazzle - Comedy/Tragedy
**What it does**: Uses conditional selector to choose floor type, swaps between movement and extraction focus.

**Implementation**:
- **conditionalStats** with **statModifiers**:
  - "Odd Floor": 5★ Movement (20/30), 1★ Extraction (0.75)
  - "Even Floor": 1★ Movement (10/20), 5★ Extraction (1.5)
- Selector controls which mode is active

**Expected behavior**:
- User selects floor type from dropdown
- Stats swap completely between movement focus and extraction focus
- Stars update to show 5★/1★ split
- Names simplified to just "Odd Floor", "Even Floor"

---

### 8. ✅ Rudie - Antler Charge
**What it does**: When toggled on, adds 50 points to walk and run speed.

**Implementation**:
- **playerEffect** with **baseStatOverrides**: 
  - Adds 50 to walkSpeed base (15 → 65)
  - Adds 50 to runSpeed base (25 → 75)
- Checkbox directly controls the charge

**Expected behavior**:
- When OFF: Normal speeds (15/25)
- When ON: Charge speeds (65/75) shown as BASE stats, not modifiers
- No conditional selector - just the toggle checkbox

---

## Technical Implementation Details

### New Calculator Feature: Base Stat Overrides

```javascript
_applyBaseStatOverrides(toon, baseStats) {
    // Checks if abilities are toggled on
    // Applies baseStatOverrides BEFORE modifiers
    // For walkSpeed/runSpeed: ADDS the value
    // For other stats like stamina: SETS the value
}
```

This function runs BEFORE any modifiers are calculated, ensuring that abilities like Flutter and Rudie directly modify base stats, and abilities like Eclipse can set stamina to a specific value.

### Data Structure: baseStatOverrides

```json
"playerEffect": {
  "baseStatOverrides": {
    "walkSpeed": 50,    // Adds 50 for Flutter/Rudie
    "stamina": 200      // Sets to 200 for Eclipse
  },
  "movementSpeed": 0.2  // Still applies as modifier for Eclipse
}
```

### Team Abilities

Team abilities use the `teamEffect` property which gets applied when:
1. The toon is added to the team (not as player)
2. Their ability is toggled on in the Team Abilities section

### Player Abilities

Player abilities use the `playerEffect` property which gets applied when:
1. The toon is selected as the player
2. Their ability toggle checkbox (in the abilities display) is checked

---

## Files Modified

1. **data/toons.json**
   - Added `playerEffect` back to Brusha, Flyte, Gourdy
   - Added `baseStatOverrides` to Eclipse, Flutter, Rudie
   - Simplified conditional stat names for Looey and Razzle & Dazzle
   - Removed incorrect conditional stats from Eclipse, Flutter, Rudie

2. **js/calculator.js**
   - Added `_applyBaseStatOverrides()` function
   - Modified `_applyAbilityEffect()` to handle baseStatOverrides properly
   - Ensured team effects apply correctly

3. **js/ui.js**
   - Updated star rating calculation to handle base stat changes
   - Stars now update when abilities change base stats

---

## Testing Guide

### Brusha
1. Select Brusha as player, toggle ability → should see -25% movement speed
2. Add Brusha to team, toggle ability → player should see +50% skill check amount, +25% skill check chance

### Eclipse
1. Select Eclipse as player
2. Toggle ability → stamina should change from 150 (3★) to 200 (5★), movement speed should show +20% modifier

### Flutter
1. Select Flutter as player
2. Toggle ability → walk speed should show 67.5 (not 17.5+modifier), run speed 77.5 (not 27.5+modifier)

### Flyte
1. Select Flyte as player, toggle ability → should see +15% movement speed
2. Add Flyte to team, toggle ability → player should see +15% movement speed

### Gourdy
1. Select Gourdy as player, toggle ability → should see +20% movement speed
2. Add Gourdy to team, toggle ability → player should see +20% movement speed

### Looey
1. Select Looey as player
2. Use dropdown to select "2 Hearts" → should see +20% modifier (not base stat 18/30)
3. Select "1 Heart" → should see +40% modifier (not base stat 21/35)

### Razzle & Dazzle
1. Select Razzle & Dazzle as player
2. Select "Odd Floor" → should see 20/30 base speeds (5★), 0.75 extraction (1★)
3. Select "Even Floor" → should see 10/20 base speeds (1★), 1.5 extraction (5★)

### Rudie
1. Select Rudie as player
2. Toggle ability → walk speed should show 65 (not 15+modifier), run speed 75 (not 25+modifier)

