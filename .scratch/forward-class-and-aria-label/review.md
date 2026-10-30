<!-- nightralph:review from=acc5c41e5ac356ee4d4828817d61f25bef0314cc to=57b6aff523c21b58925d7a067a79f450fc069866 status=fixed -->
## 2026-10-29 20:45 -- review acc5c41..57b6aff -- 1 of 2 fixed
- [ ] Swap test's label assertion is tautological and cannot fail
    test/index.ts:806 -- `t.equal(el.ariaLabel, el.button!.getAttribute('aria-label'))` compares the getter with the exact expression it returns (src/client.ts:168-170), so it passes whatever the swapped button carries. The message says the replaced button "has no label", but nothing checks that. Assert `el.button!.hasAttribute('aria-label') === false` and `el.ariaLabel === null` so the documented "no re-apply after a swap" behavior is actually pinned.
- [x] AGENTS.md states the tapout port-collision rule twice
    AGENTS.md:37-39 and AGENTS.md:51-55 -- the "Button tests" section and the new "Running the browser suite" section both say that tapout uses port 8123, fails with EADDRINUSE, and that you should wait rather than kill the other process. If one copy is edited later, the two will drift. Keep one copy (the new section) and drop the other.

### Fix
- attempts: 1 of 4
- effort: medium
- agent exit code: 0
- result: merged

# Notes

## Finding 1: tautological swap-test assertion -- done
- test/index.ts: replaced `el.ariaLabel === el.button.getAttribute(...)` with
  `!el.button.hasAttribute('aria-label')` and `el.ariaLabel === null`.
- Red check: temporarily made the `ariaLabel` getter return the stored
  label; the new assertion failed (not ok 107). Restored src, suite 108/108.

## Finding 2: duplicate tapout port rule in AGENTS.md -- done
- Removed the port/EADDRINUSE sentences from "Button tests"; kept the
  "Running the browser suite" section. No test (docs only).
- Added a short reusable note in "Button tests" on proving an assertion
  can fail by temporarily breaking src.
- Gate: `npm test` first failed with exit 127 (lightningcss placeholder);
  fixed with `node postinstall.js` in node_modules/lightningcss-cli as
  AGENTS.md documents. Then npm test exit 0, 108/108; lint clean.
---
