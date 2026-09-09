# Database Criteria Formulas

A4:E12 is a small order database, including headers. Six native database functions read the same Amount field. This differs from SUMIFS: the conditions live in a separate header-and-criteria range, and the field can be selected by name or one-based column index.

G4:H5 requires Region North AND Status Ready. G8:H10 requires (North AND Ready) OR (South AND Pending). Criteria on one row combine with AND; different criteria rows combine with OR. Each criteria header matches a database header exactly.

| Function | AND result H13:H18 | OR result I13:I18 |
| --- | --- | --- |
| DSUM | 120 | 210 |
| DAVERAGE | 60 | 70 |
| DCOUNT | 2 | 3 |
| DCOUNTA | 3 | 4 |
| DMAX | 120 | 120 |
| DMIN | 0 | 0 |

The matching North/Ready Amount values are 120, 0, a genuine empty cell and text pending. DCOUNT counts the two numbers, including zero. DCOUNTA additionally counts the text, but not the empty cell. Sum, average and extrema ignore that text and blank. H21 repeats DSUM with field index 4 instead of the name Amount, initially also 120.

## Public Facade recipes

Reload before each block. Recalculation is asynchronous; inspect the native result after it updates.

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('orders')
sheet.getRange('G5').setValue('South')
// H13:H18 = 30, 15, 2, 2, 30, 0. H21 = 30.
// The independent OR criteria and results remain unchanged.
```

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('orders')
sheet.getRange('H10').setValue('Ready')
// OR now includes North/Ready or South/Ready.
// I13:I18 = 150, 37.5, 4, 5, 120, 0.
```

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('orders')
sheet.getRange('D10').setValue(40)
// Replaces the genuinely empty Amount, not the pending text.
// H13:H18 = 160, 53.333333..., 3, 4, 120, 0.
```

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('orders')
sheet.getRange('H21').setFormula('=DSUM(A4:E12,"Units",G4:H5)')
// Selecting another field yields 8 units; Amount results remain unchanged.
```

Edit the amber criteria directly in the grid to explore other matches. A blank criteria row is not a harmless separator: it can broaden matching, so both ranges are deliberately bounded. Text cells have explicit string types. All aggregates are SDK formulas; no JavaScript precomputation, server database, custom UI or SDK modifications are used. Preview and exported code share one factory with complete English Core locale, official CSS and Grid Ribbon.
