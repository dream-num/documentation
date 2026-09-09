# next-themes 0.4.6: SSR bootstrap ownership

The patch includes portions of next-themes 0.4.6 under the MIT license.
Copyright (c) 2022 Paco Coursey. The complete notice is retained in
[next-themes.LICENSE.txt](./next-themes.LICENSE.txt), sourced from the
[upstream v0.4.6 license](https://github.com/pacocoursey/next-themes/blob/v0.4.6/license.md).

This app uses React 19. `next-themes` 0.4.6 renders its inline theme bootstrap on both server and client-only mounts. The latter creates an inert script and React reports it as an error. The real selected-route reproduction and component trace are retained in `test-results/theme-script-baseline/report.json`. This is not an SDK stylesheet or Facade failure.

The version-specific pnpm patch changes only `ThemeScript` in the shipped CommonJS and ESM entries. It uses React's `useSyncExternalStore` server snapshot to retain the original script during SSR **and hydration**, then omits it on client renders. The original bootstrap still applies stored/system/forced theme and `color-scheme` before hydration. Existing provider effects continue to handle subsequent changes. There is no console filtering, SDK styling override, replacement theme provider or dependency upgrade.

This app-specific patch requires React 18 or later. Do not distribute it as a general React 16/17-compatible next-themes build. Keep `patchedDependencies`, the patch file and lockfile together. `pnpm install --frozen-lockfile` must apply the patch; do not edit installed dependencies by hand. Reassess/remove the patch when upgrading next-themes, after rerunning the tests below.

The upstream [issue 387](https://github.com/pacocoursey/next-themes/issues/387) and still-open [PR 386](https://github.com/pacocoursey/next-themes/pull/386) describe the same client script problem. This patch is not a claim that the upstream PR has shipped, and differs from its plain `typeof window` guard by retaining the hydration render. React documents that [`getServerSnapshot` runs on both SSR and hydration](https://react.dev/reference/react/useSyncExternalStore#adding-support-for-server-rendering).

## Verification

`pnpm test:showcase:theme-script` tests the actual installed package with real server-rendered HTML and browser React, without compiling any demo. Set `SHOWCASE_VITE_MODULE` to the absolute `node_modules/vite/dist/node/index.js` of an existing exported standalone project when Vite is not installed at the repository root. It blocks the hydration module to check the bootstrap's theme first, then checks error-free hydration, three client owner replacements, local-storage persistence, system-theme changes, forced theme and teardown. SSR tests the installed CJS entry; browser bundling uses its ESM entry. No recoverable hydration error or console error is accepted.

For real integration, start `pnpm dev:showcase embed/mount-dispose-remount` on a free `SHOWCASE_PORT`, then set matching `SHOWCASE_ORIGIN` and run `pnpm test:showcase:cold-start embed/mount-dispose-remount`. Optional `SHOWCASE_TRACE_THEME=1` records the emitting component if a script warning occurs; it still forwards the error. Use a newly started process, not only a warm second visit. Set `SHOWCASE_RESULTS_DIR` to a new directory for each run so failed evidence is retained. Broader unrelated HMR failures and all-product runtime behavior require their own checks.

Set `SHOWCASE_REQUIRE_THEME_PATCH=1` to additionally inspect the actual served layout bytes. `test-results/theme-script-cold-cache-key/report.json` passes this check and both localized hydrated guides/live iframes after Next restarted for the cache-key correction. `theme-script-cjs-esm/report.json` passes five bootstrap/hydration/client scenarios, including three owner replacements per scenario, with no console or recoverable hydration errors. This final package test explicitly requires CJS for SSR and imports ESM in the browser; the earlier `theme-script-patched` run used ESM on both sides. The repository's offline frozen-lockfile installation also passes. The pre-cache-correction warm feature run is retained separately and is not used as proof that the corrected package was served.

The next restart (`theme-script-cold-restart`) served the patch without script errors but the test timed out waiting for whole-page `networkidle` on the Chinese guide. Network idleness is not hydration evidence; no particular outstanding request's cause was established. The test now requires the live iframe workbench, actual white SDK background and page CSS, then proves sidebar hydration by collapsing/expanding it. `theme-script-readiness` passes those checks for both locales without suppressing any browser error. Keep the initial unstyled-page timeout distinct from this test-wait correction.

`theme-script-embed-final` subsequently passes all seven actual Embed interaction/locale groups with current served code: native editing/history, complete snapshot remount/download/Reset, real disposal, all fixtures, narrow keyboard actions, light/dark replacement and EN/ZH iframe operations. No browser errors or demo write requests were recorded. These are selected integration checks, not a full documentation production build or all-product runtime certification.

## Development stylesheets

Development and production use Turbopack. The previous webpack cache customization and mini-css-extract HMR workaround have been removed. `pnpm test:showcase:scope` checks selected registry imports and invalid selections; `pnpm test:showcase:css-loading <selected-slug>` checks actual SDK styling across fresh and retained pages.
