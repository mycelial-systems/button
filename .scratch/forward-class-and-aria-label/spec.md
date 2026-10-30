# Forward `class` and `aria-label` to the inner button after render

**Status:** ready-for-agent
**Package:** `@substrate-system/button`

## Problem Statement

An app renders `<substrate-button>` through a framework such as Preact
and later changes the host's `class` or `aria-label`. The element reads
both once, when it first builds the inner `<button>`, and never looks
again. A button whose variant class changes keeps its old look, and a
label change never reaches the native button that assistive technology
reads.

The host `aria-label` also has a second problem. `aria-label` on an
element with no role fails an axe audit, so apps have had to work
around the element with a `ref` and a layout effect that moves the
attribute by hand.

## Solution

The host's `class` follows onto the inner button for the life of the
element. Classes added to the host are added to the inner button, and
classes removed from the host are removed from it. The classes the
element itself owns on the inner button are never touched by a host
class change.

The accessible name is exposed as an `ariaLabel` property that names the
inner button only. A host `aria-label` attribute, whether present at
upgrade or set later, moves onto the inner button and is removed from
the host. Setting `ariaLabel` to an empty string or `null` clears the
label. A framework passes `ariaLabel` as a property and removing the
prop clears the label.

Both behaviors apply to a button the element renders itself and to an
inner button the app rendered before the element hydrated it.

## User Stories

1. As an app developer using Preact, I want a changed `class` prop on
   `<substrate-button>` to reach the inner button, so that a button
   whose variant changes after the first render looks right.
2. As an app developer, I want the element's own inner-button classes
   left alone when I change the host class, so that a spinning or
   styled button does not lose its state when my classes change.
3. As an app developer, I want to pass `ariaLabel` as a property and
   have it name the inner button, so that the accessible name updates
   and clears as my state changes, without a `ref` or layout effect.
4. As an app developer, I want a host `aria-label` attribute moved onto
   the inner button and off the host, so that the page passes an axe
   audit without my app moving it by hand.
5. As an app developer who renders the inner button myself, I want the
   same class and label behavior on hydration, so that I do not need a
   separate code path for app-rendered buttons.

## Implementation Decisions

- Both changes live in the light element, the hydrate-only class the
  full element extends. The full element and the app-rendered
  hydration path therefore get them for free.
- `class` and `aria-label` are observed attributes with their own
  `handleChange_<name>` handlers, consistent with the convention noted
  in AGENTS.md. Neither is added to the generic forwarded-attribute
  list, because both need their own semantics and the HTML renderer
  already treats both as handled keys.
- The light element exports an `OWNED_CLASSES` constant listing the
  classes it manages on the inner button: `substrate-button`, `btn`,
  and `spinning`. A host class change never adds or removes a token in
  that list.
- The class handler applies the difference between the old and new
  host class lists to the inner button. It removes old tokens that are
  absent from the new list and adds new tokens that were absent from
  the old list, skipping owned classes. With no inner button yet it
  does nothing, because the full renderer copies the host class when
  it builds the button.
- The element toggles `spinning` on its own host class list, which
  fires the class handler. Because `spinning` is an owned class, that
  call is a no-op on the inner button and cannot loop.
- Preact sets the host `class` before the app-rendered button is
  connected, so the class handler finds no button at that moment. The
  light element's `connectedCallback` therefore re-applies the host
  class once after hydration. Adding a token already present is a
  no-op, so this is safe for the element-rendered path too.
- `ariaLabel` is a getter and setter pair on the light element that
  overrides the ARIAMixin reflection. The setter treats `null` and the
  empty string as "no label", because Preact writes an empty string
  for a removed property prop. It stores the value, sets or removes
  `aria-label` on the inner button when one exists, and removes any
  `aria-label` attribute from the host. The getter reads from the inner
  button when one exists and otherwise returns the stored value, so a
  label set before the button is built is not lost.
- The `aria-label` attribute handler forwards a non-null value into the
  `ariaLabel` setter, which then removes the host attribute. The
  handler ignores `null`, because that call is its own removal.
- The full renderer reads the label from `ariaLabel` rather than from
  the host attribute, because the upgrade-time handler may already have
  moved it into the stored value.
- After hydration of an app-rendered button, `connectedCallback`
  applies any stored label to that button, so `ariaLabel` set as a
  Preact prop before connect still names the app's button.
- Removing `aria-label` from the host after the element has seen it
  does nothing, because the attribute is no longer there. Clearing the
  label is done through the `ariaLabel` property.
- On an app-rendered button, the app owns the button's `class`. If the
  app rewrites that attribute it must include any host classes it wants
  kept. If the app replaces its button element, the new button does
  not receive the host class or label again. This is documented rather
  than handled.
- README documents the class following behavior, the `ariaLabel`
  property, how to clear it, and the framework guidance to pass
  `ariaLabel` as a property.
- `CHANGELOG.md` is not edited by hand. It is generated at release.

## Testing Decisions

- Tests exercise the public custom-element seam only: a
  `<substrate-button>` host in the document and its `button` property.
  They assert on attributes, properties, and class list membership of
  the host and inner button. They never compare rendered HTML strings,
  text content, or computed styles.
- Two entry paths are covered for each behavior: a host the full
  element renders itself, created through document markup or
  `document.createElement`, and an inner button the app rendered
  before hydration, created through Preact and `htm`.
- Preact re-render cases cover the actual framework contract: a `class`
  prop that changes between renders, and an `ariaLabel` prop that
  changes and is then removed.
- The owned-class guarantee is tested on a spinning host, so the test
  also covers the element's own class toggling firing the handler.
- The empty-string and `null` clearing cases for `ariaLabel` are each
  tested, and every label test asserts the host carries no
  `aria-label`.
- Prior art: the `aria-live` forwarding tests and the Preact label
  reactivity test in the existing browser suite, plus the
  app-rendered hydration tests. The suite runs with
  `esbuild test/index.ts --bundle | tapout` as part of `npm test`.

## Out of Scope

- Forwarding any other ARIA attribute. `aria-live` is already
  forwarded generically and `aria-busy` is managed by spinning.
- Re-applying the host class or label when an app swaps out its own
  inner button element after hydration.
- Changes to the server-side HTML renderer's output shape beyond
  reading the label through `ariaLabel`.
- Any change to the element's CSS.
- Changes in consuming apps. The `knitting-party` button wrapper can
  drop its `ref` and layout effect and pass `ariaLabel` once this is
  released, but that is a follow-up in that repo.

## Further Notes

- This branch already carries an implementation and tests that match
  this spec. An agent picking this up should verify the suite and lint
  pass rather than start over, and treat any divergence between this
  spec and the code as a bug in the code.
- This spec fills the gap the earlier `aria-cleanup` spec marked out of
  scope: forwarding `aria-label` on later changes.
