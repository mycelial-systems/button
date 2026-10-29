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

Test forwarding at the public custom-element seam with
`esbuild test/index.ts --bundle | tapout`; cover both a rendered button and
the app-rendered hydration path when applicable.
<!-- nightralph:end -->

## Button tests

The public custom-element seam is `substrate-button` and its `button`
property. Run the browser suite with `esbuild test/index.ts --bundle | tapout`;
inspect inner-button attributes through `el.button` rather than rendered HTML.
