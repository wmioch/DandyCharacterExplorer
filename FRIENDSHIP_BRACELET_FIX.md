# Friendship Bracelet - Team-Based Stamina Bonus

## Issue
Friendship Bracelet wasn't providing any stamina bonus. It should increase base stamina by 5 points for each toon in the team, including the player's toon, with a maximum bonus of 40 stamina.

## Solution
Implemented a **dynamic team-based trinket system** that scales effects based on team composition.

### Data Changes (`data/trinkets.json`)

Added properties to enable dynamic team-based calculations:
```json
{
  "name": "Friendship Bracelet",
  "effect": "Gain 5 more Stamina for every alive Toon in the round. Maxes out at 40 Stamina.",
  "id": "friendship_bracelet",
  "conditional": true,
  "dynamicTeamBased": true,
  "baseStaminaPerToon": 5,
  "maxBonus": 40
}
```

### Calculator Changes (`js/calculator.js`)

Added special handling for `dynamicTeamBased` trinkets before normal effect processing:

```javascript
// Handle dynamic team-based trinkets (e.g., Friendship Bracelet)
if (trinket && trinket.dynamicTeamBased) {
    if (trinket.id === 'friendship_bracelet') {
        // 5 stamina per toon in team (including player), max 40
        const staminaBonus = Math.min(trinket.baseStaminaPerToon * teamSize, trinket.maxBonus);
        modifiers.stamina.additive += staminaBonus;
    }
    return; // Skip normal effect processing
}
```

## How It Works

The bonus scales with **team size** (player + team members):

| Team Size | Members | Bonus | Final Stamina (Goob) |
|-----------|---------|-------|----------------------|
| 1 | Player only | +5 | 180 |
| 2 | Player + 1 | +10 | 185 |
| 3 | Player + 2 | +15 | 190 |
| 4 | Player + 3 | +20 | 195 |
| 5 | Player + 4 | +25 | 200 |
| 6 | Player + 5 | +30 | 205 |
| 7 | Player + 6 | +35 | 210 |
| 8+ | Player + 7+ | +40 | 215 (capped) |

## Test Results

✅ Solo (player only): +5 stamina (180 total)
✅ 1 team member: +10 stamina (185 total)  
✅ 2 team members: +15 stamina (190 total)  
✅ 3 team members: +20 stamina (195 total)  
✅ 4 team members: +25 stamina (200 total)  
✅ 5 team members: +30 stamina (205 total)  
✅ 6 team members: +35 stamina (210 total)  
✅ 7+ team members: +40 stamina (215 total - capped)  

## Dynamic Effects System

This implementation creates a foundation for other trinkets/items that scale with team composition:
- `dynamicTeamBased: true` - Marks trinket as needing team size calculation
- `baseStaminaPerToon: 5` - Base bonus per toon (configurable)
- `maxBonus: 40` - Maximum cap on the bonus

Future dynamic trinkets can follow the same pattern in the calculator.

## Files Modified

1. **data/trinkets.json** - Added dynamic team-based properties to Friendship Bracelet
2. **js/calculator.js** - Added special handler for dynamic team-based trinkets

## Notes

- Friendship Bracelet bonus is **always additive** (never multiplicative)
- The effect scales in real-time as team members are added/removed
- Maximum bonus of 40 prevents stamina from scaling infinitely
- The system is generic and can support other team-based trinkets in the future
