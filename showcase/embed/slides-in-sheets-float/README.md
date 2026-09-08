# Harbor / Slides in Sheets Float

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but does not change the runtime language. All registered English locale packs and
official SDK styles remain shared by preview and export. Earlier EN/ZH reports
below are historical interaction evidence, not current bilingual SDK acceptance.

Original fictional community-ferry operating budget with a two-page decision brief.
The twelve monthly costs total $29,700. The host SUM formula is real; the child
presentation is intentionally independent, not a linked formula demonstration.

## Runtime

`create-demo.ts` is shared by Preview and standalone `index.ts`. It imports eleven
official SDK stylesheets, registers a local Slides resource provider, and creates
a `SheetFloating` embed after Steady. Sheets Drawing mounts the native child;
calling generic `EmbedMountService.mount` here cannot resolve the floating host.
The native floating controls handle activation and page navigation. There is no
generic fixture panel or duplicate host formatting toolbar. Keep trial watermarks.

## Verification and remaining scope

Current passing reports: `embed-slide-float-production-raw/report.json` and
`embed-slide-float-export-parity/report.json` under `test-results`. These verify
the real Float, native double-click/Previous page, preserved-style Facade text
editing, display-target switching, a host cost edit changing the SUM to $30,100
without altering the child, and selected post-disposal error checks. All nine
exported files match, with official white/flex SDK CSS. `getValue()` includes
currency formatting here; `getRawValue()` verifies the actual numeric total.

The independent Vite build transforms 1,844 modules. Its main JS is 18,124.96 kB
(4,493.77 kB gzip), CSS 129.64 kB (19.27 kB gzip); the large-chunk warning remains.
`embed-guides-client-settled/report.json` now also passes real EN/ZH guides and
native previews (2 variants, 3 actions, 3 states), official white/flex CSS and zero
browser errors. It does not certify all lifecycle paths. The native Embed UI's
module-time Path2D dependency must not execute during server prerendering: the
Preview uses `next/dynamic` with `ssr: false` in its Client Component entry.
The export includes both entry and React adapter as reference text, without
adding Next.js dependencies to the independent Vite project.

Run `scripts/test-embed-slide-float.mjs` with `SHOWCASE_VITE_MODULE` pointing to an
installed Vite module. It compiles this demo only. Reports are under `test-results`.
The initial native-mount run proves the real host anchor and painted Slides child.
The edit run exposed asynchronous disposal errors despite its premature PASS flag;
that historical flag is not valid cleanup evidence. The test now checks errors
after native cleanup has had two animation frames to run.

The native menu lives in a body portal, not under the host root. beta.2 schedules
its React unmount after disposing the scoped LocaleService. This demo explicitly
unmounts its own native content and ID-scoped menu with `@univerjs/design.unmount`
before releasing the workbench and core. It neither alters SDK packages nor
suppresses console errors. Broad lifecycle fault acceptance remains open.

Full-screen, native keyboard text editing and history ownership, touch/accessibility,
reloading preserved resources, failure recovery, pending-load disposal and export
performance remain separate acceptance items. Exchange and Print are not registered
in this case. The calendar is authored data, not a globally frozen SDK clock.

## Reference provenance

The internal Gamma budget-review reference informed the side-by-side decision story.
All prose, amounts and presentation content are authored originals. No competitor
artwork or screenshots are distributed in this export.
# Current locale follow-up

The SDK always uses its complete registered English locale packs. Earlier
`test-embed-locales-native` bilingual runs remain historical evidence; they do
not describe the current English-only runtime.

## Theme and readiness follow-up

The React Preview now retains its owner and calls `toggleDarkMode()` instead of
recreating the host and child. Pending readiness is set before DOM insertion;
source failure retains an explicit error and an English alert. The selected
EN/ZH test `scripts/test-embed-sheet-slide-themes.mjs` checks real host keyboard
input (B5 to 13000, SUM to 30100), a separate Facade rich-text child edit with
actual repaint, full host/child snapshots through dark/light changes, and native
floating navigation afterwards. Evidence: `embed-sheet-slide-themes-models`.
This does not certify native child keyboard history, every early-load/disposal
race or all Embed products. The eleven-file independent export rebuild and
official CSS/paint checks are recorded in `embed-sheet-slide-theme-exports`.
