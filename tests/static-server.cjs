const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { appRoot } = require('./helpers/engine.cjs');
const publicDirectories = new Set(['js', 'css', 'data', 'assets', 'tutorialimages']);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml' };

function createTestServer({ root = appRoot, shutdownToken = process.env.DANDY_TEST_SHUTDOWN_TOKEN } = {}) {
    const canonicalRoot = fs.realpathSync(root);
    const isPublicFile = file => {
        const relative = path.relative(canonicalRoot, file);
        if (!relative || path.isAbsolute(relative)) return false;
        const segments = relative.split(path.sep);
        if (segments.some(segment => segment.startsWith('.'))) return false;
        return relative === 'index.html' || (segments.length > 1 && publicDirectories.has(segments[0]));
    };
    const server = http.createServer(async (request, response) => {
        if (request.url === '/__test_shutdown' && request.method === 'POST'
            && shutdownToken && request.headers['x-test-shutdown-token'] === shutdownToken) {
            response.writeHead(204);
            response.end(() => { server.close(); server.closeAllConnections(); });
            return;
        }
        if (request.method !== 'GET') { response.writeHead(405); response.end(); return; }
        let pathname;
        // Inspect the original target before URL normalization can hide dot segments.
        try { pathname = decodeURIComponent(request.url.split('?')[0]).replaceAll('\\', '/'); }
        catch { response.writeHead(400); response.end(); return; }
        if (pathname.includes('\0')) { response.writeHead(400); response.end(); return; }
        if (!pathname.startsWith('/') || pathname.startsWith('//')
            || pathname.split('/').some(segment => segment === '.' || segment === '..')) {
            response.writeHead(403); response.end(); return;
        }
        if (pathname === '/favicon.ico') { response.writeHead(204); response.end(); return; }
        const candidate = path.resolve(canonicalRoot, '.' + (pathname === '/' ? '/index.html' : pathname));
        if (!isPublicFile(candidate)) { response.writeHead(403); response.end(); return; }
        // Tests never use production feedback or analytics, even for a production snapshot.
        const overrides = {
            '/js/feedback-config.js': "window.DandyFeedbackConfig = Object.freeze({feedbackApiUrl: '', appVersion: 'isolated-test'});",
            '/js/analytics-config.js': "window.DandyAnalyticsConfig = Object.freeze({measurementId: '', allowLocalhost: false});"
        };
        if (Object.hasOwn(overrides, pathname)) {
            response.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' });
            response.end(overrides[pathname]); return;
        }
        try {
            // Resolve symlinks/junctions and recheck the public roots before reading.
            // Read this canonical filename, never the original mutable link.
            const file = await fs.promises.realpath(candidate);
            if (!isPublicFile(file)) { response.writeHead(403); response.end(); return; }
            let body = await fs.promises.readFile(file);
            if (path.extname(file) === '.html') {
                // Resource hints can open sockets without passing through Playwright routing.
                body = body.toString('utf8').replace(/<link\b[^>]*\brel\s*=\s*(["'])(?:preconnect|dns-prefetch)\1[^>]*>/gi, '');
            }
            response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
            response.end(body);
        } catch {
            response.writeHead(404); response.end('Not found');
        }
    });
    return server;
}

if (require.main === module) {
    const port = Number(process.env.DANDY_TEST_PORT || 4399);
    const server = createTestServer();
    server.listen(port, '127.0.0.1', () => console.log(`Isolated test server: http://127.0.0.1:${server.address().port}`));
}

module.exports = { createTestServer };
