# 01: Inner button relies on native role and disabled state

**What to build:** The inner `<button>` of every `<substrate-button>`
stops carrying `role="button"` and `aria-disabled`. Screen readers and
audits get the role and the disabled state from the native element
only. Today a button that is spinning but not otherwise disabled is
natively `disabled` while also reporting `aria-disabled="false"`. After
this ticket it reports disabled one way only, through native `disabled`.

Parent spec: `.scratch/aria-cleanup/spec.md`

Scope:

- The HTML renderer (`html()` export, used for SSR and by the full
  element's render) no longer emits `role="button"`.
- `role` stays in the renderer's handled-keys set, so a consumer-supplied
  `role` in `extraAttrs` is still dropped. The `Attrs` type does not
  change.
- The light (hydrating) element's `disabled` setter and its `disabled`
  attribute-change handler stop writing `aria-disabled`. The
  spinning-keeps-disabled rules from the disabled-bug fix do not change.
- Spinning handling does not change: `aria-busy` is still set to `true`
  and `false`.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] A default-rendered button has no `role` and no `aria-disabled` on
      the inner button (checked through `el.button`).
- [x] Setting the host's `disabled` attribute toggles native `disabled`
      on the inner button and never adds `aria-disabled`.
- [x] Setting the host's `disabled` property toggles native `disabled`
      on the inner button and never adds `aria-disabled`.
- [x] Starting `spinning` sets `aria-busy="true"` on the inner button,
      and ending it sets `aria-busy="false"`.
- [x] The existing spinning/disabled tests still pass unchanged.
- [x] Tests check attribute presence and values only. They do not
      snapshot or string-match rendered HTML, and do not check text or
      CSS.
- [x] The commit message says `role` and `aria-disabled` are no longer
      rendered, so that the generated changelog records it.
