# Aster / Research results

Current language contract: the native UI, startup alerts and authored data are English under either host language. The legacy third locale argument remains accepted but is ignored. Complete English dependency packs, official CSS, native Grid menus and the distinct source/document story are preserved. Earlier bilingual evidence below is historical; this migration does not resolve its recorded SDK limitations.

Five original simulated folded-paper rebound distances drive ten native inline Formula Custom Ranges in a traditional A4 report. This is **Sheet -> Traditional Doc** data flow and **Sheet@Doc Block** composition. It is not an infinite modern page, a real experiment, a statistical finding or a certified material test. The saved Typst Universe reference informs the technical-publication direction; all prose, data and styling are original.

The three chapters separate the summary, a real embedded observation workbook, and interpretation. Ink/indigo headings, muted violet sections, amber observation inputs and a sage target complement the SDK's official white workbench. The native menus use Grid. No custom fixture toolbar, manual refresh or JavaScript-computed document totals.

## Nine literal examples

### 1. Revise a trial

Change 7.5 to 10. The sum becomes 45, mean/median 9, minimum 8 and maximum 10. Four of five meet the target (80%); the repeated mean is 9 and difference +0.50 mm.

```ts
univerAPI.getWorkbook('aster-observation-source').getSheetBySheetId('observations').getRange('B5').setValue(10)
```

### 2. Change the target independently

The target becomes 9. The sample's statistics do not change; three of five now meet the target (60%), and the mean-minus-target difference is 0.00 mm.

```ts
univerAPI.getWorkbook('aster-observation-source').getSheetBySheetId('observations').getRange('E5').setValue(9)
```

### 3. Remove a measurement

Clear the second trial. Numeric count falls to 4 and sum to 37; mean/median become 9.25, minimum 8.5, maximum 10. Three of four meet the target (75%), and difference becomes +0.25 mm.

```ts
univerAPI.getWorkbook('aster-observation-source').getSheetBySheetId('observations').getRange('B6').clearContent()
```

### 4. Record a measured zero

An explicit zero is included: count 5, sum 37, mean 7.40, median 9, minimum 0, maximum 10. Share becomes 60%, difference -1.60 mm. This is not equivalent to a missing observation.

```ts
univerAPI.getWorkbook('aster-observation-source').getSheetBySheetId('observations').getRange('B6').setValue(0)
```

### 5. A text note is not a numeric observation

The text is ignored by these range aggregates; results return to the four-number sample from example 3. This illustrates formula semantics, not automatic data validation or permission to treat invalid measurements as acceptable input.

```ts
univerAPI.getWorkbook('aster-observation-source').getSheetBySheetId('observations').getRange('B6').setValue('pending')
```

### 6. No numeric sample

Count and sum become 0. The average, median and percentage must expose native errors; the report must not fabricate a mean of zero. The editable target remains 9. Inspect both error text and status rather than assuming they agree in this SDK build.

```ts
univerAPI.getWorkbook('aster-observation-source').getSheetBySheetId('observations').getRange('B5:B9').clearContent()
```

### 7. Recover the original sample and target

```ts
const sheet = univerAPI.getWorkbook('aster-observation-source').getSheetBySheetId('observations')
sheet.getRange('B5:B9').setValues([[7.5], [8], [8.5], [9], [9.5]])
sheet.getRange('E5').setValue(8.5)
```

### 8. Edit a label, not a measured value

All ten document values stay unchanged. The edited label belongs to the source Sheet; it must not replace or rewrite the report's authored narrative.

```ts
univerAPI.getWorkbook('aster-observation-source').getSheetBySheetId('observations').getRange('A5').setValue('Trial 1 / reviewed')
```

### 9. Inspect bindings and a detached reading copy

Native save retains live formula resources. The display-text snapshot is detached; reading it must not modify the live document. Neither is a DOCX/PDF conversion, and saving only the document is not persistence of the separate source workbook.

```ts
const doc = univerAPI.getDocument('aster-research-report')
console.log(doc.getFormulas().map((formula) => formula.getResult()))
console.log(doc.save(), doc.saveFormulaDisplayTextSnapshot())
```

## Formula editor language coverage

The shared factory includes complete official English locale packs, including Docs
Formula UI, Shape Editor UI and Embed Unit UI. The latter two supply native formula
editor and source-selector labels. Their official CSS is included in the independent
export. Runtime startup remains English regardless of the page's HTML language.

## Acceptance boundaries

**Partial evidence, not full acceptance.** Nine literal examples update all ten native results. Current-frame canvas text is checked on both the abstract and interpretation pages; the entire document body, styles, custom ranges and all three native 794 x 1123 page boundaries stay unchanged. Native Sheet fullscreen typing into B5 updates both chapters; exact full-workbook Undo/Redo, five populated Grid ribbon tabs, native source Print preview/cancel and active-source disposal have selected evidence. Print preview is for the observation Sheet, not PDF output or whole-report printing.

The first test incorrectly looked for a space-free prose phrase; actual rendered text contains spaces. The initial clearing snippet also incorrectly used `setValue(null)`, which this Sheet API rejects. Published snippets now use the native `clearContent()` method, preserving formatting. Both were test/example defects corrected without an SDK patch.

Missing/renamed/rebound sources, snapshot reconstruction, every native menu, client Exchange conversion, document printing, accessibility/touch and delivery performance remain unaccepted until separately tested. No backend, collaboration, real research data or submission workflow is included.
