# Juniper / Docs in Sheets Tab

A fictional neighbourhood repair weekend has 89 assessment slots and 77 bookings,
but Electronics is overbooked by two. A dedicated native Assumptions document tab
explains why skills, usable hours and inspection slots are not interchangeable.
The separate Readiness worksheet records safety, parts and access checks.

This is an original scenario inspired by the hierarchy of the internal Notion
project-brief reference. No competitor artwork or text is included. Plum/lilac
table headers, teal capacity values and warm coral shortage emphasis distinguish
this case from Cedar's supplier comparison.

## Native integration

SheetTab inserts Assumptions at index 1 between Weekly capacity and Readiness.
The SDK owns the native tab, its main content region, menu and editable Docs unit.
There is no floating substitute, iframe, host tab bar or fixture panel. The local
provider uses the SDK instance service with the requested child createOptions;
Docs editing uses the actual Facade. Sheet formulas and document prose are separate.

Preview and standalone share create-demo.ts and all nine official stylesheets.
The Next entry uses next/dynamic with ssr:false for browser-only Embed UI imports.
Both React entry files are included as reference text, not Vite dependencies.

## Acceptance

`test-results/embed-doc-tab-normalized/report.json` passes native tab switching,
paragraph editing and painting, native Undo/Redo of the complete document body,
host recalculation to 92 slots, unchanged child data after the host edit, and
selected active-child disposal with zero browser errors. The edited-return
screenshot was visually reviewed. Empty body collections are explicit so the
authored snapshot matches the SDK's canonical representation after native Undo.
Earlier resource-exhaustion, hyphenated-title matching and empty-collection
comparison failures remain recorded; they are not relabelled as passed runs.
The independent `embed-doc-tab-production` run also passes, including both live
formula narratives after staffing changes. The capacity, assumptions and readiness
screenshots were visually reviewed. `embed-doc-tab-export-parity` verifies all
eleven exported files and official white/flex CSS. The selected Vite build has
206 installed packages and 1,839 transformed modules; main JS is 18,071.06 kB /
4,473.34 kB gzip and CSS is 110.48 kB / 16.59 kB gzip. The size warning remains.
`embed-doc-pair-next-settled` passes both EN/ZH guides with real native previews
and zero browser errors; the English preview was visually reviewed. The preceding
`embed-doc-pair-next-guides` run lost its iframe during navigation and is retained
as a failure, not cold-start acceptance. Full keyboard editing, host/child history
boundaries and disposal fault coverage remain open.
Narrow layouts, accessibility, source failures and bundle performance remain open.
Exchange and Print are not registered. Reload restores authored content and loses
edits; there is no booking backend, approval workflow or linked formula narrative.
Trial watermarks are retained; case dates do not freeze the SDK clock.
