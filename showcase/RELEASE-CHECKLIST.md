# Showcase preview release checks

This is a regression preview, not full SDK feature acceptance. The capability
ledger retains partial coverage and known failures.

## Build and regression

Leave `UNIVER_SHOWCASE_DEMOS` unset for `pnpm build`. Production includes every
registered editor; `pnpm dev:showcase <slug...>` intentionally compiles selected
editors while retaining the complete navigation tree. The full build needs more
than Node's default 4 GB heap; CI sets `NODE_OPTIONS=--max-old-space-size=8192`.
Allow additional memory for native allocations and page-generation workers.

After starting production, run `SHOWCASE_ORIGIN=<origin> node
scripts/test-showcase-production-routes.mjs`. This checks both locales for all
catalog routes and scoped-preview placeholders, not each editor's interactions.

Specialist export tests can use `SHOWCASE_VITE_DIR` to point to an existing Vite
package directory (default: `node_modules/vite`). The Aster custom-event,
Crosshair and Mossbrook custom-canvas tests also require
`SHOWCASE_EXPORT_DIRECTORY`: a dedicated writable exported project with the
exact dependencies installed. Do not point it at a project containing user work.

## Public-release review

- The next-themes patch retains its upstream MIT notice in
  `patches/next-themes.LICENSE.txt`.
- The reviewed changes did not reveal high-confidence credentials, newly copied
  Pro internal implementation, license-check bypasses, or new third-party PDF,
  font or Office-template binaries. This is not a legal or security certification;
  image contents were not comprehensively OCR-audited.
- Pro package use and public screenshots still require the publisher to confirm
  its rights and the deployment-domain license. Package imports do not grant a
  right to redistribute commercial source. Keep SDK trial restrictions intact.
- Historical fixture assets predate this change; their complete authorization
  chain has not been independently established.
- Committed evidence paths are redacted as `<USERPROFILE>`; gate results are
  unchanged. These are historical evidence, not reusable local build locations.
  Recreate exports for a fresh test run. Earlier branch commits still contain
  the original machine paths; this cleanup does not rewrite published history.

References: [Pro licensing](https://docs.univer.ai/guides/pro/license),
[next-themes 0.4.6 license](https://github.com/pacocoursey/next-themes/blob/v0.4.6/license.md).
