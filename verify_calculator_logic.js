/**
 * Manual verification of calculator logic
 * Run this in Node.js to verify the math is correct
 */

// Simulate the calculator logic
function applyModifiers(baseValue, modifiers) {
    // Apply additive first
    let value = baseValue + modifiers.additive;
    
    // Then apply multiplicative
    let totalMultiplier = 1.0;
    modifiers.multiplicative.forEach(mod => {
        totalMultiplier *= (1 + mod.value);
    });
    
    return value * totalMultiplier;
}

// Test 1: Dog Plush - Walk only
console.log('TEST 1: Dog Plush (+10% walk speed only)');
const baseWalk = 10;
const baseRun = 14;
const walkModifiers = {
    multiplicative: [{value: 0.10}],
    additive: 0
};
const runModifiers = {
    multiplicative: [],
    additive: 0
};
const resultWalk = applyModifiers(baseWalk, walkModifiers);
const resultRun = applyModifiers(baseRun, runModifiers);
console.log(`  Base Walk: ${baseWalk}, Result: ${resultWalk}, Expected: 11.0`);
console.log(`  Base Run: ${baseRun}, Result: ${resultRun}, Expected: 14.0`);
console.log(`  ✓ ${resultWalk === 11.0 && resultRun === 14.0 ? 'PASS' : 'FAIL'}\n`);

// Test 2: Cooler - Additive stamina + multiplicative movement
console.log('TEST 2: Cooler (+50 stamina, -5% movement)');
const baseStamina = 100;
const baseMovement = 10;
const staminaModifiers = {
    multiplicative: [],
    additive: 50
};
const movementModifiers = {
    multiplicative: [{value: -0.05}],
    additive: 0
};
const resultStamina = applyModifiers(baseStamina, staminaModifiers);
const resultMovement = applyModifiers(baseMovement, movementModifiers);
console.log(`  Base Stamina: ${baseStamina}, Result: ${resultStamina}, Expected: 150`);
console.log(`  Base Movement: ${baseMovement}, Result: ${resultMovement}, Expected: 9.5`);
console.log(`  ✓ ${resultStamina === 150 && resultMovement === 9.5 ? 'PASS' : 'FAIL'}\n`);

// Test 3: Multiple Speed Candies - Multiplicative stacking
console.log('TEST 3: Speed Candy x2 (multiplicative stacking)');
const multiModifiers = {
    multiplicative: [{value: 0.25}, {value: 0.25}],
    additive: 0
};
const resultMulti = applyModifiers(10, multiModifiers);
console.log(`  Base: 10, Result: ${resultMulti.toFixed(2)}, Expected: 15.63`);
console.log(`  ✓ ${Math.abs(resultMulti - 15.625) < 0.01 ? 'PASS' : 'FAIL'}\n`);

// Test 4: Blue Bandana - Two effects
console.log('TEST 4: Blue Bandana (+7.5% extraction, -5% skill check)');
const baseExtraction = 10;
const baseSkillCheck = 0.15;
const extractionMods = {
    multiplicative: [{value: 0.075}],
    additive: 0
};
const skillCheckMods = {
    multiplicative: [{value: -0.05}],
    additive: 0
};
const resultExtraction = applyModifiers(baseExtraction, extractionMods);
const resultSkillCheck = applyModifiers(baseSkillCheck, skillCheckMods);
console.log(`  Base Extraction: ${baseExtraction}, Result: ${resultExtraction.toFixed(2)}, Expected: 10.75`);
console.log(`  Base Skill Check: ${baseSkillCheck}, Result: ${resultSkillCheck.toFixed(4)}, Expected: 0.1425`);
console.log(`  ✓ ${Math.abs(resultExtraction - 10.75) < 0.01 && Math.abs(resultSkillCheck - 0.1425) < 0.0001 ? 'PASS' : 'FAIL'}\n`);

// Test 5: Thinking Cap - Additive skill check size
console.log('TEST 5: Thinking Cap (+40 skill check size)');
const baseSkillSize = 100;
const skillSizeMods = {
    multiplicative: [],
    additive: 40
};
const resultSkillSize = applyModifiers(baseSkillSize, skillSizeMods);
console.log(`  Base: ${baseSkillSize}, Result: ${resultSkillSize}, Expected: 140`);
console.log(`  ✓ ${resultSkillSize === 140 ? 'PASS' : 'FAIL'}\n`);

// Test 6: Chocolate - Mixed additive and multiplicative
console.log('TEST 6: Chocolate (+25 stamina, +10% walk speed)');
const chocolateStaminaMods = {
    multiplicative: [],
    additive: 25
};
const chocolateWalkMods = {
    multiplicative: [{value: 0.10}],
    additive: 0
};
const resultChocolateStamina = applyModifiers(100, chocolateStaminaMods);
const resultChocolateWalk = applyModifiers(10, chocolateWalkMods);
console.log(`  Base Stamina: 100, Result: ${resultChocolateStamina}, Expected: 125`);
console.log(`  Base Walk: 10, Result: ${resultChocolateWalk}, Expected: 11.0`);
console.log(`  ✓ ${resultChocolateStamina === 125 && resultChocolateWalk === 11.0 ? 'PASS' : 'FAIL'}\n`);

console.log('=====================================');
console.log('All calculator logic tests completed!');
console.log('=====================================');

