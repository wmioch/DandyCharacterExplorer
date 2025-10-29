# Conditional Trinkets Fix

## Issue Reported
**Alarm** trinket was marked as conditional (only activates during Panic Mode) but had no effects array, so it showed no stat changes when selected.

## Root Cause
I had marked several trinkets as `"conditional": true` because they only activate under certain gameplay conditions (panic mode, specific floors, etc.). However, I didn't include their effects arrays, which meant users couldn't see what the stat boost would be.

## Solution
Added effects arrays to conditional trinkets that have **quantifiable stat bonuses**, so users can see the effect even though it's conditional:

### Trinkets Fixed

1. **Alarm** 
   - Effect: +25% movement speed during Panic Mode
   - Now shows: +25% walk and run speed
   - Status: ✅ **FIXED**

2. **Pull Toy**
   - Effect: +25% movement speed when new floor arrives
   - Now shows: +25% walk and run speed
   - Status: ✅ **FIXED**

3. **Clown Horn**
   - Effect: +10% movement speed on odd floors
   - Now shows: +10% walk and run speed
   - Status: ✅ **FIXED**

4. **Ribbon Spool**
   - Effect: +10% movement speed on even floors
   - Now shows: +10% walk and run speed
   - Status: ✅ **FIXED**

5. **Vanity Mirror**
   - Effect: +30% run speed during Panic Mode
   - Now shows: +30% run speed only
   - Status: ✅ **FIXED**

## Testing
Verified with automated tests:
- ✅ Alarm now has effects array with correct values
- ✅ Alarm applies +25% to both walk speed (17.5 → 21.9) and run speed (27.5 → 34.4)
- ✅ All 5 conditional trinkets with stat bonuses now have effects arrays

## Note on Conditional Trinkets
These trinkets are still marked as `"conditional": true` to indicate they only activate under certain conditions in the actual game. However, the stat calculator will now show what the effect *would be* when active, which is useful for planning builds.

## Other Conditional Trinkets
Trinkets that DON'T have quantifiable stat changes (like highlighting items, special mechanics, etc.) remain without effects arrays, which is correct:
- Bone Needle and Thread (highlights pumpkins)
- Cardboard Armor (blocks ranged attacks)
- Savory Charm (saves from fatal attack)
- etc.

These cannot be represented as stat modifiers.

