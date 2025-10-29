# Skill Check Chance Bonus Fixes

## Summary
Fixed 2 trinkets that incorrectly had Skill Check Chance as **multiplicative** when it should be **additive**. Skill Check Chance is unique - all modifiers to it are added directly, not multiplied.

## The Rule
**Skill Check Chance = Base + All Bonuses**
- Base: 25% (0.25)
- Any modifier is added directly
- 25% + 5% = 30%, NOT 25% × 1.05 = 26.25%
- 25% + 25% = 50%, NOT 25% × 1.25 = 31.25%

## Fixes Applied

### 1. Paint Bucket ✅
**Before**: 25% × 1.05 = 26.25% ❌  
**After**: 25% + 5% = **30%** ✅

**Changed**: `skillCheckChance` from `multiplicative` to `additive`

### 2. Participation Award ✅
**Before**: 25% × 1.25 = 31.25% ❌  
**After**: 25% + 25% = **50%** ✅

**Changed**: `skillCheckChance` from `multiplicative` to `additive`

### 3. Blue Bandana ✓ (Previously Fixed)
**Status**: Already correctly configured as `additive`  
25% - 5% = 20% ✅

## Complete List of Skill Check Chance Trinkets

| Trinket | Effect | Application Type | Working? |
|---------|--------|------------------|----------|
| Blue Bandana | -5% | Additive | ✅ |
| Paint Bucket | +5% | Additive | ✅ |
| Participation Award | +25% | Additive | ✅ |

## Files Modified
- `data/trinkets.json` - Changed Paint Bucket and Participation Award skillCheckChance to additive

## Test Results

✅ **Paint Bucket**: 25% + 5% = 30%  
✅ **Participation Award**: 25% + 25% = 50%  
✅ **Blue Bandana**: 25% - 5% = 20%  

All Skill Check Chance trinkets now correctly use additive bonuses!

## Key Takeaway
Any future trinkets that modify Skill Check Chance must use `"applicationType": "additive"` to avoid the same mistake.
