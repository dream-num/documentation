# Atlas / Floating quote decision

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

Composition: Slide@Sheet Float. Dependency: Sheet -> native Slides Formula Shapes.
These directions are independent. The host contains the only editable commercial
model; six formula shapes across two authored slides reference its stable unit ID.
No JavaScript totals, copied text, manual refresh or simulated child iframe.

The original fictional exhibition plan has a 12000 USD quote and six costs totaling
8400. Native Sheet cells calculate contribution 3600 and margin 30%; slide formulas
read those cells. Sand marks inputs, mint marks Sheet outputs. Navy/cyan and warm
cream/plum slide layouts preserve authored narrative when values change.

## Literal examples

Run these snippets in order in the preview iframe or standalone page. Use explicit
workbook and worksheet identities, not whichever product owns focus. The same
source values can be edited through the native Sheet grid.

### 1. Increase equipment cost

Cost becomes 9000; contribution 3000; margin 25%. Both slide pages must agree.

```ts
window.univerAPI.getWorkbook('atlas-quote-model').getSheetByName('Quote model').getRange('B8').setValue(3000)
```

### 2. Negotiate the quote

Quote becomes 13200; contribution 4200; margin 31.82%.

```ts
window.univerAPI.getWorkbook('atlas-quote-model').getSheetByName('Quote model').getRange('B5').setValue(13200)
```

### 3. Exercise zero quote

Contribution becomes -9000. Both margin shapes must expose the native division
error, not show 0% or retain a previous successful result.

```ts
window.univerAPI.getWorkbook('atlas-quote-model').getSheetByName('Quote model').getRange('B5').setValue(0)
```

### 4. Recover the quote

Restore contribution 3000 and margin 25% without rebuilding the presentation.

```ts
window.univerAPI.getWorkbook('atlas-quote-model').getSheetByName('Quote model').getRange('B5').setValue(12000)
```

### 5. Restore the original equipment assumption

Both pages return to the original 8400 cost and 30% margin.

```ts
window.univerAPI.getWorkbook('atlas-quote-model').getSheetByName('Quote model').getRange('B8').setValue(2400)
```

## Native binding and export

create-demo.ts creates the native SheetFloating anchor, loads the real Slides unit
with a local resource provider, then calls FShape.setFormula with the host Sheet's
stable sourceUnitId and the readable Atlas Quote qualifier. data.ts includes every
expression and destination shape ID. FShape.getFormulaResult exposes native value,
displayText and status. The initial explicit calculation follows registration;
subsequent source edits use automatic SDK calculation.

The preview and standalone entry call the same factory. Twelve official SDK CSS
imports are part of the exported source. Grid ribbon is default. Native Float page
controls are used instead of redundant custom buttons. Trial watermarks remain.
This is a distinct case from Sheet@Slide; it does not claim bidirectional write-back.

## Interface language

The factory always selects English. Its legacy third locale argument is ignored. Business copy, stable IDs, formulas and USD formats remain unchanged; theme changes preserve the owner and both models.

The English interface merges all sixteen applicable locale packs: Design, UI, Docs UI,
Sheets, Sheets UI, Sheets Formula UI, Sheets Numfmt UI, Shape Editor UI, Slides UI,
Embed UI, Drawing UI, Sheets Drawing UI, Formula Engine, Sheets Formula, Slides
core and Embed Unit UI. The last is the Shape Editor UI dependency used by the
formula reference viewer; its official CSS is also included. No unused Ink
plugin is registered or added. Native formula editing is the selected shape's
floating-toolbar **Edit formula** button, not a custom host panel.

The historical bilingual runner `node scripts/test-atlas-locale-native.mjs` requires updated English-only expectations before use against the migrated guide, with optional
`SHOWCASE_DEMO_URL` / `SHOWCASE_BASE_URL`. For isolated production validation set
`SHOWCASE_BUILD_STANDALONE=1`, `SHOWCASE_RESULTS_DIR` to a unique output directory,
and `SHOWCASE_VITE_DIRECTORY` to an existing exact-version Vite package directory.
`SHOWCASE_EXPORT_PORT` defaults to 4428. Only this selected case is built, with
individual exact-version dependency links. The normal entry is unchanged: the
Chinese test serves an HTML response with `lang="zh-CN"` as the integration input.

The locale test checks complete merged packs, true ready-and-painted Slide content,
all five literal examples and six outputs per language, native source typing,
both Float pages, the real formula editor and its localized labels, complete
Sheet/Slides model equality across theme changes, cleanup and every exported
source/CSS file. This scoped language acceptance does not close the original
history, reload and other capability gaps listed below.

## Acceptance

Partial acceptance, not full capability completion.

- `test-results/embed-atlas-formula-lifecycle-final/report.json`: all five literal
  snippets update all six formula results, including the off-page pair. Native
  source keyboard input and Undo, Float page navigation, fullscreen enter/exit,
  authored prose/geometry preservation and subsequent owner disposal pass. No
  browser errors or backend requests were observed.
- `test-results/embed-atlas-formula-active-disposal/report.json`: repeats the same
  checks and additionally disposes with the native child fullscreen still active.
  Reproduce with `SHOWCASE_DISPOSE_FULLSCREEN=1`; native release finishes before
  the host is removed, with no observed asynchronous browser errors.
- `test-results/embed-atlas-formula-next-final/report.json`: EN/ZH guide counts,
  all five snippets and six outputs per locale, theme transitions, exact two-model
  snapshots and instance ownership pass.
- `test-results/atlas-formula-export-ui-final/report.json`: eleven-file source
  parity and live official white SDK UI are checked independently.
- Showcase TypeScript and selected build pass. The build contains 1847 modules;
  entry JS is 18138.49 kB (4497.87 kB gzip), CSS 129.64 kB (19.27 kB gzip).
  This is selected-build evidence, not performance acceptance.

Initial screenshots captured native number-tween intermediate values. The runtime
test now resets its child-canvas text capture per clearRect and waits for the
current page title plus final formatted values before capturing. Formula getters
alone do not prove the visible number. The earlier frame-final report also caught
disposal racing fullscreen scope release. The factory now tracks the actual SDK
exited event, including when the native close button has already cleared session
state; it keeps the host alive through queued focus recovery. No SDK patch.

Remaining: full native editor/menu and exact serialized history matrices, source
rename/rebind, blank/invalid/missing source recovery, resource-preserving save and
reload, in-flight/failure disposal, touch/accessibility, smaller
screens and measured bundle/runtime performance. The cached Gamma budget-review
cover is an internal topic reference only; artwork is not redistributed.

No Exchange, Print, actual PDF, collaborative history or backend is claimed here.
