# Aurora / One model, four outputs

An original fictional community exhibition has three department allocations:
Research 4,200, Production 3,600 and Access 2,200. One local Sheet drives eight
inline formulas in a modern brief, eight Formula Shapes over three slides, six
Formula Shapes in a connected Board and a native department column chart.
The planning ceiling starts at 12,000, leaving 2,000 unallocated.

Use the native Department plan, Review deck, Brief and Allocation map tabs.
There is no host-created product switcher, duplicated ribbon, inspector panel or
manual refresh. Edit source amounts in Department plan before comparing outputs.
The chart reads E4:F7, a visible formula-backed projection of the editable
department cells; F9 is its native total. The other outputs refer to the same
workbook's calculation cells. No JavaScript totals or generated replacement prose
are used.

## Twelve literal examples

Run these snippets in order with Department plan active. They use exactly the
same public Facade API exposed by the preview and standalone example.

### 1. Expand Access

The total becomes 10,500; unallocated becomes 1,500; Access share becomes 25.7%.
Compare all four outputs, including the third chart column.

```ts
window.univerAPI.getWorkbook('aurora-budget-model').getSheetBySheetId('allocation').getRange('B7').setValue(2700)
```

### 2. Revise Research independently

Total 11,100, unallocated 900. Production is still 3,600.

```ts
window.univerAPI.getWorkbook('aurora-budget-model').getSheetBySheetId('allocation').getRange('B5').setValue(4800)
```

### 3. Lower the ceiling, not the allocations

Total stays 11,100 and chart columns stay unchanged. Unallocated is -600 and
the formula signal becomes Rebalance scope.

```ts
window.univerAPI.getWorkbook('aurora-budget-model').getSheetBySheetId('allocation').getRange('B11').setValue(10500)
```

### 4. Rebalance Production

Total 10,500, unallocated zero and signal Within ceiling.

```ts
window.univerAPI.getWorkbook('aurora-budget-model').getSheetBySheetId('allocation').getRange('B6').setValue(3000)
```

### 5. Zero is an explicit amount

Total 7,800 and Access share zero. The chart's Access column has no height.

```ts
window.univerAPI.getWorkbook('aurora-budget-model').getSheetBySheetId('allocation').getRange('B7').setValue(0)
```

### 6. Blank is a missing input

The native source cell is empty, not a stored zero. SUM still gives 7,800.
Inspect how native direct references, share and the chart represent the blank.

```ts
window.univerAPI.getWorkbook('aurora-budget-model').getSheetBySheetId('allocation').getRange('B7').setValues([[null]])
```

### 7. Text is not a financial amount

SUM ignores this text, while the Access share calculation displays a native
error. The demo does not coerce it to a number or replace the error with zero.

```ts
window.univerAPI.getWorkbook('aurora-budget-model').getSheetBySheetId('allocation').getRange('B7').setValue('Pending')
```

### 8. Restore all department inputs

Total returns to 10,000. The revised ceiling is still 10,500, so headroom is 500.

```ts
window.univerAPI.getWorkbook('aurora-budget-model').getSheetBySheetId('allocation').getRange('B5:B7').setValues([[4200], [3600], [2200]])
```

### 9. Rename the source, then prove a fresh calculation

The native external-reference mapping uses a stable workbook ID. The qualifier
Aurora Budget must still resolve after changing the display name. Research 4,300
then gives total 10,100. A cached value alone is not proof of this scenario.

```ts
const workbook = window.univerAPI.getWorkbook('aurora-budget-model')
workbook.setName('Aurora / Revised exhibition budget')
workbook.getSheetBySheetId('allocation').getRange('B5').setValue(4300)
```

### 10. Context is not an allocation

Change the Research purpose. No formula result or chart column should change.

```ts
window.univerAPI.getWorkbook('aurora-budget-model').getSheetBySheetId('allocation').getRange('D5').setValue('Add an oral-history interview to the research discussion')
```

### 11. Restore the starting numbers

The display name and authored context are intentionally preserved.

```ts
const sheet = window.univerAPI.getWorkbook('aurora-budget-model').getSheetBySheetId('allocation')
sheet.getRange('B5:B7').setValues([[4200], [3600], [2200]])
sheet.getRange('B11').setValue(12000)
```

### 12. Inspect each native snapshot

These are separate editable SDK units, not screenshots. Saving here reads the
snapshots; it does not implement persistence or an Exchange conversion.

```ts
const api = window.univerAPI
console.log({
  sheet: api.getWorkbook('aurora-budget-model').save(),
  brief: api.getDocument('aurora-budget-note').save(),
  slides: api.getPresentation('aurora-review-deck').save(),
  board: api.getBoard('aurora-allocation-map').save(),
})
```

## Native composition and reference

The Sheet owns three SheetTab embeds. All outputs bind the Aurora Budget
qualifier to aurora-budget-model through FFormula.upsertExternalReference.
FDocument.insertFormula preserves authored paragraphs. Native Formula Shapes
preserve slide/card positions. FWorksheet.insertChart reads the actual Sheet
range, so the chart is not fed a separately computed JavaScript series.

The cached Gamma budget-review reference informs the dark overview, warm gold
accent and spacious review pages. All prose, numbers and layouts here are
original; no competitor artwork is redistributed. Other views use teal, sage,
lavender and amber while preserving official white editor UI.

Preview and standalone share one factory, Grid ribbon, English and Simplified
Chinese plugin locale packs and explicit official CSS imports, including Formula
editor dependencies. No backend, collaboration, approval workflow, Exchange or
Print capability is claimed by this particular composite.

## Acceptance status

Partial, not fully accepted. The selected standalone run is recorded in
test-results/embed-aurora-formula-native-final/report.json. All twelve literal
examples pass their selected checks: eight inline Doc values, eight Formula
Shapes across three Slides and six Board Formula Shapes update on the current
native canvases. The chart reads the visible formula-backed E4:F7 range; F9 and
actual column heights are checked against the edited department amounts.

Independent department and ceiling edits, zero, blank, invalid text and recovery,
unrelated context edits, source display-name changes and persisted source-ID
bindings have evidence. Real keyboard input in B7 changes Access to 2,600 and
updates all outputs to a total of 10,400. Complete authored Doc content and
Slides/Board pages remain unchanged, excluding only the SDK's persisted Formula
Shape lastValue calculation cache. Disposal from the active Board tab passes.
No browser errors or backend requests were observed in this selected run.

The strict report remains FAIL: the Doc share displays #VALUE! but its native
result reports status success and string type. Slides and Board error results
are not normalized by the demo. This beta.2 SDK issue is retained in the report.

test-results/embed-aurora-formula-next-final/report.json passes selected EN/ZH
guide checks: the first exact snippet, initial locale labels, official white UI,
absence of redundant controls and theme changes preserving the owner and full
models. It does not exercise every Formula editor action or all twelve snippets
in both guide locales. test-results/aurora-formula-export-ui/report.json checks
eleven-file standalone source parity and native white SDK styling.

Remaining: native error classification, actual multi-unit save/reload,
missing-source and different-source rebinding, Undo/Redo, all native editor and
locale actions, responsive/accessibility coverage and delivery performance.
The combined SDK bundle is large; this route is compiled independently, not
with every demo. No complete acceptance, persistence or conversion claim.
