const { defineConfig } = require('@playwright/test');
const { randomUUID } = require('node:crypto');
const port = Number(process.env.DANDY_TEST_PORT || 4399);
process.env.DANDY_TEST_SHUTDOWN_TOKEN = randomUUID();
module.exports = defineConfig({
    globalTeardown: './tests/browser/teardown.cjs',
    testDir: './tests/browser',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    timeout: 30000,
    outputDir: 'output/playwright/results',
    reporter: [['list'], ['html', { outputFolder: 'output/playwright/report', open: 'never' }]],
    use: { baseURL: `http://127.0.0.1:${port}`, headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
    projects: [
        { name: 'desktop-chromium', use: { browserName: 'chromium', viewport: { width: 1280, height: 900 } } },
        { name: 'mobile-chromium', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
    ],
    webServer: {
        command: 'node tests/static-server.cjs', url: `http://127.0.0.1:${port}`,
        env: { DANDY_TEST_SHUTDOWN_TOKEN: process.env.DANDY_TEST_SHUTDOWN_TOKEN },
        reuseExistingServer: false, timeout: 10000
    }
});
