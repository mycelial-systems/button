# 03: Docs and release readiness

**What to build:** Confirm the shipped behavior is documented and the
branch is ready to release. The README already has sections on class
following and `ariaLabel`, and AGENTS.md already notes the
`handleChange_<name>` convention. Read each against the spec and the
code as verified in 01 and 02, fix any statement that no longer
matches, and confirm the manifest version advances the latest
published version in `CHANGELOG.md`. Do not edit `CHANGELOG.md` by
hand; it is generated at release.

The README must cover, per the spec:

- The host `class` follows onto the inner button; classes added are
  added, classes removed are removed; the element's owned classes are
  never touched.
- On an app-rendered button the app owns the button's `class`, and a
  replaced inner button does not receive the host class or label again.
- The `ariaLabel` property names the inner button, the host never
  carries `aria-label`, and how to clear the label.
- Framework guidance: pass `ariaLabel` as a property, not `aria-label`
  as an attribute.

**Blocked by:** 01, 02

**Touches:** `README.md` (class following and accessibility sections),
`AGENTS.md` (attribute forwarding note), `package.json` (`version`),
`test/package-version.js`.

**Status:** done

- [x] README describes class following, owned classes, app-owned
      button class, and the swapped-button limitation
- [x] README describes the `ariaLabel` property, that the host never
      carries `aria-label`, how to clear it, and the framework guidance
- [x] AGENTS.md notes that `class` and `aria-label` use
      `handleChange_<name>` handlers rather than generic forwarding
- [x] `package.json` version advances the latest version recorded in
      `CHANGELOG.md`, and `node test/package-version.js` passes
- [x] `npm run lint` and `npm test` pass on the branch
