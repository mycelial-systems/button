import { html } from './html.js'
import { define } from '@substrate-system/web-component'
import {
    SubstrateButton as SubstrateButtonLight,
    FORWARDED_ATTRS,
} from './client.js'
// import Debug from '@substrate-system/debug'
// const debug = Debug('button')

/**
 * This is the full-version -- knows how to render itself in the browser.
 */
export class SubstrateButton extends SubstrateButtonLight {
    static define () {
        define(SubstrateButton.TAG, SubstrateButton)
    }

    render () {
        if (this.querySelector('button')) return
        // Read directly from host attributes: the inner button does not
        // exist yet when render() first runs, so the getters (which
        // read from the inner button) would return false.
        const type = this.getAttribute('type')
        const tabindexAttr = this.getAttribute('tabindex')
        const tabindex = tabindexAttr ? parseInt(tabindexAttr) : 0
        const disabled = this.hasAttribute('disabled')
        const autofocus = this.hasAttribute('autofocus')
        const name = this.getAttribute('name')
        const ariaLabel = this.getAttribute('aria-label')

        const spinning = this.getAttribute('spinning') !== null

        const classes:(string|null)[] = [
            'substrate-button',
            this.getAttribute('class'),
            spinning ? 'spinning' : null
        ]

        const extraAttrs:Record<string, string> = {}
        for (const attr of FORWARDED_ATTRS) {
            const v = this.getAttribute(attr)
            if (v !== null) extraAttrs[attr] = v
        }

        const btnProps = {
            classes: classes.filter(Boolean),
            disabled,
            autofocus,
            tabindex,
            type,
            name,
            ariaLabel,
            extraAttrs,
        }

        // Move the host's existing child nodes (the label) into the
        // button instead of stringifying them. Preserving node identity
        // keeps framework reconcilers (e.g. Preact) able to update the
        // label in place after the initial render.
        const labelNodes = Array.from(this.childNodes)

        // html() with empty content yields the button shell. The
        // whitespace text nodes it leaves around .btn-content are
        // cosmetic and intentionally left as-is.
        const tmp = document.createElement('template')
        tmp.innerHTML = html(btnProps, '')
        const btn = tmp.content.querySelector('button')!
        const content = btn.querySelector('.btn-content')!

        // appendChild moves each node (same instance), it does not clone.
        // Snapshotting labelNodes first prevents moving the freshly
        // appended btn into its own span.
        for (const node of labelNodes) content.appendChild(node)
        this.appendChild(btn)
    }
}

define('substrate-button', SubstrateButton)
