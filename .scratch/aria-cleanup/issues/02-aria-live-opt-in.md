# 02: `aria-live` is opt-in through the host

**What to build:** The inner `<button>` no longer has
`aria-live="polite"` by default, so label changes are not announced
twice for a focused button, and an unfocused button does not interrupt
the user. A developer who does want label changes announced sets
`aria-live` on the `<substrate-button>` host. Like the other forwarded
attributes, it reaches the inner button and keeps following the host as
it changes or is removed. This works for the full element rendering its
own button and for hydration of an app-rendered button.

Parent spec: `.scratch/aria-cleanup/spec.md`

Scope:

- The HTML renderer stops emitting `aria-live="polite"`.
- `aria-live` is removed from the renderer's handled-keys set, so an
  `aria-live` entry in `extraAttrs` passes through like any other extra
  attribute.
- `aria-live` is added to the forwarded-attribute list. That list feeds
  the observed attributes, so changes on the host are mirrored to the
  inner button.
- The README lists `aria-live` with the other forwarded attributes
  everywhere the README lists them.

**Blocked by:** None (can start immediately). This ticket and 01 both
edit the renderer's attribute handling and the test suite, so running
them one after the other avoids a small merge conflict.

**Status:** done

- [x] A default-rendered button has no `aria-live` on the inner button.
- [x] A host declared with `aria-live` has the same value on the inner
      button.
- [x] A later `setAttribute('aria-live', ...)` on the host updates the
      inner button.
- [x] Removing `aria-live` from the host removes it from the inner
      button.
- [x] Hydration case: when the app renders the inner button, setting
      `aria-live` on the host forwards it to the app's button.
- [x] Tests follow the existing forwarded-attribute tests ("value
      attribute is forwarded", "title attribute is forwarded",
      "hydrates an inner button rendered by the app"). They check
      attributes only, with no HTML snapshots or string matching.
- [x] The README's forwarded-attribute list(s) include `aria-live`.
- [x] The commit message says `aria-live` is no longer rendered by
      default and that consumers restore it by setting `aria-live` on
      the host.
