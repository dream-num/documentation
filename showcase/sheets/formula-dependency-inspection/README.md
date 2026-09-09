# Formula Dependency Inspection

The native workbook supplies real formulas for public dependency queries. It does not draw trace arrows or provide a custom graph panel. Run the asynchronous recipes below in the browser console; their results come from the installed SDK, not a graph reconstructed by the demo.

## Calculation model

On **Cost model**, B5 feeds both D5 (`=B5*C5`) and G5 (`=B5*2`). D5:D7 initially contain 24, 35 and 18; D10 totals 77 and D12 adds handling to produce 82. G10 independently totals 13 spare clips.

On **Summary**, B5 references `'Cost model'!D12`. B7 computes tax 8.2 and B8 totals 90.2. E5 independently totals 14 cartons. These unrelated formulas make it possible to distinguish a dependency query from simply listing every formula in a workbook.

Raw decimal results can include ordinary floating-point error (for example, `8.200000000000001`); compare calculated numbers with a small tolerance rather than exact decimal equality.

## Public query recipes

Wait until the workbook is ready and its calculations have settled. Run these queries sequentially and await each response. Coordinates are zero-based; `sheetId` uses stable sheet IDs rather than display names. The timeout argument is milliseconds. Querying relationships does not change source cells or formula definitions.

Returned nodes identify formulas with `unitId`, `subUnitId`, `row`, `column` and `formula`. `rangeList` records referenced workbook/sheet ranges. The cell-tree query exposes related node objects in `parents` and `children`; the range-query results use numeric tree IDs for those links. Treat IDs and returned ordering as engine metadata, not stable presentation labels.

### 1. Inspect one formula cell

```ts
const tree = await window.univerAPI.getFormula().getCellDependencyTree({
  unitId: 'dependency-inspection-workbook', sheetId: 'costs', row: 11, column: 3,
}, 10000)
console.log(tree)
```

This targets Cost model!D12, whose formula is `=D10+B12`. Its `rangeList` contains D10 and B12. The returned `children` include the referenced formula D10; `parents` include its consumer Summary!B5. These immediate links are not a recursively expanded graph of the entire calculation chain. Literal source cells need not appear as formula nodes.

### 2. Find formulas consuming a shared input

```ts
const dependents = await window.univerAPI.getFormula().getRangeDependents([{
  unitId: 'dependency-inspection-workbook', sheetId: 'costs',
  range: { startRow: 4, endRow: 4, startColumn: 1, endColumn: 1 },
}], 10000)
console.log(dependents)
```

The query input is Cost model!B5. The result contains its direct consumers D5 and G5, excluding independent G10 and Summary!E5. The calculation chain continues through D10/D12 to Summary, but those downstream cells are not additional top-level results of this query. Linked tree IDs are not a recursively expanded list of reachable cells.

### 3. Compare formulas physically inside that input

```ts
const formulas = await window.univerAPI.getFormula().getInRangeFormulas([{
  unitId: 'dependency-inspection-workbook', sheetId: 'costs',
  range: { startRow: 4, endRow: 4, startColumn: 1, endColumn: 1 },
}], 10000)
console.log(formulas)
```

This returns no formula nodes: B5 stores a numeric input, even though other formulas depend on it. `getInRangeFormulas` selects by formula location, not by referenced input.

### 4. Inspect the summary's formula locations

```ts
const formulas = await window.univerAPI.getFormula().getInRangeFormulas([{
  unitId: 'dependency-inspection-workbook', sheetId: 'summary',
  range: { startRow: 4, endRow: 7, startColumn: 1, endColumn: 1 },
}], 10000)
console.log(formulas)
```

The range B5:B8 contains formulas at B5, B7 and B8, while B6 is a numeric rate. B5's reference crosses to the Cost model sheet. The independent stock formula E5 is outside this query region.

### 5. Change the shared source, not the formulas

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('costs')
sheet.getRange('B5').setValue(4)
```

After recalculation, D5 becomes 48, G5 becomes 8, D10 becomes 101 and D12 becomes 106. Summary B5/B7/B8 become 106/10.6/116.6; independent clip and carton totals stay 13/14. Repeat the read-only queries to compare the same formula relationships after the value change. This example uses ordinary same-workbook references, not cross-file links, volatile addresses or circular calculations.
