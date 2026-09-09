# Conditional summary formulas

Eight editable stationery orders drive nine real formulas. Select green results I5:I13 to inspect formulas in the native formula bar; peach H5:H13 cells hold criteria. The preview and standalone export use the same factory, complete English Core preset and official CSS. There are no custom controls or precomputed result cells.

## Comparisons

- SUMIF totals a region; SUMIFS combines region and Shipped status with AND.
- COUNTIFS concatenates `">="` with the numeric threshold in H7.
- AVERAGEIF averages matching amounts rather than all orders.
- COUNTIF contrasts `?` (one character), `*` (any suffix here) and `~*` (a literal asterisk).
- A no-match SUMIF returns zero. A no-match AVERAGEIF raises an error, handled explicitly with IFERROR. That fallback also catches other errors; it is not a general diagnosis of missing data.

Initial I5:I13 results are `271, 191, 4, 67.75, 3, 3, 1, 0, "No matches"`. Amounts are sample numbers, not currency conversion or financial guidance. Criteria matching does not hide source rows.

## Public Facade recipes

Change the single-region sum to South (104). Entering South directly into H5 has the same effect:

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('orders')
sheet.getRange('H5').setValue('South')
```

Change the combined-criteria region to South (40) and the amount threshold to 80 (2):

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('orders')
sheet.getRange('H6').setValue('South')
sheet.getRange('H7').setValue(80)
```

Use a literal asterisk criterion in the one-character comparison row (1):

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('orders')
sheet.getRange('H9').setValue('Plan~*')
```

Calculation settles asynchronously after edits. Inspect a result afterwards with `sheet.getRange('I5').getRawValue()`. The displayed method labels describe the initial specimens; they do not automatically change when a user edits a formula or criterion. Reload to restore the original data. Table structured references, filtering, cross-file formulas and custom functions have separate demos.
