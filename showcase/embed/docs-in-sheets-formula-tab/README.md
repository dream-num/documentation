# Cypress / Forecast notebook

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

A fictional independent press separates total-period cash from collection timing.
Opening $4,000 plus expected collections $12,500 less payments $9,800 yields
$6,700. At 75% collected before payment, the balance is only $3,575: $1,425 below
a $5,000 floor. Thirteen native Doc formulas read real Sheet cells.

## Composition

Cash forecast is the native source Sheet. Forecast notebook is a separate native
Doc Tab in its SheetBar, not a Float, iframe, screenshot or manually rendered note.
Doc@Sheet describes placement; Sheet → Doc describes calculation, not write-back.

The saved Gamma budget-review reference informs narrative hierarchy and contrast,
not copied artwork. Original plum, moss and warm cream separate the story from
Saffron. English business content and English interface packs share official CSS.
The native Grid ribbon supplies controls; no fixture panel or extra feature card.

## Run these examples in order

Wait for `.cypress-embed[data-ready="true"]`. Use the guide or `window.univerAPI`.
Switch between Cash forecast and Forecast notebook to inspect each change. Wait
for native recalculation; neither page needs a manual refresh. The authored body
must remain unchanged by source edits.

### 1. Increase project collections

Project receipts $4,500 make incoming $13,000 and expected close $7,200. The timing balance is only $3,950.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B9').setValue(4500)
```

### 2. Improve collection timing

At 90%, the payment-date balance becomes $5,900, above the $5,000 floor. Total-period collections and closing cash do not change.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B18').setValue(0.9)
```

### 3. Raise the reserve floor

A $6,500 floor changes both gaps and the prompt, not any cash flow.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B17').setValue(6500)
```

### 4. Revise paper cost

Paper $4,800 makes payments $10,300, expected close $6,700 and timing balance $5,400.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B12').setValue(4800)
```

### 5. Revise the opening position

Opening $5,000 makes expected close $7,700 and timing balance $6,400.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B5').setValue(5000)
```

### 6. Nothing collected before payment

A 0% timing assumption keeps expected period collections $13,000 but makes timing balance -$5,300.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B18').setValue(0)
```

### 7. Every collection arrives in time

At 100%, timing balance equals expected closing cash. No income is added.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B18').setValue(1)
```

### 8. Unknown project estimate

Clear the value through the native cell object. SUM excludes it, but this does not establish that project receipts will be zero.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B9').setValue({ v: null })
```

### 9. A known zero

The same arithmetic now has an explicit numeric zero in the source.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B9').setValue(0)
```

### 10. An unpriced project

The literal pending text remains in the source. SUM ignores it; the notebook does not invent an estimate.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B9').setValue('pending')
```

### 11. Restore the baseline

Restore every original assumption explicitly. Expected close $6,700, timing balance $3,575 and timing gap -$1,425.

```ts
const sheet = univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast')
sheet.getRange('B5').setValue(4000)
sheet.getRange('B8:B9').setValues([[8500], [4000]])
sheet.getRange('B12:B14').setValues([[4300], [3500], [2000]])
sheet.getRange('B17:B18').setValues([[5000], [0.75]])
```

### 12. No planned payment

Collections/payments is a native division error, not infinite certified coverage.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B12:B14').setValues([[0], [0], [0]])
```

### 13. Restore the payment rows

Recover through the real source, without replacing the document.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B12:B14').setValues([[4300], [3500], [2000]])
```

### 14. Invalid timing assumption

Text cannot be multiplied into cash. Native errors replace timing results and the conditional prompt.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B18').setValue('pending')
```

### 15. Repair the timing input

Restore 75%; normal values return.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B18').setValue(0.75)
```

### 16. Rename the workbook display label

The document keeps its original Cypress Forecast formula alias. Retain that actual binding instead of creating an unused alias.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').setName('Cypress / Reviewed forecast')
univerAPI.getFormula().upsertExternalReference({ unitId: 'cypress-forecast-notebook', qualifier: 'Cypress Forecast', sourceUnitId: 'cypress-cash-forecast', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_SHEET })
```

### 17. Fresh calculation after rename

Freight $2,200 makes payments $10,000 and expected close $6,500.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').getSheetBySheetId('forecast').getRange('B14').setValue(2200)
```

### 18. Unavailable source mapping

The real Sheet is still intact, but all dependent document results must expose native errors.

```ts
univerAPI.getFormula().upsertExternalReference({ unitId: 'cypress-forecast-notebook', qualifier: 'Cypress Forecast', sourceUnitId: 'cypress-unavailable-source', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_SHEET })
```

### 19. Repair the same mapping

Do not recreate the notebook or reset the source inputs.

```ts
univerAPI.getFormula().upsertExternalReference({ unitId: 'cypress-forecast-notebook', qualifier: 'Cypress Forecast', sourceUnitId: 'cypress-cash-forecast', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_SHEET })
```

### 20. Open native Sheet Print

Select the real source tab before opening its registered frontend Print plugin. No print job is submitted; this is not Doc/PDF conversion.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').setActiveSheet('forecast')
univerAPI.executeCommand('sheet.operation.print-open')
```

### 21. Close Print

Return without submitting a job.

```ts
univerAPI.getWorkbook('cypress-cash-forecast').closePrintDialog()
```

### 22. Edit the notebook's review line

Select Forecast notebook first. A native Doc paragraph change must not change source assumptions or formula values.

```ts
univerAPI.getDocument('cypress-forecast-notebook').getParagraphs()[2].setText('Planning note / Reviewed by Mae')
```

### 23. Inspect the owners

Two snapshots remain separate. Saving is not durable storage or retained Undo history.

```ts
console.log({ sheet: univerAPI.getWorkbook('cypress-cash-forecast').save(), document: univerAPI.getDocument('cypress-forecast-notebook').save(), results: univerAPI.getDocument('cypress-forecast-notebook').getFormulas().map(formula => formula.getResult()) })
```

## Boundaries and acceptance

Collection percentage is an illustrative timing assumption, not a probability,
discount or guarantee. There are fixed authored rows, not an automatically growing
financial model. Expected collections are not net profit or a bank feed; the
reserve floor is not financial advice. Null and unpriced text are not measured zero.

Preview and standalone share one factory, data, complete dependency locales and
official CSS. Theme changes preserve owners. Source references use stable IDs.
Native errors must remain visible; existing Doc error-status issues are not hidden.

In this tested Tab sequence, keyboard Undo restores the authored Doc body and
leaves the Sheet unchanged. Full Undo snapshot equality fails because native
DOC_FORMULA_PLUGIN lastValue caches change; full Redo equality passes. Separate
authored-state checks retain every formula ID, expression and format while
excluding only lastValue for that independent assertion. They do not override
the strict failure. Raw before/after/Undo/Redo snapshots are retained in the report
directory. No SDK source or installed package was patched.

Complete
snapshot reconstruction, different valid-source rebinding, every native menu,
Exchange/full Print conversion, Next delivery, mobile/accessibility and performance
remain open. No collaboration, backend, publishing or automated payments.
