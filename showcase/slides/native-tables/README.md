# Native slide tables

Four real slide-table objects on two slides, registered through UniverSlidesTablePlugin and UniverSlidesTableUIPlugin. Cells are native table resources, not a grid of shapes.

- **Headers and cells:** two 4 × 3 tables with identical values and 390 × 240 bounds. Compare dark/light headers and the highlighted Binding seat count.
- **Dimensions:** the same paper inventory in 350 × 180 and 430 × 280 tables. Cell text and styling stay the same.

Double-click a table cell to edit text; click outside the table to commit. Use native thumbnails to switch slides. Rows and columns are zero-based in the Facade API.

## Public Facade recipes

Update one native cell and its fill:

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(0)
const table = slide.getTableAt(1)
table.getCell(2, 2).setText('10')
table.getCell(2, 2).setBackgroundColor('#CFE7D5')
console.log(table.getCellText(2, 2)) // 10
```

Resize the compact inventory table's rows, columns and element bounds. Its cell text is retained:

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(1)
const table = slide.getTableAt(0)
for (let row = 0; row < table.getRowCount(); row++) table.setRowHeight(row, 55)
for (let column = 0; column < table.getColumnCount(); column++) table.setColumnWidth(column, 130)
table.setSize(390, 220)
```

Insert another real table (this intentionally adds an object):

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(1)
const table = slide.insertTable(slide.newTable()
  .setRows(2)
  .setColumns(2)
  .setValues([['Ink', 'Stock'], ['Indigo', '6']])
  .setColumnWidth(140)
  .setRowHeight(40)
  .setAbsolutePosition(35, 410)
  .setSize(280, 80)
  .build())
console.log(table.getRowCount(), table.getColumnCount()) // 2, 2
```

Register the table model plugin before UniverSlidesUIPlugin, then register UniverSlidesTableUIPlugin for native cell editing and table controls. Full English Slides and Table UI locales and official CSS are retained.

This case covers native cell text, fill and dimensions. It does not claim spreadsheet formulas, sorting/filtering, merged-cell behavior or PowerPoint export fidelity.
