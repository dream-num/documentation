# Table themes and cell styles

Five original editable PDF pages compare a plain grid, green row bands, a strong
purple header, blue column emphasis and one amber cell override. These are real
structured tables with distinct local data, not screenshots or HTML overlays.

Use the native page rail to compare them. Select a table in Selection mode, then
open View > Properties to explore the built-in theme gallery and table-look
options. Double-click a cell in Editing mode to change its text. Static captions
describe the initial variants; changing a theme does not change those captions.

## Literal Facade recipes

Run each block against the live `window.univerAPI`. Use native page navigation to
see the corresponding table. All positions are PDF points. Table cell padding
and border widths, if used, belong to the core style model and use EMU.

```ts
console.log(univerAPI.getPdfTableThemePresets())
console.log(univerAPI.getActivePdf().getPages().map(page => page.getTables()[0].getTheme()))
```

```ts
const table = univerAPI.getActivePdf().getPageByIndex(0).getTables()[0]
table.setTheme({ styleId: 'univerGreenHeaderBandedRows', options: { firstRow: true, bandRow: true } })
console.log(table.getTheme())
```

```ts
const table = univerAPI.getActivePdf().getPageByIndex(1).getTables()[0]
table.setTheme({ ...table.getTheme(), options: { firstRow: true, bandRow: false } })
console.log(table.getTheme())
```

```ts
const cell = univerAPI.getActivePdf().getPageByIndex(4).getTables()[0].getCell(2, 1)
cell.setText('Ready')
cell.setStyle({ fill: { color: '#D8ECDD' }, fontColor: '#245C39', horizontalAlignment: univerAPI.Enum.HorizontalAlign.CENTER })
console.log(cell.getText(), cell.getStyle())
```

`getStyle()` returns the cell container style, including its fill. The font color
and horizontal alignment set above belong to the cell's owned text story, not
that container snapshot; the focused test checks both the story and rendered text.

## Boundaries

Preview and export share one factory, Grid ribbon, five complete English locale
packs and five official CSS bundles. UI and authored content stay English under
any host language. Theme changes update the existing owner. The initial fit uses
the installed exported `IPdfEditorRuntimeService`, separately from the Facade.
