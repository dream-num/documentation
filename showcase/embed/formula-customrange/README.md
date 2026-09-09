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

## Acceptance status

The calculation regression also checks the embedded Sheet's real B10 SUM result
after each funding change, in addition to all four native Doc formula results.
The strict zero-denominator status requirement remains unresolved.

Partial, not fully accepted. The six exact examples, four final rendered inline values, independent Sheet/Base changes, unchanged complete document body, Base fullscreen editing/return, zero-value display/recovery and a detached successful-state display-text snapshot have selected browser evidence. EN/ZH guides, the first literal example in each locale and theme changes preserve the API owner and all three models. Type checking and selected standalone build pass.
