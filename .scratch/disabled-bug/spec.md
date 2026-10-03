# `@substrate-system/button`: ending `spinning` re-enables a disabled button

**Status:** ready-for-human
**Package:** `@substrate-system/button` (repo `~/code/button`), present in
0.0.46 (installed here) through 0.0.49 (latest on npm)

## Symptom

On `/admin/email`, the Automation panel's Save button looks enabled after
a successful save, even though nothing is left to save. The same happens to
every Save button that renders like this, for example the blog-title card on
`/admin/settings`:

```ts
<${SubstrateButton.TAG}
    type="submit"
    spinning=${saving.value}
    disabled=${saving.value || !isDirty}
>
```

After the save, the DOM looks like this:

```html
<substrate-button type="submit" disabled="">
    <button class="substrate-button btn" type="submit"
        aria-disabled="true" aria-busy="false">
```

The host has `disabled` and the inner button has `aria-disabled="true"`,
but the inner `<button>` has no `disabled` attribute. Because of that it
still looks clickable and can still be clicked.

## Cause

While the save runs, the button has both `spinning` and `disabled`. When the
save finishes, `spinning` goes from true to false while `disabled` stays
true. Preact only touches attributes that changed, so the host sees one
change: `spinning` is removed.

Both spinning paths in `src/client.ts` remove the inner `disabled`
without checking the host's own `disabled` state:

```ts
handleChange_spinning (_, newValue:boolean) {
    if (newValue !== null) {
        // ...
        this.button?.setAttribute('disabled', '')
    } else {
        // ...
        this.button?.removeAttribute('disabled')   // <- the bug
        this.button?.setAttribute('aria-busy', 'false')
    }
}

set spinning (value:boolean) {
    if (value) {
        // ...
    } else {
        // ...
        this.button?.removeAttribute('disabled')   // <- same bug
        this.removeAttribute('spinning')
    }
}
```

`handleChange_disabled` never runs, because `disabled` did not change, so
nothing puts the attribute back.

## Fix

Two things make the inner button disabled: the host's `disabled` attribute
and spinning. When spinning ends, the inner button should match the host's
`disabled` attribute instead of always being enabled.

In `src/client.ts`, change the `else` branch of both
`handleChange_spinning` and `set spinning`:

```ts
// spinning ended: the host's own `disabled` decides
this.button?.toggleAttribute('disabled', this.hasAttribute('disabled'))
```

For symmetry, `handleChange_disabled` should not re-enable the inner
button while it is still spinning. Otherwise a render that sets
`disabled=false` while `spinning` stays true would make a busy button
clickable:

```ts
handleChange_disabled (_old, newValue) {
    const isDisabled = newValue !== null
    this.button?.toggleAttribute(
        'disabled',
        isDisabled || this.hasAttribute('spinning')
    )
    this.button?.setAttribute('aria-disabled', String(isDisabled))
}
```

The `set disabled` setter has the same shape and could take the same
change. A small private helper, such as `_syncDisabled()`, that sets the
inner `disabled` to `host[disabled] || host[spinning]` would let all four
paths share one rule.

## Test

Add this to `test/index.ts` above the `all done` test. It fails today on the
first assertion:

```ts
test('ending spinning keeps a disabled host disabled', async t => {
    // A save button: disabled while spinning, and still disabled after,
    // because nothing is left to save. Only `spinning` changes.
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(html`
        <${SubstrateButton.TAG} spinning=${true} disabled=${true}>
            save
        <//>
    `, container)
    const el = container.querySelector(
        SubstrateButton.TAG
    ) as SubstrateButton

    render(html`
        <${SubstrateButton.TAG} spinning=${false} disabled=${true}>
            save
        <//>
    `, container)
    t.ok(el.button?.hasAttribute('disabled'),
        'inner button is still disabled')
    t.equal(el.disabled, true, 'disabled property is still true')

    el.spinning = true
    el.spinning = false
    t.ok(el.button?.hasAttribute('disabled'),
        'the spinning setter also keeps it disabled')

    render(html`
        <${SubstrateButton.TAG} spinning=${false} disabled=${false}>
            save
        <//>
    `, container)
    t.equal(el.button?.hasAttribute('disabled'), false,
        'enabling the host still enables the inner button')

    container.remove()
})
```

## Then, in rebase.blog

1. Publish the package and bump `@substrate-system/button` in
   `package.json` (currently `^0.0.46`).
2. On `/admin/email`, toggle an Automation switch and click Save. The button
   should end up disabled, with "Settings updated" beside it.
3. `e2e/admin-email-card.spec.ts` ("the Automation panel saves its switches
   with one Save") does not catch this bug. Playwright's `toBeDisabled()`
   also accepts `aria-disabled="true"`, which the inner button still has.
   To pin the fix, assert on the attribute itself:
   `await expect(save).toHaveAttribute('disabled', '')`.
