# Manual Verification Checklist for Trinkets & Items

## ✅ Completed Automatically

1. **Data Structure Verification**
   - ✅ All 57 trinkets reviewed
   - ✅ All 27 items reviewed
   - ✅ Effects arrays added to 18 trinkets with permanent effects
   - ✅ Effects arrays added/updated for 13 items
   - ✅ All descriptions verified against effects

2. **Calculator Logic Verification**
   - ✅ Walk-only modifiers implemented (Dog Plush, Chocolate)
   - ✅ Run-only modifiers implemented (Pink Bow, Box o' Chocolates)
   - ✅ Additive effects implemented (Cooler, Speedometer, Thinking Cap, Magnifying Glass)
   - ✅ Mixed effects implemented (Blue Bandana, Coal, etc.)
   - ✅ Math verified with Node.js test (all 6 tests passed)

3. **Code Flow Verification**
   - ✅ UI trinket selection adds to state.equippedTrinkets
   - ✅ UI item selection adds to state.activeItems with counts
   - ✅ updateDisplay() calls getCalculatedStats()
   - ✅ getCalculatedStats() passes trinkets/items to Calculator
   - ✅ Calculator processes effects arrays correctly
   - ✅ No linter errors

4. **Server Verification**
   - ✅ HTTP server running on localhost:8000
   - ✅ Application accessible and loading

## ⚠️ Requires Manual Browser Testing

To complete the verification, **open the application in a browser** and test these scenarios:

### Test Scenario 1: Dog Plush (Walk-Only)
1. Open http://localhost:8000
2. Select **Goob** (Walk: 10, Run: 14)
3. Click **Dog Plush** in trinkets
4. Verify: Walk speed shows **11.0** (+10%), Run speed stays **14.0**

### Test Scenario 2: Pink Bow (Run-Only)
1. With Goob selected
2. Click **Pink Bow** in trinkets
3. Verify: Walk speed stays **10.0**, Run speed shows **15.05** (+7.5%)

### Test Scenario 3: Both Walk and Run
1. With Goob selected
2. Equip both **Dog Plush** AND **Pink Bow**
3. Verify: Walk speed shows **11.0**, Run speed shows **15.05**

### Test Scenario 4: Cooler (Additive + Multiplicative)
1. Select **Shrimpo** (Stamina: 100)
2. Click **Cooler** in trinkets
3. Verify: Stamina shows **150** (+50), Movement speeds reduced by ~5%

### Test Scenario 5: Blue Bandana (Two Effects)
1. Select any toon
2. Click **Blue Bandana** in trinkets
3. Verify: Extraction Speed increases by +7.5%, Skill Check Chance decreases by -5%

### Test Scenario 6: Speedometer (Additive Stamina)
1. Select any toon
2. Click **Speedometer** in trinkets
3. Verify: Stamina increases by +15

### Test Scenario 7: Multiple Speed Candies
1. Select any toon
2. Click **Speed Candy** multiple times (left-click to add)
3. With 2x Speed Candy, verify: Movement speed increases by +56.25% (not +50%)
4. This confirms multiplicative stacking (1.25 × 1.25 = 1.5625)

### Test Scenario 8: Chocolate (Mixed Effects)
1. Select any toon
2. Click **Chocolate** once in items
3. Verify: Stamina increases by +25 AND walk speed increases by +10%

### Test Scenario 9: Box o' Chocolates (Run-Only)
1. Select any toon
2. Click **Box o' Chocolates** once in items
3. Verify: Stamina increases by +25 AND run speed increases by +10% (walk unchanged)

### Test Scenario 10: Thinking Cap (Additive Skill Check)
1. Select any toon
2. Click **Thinking Cap** in trinkets
3. Verify: Skill Check Size increases by +40 (additive, not multiplicative)

## Browser Console Test

Alternatively, you can run the automated browser console test:

1. Open http://localhost:8000 in a browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Copy and paste the contents of `browser_console_test.js`
5. Press Enter
6. Verify all tests show "✓ PASS"

## Expected Results

All manual tests should show:
- ✓ Stats update immediately when trinkets/items are selected
- ✓ Walk-only modifiers only affect walk speed
- ✓ Run-only modifiers only affect run speed
- ✓ Additive effects add flat amounts
- ✓ Multiplicative effects apply percentages
- ✓ Multiple items stack multiplicatively
- ✓ Trinkets with multiple effects apply all effects

## If Tests Fail

If any test fails, check:
1. Browser console for JavaScript errors
2. Network tab to ensure JSON files loaded correctly
3. Data files (trinkets.json, items.json) contain effects arrays
4. Calculator.js has walk/run-specific logic
5. Clear browser cache and reload

## Files to Verify

1. `data/trinkets.json` - Contains effects arrays
2. `data/items.json` - Contains effects arrays
3. `js/calculator.js` - Contains walk/run logic and additive support
4. Browser console - No JavaScript errors

## Completion Criteria

✅ Task is complete when:
1. All automatic verifications passed (already done)
2. Manual browser tests confirm stats update correctly
3. Console test shows all PASS results

OR the user confirms they have tested and everything works correctly.

