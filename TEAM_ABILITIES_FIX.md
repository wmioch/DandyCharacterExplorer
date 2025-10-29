# Team Abilities Fix

## Issues Fixed

### 1. ✅ Team abilities not applying when different player toon selected
**Problem**: Team abilities were checking localStorage for toggle state, which is only used for player ability checkboxes. For team abilities, the toggle state is managed by whether they're in the `activeAbilities` array.

**Fix**: Removed the localStorage check from team ability processing in calculator.js. If a team ability is in the `teamAbilities` array passed to the calculator, it means it's already enabled (user checked the box in Team Abilities section).

**Code changed**: `js/calculator.js` lines 73-90

### 2. ✅ Brusha's skill check chance not displaying
**Problem**: Skill Check Chance had `noModifier: true` flag which prevented modifiers from being displayed in the stats table.

**Fix**: Removed the `noModifier: true` flag so that skill check chance modifiers now display correctly.

**Code changed**: `js/ui.js` line 449

## How Team Abilities Work Now

1. **Adding to team**: Right-click a toon in the grid to add them to your team (up to 7 members)
2. **Team Abilities section**: Shows all abilities from team members that have `teamEffect`
3. **Toggle abilities**: Check the box next to an ability to enable it
4. **Applies to player**: The enabled team abilities apply their effects to the currently selected player toon
5. **Works with any player**: You can be any toon and still receive buffs from your team

## Example: Brusha's Artistic Inspiration

When Brusha is on the team (not as player) and her ability is toggled on:
- Player receives: **+50% Skill Check Amount** (was showing correctly)
- Player receives: **+25% Skill Check Chance** (now shows correctly)

Display in stats table:
- Skill Check Amount: 
  - Base: depends on toon (e.g., 2.0)
  - Modifier: +50%
  - Final: 3.0
- Skill Check Chance:
  - Base: 25%
  - Modifier: +25%
  - Final: 31% (25% × 1.25 = 31.25%, rounded to 31%)

## Testing

### Test Team Abilities:
1. Select any toon as player (e.g., Boxten)
2. Right-click to add Brusha to team
3. In Team Abilities section, check the box for "Artistic Inspiration"
4. Check stats table:
   - Skill Check Amount should show +50% modifier
   - Skill Check Chance should show +25% modifier

### Test Other Team Abilities:
- **Flyte (Gust)**: +15% movement speed
- **Gourdy (Sugar Rush)**: +20% movement speed
- **Shelly (Inspiration)**: +75% extraction speed
- **Tisha (Tidy Up!)**: +25% movement speed

All should now work regardless of which toon is selected as player!

## Files Modified

1. **js/calculator.js**: Removed localStorage check for team abilities
2. **js/ui.js**: Removed `noModifier: true` from Skill Check Chance display

