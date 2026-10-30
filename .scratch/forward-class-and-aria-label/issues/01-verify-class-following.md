# 01: Verify host class following against the spec

**What to build:** Confirm that a `<substrate-button>` host's `class`
follows onto the inner button for the life of the element, on both a
button the element renders itself and a button the app rendered before
hydration. The branch already carries the implementation and tests.
Audit the code and the browser suite against the spec's class
decisions and close any divergence, treating a mismatch as a bug in
the code or a missing test, not in the spec.

Decisions to check, from `.scratch/forward-class-and-aria-label/spec.md`:

- The light element exports `OWNED_CLASSES` listing `substrate-button`,
  `btn`, and `spinning`, and a host class change never adds or removes
  any of those on the inner button.
- The class handler applies the difference between the old and new host
  class lists: removes old tokens absent from the new list, adds new
  tokens absent from the old list, skipping owned classes. With no
  inner button yet it does nothing.
- The element's own `spinning` toggle on the host fires the handler and
  is a no-op on the inner button.
- The light element's `connectedCallback` re-applies the host class once
  after hydration so a Preact-set class reaches an app-rendered button.
- `class` is an observed attribute with its own `handleChange_class`
  handler and is not in the generic forwarded-attribute list.

**Blocked by:** None (can start immediately)

**Touches:** `src/client.ts` (`OWNED_CLASSES`, `handleChange_class`,
`connectedCallback` in the light element), `test/index.ts` (class
forwarding and hydration tests), `src/html.ts` (`HANDLED_KEYS`
includes `class`).

**Status:** ready-for-agent

- [ ] Adding a class to a rendered host adds it to `el.button`
- [ ] Changing a rendered host's class removes the old token from
      `el.button` and adds the new one
- [ ] On a spinning host, changing the host class leaves
      `substrate-button`, `btn`, and `spinning` on `el.button`
- [ ] A Preact `class` prop that changes between renders updates
      `el.button` on a button the element rendered
- [ ] A Preact `class` prop that changes between renders updates an
      app-rendered `el.button` and keeps the app's own classes
- [ ] The first host class reaches an app-rendered `el.button` after
      hydration
- [ ] `npm run lint` and `esbuild test/index.ts --bundle | tapout`
      pass after any change
