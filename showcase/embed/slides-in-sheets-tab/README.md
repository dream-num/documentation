# Marigold / Slides in Sheets Tab

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but does not change the runtime language. All registered English locale packs and
official SDK styles remain shared by preview and export. Earlier EN/ZH reports
below are historical interaction evidence, not current bilingual SDK acceptance.

A fictional community arts centre compares eight monthly operating lines and
reviews a proposed $450 reallocation to live captioning. The plan totals $42,000;
actual spending totals $42,480. Cost ledger and Assumptions are native worksheets.
Board review is a native SheetTab embed with a separate three-page Slides unit.

The cream/gold overview, lilac cost cards and coral decision page are authored
originals. The internal Gamma Deal Review reference informed the editorial cover
and review story; no competitor image or artwork is distributed.

## Running and integration

Preview and standalone index.ts use the same create-demo.ts and data.ts. The
factory imports all required official CSS, registers a local resource provider,
then creates SheetTab at index 1 after Steady. Selecting the native workbook tab
mounts its real child. No host-side tab switcher, fixture panel, iframe or Float
mode switch is provided. The deck is an authored narrative, not formula-bound.

Run the selected scripts/test-embed-slide-tab.mjs harness with SHOWCASE_VITE_MODULE
pointing to an installed Vite module; SHOWCASE_ORIGIN can target a built export.
Only this demo is compiled by the harness. `embed-slide-tab-production/report.json`
passes native tabs, all three palette pixel checks, actual Facade rich-text edits,
native Undo/Redo with whole-deck snapshot equality, host recalculation, preserved
child state and selected teardown without browser errors. The independent build
transforms 1,844 modules: main JS 18,127.79 kB / 4,494.92 kB gzip and official CSS
129.65 kB / 19.27 kB gzip. The large-chunk warning remains; this is not performance
acceptance. `embed-slide-tab-export-parity` verifies the original nine-file export.

`embed-guides-client-settled/report.json` passes both EN/ZH guides (3 variants,
3 actions, 3 states), real child previews and official white/flex CSS with zero
browser errors. The first Next run failed because Embed UI imports browser-only
Path2D at module evaluation; `use client` alone still permits prerendering. The
preview entry now uses the existing `next/dynamic` pattern with `ssr: false`.
Both React adapter and browser-only entry are included as reference text in the
export; neither adds Next.js to the standalone Vite dependencies. A later
client-only attempt retained a readiness timeout with no browser errors; the
settled pass does not erase that initial-load/performance observation.

`test-results/embed-slide-tab-cached-cover/report.json` passes native SheetTab
insertion, opening the real child, a preserved-style Facade text edit, round trips
through both ordinary worksheets, the recalculated $42,580 host total, unchanged
child data after the host edit, and selected active-child disposal without browser
errors. The initial two runs timed out because the harness discarded the SDK's
cached cover paint record before selecting the tab; their screenshots show that
the native cover was visible. Keeping the recorded paint is paired with a visible
native viewport and screenshots, not treated as proof of current visibility alone.

Complete native keyboard editing and history ownership, narrow layouts, source failures,
pending-load disposal, repeated navigation, reload/resource preservation and
production performance remain acceptance items. Exchange and Print are not
registered here. Trial watermarks stay visible; the authored October 2027 dates
do not freeze the SDK clock.

## Theme and readiness follow-up

The React Preview retains its owner and calls `toggleDarkMode()`; theme changes
do not reload authored data. Pending readiness exists before DOM insertion and
source failures keep an explicit error with an English alert. The SDK may open
Board review immediately after creating its native tab; use Cost ledger before
editing host cells.

`scripts/test-embed-sheet-slide-themes.mjs` verifies EN/ZH native host input
(C5 to 7500, C14 to 42580), a distinct Facade rich-text child edit with actual
repaint, complete host/child snapshots through both themes, and native tab
round trips afterwards. Evidence: `embed-sheet-slide-themes-models`. The SDK
refreshes thumbnail canvases during theme changes; the main owner, root,
visible child and data remain. The earlier canvas-identity-only failure is kept
separately and is not evidence of data loss. Native child keyboard/history and
broader lifecycle/failure paths still require acceptance. The eleven-file
independent export and official CSS pass `embed-sheet-slide-theme-exports`.
