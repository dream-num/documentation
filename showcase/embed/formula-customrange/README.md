# Estuary / Data-linked narrative

A fictional neighborhood listening project: four funding contributions in a Sheet and five delivery commitments in a Base drive four native Doc Formula custom ranges. Both sources are real document blocks. Everything runs in this browser; reload discards local edits.

## What is live

The first paragraph reports funding **16,000.00**, commitments **9,800.00**, unallocated funding **6,200.00**, and spending share **61.25%**. The native formula engine calculates these values; application code neither sums the source data nor rewrites the paragraph. Named external references are bound to stable unit IDs during `FDocument.insertFormula()`.

The composition is Sheet + Base @ Modern Docs. The data dependency is Sheet + Base -> Docs, not automatic two-way writing. Docs uses native Block embeds, not tabs. A Base aggregate covers the whole Costs table, not necessarily its filtered view.

## Six literal examples

Run these exact snippets with the demo's `univerAPI`, in order. IDs identify the source regardless of which product currently has focus. Expand the Base block before changing its record: beta.2 Base commands can change global focus, which is tested separately from calculation correctness.

### 1. A larger funding envelope

Funding becomes 17,500.00; commitments remain 9,800.00; balance becomes 7,700.00; share becomes 56.00%.

```ts
univerAPI.getWorkbook('estuary-funding-model').getSheetBySheetId('funding').getRange('B5').setValue(7500)
```

### 2. A larger listening programme

The first Base commitment increases by 600. Funding remains 17,500.00; commitments become 10,400.00; balance becomes 7,100.00; share becomes 59.43%.

```ts
univerAPI.getBase('estuary-delivery-register').getTableById('costs').getRecordById('cost-1').setValue('amount', 3800)
```

### 3. Zero denominator is visible

Funding is zero, commitments remain 10,400.00, balance is -10,400.00, and the native percentage result is #DIV/0!. The surrounding prose remains intact.

```ts
univerAPI.getWorkbook('estuary-funding-model').getSheetBySheetId('funding').getRange('B5:B8').setValues([[0], [0], [0], [0]])
```

### 4. Restore funding independently

Funding returns to 16,000.00; commitments are still 10,400.00; balance is 5,600.00; share is 65.00%.

```ts
univerAPI.getWorkbook('estuary-funding-model').getSheetBySheetId('funding').getRange('B5:B8').setValues([[6000], [4500], [3500], [2000]])
```

### 5. Restore commitments

All four results return to the baseline. This changes the Base only, not the funding Sheet.

```ts
univerAPI.getBase('estuary-delivery-register').getTableById('costs').getRecordById('cost-1').setValue('amount', 3200)
```

### 6. Inspect live bindings and an export projection

```ts
const brief = univerAPI.getDocument('estuary-field-brief')
const formulas = brief.getFormulas().map(formula => ({ id: formula.getId(), formula: formula.getFormula(), result: formula.getResult() }))
const nativeSnapshot = brief.save()
const displayTextSnapshot = brief.saveFormulaDisplayTextSnapshot()
console.log({ formulas, nativeSnapshot, displayTextSnapshot })
```

The detached display-text snapshot substitutes the **persisted last successful values** and removes formula resources/ranges. It does not wait for calculation, recalculate, modify the live document, or produce a DOCX/PDF file. During an error it can retain an earlier successful display value; do not present it as a fresh error-state export. Native save retains editable bindings.

## Native presentation and source parity

English authored content; EN/ZH guide metadata. Deep teal headings, slate prose and amber Sheet inputs vary the business data without replacing the official white SDK workbench. The default ribbon is Grid. All required SDK CSS imports belong to the exported `create-demo.ts`; no custom fixture toolbar or refresh button is added. Preview and standalone entry call this same factory.

## Formula editor language coverage

The shared factory includes complete official English locale packs
for every configured locale import, including Docs Formula UI, Shape
Editor UI and Embed Unit UI. The last two are dependencies of the native formula
editor and source selector; loading only Docs Formula UI does not translate them.
Their official CSS is included in the independent export. The factory always
starts in English, independently of the page's HTML language or a legacy locale
argument. The document and both source datasets are English as well. It does not
change the documentation host language or provide a demo language switch.

Run scripts/test-docs-formula-locales.mjs with SHOWCASE_CASE=estuary,
SHOWCASE_ENGLISH_ONLY=1 and the selected build manifest as its argument.
It checks all official leaves in the three formula
editor packs, the native Edit formula action, the formula editor, more number
formats, visible text/accessible labels/placeholders, and exact document/owner
preservation after cancellation on both English and Chinese host pages with
English native UI. Earlier bilingual evidence is historical:
test-results/docs-formula-locales-estuary/report.json.
This is language acceptance, not full layout acceptance: native dialog bounds
are recorded separately. Cinder's development integration also retains React
synchronous-unmount warnings when dismissing the source viewer; see sdk-issues.md.

## Acceptance status

The English-only factory passes selected independent source/CSS startup in
`test-results/estuary-english-export/report.json`. Native editor evidence in
`test-results/estuary-english-dialogs/report.json` passes both host languages:
complete formula-related English packs, Edit formula, number formats, Cancel,
and preservation of the document and both source owners/snapshots. A real
keyboard edit to `=1+2` followed by Confirm displays `3.00`; native editing
restores the original external formula and its `16,000.00` result without
changing the other formulas or source datasets. International date format codes
containing quoted year/month/day literals remain SDK format data, not untranslated
interface labels. No visible translation keys or console errors were observed.

`test-results/estuary-english-calculation/report.json` reruns all six literal
examples, source-driven rendered values, unchanged body, detached projection
and active Base fullscreen cleanup. It remains strictly failing only for the
known zero-denominator result-status issue below. These scoped production runs
do not certify every native source-editing path or resolve the earlier
development-shell unmount issue. The historical bilingual runs below remain
evidence of their original scopes, not current English-language acceptance.

Isolated export recheck (2026-09-08): the exact selected export builds and its
production native editor passes EN/ZH pack, Edit formula, number-format dialog,
viewport and cancellation-preservation checks with no console errors. Evidence:
`test-results/estuary-formula-4427-locales/report.json`. The untranslated key is
not reproducible with the current exported packs; no replacement labels were added.

The same export served by Vite in development reproduces the four synchronous
React-unmount errors, independently of the Next preview. The minimal dedicated
`scripts/test-embed-estuary-formula-unmount.mjs` retains a failing assertion and
full console-origin trace. Native Cancel runs the installed Embed Unit UI
ReferencedUnitViewer effect cleanup, which calls session.unmount, disposes its
child Univer, and reaches DesktopUIController/React root.unmount during React's
passive-effect commit. The host owner stays alive and the demo's dispose is not
called. Evidence: `test-results/estuary-formula-4427-unmount-fulltrace/report.json`.
This is an SDK-owned lifecycle problem; production's lack of the development
warning is not proof it is fixed. No SDK package or console error was patched.

The calculation regression also checks the embedded Sheet's real B10 SUM result
after each funding change, in addition to all four native Doc formula results.
The strict zero-denominator status requirement remains unresolved.

Current selected Next development regression (2026-09-07): both language packs,
native Edit formula actions, formula/number-format dialogs and cancellation
preservation pass; both desktop dialogs fit the viewport. However, the strict
run fails on four React synchronous-unmount console errors. Reproduce with
`SHOWCASE_CASE=estuary` and `SHOWCASE_ORIGIN` pointing to this playground using
`scripts/test-docs-formula-locales.mjs`. The current report is
`test-results/docs-formula-locales-estuary-current/report.json`. Earlier selected
production evidence does not certify this development-shell lifecycle path.
Do not filter these errors or treat translated labels as full acceptance.

Partial, not fully accepted. The six exact examples, four final rendered inline values, independent Sheet/Base changes, unchanged complete document body, Base fullscreen editing/return, zero-value display/recovery and a detached successful-state display-text snapshot have selected browser evidence. EN/ZH guides, the first literal example in each locale and theme changes preserve the API owner and all three models. Type checking and selected standalone build pass.

**Known SDK issue:** the zero-denominator formula visibly displays `#DIV/0!`, but beta.2 returns `status: success` and a string cell type rather than an error status. The strict runtime report stays FAIL for this gate. The demo does not rewrite that result. Error-state persistence/projection semantics need separate verification; the successful-state snapshot check does not certify them.

Evidence: `scripts/test-embed-estuary-formula.mjs`, `test-results/embed-estuary-formula-final/report.json`, `scripts/test-embed-estuary-formula-guide.mjs` and `test-results/embed-estuary-formula-next/report.json`. Full native source editing/history, saved-resource reload/rebind, unavailable/invalid sources, racing/in-flight disposal, printing, Exchange export, touch and performance remain open. A Pro license is required for a watermark-free published experience; the demo does not hide SDK license notices.
