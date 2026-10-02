# Scheduled maintenance

Will approved this replacement policy on October 3, 2026 (Australia/Sydney). It supersedes the saved no-testing and full-audit-every-run rules. The existing Friday/Saturday 07:00 Sydney heartbeat and its review thread remain; no duplicate automation is needed. The video workflow, its daily scans and exact-package upload approvals are independent and unchanged.

## Routine checks and full reviews

On each wake, read the ignored `.codex/dandy-maintenance-ledger.json`, current Git status, latest task activity, source checkpoints and unreleased preview history. Resume existing work instead of rebuilding completed inventories.

Routine Friday/Saturday runs review changed evidence and affected consumers. Check accessible official Blushcrunch Discord messages only through an already-running, connected Chrome session without desktop focus. Otherwise record the gap and use official Roblox metadata, public changelogs and revision-aware wiki/API checks. Do not require login, retrieve credentials, bypass access controls, or repeatedly fetch an unchanged blocked source during one run.

Keep `.codex/maintenance-source-state.json` private with per-source URL, last successfully reviewed revision/date, retrieval date, affected candidate IDs, source availability and unresolved findings. Compare revisions or content hashes and inspect semantic changes; a page edit alone is not a gameplay update. Include new roster/index entries and official release changes, not just existing records. Use the latest completed baseline as the initial checkpoint lead; never claim historical coverage beyond its evidence dates. Commit a checkpoint only after all changes through that source revision have individual dispositions. Failures retain the previous successful checkpoint. Recheck conflicts when relevant evidence changes, retaining prior history.

Perform a full item-by-item audit **monthly**, on the first Friday wake of each Australia/Sydney month. If the latest accepted complete audit is already from that month, use routine review instead. An unfinished monthly audit resumes at the next wake from unique remaining candidate IDs; do not restart when the date changes. Every item still receives a personally authored source/consumer disposition. Scripts may retrieve, count and validate, but cannot classify disputed facts as correct. Record verified, unresolved, unverifiable and unreviewed separately. A major release prompts targeted new/reworked-content review immediately; it does not automatically repeat the whole baseline.

## Coordination and delivery

Inspect current task activity before writes. If a previous maintenance turn is still active, do not edit its checkout or ledger concurrently; report the occupied run and defer competing work. Work in a task-owned isolated branch/checkout based on current `origin/main`, preserving unrelated edits. Recheck the source/main head before integration and rerun validation after rebasing or any source change. Never force-push, reset user work, or silently rewrite an active run's checkpoint. Write private ledger updates only from the coordinating turn after comparing the state last read.

Simple bounded, source-backed fixes may continue under existing automatic publishing authority, after the [validation gate](testing.md). Larger mechanics, UI, schema and feature bundles may be developed in the separate `codex/local-preview` worktree, but require Will's explicit approval of named features and their disclosed dependencies before release. Use draft PRs for code requiring review. An open draft PR is not release authorization; the September 22 approval does not extend to newer preview bundles.

Keep production feedback disabled in all test/preview contexts. Read only Dandy PollingStation feedback. Preserve every ID and sanitized history; never delete feedback. Mark addressed only once the entire request is resolved and, for preview work, released. Continue to split multi-request messages.

No paid services, cloud-hosting migration, Azure backend deployment, credential/security changes or new public preview exposure are authorized by this policy. Do not alter the separate video task or upload approvals. Cooldown statistics remain deferred. Party Crashers, Dandycorn and other missing or disputed mechanics remain evidence investigations.

## Reports

Report meaningful source changes, fixes, failed/unavailable checks, newly important coverage gaps and genuine user decisions. Keep unchanged conflicts and preview items in the ledger; avoid repeating their full history every wake. Stay quiet when there is no meaningful change and no new actionable failure. Monthly audit reports include exact inventory/progress counts.

For each published batch, retain source/check dates, affected records/files, tested app/harness commits, check results, commit/push outcome, exact CI/Pages result and live read-only verification. For preview recommendations, provide a short prioritized table of feature ID, scope/dependencies, verified checks, remaining limits and requested release decision. Unchecked previews are candidates for validation, not approved releases. Product questions, source uncertainty and environment failures remain separate.
