# Item Grid Testing Guide

## How to Test

1. **Start the server:**
   ```
   cd d:\Projects\DandyCharacterExplorer
   python -m http.server 8000
   ```

2. **Open browser:**
   Navigate to `http://localhost:8000`

3. **Select a toon:**
   Click on any toon in the grid (e.g., Boxten)

## Test Cases

### Test 1: Basic Item Selection
1. Scroll down to the "Active Items" section
2. **Left-click on "BonBon" image**
   - ✅ Border should turn yellow with glow
   - ✅ "x1" overlay should appear at bottom-right
   - ✅ Stats should update with +50% Extraction Speed and +25% Movement Speed

### Test 2: Multiple Applications
1. **Left-click "BonBon" again**
   - ✅ Overlay changes to "x2"
   - ✅ Stats double (100% extraction, 50% movement)
2. **Left-click several more times**
   - ✅ Counter increments: "x3", "x4", etc.
   - ✅ Stops at "x10" (maximum)

### Test 3: Decrementing
1. With an item at "x3", **right-click the item**
   - ✅ Counter changes to "x2"
   - ✅ Stats update accordingly
2. **Right-click again** → "x1"
3. **Right-click once more**
   - ✅ Overlay disappears
   - ✅ Border returns to gray
   - ✅ Stats return to normal

### Test 4: Multiple Items
1. **Left-click "BonBon"** → "x1"
2. **Left-click "Speed Candy"** → "x1"
3. **Left-click "Chocolate"** → "x1"
   - ✅ All three items show selected state
   - ✅ All three show independent counters
   - ✅ Stats combine all effects

### Test 5: Context Menu Prevention
1. **Right-click any item image**
   - ✅ No browser context menu appears
   - ✅ Item count decrements instead

### Test 6: Grid Layout
1. Resize window to different widths
   - ✅ Grid adapts responsively
   - ✅ Items maintain square aspect ratio
2. Check scroll behavior
   - ✅ Scrollbar appears if items exceed max height (300px)

### Test 7: Visual States
1. **Hover over an unselected item**
   - ✅ Image scales up slightly
   - ✅ Border color changes
2. **Hover over a selected item**
   - ✅ Scale effect still works
   - ✅ Yellow border and overlay remain visible

### Test 8: Sorting
1. Check that items appear alphabetically:
   - ✅ BonBon, Box o' Chocolates, Chocolate, Eject Button, etc.

## Expected Visual Appearance

### Grid Layout:
```
[Bonbon] [Box o'...] [Chocolate] [Eject...]
[Extract...] [Instr...] [Pop] [Protein...]
[Skill...] [Speed...] [Stamina...] [Stealth...]
[Stopw...]
```

### Selected Item Example:
```
┌─────────────┐
│             │
│   [IMAGE]   │  ← Yellow glowing border
│             │
│    [x3]     │  ← Counter overlay (bottom-right)
└─────────────┘
```

### Unselected Item:
```
┌─────────────┐
│             │
│   [IMAGE]   │  ← Gray border
│             │
│             │  ← No overlay
└─────────────┘
```

## Visual Consistency

The item grid should match the visual style of:
- **Toon Grid** - Same hover effects and selection style
- **Trinket Grid** - Same size (50x50px) and layout
- Uses consistent color scheme (yellow = accent-color)

## Notes

- Items like "Bandage", "Health Kit", "Smoke Bomb", etc. are hidden (don't affect stats)
- Only 14 items visible (those that modify stats)
- Max 10 of any single item can be applied
- Right-click context menu is disabled for the items area

