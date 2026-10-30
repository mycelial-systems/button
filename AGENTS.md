<!-- nightralph:start -->
## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.

### Button attribute forwarding

`FORWARDED_ATTRS` in `src/client.ts` drives both dynamic host-attribute
mirroring and attributes supplied to the full renderer. A new forwarded
attribute must also pass through `HANDLED_KEYS` in `src/html.ts`.

An attribute that needs its own semantics (`class`, `aria-label`) gets a
`handleChange_<name>` method instead; any such handler suppresses generic
forwarding in `attributeChangedCallback`. Hydration of an app-rendered
button happens in the light element's `connectedCallback`.

Test forwarding at the public custom-element seam with
`esbuild test/index.ts --bundle | tapout`; cover both a rendered button and
the app-rendered hydration path when applicable.
<!-- nightralph:end -->

## Button tests

The public custom-element seam is `substrate-button` and its `button`
property. Run the browser suite with `esbuild test/index.ts --bundle | tapout`;
inspect inner-button attributes through `el.button` rather than rendered HTML.
`tapout` always listens on port 8123, so a run fails with `EADDRINUSE`
while another worktree's suite is running. Wait for the port to free and
rerun; do not kill the other process.

## Release versioning

For a release, verify that the manifest version advances the latest published
version recorded in `CHANGELOG.md`. The manifest check is part of `npm test`.

## Running the browser suite

`tapout` serves on a fixed port (8123). If another worktree or project is
running its suite, `tapout` fails with `EADDRINUSE`; wait for that run to
finish instead of killing it.
