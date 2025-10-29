# Rounding Fix Summary - Calculation Accuracy

## Problem
Stats were being rounded to 1 decimal place immediately after calculation, which caused cascading rounding errors in dependent calculations. This resulted in incorrect Base Time calculations for the machine stats.

### Example Bug
- Boxten has +6% extraction speed
- Expected: 1.0 × 1.06 = 1.06
- Calculation: 45 / 1.06 = 42.45 seconds ✓
- **WRONG Result**: 45 / 1.1 = 40.9 seconds ❌ (due to early rounding)

## Root Cause
The `Calculator._applyAllModifiers()` and `Calculator._applyModifiers()` functions were rounding values to 1 decimal place before returning them. These rounded values were then stored in `finalStats` and used for subsequent calculations, compounding the rounding error.

## Solution
Removed rounding from calculation functions:
- `_applyAllModifiers()`: Now returns full precision values
- `_applyModifiers()`: Now returns full precision values

Rounding now happens ONLY at the UI display layer:
- `updateStatsDisplay()`: Uses `.toFixed(1)` for display
- `calculateMachineTime()`: Rounds values before returning for display
- All other display functions: Use appropriate rounding for their context

## Files Modified

### js/calculator.js
1. **_applyAllModifiers()** (line 429-460)
   - Removed the rounding logic at the end
   - Now returns `finalValue` directly with full precision
   - Comment added explaining why: prevents cascading rounding errors

2. **_applyModifiers()** (line 462-485)
   - Removed `Math.round(finalValue * 10) / 10` line
   - Now returns `finalValue` directly with full precision
   - Comment added explaining the change

## Data Flow

### Before (Incorrect)
```
calculateFinalStats()
  → _applyAllModifiers() [ROUNDS to 1 decimal]
  → Returns: {extractionSpeed: 1.1} (rounded too early!)
  
calculateMachineTime(1.1)
  → 45 / 1.1 = 40.9 (wrong!)
  → Returns rounded: 40.9s
  
UI displays: 40.9s ❌
```

### After (Correct)
```
calculateFinalStats()
  → _applyAllModifiers() [NO ROUNDING]
  → Returns: {extractionSpeed: 1.06} (full precision)
  
calculateMachineTime(1.06)
  → 45 / 1.06 = 42.45
  → Returns rounded: 42.5s
  
UI displays: 42.5s ✓
```

## Verification

### Boxten Test Case
- Base Extraction Speed: 1.0
- Ability Bonus: +6% (multiplicative)
- **Calculated Speed**: 1.06 (full precision, not rounded)
- **Base Time**: 45 / 1.06 = 42.45... seconds
- **Displayed**: 42.5s (rounded to 1 decimal)

### Poppy Test Case (Control)
- Base Extraction Speed: 1.0
- Calculated Speed: 1.0
- **Base Time**: 45 / 1.0 = 45.0 seconds
- **Displayed**: 45.0s ✓ (correct, no change)

## Impact
- **Machine Stats**: Now displays correct Base Time and Average Time
- **Skill Check Calculations**: Uses correct extraction speed for accurate results
- **All Other Stats**: Display calculations remain correct (already using full precision internally)
- **Twisted Speed Comparison**: Uses full precision speeds for accurate comparison (if applicable)

## Best Practices Applied
1. **Separation of Concerns**: Calculation logic is separate from display logic
2. **Precision Preservation**: Full precision used throughout calculations
3. **Display-Time Rounding**: Rounding only happens when values are displayed
4. **Consistency**: All stats now follow this pattern

## Testing Checklist
- [ ] Poppy Base Time: 45.0s (unchanged, verification of fix)
- [ ] Boxten Base Time: 42.5s (should be corrected from 40.9s)
- [ ] Other toons with extraction bonuses: Verify correct calculations
- [ ] Average Time calculations: Verify accuracy
- [ ] Twisted Speed comparison: Verify colors are correct with full precision speeds
- [ ] All stat displays in table: Verify rounding is correct (using .toFixed(1))
