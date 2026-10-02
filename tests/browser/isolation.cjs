const { test: base, expect } = require('@playwright/test');

async function installIsolation(context, baseURL, onUnexpected) {
    const origin = new URL(baseURL).origin;
    // Context routing includes a popup's first navigation; page routing does not.
    await context.route('**/*', route => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.origin === 'https://fonts.googleapis.com' && request.method() === 'GET') {
            return route.fulfill({ status: 200, contentType: 'text/css', body: '' });
        }
        if (url.origin !== origin || request.method() !== 'GET') {
            onUnexpected(`Unexpected external request or write: ${request.method()} ${url.origin}`);
            return route.abort();
        }
        return route.continue();
    });
    await context.routeWebSocket('**/*', socket => {
        onUnexpected(`Unexpected WebSocket: ${new URL(socket.url()).origin}`);
        socket.close();
    });
}

const test = base.extend({
    isolatedNetwork: [async ({ context, baseURL }, use) => {
        const errors = [];
        context.on('page', page => {
            page.on('pageerror', error => errors.push(error.message));
            page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        });
        await installIsolation(context, baseURL, message => errors.push(message));
        await use();
        expect(errors).toEqual([]);
    }, { auto: true }]
});

module.exports = { test, expect, installIsolation };
