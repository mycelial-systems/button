<!-- nightralph:start -->
## Agent skills

### Issue tracker

Issues are tracked as local markdown files under `.scratch/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout. See `docs/agents/domain.md`.
<!-- nightralph:end -->

## Button tests

The public custom-element seam is `substrate-button` and its `button`
property. Run the browser suite with `esbuild test/index.ts --bundle | tapout`;
inspect inner-button attributes through `el.button` rather than rendered HTML.
