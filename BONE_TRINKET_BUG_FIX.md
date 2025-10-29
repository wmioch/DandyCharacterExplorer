# Bone Trinket Bug Fix

## Issue Description
When clicking on the Bone trinket after equipping other trinkets (like Dog Plush), the application would throw a console error:
```
Uncaught TypeError: Cannot read properties of undefined (reading 'id')
    at app.js?v=20251028:246:78
    at Array.find (<anonymous>)
    at Object.handleTrinketToggle (app.js?v=20251028:246:58)
```

The Bone trinket would not add any instances, even though the movement speed was not at the 40 cap.

## Root Cause
The bug was caused by inconsistent trinket storage formats in the `equippedTrinkets` array:
- **Stackable trinkets** (like Bone) are stored as: `{ trinket: {...}, count: N }`
- **Non-stackable trinkets** are stored directly as: `trinket` object

The `handleTrinketToggle()` method was using unsafe property access when searching for existing trinkets:
```javascript
// BEFORE (unsafe - line 246):
const existing = this.state.equippedTrinkets.find(t => t.trinket.id === trinketId);
```

This would fail when:
1. A non-stackable trinket exists in `equippedTrinkets` (stored as a plain object)
2. The code tries to access `t.trinket.id` on the non-stackable trinket
3. Since the non-stackable trinket doesn't have a `.trinket` property, `t.trinket` is undefined
4. Accessing `.id` on undefined throws the error

## Solution
Added safe property access pattern throughout the codebase:
```javascript
// AFTER (safe - line 246-248):
const existing = this.state.equippedTrinkets.find(t => 
    (t.trinket ? t.trinket.id === trinketId : t.id === trinketId)
);
```

This pattern checks if `t.trinket` exists before trying to access `.id`, and falls back to `t.id` for non-stackable trinkets.

## Files Changed
- `js/app.js`

## Locations Fixed
1. **Line 246** - `handleTrinketToggle()` - Finding existing stackable trinket (CRITICAL FIX)
2. **Line 267** - `handleTrinketToggle()` - Finding simulated Bone trinket for cap check
3. **Line 312** - `handleTrinketToggle()` - Checking if non-stackable trinket is equipped
4. **Line 318** - `handleTrinketToggle()` - Filtering to remove non-stackable trinket
5. **Line 339** - `handleTrinketIncrement()` - Defensive programming improvement
6. **Line 360** - `handleTrinketDecrement()` - Defensive programming improvement
7. **Line 374** - `handleTrinketDecrement()` - Already had safe pattern

## Testing
The fix ensures:
- ✅ Bone trinket can now be clicked after selecting other trinkets
- ✅ Bone trinket respects the 40 speed cap correctly
- ✅ No console errors when handling mixed trinket types
- ✅ Consistent behavior across all trinket operations
- ✅ All existing functionality preserved

## Impact
This fix resolves the runtime error that prevented Bone trinket selection and ensures proper handling of mixed stackable/non-stackable trinket combinations.
