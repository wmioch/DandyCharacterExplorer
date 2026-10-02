# Explorer validation

Use Node 22 or newer. The static frontend still has no build step. Tests validate the currently supported calculator scenarios; they do not establish that disputed community-source values are true in game.

```powershell
npm ci --ignore-scripts
npx playwright install chromium
npm run validate
```

`npm test` runs data/asset integrity, frontend syntax, calculator regressions and synthetic test-server isolation cases. `npm run test:browser` exercises actual controls in fresh desktop and mobile Chromium contexts. It covers Toon selection, Advanced edits and cancellation, Looey's manual heart tier, cards/debuffs, machine timing, and Dyle's speed qualification, plus request-isolation proofs. Real iOS Safari long-press behavior still needs device verification.

The loopback-only test server uses port 4399, disables production feedback and analytics, serves only public frontend files through GET, and never reuses an existing server. Encoded traversal and private paths are rejected; canonical filenames are confined to public roots after resolving symlinks/junctions. The served HTML copy removes preconnect and DNS-prefetch hints without editing the app. Optional Google Fonts CSS is fulfilled locally without contacting Google. Context-wide routing permits GET only to the exact test origin, includes popup-first requests, and blocks writes, other loopback ports, external requests and WebSockets; service workers are disabled. Synthetic fixtures prove these boundaries without reading real private files. Browser contexts have disposable storage. No user browser/profile, PollingStation data, API submission, or production account is used. Teardown closes only this run's server through an ephemeral-token shutdown endpoint. If the port is occupied, set `DANDY_TEST_PORT` to an unused port; do not terminate the existing process.

For a separate committed app snapshot, set `DANDY_APP_ROOT` to its absolute path before running the harness. Both the engine tests and HTTP server then read that snapshot. Record the tested app commit and harness commit separately; passing against one does not validate another.

Before an automatic small release: review the scope and sources, run `npm run validate`, parse changed JSON, and run `git diff --check` in an isolated checkout. A failure blocks publication until diagnosed. Missing browsers, network/install failures, or unavailable CI are reported as unavailable, never passed. After a reviewed PR is pushed, verify the validation workflow for its exact head commit. After an authorized main push, verify the exact Pages deployment and live read-only smoke. Existing Pages hosting is unchanged: the new validation workflow does not itself impose GitHub branch protection or gate branch-based Pages deployment.

Failure screenshots and traces are saved under ignored `output/playwright/`; CI retains them for seven days. Do not upload private feedback or user-session artifacts.

Regression boundaries retained:

- Looey's selected missing-heart tier changes manually after healing; Health remains maximum capacity.
- Tech Savvy changes 45 work units to 40; time savings depend on extraction speed.
- Item buffs do not simulate inventory pickups for Whispering Flower.
- Zero Great Rate stays zero through machine snapshots.
- Waxwell's Ignite checkbox controls intrinsic Tired II; no timer is introduced.
- Party Crashers remains investigation-only until effects and authentic artwork are verified.

The separate Azure feedback backend is unaffected. There is no backend contract suite in this change; no live provider writes or credential-backed tests are allowed by frontend validation.
