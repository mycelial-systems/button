<!-- nightralph:review from=2738274d75a68671f062eeab4393d06393e489c8 to=fa72c14c35ab95022a2b1abc40daaba826ade9ef status=fixed -->
## 2026-10-29 12:43 -- review 2738274..fa72c14 -- 0 of 1 fixed
- [ ] Bump the package version for this user-visible markup change
    package.json:3 still declares 0.0.54, so publishing this branch after
    0.0.54 has already been released will be rejected (or cannot identify
    these changed semantics as a new release).

### Fix
- attempts: 2 of 4
- effort: high
- agent exit code: 0
- result: merged

# Review-fix notes

## Version bump

- Added a manifest-level release-version test as the red TDD step. The
  documented latest release is v0.0.54, so this user-visible change needs
  the next patch version, 0.0.55.
- Updated `package.json` to 0.0.55 and included the assertion in `npm test`
  so future releases cannot accidentally reuse the published v0.0.54 value.
- `npm test` reached the CSS build but stopped before the browser suite because
  `node_modules/.bin/lightningcss` is an invalid launcher (`This: command not
  found`). This is the same pre-existing environment issue recorded by the
  prior attempt. Both the library and CLI publish a `lightningcss` binary, and
  npm linked the library's Windows-only placeholder. The build scripts now
  invoke the installed CLI binary directly, which is available on this
  platform; this is required for the mandated final `npm test` gate to reach
  the browser suite.
- Verification passed: `node test/package-version.js`, `npm run lint`, and
  the final `npm test` (build plus 72 browser tests).
---
