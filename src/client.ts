import { WebComponent, define } from '@substrate-system/web-component'

// for docuement.querySelector
declare global {
    interface HTMLElementTagNameMap {
        'substrate-button':SubstrateButton
    }
}

/**
 * Standard HTMLButtonElement attributes (plus `title`) that should be
 * mirrored from the host element to the inner <button>. Each is added to
 * `observedAttributes` so dynamic changes propagate.
 */
export const FORWARDED_ATTRS = [
    'type',
    'name',
    'value',
    'form',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
    'popovertarget',
    'popovertargetaction',
    'title',
    'aria-live',
] as const

/**
 * Classes the element manages on the inner <button> itself. A change to
 * the host's `class` never adds or removes these.
 */
export const OWNED_CLASSES = [
    'substrate-button',
    'btn',
    'spinning',
] as const

function classTokens (value:string|null):string[] {
    return (value ?? '').split(/\s+/).filter(Boolean)
}

function isOwnedClass (token:string):boolean {
    return (OWNED_CLASSES as readonly string[]).includes(token)
}

/**
 * This is the lightweight version for browsers.
 * It "hydrates" only, meaining sets up event listeners.
 * It does not know how to render itself.
 */

export class SubstrateButton extends WebComponent.create('substrate-button') {
    // for `attributeChangedCallback`
    static observedAttributes = [
        'autofocus',
        'disabled',
        'spinning',
        'class',
        'aria-label',
        ...FORWARDED_ATTRS,
    ]

    static TAG = 'substrate-button'
    _isSpinning:boolean
    _ariaLabel:string|null = null

    static define () {
        define(SubstrateButton.TAG, SubstrateButton)
    }

    constructor () {
        super()
        const disabled = this.getAttribute('disabled')
        if (disabled !== null) {
            setTimeout(() => {
                // need to wait for it to render
                this.disabled = true
            }, 0)
        }
        this.autofocus = (this.getAttribute('autofocus') !== null)
        this._isSpinning = (this.getAttribute('spinning') !== null)
    }

    get form ():HTMLFormElement|undefined|null {
        return this.button?.form
    }

    get disabled ():boolean {
        return !!(this.button?.hasAttribute('disabled'))
    }

    set disabled (disabledValue:boolean) {
        // Reflect to host attribute; guard against re-entrancy
        if (this.hasAttribute('disabled') !== disabledValue) {
            this.toggleAttribute('disabled', disabledValue)
        }
        // a spinning button stays disabled until spinning ends
        this.button?.toggleAttribute(
            'disabled',
            disabledValue || this.hasAttribute('spinning')
        )
    }

    get type ():string|null {
        return this.button?.getAttribute('type') ?? this.getAttribute('type')
    }

    get tabindex ():number {
        const i = this.button?.getAttribute('tabindex')
        if (!i) return 0
        return parseInt(i)
    }

    get spinning ():boolean {
        return this._isSpinning
    }

    set spinning (value:boolean) {
        if (value) {
            this.classList.add('spinning')
            this.button?.classList.add('spinning')
            this.button?.setAttribute('disabled', '')
            this.setAttribute('spinning', '')
        } else {
            this.classList.remove('spinning')
            this.button?.classList.remove('spinning')
            // spinning ended: the host's own `disabled` decides
            this.button?.toggleAttribute(
                'disabled',
                this.hasAttribute('disabled')
            )
            this.removeAttribute('spinning')
        }
    }

    set type (value:string|null) {
        if (value === null) {
            this.removeAttribute('type')
            this.button?.removeAttribute('type')
        } else {
            this.setAttribute('type', value)
            this.button?.setAttribute('type', value)
        }
    }

    get autofocus ():boolean {
        return !!(this.button?.hasAttribute('autofocus'))
    }

    set autofocus (value:boolean) {
        // Reflect to host attribute; guard against re-entrancy
        if (this.hasAttribute('autofocus') !== value) {
            this.toggleAttribute('autofocus', value)
        }
        this.button?.toggleAttribute('autofocus', value)
    }

    /**
     * The inner button's accessible name. It lives only on the inner
     * button: `aria-label` on a host with no role fails axe. An empty
     * string means no label, because Preact sets a removed property
     * prop to ''. Before the element has an inner button, this returns
     * the label it was given.
     */
    get ariaLabel ():string|null {
        const btn = this.button
        return btn ? btn.getAttribute('aria-label') : this._ariaLabel
    }

    set ariaLabel (value:string|null) {
        const label = value || null
        this._ariaLabel = label
        if (label === null) {
            this.button?.removeAttribute('aria-label')
        } else {
            this.button?.setAttribute('aria-label', label)
        }
        if (this.hasAttribute('aria-label')) {
            this.removeAttribute('aria-label')
        }
    }

    /**
     * Set attributes on the internal button element.
     */
    _setAttribute (name:string, value:boolean|string|null):void {
        if (value === false) {
            // false means remove the attribute
            this._removeAttribute(name)
            this.button?.removeAttribute(name)
        } else {
            if (value === true) {
                // true means set the attribute with no value
                return this.button?.setAttribute(name, '')
            }

            if (value === null) {
                // null means remove
                return this._removeAttribute(name)
            }

            // else, set value to a string
            this.button?.setAttribute(name, value)
        }
    }

    /**
     * Remove from `this` and also button child.
     */
    _removeAttribute (name:string) {
        this.removeAttribute(name)
        this.button?.removeAttribute(name)
    }

    get button ():HTMLButtonElement|null {
        return this.querySelector('button')
    }

    /**
     * Forward host attribute changes to the inner button, except for
     * attributes that have a specific `handleChange_*` handler. Without
     * this, e.g. `el.setAttribute('type', 'button')` would not propagate
     * to the inner <button>.
     */
    async attributeChangedCallback (
        name:string,
        oldValue:string|null,
        newValue:string|null
    ):Promise<void> {
        // Forward synchronously, before any await, so observers reading
        // from the inner button right after setAttribute() on the host
        // see the updated value.
        const hasSpecificHandler = (
            typeof (this as any)[`handleChange_${name}`] === 'function'
        )
        if (!hasSpecificHandler) {
            if (newValue === null) {
                this.button?.removeAttribute(name)
            } else {
                this.button?.setAttribute(name, newValue)
            }
        }
        return super.attributeChangedCallback(
            name,
            oldValue as string,
            newValue as string
        )
    }

    /**
     * Handle 'autofocus' attribute changes
     * @see {@link https://gomakethings.com/how-to-detect-when-attributes-change-on-a-web-component/#organizing-your-code Go Make Things article}
     *
     * @param  {string} oldValue The old attribute value
     * @param  {string} newValue The new attribute value
     */
    handleChange_autofocus (_oldValue:string, newValue:string|null) {
        this.button?.toggleAttribute('autofocus', newValue !== null)
    }

    handleChange_disabled (_old:string|null, newValue:string|null) {
        const isDisabled = newValue !== null
        // a spinning button stays disabled until spinning ends
        this.button?.toggleAttribute(
            'disabled',
            isDisabled || this.hasAttribute('spinning')
        )
    }

    handleChange_spinning (_, newValue:boolean) {
        if (newValue !== null) {
            this.classList.add('spinning')
            this.button?.classList.add('spinning')
            this.button?.setAttribute('disabled', '')
            this.button?.setAttribute('aria-busy', 'true')
        } else {
            this.classList.remove('spinning')
            this.button?.classList.remove('spinning')
            // spinning ended: the host's own `disabled` decides
            this.button?.toggleAttribute(
                'disabled',
                this.hasAttribute('disabled')
            )
            this.button?.setAttribute('aria-busy', 'false')
        }
    }

    /**
     * Apply the difference between the old and new host class lists to
     * the inner button. Before the button exists this does nothing,
     * because the full render() copies the host class when it builds
     * the button.
     */
    handleChange_class (oldValue:string|null, newValue:string|null) {
        const btn = this.button
        if (!btn) return
        const before = classTokens(oldValue)
        const after = classTokens(newValue)
        for (const token of before) {
            if (after.includes(token) || isOwnedClass(token)) continue
            btn.classList.remove(token)
        }
        for (const token of after) {
            if (before.includes(token) || isOwnedClass(token)) continue
            btn.classList.add(token)
        }
    }

    /**
     * Move a host `aria-label` onto the inner button. The setter removes
     * the host attribute, which calls this again with null; that call
     * does nothing.
     */
    'handleChange_aria-label' (_old:string|null, newValue:string|null) {
        if (newValue !== null) this.ariaLabel = newValue
    }

    connectedCallback () {
        // The inner element is a native <button>, so the browser
        // already handles Enter and Space. No keyboard handlers needed.
        this.render()
        // Preact sets the host class before the app's button is
        // connected, so `handleChange_class` could not copy it then.
        // Copy it now. Adding a token twice is a no-op.
        this.handleChange_class(null, this.getAttribute('class'))
        // Likewise, a framework can set ariaLabel before that button
        // exists, so apply the stored label now.
        if (this._ariaLabel !== null) {
            this.button?.setAttribute('aria-label', this._ariaLabel)
        }
    }

    render () {
        // noop
    }
}
