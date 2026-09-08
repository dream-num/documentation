# Table styles and headers

Three native worksheet tabs compare six real table objects. Each pair has identical values: style, not data, is the variable.

- **Row bands:** alternating blue-white rows beside a uniform cream body.
- **Columns and edges:** alternating orange-white columns beside bold first and last columns.
- **Built-in themes:** table-default-0 beside table-default-5. The installed preset provides table-default-0 through table-default-5.

All tables cover A4:D10 or F4:I10. Open the menu beside a table name, choose **Set Table Theme**, then pick a native swatch. The third default swatch applies the green table-default-2 theme without changing values. Edit C5 from 18 to 25 on Row bands; the style remains attached to the table while the value changes.

## Public Facade recipes

Run after initialization. These are the same native theme APIs used by the demo factory.

```ts
const sheet = univerAPI.getActiveWorkbook().getSheetBySheetId('rows')
const table = sheet.getTableByCell(4, 0)
console.log(table.id, table.showHeader) // rows-0, true

await sheet.addTableTheme('rows-0', {
  name: 'studio-recipe-bands',
  headerRowStyle: { bg: { rgb: '#183B4E' }, cl: { rgb: '#FFFFFF' }, bl: 1 },
  firstRowStyle: { bg: { rgb: '#FFFFFF' } },
  secondRowStyle: { bg: { rgb: '#FAE5D2' } },
})
// Orange-white body bands replace blue-white bands; A4:D10 values are unchanged.
```

```ts
const columns = univerAPI.getActiveWorkbook().getSheetBySheetId('columns')
await columns.addTableTheme('columns-1', {
  name: 'studio-recipe-edges',
  headerRowStyle: { bg: { rgb: '#183B4E' }, cl: { rgb: '#FFFFFF' } },
  wholeStyle: { bg: { rgb: '#FFFFFF' } },
  headerColumnStyle: { bl: 1, bg: { rgb: '#DDEBD8' } },
  lastColumnStyle: { bl: 1, bg: { rgb: '#FAE5D2' } },
})
// F5:F10 becomes green and bold; I5:I10 stays orange and bold.
```

The theme names firstRowStyle/secondRowStyle describe alternating row slots. firstColumnStyle/secondColumnStyle describe alternating column slots; use headerColumnStyle for the actual first column and lastColumnStyle for the final column. Header-row styling takes precedence at header intersections.

## Scope

Headers remain visible with native filter controls. The installed ITableOptions marks showHeader, showFooter and hasTotalRow as not supported yet; this example does not advertise header hiding or total rows. Bands and edge emphasis are native range-theme properties, not claims of separate Excel-style ribbon checkboxes. No HTML or CSS table substitutes are used.
