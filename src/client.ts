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
] as const

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
        ...FORWARDED_ATTRS,
    ]

    static TAG = 'substrate-button'
    _isSpinning:boolean

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
        this.button?.setAttribute('aria-disabled', String(disabledValue))
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
        this.button?.setAttribute('aria-disabled', String(isDisabled))
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

    connectedCallback () {
        // connect event listeners
        this.render()
        this._setupKeyboardHandlers()
    }

    _setupKeyboardHandlers () {
        // Space and Enter should trigger click
        this.button?.addEventListener('keydown', (e:KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                this.button?.click()
            }
        })
    }

    render () {
        // noop
    }
}
