# Cedar / Docs in Sheets Float

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but does not change the runtime language. All registered English locale packs and
official SDK styles remain shared by preview and export. Earlier EN/ZH reports
below are historical interaction evidence, not current bilingual SDK acceptance.

## Current selected Preview acceptance (2026-09-08)

The actual React Preview runs with next-themes in an isolated Vite harness.
EN/ZH native activation and keyboard insertion, independent host formula edits,
the same API owner and complete edited host/child snapshots through dark/light
StorageEvents, and selected React unmount all pass with no console errors or
network writes. Root Arial inheritance and official white SDK CSS are checked;
visible UI text and accessible labels are checked for untranslated keys.
The shared factory uses an English visible startup failure message and the
root stylesheet supplies its own sans-serif font instead of relying on Next CSS.

Run `scripts/test-embed-docsheet-theme.mjs` with `SHOWCASE_MODE=float` and
`SHOWCASE_VITE_MODULE` pointing to the installed Vite module. It binds only
port 4427 and closes its server afterward. Evidence:
`test-results/embed-docsheet-theme-float-final/report.json`.
This is selected desktop interaction acceptance, not exhaustive keyboard,
accessibility, error-injection, fullscreen or history-boundary certification.

An original fictional library procurement story: three suppliers quote different
prices and delivery dates for 24 accessible workbenches. The selected Moss quote
is $19,750, a $1,350 premium over Alder, and leaves four days for inspection.
The adjacent modern document explains the exception, conditions and pending
approval. Sage headings, warm amber cost emphasis and a white native document
differentiate this case from the Slide@Sheet examples.

The internal Notion project-brief reference informed its hierarchy and decision
story, not its artwork or text. No third-party screenshot is distributed.

## Implementation

The shared factory registers a local Docs resource provider and a real
SheetFloating anchor. The SDK owns the embedded child canvas, focus and floating
menu; there is no iframe substitute, fixture selector or host formatting toolbar.
Use native double-click to enter the document and its own native controls to edit.
The Sheet calculates the premium and delivery contingency. Memo numbers remain
authored narrative, not Formula CustomRange bindings.

The provider uses IUniverInstanceService.createUnit with the loader's createOptions,
as in the local SDK example: this beta.2 Docs Facade createDocument signature does
not accept those options. Subsequent document editing uses the real Docs Facade.
The factory imports nine official stylesheets shared by preview and export. Its
Next entry uses next/dynamic with ssr:false to keep browser canvas dependencies
out of server prerendering. Both React files ship as reference text.

## Acceptance scope

`test-results/embed-doc-float-scroll/report.json` passes the selected real SDK run:
native activation, modern document title paint, paragraph mutation and repaint,
scrolling to the lower approval section, a host premium update to $1,700 with the
entire child document unchanged, official white/flex CSS, and active-child teardown
without browser errors. Opening and approval screenshots are checked separately.
Run `scripts/test-embed-doc-float.mjs` with `SHOWCASE_VITE_MODULE` pointing to Vite;
it compiles only this case. `SHOWCASE_ORIGIN` targets an independently built export.

`embed-doc-float-production` passes the same selected behavior in the independent
build, and `embed-doc-float-export-parity` verifies eleven-file source parity and
official CSS. The selected main JS remains 18,070.08 kB / 4,473.19 kB gzip;
the large-chunk warning is not suppressed. Earlier Next cold navigation and warm
child-readiness runs timed out; neither is accepted guide integration evidence.

`embed-doc-pair-next-settled` now passes EN/ZH guide integration with the real
native preview, official CSS and zero browser errors. The English preview was
visually reviewed. The preceding pair run lost its iframe during navigation;
it and the earlier timeouts remain failures, not cold-start acceptance.

Full native keyboard editing, host-child history ownership,
lifecycle failures, narrow layouts, accessibility and performance
must be checked separately. Registering a route is not completion.
Exchange and Print are not registered here; no import/export conversion is claimed.
Reload restores authored data rather than retaining edits. Trial watermarks remain.
