# Selection and used range

Three native worksheets separate selection from stored-cell boundaries. Selection starts at C5:E7. Drag another range or use the native name box to select an address; the selection does not change the data boundary.

The installed public API is `getDataRange()`, not `getUsedRange()`. It bounds stored cell records, including formatting-only records and blank cells inside the rectangle. It is not a search for non-empty displayed values.

## Read the current selection

Run these recipes after the workbook has loaded. Re-read the selection after native interaction; the returned selection is a snapshot.

```ts
const sheet = univerAPI.getActiveWorkbook().getActiveSheet()
const selection = sheet.getSelection()
console.log(selection?.getActiveRange()?.getA1Notation())
console.log(selection?.getActiveRangeList().map(range => range.getA1Notation()))
```

Hold Ctrl and click E7 after selecting B5:C6 to create two native selections. The range-list API reports B5:C6 and E7 independently.

## Select a different rectangle

```ts
const sheet = univerAPI.getActiveWorkbook().getSheetByName('Selection')
sheet.getRange('B5:C6').activate()
console.log(sheet.getSelection()?.getActiveRange()?.getA1Notation())
```

Expected selection: B5:C6. Prices and quantities are unchanged.

## Compare stored boundaries

```ts
const workbook = univerAPI.getActiveWorkbook()
console.log(workbook.getSheetByName('Selection').getDataRange().getA1Notation())
console.log(workbook.getSheetByName('Styled boundary').getDataRange().getA1Notation())
console.log(workbook.getSheetByName('Empty').getDataRange().getA1Notation())
```

Initial ranges are B4:E8, B4:H12 and A1. H12 has only an amber background: no value or formula. The empty sheet returns the fallback rectangle A1; this does not mean A1 contains data. No title cells are added outside these specimens.

## Read calculated values, display text and formulas

```ts
const range = univerAPI.getActiveWorkbook().getSheetByName('Selection').getRange('E5:E8')
console.log(range.getValues())
console.log(range.getRawValues())
console.log(range.getDisplayValues())
console.log(range.getFormulas())
```

After calculation, raw values are 50, 24, 48 and 0. In this formatted range, both getValues() and getDisplayValues() return two-decimal strings such as "50.00"; use getRawValues() for numeric calculations. Formulas remain =C5*D5 through =C8*D8. Zero is not an empty cell. Change D5 from 4 to 6 in the native grid: E5 recalculates to 75 while its formula stays =C5*D5.
