const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { appRoot, loadEngine } = require('./helpers/engine.cjs');

test('Every frontend script referenced by the page parses', () => {
    const html = fs.readFileSync(path.join(appRoot, 'index.html'), 'utf8');
    for (const match of html.matchAll(/<script[^>]+src="(js\/[^"]+)"/g)) {
        const file = match[1].split('?')[0];
        new vm.Script(fs.readFileSync(path.join(appRoot, file), 'utf8'), { filename: file });
    }
});

for (const collection of ['toons', 'trinkets', 'items', 'twisteds']) {
    test(`${collection}: valid records, unique IDs and referenced portraits`, () => {
        const records = loadEngine().DataLoader.data[collection];
        assert.ok(records.length > 0);
        const ids = new Set();
        for (const row of records) {
            assert.ok(typeof row.id === 'string' && row.id, 'record ID required');
            assert.ok(!ids.has(row.id), `duplicate ${collection} ID: ${row.id}`);
            ids.add(row.id);
            assert.ok(typeof row.name === 'string' && row.name, `${row.id}: name required`);
            let image;
            if (collection === 'toons') image = `toons/${row.image_name || row.id + '.png'}`;
            if (collection === 'trinkets') image = row.image && `trinkets/${row.image}`;
            if (collection === 'items') image = row.image_name && `items/${row.image_name}`;
            if (collection === 'twisteds') image = row.image;
            if (image) {
                const target = path.resolve(appRoot, 'assets/images', image);
                assert.ok(target.startsWith(path.resolve(appRoot, 'assets/images') + path.sep), `${row.id}: image escapes assets`);
                assert.ok(fs.existsSync(target), `${row.id}: missing ${image}`);
            }
        }
    });
}

test('Toon base stats are finite; health is an integer from 1 to 99', () => {
    for (const toon of loadEngine().DataLoader.getAllToons()) {
        for (const [key, value] of Object.entries(toon.baseStats)) assert.ok(Number.isFinite(value), `${toon.id}.${key}`);
        assert.ok(Number.isInteger(toon.baseStats.hearts) && toon.baseStats.hearts >= 1 && toon.baseStats.hearts <= 99, toon.id);
        for (const [key, stars] of Object.entries(toon.starRatings)) assert.ok(Number.isInteger(stars) && stars >= 1 && stars <= 5, `${toon.id}.${key}`);
    }
});

test('Twisted comparison profiles preserve explicit N/A instead of silently comparing null speeds', () => {
    const { Calculator, DataLoader } = loadEngine();
    for (const twisted of DataLoader.getAllTwisteds()) {
        for (const state of ['normal', 'panic', 'panicSuppressed']) {
            for (const stat of ['walk', 'run']) {
                const speed = twisted.speeds[state][stat];
                if (twisted.noChase) {
                    assert.equal(speed, null, `${twisted.id}.${state}.${stat}`);
                    assert.equal(Calculator.compareTwistedSpeed(15, 25, speed), '');
                } else assert.ok(Number.isFinite(speed) && speed >= 0, `${twisted.id}.${state}.${stat}`);
            }
        }
    }
});
