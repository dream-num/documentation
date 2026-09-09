# Matrix Calculation Formulas

Five native functions compare rectangular multiplication, inversion and invalid dimensions. Edit numeric source cells to recalculate real spills. Only anchors contain formulas; use `getValues()` to read the calculated output instead of expecting each spill child to store its own formula.

## Production

A5:C6 is a 2 × 3 demand matrix: morning/evening by proof packs, labels and signs. A10:B12 lists paper/ink requirements for those three products. G5:H6 uses MMULT and initially yields `11,10 / 15,18`. G10:H12 transposes demand to `2,0 / 1,3 / 0,4`. Matrix multiplication is not elementwise multiplication: inner dimensions must match, and each output is a row/column dot product.

## Inverse and identity

A5:B6 is `2,1 / 1,3`; D5:D6 contains totals 7 and 11. The determinant at A10 is 5. G5:H6 returns the inverse `0.6,-0.2 / -0.2,0.4`. D10:D11 solves the system with native `MMULT(MINVERSE(A5:B6),D5:D6)`, yielding 2 and 3. G10:H11 checks A × inverse(A), producing the identity matrix. Floating-point comparisons should allow a small tolerance rather than assuming every operation yields exact binary decimals.

A15 initially spills MUNIT(3), a 3 × 3 identity matrix; B2 controls its dimension. Keep the destination clear when growing it.

The inverse-product check may show approximately -1.11E-16 at G11 instead of exact zero. The demo deliberately keeps this native floating-point residual visible; compare it with a tolerance such as 1E-9 rather than rounding the source or replacing the result.

## Matrix errors

A5:B6 is `1,2 / 2,4`, whose determinant E5 is 0. H5 exposes the singular inverse #NUM!, while A10 uses explicit IFERROR with Singular matrix. H10 applies MDETERM to a non-square 2 × 3 matrix and returns #VALUE!. A15 attempts (2 × 3) × (2 × 2) and returns #VALUE!. These errors are real formulas, not prewritten error labels.

## Public Facade recipes

Reload before each independent recipe. Allow recalculation to settle before reading outputs with `getValues()`.

### Change production demand

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('product')
sheet.getRange('C5').setValue(2)
```

G5:H6 becomes `17,10 / 15,18`; G12:H12 becomes `2,4`. Material requirements remain unchanged.

### Change the right-hand side

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inverse')
sheet.getRange('D5').setValue(9)
```

D10:D11 becomes 3.2 and 2.6. Coefficients, inverse and determinant remain unchanged.

### Shrink the identity matrix

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inverse')
sheet.getRange('B2').setValue(2)
```

A15:B16 is the 2 × 2 identity matrix. Former spill cells C15:C17 and A17:B17 become empty.

### Recover the singular matrix

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('errors')
sheet.getRange('B6').setValue(5)
```

E5 becomes 1. H5:I6 and A10:B11 become `5,-2 / -2,1`; IFERROR now passes through the valid native inverse. The separate dimension-error examples remain #VALUE!.

### Correct the incompatible multiplication

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('errors')
sheet.getRange('A15').setFormula("=MMULT('Production'!A5:C6,'Production'!A10:B12)")
```

A15:B16 becomes `11,10 / 15,18` without changing either source matrix. The singular inverse stays an independent error comparison.
