const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine, scenario } = require('./helpers/engine.cjs');

const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);
function stats(engine, state) {
    return engine.Calculator.calculateFinalStats(state.selectedToon, state.equippedTrinkets, state.activeAbilities,
        state.activeItems, state.selectedConditionalStat, state.teamSize, state.machineCompletionCount, state).final;
}

test('Advanced BASE edits precede ordinary trinket multipliers', () => {
    const e = loadEngine();
    close(stats(e, scenario(e.DataLoader.getToon('poppy'), {
        customStats: { walkSpeed: 18 }, equippedTrinkets: [e.DataLoader.getTrinket('dog_plush')]
    })).walkSpeed, 19.8);
});

test('Looey healing requires changing the selected heart scenario; maximum health remains three', () => {
    const e = loadEngine(), toon = e.DataLoader.getToon('looey');
    const state = scenario(toon, { selectedConditionalStat: toon.conditionalStats.find(x => x.id === 'looey_1heart') });
    close(stats(e, state).walkSpeed, 21);
    state.activeItems = [{ item: e.DataLoader.getItem('bandage'), count: 1 }];
    close(stats(e, state).walkSpeed, 21);
    state.selectedConditionalStat = toon.conditionalStats.find(x => x.id === 'looey_3hearts');
    close(stats(e, state).walkSpeed, 15);
    assert.equal(stats(e, state).hearts, 3);
});

test('Tech Savvy removes five work units at both normal and doubled extraction', () => {
    const e = loadEngine();
    for (const extractionSpeed of [1, 2]) {
        const state = scenario(e.DataLoader.getToon('poppy'), { customStats: { extractionSpeed } });
        close(e.Calculator.calculateMachineStatsFromState(state).default.defaultTime, 45 / extractionSpeed);
        state.cards.techSavvy = true;
        close(e.Calculator.calculateMachineStatsFromState(state).default.defaultTime, 40 / extractionSpeed);
    }
});

test('Item buffs do not simulate pickups for Whispering Flower', () => {
    const e = loadEngine();
    const state = scenario(e.DataLoader.getToon('poppy'), {
        // Explicit held inventory; the equivalent tile count supports older production snapshots.
        equippedTrinkets: [{ trinket: e.DataLoader.getTrinket('whispering_flower'), count: 2 }],
        heldItemCount: 2
    });
    close(stats(e, state).staminaRegen, 3.12);
    state.activeItems = [{ item: e.DataLoader.getItem('speed_candy'), count: 3 }];
    close(stats(e, state).staminaRegen, 3.12);
});

test('Flower uses held inventory once, ignores legacy tile copies and preserves it in machine snapshots', () => {
    const e = loadEngine();
    const state = scenario(e.DataLoader.getToon('boxten'), {
        equippedTrinkets: [{ trinket: e.DataLoader.getTrinket('whispering_flower'), count: 25 }]
    });
    for (const [heldItemCount, expected] of [[0, 2.4], [1, 2.76], [3, 3.48]]) {
        state.heldItemCount = heldItemCount;
        close(stats(e, state).staminaRegen, expected);
        const clone = e.Calculator._cloneCalculationState(state);
        assert.equal(clone.heldItemCount, heldItemCount);
        close(e.Calculator.calculateStatsFromState(clone).final.staminaRegen, expected);
    }
    state.equippedTrinkets = [];
    close(stats(e, state).staminaRegen, 2.4);
});

test('Flower permits Bassie four held items, caps other Toons at three and rejects fractional snapshots', () => {
    const e = loadEngine();
    const state = scenario(e.DataLoader.getToon('bassie'), {
        equippedTrinkets: [e.DataLoader.getTrinket('whispering_flower')], heldItemCount: 4
    });
    close(stats(e, state).staminaRegen, 3.84);
    state.selectedToon = e.DataLoader.getToon('boxten');
    close(stats(e, state).staminaRegen, 3.48);
    for (const heldItemCount of [-1, 1.5, Infinity]) {
        state.heldItemCount = heldItemCount;
        close(stats(e, state).staminaRegen, 2.4);
    }
});

test('Waxwell fatigue and Stamina Candy remain separate from the Flower inventory snapshot', () => {
    const e = loadEngine(), toon = e.DataLoader.getToon('waxwell');
    const state = scenario(toon, { equippedTrinkets: [e.DataLoader.getTrinket('whispering_flower')], heldItemCount: 3 });
    close(stats(e, state).staminaRegen, 1.74);
    e.localStorage.setItem(`ability-${toon.ability.id}-state`, 'true');
    close(stats(e, state).staminaRegen, 3.48);
    state.activeItems = [{ item: e.DataLoader.getItem('stamina_candy'), count: 1 }];
    close(stats(e, state).staminaRegen, 5.22);
    assert.equal(state.heldItemCount, 3);
});

test('Zero Great Rate survives machine snapshots and earns no Stress Ball stacks', () => {
    const e = loadEngine();
    const state = scenario(e.DataLoader.getToon('poppy'), { equippedTrinkets: [e.DataLoader.getTrinket('stress_ball')] });
    assert.equal(e.Calculator._cloneCalculationState(state).skillCheckSuccessRate, 0);
    const machine = e.Calculator.calculateMachineStatsFromState(state);
    assert.equal(machine.default.expectedSuccessfulChecks, 0);
    assert.equal(machine.maxStressBallStacks, 0);
});

test('Train Whistle blocks selected Slow while other debuffs still apply', () => {
    const e = loadEngine();
    const state = scenario(e.DataLoader.getToon('poppy'), {
        equippedTrinkets: [e.DataLoader.getTrinket('train_whistle')], debuffs: { slow: 2, confused: 1 }
    });
    close(stats(e, state).walkSpeed, 15);
    close(stats(e, state).extractionSpeed, 0.75);
    state.equippedTrinkets = [];
    close(stats(e, state).walkSpeed, 11.25);
});

test('Multiple selected Bobette auras apply once', () => {
    const e = loadEngine(), bobette = e.DataLoader.getToon('bobette');
    const aura = [bobette.ability, bobette.ability2].find(x => x?.id === 'bobette_festive_aura');
    assert.ok(aura);
    const state = scenario(e.DataLoader.getToon('poppy'), { activeAbilities: [aura] });
    const once = stats(e, state);
    state.activeAbilities.push(aura);
    close(stats(e, state).walkSpeed, once.walkSpeed);
    close(stats(e, state).staminaRegen, once.staminaRegen);
});

test('Waxwell Ignite removes intrinsic Tired II without adding a timer', () => {
    const e = loadEngine(), toon = e.DataLoader.getToon('waxwell'), state = scenario(toon);
    close(stats(e, state).staminaRegen, 1.2);
    e.localStorage.setItem(`ability-${toon.ability.id}-state`, 'true');
    close(stats(e, state).staminaRegen, 2.4);
});
