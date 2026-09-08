# Formula reference modes

Three small English sheets compare relative rows, a fixed absolute price and a mixed-reference matrix. Green, amber and lavender cells contain real formulas, not precomputed totals. Select a result to inspect its formula in the native formula bar; edit a source value to see native recalculation. The Preview and independent export share one factory with the complete English Core preset and official CSS. There are no host buttons.

## Literal Facade recipes

Run each block in its own console scope. Relative references move during native copy-fill. This adds one unit to every order, not just the first row:

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('relative')
sheet.getRange('D5').setFormula('=(B5+1)*C5')
if (!await sheet.getRange('D5').autoFill(sheet.getRange('D5:D8'), 'COPY')) throw new Error('Fill rejected')
console.log(sheet.getRange('D5:D8').getFormulas())
```

Every absolute-reference formula keeps `$E$5` when the price changes. Column C displays that shared price using `=$E$5`; column D multiplies each row's quantity by the same fixed anchor:

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('absolute')
sheet.getRange('E5').setValue(4)
console.log(sheet.getRange('D5:D8').getFormulas())
```

Fill a mixed-reference formula across, then down. The row/column locks remain meaningful in both directions:

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('mixed')
sheet.getRange('B5').setFormula('=$A5*B$4+5')
if (!await sheet.getRange('B5').autoFill(sheet.getRange('B5:E5'), 'COPY')) throw new Error('Across fill rejected')
if (!await sheet.getRange('B5:E5').autoFill(sheet.getRange('B5:E8'), 'COPY')) throw new Error('Down fill rejected')
console.log(sheet.getRange('B5:E8').getFormulas())
```

Change the four header prices. Each matrix column still uses its own row-4 value:

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('mixed')
sheet.getRange('B4:E4').setValues([[12, 18, 24, 30]])
```

## Scope

The workbook initially contains explicit formulas so all comparisons are visible immediately. The recipes exercise actual SDK reference translation via `FRange.autoFill`, not host string rewriting. Initial formula generation is data authoring only. Recalculation may settle asynchronously after a Facade write.

Named/structured references, cross-file links, dynamic arrays, F4 reference cycling, relative sheet-qualified references, error propagation and file conversion are separate capabilities. No custom formula engine, SDK modifications or history system is included. Native interaction and Preview lifecycle acceptance must be reported separately from recipe execution.
