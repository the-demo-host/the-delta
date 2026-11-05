---
name: land
description: >-
  Land changes in the Live Q&A demo by pushing the verified main branch to origin.
  Invoke only when the user explicitly requests landing or merging changes,
  not for review, preparation, passing checks, or skill installation.
disable-model-invocation: true
metadata:
  delta-action: land
---

# Land Live Q&A changes to origin

An explicit invocation authorizes landing the requested change. Proceed without
asking for the same merge permission again. Stop for actual blockers or unclear
scope. Installing this skill alone does not authorize execution.

## Destination and safety

This workflow applies only to the Live Q&A demo repository. The destination is
the `main` branch of the configured `origin` remote. Verify that `origin`
identifies the intended repository before publishing; stop if it is missing,
ambiguous, or points somewhere unexpected. Do not substitute `local`, a hosted
pull request, or another remote.

1. Inspect the current diff, Git status, applicable instructions, remotes, and
   destination status. Confirm the current branch is `main`, the tracked working
   tree has no unrelated changes, and `origin` identifies the intended
   repository. Preserve unrelated changes, including untracked files;
   do not stash, reset, clean, or force-push. Stop if requested scope or
   destination identity is ambiguous.
2. Check current repository contribution policies and hooks. Honor applicable
   signing, review, and verification requirements if any have been added. Do not
   bypass them. If the repository requires a pull request or forbids direct
   pushes to `main`, stop and report that requirement rather than bypassing it.
3. Use Node.js >=24 (`package.json`, `engines.node`). Verify dependencies and
   runtime availability. If dependencies are missing, use `npm ci` with the
   committed `package-lock.json`; stop on installation errors.
4. Fetch `main` from `origin`, record the destination commit, and inspect
   divergence. Stage only explicitly scoped files and commit the requested work
   with a concise descriptive message, preserving configured signing settings.
   Prefix editor-capable Git commands with `GIT_EDITOR=true`. Do not include
   secrets, generated output, or unrelated work. Existing scoped commits may be
   reused.
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

## Push to origin and verify

1. Recheck destination branch, cleanliness, identity, and tip immediately before
   pushing. Confirm the verified candidate contains that tip. Do not overwrite
   concurrent edits.
2. Push only the candidate to `origin`:

   ```sh
   git push origin HEAD:refs/heads/main
   ```

   Never substitute a force-push or a direct ref update. Respect rejection;
   inspect the actual cause. For concurrent history advancement, fetch,
   integrate, and reverify. Stop rather than bypassing branch protection or
   permissions.
3. Verify `git ls-remote origin refs/heads/main` reports the landed candidate
   and the tracked checkout is clean. Pushing to origin does not itself deploy
   the local workshop service; do not reset the database or restart the service
   as a routine landing step.
4. Report the destination commit, checks actually run, and any verified baseline
   failures. A commit or branch publication alone is not success. If the push
   succeeded but deployment is separate or unavailable, state that plainly; do
   not claim local serving verification.
