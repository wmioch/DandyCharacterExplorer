module.exports = async () => {
    // Shut down only the server created by this run, including on Windows where
    // terminating the shell's child process tree can be restricted.
    const token = process.env.DANDY_TEST_SHUTDOWN_TOKEN;
    if (!token) return;
    try {
        await fetch(`http://127.0.0.1:${process.env.DANDY_TEST_PORT || 4399}/__test_shutdown`, {
            method: 'POST', headers: { 'x-test-shutdown-token': token }, signal: AbortSignal.timeout(2000)
        });
    } catch { /* Server may already have exited or failed to start. */ }
};
