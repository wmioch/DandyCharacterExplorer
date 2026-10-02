const { test, expect } = require('@playwright/test');
const http = require('node:http');
const { once } = require('node:events');
const { installIsolation } = require('./isolation.cjs');

test('Context routing blocks another loopback port, writes and popup-first requests', async ({ context, page, baseURL }) => {
    const blocked = [];
    let unexpectedServerHits = 0;
    const otherServer = http.createServer((request, response) => {
        unexpectedServerHits++;
        response.end('SYNTHETIC_OTHER_SERVICE');
    });
    otherServer.listen(0, '127.0.0.1');
    await once(otherServer, 'listening');
    try {
        await installIsolation(context, baseURL, message => blocked.push(message));
        await page.goto('/');
        const otherOrigin = `http://127.0.0.1:${otherServer.address().port}`;
        const results = await page.evaluate(async other => {
            const attempt = async (url, options) => { try { await fetch(url, options); return 'allowed'; } catch { return 'blocked'; } };
            return Promise.all([attempt(other + '/probe'), attempt('/data/toons.json', { method: 'POST' }), attempt('https://example.invalid/probe')]);
        }, otherOrigin);
        expect(results).toEqual(['blocked', 'blocked', 'blocked']);
        const popup = await Promise.all([
            context.waitForEvent('page'),
            page.evaluate(other => window.open(other + '/popup-probe'), otherOrigin)
        ]).then(([opened]) => opened);
        await expect.poll(() => blocked.filter(message => message.includes(otherOrigin)).length).toBe(2);
        await popup.close();
        expect(unexpectedServerHits).toBe(0);
        expect(blocked).toHaveLength(4);
    } finally {
        otherServer.closeAllConnections();
        await new Promise(resolve => otherServer.close(resolve));
    }
});

test('Service worker registration is blocked and connection hints are absent', async ({ context, page, baseURL }) => {
    const blocked = [];
    const workerRequests = [];
    context.on('request', request => { if (request.url().endsWith('/synthetic-worker.js')) workerRequests.push(request.url()); });
    await installIsolation(context, baseURL, message => blocked.push(message));
    await page.goto('/');
    await page.evaluate(() => { navigator.serviceWorker.register('/synthetic-worker.js').catch(() => {}); });
    expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(0);
    expect(context.serviceWorkers()).toHaveLength(0);
    expect(workerRequests).toEqual([]);
    await expect(page.locator('link[rel="preconnect"], link[rel="dns-prefetch"]')).toHaveCount(0);
    expect(blocked).toEqual([]);
});

test('Optional font CSS is fulfilled locally and WebSockets are blocked', async ({ context, page, baseURL }) => {
    const blocked = [];
    await installIsolation(context, baseURL, message => blocked.push(message));
    await page.goto('/');
    const fontCss = await page.evaluate(() => fetch('https://fonts.googleapis.com/css2?family=Synthetic').then(response => response.text()));
    expect(fontCss).toBe('');
    const socketResult = await page.evaluate(() => new Promise(resolve => {
        const socket = new WebSocket('wss://example.invalid/synthetic');
        socket.onclose = () => resolve('blocked');
        socket.onerror = () => resolve('blocked');
    }));
    expect(socketResult).toBe('blocked');
    expect(blocked).toEqual(['Unexpected WebSocket: wss://example.invalid']);
});
