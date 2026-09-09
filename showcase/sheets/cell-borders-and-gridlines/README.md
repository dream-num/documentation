# Cell Borders and Gridlines

Two native sheets intentionally repeat the same specimens: only worksheet gridline visibility changes. Cell borders remain when gridlines are hidden.

- B5:D8: amber medium outside border; no authored internal borders.
- F5:H8: slate thin borders around every cell.
- B13:D16: teal dashed horizontal separators, without an outside outline.
- F13:H16: violet double outline with a separate double rule above the total. G16 and H16 calculate 24 and 100.

Select a range and use the native Start ribbon border control to alter its borders. Switch the Gridlines on/off tabs to compare worksheet guides without changing border formatting.

## Public Facade recipes

Apply all-cell borders to the first specimen:

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('guides')
sheet.getRange('B5:D8').setBorder(
  window.univerAPI.Enum.BorderType.ALL,
  window.univerAPI.Enum.BorderStyleTypes.DOTTED,
  '#BE123C',
)
```

Hide only the worksheet guides, retaining the authored borders:

```ts
const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('guides')
sheet.setHiddenGridlines(true)
```

The comparison is native cell formatting, not CSS or canvas overlays. Preview and export share the same factory, official preset CSS and complete English locale. The ribbon uses Grid layout. This case does not claim print-gridline or export-format parity.
