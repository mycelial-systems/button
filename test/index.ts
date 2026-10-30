import { test } from '@substrate-system/tapzero'
import { waitFor } from '@substrate-system/dom'
import { SubstrateButton } from '../src/index.js'
import { html } from 'htm/preact'
import { render } from 'preact'

SubstrateButton.define()

test('create a button', async t => {
    document.body.innerHTML += `
        <${SubstrateButton.TAG} class="test">
            button
        </${SubstrateButton.TAG}>
    `

    const el = await waitFor('substrate-button') as SubstrateButton

    t.ok(el instanceof SubstrateButton,
        'Can use the static method to get the tag name')
    t.equal(el.disabled, false, 'should not be disabled')

    el.setAttribute('disabled', '')
    t.equal(el.disabled, true, 'Should be disabled via `setAttribute`')
    t.ok(el.button instanceof HTMLButtonElement, 'should contain a button')
})

test('inner button uses native role and disabled semantics', async t => {
    document.body.innerHTML += `
        <substrate-button id="native-semantics">save</substrate-button>
    `
    const el = await waitFor('#native-semantics') as SubstrateButton

    t.equal(el.button?.hasAttribute('role'), false,
        'inner button has no explicit role')
    t.equal(el.button?.hasAttribute('aria-disabled'), false,
        'inner button has no aria-disabled attribute')
})

test('disabled property reflects to host attribute', async t => {
    document.body.innerHTML += `
        <substrate-button id="reflect-test">
            click me
        </substrate-button>
    `
    const el = await waitFor(
        '#reflect-test'
    ) as SubstrateButton

    t.equal(el.hasAttribute('disabled'), false,
        'should not have disabled attribute initially')

    el.disabled = true
    t.equal(el.hasAttribute('disabled'), true,
        'setting .disabled=true reflects to host attribute')

    el.disabled = false
    t.equal(el.hasAttribute('disabled'), false,
        'setting .disabled=false removes host attribute')
})

test('disabled property uses only native disabled state', async t => {
    document.body.innerHTML += `
        <substrate-button id="disabled-property">save</substrate-button>
    `
    const el = await waitFor('#disabled-property') as SubstrateButton

    el.disabled = true
    t.equal(el.button?.hasAttribute('disabled'), true,
        'inner button becomes disabled')
    t.equal(el.button?.hasAttribute('aria-disabled'), false,
        'inner button has no aria-disabled while disabled')

    el.disabled = false
    t.equal(el.button?.hasAttribute('disabled'), false,
        'inner button becomes enabled')
    t.equal(el.button?.hasAttribute('aria-disabled'), false,
        'inner button has no aria-disabled after enabling')
})

test('autofocus property reflects to host attribute', async t => {
    document.body.innerHTML += `
        <substrate-button id="autofocus-test">
            click me
        </substrate-button>
    `
    const el = await waitFor(
        '#autofocus-test'
    ) as SubstrateButton

    el.autofocus = true
    t.equal(el.hasAttribute('autofocus'), true,
        'setting .autofocus=true reflects to host attribute')

    el.autofocus = false
    t.equal(el.hasAttribute('autofocus'), false,
        'setting .autofocus=false removes host attribute')
})

test('setAttribute disabled still works (no loop)', async t => {
    document.body.innerHTML += `
        <substrate-button id="attr-test">
            click me
        </substrate-button>
    `
    const el = await waitFor('#attr-test') as SubstrateButton

    el.setAttribute('disabled', '')
    t.equal(el.disabled, true,
        'setAttribute disabled sets .disabled property')
    t.ok(el.button?.hasAttribute('disabled'),
        'inner button gets disabled attribute')

    el.removeAttribute('disabled')
    t.equal(el.disabled, false,
        'removeAttribute disabled clears .disabled property')
    t.ok(!el.button?.hasAttribute('disabled'),
        'inner button loses disabled attribute')
})

test('disabled host attribute uses only native disabled state', async t => {
    document.body.innerHTML += `
        <substrate-button id="disabled-attribute">save</substrate-button>
    `
    const el = await waitFor('#disabled-attribute') as SubstrateButton

    el.setAttribute('disabled', '')
    t.equal(el.button?.hasAttribute('disabled'), true,
        'inner button becomes disabled')
    t.equal(el.button?.hasAttribute('aria-disabled'), false,
        'inner button has no aria-disabled while disabled')

    el.removeAttribute('disabled')
    t.equal(el.button?.hasAttribute('disabled'), false,
        'inner button becomes enabled')
    t.equal(el.button?.hasAttribute('aria-disabled'), false,
        'inner button has no aria-disabled after enabling')
})

test('preact: render button with disabled attribute', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
        html`<substrate-button disabled>click me</substrate-button>`,
        container
    )

    const el = container.querySelector('substrate-button') as SubstrateButton

    // render() and connectedCallback are synchronous; no async wait needed
    t.equal(el.disabled, true,
        'el.disabled is true when rendered via preact with disabled attr'
    )
    t.ok(el.button?.hasAttribute('disabled'),
        'inner button has disabled attribute')

    const container2 = document.createElement('div')
    document.body.appendChild(container2)
    render(html`<${SubstrateButton.TAG} disabled=${true}>click<//>`, container2)
    const attr = container2
        .querySelector('substrate-button button')?.hasAttribute('disabled')

    t.ok(attr, 'can pass a boolean attribute to disable the button')
})

test('preact: render button without disabled attribute', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(
        html`<substrate-button>click me</substrate-button>`,
        container
    )

    const el = container.querySelector(
        'substrate-button'
    ) as SubstrateButton

    t.equal(
        el.disabled,
        false,
        'el.disabled is false when rendered via preact without disabled attr'
    )
    t.ok(
        !el.button?.hasAttribute('disabled'),
        'inner button has no disabled attribute'
    )
})

test('default-rendered button has no aria-live attribute', async t => {
    document.body.innerHTML += `
        <substrate-button id="default-aria-live-test">
            save
        </substrate-button>
    `
    const el = await waitFor(
        '#default-aria-live-test'
    ) as SubstrateButton

    t.equal(el.button?.getAttribute('aria-live'), null,
        'inner button has no aria-live attribute by default')
})

test('inner button class attribute has no duplicate tokens', async t => {
    document.body.innerHTML += `
        <substrate-button id="dup-class-test">
            click me
        </substrate-button>
    `
    const el = await waitFor('#dup-class-test') as SubstrateButton
    const btn = el.button!
    // classList silently dedupes, so check the raw attribute string
    const raw = btn.getAttribute('class') ?? ''
    const tokens = raw.split(/\s+/).filter(Boolean)
    const seen = new Set<string>()
    const duplicates:string[] = []
    for (const c of tokens) {
        if (seen.has(c)) duplicates.push(c)
        seen.add(c)
    }
    t.deepEqual(duplicates, [],
        'class attribute contains no duplicate tokens')
    t.ok(tokens.includes('substrate-button'),
        'inner button has substrate-button class')
    t.ok(tokens.includes('btn'),
        'inner button has btn class')
})

test('declarative type attribute reaches inner button', async t => {
    document.body.innerHTML += `
        <substrate-button id="type-decl-test" type="submit">
            submit
        </substrate-button>
    `
    const el = await waitFor('#type-decl-test') as SubstrateButton
    t.equal(el.button?.getAttribute('type'), 'submit',
        'inner button has type="submit" from host attribute')
    t.equal(el.type, 'submit', '.type getter reflects the value')
})

test('type setter reflects to host and inner button', async t => {
    document.body.innerHTML += `
        <substrate-button id="type-setter-test">
            click
        </substrate-button>
    `
    const el = await waitFor('#type-setter-test') as SubstrateButton

    el.type = 'submit'
    t.equal(el.getAttribute('type'), 'submit',
        'setting .type reflects to host attribute')
    t.equal(el.button?.getAttribute('type'), 'submit',
        'setting .type reflects to inner button')
    t.equal(el.type, 'submit', '.type getter returns the new value')
})

test('declarative type="button" reaches inner button', async t => {
    document.body.innerHTML += `
        <substrate-button id="type-button-decl" type="button">
            click
        </substrate-button>
    `
    const el = await waitFor('#type-button-decl') as SubstrateButton
    t.equal(el.button?.getAttribute('type'), 'button',
        'inner button has type="button" from host attribute')
})

test('setAttribute("type", ...) propagates to inner button', async t => {
    document.body.innerHTML += `
        <substrate-button id="type-attr-test">click</substrate-button>
    `
    const el = await waitFor('#type-attr-test') as SubstrateButton
    el.setAttribute('type', 'button')
    t.equal(el.button?.getAttribute('type'), 'button',
        'setAttribute on host updates inner button')

    el.setAttribute('type', 'submit')
    t.equal(el.button?.getAttribute('type'), 'submit',
        'subsequent setAttribute updates inner button')

    el.removeAttribute('type')
    t.equal(el.button?.getAttribute('type'), null,
        'removeAttribute clears inner button type')
})

test('value attribute is forwarded', async t => {
    document.body.innerHTML += `
        <substrate-button id="value-test" value="abc">click</substrate-button>
    `
    const el = await waitFor('#value-test') as SubstrateButton
    t.equal(el.button?.getAttribute('value'), 'abc',
        'inner button has value from host')

    el.setAttribute('value', 'xyz')
    t.equal(el.button?.getAttribute('value'), 'xyz',
        'value change propagates to inner button')
})

test('form-related attributes are forwarded', async t => {
    document.body.innerHTML += `
        <substrate-button
          id="form-test"
          formaction="/submit"
          formmethod="post"
          formnovalidate
          formtarget="_blank"
        >click</substrate-button>
    `
    const el = await waitFor('#form-test') as SubstrateButton
    t.equal(el.button?.getAttribute('formaction'), '/submit',
        'formaction forwarded')
    t.equal(el.button?.getAttribute('formmethod'), 'post',
        'formmethod forwarded')
    t.equal(el.button?.getAttribute('formnovalidate'), '',
        'formnovalidate forwarded')
    t.equal(el.button?.getAttribute('formtarget'), '_blank',
        'formtarget forwarded')
})

test('title attribute is forwarded', async t => {
    document.body.innerHTML += `
        <substrate-button id="title-test" title="hello">x</substrate-button>
    `
    const el = await waitFor('#title-test') as SubstrateButton
    t.equal(el.button?.getAttribute('title'), 'hello',
        'inner button has title from host')
})

test('aria-live attribute is forwarded from a declared host', async t => {
    document.body.innerHTML += `
        <substrate-button id="aria-live-declared-test" aria-live="assertive">
            save
        </substrate-button>
    `
    const el = await waitFor(
        '#aria-live-declared-test'
    ) as SubstrateButton

    t.equal(el.button?.getAttribute('aria-live'), 'assertive',
        'inner button has aria-live from the host')
})

test('aria-live changes on the host update the inner button', async t => {
    document.body.innerHTML += `
        <substrate-button id="aria-live-change-test">
            save
        </substrate-button>
    `
    const el = await waitFor(
        '#aria-live-change-test'
    ) as SubstrateButton

    el.setAttribute('aria-live', 'polite')

    t.equal(el.button?.getAttribute('aria-live'), 'polite',
        'inner button gets the updated aria-live value')
})

test('removing aria-live from the host removes it from the inner button',
    async t => {
        document.body.innerHTML += `
            <substrate-button
              id="aria-live-removal-test"
              aria-live="polite"
            >
                save
            </substrate-button>
        `
        const el = await waitFor(
            '#aria-live-removal-test'
        ) as SubstrateButton

        el.removeAttribute('aria-live')

        t.equal(el.button?.getAttribute('aria-live'), null,
            'inner button loses aria-live when the host loses it')
    })

test('preact: label content updates reactively', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    // Initial render with label "one".
    render(html`<${SubstrateButton.TAG}>one<//>`, container)
    const el = container.querySelector(
        SubstrateButton.TAG
    ) as SubstrateButton

    // connectedCallback rendered synchronously; the shell exists now.
    const content = el.querySelector('.btn-content') as HTMLElement
    t.ok(content, 'has a .btn-content element')

    // The live text node Preact created and render() moved into place.
    const textNode = content.firstChild as Text
    t.ok(textNode, 'label text node exists inside .btn-content')

    // Re-render with a new label value (simulates a signal/prop change).
    render(html`<${SubstrateButton.TAG}>two<//>`, container)

    // The same node instance is reused, still connected, now updated:
    // this only holds if render() moved the node instead of replacing
    // innerHTML (which would detach Preact's node).
    t.equal(content.firstChild, textNode,
        'the same text node instance is reused (not detached)')
    t.ok(textNode.isConnected, 'the text node is still in the document')
    t.equal(textNode.data, 'two',
        'Preact updated the live node in place')

    container.remove()
})

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

test('spinning = false on an idle disabled button keeps it disabled',
    async t => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        render(html`
            <${SubstrateButton.TAG} disabled=${true}>save<//>
        `, container)
        const el = container.querySelector(
            SubstrateButton.TAG
        ) as SubstrateButton

        el.spinning = false
        t.ok(el.button?.hasAttribute('disabled'),
            'inner button is still disabled')

        container.remove()
    })

test('enabling the host while spinning keeps it disabled', async t => {
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
        <${SubstrateButton.TAG} spinning=${true} disabled=${false}>
            save
        <//>
    `, container)
    t.ok(el.button?.hasAttribute('disabled'),
        'inner button is disabled while spinning')

    render(html`
        <${SubstrateButton.TAG} spinning=${false} disabled=${false}>
            save
        <//>
    `, container)
    t.equal(el.button?.hasAttribute('disabled'), false,
        'inner button is enabled once spinning ends')

    container.remove()
})

test('spinning preserves aria-busy updates', async t => {
    document.body.innerHTML += `
        <substrate-button id="busy-state">save</substrate-button>
    `
    const el = await waitFor('#busy-state') as SubstrateButton

    el.spinning = true
    t.equal(el.button?.getAttribute('aria-busy'), 'true',
        'inner button is busy while spinning')

    el.spinning = false
    t.equal(el.button?.getAttribute('aria-busy'), 'false',
        'inner button is not busy after spinning')
})

test('keydown does not synthesize a click', async t => {
    // A native <button> already activates on Enter and Space. A keydown
    // handler that calls click() repeats clicks while Space is held.
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(html`<${SubstrateButton.TAG}>save<//>`, container)
    const el = container.querySelector(
        SubstrateButton.TAG
    ) as SubstrateButton

    let clicks = 0
    el.button?.addEventListener('click', () => clicks++)

    for (const key of [' ', 'Enter']) {
        const ev = new KeyboardEvent('keydown', {
            key,
            bubbles: true,
            cancelable: true,
        })
        el.button?.dispatchEvent(ev)
        t.equal(ev.defaultPrevented, false,
            `keydown "${key}" is not prevented`)
    }
    t.equal(clicks, 0, 'no click is fired from keydown')

    container.remove()
})

test('hydrates an inner button rendered by the app', async t => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(html`
        <${SubstrateButton.TAG}>
            <button class="substrate-button btn">
                <span class="btn-content">save</span>
            </button>
        <//>
    `, container)
    const el = container.querySelector(
        SubstrateButton.TAG
    ) as SubstrateButton
    const btn = container.querySelector('button')!

    t.equal(el.button, btn, 'keeps the same <button> node')
    t.equal(el.querySelectorAll('button').length, 1,
        'does not render a second button')

    render(html`
        <${SubstrateButton.TAG} spinning=${true}>
            <button class="substrate-button btn">
                <span class="btn-content">save</span>
            </button>
        <//>
    `, container)
    t.ok(btn.hasAttribute('disabled'),
        'spinning still disables the app-rendered button')

    container.remove()
})

test('hydrates aria-live onto an inner button rendered by the app', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(html`
        <${SubstrateButton.TAG}>
            <button class="substrate-button btn">
                <span class="btn-content">save</span>
            </button>
        <//>
    `, container)
    const el = container.querySelector(
        SubstrateButton.TAG
    ) as SubstrateButton
    const btn = container.querySelector('button')!

    el.setAttribute('aria-live', 'polite')

    t.equal(btn.getAttribute('aria-live'), 'polite',
        'inner button gets aria-live from the hydrated host')

    container.remove()
})

test('forwards a class added to the host to the inner button', async t => {
    document.body.innerHTML += `
        <substrate-button id="class-add">go</substrate-button>
    `
    const el = await waitFor('#class-add') as SubstrateButton
    el.classList.add('btn-primary')
    t.ok(el.button?.classList.contains('btn-primary'),
        'inner button has the added class')
})

test('moves a changed host class onto the inner button', async t => {
    document.body.innerHTML += `
        <substrate-button id="class-remove"
            class="btn-primary">go</substrate-button>
    `
    const el = await waitFor('#class-remove') as SubstrateButton
    el.setAttribute('class', 'btn-secondary')
    t.ok(!el.button?.classList.contains('btn-primary'),
        'inner button drops the removed class')
    t.ok(el.button?.classList.contains('btn-secondary'),
        'inner button gains the added class')
})

test('keeps the element classes when the host class changes', async t => {
    document.body.innerHTML += `
        <substrate-button id="class-owned" spinning>go</substrate-button>
    `
    const el = await waitFor('#class-owned') as SubstrateButton
    el.setAttribute('class', 'other')
    const btn = el.button!
    t.ok(btn.classList.contains('substrate-button'),
        'keeps substrate-button')
    t.ok(btn.classList.contains('btn'), 'keeps btn')
    t.ok(btn.classList.contains('spinning'), 'keeps spinning')
})

test('a host class change never adds an element class', async t => {
    document.body.innerHTML += `
        <substrate-button id="class-owned-add">go</substrate-button>
    `
    const el = await waitFor('#class-owned-add') as SubstrateButton
    el.setAttribute('class', 'spinning other')
    const btn = el.button!
    t.ok(!btn.classList.contains('spinning'),
        'inner button does not gain spinning')
    t.ok(btn.classList.contains('other'), 'inner button gains other')
})

test('updates the inner button when a Preact class prop changes', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const view = (cls:string) => html`
        <${SubstrateButton.TAG} class=${cls}>go<//>
    `
    render(view('a'), container)
    render(view('b'), container)
    const el = container.querySelector(
        'substrate-button'
    ) as SubstrateButton
    const btn = el.button!
    t.ok(btn.classList.contains('b'), 'inner button has the new class')
    t.ok(!btn.classList.contains('a'), 'inner button drops the old class')
    container.remove()
})

test('hydrates a host class change onto an app-rendered button', t => {
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
    const el = container.querySelector(
        'substrate-button'
    ) as SubstrateButton
    const btn = el.button!
    t.ok(btn.classList.contains('mine'), 'keeps the app-rendered class')
    t.ok(btn.classList.contains('b'), 'has the new host class')
    t.ok(!btn.classList.contains('a'), 'drops the old host class')
    container.remove()
})

test('hydrates the first host class onto an app-rendered button', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(html`
        <${SubstrateButton.TAG} class="a">
            <button class="substrate-button btn mine">
                <span class="btn-content">save</span>
            </button>
        <//>
    `, container)
    const el = container.querySelector(
        'substrate-button'
    ) as SubstrateButton
    const btn = el.button!
    t.ok(btn.classList.contains('a'), 'has the host class')
    t.ok(btn.classList.contains('mine'), 'keeps the app-rendered class')
    container.remove()
})

test('moves a host aria-label onto the inner button', async t => {
    document.body.innerHTML += `
        <substrate-button id="label-move"
            aria-label="Close">x</substrate-button>
    `
    const el = await waitFor('#label-move') as SubstrateButton
    t.equal(el.button!.getAttribute('aria-label'), 'Close',
        'inner button has the label')
    t.ok(!el.hasAttribute('aria-label'), 'host has no aria-label')
})

test('moves a late host aria-label onto the inner button', async t => {
    document.body.innerHTML += `
        <substrate-button id="label-late">x</substrate-button>
    `
    const el = await waitFor('#label-late') as SubstrateButton
    el.setAttribute('aria-label', 'Dismiss')
    t.equal(el.button!.getAttribute('aria-label'), 'Dismiss',
        'inner button has the label')
    t.ok(!el.hasAttribute('aria-label'), 'host has no aria-label')
})

test('ariaLabel property names the inner button', async t => {
    document.body.innerHTML += `
        <substrate-button id="label-prop">x</substrate-button>
    `
    const el = await waitFor('#label-prop') as SubstrateButton
    el.ariaLabel = 'Close'
    t.ok(!el.hasAttribute('aria-label'),
        'host has no aria-label while a label is set')
    t.equal(el.button!.getAttribute('aria-label'), 'Close',
        'inner button has the label')
    t.equal(el.ariaLabel, 'Close', 'getter reads the label back')
    el.ariaLabel = ''
    t.ok(!el.button!.hasAttribute('aria-label'),
        'empty string clears the inner label')
    el.ariaLabel = 'Close'
    el.ariaLabel = null
    t.ok(!el.button!.hasAttribute('aria-label'),
        'null clears the inner label')
    t.ok(!el.hasAttribute('aria-label'), 'host has no aria-label')
})

test('ariaLabel set before connect reaches the built button', t => {
    const el = document.createElement('substrate-button') as SubstrateButton
    el.ariaLabel = 'Early'
    document.body.appendChild(el)
    t.equal(el.button!.getAttribute('aria-label'), 'Early',
        'built inner button has the label')
    t.ok(!el.hasAttribute('aria-label'), 'host has no aria-label')
    el.remove()
})

test('preact: ariaLabel prop names the inner button', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const view = (label?:string) => html`
        <${SubstrateButton.TAG} ariaLabel=${label}>x<//>
    `
    render(view('Close'), container)
    const btn = container.querySelector('button')!
    t.equal(btn.getAttribute('aria-label'), 'Close', 'first label is set')

    render(view('Dismiss'), container)
    t.equal(btn.getAttribute('aria-label'), 'Dismiss', 'changed label applies')

    render(view(undefined), container)
    t.ok(!btn.hasAttribute('aria-label'), 'removed prop removes the label')
    const host = container.querySelector('substrate-button')!
    t.ok(!host.hasAttribute('aria-label'), 'host has no aria-label')
    container.remove()
})

test('preact: ariaLabel applies to an app-rendered button', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    render(html`
        <${SubstrateButton.TAG} ariaLabel="Close">
            <button>x</button>
        <//>
    `, container)
    const btn = container.querySelector('button')!
    t.equal(btn.getAttribute('aria-label'), 'Close',
        'app-rendered inner button has the label')
    const host = container.querySelector('substrate-button')!
    t.ok(!host.hasAttribute('aria-label'), 'host has no aria-label')
    container.remove()
})

test('preact: ariaLabel reads the app-rendered button after a swap', t => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const view = (key:string) => html`
        <${SubstrateButton.TAG} ariaLabel="Close">
            <button key=${key}>x</button>
        <//>
    `
    render(view('a'), container)
    render(view('b'), container)
    const el = container.querySelector(
        SubstrateButton.TAG
    ) as SubstrateButton
    t.ok(!el.button!.hasAttribute('aria-label'),
        'the replaced inner button has no label')
    t.equal(el.ariaLabel, null,
        'getter reads the replaced inner button, not the stored label')
    t.ok(!el.hasAttribute('aria-label'), 'host has no aria-label')
    container.remove()
})

test('all done', () => {
    // @ts-expect-error tests
    window.testsFinished = true
})
