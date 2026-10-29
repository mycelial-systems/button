export type Attrs = {
    type:string|null;
    autofocus:boolean;
    tabindex:string|number;
    disabled:boolean;
    name:string|null;
    classes:string[]|Set<string>;
    ariaLabel:string|null;
    /**
     * Additional attributes to render on the inner <button>. Keys that
     * collide with the explicit fields above are ignored.
     */
    extraAttrs:Record<string, string|null|undefined>;
}

const HANDLED_KEYS = new Set([
    'class', 'type', 'name', 'tabindex', 'role',
    'aria-label', 'aria-live', 'disabled', 'autofocus'
])

function escapeAttr (v:string):string {
    return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

export function html (attrs:Partial<Attrs>, textContent:string) {
    const {
        type,
        autofocus,
        tabindex,
        disabled,
        classes,
        name,
        ariaLabel,
        extraAttrs,
    } = attrs

    const _classes = new Set(classes)
    _classes.add('substrate-button')
    _classes.add('btn')
    const arr = Array.from(_classes)

    const extraStr = extraAttrs ?
        Object.entries(extraAttrs)
            .filter(([k, v]) => v != null && !HANDLED_KEYS.has(k))
            .map(([k, v]) => `${k}="${escapeAttr(String(v))}"`)
            .join(' ') :
        ''

    const btnProps = ([
        arr.length ? `class="${arr.filter(Boolean).join(' ')}"` : '',
        disabled ? 'disabled' : '',
        autofocus ? 'autofocus' : '',
        type ? `type="${escapeAttr(type)}"` : '',
        name ? `name="${escapeAttr(name)}"` : '',
        tabindex ? `tabindex="${tabindex}"` : 'tabindex="0"',
        ariaLabel ? `aria-label="${escapeAttr(ariaLabel)}"` : '',
        'aria-live="polite"',
        extraStr,
    ]).filter(Boolean).join(' ')

    // rendering in node?
    return typeof window === 'undefined' ?
        `<substrate-button${disabled ? ' disabled' : ''}>
            <button ${btnProps}><span class="btn-content">${textContent}</span></button>
        </substrate-button>` :
        `<button ${btnProps}>
            <span class="btn-content">${textContent}</span>
        </button>`
}
