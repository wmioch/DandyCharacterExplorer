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
    await page.locator('#ability-toggle-brusha_artistic_inspiration').check();
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
