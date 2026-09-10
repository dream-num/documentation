# Custom native menus

Four original Harbor orders are enough to exercise the feature. There is no host
selection, Reset, readback or layout panel. Select cells in the native grid or name
box. Start contains Review highlight, Approved and Needs changes. The native cell
context menu also contains Review highlight and an Approval submenu. Both entry
points invoke the same callbacks. Approval writes column E for all selected rows;
an already-matching value is not rewritten. Highlight toggles pale yellow/white.

The callbacks reject other owners/sheets, disjoint or outside selections and a
read-only workbook before writing. Errors use the official native message UI,
not a permanent explanation card. This is local sample editing, not authorization
or a server approval workflow. Native UI, custom menu labels and sample values
stay English on both host languages. Preview and export use one factory,
the complete English core pack and official core CSS. The legacy third locale
argument is ignored, preserving saved-snapshot and ribbon argument positions.

## Select an order with the public Facade

Each TypeScript block runs independently with the demo's `univerAPI`.

```ts
univerAPI.getWorkbook('harbor-orders').getSheetBySheetId('orders').getRange('A4:E4').activate()
```

## Register another real native menu and context submenu

Run once per owner, then click Highlight example in Start or the right-click
Review example submenu. The callback changes the selected native range; it does
not set a host-only state or return a fake command success.
Import `MessageType` from `@univerjs/preset-sheets-core` in the entry module first.

```ts
const item = univerAPI.createMenu({
  id: 'harbor.readme-highlight',
  title: 'Highlight example',
  action: () => {
    const workbook = univerAPI.getActiveWorkbook()
    const sheet = workbook?.getActiveSheet()
    const ranges = sheet?.getSelection()?.getActiveRangeList() ?? []
    const range = ranges[0]
    if (workbook?.getId() !== 'harbor-orders' || sheet?.getSheetId() !== 'orders' ||
      !workbook.getWorkbookPermission().canEdit() || ranges.length !== 1 || !range ||
      range.getRow() < 3 || range.getLastRow() > 6 || range.getLastColumn() > 4) {
      univerAPI.showMessage({ type: MessageType.Error, content: 'Select editable order cells inside A4:E7.', duration: 3500 })
      return
    }
    const color = range.getBackgrounds().flat().every(value => value.toUpperCase() === '#FFF3BF')
      ? '#FFFFFF' : '#FFF3BF'
    range.setBackground(color)
  },
})
item.appendTo('ribbon.start.others')
univerAPI.createSubmenu({ id: 'harbor.readme-review', title: 'Review example' })
  .addSubmenu(item)
  .appendTo(['contextMenu.mainArea', 'contextMenu.others'])
```

## Multiple rows and an idempotent approval write

This is the same column-E operation used by the native approval callbacks.

```ts
const sheet = univerAPI.getWorkbook('harbor-orders').getSheetBySheetId('orders')
sheet.getRange('A5:E6').activate()
const range = sheet.getRange('E5:E6')
if (!range.getRawValues().flat().every(value => value === 'Approved')) range.setValue('Approved')
```

## Read-only boundary

```ts
univerAPI.getWorkbook('harbor-orders').setEditable(false)
```

Try a custom menu action: the callback must reject it without a model change.
This guard does not claim the native menu item is visually disabled.

```ts
univerAPI.getWorkbook('harbor-orders').setEditable(true)
```

## Save the full native workbook

```ts
const snapshot = univerAPI.getWorkbook('harbor-orders').save()
console.log(snapshot)
```

## Restore the same owner ID and selection

In the exported entry module, import `validateSnapshot` alongside `createDemo`.
Use its `container` and mutable `demo` bindings. Validation precedes disposal;
pass the complete snapshot unchanged, including resources and styles.

```js
const api = demo.univerAPI
const saved = structuredClone(api.getWorkbook('harbor-orders').save())
validateSnapshot(saved)
const selection = api.getWorkbook('harbor-orders').getSheetBySheetId('orders').getActiveRange()?.getA1Notation() ?? 'A4:E4'
const locale = api.getCurrentLocale()
const darkMode = api.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved, 'grid', selection)
```

## Single-row ribbon variant

beta.2 has no runtime `setRibbonType` Facade. Use the real preset configuration
when creating a new owner. Its native overflow menu exposes items that do not fit.
This operation clears Undo history; theme changes do not recreate the owner.

```js
const api = demo.univerAPI
const saved = structuredClone(api.getWorkbook('harbor-orders').save())
validateSnapshot(saved)
const selection = api.getWorkbook('harbor-orders').getSheetBySheetId('orders').getActiveRange()?.getA1Notation() ?? 'A4:E4'
const locale = api.getCurrentLocale()
const darkMode = api.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved, 'classic', selection)
```

## Installed SDK boundaries and verification

`@univerjs/ui/lib/types/facade/f-menu-builder.d.ts` exposes no disabled observable
or per-item disposal on `IFacadeMenuItem`/`FMenu`. Its installed `lib/es/facade.js`
creates the native menu factory without forwarding disabled state. Do not invent
those Facade options. Owner disposal removes this example's UI and callbacks.
The known beta.2 ribbon-submenu callback dispatch issue is not presented as fixed:
this case uses direct ribbon items and a genuine context submenu.

Complete save/rebuild comparison remains strict. The previously observed empty
defined-name resource serialization change must not be normalized away.

The current native run confirms real menu clicks, keyboard Enter, right-click
multi-row approval, yellow canvas pixels, repeated approval without writes,
outside/empty/read-only rejection, all six TypeScript and two lifecycle recipes,
both layouts and same-owner themes. Earlier bilingual runs are historical;
rerun the native suite for English-only acceptance. These do not imply full acceptance:

- Full Undo leaves inferred cell `t` values; highlight Undo additionally retains
  generated fill styles. Native text Undo also retains a font-color style.
- Grid and classic owner reconstruction change `SHEET_DEFINED_NAME_PLUGIN`
  resource data from an empty string to `'{}'`. The snapshots are compared without
  removing resources, cell types, generated style keys or any other fields.
- The custom native menu remains enabled for invalid selections. The guarded
  callback rejects those actions, but it is not a working disabled affordance.

All measured Redo snapshots match exactly. The same raw Undo boundary is retained
for fresh editing after restore and in the normal production export. The default
menu remains direct ribbon items; native ribbon-submenu support stays open.

The test builds only this case and links individual exact installed packages.
`SHOWCASE_EXPORT_DIRECTORY` can reuse its selected export. It does not install
dependencies or require another demo's report. Port 4416 closes when it finishes.
