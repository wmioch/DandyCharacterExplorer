# Trinket Display Fixes

## Issues Fixed

### Issue 1: Trinket Images Not Displaying
**Problem**: Images weren't loading, only showing fallback letter icons.

**Root Cause**: The UI code was looking for images at `assets/images/trinkets/${trinket.id}.png`, but the trinket data didn't have an `id` field initially, and the image paths needed to match the downloaded filenames.

**Solution**:
1. Added `id` field to each trinket (generated from name: "Alarm" → "alarm")
2. Added `image` field with the actual filename (e.g., "trinket_alarm.png")
3. Updated UI code to use `trinket.image` instead of constructing path from ID
4. Changed image path construction to: `assets/images/trinkets/${trinket.image}`

### Issue 2: Filter Makes Trinket List Blank
**Problem**: When selecting any filter option, the trinket list appeared empty.

**Root Cause**: 
1. UI code expected `trinket.effects[0].targetStat` for category filtering
2. New data structure has category stored directly as `trinket.category`
3. Category names didn't match filter dropdown values
4. Missing "Other" option in filter dropdown (27 trinkets are categorized as "other")

**Solution**:
1. Added `filterCategory` field to each trinket with values matching the filter dropdown:
   - `movement_speed` → `movementSpeed`
   - `extraction` → `extractionSpeed`
   - `skill_check` → `skillCheckAmount`
   - `stamina` → `stamina`
   - `stealth` → `stealth`
   - `other` → `other`
2. Updated UI code to use `trinket.filterCategory` for filtering
3. Added "Other" option to the filter dropdown in index.html

## Files Modified

### 1. `data/trinkets.json`
Added to each trinket:
```json
{
  "id": "alarm",
  "image": "trinket_alarm.png",
  "filterCategory": "movementSpeed"
}
```

### 2. `js/ui.js`
**Line 39**: Changed to use `trinket.filterCategory`
```javascript
label.dataset.category = trinket.filterCategory || trinket.category || 'other';
```

**Line 43**: Changed to use plain text effect
```javascript
const effectText = trinket.effect || '';
```

**Line 45**: Changed to use image filename from data
```javascript
const imagePath = `assets/images/trinkets/${trinket.image}`;
```

**Added error handling** (Line 66-68):
```javascript
img.onerror = function() {
    console.warn(`Failed to load image: ${imagePath}`);
};
```

### 3. `index.html`
Added "Other" option to filter dropdown (Line 135):
```html
<option value="other">Other</option>
```

## Testing

To verify the fixes:
1. ✅ Trinket images should now display correctly
2. ✅ Filter dropdown should show options: All Trinkets, Movement Speed, Stealth, Extraction Speed, Stamina, Skill Check, Other
3. ✅ Selecting any filter should show the appropriate trinkets
4. ✅ "Other" category should show 27 miscellaneous trinkets

## Data Summary

Total trinkets: 57

By filter category:
- Movement Speed: 13 trinkets
- Other: 27 trinkets
- Extraction: 7 trinkets
- Skill Check: 5 trinkets
- Stamina: 4 trinkets
- Stealth: 1 trinket

All trinket images are located in: `assets/images/trinkets/`
Image naming format: `trinket_{name}.png` (e.g., `trinket_alarm.png`)

