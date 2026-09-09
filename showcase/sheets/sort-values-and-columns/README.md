# Sort values and columns

Eight original repair bookings compare single-key, multi-key and blank-estimate sorting. Native sheet tabs carry the same row identities so changes in order are easy to inspect. Each row's booking, bay, estimate, item and intake order must move together.

## Native controls

Select `A5:E12` using the native name box. Open **Data → Sort → Custom Sort** using the native sort icon dropdown. In Sort Reminder choose **Keep range sorting**, then Confirm. Row 4 is outside this selection, so leave **First row does not participate in sorting** unchecked. Choose Column C for numeric ascending/descending; on Multiple keys choose Column B ascending and add Column C descending. R02/R06 and R05/R07 are tied on both keys; compare their original intake order. Use native Undo and Redo to check that the complete rows return.

## Executable Facade recipes

Run after the demo is ready. Column indices are zero-based relative to the selected range, not worksheet column numbers. The Facade range sort does not automatically protect a header; exclude row 4 explicitly.

### 1. Numeric ascending

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('single')
sheet.getRange('A5:E12').sort({ column: 2, ascending: true })
console.log(sheet.getRange('A5:A12').getValues())
```

### 2. Numeric descending

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('single')
sheet.getRange('A5:E12').sort({ column: 2, ascending: false })
console.log(sheet.getRange('A5:A12').getValues())
```

### 3. Primary and secondary keys

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('multiple')
sheet.getRange('A5:E12').sort([{ column: 1, ascending: true }, { column: 2, ascending: false }])
console.log(sheet.getRange('A5:E12').getValues())
```

### 4. Explicit tie-breaker

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('multiple')
sheet.getRange('A5:E12').sort([{ column: 1, ascending: true }, { column: 2, ascending: false }, { column: 4, ascending: false }])
console.log(sheet.getRange('A5:E12').getValues())
```

### 5. Blank estimates

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('blank')
sheet.getRange('A5:E12').sort({ column: 2, ascending: false })
console.log(sheet.getRange('A5:E12').getValues())
```

## Semantics and limits

Numeric estimates have explicit numeric cell types. The installed comparator treats absent and empty-string values as blank, after nonblank values regardless of direction. Equal keys retain their current input order; an explicit third key changes that order intentionally. Repeating a sort is not a reset to original intake order.

This example uses English bay names. The installed string comparator lowercases text and removes hyphens/apostrophes; it is not a locale-aware collation guarantee. Mixed-type keys, merged cells, array formulas, filtered/hidden rows and left-to-right sorting are not acceptance claims here. No custom comparator or host-side row sorting is used.

Preview and standalone export share the same factory with complete English core/sort UI locale packs, official styles and native Grid. The Sort UI plugin supplies its declared Sort dependency. Theme changes keep the same workbook owner; no backend is required.

The [SpreadJS sorting gallery](https://developer.mescius.com/spreadjs/demos/features/worksheet/sort/purejs) is a capability reference, not a parity claim. This small, original fixture does not cover its additional comparator, custom-list, grouped/hidden-row or color-sort scenarios.
