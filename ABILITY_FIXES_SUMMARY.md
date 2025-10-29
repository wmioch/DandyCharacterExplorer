# Toon Ability Fixes Summary

This document summarizes all the fixes made to Toon abilities based on the reported issues.

## Issues Fixed

### 1. Brusha - Artistic Inspiration
**Problem**: Skill check modifiers (size and chance) were not applying when the team ability was toggled on.

**Fix**: 
- Updated `teamEffect` to use `skillCheckAmount` instead of `skillCheckSize` (matching the internal stat name)
- Enhanced `_applyTeamEffect()` in calculator.js to properly handle both `skillCheckAmount` and `skillCheckChance` modifiers
- The ability now correctly applies +50% skill check amount and +25% skill check chance to teammates

**Data Changes**:
- Removed incorrect `playerEffect` (movement speed penalty was not part of the spec)
- Corrected `teamEffect` to use proper property names

---

### 2. Eclipse - Total Eclipse
**Problem**: Only movement speed applied; stamina stars and base stamina did not change.

**Fix**:
- Converted ability to use `conditionalStats` system with two modes:
  - **Normal**: Base stats (3★ stamina = 150, 4★ movement)
  - **Blackout**: Enhanced stats (5★ stamina = 200, 4★ movement + 20% = ~5★ equivalent)
- Updated UI.js to dynamically recalculate star ratings based on conditional stat values
- Movement speed increases from 17.5/27.5 to 21/33 (20% boost)
- Stamina increases from 150 to 200 (2 star increase)

**Data Changes**:
- Removed `playerEffect` with `staminaStars` (not handled by calculator)
- Added `conditionalStats` array with Normal and Blackout modes

---

### 3. Flutter - Floaty Dash
**Problem**: Applied calculated modifier instead of directly changing base stats.

**Fix**:
- Converted to `conditionalStats` system with two modes:
  - **Normal**: Base speeds (17.5 walk, 27.5 run)
  - **Dash Active**: Base speeds + 50 points (67.5 walk, 77.5 run)
- This ensures the +50 points are applied directly to base stats, not as a percentage modifier

**Data Changes**:
- Removed `playerEffect` with additive movement speed
- Added `conditionalStats` array with Normal and Dash Active modes

---

### 4. Flyte - Gust
**Problem**: No bonus was applied when ability was toggled on.

**Fix**:
- Removed incorrect `playerEffect` (ability should only affect teammates, not self)
- Kept only `teamEffect` with +15% movement speed
- Enhanced `_applyTeamEffect()` to properly read `applicationType` from the effect object

**Data Changes**:
- Removed `playerEffect`
- `teamEffect` now works correctly with movement speed modifier

---

### 5. Gourdy - Sugar Rush
**Problem**: No bonus was applied when ability was toggled on.

**Fix**:
- Removed incorrect `playerEffect` (duplicated the team effect)
- Kept only `teamEffect` with +20% movement speed
- The ability now correctly applies to the player as a team member

**Data Changes**:
- Removed `playerEffect`
- `teamEffect` works as intended

---

### 6. Looey - Heart of Helium
**Problem**: Base stats were altered instead of applying modifiers.

**Fix**:
- Redesigned `conditionalStats` to use new `modifierOverrides` property
- Three modes now apply percentage modifiers instead of changing base stats:
  - **3 Hearts**: No modifier (base speed)
  - **2 Hearts**: +20% movement speed modifier
  - **1 Heart**: +40% movement speed modifier
- Added calculator support for `modifierOverrides` which adds multiplicative modifiers
- This shows the speed boost as a modifier in the stats display, not as a base stat change

**Data Changes**:
- Changed `conditionalStats` to use `modifierOverrides` instead of `statModifiers`
- Removed `playerEffect` with special handling

---

### 7. Razzle & Dazzle - Comedy/Tragedy
**Problem**: Ability was completely broken; needed odd/even floor implementation.

**Fix**:
- Added `conditionalStats` system with two modes:
  - **Odd Floor**: 5★ Movement (20/30), 1★ Extraction (0.75)
  - **Even Floor**: 1★ Movement (10/20), 5★ Extraction (1.5)
- User can toggle between modes using the conditional stats selector
- Stats and star ratings update dynamically based on selection

**Data Changes**:
- Removed `playerEffect` with special floor-based handling
- Added `conditionalStats` array with Odd and Even floor modes

---

### 8. Rudie - Antler Charge
**Problem**: Applied calculated modifier instead of directly changing base stats.

**Fix**:
- Converted to `conditionalStats` system with two modes:
  - **Normal**: Base speeds (15 walk, 25 run)
  - **Charge Active**: Base speeds + 50 points (65 walk, 75 run)
- This ensures the +50 points are applied directly to base stats, not as a percentage modifier

**Data Changes**:
- Removed `playerEffect` with additive movement speed
- Added `conditionalStats` array with Normal and Charge Active modes

---

## Technical Implementation Details

### Calculator.js Changes

1. **Enhanced `_applyTeamEffect()`**:
   - Now properly reads `applicationType` from effect object
   - Handles both `skillCheckAmount` and `skillCheckSize` properties
   - Properly applies `skillCheckChance` modifiers
   - Supports both multiplicative and additive application types for all stats

2. **Added `modifierOverrides` Support**:
   - New property in `conditionalStats` objects
   - Applies multiplicative modifiers without changing base stats
   - Used by Looey to show speed boosts as modifiers in the UI

3. **Enhanced Conditional Stats Handling**:
   - Better support for `statModifiers` (changes base stats)
   - New support for `modifierOverrides` (applies as modifiers)
   - Both can be used in the same `conditionalStats` system

### UI.js Changes

1. **Dynamic Star Rating Calculation**:
   - `updateStatsDisplay()` now accepts `conditionalStatSet` parameter
   - Recalculates star ratings when base stats change significantly
   - Supports stamina, movement speed, and extraction speed star changes
   - Works with Eclipse's stamina transformation and Razzle & Dazzle's stat swaps

2. **Enhanced Display**:
   - Star ratings now update dynamically based on conditional stats
   - Modifiers show correctly for percentage-based changes
   - Base stat changes reflect in both base and final columns

### Data Structure Changes

All affected toons now use one of two patterns:

1. **Conditional Stats with `statModifiers`** (Eclipse, Flutter, Rudie, Razzle & Dazzle):
   ```json
   "conditionalStats": [
     {
       "id": "mode_id",
       "name": "Mode Name",
       "condition": "condition",
       "statModifiers": {
         "walkSpeed": 20,
         "runSpeed": 30
       }
     }
   ]
   ```

2. **Conditional Stats with `modifierOverrides`** (Looey):
   ```json
   "conditionalStats": [
     {
       "id": "mode_id",
       "name": "Mode Name",
       "condition": "condition",
       "modifierOverrides": {
         "movementSpeed": 0.2
       }
     }
   ]
   ```

## Testing Checklist

- [ ] Brusha: Team members receive +50% skill check amount and +25% skill check chance
- [ ] Eclipse: Blackout mode shows 5★ stamina (200) and increased movement speed
- [ ] Flutter: Dash Active shows walk speed 67.5, run speed 77.5
- [ ] Flyte: Team members receive +15% movement speed boost
- [ ] Gourdy: Team members receive +20% movement speed boost
- [ ] Looey: 2 hearts shows +20% modifier, 1 heart shows +40% modifier (not base stat changes)
- [ ] Razzle & Dazzle: Odd floor shows 5★ movement, even floor shows 5★ extraction
- [ ] Rudie: Charge Active shows walk speed 65, run speed 75

## Files Modified

1. `data/toons.json` - Updated ability configurations for all 8 toons
2. `js/calculator.js` - Enhanced team effect application and added modifierOverrides support
3. `js/ui.js` - Added dynamic star rating calculation for conditional stats
4. `js/app.js` - Pass conditional stat set to UI update function

