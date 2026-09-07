# Prism / Plan versus actual

A fictional learning studio compares September income with three target envelopes.
The target worksheet supplies $60,000; six Confirmed Base records supply $54,500.
The $5,500 gap, 90.8% attainment and channel mix are native Sheet formulas.
A real two-series column chart reads the visible range A6:C9.

## Exact composition

- Target plan is an editable native Sheet within the host workbook.
- Income register is a separate Base embedded as a native Sheet Tab.
- Plan versus actual contains the criteria, visible calculations and native chart.
- This is Sheet + Base → Sheet range → Chart, not Sheet@Sheet or an external-workbook demo.
  The current SDK capability table does not declare Sheet@Sheet embedding; that
  separate coverage gap is not claimed as solved here.
- Base filters project the view only. Formula criteria define which records count.

The saved Gamma budget-review reference informs the review story and contrast,
not copied artwork. Original navy, teal, gold and lilac separate the actuals,
targets and variances. All business content is English; menus and guides support
EN/ZH. The native Grid ribbon supplies the controls; there is no fixture toolbar.

## Run these examples in order

Wait for `.prism-embed[data-ready="true"]`. Use the guide runner or
`window.univerAPI` in the console. Each code block below is the literal code
tested against the running factory. Wait for native recalculation between steps.

### 1. Revise confirmed income

New memberships become $12,500: actual $58,000, target $60,000, gap $2,000. Base drives the teal series; Sheet targets do not change.

```ts
univerAPI.getBase('prism-income-register').getTableById('income').getRecordById('member-new').setValue('amount', 12500)
```

### 2. Revise only the target

Workshops target becomes $23,000. Total target $62,000, actual remains $58,000 and gap becomes $4,000.

```ts
univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('targets').getRange('B6').setValue(23000)
```

### 3. Confirm a draft without inventing income

The $2,900 partner workshop now qualifies. Actual becomes $60,900; gap $1,100. The record amount and target are unchanged.

```ts
univerAPI.getBase('prism-income-register').getTableById('income').getRecordById('draft-workshop').setValue('status', 'Confirmed')
```

### 4. Choose Draft explicitly

Only the $1,700 Editions draft qualifies. A source-view filter is not being applied; the amber criterion drives SUMIFS.

```ts
univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('comparison').getRange('D4').setValue('Draft')
```

### 5. Change the reporting period

August confirmed income is $9,600 Membership, zero elsewhere. September targets remain $62,000: changing the actual period does not silently pick a new plan.

```ts
const sheet = univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('comparison')
sheet.getRange('B4').setValue('August')
sheet.getRange('D4').setValue('Confirmed')
```

### 6. Return to September

Actual $60,900 and target $62,000 return without replacing the chart.

```ts
univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('comparison').getRange('B4').setValue('September')
```

### 7. Filter the Base view

Only the remaining Draft record is visible. The whole-table SUMIFS still aggregates September Confirmed entries.

```ts
univerAPI.getBase('prism-income-register').getTableById('income').getViewById('income-grid').setFilter({
  conjunction: univerAPI.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'status', operator: univerAPI.Enum.BaseFilterOperator.IS, operand: 'Draft' }],
})
```

### 8. Edit a hidden record

Workshop guides are hidden by the view. Raising their amount to $6,500 makes Editions $14,900 and actual $61,800; gap is $200.

```ts
univerAPI.getBase('prism-income-register').getTableById('income').getRecordById('edition-guide').setValue('amount', 6500)
```

### 9. Reveal every source record

Nine records return; the calculated range and chart remain unchanged.

```ts
univerAPI.getBase('prism-income-register').getTableById('income').getViewById('income-grid').setFilter(null)
```

### 10. An unknown amount

Null is stored as null. The aggregate ignores it: Membership $12,800, total $49,300. This does not certify the report is complete.

```ts
univerAPI.getBase('prism-income-register').getTableById('income').getRecordById('member-new').setValue('amount', null)
```

### 11. A known zero

The same chart heights now describe an explicitly zero source amount. A blank and a zero are not the same source state.

```ts
univerAPI.getBase('prism-income-register').getTableById('income').getRecordById('member-new').setValue('amount', 0)
```

### 12. Zero target is not zero attainment

The Workshops target is zero; its attainment is a native division error. Actual remains $49,300. Target total is $39,000; the gold Workshops bar disappears.

```ts
univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('targets').getRange('B6').setValue(0)
```

### 13. No matching period

November has no matching records. All actuals become zero and actual-mix fractions expose native 0/0 errors; this is not a source outage.

```ts
univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('comparison').getRange('B4').setValue('November')
```

### 14. Restore the original comparison

Return to $54,500 actual, $60,000 target and $5,500 gap. The Draft exclusions and September criterion are explicit.

```ts
const workbook = univerAPI.getWorkbook('prism-income-comparison')
workbook.getSheetBySheetId('targets').getRange('B5:B7').setValues([[24000], [21000], [15000]])
workbook.getSheetBySheetId('comparison').getRange('B4').setValue('September')
workbook.getSheetBySheetId('comparison').getRange('D4').setValue('Confirmed')
const table = univerAPI.getBase('prism-income-register').getTableById('income')
table.getRecordById('member-new').setValue('amount', 9000)
table.getRecordById('edition-guide').setValue('amount', 5600)
table.getRecordById('draft-workshop').setValue('status', 'Draft')
```

### 15. Unrelated context

Changing a coordinator does not change the financial criteria, targets or chart.

```ts
univerAPI.getBase('prism-income-register').getTableById('income').getRecordById('edition-guide').setValue('owner', 'Rin')
```

### 16. Rename and persist the current qualifier

The Base ID remains prism-income-register. The SDK rewrites the displayed qualifier in formulas; explicitly bind that new qualifier for later reconstruction.

```ts
univerAPI.getBase('prism-income-register').setName('Prism / Reviewed income')
univerAPI.getFormula().upsertExternalReference({ unitId: 'prism-income-comparison', qualifier: 'Prism / Reviewed income', sourceUnitId: 'prism-income-register', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 17. Prove live calculation after rename

New memberships $9,300 makes actual $54,800 and gap $5,200. This checks more than a cached pre-rename picture.

```ts
univerAPI.getBase('prism-income-register').getTableById('income').getRecordById('member-new').setValue('amount', 9300)
```

### 18. Make the Base mapping unavailable

The real Base stays intact. Native errors must replace actuals. Sheet targets still have their own source; do not substitute zeros for errors.

```ts
univerAPI.getFormula().upsertExternalReference({ unitId: 'prism-income-comparison', qualifier: 'Prism / Reviewed income', sourceUnitId: 'prism-unavailable-register', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 19. Repair the same-source mapping

Live values return without recreating the chart or resetting either source.

```ts
univerAPI.getFormula().upsertExternalReference({ unitId: 'prism-income-comparison', qualifier: 'Prism / Reviewed income', sourceUnitId: 'prism-income-register', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 20. Invalid target text

A target of pending is not a number. Membership attainment retains a native error; SUM excludes the text from the total. Inspect the source cell and chart behavior together.

```ts
univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('targets').getRange('B5').setValue('pending')
```

### 21. Recover the numeric target

Target returns to $60,000 and actual remains $54,800.

```ts
univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('targets').getRange('B5').setValue(24000)
```

### 22. Open native frontend Print

Open the comparison first. This is the registered Sheet Print plugin, not browser-page printing. Inspect the chart in preview; no print job is submitted.

```ts
const workbook = univerAPI.getWorkbook('prism-income-comparison')
workbook.setActiveSheet('comparison')
univerAPI.executeCommand('sheet.operation.print-open')
```

### 23. Close Print without submitting

The workbook and chart remain editable.

```ts
univerAPI.getWorkbook('prism-income-comparison').closePrintDialog()
```

### 24. Export the actual native chart

Downloads a native chart PNG, not an application screenshot.

```ts
(async () => {
  const chart = univerAPI.getWorkbook('prism-income-comparison').getSheetBySheetId('comparison').getCharts()[0]
  const png = await chart.exportImage({ format: 'png' })
  if (!png?.startsWith('data:image/png')) throw new Error('Native chart PNG is unavailable')
  const link = document.createElement('a')
  link.href = png
  link.download = 'prism-plan-versus-actual.png'
  link.click()
})()
```

### 25. Inspect both owners and the chart source

The host workbook contains both Target plan and Plan versus actual. The Base snapshot is separate; the chart binds A6:C9, not a JavaScript series array.

```ts
const workbook = univerAPI.getWorkbook('prism-income-comparison')
const sheet = workbook.getSheetBySheetId('comparison')
console.log({ workbook: workbook.save(), base: univerAPI.getBase('prism-income-register').save(), source: sheet.getRange('A6:C9').getRawValues(), chart: sheet.getCharts()[0].getInfo() })
```

## Reconstruct both native owners

In the standalone entry module use `let demo = createDemo(container)` so the
application can replace its own handle. Keep the same imported factory and mount
element. Run this only after calculation has settled. Both native snapshots are
required; the workbook embeds a Base reference, not its complete records.

```js
const saved = JSON.parse(JSON.stringify({
  host: demo.univerAPI.getWorkbook('prism-income-comparison').save(),
  source: demo.univerAPI.getBase('prism-income-register').save(),
}))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
```

The factory reuses saved formulas, source bindings, chart configuration, targets
and Base records. It does not reseed removed charts or repair unavailable source
mappings. Invalid unit IDs, missing worksheets/table, or missing native tab
resources/anchors are rejected before a new owner is mounted. This is in-memory
snapshot reconstruction, not durable storage, arbitrary file import or retained
Undo history. Changing the selected period does not choose a different target plan.

## Source, lifecycle and acceptance

Preview and standalone export use the same factory, data, official CSS and
complete EN/ZH registered dependency packs. Themes change the existing owner,
not the edited models. Native Print and PNG export use the SDK Facade.

Selected runtime checks pass all twenty-five literal examples, current native
bar geometry, independent sources, native typing and exact source Undo/Redo,
Print preview, chart PNG, complete EN/ZH packs, themes and active-Base disposal.
See test-results/embed-prism-formula-final/report.json. Eleven-file source/CSS
parity passes at test-results/prism-formula-export-ui/report.json.

Four reconstructed owners preserve authored state and fresh calculation,
including edited formulas/chart titles, hidden records, unavailable bindings,
Chinese dark mode and a removed chart. Ten invalid bundles are rejected without
changing the original owner. However, the strict reconstruction report remains
FAIL: the first Sheet drawing reload adds five explicit transform defaults
(flipX/flipY false, angle/skewX/skewY zero). The actual position and dimensions
remain unchanged. Raw before/after snapshots and the independent authored-state
checks are retained in test-results/embed-prism-roundtrip-authored/report.json;
authored-state preservation is not full serialized-state equivalence.

Different valid-source rebinding, every native menu path, full Print/Exchange,
Next delivery, performance, mobile and accessibility remain open. Sheet@Sheet
embedding is not covered by this in-workbook target worksheet. Saving snapshots
is not durable storage or Exchange file conversion. No collaboration, external
publishing or server is included.
