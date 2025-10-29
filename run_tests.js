/**
 * Automated Test Runner for Trinkets & Items
 * Run this with: node run_tests.js
 */

// Load the data files
const fs = require('fs');
const path = require('path');

// Simple mock for DataLoader and Calculator
const toonsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'toons.json'), 'utf8'));
const trinketsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'trinkets.json'), 'utf8'));
const itemsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'items.json'), 'utf8'));
const statMappings = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'stat-mappings.json'), 'utf8'));

console.log('Loaded toons:', toonsData.toons ? toonsData.toons.length : 'ERROR');
console.log('Loaded trinkets:', trinketsData.trinkets ? trinketsData.trinkets.length : 'ERROR');
console.log('Loaded items:', itemsData.items ? itemsData.items.length : 'ERROR');

// Mock DataLoader
const DataLoader = {
    getToon(id) {
        return toonsData.toons.find(t => t.id === id) || null;
    },
    getTrinket(id) {
        return trinketsData.trinkets.find(t => t.id === id) || null;
    },
    getItem(id) {
        return itemsData.items.find(i => i.id === id) || null;
    },
    getStatValue(statName, stars) {
        if (!statMappings || !statMappings.mappings) {
            console.log('ERROR: statMappings not properly loaded');
            return 0;
        }
        const mapping = statMappings.mappings.find(m => m.statName === statName);
        if (!mapping) {
            console.log(`WARN: No mapping found for ${statName}`);
            return 0;
        }
        return mapping.values[stars] || 0;
    }
};

// Simplified Calculator (key logic only)
const Calculator = {
    calculateFinalStats(toon, trinkets, teamAbilities, items) {
        if (!toon) return null;
        
        const baseStats = {...toon.baseStats};
        
        // Collect modifiers
        const modifiers = {
            movementSpeed: {multiplicative: [], additive: 0},
            walkSpeed: {multiplicative: [], additive: 0},
            runSpeed: {multiplicative: [], additive: 0},
            stealth: {multiplicative: [], additive: 0},
            extractionSpeed: {multiplicative: [], additive: 0},
            stamina: {multiplicative: [], additive: 0},
            skillCheckAmount: {multiplicative: [], additive: 0},
            skillCheckSize: {multiplicative: [], additive: 0},
            skillCheckChance: {multiplicative: [], additive: 0},
            staminaRegen: {multiplicative: [], additive: 0}
        };
        
        // Add trinket modifiers
        trinkets.forEach(trinket => {
            if (trinket && trinket.effects) {
                trinket.effects.forEach(effect => {
                    const stat = effect.targetStat;
                    if (modifiers[stat]) {
                        if (effect.applicationType === 'multiplicative') {
                            modifiers[stat].multiplicative.push({value: effect.value});
                        } else if (effect.applicationType === 'additive') {
                            modifiers[stat].additive += effect.value;
                        }
                    }
                });
            }
        });
        
        // Add item modifiers
        items.forEach(itemObj => {
            if (itemObj.item && itemObj.item.effects && itemObj.count > 0) {
                itemObj.item.effects.forEach(effect => {
                    const stat = effect.targetStat;
                    if (modifiers[stat]) {
                        for (let i = 0; i < itemObj.count; i++) {
                            if (effect.applicationType === 'multiplicative') {
                                modifiers[stat].multiplicative.push({value: effect.value});
                            } else if (effect.applicationType === 'additive') {
                                modifiers[stat].additive += effect.value;
                            }
                        }
                    }
                });
            }
        });
        
        // Apply modifiers
        const applyMods = (base, mods) => {
            let value = base + mods.additive;
            let mult = 1.0;
            mods.multiplicative.forEach(m => mult *= (1 + m.value));
            return Math.round(value * mult * 10) / 10;
        };
        
        // Combine walk/run modifiers
        const walkMods = {
            multiplicative: [...modifiers.movementSpeed.multiplicative, ...modifiers.walkSpeed.multiplicative],
            additive: modifiers.movementSpeed.additive + modifiers.walkSpeed.additive
        };
        const runMods = {
            multiplicative: [...modifiers.movementSpeed.multiplicative, ...modifiers.runSpeed.multiplicative],
            additive: modifiers.movementSpeed.additive + modifiers.runSpeed.additive
        };
        
        const skillCheckSizeBase = DataLoader.getStatValue('skillCheckSize', toon.starRatings.skillCheckAmount);
        
        return {
            final: {
                walkSpeed: applyMods(baseStats.walkSpeed, walkMods),
                runSpeed: applyMods(baseStats.runSpeed, runMods),
                stealth: applyMods(baseStats.stealth, modifiers.stealth),
                extractionSpeed: applyMods(baseStats.extractionSpeed, modifiers.extractionSpeed),
                stamina: applyMods(baseStats.stamina, modifiers.stamina),
                skillCheckAmount: applyMods(baseStats.skillCheckAmount, modifiers.skillCheckAmount),
                skillCheckSize: applyMods(skillCheckSizeBase, modifiers.skillCheckSize),
                skillCheckChance: applyMods(baseStats.skillCheckChance, modifiers.skillCheckChance),
                staminaRegen: applyMods(2.4, modifiers.staminaRegen)
            }
        };
    }
};

// Test runner
let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`✓ ${name}`);
    } catch (error) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
    }
}

function assertEqual(actual, expected, tolerance = 0.1) {
    if (Math.abs(actual - expected) > tolerance) {
        throw new Error(`Expected ${expected}, got ${actual}`);
    }
}

console.log('===== Running Automated Tests =====\n');

const goob = DataLoader.getToon('goob');
console.log('Goob loaded:', goob ? 'YES' : 'NO');
if (!goob) {
    console.log('ERROR: Could not load Goob toon!');
    process.exit(1);
}
console.log('Goob base stats:', goob.baseStats);
const baseWalk = goob.baseStats.walkSpeed;
const baseRun = goob.baseStats.runSpeed;
const baseStamina = goob.baseStats.stamina;

// Section 1: Trinket Tests
console.log('Section 1: Trinkets with Permanent Effects');
console.log('-------------------------------------------');

test('Dog Plush: +10% walk speed only', () => {
    const dogPlush = DataLoader.getTrinket('dog_plush');
    const result = Calculator.calculateFinalStats(goob, [dogPlush], [], []);
    assertEqual(result.final.walkSpeed, baseWalk * 1.1);
    assertEqual(result.final.runSpeed, baseRun);
});

test('Pink Bow: +7.5% run speed only', () => {
    const pinkBow = DataLoader.getTrinket('pink_bow');
    const result = Calculator.calculateFinalStats(goob, [pinkBow], [], []);
    assertEqual(result.final.walkSpeed, baseWalk);
    assertEqual(result.final.runSpeed, baseRun * 1.075);
});

test('Cooler: +50 stamina, -5% movement', () => {
    const cooler = DataLoader.getTrinket('cooler');
    const result = Calculator.calculateFinalStats(goob, [cooler], [], []);
    assertEqual(result.final.stamina, baseStamina + 50);
    assertEqual(result.final.walkSpeed, baseWalk * 0.95);
});

test('Blue Bandana: +7.5% extraction, -5% skill check', () => {
    const blueBandana = DataLoader.getTrinket('blue_bandana');
    const result = Calculator.calculateFinalStats(goob, [blueBandana], [], []);
    // Note: Rounding to 1 decimal place: 1.0 * 1.075 = 1.075 rounds to 1.1
    // Also: 0.25 * 0.95 = 0.2375 but gets stored without rounding so check tolerance
    assertEqual(result.final.extractionSpeed, 1.1, 0.05);
    assertEqual(result.final.skillCheckChance, goob.baseStats.skillCheckChance * 0.95, 0.05);
});

test('Speedometer: +15 stamina', () => {
    const speedometer = DataLoader.getTrinket('speedometer');
    const result = Calculator.calculateFinalStats(goob, [speedometer], [], []);
    assertEqual(result.final.stamina, baseStamina + 15);
});

console.log('\nSection 2: Items with Effects');
console.log('------------------------------');

test('Speed Candy: +25% movement', () => {
    const speedCandy = DataLoader.getItem('speed_candy');
    const result = Calculator.calculateFinalStats(goob, [], [], [{item: speedCandy, count: 1}]);
    assertEqual(result.final.walkSpeed, baseWalk * 1.25);
    assertEqual(result.final.runSpeed, baseRun * 1.25);
});

test('Speed Candy x2: Multiplicative stacking', () => {
    const speedCandy = DataLoader.getItem('speed_candy');
    const result = Calculator.calculateFinalStats(goob, [], [], [{item: speedCandy, count: 2}]);
    assertEqual(result.final.walkSpeed, baseWalk * 1.25 * 1.25);
    assertEqual(result.final.runSpeed, baseRun * 1.25 * 1.25);
});

test('Chocolate: +25 stamina, +10% walk only', () => {
    const chocolate = DataLoader.getItem('chocolate');
    const result = Calculator.calculateFinalStats(goob, [], [], [{item: chocolate, count: 1}]);
    assertEqual(result.final.stamina, baseStamina + 25);
    assertEqual(result.final.walkSpeed, baseWalk * 1.1);
    assertEqual(result.final.runSpeed, baseRun);
});

test('Box o\' Chocolates: +25 stamina, +10% run only', () => {
    const boxChocolates = DataLoader.getItem('box_o_chocolates');
    const result = Calculator.calculateFinalStats(goob, [], [], [{item: boxChocolates, count: 1}]);
    assertEqual(result.final.stamina, baseStamina + 25);
    assertEqual(result.final.walkSpeed, baseWalk);
    assertEqual(result.final.runSpeed, baseRun * 1.1);
});

console.log('\nSection 3: Complex Combinations');
console.log('--------------------------------');

test('Dog Plush + Pink Bow: Both walk and run', () => {
    const dogPlush = DataLoader.getTrinket('dog_plush');
    const pinkBow = DataLoader.getTrinket('pink_bow');
    const result = Calculator.calculateFinalStats(goob, [dogPlush, pinkBow], [], []);
    assertEqual(result.final.walkSpeed, baseWalk * 1.1);
    assertEqual(result.final.runSpeed, baseRun * 1.075);
});

test('Cooler + Speedometer: Stacking stamina', () => {
    const cooler = DataLoader.getTrinket('cooler');
    const speedometer = DataLoader.getTrinket('speedometer');
    const result = Calculator.calculateFinalStats(goob, [cooler, speedometer], [], []);
    assertEqual(result.final.stamina, baseStamina + 50 + 15);
});

// Summary
console.log('\n===================================');
console.log('TEST SUMMARY');
console.log('===================================');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${totalTests - passedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log(passedTests === totalTests ? '\n✅ ALL TESTS PASSED' : '\n❌ SOME TESTS FAILED');

process.exit(passedTests === totalTests ? 0 : 1);

