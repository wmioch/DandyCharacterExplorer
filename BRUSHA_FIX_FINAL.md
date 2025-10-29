# Brusha Ability Fix - Final

## Issues Fixed

### Issue 1: Skill Check Amount vs Skill Check Size
**Problem**: Ability was applying +50% to Skill Check Amount (bonus extraction units) instead of Skill Check Size (visual hit zone size).

**Fix**: Changed `teamEffect` from `skillCheckAmount` to `skillCheckSize`.

**Impact**:
- **Before**: Affected the bonus units gained per successful skill check (extraction bonus)
- **After**: Affects the visual size of the skill check hit zone on screen (makes it easier to hit)

---

### Issue 2: Skill Check Chance Application Type
**Problem**: Skill Check Chance was applying +25% as a multiplicative modifier (25% × 1.25 = 31.25%), when it should add 25% flat (25% + 25% = 50%).

**Fix**: 
1. Added per-stat application type support to `teamEffect`
2. Set `skillCheckChanceApplicationType: "additive"` for Brusha
3. Updated calculator to respect per-stat application types
4. Updated UI to show flat bonuses correctly

**Impact**:
- **Before**: Skill Check Chance 25% → 31% (multiplicative)
- **After**: Skill Check Chance 25% → 50% (additive)

---

## Technical Implementation

### Data Structure (toons.json)
```json
"teamEffect": {
  "skillCheckSize": 0.5,
  "skillCheckChance": 0.25,
  "skillCheckSizeApplicationType": "multiplicative",
  "skillCheckChanceApplicationType": "additive"
}
```

### Calculator Enhancement
The calculator now supports per-stat application types in team effects:
- Each stat can specify its own application type using `{statName}ApplicationType`
- Falls back to general `applicationType` if not specified
- Allows mixing multiplicative and additive modifiers in the same ability

### UI Display
1. **Team Abilities Section**: Shows "Skill Check Size" and "Skill Check Chance (flat)"
2. **Stats Table**: 
   - Skill Check Size shows +50% modifier
   - Skill Check Chance shows +25% modifier (displays actual percentage points added)

---

## Expected Behavior

When Brusha is on the team with ability toggled on:

### Stats Table Display:
```
Stat                  | Stars | Base  | Modifier | Final
----------------------------------------------------------
Skill Check Size      | ★★★   | 150   | +50%     | 225
Skill Check Chance    | -     | 25%   | +25%     | 50%
```

### Explanation:
- **Skill Check Size**: Visual hit zone grows by 50% (150 → 225)
  - Makes skill checks easier to hit
- **Skill Check Chance**: Chance of skill check appearing increases by 25 percentage points (25% → 50%)
  - Skill checks appear twice as often

---

## Files Modified

1. **data/toons.json**
   - Changed `skillCheckAmount` to `skillCheckSize`
   - Added `skillCheckSizeApplicationType: "multiplicative"`
   - Added `skillCheckChanceApplicationType: "additive"`

2. **js/calculator.js**
   - Added `skillCheckSize` to modifiers tracking
   - Enhanced `_applyTeamEffect()` to support per-stat application types
   - Added skill check size calculation from star rating
   - Added skill check size to final stats and percentages

3. **js/ui.js**
   - Added special handling for Skill Check Chance to show flat bonuses correctly
   - Updated team ability effect display to show Skill Check Size
   - Added "(flat)" indicator for additive skill check chance bonuses

---

## Testing

1. Select any toon as player (e.g., Boxten with 3★ Skill Check Amount)
2. Right-click Brusha to add her to team
3. Check the box for "Artistic Inspiration" in Team Abilities
4. Verify stats:
   - **Skill Check Size**: Should show base 150 (3★) with +50% modifier = 225 final
   - **Skill Check Chance**: Should show base 25% with +25% modifier = 50% final

The key difference is that Skill Check Chance adds 25 percentage points (not 25% of 25%), making it uniquely powerful compared to other percentage-based buffs!

