# Blue Bandana Fixes

## Issues Reported

### Issue 1: Skill Check Chance Calculation Incorrect
- **Problem**: Skill check chance was using multiplicative modifier when it should be additive
- **Expected**: 25% - 5% = 20%
- **Was Getting**: 25% × 0.95 = 23.75%
- **Status**: ✅ **FIXED**

### Issue 2: Extraction Speed Showing 7% Instead of 7.5%
- **Problem**: Floating point precision issue causing `Math.round(7.499...996)` to round down to 7 instead of up to 8
- **Expected**: 7.5% (rounds to 8%)
- **Was Getting**: 7%
- **Status**: ✅ **FIXED**

## Root Causes

### Issue 1: Wrong Application Type
The skill check chance effect was defined as:
```json
{
  "targetStat": "skillCheckChance",
  "value": -0.05,
  "applicationType": "multiplicative"  // ❌ WRONG
}
```

Should be:
```json
{
  "targetStat": "skillCheckChance",
  "value": -0.05,
  "applicationType": "additive"  // ✅ CORRECT
}
```

### Issue 2: Floating Point Precision
JavaScript's floating point arithmetic:
```javascript
const percentChange = ((1.075 - 1.0) / 1.0) * 100;
// Result: 7.499999999999996 (not exactly 7.5)
Math.round(7.499999999999996); // Returns 7 ❌
```

## Solutions

### Fix 1: Changed Skill Check to Additive (data/trinkets.json)
```json
{
  "targetStat": "skillCheckChance",
  "value": -0.05,
  "applicationType": "additive"  // Changed from "multiplicative"
}
```

### Fix 2: Added Epsilon to Rounding (js/calculator.js)
```javascript
_calculatePercentage(multiplicativeModifiers, additiveValue, baseStat) {
    // ... calculation code ...
    const percentChange = ((finalValue - baseStat) / baseStat) * 100;
    
    // Fix floating point precision issues (e.g., 7.5 becomes 7.499...996)
    // Add small epsilon before rounding to handle this
    return Math.round(percentChange + 0.00001);
}
```

## Test Results

### Before Fix
```
Goob base stats:
  Extraction Speed: 1
  Skill Check Chance: 0.25 (25%)

With Blue Bandana:
  Extraction Speed: 1.1
  Extraction % Change: 7%          ❌ WRONG (should be 8%)
  Skill Check Chance: 0.2375 (23.75%)  ❌ WRONG (should be 20%)
```

### After Fix
```
Goob base stats:
  Extraction Speed: 1
  Skill Check Chance: 0.25 (25%)

With Blue Bandana:
  Extraction Speed: 1.1
  Extraction % Change: 8%          ✅ CORRECT (7.5% rounds to 8%)
  Skill Check Chance: 0.2 (20%)    ✅ CORRECT (25% - 5% = 20%)
```

## Impact

This floating point precision fix will benefit **all percentage calculations** in the calculator, not just Blue Bandana. Any effect that results in a X.5% change (like 7.5%, 12.5%, etc.) will now round correctly.

## Files Modified
1. `data/trinkets.json` - Changed Blue Bandana skill check effect from multiplicative to additive
2. `js/calculator.js` - Added epsilon to `_calculatePercentage()` to fix floating point rounding

## Next Steps
**Refresh your browser** (Ctrl+F5) to load the updated code and data. Blue Bandana should now show:
- ✅ +8% Extraction Speed (rounded from +7.5%)
- ✅ -5% Skill Check Chance (from 25% to 20%)

