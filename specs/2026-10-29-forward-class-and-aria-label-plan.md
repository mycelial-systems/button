# Forward `class` and `aria-label` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:subagent-driven-development (recommended) or
> superpowers:executing-plans to implement this plan task-by-task. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `<substrate-button>` keeps its inner `<button>` in step with
later changes to the host's `class` and `aria-label`, so a framework
(Preact) can change them after the first render.

**Architecture:** Both changes live in the light element
(`src/client.ts`), so the full element and hydration both get them.
`class` becomes an observed attribute with a `handleChange_class` that
applies the difference between the old and new host class lists to the
inner button and never touches the classes the element owns.
`aria-label` gets an `ariaLabel` accessor that writes only to the inner
button. The host attribute is moved to the inner button and removed
from the host, because `aria-label` on a host with no role fails axe.

**Tech Stack:** TypeScript, `@substrate-system/web-component`, Preact
and `htm` (tests only), tapzero and tapout (browser tests), esbuild.

**Spec:** none written. The problem, found while using the full build
from `knitting-party`: `render()` reads the host's `class` and
`aria-label` once, when it builds the inner button, and neither is
observed afterwards. A `Button` whose `variant` or `className` changes
keeps its old look, and a label change never reaches the button.

## Global Constraints

- Run this after `.scratch/aria-cleanup` tickets 01 and 02, or rebase
  onto them: they edit `observedAttributes` in `src/client.ts` and
  append to `test/index.ts`, as this plan does. That spec lists
  "forwarding `aria-label` on later changes" as out of scope, and this
  plan is that gap.
- Classes the element owns on the inner button: `substrate-button`,
  `btn`, `spinning`. A host class change never adds or removes these.
- No `aria-label` stays on the host once the element has seen it.
- Do not add `class` or `aria-label` to `FORWARDED_ATTRS`. Both need a
  specific handler, and `html()` already treats both as handled keys.
- Tests check attributes and properties, never rendered HTML strings,
  text content, or CSS.
- Do not edit `CHANGELOG.md`; `auto-changelog` writes it.

## Review Focus

- Preact sets a removed property prop to `''`, not `null`
  (`dom[name] = value == null ? '' : value`). `ariaLabel = ''` must
  remove the label, not set an empty one. Tested in Task 2.
- A host class change while spinning must not drop `spinning` from the
  inner button. Tested in Task 1.
- The element adds and removes `spinning` on the host itself, which
  fires `handleChange_class`. That must not loop or touch the inner
  button's owned classes. Covered by the spinning test in Task 1.
- `aria-label` set during upgrade, before the inner button exists, must
  still reach the button the full element builds. Tested in Task 2.
- Hydration: a host class change must leave the app-rendered button's
  own classes alone, apart from the tokens that changed. Tested in
  Task 1.

---

### Task 1: Forward host `class` changes to the inner button

**Files:**
- Modify: `src/client.ts` (`observedAttributes`, new
  `handleChange_class`)
- Modify: `README.md` (the attributes section)
- Test: `test/index.ts` (append before `all done`)

**Interfaces:**
- Produces: `OWNED_CLASSES` (exported const, `readonly string[]`) in
  `src/client.ts`; `handleChange_class (oldValue:string|null,
  newValue:string|null):void` on the light `SubstrateButton`.

- [ ] **Step 1: Write the failing tests**

```ts
test('a class added to the host after render reaches the button',
    async t => {
        document.body.innerHTML +=
            '<substrate-button id="class-add">go</substrate-button>'
        const el = await waitFor('#class-add') as SubstrateButton
        el.classList.add('btn-primary')
        t.ok(el.button!.classList.contains('btn-primary'),
            'inner button gets the new class')
    })

test('a class removed from the host leaves the button', async t => {
    document.body.innerHTML += '<substrate-button id="class-remove" ' +
        'class="btn-primary">go</substrate-button>'
    const el = await waitFor('#class-remove') as SubstrateButton
    el.setAttribute('class', 'btn-secondary')
    t.ok(!el.button!.classList.contains('btn-primary'),
        'old class is removed')
    t.ok(el.button!.classList.contains('btn-secondary'),
        'new class is added')
})

test('a host class change keeps the classes the element owns',
    async t => {
        document.body.innerHTML += '<substrate-button id="class-owned" ' +
            'spinning>go</substrate-button>'
        const el = await waitFor('#class-owned') as SubstrateButton
        el.setAttribute('class', 'other')
        const list = el.button!.classList
        t.ok(list.contains('substrate-button'), 'keeps substrate-button')
        t.ok(list.contains('btn'), 'keeps btn')
        t.ok(list.contains('spinning'), 'keeps spinning')
    })

test('preact: changing class updates the inner button', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(html`<${SubstrateButton.TAG} class="a">go<//>`, container)
    render(html`<${SubstrateButton.TAG} class="b">go<//>`, container)
    const btn = container.querySelector('button')!
    t.ok(btn.classList.contains('b'), 'has the new class')
    t.ok(!btn.classList.contains('a'), 'does not keep the old class')
    container.remove()
})

test('hydration: a host class change keeps the app button classes',
    t => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        const view = (cls:string) => html`
            <${SubstrateButton.TAG} class=${cls}>
                <button class="substrate-button btn mine">
                    <span class="btn-content">save</span>
                </button>
            <//>
        `
        render(view('a'), container)
        render(view('b'), container)
        const btn = container.querySelector('button')!
        t.ok(btn.classList.contains('mine'), 'keeps the app class')
        t.ok(btn.classList.contains('b'), 'gets the new host class')
        container.remove()
    })
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: the five new tests fail (the inner button keeps its first
classes); every existing test passes.

- [ ] **Step 3: Implement**

In `src/client.ts`, export `OWNED_CLASSES = ['substrate-button', 'btn',
'spinning'] as const`, add `'class'` to `observedAttributes`, and add
`handleChange_class`. It splits both values on whitespace, and on
`this.button` removes each old token missing from the new list and
adds each new token missing from the old list, skipping every token in
`OWNED_CLASSES`. With no button yet it does nothing: `render()` in
`src/index.ts` already copies the host class when it builds the button.
In `README.md`, say that the host's `class` follows onto the inner
button, except the element's own classes.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test && npm run lint`
Expected: every test passes, lint is clean.

- [ ] **Step 5: Commit**

```bash
git add src/client.ts test/index.ts README.md
git commit -m "feat: forward host class changes to the inner button"
```

### Task 2: `ariaLabel` on the inner button, never on the host

**Files:**
- Modify: `src/client.ts` (`observedAttributes`, `ariaLabel` accessor,
  `handleChange_aria-label`)
- Modify: `src/index.ts` (`render()` reads the label from `ariaLabel`
  and removes the host attribute)
- Modify: `README.md`
- Test: `test/index.ts` (append before `all done`)

**Interfaces:**
- Consumes: nothing from Task 1.
- Produces: `get ariaLabel ():string|null` and `set ariaLabel
  (value:string|null)` on the light `SubstrateButton`, overriding the
  ARIAMixin reflection (TypeScript accepts the override; checked with
  `tsc --strict`).

- [ ] **Step 1: Write the failing tests**

```ts
test('aria-label on the host moves to the inner button', async t => {
    document.body.innerHTML += '<substrate-button id="label-move" ' +
        'aria-label="Close"></substrate-button>'
    const el = await waitFor('#label-move') as SubstrateButton
    t.equal(el.button!.getAttribute('aria-label'), 'Close',
        'inner button is named')
    t.ok(!el.hasAttribute('aria-label'), 'host has no aria-label')
})

test('setAttribute aria-label after render moves it too', async t => {
    document.body.innerHTML +=
        '<substrate-button id="label-late">x</substrate-button>'
    const el = await waitFor('#label-late') as SubstrateButton
    el.setAttribute('aria-label', 'Dismiss')
    t.equal(el.button!.getAttribute('aria-label'), 'Dismiss',
        'inner button gets the label')
    t.ok(!el.hasAttribute('aria-label'), 'host has no aria-label')
})

test('ariaLabel sets and clears the inner button label', async t => {
    document.body.innerHTML +=
        '<substrate-button id="label-prop">x</substrate-button>'
    const el = await waitFor('#label-prop') as SubstrateButton
    el.ariaLabel = 'Close'
    t.equal(el.button!.getAttribute('aria-label'), 'Close', 'sets it')
    t.equal(el.ariaLabel, 'Close', 'getter reads it')
    el.ariaLabel = ''
    t.ok(!el.button!.hasAttribute('aria-label'), 'empty clears it')
    el.ariaLabel = 'Close'
    el.ariaLabel = null
    t.ok(!el.button!.hasAttribute('aria-label'), 'null clears it')
    t.ok(!el.hasAttribute('aria-label'), 'host never has it')
})

test('ariaLabel set before render reaches the built button', async t => {
    const el = document.createElement('substrate-button')
    el.ariaLabel = 'Early'
    document.body.appendChild(el)
    t.equal(el.button!.getAttribute('aria-label'), 'Early',
        'built button has the label')
})

test('preact: ariaLabel prop updates and removes the label', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const view = (label?:string) => html`
        <${SubstrateButton.TAG} ariaLabel=${label}>x<//>
    `
    render(view('Close'), container)
    const el = container.querySelector(
        SubstrateButton.TAG
    ) as SubstrateButton
    t.equal(el.button!.getAttribute('aria-label'), 'Close', 'first')
    render(view('Dismiss'), container)
    t.equal(el.button!.getAttribute('aria-label'), 'Dismiss', 'changed')
    render(view(undefined), container)
    t.ok(!el.button!.hasAttribute('aria-label'), 'removed')
    t.ok(!el.hasAttribute('aria-label'), 'never on the host')
    container.remove()
})

test('hydration: ariaLabel names the app-rendered button', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(html`
        <${SubstrateButton.TAG} ariaLabel="Close">
            <button class="substrate-button btn">
                <span class="btn-content">x</span>
            </button>
        <//>
    `, container)
    t.equal(container.querySelector('button')!.getAttribute('aria-label'),
        'Close', 'app button is named')
    container.remove()
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: the new tests fail; every existing test passes.

- [ ] **Step 3: Implement**

In `src/client.ts`:
- a private `_ariaLabel:string|null = null`;
- `set ariaLabel`: `null` and `''` mean none. Store it in
  `_ariaLabel`, set or remove `aria-label` on `this.button` when it
  exists, and remove the host's `aria-label` attribute if present;
- `get ariaLabel`: `this.button?.getAttribute('aria-label') ??
  this._ariaLabel`;
- add `'aria-label'` to `observedAttributes`, and a
  `'handleChange_aria-label'` method (quoted name; the base class looks
  handlers up as `handleChange_${name}`). On a non-null value it sets
  `this.ariaLabel`, which removes the host attribute. On `null` it does
  nothing, because that is its own removal.

In `src/index.ts` `render()`, read the label with `this.ariaLabel`
instead of `this.getAttribute('aria-label')`. The upgrade-time callback
may already have moved the attribute into `_ariaLabel`.

In `README.md`, document `ariaLabel`. A host `aria-label` is moved to
the inner button. To clear it later, set `ariaLabel` to `null`:
removing the attribute from the host does nothing, because it is no
longer there. A framework should pass `ariaLabel` as a property.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test && npm run lint`
Expected: every test passes, lint is clean.

- [ ] **Step 5: Commit**

```bash
git add src/client.ts src/index.ts test/index.ts README.md
git commit -m "feat: ariaLabel names the inner button, never the host"
```

## After release

In `knitting-party`, `src/client/components/button.ts` passes
`ariaLabel=${label}` to the host and drops its `useLayoutEffect` and
`ref`. Its folder map rule about `class` and `aria-label` goes too.
