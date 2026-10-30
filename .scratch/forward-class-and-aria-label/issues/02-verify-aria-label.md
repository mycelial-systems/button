# 02: Verify ariaLabel and host aria-label against the spec

**What to build:** Confirm that the accessible name of a
`<substrate-button>` lives on the inner button only, through an
`ariaLabel` property, and that a host `aria-label` attribute moves onto
the inner button and off the host, on both a button the element
renders itself and a button the app rendered before hydration. The
branch already carries the implementation and tests. Audit the code
and the browser suite against the spec's label decisions and close any
divergence.

One known gap: the spec's Testing Decisions say every label test
asserts the host carries no `aria-label`. The Preact app-rendered
button swap test does not. Add that assertion.

Decisions to check, from `.scratch/forward-class-and-aria-label/spec.md`:

- `ariaLabel` is a getter and setter on the light element overriding
  ARIAMixin reflection. The setter treats `null` and the empty string
  as no label, stores the value, sets or removes `aria-label` on the
  inner button when one exists, and removes any host `aria-label`. The
  getter reads the inner button when one exists, otherwise the stored
  value.
- The `aria-label` attribute handler forwards a non-null value into the
  setter and ignores `null`.
- The full renderer reads the label from `ariaLabel`, not from the host
  attribute.
- After hydration of an app-rendered button, `connectedCallback` applies
  any stored label to that button.
- `aria-label` is an observed attribute with its own handler and is not
  in the generic forwarded-attribute list.

**Blocked by:** None (can start immediately)

**Touches:** `src/client.ts` (`ariaLabel` getter and setter,
`handleChange_aria-label`, `connectedCallback` in the light element),
`src/index.ts` (full renderer reads `this.ariaLabel`), `src/html.ts`
(`HANDLED_KEYS` includes `aria-label`), `test/index.ts` (aria-label
and ariaLabel tests).

**Status:** ready-for-agent

- [ ] A host `aria-label` present at upgrade ends up on `el.button` and
      the host has no `aria-label`
- [ ] A host `aria-label` set after upgrade ends up on `el.button` and
      the host has no `aria-label`
- [ ] Setting `el.ariaLabel` names `el.button`, the getter reads it
      back, and the host has no `aria-label`
- [ ] Setting `el.ariaLabel` to the empty string clears the label on
      `el.button`
- [ ] Setting `el.ariaLabel` to `null` clears the label on `el.button`
- [ ] `ariaLabel` set before connect reaches the button the element
      builds
- [ ] A Preact `ariaLabel` prop that changes and is then removed
      updates and then clears the label on `el.button`, and the host
      has no `aria-label`
- [ ] A Preact `ariaLabel` prop names an app-rendered `el.button`
      after hydration, and the host has no `aria-label`
- [ ] The app-rendered button swap test asserts the host has no
      `aria-label`
- [ ] `npm run lint` and `esbuild test/index.ts --bundle | tapout`
      pass after any change
