/** Local-only definitions authored by the user. No requests or shared storage. */
const CustomContent = {
    storageKey: 'dandy-custom-content:v1',
    types: ['toons', 'trinkets', 'buffs', 'twisteds'],
    current: { toons: [], trinkets: [], buffs: [], twisteds: [] },
    definitions: { toons: [], trinkets: [], buffs: [], twisteds: [] },
    editingId: null,
    invalidCount: 0,
    storageUnreadable: false,
    statTargets: ['movementSpeed', 'walkSpeed', 'runSpeed', 'stealth', 'extractionSpeed', 'stamina', 'skillCheckAmount', 'skillCheckSize', 'skillCheckChance', 'staminaRegen'],
    baseKeys: ['walkSpeed', 'runSpeed', 'stealth', 'extractionSpeed', 'stamina', 'skillCheckAmount', 'skillCheckChance', 'hearts'],
    starKeys: ['walkSpeed', 'runSpeed', 'stealth', 'extractionSpeed', 'stamina', 'skillCheckAmount'],

    template(type) {
        if (type === 'toons') return {
            name: 'My Toon', description: 'A custom Toon for local exploration.',
            baseStats: { walkSpeed: 15, runSpeed: 25, stealth: 10, extractionSpeed: 1, stamina: 150, skillCheckAmount: 2, skillCheckChance: 0.25, hearts: 3 },
            starRatings: { walkSpeed: 3, runSpeed: 3, stealth: 3, extractionSpeed: 3, stamina: 3, skillCheckAmount: 3 },
            ability: { name: 'My Ability', description: 'Increases Movement Speed by 10%.', targetStat: 'movementSpeed', value: 0.1, activation: 'active' }
        };
        if (type === 'trinkets') return {
            name: 'My Trinket', effect: 'Increases Movement Speed by 10%.', category: 'speed', stackable: false,
            effects: [{ targetStat: 'movementSpeed', value: 0.1, applicationType: 'multiplicative' }]
        };
        if (type === 'buffs') return { name: 'My Buff', targetStat: 'movementSpeed', value: 0.1 };
        return { name: 'Twisted My Creation', speeds: {
            normal: { walk: 10, run: 20 }, panic: { walk: 12, run: 24 }, panicSuppressed: { walk: 11.5, run: 23 }
        } };
    },

    text(value, label, max = 160) {
        if (typeof value !== 'string' || !value.trim() || value.length > max || /[<>]/.test(value)) {
            throw new Error(`${label} must be nonempty, at most ${max} characters, and contain no angle brackets.`);
        }
        return value.trim();
    },
    number(value, label, min, max, integer = false) {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
            throw new Error(`${label} must be ${integer ? 'an integer' : 'a number'} from ${min} to ${max}.`);
        }
        return value;
    },
    modifier(value, label, allowedTypes = ['multiplicative', 'additive', 'baseStatIncrease']) {
        if (!value || typeof value !== 'object' || !this.statTargets.includes(value.targetStat) || !allowedTypes.includes(value.applicationType)) {
            throw new Error(`${label} needs a supported targetStat and applicationType.`);
        }
        if (value.applicationType === 'baseStatIncrease' && ![...this.baseKeys, 'skillCheckSize'].includes(value.targetStat)) {
            throw new Error(`${label}: baseStatIncrease is unsupported for ${value.targetStat}.`);
        }
        return {
            targetStat: value.targetStat,
            value: this.number(value.value, `${label} value`, value.applicationType === 'multiplicative' ? -0.95 : (value.targetStat === 'stealth' ? -1000 : 0), value.applicationType === 'multiplicative' ? 10 : 1000),
            applicationType: value.applicationType
        };
    },
    toonAbility(value, id, index) {
        if (value == null) return null;
        if (!['movementSpeed', 'extractionSpeed', 'skillCheckChance', 'staminaRegen'].includes(value.targetStat) || !['active', 'passive'].includes(value.activation)) {
            throw new Error('Toon abilities need a supported targetStat and active/passive activation.');
        }
        const effect = this.modifier({ targetStat: value.targetStat, value: value.value, applicationType: 'multiplicative' }, 'Toon ability', ['multiplicative']);
        return {
            id: `${id}_ability${index}`, name: this.text(value.name, 'Ability name', 60),
            description: `(${value.activation === 'active' ? 'Active' : 'Passive'}) ${this.text(value.description, 'Ability description', 300)}`,
            effectType: 'self', targetStat: effect.targetStat, value: effect.value,
            applicationType: 'multiplicative', affectsSelf: true, stackable: false,
            hasToggle: value.activation === 'active',
            playerEffect: { [effect.targetStat]: effect.value, applicationType: 'multiplicative' }
        };
    },
    normalize(type, input, id) {
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Definition must be a JSON object.');
        const name = this.text(input.name, 'Name', 60);
        if (type === 'toons') {
            const baseStats = {}, starRatings = {};
            for (const key of this.baseKeys) {
                const minimum = ['hearts', 'stamina'].includes(key) ? 1 : (['walkSpeed', 'runSpeed', 'extractionSpeed'].includes(key) ? 0.01 : (key === 'stealth' ? -10000 : 0));
                const maximum = key === 'skillCheckChance' ? 1 : (key === 'hearts' ? 99 : 10000);
                baseStats[key] = this.number(input.baseStats?.[key], `baseStats.${key}`, minimum, maximum, key === 'hearts');
            }
            for (const key of this.starKeys) starRatings[key] = this.number(input.starRatings?.[key], `starRatings.${key}`, 1, 5, true);
            return { id, name, description: this.text(input.description, 'Description', 300), baseStats, starRatings,
                ability: this.toonAbility(input.ability, id, 1), ability2: this.toonAbility(input.ability2, id, 2), conditionalStats: null, custom: true };
        }
        if (type === 'trinkets') {
            if (!Array.isArray(input.effects) || input.effects.length < 1 || input.effects.length > 3) throw new Error('A Trinket needs 1–3 effects.');
            const category = ['speed', 'stealth', 'machineStats', 'stamina', 'other'].includes(input.category) ? input.category : 'other';
            return { id, name, effect: this.text(input.effect, 'Effect description', 300), category,
                filterCategory: category, rarity: 'custom', stackable: input.stackable === true,
                effects: input.effects.map((effect, index) => this.modifier(effect, `Effect ${index + 1}`)), custom: true };
        }
        if (type === 'buffs') {
            const effect = this.modifier({ targetStat: input.targetStat, value: input.value, applicationType: 'multiplicative' }, 'Buff', ['multiplicative']);
            return { id, name, ...effect, custom: true };
        }
        if (type === 'twisteds') {
            const speeds = {};
            for (const state of ['normal', 'panic', 'panicSuppressed']) {
                speeds[state] = {};
                for (const key of ['walk', 'run']) speeds[state][key] = this.number(input.speeds?.[state]?.[key], `${state}.${key}`, 0, 1000);
            }
            return { id, name, rarity: 'Custom', speeds, custom: true };
        }
        throw new Error('Unknown content type.');
    },

    read() {
        let saved;
        this.storageUnreadable = false;
        try { saved = JSON.parse(localStorage.getItem(this.storageKey) || '{}'); }
        catch { saved = {}; this.storageUnreadable = true; }
        if (!saved || typeof saved !== 'object' || Array.isArray(saved)) { saved = {}; this.storageUnreadable = true; }
        this.invalidCount = 0;
        for (const type of this.types) {
            this.definitions[type] = Array.isArray(saved[type]) ? saved[type] : [];
            this.current[type] = [];
            for (const entry of this.definitions[type]) {
                try {
                    if (!/^custom_(toon|trinket|buff|twisted)_[a-f0-9]{12}$/.test(entry?.id)) throw new Error('Invalid custom ID.');
                    const record = this.normalize(type, entry.input, entry.id);
                    this.current[type].push(record);
                } catch (error) { this.invalidCount++; console.warn(`Ignored invalid local ${type} definition:`, error); }
            }
        }
    },
    apply(data) {
        this.read();
        data.toons.push(...this.current.toons);
        data.trinkets.push(...this.current.trinkets);
        data.twisteds.push(...this.current.twisteds);
    },
    activeBuffs(ids) { return this.current.buffs.filter(buff => ids.includes(buff.id)); },
    newId(type) {
        const bytes = new Uint8Array(6);
        crypto.getRandomValues(bytes);
        return `custom_${type.slice(0, -1)}_${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`;
    },
    showStatus(message, error = false) {
        const node = document.getElementById('custom-content-status');
        node.textContent = message;
        node.classList.toggle('error', error);
    },
    renderList() {
        const type = document.getElementById('custom-content-type').value;
        const list = document.getElementById('custom-content-list');
        list.replaceChildren();
        if (this.current[type].length === 0) list.textContent = 'No local definitions of this type yet.';
        for (const entry of this.current[type]) {
            const row = document.createElement('div'); row.className = 'custom-content-row';
            const title = document.createElement('span'); title.textContent = entry.name;
            const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Edit'; edit.dataset.action = 'edit'; edit.dataset.id = entry.id;
            const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Delete'; remove.dataset.action = 'delete'; remove.dataset.id = entry.id;
            row.append(title, edit, remove); list.appendChild(row);
        }
    },
    resetEditor() {
        this.editingId = null;
        const type = document.getElementById('custom-content-type').value;
        document.getElementById('custom-content-json').value = JSON.stringify(this.template(type), null, 2);
        this.showStatus(this.storageUnreadable ? 'Saved local data could not be read. Saves are disabled to preserve it.' : `Definitions stay in this browser only. Save to refresh the explorer.${this.invalidCount ? ` ${this.invalidCount} invalid saved definition(s) were retained but not loaded.` : ''}`, this.storageUnreadable);
        this.renderList();
    },
    initUI(app) {
        const modal = document.getElementById('custom-content-modal');
        const typeControl = document.getElementById('custom-content-type');
        document.getElementById('open-custom-content').addEventListener('click', () => { this.resetEditor(); modal.style.display = 'flex'; typeControl.focus(); });
        document.getElementById('close-custom-content').addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', event => { if (event.target === modal) modal.style.display = 'none'; });
        document.addEventListener('keydown', event => { if (event.key === 'Escape') modal.style.display = 'none'; });
        typeControl.addEventListener('change', () => this.resetEditor());
        document.getElementById('new-custom-content').addEventListener('click', () => this.resetEditor());
        document.getElementById('save-custom-content').addEventListener('click', () => {
            try {
                if (this.storageUnreadable) throw new Error('Cannot replace unreadable saved data. Preserve or repair that browser storage first.');
                const type = typeControl.value;
                const input = JSON.parse(document.getElementById('custom-content-json').value);
                const id = this.editingId || this.newId(type);
                this.normalize(type, input, id);
                const next = structuredClone(this.definitions);
                const index = next[type].findIndex(entry => entry?.id === id);
                const entry = { id, input };
                if (index >= 0) next[type][index] = entry;
                else {
                    if (next[type].length >= 50) throw new Error('This browser already has 50 definitions of this type. Edit or delete one first.');
                    next[type].push(entry);
                }
                localStorage.setItem(this.storageKey, JSON.stringify(next));
                location.reload();
            } catch (error) { this.showStatus(error.message, true); }
        });
        document.getElementById('custom-content-list').addEventListener('click', event => {
            const button = event.target.closest('button[data-action]');
            if (!button) return;
            const type = typeControl.value, entry = this.definitions[type].find(item => item?.id === button.dataset.id);
            if (!entry) return;
            if (button.dataset.action === 'edit') {
                this.editingId = entry.id;
                document.getElementById('custom-content-json').value = JSON.stringify(entry.input, null, 2);
                this.showStatus('Editing this local definition. Save to refresh the explorer.');
            } else if (window.confirm(`Delete your local ${type.slice(0, -1)} “${entry.input.name}”?`)) {
                try {
                    const next = structuredClone(this.definitions);
                    next[type] = next[type].filter(item => item?.id !== entry.id);
                    localStorage.setItem(this.storageKey, JSON.stringify(next));
                    location.reload();
                } catch (error) { this.showStatus(error.message, true); }
            }
        });
        const buffs = document.getElementById('custom-buffs');
        buffs.addEventListener('change', event => {
            const id = event.target.dataset.buffId;
            if (!id) return;
            app.state.customBuffIds = app.state.customBuffIds.filter(value => value !== id);
            if (event.target.checked) app.state.customBuffIds.push(id);
            app.updateDisplay();
        });
        this.current.buffs.forEach(buff => {
            const label = document.createElement('label'); label.className = 'custom-buff-option';
            const check = document.createElement('input'); check.type = 'checkbox'; check.dataset.buffId = buff.id;
            const text = document.createElement('span'); text.textContent = `${buff.name} (${buff.value >= 0 ? '+' : ''}${Math.round(buff.value * 100)}% ${buff.targetStat})`;
            label.append(check, text); buffs.appendChild(label);
        });
        document.getElementById('custom-buffs-section').hidden = this.current.buffs.length === 0;
    }
};
