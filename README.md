# button
[![tests](https://img.shields.io/github/actions/workflow/status/substrate-system/button/nodejs.yml?style=flat-square)](https://github.com/substrate-system/button/actions/workflows/nodejs.yml)
[![types](https://img.shields.io/npm/types/@substrate-system/button?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg?style=flat-square)](package.json)
[![install size](https://flat.badgen.net/packagephobia/install/@substrate-system/button?cache-control=no-cache)](https://packagephobia.com/result?p=@substrate-system/button)
[![gzip size](https://img.shields.io/bundlephobia/minzip/@substrate-system/button?style=flat-square)](https://bundlephobia.com/package/@substrate-system/button)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](./CHANGELOG.md)
[![license](https://img.shields.io/badge/license-Big_Time-blue?style=flat-square)](LICENSE)


A button web component, with a visual "loading" state.

[See a live demo](https://substrate-system.github.io/button/)

![Demo of the button](image.png)

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Install](#install)
- [Dependencies](#dependencies)
- [API](#api)
  * [ESM](#esm)
  * [Common JS](#common-js)
- [CSS](#css)
  * [Bundler](#bundler)
  * [CSS import](#css-import)
- [Use](#use)
- [Module format](#module-format)
  * [Bundler](#bundler-1)
  * [pre-built](#pre-built)
- [Example](#example)
  * [Attributes](#attributes)
    + [Forwarded attributes](#forwarded-attributes)
    + [Accessibility](#accessibility)

<!-- tocstop -->

</details>


## Install

```sh
npm i -S @substrate-system/button
```

## Dependencies

The CSS reads these variables. They are shared with the other
`@substrate-system` form controls, so an app can set them once. Each
one has a fallback, so they are all optional.

```css
:root {
  --substrate-text: black;  /* label and spinner color */
  --substrate-border: currentColor;  /* button border */
  --substrate-focus: currentColor;  /* focus and hover outline */
}
```

## API

This exposes ESM and common JS via [package.json `exports` field](https://nodejs.org/api/packages.html#exports).

### ESM
```js
import { SubstrateButton } from '@substrate-system/button'
```

### Common JS
```js
const { SubstrateButton } = require('@substrate-system/button')
```

## CSS

### Bundler

Import CSS with a bundler, like [esbuild](https://esbuild.github.io/content-types/#css).

```js
import '@substrate-system/button/css'
```

Or minified:
```js
import '@substrate-system/button/css/min'
```

### CSS import

Or use CSS imports:

```css
@import url("../node_modules/@substrate-system/button/dist/index.min.css");
```

## Use

You can set a name for this custom element with the static method
`define`. To use the default name, `substrate-button`, just import and
call `.define()`.

> [!CAUTION]  
> If you change the name of the web component, it will break the CSS.

To use the default, call `.define()`:

```js
import { SubstrateButton } from '@substrate-system/button'
import '@substrate-system/button/css'

// create a web component named `substrate-button`
SubstrateButton.define()
```

Or override the `tag` property to change the tag name:
```js
import { SubstrateButton } from '@substrate-system/button'

// set a custom name
SubstrateButton.tag = 'cool-button'

SubstrateButton.define()
```

## Module format

This package includes ESM, Common JS, and pre-bundled versions.

### Bundler
Just import like normal.

#### Full

This is a web component that knows how to render itself.

```js
import { SubstrateButton } from '@substrate-system/button'

SubstrateButton.define()
```

#### Client

The client version should be used in conjunction with server-side rendering.
It does not know how to render itself.

```js
import { SubstrateButton } from '@substrate-system/button/client'

SubstrateButton.define()
```

#### Server-side

Take some attributes, and return a string of HTML.

```js
import { html } from '@substrate-system/button/html'

const htmlString = html({
  classes: ['abc'],
  disabled: false,
  autofocus: false
})
```

#### Rendering the inner button yourself

Both versions hydrate. If the host already contains a `<button>` when
it connects, the element keeps that node and only adds behavior
(`disabled`, `spinning`, and attribute forwarding). This is the way to
use it with a framework like Preact, because the framework then owns
every node and nothing is replaced under it.

Render the markup like this:

```js
html`<substrate-button spinning=${saving}>
  <button class="substrate-button btn" type="submit">
    <span class="btn-content">Save</span>
  </button>
</substrate-button>`
```

The CSS styles any `<button>` inside the host. The label must be
inside a `.btn-content` element, because the spinning state hides
`.btn-content` to make room for the spinner. The `substrate-button` and
`btn` classes match what the element renders itself, and are
recommended for consistency.

If you let the full version render the button, it moves the host's
child nodes into a new `<button>`. Node identity is kept, so a
framework can still update the label text in place. But if the
framework later inserts a new sibling node, the node goes into the
host, outside the button. Render the inner button yourself if the
children will change shape.

### pre-built

This package exposes minified JS and CSS files. Copy them to a location that is
accessible to your web server, then link to them in HTML.

#### copy
```sh
cp ./node_modules/@substrate-system/button/dist/index.min.js ./public/substrate-button.min.js
cp ./node_modules/@substrate-system/button/dist/index.min.css ./public/substrate-button.css
```

#### HTML
```html
<head>
    <link rel="stylesheet" href="./substrate-button.css">
</head>
<body>
    <!-- ... -->
    <script type="module" src="./substrate-button.min.js"></script>
</body>
```

-------------------

## Example

See the example in [./example](./example/).

```html
<substrate-button id="labeled" aria-label="Save your changes">
  Save
</substrate-button>
```

### Attributes

#### Forwarded attributes

The host forwards these attributes to its inner native `<button>` and keeps
them in sync when they change: `type`, `name`, `value`, `form`, `formaction`,
`formenctype`, `formmethod`, `formnovalidate`, `formtarget`,
`popovertarget`, `popovertargetaction`, `title`, and `aria-live`.

Set `aria-live` on the `<substrate-button>` host only when your app needs
label changes announced.

The host's `class` also follows onto the inner button, including a button
rendered by your app before the element hydrates. Classes you add to the host
are added to the inner button, and classes you remove are removed from it.
The classes the element owns, `substrate-button`, `btn`, and `spinning`, are
never added or removed by a host class change.
On a button rendered by your app, the app owns the button's `class`. If the
app changes that attribute, include any host classes it wants kept. If the
app replaces its button, the new button does not receive the host class or
label again.

#### Accessibility

The inner button uses native button semantics. It has no `role` or
`aria-disabled`, and native `disabled` is the source of truth.

`ariaLabel` names the inner button, and the host never carries an
`aria-label`. A host `aria-label` attribute moves onto the inner button,
and a later `setAttribute('aria-label', ...)` also moves. The element keeps
it off the host, because `aria-label` on an element with no role fails axe.
Reading `el.ariaLabel` returns the inner button's label. Removing the host
attribute later does nothing, because it is already gone. To clear the
label, set `el.ariaLabel = null`. In Preact or another framework, pass
`ariaLabel` as a property, not `aria-label` as an attribute. Removing the
prop then clears the label.

```js
const el = document.querySelector('substrate-button')

el.ariaLabel = 'Close the dialog'

// An empty string or null removes the label
el.ariaLabel = ''
```

`aria-live` is opt-in: set it on the `<substrate-button>` host when your app
needs label changes announced. While the button is spinning, its inner button
has `aria-busy="true"`.

Upgrade note: if your app relied on the previous default `aria-live` value,
set `aria-live` on the host to restore it.

##### Announce loading in a status region

The button does not announce loading on its own. Render one `role="status"`
element in the app, keep it in the DOM, and update its text as the operation
starts and ends. It may use the app's visually hidden class.

```html
<substrate-button id="save-button">Save</substrate-button>
<p id="save-status" role="status" class="visually-hidden"></p>
```

```js
const button = document.querySelector('#save-button')
const status = document.querySelector('#save-status')

async function saveWithAnnouncement () {
  button.spinning = true
  status.textContent = 'Saving'

  await save()

  button.spinning = false
  status.textContent = 'Saved'
}
```

Putting the message in a separate region makes the announcement reliable:
the status element exists before its text changes, and the announcement does
not depend on which element has focus.

#### spinning

Add an attribute `spinning` to set the loading state.

```js
const el = document.querySelector('substrate-button')
el?.setAttribute('spinning', '')
// now it shows a spinning animation
```

Remove the attribute to stop the animation:
```js
const el = document.querySelector('substrate-button')
el?.removeAttribute('spinning')
```

#### JS API

Or, if you have a reference to the element, you can set the `spinning` property
for the same effect:

```js
const el = document.querySelector('substrate-button')

el.spinning = true  // spin

el.spinning = false  // stop
```
