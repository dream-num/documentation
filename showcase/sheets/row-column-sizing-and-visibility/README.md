# Row and Column Sizing and Visibility

Row 6 is 64 pixels tall; column B is intentionally narrow. Resize their native header boundaries to compare the layout. Row 7 and column D start hidden. Select the surrounding headers and use the native context menu to reveal them.

C12 initially totals 46 units, including the 13 units in hidden row 7. Hiding data does not remove it from SUM, delete it, or protect it from access. This is distinct from worksheet-tab visibility and from filtering.

## Facade example

Indices are zero-based. These methods change the actual worksheet used by the preview:

```ts
const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
sheet.setRowHeightsForced(5, 1, 40)
sheet.setColumnWidth(1, 320)
sheet.showRows(6)
sheet.showColumns(3)
```

Restore the visibility comparison without losing data:

```ts
const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
sheet.hideRows(6)
sheet.hideColumns(3)
```

The native Grid ribbon, full English locale and official preset CSS are shared by the preview and exported example. No extra host controls are added.
