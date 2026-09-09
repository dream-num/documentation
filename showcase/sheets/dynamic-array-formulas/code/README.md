# Dynamic array formulas

Three native worksheets demonstrate one formula returning many cells. All values
are computed by Univer; there is no host array-to-cell copy or custom spill logic.
The source is nine original fictional delivery routes, including a zero load.

## Run

Install the generated dependencies with `npm install`, then use `npm run dev`.
The preview and download share one factory, complete English Core preset locale,
official Sheets Core CSS and Grid ribbon. There are no extra host controls.

## Range spill

Only D1 contains `=A1:B10`. The range includes two headers and nine data rows;
D1:E10 is its live output. Edit B3 with the native editor and compare E3. Select
D1 to edit the anchor, not a copied formula in every destination cell.

```ts
const sheet = window.univerAPI.getWorkbook('dynamic-array-formulas').getSheetBySheetId('range-spill')
sheet.getRange('D1').setValue('=A1:B10')
sheet.getRange('B3').setValue(17)
await window.univerAPI.getFormula().onCalculationResultApplied(10000)
console.log(sheet.getRange('D1:E10').getValues())
```

## Filter, sort, unique and sequence

Use `getValues()` / `getValue()` to read the calculated spill. `getRawValues()`
reads stored cells instead: only the anchor stores the array formula, while the
other output cells are supplied by the calculation engine. A saved workbook is
not a host-materialized copy of the spilled values.

On Filter and sort, F2 selects North, West or South. FILTER at E5 returns the
matching rows; Missing uses a readable no-match fallback. SORT at I5 orders all
routes by loads, descending. UNIQUE at E18 removes repeated region names.
SEQUENCE at I18 creates a 3 × 3 matrix starting at 10, in steps of 5.
Change the native input or source values: no separate Recalculate button is needed.

```ts
const sheet = window.univerAPI.getWorkbook('dynamic-array-formulas').getSheetBySheetId('functions')
sheet.getRange('F2').setValue('South')
await window.univerAPI.getFormula().onCalculationResultApplied(10000)
console.log(sheet.getRange('E5:G13').getValues())
```

## Blocked output and spill references

Spill boundaries compares the same SEQUENCE formula in a clear destination at
A4 and an occupied destination at E4. F5 deliberately contains Occupied. Clear
F5 with native Delete to give the formula room. This is a real engine error and
recovery, not a simulated error label. The occupying value must not be overwritten.
A13 uses `=SUM(A4:B7)` to sum the explicit output area. Shrinking the sequence
clears its former tail and changes that total from 36 to 10.

```ts
const sheet = window.univerAPI.getWorkbook('dynamic-array-formulas').getSheetBySheetId('boundaries')
sheet.getRange('F5').clearContent()
sheet.getRange('A4').setValue('=SEQUENCE(2,2)')
await window.univerAPI.getFormula().onCalculationResultApplied(10000)
console.log(sheet.getRange('A13').getRawValue())
```

## Scope and references

The gallery follows the one-formula/many-results and blocked-output contrasts in
[SpreadJS dynamic arrays](https://developer.mescius.com/spreadjs/demos/features/calculation/dynamic-array/introduction/react),
using original data and Univer APIs, not competitor code or assets.
[Univer formula guide](https://docs.univer.ai/guides/sheets/features/core/formula)
describes the installed Core formula path.

This is a local formula feature, not cross-file linking, custom async functions,
Office import/export or collaboration history. Native edit/Undo, spill behavior,
saved-state reconstruction and rendering require independent acceptance. A saved
formula or a successful build alone does not prove spill output correctness.

The installed beta.2 parser recognizes the postfix spill operator `#` but does not
implement its evaluation: `=SUM(A4#)` returns `#VALUE!`. The working example uses an
explicit range instead. This is a disclosed compatibility limit, not a claim of
complete Excel formula parity. No SDK patch or custom replacement is supplied.

Native regression verifies the twenty-cell spill, source edits, FILTER result
growth/shrinkage and tail cleanup, SORT, UNIQUE, SEQUENCE, obstacle removal and
all three recipes above. Saved-unit reconstruction and same-owner theme changes
preserve the model. Undo restores the source and calculated values, but the
installed SDK adds an inferred numeric type to the stored source cell; exact
snapshot equality therefore fails. The actual Preview also passes StrictMode
mount/unmount/remount and both theme-provider and StorageEvent transitions with
the complete edited model and the same owner retained. Toolbar presence and
settled rendering are checked, not every toolbar command. Next page routing,
accessibility and cross-browser behavior remain unverified.
