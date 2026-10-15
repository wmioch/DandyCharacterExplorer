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

test('Dyle speed cells retain maximum-profile qualification after sorting', async ({ page }) => {
    await page.locator('#sort-name').click();
    const dyle = page.locator('.twisted-table-compact tbody tr').filter({ hasText: 'Twisted Dyle' });
    await expect(dyle).toHaveCount(1);
    await expect(dyle.locator('.speed-value').first()).toHaveAttribute('title', /highest|maximum/i);
    await page.locator('#sort-speed').click();
    await expect(dyle.locator('.speed-value').first()).toHaveAttribute('title', /highest|maximum/i);
});
