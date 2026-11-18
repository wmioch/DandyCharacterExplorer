const { test, expect } = require('./isolation.cjs');

const storageKey = 'dandy-custom-content:v1';
const modal = page => page.getByRole('dialog', { name: 'Custom Content' });
const definition = page => modal(page).getByLabel('Definition', { exact: true });
const stat = (page, name) => page.locator('.stats-table tbody tr').filter({
    has: page.getByRole('cell', { name, exact: true })
});
const final = (page, name) => stat(page, name).locator('.stat-final');

async function openEditor(page, type) {
    await page.getByRole('button', { name: 'Custom Content', exact: true }).click();
    await modal(page).getByLabel('Content type').selectOption(type);
}
async function save(page) {
    await Promise.all([
        page.waitForEvent('load'),
        modal(page).getByRole('button', { name: 'Save locally' }).click()
    ]);
    await expect(page.locator('[data-toon-id="boxten"]')).toBeVisible();
}
async function make(page, type, fields = {}) {
    await openEditor(page, type);
    await definition(page).fill(JSON.stringify({ ...JSON.parse(await definition(page).inputValue()), ...fields }));
    await save(page);
}

test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
        localStorage.setItem('tutorialSeen:v3', 'true');
        localStorage.setItem('advancedTutorialSeen:v1', 'true');
    });
    await page.goto('/');
    await expect(page.locator('[data-toon-id="boxten"]')).toHaveClass(/selected/);
});

test('custom creations coexist with built-in records and keep names out of feedback context', async ({ page }) => {
    await make(page, 'toons', { name: 'My Local Toon' });
    await make(page, 'trinkets', { name: 'My Local Trinket' });
    await make(page, 'twisteds', { name: 'Twisted Local Practice' });

    await page.getByTitle('My Local Toon', { exact: true }).click();
    await expect(final(page, 'Walk Speed')).toHaveText('15.0');
    await page.locator('#abilities-display input[type="checkbox"]').check();
    await expect(final(page, 'Walk Speed')).toHaveText('16.5');

    await page.locator('[data-trinket-id^="custom_trinket_"]').click();
    await expect(final(page, 'Walk Speed')).toHaveText('18.15');
    const message = await page.evaluate(() => window.Feedback.buildMessage('Synthetic local check'));
    expect(message).toContain('Selected toon: Custom Toon');
    expect(message).toContain('Selected trinkets: Custom Trinket');
    expect(message).not.toContain('My Local');

    const twisted = page.getByRole('row').filter({ hasText: 'Twisted Local Practice' });
    for (const value of ['20.0', '24.0', '23.0']) {
        await expect(twisted.getByText(value, { exact: true })).toBeVisible();
    }
    await page.getByRole('button', { name: 'Name' }).click();
    await expect(twisted).toHaveCount(1);
    await expect(page.getByRole('row').filter({ hasText: 'Twisted Dyle' })).toHaveCount(1);

    await openEditor(page, 'toons');
    await modal(page).getByRole('button', { name: 'Edit' }).click();
    await definition(page).fill(JSON.stringify({ ...JSON.parse(await definition(page).inputValue()), name: 'My Edited Toon' }));
    await save(page);
    await expect(page.getByTitle('My Edited Toon', { exact: true })).toBeVisible();

    await openEditor(page, 'toons');
    page.once('dialog', dialog => dialog.accept());
    await Promise.all([page.waitForEvent('load'), modal(page).getByRole('button', { name: 'Delete' }).click()]);
    await expect(page.getByTitle('My Edited Toon', { exact: true })).toHaveCount(0);
    await expect(page.locator('[data-toon-id="boxten"]')).toBeVisible();
    await expect(twisted).toHaveCount(1);
});

test('custom buffs affect Machine Stats and zero-base Stealth has no relative percentage', async ({ page }) => {
    await make(page, 'buffs', { name: 'Local Extraction', targetStat: 'extractionSpeed', value: 0.1 });
    await make(page, 'trinkets', { effects: [{ targetStat: 'stealth', value: 10, applicationType: 'additive' }] });

    await page.locator('[data-toon-id="poppy"]').click();
    await page.getByRole('button', { name: 'Machine Stats' }).click();
    await expect(page.locator('#default-base-time')).toHaveText('45s');
    const buff = page.getByRole('region', { name: 'Custom Buffs' }).getByRole('checkbox', { name: /Local Extraction/ });
    await buff.check();
    await expect(final(page, 'Extraction Speed')).toHaveText('1.10');
    await expect(page.locator('#default-base-time')).toHaveText('40.9s');
    await page.reload();
    await expect(buff).not.toBeChecked();

    await page.locator('[data-toon-id="brightney"]').click();
    await page.locator('[data-trinket-id^="custom_trinket_"]').click();
    await expect(stat(page, 'Stealth').locator('.stat-base')).toHaveText('0.0');
    await expect(stat(page, 'Stealth').locator('.stat-modifier')).toHaveText('-');
    await expect(final(page, 'Stealth')).toHaveText('10.0');
    await page.locator('[data-toon-id="poppy"]').click();
    await expect(stat(page, 'Stealth').locator('.stat-modifier')).toHaveText('+100%');
    await expect(final(page, 'Stealth')).toHaveText('20.0');
});

test('invalid edits and an unreadable saved collection leave definitions intact', async ({ page }) => {
    await make(page, 'buffs');
    const initial = await page.evaluate(key => localStorage.getItem(key), storageKey);
    await openEditor(page, 'buffs');
    await definition(page).fill('{ incomplete');
    await modal(page).getByRole('button', { name: 'Save locally' }).click();
    await expect(modal(page).getByRole('status')).toHaveClass(/error/);
    await expect.poll(() => page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(initial);

    const malformed = JSON.stringify({ ...JSON.parse(initial), twisteds: { unexpectedly: 'an object' } });
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: storageKey, value: malformed });
    await page.reload();
    await openEditor(page, 'buffs');
    await modal(page).getByRole('button', { name: 'Save locally' }).click();
    await expect(modal(page).getByRole('status')).toContainText('unreadable saved data');
    await modal(page).getByRole('button', { name: 'Delete' }).click();
    await expect(modal(page).getByRole('status')).toContainText('unreadable saved data');
    await expect.poll(() => page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(malformed);
});

test('a stale editor preserves newly saved definitions from a second tab', async ({ page, context }) => {
    await openEditor(page, 'trinkets');
    const second = await context.newPage();
    await second.goto(page.url());
    await make(second, 'buffs', { name: 'Second Tab Buff' });
    const newer = await second.evaluate(key => localStorage.getItem(key), storageKey);

    await modal(page).getByRole('button', { name: 'Save locally' }).click();
    await expect(modal(page).getByRole('status')).toContainText('Another tab changed your saved definitions');
    await expect.poll(() => page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(newer);
    await page.reload();
    await expect(page.getByRole('checkbox', { name: /Second Tab Buff/ })).toBeVisible();
});
