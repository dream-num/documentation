# Rounding and Remainder Formulas

Two editable worksheets compare nine native functions. Amber cells are inputs; formula results are calculated by the SDK, not JavaScript.

## Precision and display

D5:D10 reference the input directly with a two-decimal display format. E:G use ROUND, ROUNDUP and ROUNDDOWN. H subtracts the stored rounded result from the unrounded value, showing why formatting is not calculation.

| Input | Digits | ROUND | ROUNDUP | ROUNDDOWN |
| --- | --- | --- | --- | --- |
| 12.345 | 2 | 12.35 | 12.35 | 12.34 |
| -12.345 | 2 | -12.35 | -12.35 | -12.34 |
| 2.5 | 0 | 3 | 3 | 2 |
| -2.5 | 0 | -3 | -3 | -2 |
| 146 | -1 | 150 | 150 | 140 |
| -146 | -1 | -150 | -150 | -140 |

ROUNDUP means away from zero, not toward positive infinity. Negative digits round to tens here.

## Multiples and signs

Columns C:H calculate INT, TRUNC, MOD, QUOTIENT, CEILING.MATH and FLOOR.MATH respectively.

| Number / divisor | INT | TRUNC | MOD | QUOTIENT | CEILING.MATH | FLOOR.MATH |
| --- | --- | --- | --- | --- | --- | --- |
| 17.8 / 5 | 17 | 17 | 2.8 | 3 | 20 | 15 |
| -17.8 / 5 | -18 | -17 | 2.2 | -3 | -15 | -20 |
| 17.8 / -5 | 17 | 17 | -2.2 | -3 | 20 | 15 |
| -17.8 / -5 | -18 | -17 | -2.8 | 3 | -15 | -20 |
| 7.25 / 0.5 | 7 | 7 | 0.25 | 14 | 7.5 | 7 |
| -7.25 / 0.5 | -8 | -7 | 0.25 | -14 | -7 | -7.5 |

G13:H13 apply mode 1 to row 6: -20 and -15. CEILING.MATH/FLOOR.MATH treat significance by magnitude; MOD instead takes the divisor sign. QUOTIENT truncates toward zero, so it does not always equal INT(number/divisor).

## Public Facade recipes

Run each recipe independently on the initial workbook. Native name-box navigation and cell editing make the same input changes. Wait for asynchronous recalculation before reading results.

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('precision')
sheet.getRange('B5').setValue(12.344)
// D5 displays 12.34 but its raw value remains 12.344.
// E5 = 12.34, F5 = 12.35, G5 = 12.34, H5 displays 0.004.
```

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('multiples')
sheet.getRange('A6').setValue(-12.2)
// C6:H6 = -13, -12, 2.8, -2, -10, -15.
// G13:H13 (mode 1) = -15, -10.
```

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('multiples')
sheet.getRange('G13').setFormula('=CEILING.MATH(A6,B6,0)')
// Initial A6 = -17.8: G13 changes from -20 to -15.
```

Use the formula bar to inspect syntax. getValue() may return formatted text; getCellDatas() exposes the stored numeric value. Floating-point subtraction can have tiny representation differences, so the remainder and difference columns use explicit display formats. This is not a decimal financial arithmetic guarantee.
