/**
 * Browser Console Test for Trinket & Item Effects
 * Open the application in a browser, then paste this into the console
 */

console.log('===== TRINKET & ITEM EFFECTS TEST =====\n');

// Wait for data to load
setTimeout(() => {
    try {
        // Test 1: Dog Plush (walk only)
        console.log('TEST 1: Dog Plush (+10% walk speed only)');
        const goob = DataLoader.getToon('goob');
        const dogPlush = DataLoader.getTrinket('dog_plush');
        console.log('Dog Plush data:', dogPlush);
        const result1 = Calculator.calculateFinalStats(goob, [dogPlush], [], []);
        console.log(`Base Walk: ${goob.baseStats.walkSpeed}, Final: ${result1.final.walkSpeed}, Expected: ${goob.baseStats.walkSpeed * 1.1}`);
        console.log(`Base Run: ${goob.baseStats.runSpeed}, Final: ${result1.final.runSpeed}, Expected: ${goob.baseStats.runSpeed}`);
        console.log(result1.final.walkSpeed === goob.baseStats.walkSpeed * 1.1 && result1.final.runSpeed === goob.baseStats.runSpeed ? '✓ PASS' : '✗ FAIL');
        console.log('');

        // Test 2: Pink Bow (run only)
        console.log('TEST 2: Pink Bow (+7.5% run speed only)');
        const pinkBow = DataLoader.getTrinket('pink_bow');
        console.log('Pink Bow data:', pinkBow);
        const result2 = Calculator.calculateFinalStats(goob, [pinkBow], [], []);
        const expectedRun = goob.baseStats.runSpeed * 1.075;
        console.log(`Base Walk: ${goob.baseStats.walkSpeed}, Final: ${result2.final.walkSpeed}, Expected: ${goob.baseStats.walkSpeed}`);
        console.log(`Base Run: ${goob.baseStats.runSpeed}, Final: ${result2.final.runSpeed}, Expected: ${expectedRun.toFixed(2)}`);
        console.log(result2.final.walkSpeed === goob.baseStats.walkSpeed && Math.abs(result2.final.runSpeed - expectedRun) < 0.1 ? '✓ PASS' : '✗ FAIL');
        console.log('');

        // Test 3: Cooler (additive stamina, multiplicative movement)
        console.log('TEST 3: Cooler (+50 stamina, -5% movement)');
        const cooler = DataLoader.getTrinket('cooler');
        console.log('Cooler data:', cooler);
        const result3 = Calculator.calculateFinalStats(goob, [cooler], [], []);
        const expectedStamina = goob.baseStats.stamina + 50;
        const expectedWalk = goob.baseStats.walkSpeed * 0.95;
        console.log(`Base Stamina: ${goob.baseStats.stamina}, Final: ${result3.final.stamina}, Expected: ${expectedStamina}`);
        console.log(`Base Walk: ${goob.baseStats.walkSpeed}, Final: ${result3.final.walkSpeed}, Expected: ${expectedWalk.toFixed(2)}`);
        console.log(result3.final.stamina === expectedStamina && Math.abs(result3.final.walkSpeed - expectedWalk) < 0.1 ? '✓ PASS' : '✗ FAIL');
        console.log('');

        // Test 4: Blue Bandana (two effects)
        console.log('TEST 4: Blue Bandana (+7.5% extraction, -5% skill check chance)');
        const blueBandana = DataLoader.getTrinket('blue_bandana');
        console.log('Blue Bandana data:', blueBandana);
        const result4 = Calculator.calculateFinalStats(goob, [blueBandana], [], []);
        const expectedExtraction = goob.baseStats.extractionSpeed * 1.075;
        const expectedSkillCheck = goob.baseStats.skillCheckChance * 0.95;
        console.log(`Base Extraction: ${goob.baseStats.extractionSpeed}, Final: ${result4.final.extractionSpeed}, Expected: ${expectedExtraction.toFixed(3)}`);
        console.log(`Base Skill Check: ${goob.baseStats.skillCheckChance}, Final: ${result4.final.skillCheckChance}, Expected: ${expectedSkillCheck.toFixed(4)}`);
        console.log(Math.abs(result4.final.extractionSpeed - expectedExtraction) < 0.01 && Math.abs(result4.final.skillCheckChance - expectedSkillCheck) < 0.001 ? '✓ PASS' : '✗ FAIL');
        console.log('');

        // Test 5: Speed Candy x2
        console.log('TEST 5: Speed Candy x2 (multiplicative stacking)');
        const speedCandy = DataLoader.getItem('speed_candy');
        console.log('Speed Candy data:', speedCandy);
        const result5 = Calculator.calculateFinalStats(goob, [], [], [{item: speedCandy, count: 2}]);
        const expectedWalk2 = goob.baseStats.walkSpeed * 1.25 * 1.25;
        const expectedRun2 = goob.baseStats.runSpeed * 1.25 * 1.25;
        console.log(`Base Walk: ${goob.baseStats.walkSpeed}, Final: ${result5.final.walkSpeed}, Expected: ${expectedWalk2.toFixed(2)}`);
        console.log(`Base Run: ${goob.baseStats.runSpeed}, Final: ${result5.final.runSpeed}, Expected: ${expectedRun2.toFixed(2)}`);
        console.log(Math.abs(result5.final.walkSpeed - expectedWalk2) < 0.1 && Math.abs(result5.final.runSpeed - expectedRun2) < 0.1 ? '✓ PASS' : '✗ FAIL');
        console.log('');

        // Test 6: Chocolate (mixed effects)
        console.log('TEST 6: Chocolate (+25 stamina, +10% walk speed)');
        const chocolate = DataLoader.getItem('chocolate');
        console.log('Chocolate data:', chocolate);
        const result6 = Calculator.calculateFinalStats(goob, [], [], [{item: chocolate, count: 1}]);
        const expectedStamina2 = goob.baseStats.stamina + 25;
        const expectedWalk3 = goob.baseStats.walkSpeed * 1.1;
        console.log(`Base Stamina: ${goob.baseStats.stamina}, Final: ${result6.final.stamina}, Expected: ${expectedStamina2}`);
        console.log(`Base Walk: ${goob.baseStats.walkSpeed}, Final: ${result6.final.walkSpeed}, Expected: ${expectedWalk3.toFixed(2)}`);
        console.log(result6.final.stamina === expectedStamina2 && Math.abs(result6.final.walkSpeed - expectedWalk3) < 0.1 ? '✓ PASS' : '✗ FAIL');
        console.log('');

        // Test 7: Thinking Cap (additive skill check size)
        console.log('TEST 7: Thinking Cap (+40 skill check size)');
        const thinkingCap = DataLoader.getTrinket('thinking_cap');
        console.log('Thinking Cap data:', thinkingCap);
        const result7 = Calculator.calculateFinalStats(goob, [thinkingCap], [], []);
        const baseSkillSize = DataLoader.getStatValue('skillCheckSize', goob.starRatings.skillCheckAmount);
        const expectedSkillSize = baseSkillSize + 40;
        console.log(`Base Skill Check Size: ${baseSkillSize}, Final: ${result7.final.skillCheckSize}, Expected: ${expectedSkillSize}`);
        console.log(Math.abs(result7.final.skillCheckSize - expectedSkillSize) < 0.1 ? '✓ PASS' : '✗ FAIL');
        console.log('');

        console.log('===== ALL TESTS COMPLETED =====');
    } catch (error) {
        console.error('Test error:', error);
    }
}, 1000);

