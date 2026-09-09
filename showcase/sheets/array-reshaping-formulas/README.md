# Array Reshaping Formulas

Three native sheets compare ten array functions. Only formula anchors are stored; Univer owns the spilled results. Edit the source cells or anchors, not the calculated spill children. Read calculated arrays with `getValues()`; raw stored cells are not a materialized copy of a spill. FILTER/SORT/UNIQUE/SEQUENCE and blocked spill recovery have their own dynamic-array example.

## Slice and reorder

Source A5:C8 has four distinct batches, including a zero quantity. E5 uses TAKE with B2 rows; I5 drops the first row. A12 chooses columns 3 then 1, E12 chooses the last then first row, and I12 takes the last row. Negative indices count from the end. E5 initially spills Proof/12/3 and Labels/0/8.

## Stack and pad

F5 horizontally joins A5:B7 (three rows) with D5:D6 (two rows). H7 is the resulting #N/A padding. A12 vertically joins these sources; B15:B16 are #N/A because the appended rows have one column. F12 uses explicit IFNA to replace missing padding with Unassigned; the raw comparison remains visible above it. Zero is retained in both outputs.

## Flatten and wrap

A5:C6 contains `11, blank, 0 / 21, #N/A, 31`. TOCOL at E5 keeps all six entries (the blank becomes zero in the output). G5 uses ignore=3 to exclude blanks and errors, yielding `11, 0, 21, 31`. I5 also scans by column and yields `11, 21, 0, 31`. A13 uses TOROW with ignore=3 to return the first list horizontally.

A17 wraps the cleaned vector into width 3: `11, 0, 21 / 31, #N/A, #N/A`. F17 wraps it into height 3 with explicit em-dash padding: `11, 31 / 0, — / 21, —`. The nested TOCOL is calculated natively; no JavaScript cleans or reshapes the data. Genuine zero remains present even when blanks are ignored.

## Public Facade recipes

Reload before each independent recipe. Allow recalculation to finish before reading spilled ranges with `getValues()`.

### Take rows from the end

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('slice')
sheet.getRange('B2').setValue(-2)
```

E5:G6 becomes Posters/25/2 and Signs/7/5. The source remains in its original order.

### Reorder a different set of columns

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('slice')
sheet.getRange('A12').setFormula('=CHOOSECOLS(A5:C8,2,1)')
```

A12:B15 becomes `12,Proof / 0,Labels / 25,Posters / 7,Signs`.

### Extend the shorter input

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('stack')
sheet.getRange('D7').setValue('P-43')
sheet.getRange('F5').setFormula('=HSTACK(A5:B7,D5:D7)')
```

H7 becomes P-43. The separate F12 formula still uses D5:D6 and keeps Unassigned at H14, proving that input ranges are explicit.

### Turn a missing cell into a real zero

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('flatten')
sheet.getRange('B5').setValue(0)
```

G5:G9 becomes `11,0,0,21,31`; A13:E13 matches horizontally. A17:C18 becomes `11,0,0 / 21,31,#N/A`. The extra zero is not filtered out as a blank.

### Choose a custom row-padding value

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('flatten')
sheet.getRange('A17').setFormula('=WRAPROWS(TOCOL(A5:C6,3),3,"No item")')
```

B18:C18 become No item. The source #N/A and the raw TOCOL comparison remain unchanged.
