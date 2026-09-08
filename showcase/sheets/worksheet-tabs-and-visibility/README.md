# Worksheet Tabs and Visibility

This is a worksheet-navigation example, not another cell-formatting gallery. Three visible tabs have different content and colors. A fourth sheet, Archive, starts hidden.

Select a tab, then use its native context menu to rename Supplies, change its color, and hide or restore a sheet. Worksheet ordering is also available through the public Facade recipe below. Hiding preserves content and is not access control. Keep at least one worksheet visible.

## Public Facade equivalents

Run these statements with the demo's `window.univerAPI`. No custom toolbar duplicates the tab menu.

```ts
const workbook = window.univerAPI.getActiveWorkbook()
const supplies = workbook.getSheetBySheetId('supplies')
supplies.setName('Materials')
supplies.setTabColor('#7C3AED')

const delivery = workbook.getSheetBySheetId('delivery')
workbook.moveSheet(delivery, 1)

const archive = workbook.getSheetBySheetId('archive')
archive.showSheet()
console.log(archive.isSheetHidden()) // false
archive.hideSheet()
console.log(archive.isSheetHidden()) // true
```

The worksheet IDs remain stable after renaming and moving. The data snapshot sets the initial tab colors, order and hidden state; the public Facade methods demonstrate changing them at runtime.

The shared factory imports the complete English preset locale and official SDK CSS, and uses Grid Ribbon. Preview and source export share the same workbook and lifecycle.
