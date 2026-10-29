# 03: README accessibility section and loading-announcement pattern

**What to build:** A developer reading the README learns how the
button behaves for assistive technology, and how to announce a loading
state correctly. The button does not announce loading itself. The app
owns that, and the README shows how.

Parent spec: `.scratch/aria-cleanup/spec.md`

Scope:

- A short accessibility section in the README covers three points. The
  inner button relies on native semantics: no `role`, no
  `aria-disabled`, and native `disabled` is the source of truth.
  `aria-live` is opt-in through the host. `aria-busy` is set while
  spinning.
- The loading-announcement pattern: the app renders a single
  `role="status"` element. It stays in the DOM and may be visually
  hidden. The app sets its text when spinning starts (for example
  "Saving") and when spinning ends (for example "Saved").
- The README explains why the message goes in a separate region. The
  status element is already in the DOM before its text changes, so the
  announcement is reliable, and it does not depend on focus.
- A short upgrade note for consumers who relied on the default
  `aria-live`: set `aria-live` on the host to get it back.
- Versioning and publishing stay with the maintainer. Do not edit
  `CHANGELOG.md` by hand, because `auto-changelog` generates it.

**Blocked by:** 01 (Inner button relies on native role and disabled
state), 02 (`aria-live` is opt-in through the host)

**Status:** ready-for-agent

- [ ] The README has an accessibility section that matches the behavior
      shipped in 01 and 02.
- [ ] The README documents the `role="status"` loading-announcement
      pattern with a short example, and explains why a separate region
      is used.
- [ ] The README includes the upgrade note about restoring `aria-live`
      by setting it on the host.
- [ ] The docs use `--` instead of em dashes and `->` instead of arrow
      characters.
- [ ] No tests are added for the docs.
