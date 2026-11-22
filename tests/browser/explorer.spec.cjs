const { test, expect } = require('./isolation.cjs');

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('tutorialSeen:v3', 'true');
        localStorage.setItem('advancedTutorialSeen:v1', 'true');
    });
    await page.goto('/');
    await expect(page.locator('[data-toon-id="boxten"]')).toHaveClass(/selected/);
    expect(await page.evaluate(() => window.DandyFeedbackConfig.feedbackApiUrl)).toBe('');
});

const row = (page, label) => page.locator('.stats-table tbody tr').filter({ has: page.locator('td:first-child', { hasText: new RegExp(`^${label}$`) }) });
const finalCell = (page, label) => row(page, label).locator('td').last();

test('Gumballs applies one selected use and resets when removed', async ({ page }) => {
    const tile = page.locator('[data-item-id="gumballs"]');
    const outcome = page.getByLabel('Observed Gumballs result');
    await expect(outcome).toBeHidden();
    await tile.click();
    await expect(outcome).toHaveValue('');
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('25%');
    await outcome.selectOption('skillCheck');
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('35%');
    await expect(finalCell(page, 'Skill Check Size')).toHaveText('165.0');
    await expect(finalCell(page, 'Skill Check Amount')).toHaveText('2.0');
    await tile.click();
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('35%');
    await outcome.selectOption('movementSpeed');
    await expect(finalCell(page, 'Walk Speed')).toHaveText('16.5');
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('25%');
    await page.locator('[data-item-id="speed_candy"]').click({ trial: true });
    await tile.dispatchEvent('contextmenu');
    await expect(outcome).toBeHidden();
    await expect(finalCell(page, 'Walk Speed')).toHaveText('15.0');
    await tile.click();
    await expect(outcome).toHaveValue('');
    const stateToggles = page.getByRole('region', { name: 'State Toggles' });
    await expect(stateToggles.getByLabel('Observed Gumballs result')).toBeVisible();
    await expect(stateToggles.getByRole('checkbox', { name: 'Extracting from a Machine' })).toBeHidden();
});

test('Keyboard users can activate and remove the Gumballs scenario', async ({ page }) => {
    await page.locator('[data-toon-id="poppy"]').click();
    const tile = page.getByRole('button', { name: 'Gumballs', exact: true });
    await tile.focus();
    await expect(tile).toBeFocused();
    await tile.press('Space');
    await expect(tile).toHaveAttribute('aria-pressed', 'true');
    const outcome = page.getByLabel('Observed Gumballs result');
    await expect(outcome).toBeVisible();
    await outcome.selectOption('extractionSpeed');
    await expect(finalCell(page, 'Extraction Speed')).toHaveText('1.10');
    await tile.press('Enter');
    await expect(tile).toHaveAttribute('aria-pressed', 'false');
    await expect(outcome).toBeHidden();
    await tile.press('Enter');
    await expect(outcome).toHaveValue('');
});

test('Gumballs stays removed after a touch compatibility click and has a visible remove action', async ({ page }) => {
    const tile = page.getByRole('button', { name: 'Gumballs', exact: true });
    const outcome = page.getByLabel('Observed Gumballs result');
    await tile.click();
    await outcome.selectOption('movementSpeed');
    await tile.evaluate(el => {
        el.dispatchEvent(new PointerEvent('contextmenu', { bubbles: true, button: 2, pointerType: 'touch' }));
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    });
    await expect(outcome).toBeHidden();
    await tile.click();
    await expect(outcome).toHaveValue('');
    await page.getByRole('button', { name: 'Remove Gumballs' }).click();
    await expect(outcome).toBeHidden();
});

test('Gumballs uses fresh definitions when the old item URL serves pre-release data', async ({ page }) => {
    const oldItems = await (await page.request.get('/data/items.json')).json();
    const oldGumballs = oldItems.items.find(item => item.id === 'gumballs');
    delete oldGumballs.randomOutcomes;
    delete oldGumballs.uses;
    await page.route(url => url.pathname === '/data/items.json' && !url.search,
        route => route.fulfill({ json: oldItems }));
    const revisedItems = page.waitForResponse(response => {
        const url = new URL(response.url());
        return url.pathname === '/data/items.json' && url.searchParams.has('v') && response.ok();
    });
    await page.reload();
    await revisedItems;
    await page.getByRole('button', { name: 'Gumballs', exact: true }).click();
    await page.getByLabel('Observed Gumballs result').selectOption('skillCheck');
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('35%');
    await expect(finalCell(page, 'Skill Check Size')).toHaveText('165.0');
});

test('Star Pillow applies extraction regeneration from State Toggles and resets when removed', async ({ page }) => {
    await page.locator('[data-toon-id="poppy"]').click();
    const pillow = page.locator('[data-trinket-id="star_pillow"]');
    const stateToggles = page.getByRole('region', { name: 'State Toggles' });
    const extracting = stateToggles.getByRole('checkbox', { name: 'Extracting from a Machine' });
    const regeneration = finalCell(page, 'Stamina Regeneration');
    await expect(stateToggles).toBeHidden();
    await pillow.click();
    await expect(extracting).toBeVisible();
    const abilitiesBounds = await page.locator('#team-abilities').boundingBox();
    const togglesBounds = await stateToggles.boundingBox();
    expect(togglesBounds.y).toBeGreaterThanOrEqual(abilitiesBounds.y + abilitiesBounds.height);
    await page.locator('[data-item-id="speed_candy"]').click({ trial: true });
    await expect(extracting).not.toBeChecked();
    await expect(regeneration).toHaveText('2.4/s');
    await extracting.check();
    await expect(regeneration).toHaveText('4.8/s');
    await extracting.uncheck();
    await expect(regeneration).toHaveText('2.4/s');
    await extracting.check();
    await pillow.click();
    await expect(stateToggles).toBeHidden();
    await expect(regeneration).toHaveText('2.4/s');
    await pillow.click();
    await expect(extracting).not.toBeChecked();
    await expect(regeneration).toHaveText('2.4/s');
});

test('Flower inventory control keeps held items separate from consumed buffs and trinket selection', async ({ page }, testInfo) => {
    await expect(page.locator('#held-items-container')).toBeHidden();
    const flower = page.locator('[data-trinket-id="whispering_flower"]');
    await flower.click();
    const held = page.locator('#held-item-count');
    await expect(held).toBeVisible();
    for (const [count, regeneration] of [['0', '2.4/s'], ['1', '2.8/s'], ['3', '3.5/s']]) {
        await held.selectOption(count);
        await expect(finalCell(page, 'Stamina Regeneration')).toHaveText(regeneration);
    }
    await page.locator('[data-item-id="speed_candy"]').click();
    await expect(held).toHaveValue('3');
    await expect(finalCell(page, 'Stamina Regeneration')).toHaveText('3.5/s');
    await flower.click();
    await expect(page.locator('#held-items-container')).toBeHidden();
    await expect(finalCell(page, 'Stamina Regeneration')).toHaveText('2.4/s');
    await flower.click();
    await expect(held).toHaveValue('3');
    await expect(finalCell(page, 'Stamina Regeneration')).toHaveText('3.5/s');
    await expect(flower.locator('.count-badge')).toHaveCount(0);
    await page.screenshot({ path: testInfo.outputPath('flower-inventory.png'), fullPage: true });
});

test('Bassie fourth inventory slot clamps on Toon change', async ({ page }) => {
    await page.locator('[data-toon-id="bassie"]').click();
    await page.locator('[data-trinket-id="whispering_flower"]').click();
    const held = page.locator('#held-item-count');
    await held.selectOption('4');
    await expect(finalCell(page, 'Stamina Regeneration')).toHaveText('3.8/s');
    await page.locator('[data-toon-id="boxten"]').click();
    await expect(held).toHaveValue('3');
    await expect(held.locator('option[value="4"]')).toBeDisabled();
    await expect(finalCell(page, 'Stamina Regeneration')).toHaveText('3.5/s');
});

test('Toon selection and Advanced confirmation preserve or clear a custom build', async ({ page }) => {
    await page.locator('[data-toon-id="poppy"]').click();
    await page.locator('#advanced-mode').click();
    const editor = page.locator('[data-custom-stat="walkSpeed"]');
    await editor.fill('18');
    await editor.press('Tab');
    await page.locator('[data-trinket-id="dog_plush"]').click();
    await expect(finalCell(page, 'Walk Speed')).toHaveText('19.8');
    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('#advanced-mode').click();
    await expect(editor).toHaveValue('18');
    await expect(page.locator('#advanced-mode')).toHaveAttribute('aria-pressed', 'true');
    page.once('dialog', dialog => dialog.accept());
    await page.locator('#advanced-mode').click();
    await expect(page.locator('[data-custom-stat]')).toHaveCount(0);
    await expect(finalCell(page, 'Walk Speed')).toHaveText('16.5');
});

test('Looey healing remains a manual heart-scenario change', async ({ page }) => {
    await page.locator('[data-toon-id="looey"]').click();
    await page.locator('input[value="looey_1heart"]').check();
    await expect(finalCell(page, 'Walk Speed')).toHaveText('21.0');
    await page.locator('input[value="looey_3hearts"]').check();
    await expect(finalCell(page, 'Walk Speed')).toHaveText('15.0');
});

test('Cards, Slow and machine estimates respond through real controls', async ({ page }) => {
    await page.locator('[data-toon-id="poppy"]').click();
    await page.locator('[data-tab="cards-debuffs"]').click();
    await page.locator('[data-debuff="slow"]').click();
    await expect(finalCell(page, 'Walk Speed')).toHaveText('12.75');
    await page.locator('[data-card="timesUp"]').click();
    await expect(finalCell(page, 'Stamina')).toHaveText('200.0');
    await page.locator('[data-card="techSavvy"]').click();
    await page.locator('[data-tab="machine-stats"]').click();
    await expect(page.locator('#default-base-time')).toHaveText('40s');
});

test('Alarm and Pull Toy apply in distinct speed snapshots', async ({ page }) => {
    const alarm = page.locator('[data-trinket-id="alarm"]');
    const pullToy = page.locator('[data-trinket-id="pull_toy"]');
    const mirror = page.locator('[data-trinket-id="vanity_mirror"]');
    const run = finalCell(page, 'Run Speed');
    const start = page.getByRole('columnheader', { name: 'Start 10s' });
    await alarm.click();
    await expect(run).toHaveText('25.0 (31.25)');
    await expect(finalCell(page, 'Walk Speed')).toHaveText('15.0 (18.75)');
    await expect(page.locator('#alarm-twisted-note')).toBeVisible();
    await mirror.click();
    await alarm.click();
    await expect(run).toHaveText('25.0 (32.5)');
    await expect(page.locator('#alarm-twisted-note')).toBeHidden();
    await mirror.click();

    await pullToy.click();
    await alarm.click();
    await expect(run).toHaveText('25.0 (31.25) [31.25]');
    await expect(start).toBeVisible();
    const squirm = page.locator('.twisted-table-compact tbody tr').filter({ hasText: 'Twisted Squirm' });
    await expect(squirm.locator('.speed-value:visible')).toHaveText(['N/A', 'N/A', 'N/A', 'N/A']);
    await page.locator('#sort-name').click();
    await page.locator('[data-tab="cards-debuffs"]').click();
    await page.locator('[data-card="suppression"]').click();
    await page.locator('[data-tab="twisted-speed"]').click();
    await page.locator('#sort-speed').click();
    await expect(start).toBeVisible();
    await expect(squirm.locator('.speed-value:visible')).toHaveText(['N/A', 'N/A', 'N/A']);
    await expect(squirm.locator('.speed-value:visible').last()).toHaveAttribute('title', /ceiling-bound/i);
    await pullToy.click();
    await expect(start).toBeHidden();
    await expect(run).toHaveText('25.0 (31.25)');
    await alarm.click();
    await expect(run).toHaveText('25.0');
});

test('Dyle speed cells retain maximum-profile qualification after sorting', async ({ page }) => {
    await page.locator('#sort-name').click();
    const dyle = page.locator('.twisted-table-compact tbody tr').filter({ hasText: 'Twisted Dyle' });
    await expect(dyle).toHaveCount(1);
    await expect(dyle.locator('.speed-value').first()).toHaveAttribute('title', /highest|maximum/i);
    await page.locator('#sort-speed').click();
    await expect(dyle.locator('.speed-value').first()).toHaveAttribute('title', /highest|maximum/i);
});

test('Connie and Squirm remain neutral N/A through sorting and Suppression', async ({ page }) => {
    const table = page.locator('.twisted-table-compact tbody');
    const profiles = [
        ['Twisted Connie', /possessed Machines/i],
        ['Twisted Squirm', /ceiling-bound/i]
    ];
    for (const [name, explanation] of profiles) {
        const twisted = table.getByRole('row').filter({ hasText: name });
        await expect(twisted).toHaveCount(1);
        await expect(twisted.locator('.speed-value')).toHaveText(['N/A', 'N/A', 'N/A']);
        await expect(twisted.locator('.speed-value').first()).toHaveAttribute('title', explanation);
        await expect(twisted.locator('.speed-value').first()).toHaveAttribute('class', 'speed-value');
    }
    const squirm = table.getByRole('row').filter({ hasText: 'Twisted Squirm' });
    await expect(squirm.locator('.twisted-image')).toHaveCSS('background-image', /squirm\.png/);
    await page.locator('#sort-name').click();
    await page.locator('[data-tab="cards-debuffs"]').click();
    await page.locator('[data-card="suppression"]').click();
    await page.locator('[data-tab="twisted-speed"]').click();
    await page.locator('#sort-speed').click();
    await page.locator('[data-toon-id="poppy"]').click();
    for (const [name, explanation] of profiles) {
        const twisted = table.getByRole('row').filter({ hasText: name });
        await expect(twisted.locator('.speed-value:visible')).toHaveText(['N/A', 'N/A']);
        await expect(twisted.locator('.speed-value:visible').last()).toHaveAttribute('title', explanation);
    }
});

test('Brusha paint applies once through player and team controls with precise Chance', async ({ page }) => {
    await page.locator('[data-toon-id="brusha"]').click();
    const paint = page.locator('#ability-toggle-brusha_artistic_inspiration');
    await paint.check();
    await expect(finalCell(page, 'Extraction Speed')).toHaveText('1.25');
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('28.75%');
    await expect(row(page, 'Skill Check Chance').locator('.stat-modifier')).toHaveText('+3.75%');
    await expect(finalCell(page, 'Walk Speed')).toHaveText('15.0');
    await page.locator('[data-toon-id="brusha"]').click({ button: 'right' });
    await page.locator('[data-toon-id="brusha"]').click({ button: 'right' });
    const teamPaint = page.locator('input[value="brusha_artistic_inspiration"]');
    await expect(teamPaint).toHaveCount(2);
    await teamPaint.nth(0).check();
    await teamPaint.nth(1).check();
    await expect(finalCell(page, 'Extraction Speed')).toHaveText('1.25');
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('28.75%');
    await paint.uncheck();
    await expect(finalCell(page, 'Extraction Speed')).toHaveText('1.25');
    await teamPaint.nth(0).uncheck();
    await teamPaint.nth(1).uncheck();
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('25%');
    await paint.check();
    await page.locator('[data-tab="machine-stats"]').click();
    await expect(page.locator('#default-base-time')).toHaveText('36s');
});

test('Paint Bucket speed is independent of paint and resets on removal or Toon changes', async ({ page }) => {
    await page.locator('[data-toon-id="brusha"]').click();
    const bucket = page.locator('[data-trinket-id="paint_bucket"]');
    const speed = page.locator('#paint-bucket-boost');
    await expect(speed).toBeHidden();
    await bucket.click();
    await expect(speed).toBeVisible();
    await expect(speed).not.toBeChecked();
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('35%');
    await speed.check();
    await expect(finalCell(page, 'Walk Speed')).toHaveText('18.75');
    await expect(finalCell(page, 'Run Speed')).toHaveText('31.25');
    await expect(finalCell(page, 'Extraction Speed')).toHaveText('1.00');
    const chance = row(page, 'Skill Check Chance');
    await expect(chance.locator('.stat-base')).toHaveText('35%');
    await expect(chance.locator('.stat-modifier')).toHaveText('-');
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('35%');
    await page.locator('#ability-toggle-brusha_artistic_inspiration').check();
    await expect(chance.locator('.stat-base')).toHaveText('35%');
    await expect(chance.locator('.stat-modifier')).toHaveText('+5.25%');
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('40.25%');
    await expect(finalCell(page, 'Walk Speed')).toHaveText('18.75');
    await bucket.click({ button: 'right' });
    await expect(speed).toBeHidden();
    await expect(finalCell(page, 'Walk Speed')).toHaveText('15.0');
    await bucket.click();
    await expect(speed).not.toBeChecked();
    await speed.check();
    await page.locator('[data-toon-id="poppy"]').click();
    await expect(speed).toBeHidden();
    await expect(finalCell(page, 'Walk Speed')).toHaveText('15.0');
    await expect(finalCell(page, 'Skill Check Chance')).toHaveText('35%');
    await page.locator('[data-toon-id="brusha"]').click();
    await expect(speed).not.toBeChecked();
    await expect(page.locator('#ability-toggle-brusha_artistic_inspiration')).not.toBeChecked();
});
