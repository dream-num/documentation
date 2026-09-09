# AGGREGATE and SUBTOTAL

All results are native formulas, not JavaScript summaries. Use the native Region filter checkbox and row-header Hide menu on **Visibility**. Reveal manually hidden rows using the small arrows at the hidden row boundary. Filters exclude rows from SUBTOTAL and AGGREGATE; manually hidden rows are excluded only by the relevant function number or option. Neither operation deletes or protects data. Results sit below the source rows so filtering or hiding the source does not hide the comparisons.

Initially F14:F20 all equal 92. SUBTOTAL 9 includes manually hidden rows; 109 excludes them. Both ignore filtered rows and nested SUBTOTAL/AGGREGATE formulas. SUM includes the original data regardless of visibility.

On **Error options**, B7 is `=NA()`, B11 is `=1/0`, B9 is truly empty, B10 is text and B8 is zero. B12 is the real nested subtotal 28. H15:H22 compare options 0–7:

| Options | Ignore hidden | Ignore errors | Ignore nested | Initial result |
| --- | --- | --- | --- | --- |
| 0 / 1 | No / Yes | No | Yes | #N/A |
| 2 / 3 | No / Yes | Yes | Yes | 28 |
| 4 / 5 | No / Yes | No | No | #N/A |
| 6 / 7 | No / Yes | Yes | No | 56 |

H24 uses `AGGREGATE(14,6,B5:B12,2)`: the second largest numeric value is 20. Option 6 includes the nested subtotal 28, ignores errors and retains manually hidden rows. Direct range references preserve visibility metadata; this example does not claim that calculated arrays retain that metadata.

## Public Facade recipes

Reload before each independent recipe and wait for the native filter to appear. After each change, allow formula recalculation to settle before reading results with `getRawValue()`.

### Filter to North

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('visibility')
sheet.getFilter().setColumnFilterCriteria(1, { colId: 1, filters: { filters: ['North'] } })
```

F14 remains 92; F15:F20 become 49. The South rows remain in the source.

### Hide a nonzero source row

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('visibility')
sheet.hideRows(4)
```

The zero-based row index 4 hides spreadsheet row 5 (12 units). F14:F20 become `92, 92, 80, 92, 80, 92, 80`. After additionally filtering North, they become `92, 49, 37, 49, 37, 49, 37`. Use `sheet.showRows(4)` to restore the manually hidden row.

### Hidden readings with errors

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('errors')
sheet.hideRows(4)
```

The 20-unit reading is hidden but not removed. Options 2/3 produce 28/8; options 6/7 produce 56/36 because the visible nested SUBTOTAL 9 still includes the hidden reading. Options without error suppression remain #N/A. H24 stays 20.

### Ranked aggregation and live source editing

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('errors')
sheet.getRange('B6').setValue(12)
sheet.getRange('H24').setFormula('=AGGREGATE(14,6,B5:B12,2)')
```

B12 becomes 32; options 2/3 become 32 and options 6/7 become 64. The ranked result remains 20: the native numeric candidates are 32, 20, 12 and 0.
