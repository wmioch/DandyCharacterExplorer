const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { once } = require('node:events');
const { createTestServer } = require('./static-server.cjs');

async function fixture(t, shutdownToken) {
    // Only synthetic files: never probe a real repository's private state.
    const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'dandy-static-server-test-'));
    const root = path.join(temporary, 'app');
    for (const directory of ['js', 'css', 'data', 'assets/nested', 'tutorialimages', '.codex', '.git', 'api', 'assets/.private', '../outside']) {
        fs.mkdirSync(path.join(root, directory), { recursive: true });
    }
    const files = {
        'index.html': '<html><head><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.gstatic.com" rel="preconnect" crossorigin><link rel="dns-prefetch" href="//example.invalid"><link rel="stylesheet" href="css/main.css"></head><body>PUBLIC_INDEX</body></html>',
        'js/app.js': 'PUBLIC_JS', 'css/main.css': 'PUBLIC_CSS', 'data/toons.json': 'PUBLIC_JSON',
        'assets/nested/icon.png': 'PUBLIC_ASSET', 'tutorialimages/step.png': 'PUBLIC_TUTORIAL',
        '.codex/sentinel.txt': 'SYNTHETIC_PRIVATE_SENTINEL', '.git/config': 'SYNTHETIC_PRIVATE_SENTINEL',
        'api/private.txt': 'SYNTHETIC_PRIVATE_SENTINEL', 'assets/.private/sentinel.txt': 'SYNTHETIC_PRIVATE_SENTINEL',
        '../outside/sentinel.txt': 'SYNTHETIC_PRIVATE_SENTINEL'
    };
    for (const [file, body] of Object.entries(files)) fs.writeFileSync(path.join(root, file), body);
    const server = createTestServer({ root, shutdownToken });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const port = server.address().port;
    t.after(async () => {
        server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
        const relative = path.relative(os.tmpdir(), temporary);
        assert.ok(relative.startsWith('dandy-static-server-test-') && !relative.includes(path.sep), 'cleanup stays inside the owned temporary fixture');
        fs.rmSync(temporary, { recursive: true, force: true });
    });
    const request = (target, method = 'GET', headers = {}) => new Promise((resolve, reject) => {
        // Raw origin-form path preserves traversal attempts that fetch() normalizes.
        const client = http.request({ hostname: '127.0.0.1', port, path: target, method, headers }, response => {
            let body = '';
            response.on('data', chunk => { body += chunk; });
            response.on('end', () => resolve({ status: response.statusCode, body, headers: response.headers }));
        });
        client.on('error', reject);
        client.end();
    });
    return { root, temporary, server, request };
}

test('Static server preserves legitimate public files and query strings', async t => {
    const { request } = await fixture(t);
    for (const [target, body] of [['/', 'PUBLIC_INDEX'], ['/js/app.js?v=1', 'PUBLIC_JS'], ['/css/main.css', 'PUBLIC_CSS'], ['/data/toons.json', 'PUBLIC_JSON'], ['/assets/nested/icon.png', 'PUBLIC_ASSET'], ['/tutorialimages/step.png', 'PUBLIC_TUTORIAL']]) {
        const response = await request(target);
        assert.equal(response.status, 200, target);
        assert.ok(response.body.includes(body), target);
        assert.equal(response.headers['cache-control'], 'no-store');
    }
    assert.equal((await request('/favicon.ico')).status, 204);
});

test('Static server rejects private paths and encoded/nested traversal', async t => {
    const { request } = await fixture(t);
    const targets = [
        '/.codex/sentinel.txt', '/.git/config', '/api/private.txt', '/assets/.private/sentinel.txt',
        '/assets/../.codex/sentinel.txt', '/assets/%2e%2e%2f.codex/sentinel.txt',
        '/assets/%2E%2E%2F.git/config', '/assets/nested/%2e%2e%2f%2e%2e%2f.codex/sentinel.txt',
        '/assets/%2e%2e%5c.codex%5csentinel.txt', '/assets/nested%5c..%5c..%5c.git%5cconfig',
        '/assets/../../outside/sentinel.txt', '//assets/nested/icon.png'
    ];
    for (const target of targets) {
        const response = await request(target);
        assert.equal(response.status, 403, target);
        assert.ok(!response.body.includes('SYNTHETIC_PRIVATE_SENTINEL'), target);
    }
    const doubleEncoded = await request('/assets/%252e%252e%252f.codex/sentinel.txt');
    assert.equal(doubleEncoded.status, 404, 'a second decoding is never performed');
});

test('Static server confines symlink/junction targets to public roots', async t => {
    const { root, temporary, request } = await fixture(t);
    const directoryLink = process.platform === 'win32' ? 'junction' : 'dir';
    for (const [name, target] of [['private-link', path.join(root, '.codex')], ['git-link', path.join(root, '.git')], ['outside-link', path.join(temporary, 'outside')], ['public-link', path.join(root, 'assets/nested')]]) {
        fs.symlinkSync(target, path.join(root, 'assets', name), directoryLink);
    }
    for (const target of ['/assets/private-link/sentinel.txt', '/assets/git-link/config', '/assets/outside-link/sentinel.txt']) {
        const response = await request(target);
        assert.equal(response.status, 403, target);
        assert.ok(!response.body.includes('SYNTHETIC_PRIVATE_SENTINEL'));
    }
    assert.equal((await request('/assets/public-link/icon.png')).body, 'PUBLIC_ASSET');
});

test('Static server removes connection hints only from the served HTML copy', async t => {
    const { root, request } = await fixture(t);
    const response = await request('/');
    assert.doesNotMatch(response.body, /preconnect|dns-prefetch/);
    assert.match(response.body, /rel="stylesheet"/);
    assert.match(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), /preconnect/);
});

test('Static server substitutes disabled feedback and analytics configuration', async t => {
    const { request } = await fixture(t);
    assert.match((await request('/js/feedback-config.js?v=1')).body, /feedbackApiUrl: ''/);
    assert.match((await request('/js/analytics-config.js')).body, /measurementId: ''/);
});

test('Static server rejects malformed paths and HTTP writes', async t => {
    const { request } = await fixture(t);
    for (const target of ['/assets/%zz', '/assets/%00icon.png']) assert.equal((await request(target)).status, 400);
    for (const method of ['POST', 'PUT', 'DELETE']) assert.equal((await request('/data/toons.json', method)).status, 405);
});

test('Static server shutdown requires this run\'s secret token', async t => {
    const { request, server } = await fixture(t, 'synthetic-run-token');
    assert.equal((await request('/__test_shutdown', 'POST', { 'x-test-shutdown-token': 'wrong-token' })).status, 405);
    const closed = once(server, 'close');
    assert.equal((await request('/__test_shutdown', 'POST', { 'x-test-shutdown-token': 'synthetic-run-token' })).status, 204);
    await closed;
});
