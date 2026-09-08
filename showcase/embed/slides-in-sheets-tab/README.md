# Marigold / Slides in Sheets Tab

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

`embed-guides-client-settled/report.json` passes both EN/ZH guides (3 variants,
3 actions, 3 states), real child previews and official white/flex CSS with zero
browser errors. The first Next run failed because Embed UI imports browser-only
Path2D at module evaluation; `use client` alone still permits prerendering. The
preview entry now uses the existing `next/dynamic` pattern with `ssr: false`.
Both React adapter and browser-only entry are included as reference text in the
export; neither adds Next.js to the standalone Vite dependencies. A later
client-only attempt retained a readiness timeout with no browser errors; the
settled pass does not erase that initial-load/performance observation.

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
