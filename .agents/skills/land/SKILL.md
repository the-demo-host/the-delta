---
name: land
description: >-
  Land changes in the Live Q&A demo by pushing to the local served main branch.
  Invoke only when the user explicitly requests landing or merging changes,
  not for review, preparation, passing checks, or skill installation.
disable-model-invocation: true
metadata:
  delta-action: land
---

# Land Live Q&A changes

An explicit invocation authorizes landing the requested change. Proceed without
asking for the same merge permission again. Stop for actual blockers or unclear
scope. Installing this skill alone does not authorize execution.

## Destination and safety

This workflow applies only to the Live Q&A demo whose `local` remote points to
`/live/.git`. The destination is the checked-out `main` branch in `/live`, not
GitHub. `README.md`, “Workshop server”, and the `live-qa` systemd service describe
the served checkout and automatic rebuild.

1. Inspect the current diff, Git status, applicable instructions, remotes, and
   destination status. Confirm `/live` is on `main`, its tracked working tree is
   clean, and the local remote still identifies `/live/.git`. Preserve unrelated
   changes, including untracked files; do not stash, reset, clean, or force-push.
   Stop if requested scope or destination identity is ambiguous.
2. Check current repository contribution policies and hooks. Honor applicable
   signing, review, and verification requirements if any have been added. Do not
   bypass them. No hosted PR or CI workflow was present when configured; do not
   invent one or publish to `origin`.
3. Use Node.js >=24 (`package.json`, `engines.node`). Verify dependencies and
   runtime availability. If dependencies are missing, use `npm ci` with the
   committed `package-lock.json`; stop on installation errors.
4. Fetch `main` from `local`, record the destination commit, and inspect divergence.
   Stage only explicitly scoped files and commit the requested work with a
   concise descriptive message, preserving configured signing settings. Prefix
   editor-capable Git commands with `GIT_EDITOR=true`. Do not include secrets,
   generated output, or unrelated work. Existing scoped commits may be reused.
5. Merge the fetched destination history into the landing candidate without
   rewriting shared history. Resolve clear-cut conflicts automatically when the
   intended result is evident. Preserve unrelated work. Stop and explain
   ambiguous conflicts or unsafe changes rather than guessing.

## Verification

Verify the final integrated candidate, not an earlier version:

- `npm run build` must pass (`package.json`, `scripts.build`: `vite build`;
  `vite.config.ts` defines `/live/` and the `dist` output).
- `npm run typecheck` must pass (`package.json`, `scripts.typecheck`:
  `tsc --noEmit`).
- Run `npm test` (`package.json`, `scripts.test`: `vitest run`;
  `vitest.config.ts` includes `tests/**/*.test.{ts,tsx}`).
  Workshop feature tests are deliberately unfinished (`README.md`, “Running the
  project”). If tests fail, run the same test command against the recorded
  destination baseline in a disposable checkout inside the workspace, with the
  same runtime and locked dependencies. Compare individual failing test names
  and causes, not merely failure counts. Only confirmed pre-existing failures
  attributable to unfinished workshop features may remain. Require core tests
  and any newly added or changed feature's relevant tests to pass. New failures,
  missing results, infrastructure errors, or unverifiable baseline comparisons
  block landing. Do not use `npm run progress` as a gate: it masks failure.
- Check applicable current required checks/reviews, if any. All must pass for
  the exact candidate. Pending, missing, failing, or unverifiable required checks
  are blockers. Never assume checks will pass.

If destination history advances, integrate it and repeat verification on the
new candidate before pushing.

## Push and verify

1. Recheck destination branch, cleanliness, identity, and tip immediately before
   pushing. Confirm the verified candidate contains that tip. Do not overwrite
   concurrent edits.
2. Push only the candidate to the local destination:

   ```sh
   git push --receive-pack='git -c receive.denyCurrentBranch=updateInstead receive-pack' local HEAD:refs/heads/main
   ```

   This per-command receiver configuration updates the checked-out branch only
   when Git considers its index and worktree safe. It does not persist a
   configuration change. Never substitute `ignore`, `warn`, force-push, or a
   direct ref update. Respect rejection; inspect the actual cause. For concurrent
   history advancement, fetch, integrate, and reverify. For dirty destination or
   permissions problems, stop rather than changing ownership, clearing work, or
   bypassing safeguards.
3. Verify the destination `refs/heads/main` and `/live` checked-out `HEAD` equal
   the landed candidate and the tracked checkout is clean. The service runs
   `npm run live` (`package.json`, `scripts.live`), which watches the server,
   rebuilds the frontend, and updates test progress. Do not reset the database
   or restart the service as routine landing steps.
4. Confirm the service is active and request
   `http://127.0.0.1:3000/live/`. Allow a bounded rebuild interval and verify that
   the served page and referenced assets reflect the change where practical;
   an HTTP success alone is not proof that the new frontend was built.
   `README.md`, “Workshop server”, documents the public URL
   `https://demo.itisluiz.com/live/`.
5. Report the destination commit, checks actually run, any verified baseline
   failures, and serving verification. A commit or branch publication alone is
   not success. If the push succeeded but serving verification failed, state
   that the code landed but deployment verification is blocked; do not claim
   nothing landed or attempt an unrequested rollback.
