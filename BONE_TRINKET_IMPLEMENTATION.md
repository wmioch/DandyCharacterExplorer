# Bone Trinket - Complete Implementation

## Issues Fixed

### 1. Bone does nothing ❌ → ✅ FIXED
Added effects array with +25% movement speed modifier

### 2. Bone needs to be stackable ❌ → ✅ FIXED
Implemented full trinket stacking system (similar to items)

### 3. Bone needs 40 speed cap ❌ → ✅ FIXED
Added cap support to prevent speed exceeding 40

## Implementation Details

### Data Changes (`data/trinkets.json`)

Added `stackable: true` and `effects` array with a 40 speed cap:

```json
{
  "name": "Bone",
  "stackable": true,
  "effects": [
    {
      "targetStat": "movementSpeed",
      "value": 0.25,
      "applicationType": "multiplicative",
      "cap": 40
    }
  ]
}
```

### Calculator Changes (`js/calculator.js`)

Updated trinket processing to:
1. Handle both old format (trinket object) and new format ({trinket, count})
2. Apply effects multiple times for stackable trinkets
3. Use existing cap logic (already supported via `modifier.cap`)

```javascript
trinkets.forEach(trinketEntry => {
    const trinket = trinketEntry.trinket || trinketEntry;
    const count = trinketEntry.count || 1;
    
    if (trinket && trinket.effects) {
        // Apply effects multiple times for stackable trinkets
        for (let i = 0; i < count; i++) {
            trinket.effects.forEach(effect => {
                // ... apply effect with cap support
            });
        }
    }
});
```

### App State Changes (`js/app.js`)

1. **Updated state structure**: `equippedTrinkets` now supports `{trinket, count}` format
2. **Added handlers**:
   - `handleTrinketIncrement(trinketId)` - Increment stackable trinket (max 10)
   - `handleTrinketDecrement(trinketId)` - Decrement stackable trinket (min 0, removes at 0)
3. **Modified `handleTrinketToggle`**: Checks `trinket.stackable` flag
   - Stackable: increment count
   - Non-stackable: toggle on/off (backward compatible)
4. **Added event listeners**:
   - Left click: increment (existing behavior for items, now also trinkets)
   - Right click: decrement (prevents context menu)

### UI Changes (`js/ui.js`)

Updated `updateSelectedTrinketsInGrid()` to:
1. Accept full trinket entries (not just IDs)
2. Display count badges for stackable trinkets
3. Remove count badges when trinket is deselected

```javascript
// Add count badge for stackable trinkets with count > 0
if (trinket.stackable && count > 0) {
    const badge = document.createElement('div');
    badge.className = 'count-badge';
    badge.textContent = count;
    selectedItem.appendChild(badge);
}
```

## How It Works

### For Players:
1. **Left-click** Bone trinket to add/increment (up to 10 stacks)
2. **Right-click** Bone trinket to decrement/remove
3. Count badge shows current stack count
4. Each stack adds +25% movement speed
5. Speed is capped at 40 (no higher)

### Math Examples:

**Goob (Walk: 17.5, Run: 27.5):**

| Stacks | Walk Speed | Run Speed | Notes |
|--------|------------|-----------|-------|
| 0 | 17.5 | 27.5 | Base |
| 1 | 21.9 | 34.4 | ×1.25 |
| 2 | 27.3 | **40.0** | ×1.5625 (run capped) |
| 3 | 34.2 | **40.0** | ×1.953 (run capped) |
| 4 | **40.0** | **40.0** | Both capped |

### Cap Behavior:
- Each Bone multiplies speed by 1.25
- Two Bones: 1.25 × 1.25 = 1.5625 (×156%)
- Three Bones: 1.25³ = 1.953 (×195%)
- **Final speed cannot exceed 40** regardless of multiplier
- Cap applies to FINAL speed after all modifiers

## Test Results

✅ **Single Bone**: 17.5 → 21.9 walk, 27.5 → 34.4 run  
✅ **Two Bones**: 17.5 → 27.3 walk, 27.5 → **40.0** run (capped)  
✅ **Three Bones**: 17.5 → 34.2 walk, 27.5 → **40.0** run (capped)  

## Backward Compatibility

The implementation maintains backward compatibility:
- Non-stackable trinkets still work as before (toggle on/off)
- Old state format (`equippedTrinkets` as array of trinkets) still supported
- Existing trinkets without `stackable: true` flag behave normally

## Files Modified

1. `data/trinkets.json` - Added stackable flag and effects to Bone
2. `js/calculator.js` - Updated trinket processing for stacking/caps
3. `js/app.js` - Added trinket count handling and event listeners
4. `js/ui.js` - Updated UI to show count badges

## Notes

- This is the **first stackable trinket** in the system
- The stacking system is generic and can be applied to other trinkets in the future
- Count badges use existing `.count-badge` CSS class (same as items)
- Maximum stack count is 10 (consistent with items)

