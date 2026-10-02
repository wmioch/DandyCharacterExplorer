const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const appRoot = path.resolve(process.env.DANDY_APP_ROOT || path.join(__dirname, '../..'));
function loadEngine() {
    const saved = new Map();
    const localStorage = {
        getItem: key => saved.get(key) ?? null,
        setItem: (key, value) => saved.set(key, String(value)),
        removeItem: key => saved.delete(key)
    };
    const context = vm.createContext({
        localStorage,
        console: { log() {}, group() {}, groupEnd() {}, warn() {}, error() {} }
    });
    for (const file of ['js/data-loader.js', 'js/calculator.js']) {
        vm.runInContext(fs.readFileSync(path.join(appRoot, file), 'utf8'), context, { filename: file });
    }
    const engine = vm.runInContext('({ Calculator, DataLoader })', context);
    for (const key of ['toons', 'trinkets', 'items', 'twisteds']) {
        engine.DataLoader.data[key] = JSON.parse(fs.readFileSync(path.join(appRoot, 'data', `${key}.json`), 'utf8'))[key];
    }
    engine.DataLoader.data.statMappings = JSON.parse(fs.readFileSync(path.join(appRoot, 'data/stat-mappings.json'), 'utf8'));
    return { ...engine, localStorage };
}

function scenario(toon, overrides = {}) {
    return {
        selectedToon: toon, equippedTrinkets: [], activeItems: [], activeAbilities: [],
        teamMembers: [], teamSize: 1, skillCheckSuccessRate: 0, machineCompletionCount: 0,
        floorParity: 'odd', panicMode: false, cards: {}, debuffs: {}, customStats: {},
        abilityStacks: {}, ...overrides
    };
}

module.exports = { appRoot, loadEngine, scenario };
