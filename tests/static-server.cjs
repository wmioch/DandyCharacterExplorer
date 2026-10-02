const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { appRoot } = require('./helpers/engine.cjs');
const port = Number(process.env.DANDY_TEST_PORT || 4399);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

const server = http.createServer((request, response) => {
    if (request.url === '/__test_shutdown' && request.method === 'POST'
        && process.env.DANDY_TEST_SHUTDOWN_TOKEN
        && request.headers['x-test-shutdown-token'] === process.env.DANDY_TEST_SHUTDOWN_TOKEN) {
        response.writeHead(204);
        response.end(() => { server.close(); server.closeAllConnections(); });
        return;
    }
    if (request.method !== 'GET') { response.writeHead(405); response.end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { response.writeHead(400); response.end(); return; }
    if (pathname === '/favicon.ico') { response.writeHead(204); response.end(); return; }
    if (pathname !== '/' && !['/js/', '/css/', '/data/', '/assets/', '/tutorialimages/'].some(prefix => pathname.startsWith(prefix))) {
        response.writeHead(403); response.end(); return;
    }
    // Tests never use production feedback or analytics, even when checking a production snapshot.
    const overrides = {
        '/js/feedback-config.js': "window.DandyFeedbackConfig = Object.freeze({feedbackApiUrl: '', appVersion: 'isolated-test'});",
        '/js/analytics-config.js': "window.DandyAnalyticsConfig = Object.freeze({measurementId: '', allowLocalhost: false});"
    };
    if (overrides[pathname]) {
        response.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' });
        response.end(overrides[pathname]); return;
    }
    const file = path.resolve(appRoot, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(appRoot + path.sep)) { response.writeHead(403); response.end(); return; }
    fs.readFile(file, (error, body) => {
        response.writeHead(error ? 404 : 200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
        response.end(error ? 'Not found' : body);
    });
}).listen(port, '127.0.0.1', () => console.log(`Isolated test server: http://127.0.0.1:${port}`));
