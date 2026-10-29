# `@substrate-system/button`: remove `aria-live` and redundant ARIA

**Status:** ready-for-agent
**Package:** `@substrate-system/button` (repo `~/code/button`), present
through 0.0.54
**Source:** feedback from `knitting-party`: "aria-live on a button is a
bit odd for screen readers"

## Problem Statement

Every `<substrate-button>` renders its inner `<button>` with
`aria-live="polite"`, `role="button"`, and an `aria-disabled` value that
the element keeps up to date. Screen reader users get no benefit from
these attributes, and some of them cause problems:

- `aria-live` turns each button into a live region. The spinner is
  pure CSS, so starting or stopping it changes no text and nothing is
  announced. While spinning, `aria-busy="true"` holds live-region
  announcements back anyway. The only thing that ever gets announced is
  a label change (for example "Save" -> "Saved"). If the button has
  focus, the screen reader already reads the new name on its own, so the
  user hears it twice. If the button does not have focus, the user hears
  an announcement from a control they are not on. Screen readers also
  handle live regions on focusable controls inconsistently.
- `role="button"` on a native `<button>` repeats the implicit role.
  Accessibility linters and audits flag it.
- `aria-disabled` repeats the native `disabled` state, and the two can
  disagree. `aria-disabled` follows only the host's `disabled`
  attribute, while native `disabled` also follows `spinning`. So a
  button that is spinning but not otherwise disabled is natively
  disabled and also has `aria-disabled="false"`.
- A consumer cannot opt in to `aria-live` themselves. The renderer
  treats `aria-live` as one of its own attributes, so if a consumer
  passes it, the value is dropped without any warning.

## Solution

The inner `<button>` uses native semantics only. It has no
`aria-live`, no `role`, and no `aria-disabled`. The browser and screen
readers get the disabled state from the native `disabled` attribute.
`aria-busy` stays as it is.

`aria-live` becomes a forwarded attribute. A consumer who really does
want label changes announced can set it on the host. Like the other
forwarded attributes, it then reaches the inner button and keeps
following the host when it changes.

The README explains how to announce a loading state properly: the app
owns a separate `role="status"` region and writes a short message to it
when spinning starts and ends. The button does not build this in.

## User Stories

1. As a screen reader user, I want a button label change to be read
   once, so that I don't hear the same name twice when I'm on the
   button.
2. As a screen reader user, I want a button I'm not on to stay quiet
   when its label changes, so that I'm not interrupted by unrelated
   controls.
3. As a screen reader user, I want a spinning button to be reported as
   disabled consistently, so that I don't get mixed signals about
   whether I can press it.
4. As a developer running an accessibility audit, I want the button to
   have no redundant role, so that the audit doesn't report noise
   coming from the component.
5. As a developer who wants label changes announced, I want to set
   `aria-live` on the host and have it reach the inner button, so that I
   can opt in without rendering the button myself.
6. As a developer who wants the loading state announced, I want a
   documented pattern for doing it, so that I know where that
   responsibility sits and how to do it.

## Implementation Decisions

- **HTML renderer** (the `html()` export, used for SSR and by the full
  element's own render):
  - Stop emitting `aria-live="polite"`.
  - Stop emitting `role="button"`.
  - Remove `aria-live` from the renderer's handled-keys set, so that an
    `aria-live` entry in `extraAttrs` passes through like any other
    extra attribute.
  - Keep `role` in the handled-keys set. A consumer-supplied `role` on
    a native button is almost always a mistake, and leaving it there
    keeps the current behavior of dropping it.
  - The `Attrs` type does not change. `aria-live` was never a named
    field.
- **Forwarded attributes**: add `aria-live` to the forwarded-attribute
  list. It is then observed and mirrored from host to inner button in
  both ways a button can be built: the full element rendering its own
  button, and hydration of an app-rendered button. Removing it from the
  host removes it from the inner button, which is how the other
  forwarded attributes already behave.
- **Disabled handling in the light (hydrating) element**: the `disabled`
  setter and the `disabled` attribute-change handler stop writing
  `aria-disabled`. Native `disabled` on the inner button stays the only
  source of truth. The spinning-keeps-disabled rules from the
  disabled-bug fix do not change.
- **Spinning handling**: no change. `aria-busy` is still set to `true`
  and `false` as it is today.
- **README**:
  - Add a short accessibility section. It says the inner button relies
    on native semantics, that `aria-live` is opt-in through the host,
    and that `aria-busy` is set while spinning.
  - Document the loading-announcement pattern. The app renders one
    `role="status"` element, which stays in the DOM and can be visually
    hidden, and sets its text when spinning starts ("Saving") and when
    it ends ("Saved"). Explain why the message goes in a separate
    region: the status element is already in the DOM before its text
    changes, so the announcement is reliable, and it doesn't depend on
    focus.
  - List `aria-live` with the other forwarded attributes wherever the
    README lists them.
- **Versioning**: the rendered markup changes, so this is a
  user-visible change. Release it as the next patch or minor, following
  the project's normal pre-1.0 practice. The changelog is generated by
  `auto-changelog`, so it is not edited by hand.

## Testing Decisions

- **Seam**: the public custom element, as used in the existing
  `test/index.ts` suite. Tests render `<substrate-button>` declaratively
  or through Preact, then check the inner button through `el.button`
  (or by querying it in the hydration case). This is the only seam
  needed, and no new seams are added.
- **What makes a good test here**: check attribute presence and values
  on the inner button, and how they change when host attributes change.
  Do not snapshot or string-match rendered HTML, and do not check text
  content or CSS.
- **Tests to add**:
  - A default-rendered button has no `aria-live`, no `role`, and no
    `aria-disabled` on the inner button.
  - Setting the host's `disabled`, through the attribute and through the
    property, toggles native `disabled` and never adds `aria-disabled`.
  - A host-declared `aria-live` reaches the inner button, a later
    `setAttribute('aria-live', ...)` updates it, and removing it from the
    host removes it from the inner button.
  - In the hydration case (the app renders the inner button), setting
    `aria-live` on the host forwards it to the app's button.
  - `spinning` still sets `aria-busy="true"`, and ending it sets
    `aria-busy="false"`. This guards against `aria-busy` being removed
    by accident along with the other attributes.
- **Prior art**: the forwarded-attribute tests ("value attribute is
  forwarded", "form-related attributes are forwarded", "title attribute
  is forwarded"), the spinning/disabled tests added by the disabled-bug
  fix, and "hydrates an inner button rendered by the app".
- **Existing tests**: none currently check `aria-live`, `role`, or
  `aria-disabled`, so no existing test should need to change. If one
  breaks, it was relying on markup details and should be rewritten to
  check behavior.

## Out of Scope

- Building a visually hidden live region or status message into the
  button.
- Forwarding `aria-label` on later changes. Today it is read only once,
  at render time. That is a separate gap.
- The default `tabindex="0"` that the renderer emits on a native button.
  It is also redundant, but it is not part of this feedback.
- Changes to spinner visuals or CSS.
- Making `aria-busy` more meaningful to screen readers on a button.
  Most of them ignore it there. It is kept as a harmless hook for
  styling and tests.

## Further Notes

- Consumers who currently depend on `aria-live` being present by
  default, for example in their own tests, will see it disappear. The
  release notes should say so and give the fix: set `aria-live` on the
  host.
- The `knitting-party` app is the first consumer to check after
  release. Its loading buttons are the place to try the `role="status"`
  pattern.
