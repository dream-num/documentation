# Native row and column headers

Two small worksheets compare a styled Bookings override with native Returns
headers. Header labels follow row/column positions, not equipment IDs. Cells are
ordinary editable data, not fake headers. Use native sheet tabs to compare scope.

The four host buttons expose header Facade settings not present in the native
ribbon: apply labels/style at sheet or workbook scope, clear the active override,
clear all defaults/overrides, and toggle dimensions. There is no Reset or raw
model inspector. Official CSS and the complete English core pack are exported.
Native UI and host controls stay English on either host language. The ignored
third locale argument preserves saved-snapshot positions. Themes keep the same
owner and edits. Earlier bilingual test reports are historical; rerun the native
suite before claiming current interaction acceptance.

## Workbook labels and worksheet precedence

```ts
const book = univerAPI.getWorkbook('lumen-equipment')
book.customizeColumnHeader({ columnsCfg: { 0: 'Equipment', 1: 'Asset tag' } })
book.customizeRowHeader({ rowsCfg: { 0: 'First slot' } })
const bookings = book.getSheetBySheetId('bookings')
bookings.customizeColumnHeader({})
bookings.customizeRowHeader({})
```

Bookings now inherits the workbook default. Other unconfigured headers retain
native labels. This changes rendering configuration, not cell contents.

## Compact native geometry

```ts
const sheet = univerAPI.getWorkbook('lumen-equipment').getSheetBySheetId('bookings')
sheet.setRowHeaderWidth(46)
sheet.setColumnHeaderHeight(24)
```

Use 88 and 36 for the original dimensions; compact mode can clip long labels.
Dimensions are native worksheet model properties. Label/style setters have no
corresponding Facade getter and are not workbook snapshot fields or Undo history.
Do not claim saved cells reconstruct header rendering configuration: reapply the
desired setters explicitly after restoration.

## Save cells and dimensions, not header rendering settings

```ts
window.headerSaved = structuredClone(univerAPI.getWorkbook('lumen-equipment').save())
```

In the host entry, `demo` is the controller returned by `createDemo(container)`.
The next recipe validates the complete model before replacing its same-ID unit.
It explicitly clears rendering defaults and overrides; it does not infer them
from cells or manufacture snapshot fields. The SDK owner remains active.

```ts
demo.restore(window.headerSaved)
```

Rerun the first label recipe or use Apply headers to reapply rendering settings.
For complete owner reconstruction, dispose the previous controller and pass the
same saved model as `createDemo(container, darkMode, locale, saved)`; initial saved
construction also begins with native headers. `demo.ready` rejects when startup
fails or is disposed while pending. No recovery is an atomic transaction after a
valid model has begun loading.

## Positional labels during row insertion

Apply styled headers, then insert a native blank first row. Slot 1 still labels
position one; the original first equipment record moves to position two. Use the
native Undo command to reverse the insertion, not a label-rewriting callback.

```ts
univerAPI.getWorkbook('lumen-equipment').getSheetBySheetId('bookings').insertRows(0, 1)
```

Two strict SDK differences remain: cell Undo can add `t: 1` and retain an allocated
style; full owner reconstruction changes the `SHEET_DEFINED_NAME_PLUGIN` resource
from an empty string to `'{}'`. The test retains the full before/after models and
exits nonzero. Same-owner unit restore, subsequent fresh-owner native edits, and
explicit header reapplication are separate checks, not substitutes for exact
snapshot acceptance. The sample does not normalize or manufacture those fields.
