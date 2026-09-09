# Pivot Table Layouts

Eight print-shop transactions feed one native pivot table. Region and Product form two row dimensions; Channel creates columns. The initial compact layout sums Amount. Native configuration and the recipes below switch the same pivot to tabular layout, Count or Average. The output sheet contains no authored summaries: the Pivot plugin creates every result. One instance respects the installed SDK's default one-pivot limit without changing license settings.

Initial totals are North 260, South 440 and overall 700. Counts are four records per region, eight overall. Web totals 340; Store totals 360. Compact layout combines row labels; tabular layout places Region and Product in separate columns.

Select a pivot cell to inspect its native controls. Edit the Sales source sheet rather than the calculated output. The factory uses the public addPivotTable, addField, setSubtotalType, setLayout and setOptions APIs; no SUMIF stand-in, private service or host aggregation is used.

## Public Facade recipes

Reload the demo before each async block, then wait for initialization to complete. Each recipe assumes the initial Sum aggregation and source values; for example, refreshing after switching to Count will still count records rather than produce a sum of 800.

```ts
const workbook = window.univerAPI.getActiveWorkbook()
const pivot = workbook.getSheetBySheetId('sales').getPivotTableByCell(3,0)
await pivot.setLayout(window.univerAPI.Enum.PivotLayoutTypeEnum.tabular)
// Region and Product now occupy separate row-label columns; the total remains 700.
```

```ts
const workbook = window.univerAPI.getActiveWorkbook()
const pivot = workbook.getSheetBySheetId('sales').getPivotTableByCell(3,0)
const valueId = pivot.getFieldIdsByArea(window.univerAPI.Enum.PivotTableFiledAreaEnum.Value)[0]
await pivot.setLayout(window.univerAPI.Enum.PivotLayoutTypeEnum.tabular)
await pivot.setSubtotalType(valueId, window.univerAPI.Enum.PivotSubtotalTypeEnum.count)
await pivot.renameField(valueId, 'Count of Amount')
// Counts are North 4, South 4 and overall 8, with separate Region / Product columns.
```

```ts
const workbook = window.univerAPI.getActiveWorkbook()
workbook.getSheetBySheetId('source').getRange('D5').setValue(220)
const pivot = workbook.getSheetBySheetId('sales').getPivotTableByCell(3,0)
await pivot.updateSourceRange(pivot.getSourceRangeInfo())
// Sum: North 360, South 440, overall 800.
```

For Average on the initial inputs:

```ts
const workbook = window.univerAPI.getActiveWorkbook()
const pivot = workbook.getSheetBySheetId('sales').getPivotTableByCell(3,0)
const valueId = pivot.getFieldIdsByArea(window.univerAPI.Enum.PivotTableFiledAreaEnum.Value)[0]
await pivot.setSubtotalType(valueId, window.univerAPI.Enum.PivotSubtotalTypeEnum.average)
await pivot.renameField(valueId, 'Average of Amount')
// Overall 87.5; North 65; South 110.
```

Await the operations and the rendered result before reading output. Source refresh reuses the same bounded A4:D12 range; adding records outside it requires expanding that range. This example does not claim automatic source-range expansion or import/export coverage.

Editing an existing source amount also updated the pivot automatically in this demo; the refresh recipe explicitly reloads the same source range. Changing aggregation does not automatically rename the measure, so the Count and Average recipes update its label too.

Complete Core preset, Pivot and Pivot UI English locales and official CSS are loaded. Existing license notices are retained. Preview and exported source share the same factory.
