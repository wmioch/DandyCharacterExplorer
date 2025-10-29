# Item Effects Bug Fix

## Problem

When clicking on items in the new grid interface, JavaScript errors were thrown:

```
Uncaught TypeError: Cannot read properties of undefined (reading 'forEach')
at calculator.js:91
```

The calculator was trying to iterate over `itemObj.item.effects` which didn't exist.

## Root Cause

The calculator code was written expecting items to have structured `effects` arrays (similar to trinkets), but the items.json file only contained plain text `effect` descriptions without structured stat modifiers.

## Solution

### 1. Fixed Calculator (js/calculator.js)

Added a null check before accessing the effects array:

**Before:**
```javascript
items.forEach(itemObj => {
    if (itemObj.item && itemObj.count > 0) {
        itemObj.item.effects.forEach(effect => {
```

**After:**
```javascript
items.forEach(itemObj => {
    if (itemObj.item && itemObj.item.effects && itemObj.count > 0) {
        itemObj.item.effects.forEach(effect => {
```

This prevents the crash when items don't have effects arrays.

### 2. Added Structured Effects to Items (data/items.json)

Added `effects` arrays to all stat-modifying items with the following structure:

```json
"effects": [
  {
    "targetStat": "movementSpeed",
    "value": 0.25,
    "applicationType": "multiplicative"
  }
]
```

## Items Updated

The following items now have structured effects:

1. **BonBon** - +50% Extraction Speed, +25% Movement Speed
2. **Box o' Chocolates** - +10% Movement Speed
3. **Chocolate** - +10% Movement Speed
4. **Extraction Speed Candy** - +50% Extraction Speed
5. **Instructions** - +100% Extraction Speed
6. **Protein Bar** - +150% Stamina Regeneration
7. **Skill Check Candy** - +25% Skill Check Chance
8. **Speed Candy** - +25% Movement Speed
9. **Stamina Candy** - +50% Stamina Regeneration
10. **Stealth Candy** - +25% Stealth

## Notes on Omitted Items

Some items were not given effects arrays because they provide:
- **Flat additions** (e.g., +25 stamina, +50 stealth) rather than percentages
- **Instant effects** (e.g., heal, refill stamina) that don't modify ongoing stats
- **Special mechanics** (e.g., random effects, alert Twisteds) that don't fit the current modifier system

These items remain hidden from the UI as they were before.

## Testing

To test the fix:

1. Refresh the browser to reload the updated data
2. Click on any item (e.g., BonBon)
3. Verify:
   - No console errors
   - Counter shows "x1"
   - Stats update accordingly
   - Twisted table colors update based on new speeds

## Future Improvements

Consider adding support for:
- **Additive modifiers** for flat stat additions (+25 stamina)
- **Conditional effects** for items that only work in certain contexts
- **Complex effects** for items with multiple modes or random effects

