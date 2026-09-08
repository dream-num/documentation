# Moss / Support demand

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

Six original fictional Base records describe weekly support demand by channel,
not individual customers. Week 35 has Email 18, Live chat 12 and Community 6;
Week 34 has 14, 10 and 6. The native Sheet exposes SUMIFS by channel and week,
totals, differences, selected-week shares and growth. A native chart reads
A6:C9 directly. It never receives a hand-built JavaScript series array.

Demand register is a real Base SheetTab. Demand comparison is the host Sheet.
Forest green and ochre distinguish the two periods; native light-mode editor UI
stays white. A dark green heading and gold accent draw on the cached budget-review
reference, with original content and no redistributed competitor artwork.

## Twenty literal examples

Run in order. Activate Demand register for examples 1–11 and Demand comparison
for examples 12–20, using native tabs. Input changes trigger the native formula
engine; there is no manual refresh, fixture panel or duplicate product toolbar.

### 1. Increase selected-week email demand

Selected total 36→40. The comparison total stays 30; only the selected Email
value changes (the chart axis may rescale).

```ts
window.univerAPI.getBase('moss-demand-register').getTableById('demand').getRecordById('week-35-email').setValue('requests', 22)
```

### 2. Correct the comparison week independently

Comparison Email 14→16, total 32. Selected stays 40, giving growth 25%.

```ts
window.univerAPI.getBase('moss-demand-register').getTableById('demand').getRecordById('week-34-email').setValue('requests', 16)
```

### 3. Update context without changing the series

Neither totals nor chart values should change.

```ts
window.univerAPI.getBase('moss-demand-register').getTableById('demand').getRecordById('week-35-chat').setValue('topic', 'Workspace orientation and keyboard navigation')
```

### 4. Show only comparison-week records

The Base view shows three records. Sheet formulas still read the entire table,
so selected 40 and comparison 32 stay unchanged.

```ts
window.univerAPI.getBase('moss-demand-register').getTableById('demand').getViewById('demand-grid').setFilter({
  conjunction: window.univerAPI.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'week', operator: window.univerAPI.Enum.BaseFilterOperator.IS, operand: 'Week 34' }],
})
```

### 5. Edit a hidden record

Selected Live chat 12→15, giving selected total 43. The edited record stays
hidden by the view filter; its contribution still reaches the chart.

```ts
window.univerAPI.getBase('moss-demand-register').getTableById('demand').getRecordById('week-35-chat').setValue('requests', 15)
```

### 6. Restore the complete view

All six records return; calculated values stay unchanged.

```ts
window.univerAPI.getBase('moss-demand-register').getTableById('demand').getViewById('demand-grid').setFilter(null)
```

### 7. A missing count

The source cell is empty, not a stored zero. SUMIFS contributes zero for this
record: selected total 37 and Community share zero; comparison stays 32.

```ts
window.univerAPI.getBase('moss-demand-register').getTableById('demand').getRecordById('week-35-community').setValue('requests', null)
```

### 8. An explicit zero count

The aggregate is still 37, but the source now explicitly records zero requests.

```ts
window.univerAPI.getBase('moss-demand-register').getTableById('demand').getRecordById('week-35-community').setValue('requests', 0)
```

### 9. A zero-demand week

No selected bars remain; comparison bars still show 16, 10 and 6. Selected-share
cells show native #DIV/0!, while growth against the nonzero comparison is -100%.

```ts
const table = window.univerAPI.getBase('moss-demand-register').getTableById('demand')
table.getRecordById('week-35-email').setValue('requests', 0)
table.getRecordById('week-35-chat').setValue('requests', 0)
```

### 10. Recover the selected week

Selected returns to 36. Comparison retains its correction to 32.

```ts
const table = window.univerAPI.getBase('moss-demand-register').getTableById('demand')
table.getRecordById('week-35-email').setValue('requests', 18)
table.getRecordById('week-35-chat').setValue('requests', 12)
table.getRecordById('week-35-community').setValue('requests', 6)
```

### 11. Rename the source, then make a fresh edit

The source retains its stable Base ID. The SDK may rewrite the displayed Base
name in native Sheet formulas after activation. Persist the new qualifier's
explicit stable-ID binding as well: beta.2 can otherwise keep cached values after
snapshot reconstruction without responding to new Base edits. Selected Email 20
must still give total 38; a cached result is not sufficient proof.

```ts
const base = window.univerAPI.getBase('moss-demand-register')
base.setName('Moss / Reviewed demand register')
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'moss-demand-comparison', qualifier: 'Moss / Reviewed demand register', sourceUnitId: 'moss-demand-register', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
base.getTableById('demand').getRecordById('week-35-email').setValue('requests', 20)
```

### 12. Compare the same period

With Demand comparison active, set the selected-week criterion to Week 34.
Both series become 16, 10 and 6, both total 32, and all differences are zero.

```ts
window.univerAPI.getWorkbook('moss-demand-comparison').getSheetBySheetId('comparison').getRange('B4').setValue('Week 34')
```

### 13. An unmatched period is not missing source data

The known Base contains no Week 36 records. SUMIFS correctly gives zero;
selected shares have a zero denominator. Comparison remains 32.

```ts
window.univerAPI.getWorkbook('moss-demand-comparison').getSheetBySheetId('comparison').getRange('B4').setValue('Week 36')
```

### 14. Return to the selected week

Selected returns to 20, 12 and 6 (38). No source records are reset or replaced.

```ts
window.univerAPI.getWorkbook('moss-demand-comparison').getSheetBySheetId('comparison').getRange('B4').setValue('Week 35')
```

### 15. Open native Print preview

This prepares the current Sheet locally; it does not submit an operating-system
print job. The first preview fits the comparison to a page, keeping all channels
visible; subsequent native print-setting changes are preserved. The registered
plugin also supplies the native menu entry. The asynchronous public command is
used because beta.2's synchronous openPrintDialog wrapper rejects its Promise.

```ts
window.univerAPI.executeCommand('sheet.operation.print-open')
```

### 16. Close Print preview

```ts
window.univerAPI.getWorkbook('moss-demand-comparison').closePrintDialog()
```

### 17. Export the native chart as PNG

This is the chart renderer's output, not a screenshot of the application.

```ts
(async () => {
  const chart = window.univerAPI.getWorkbook('moss-demand-comparison').getSheetBySheetId('comparison').getCharts()[0]
  const png = await chart.exportImage({ format: 'png' })
  if (!png?.startsWith('data:image/png')) throw new Error('Native chart PNG is unavailable')
  const link = document.createElement('a')
  link.href = png
  link.download = 'moss-support-demand.png'
  link.click()
})()
```

### 18. Inspect both native snapshots and the chart source

Reading snapshots does not implement persistent save/reload or Exchange conversion.

```ts
const api = window.univerAPI
const sheet = api.getWorkbook('moss-demand-comparison').getSheetBySheetId('comparison')
console.log({ base: api.getBase('moss-demand-register').save(), workbook: api.getWorkbook('moss-demand-comparison').save(), source: sheet.getRange('A6:C9').getValues(), chart: sheet.getCharts()[0].getInfo() })
```

### 19. Point the current qualifier to an unavailable source

The SDK has updated the formula qualifier after example 11. Deliberately bind
that qualifier to an absent unit ID: this should expose a native reference error,
not retain a cached total. The real Base is not deleted. Removing an old alias
alone would not demonstrate a missing source when the displayed name resolves.

```ts
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'moss-demand-comparison', qualifier: 'Moss / Reviewed demand register', sourceUnitId: 'moss-unavailable-register', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 20. Repair the same-source binding

The existing chart and formulas should recover, without a manual recalculation.

```ts
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'moss-demand-comparison', qualifier: 'Moss / Reviewed demand register', sourceUnitId: 'moss-demand-register', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

## Save both units and reconstruct the owner

In your entry module, keep the lifecycle handle with `let demo = createDemo(container)`
instead of `const demo`. Use the same imported `createDemo` and original mount
`container`. This integration example serializes both native snapshots, disposes
the owner and constructs a new one. A workbook snapshot alone does not contain
the embedded Base records. No server or custom restore button is involved.

```js
const saved = JSON.parse(JSON.stringify({
  host: demo.univerAPI.getWorkbook('moss-demand-comparison').save(),
  source: demo.univerAPI.getBase('moss-demand-register').save(),
}))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
```

The comparison Sheet opens after reconstruction. Saved formulas, source mappings,
Base records/view configuration and chart configuration are reused, not replaced
with starter content. An intentionally removed chart stays removed. An unavailable
source mapping is not repaired automatically. The input pair must retain the
original unit IDs, comparison Sheet and demand table; a missing native embed
resource produces a visible startup error. This is native snapshot reconstruction,
not arbitrary file import, Exchange conversion, durable storage or restoration of
an open Print dialog/session settings.

When renaming a source, persist its new qualifier binding as in example 11 before
saving. The restore factory deliberately does not infer bindings from display
names or repair unavailable mappings. Native activation updates the embed timestamp;
the SDK also canonicalizes an initially empty named-range resource from `""` to
`"{}"`. Neither change resets business data.

## Acceptance status

Partial capability coverage. The selected production run in
test-results/embed-moss-formula-verified/report.json passes all twenty literal
examples. It checks actual native column heights across both series, totals,
differences, shares and growth, plus unchanged chart identity/configuration.
Filtered projections contain exactly the expected three records; a hidden edit
still contributes to whole-table formulas. Null and explicit zero remain distinct
stored values. Unknown weeks give zero aggregates with native share errors.

Renaming the Base preserves its ID and fresh edits; the SDK rewrites the displayed
qualifier in native Sheet formulas. Explicitly binding the current qualifier to
an unavailable source produces #VALUE! in the calculated range and removes both
colored chart series. Repair restores live values without replacing the chart.
Native keyboard input changes selected Email 20→24 and the total 38→42.

The native Print preview uses the correct Sheet and shows both chart colors on
one fitted page; it is closed without submitting a print job. PNG export produces
an 1840×730 chart image (86,091 bytes in this run), not an application screenshot.
All leaves of five relevant official locale packs match in EN/ZH; theme switching
preserves both complete native snapshots. Disposal from the active Base tab
releases the owner, with no observed browser errors or backend requests.

test-results/moss-formula-export-ui/report.json verifies eleven-file standalone
source parity and native white styling. The shared factory includes Grid UI and
fourteen explicit official CSS imports. The selected 1,879-module build has a
19,390.73 kB main JS chunk (4,722.47 kB gzip) and 144.65 kB CSS (20.91 kB gzip),
plus language chunks. This is not delivery-performance acceptance.

test-results/embed-moss-roundtrip-native/report.json adds actual serialized
two-unit reconstruction using the literal integration snippet above. It verifies
the entire Base and workbook snapshots, except the recorded embed activation
timestamp and exact empty-name serialization described above. Edited formulas,
comparison criteria, chart title/identity, metadata and filters survive. A new
hidden-record edit and native Sheet keyboard input update real chart bar heights.
Unavailable bindings remain unavailable across reconstruction and recover only
after explicit repair; deliberately removed charts stay removed. EN light and
ZH dark owners preserve their locale/theme. Six invalid snapshot pairs are
rejected before mounting or changing the existing owner. No browser errors,
warnings or backend requests were observed in this selected run.

test-results/embed-moss-formula-roundtrip-regression/report.json reruns all twenty
literal examples after the reconstruction change and explicit rename binding;
the existing native input, Print, PNG, locale/theme and disposal checks pass.

The earlier test-results/embed-moss-roundtrip-serialization/report.json fails:
renaming without persisting the new qualifier left the restored Sheet at cached
values after a new Base edit. Example 11 now explicitly saves the new binding;
this is not a claim that arbitrary native rename paths repair their own resources.

Remaining: different valid-source rebinding, arbitrary source-rename paths, native
history and every menu/editor path, full language interaction coverage, Next
integration, responsive/accessibility behavior and performance. Reading snapshots
alone is not persistence; durable storage is application-owned. No backend,
collaboration or Exchange conversion is claimed.
