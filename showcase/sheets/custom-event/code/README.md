# Aster / Cancelable custom events

Use the native column menu to delete C or F. The event guard cancels deletions
overlapping column positions C–E on either sheet; it is not a permission system.
The single host button explicitly removes/restores that guard. The compact list
retains the latest twelve delivered messages, not workbook JSON or collaborative
history. Before/after listeners remain active when the guard is removed.

Right-click A1 to suppress its native context menu, or B2 to allow it. This
custom adapter uses actual SDK pointer, command and rendering services as event
sources. Registration, firing, subscription and column deletion use the Facade;
the adapter is exported source, not a built-in SDK event name. Register it before
creating a workbook so it observes renderer creation.

## Guarded deletion

```ts
const sheet = window.univerAPI.getWorkbook('aster-lab').getActiveSheet()
try { sheet.deleteColumns(2, 1) } catch (error) { console.info(error) }
console.log(sheet.getMaxColumns())
```

With the guard active, the original eight columns and complete cell data remain.
The log must include Before and Blocked, not After. This is expected cancellation,
not a successful deletion. Removing the guard permits the same native operation.

## Allowed deletion

```ts
const sheet = window.univerAPI.getWorkbook('aster-lab').getActiveSheet()
if (sheet.getMaxColumns() <= 5) throw new RangeError('Column F no longer exists')
sheet.deleteColumns(5, 1)
```

On the original sheet this removes Field note, leaves seven columns, and delivers
Before then After. Use native Undo/Redo; no duplicate history buttons are rendered.
The rule follows column positions, not field IDs after structural edits.
The explicit range check matters: beta.2 does not reject an unchecked out-of-range
`deleteColumns(5, 1)` when only five columns remain; it incorrectly decreases the
column count. The native menu cannot select a nonexistent column. The independent
test retains this raw SDK failure alongside the guarded recipe's rejection.

## An independent event consumer

```ts
window.asterSubscription = window.univerAPI.addEvent('RemoveColumnEvent', params => {
  console.log(params.worksheet.getSheetName(), params.startColumn, params.endColumn)
})
```

```ts
window.asterSubscription.dispose()
```

Listeners run in registration order and share the same event object. After the
guard is removed and rebound, an earlier listener may initially see `cancel` as
unset; a later guard can still cancel the command. Do not treat that earlier
observation as the final command result. Before reads the pre-deletion model;
After reads the post-deletion model and is absent for a canceled deletion.

Theme changes retain the owner and edits. Official Core CSS and the complete English
pack are shared by the factory and standalone export. Native and custom-event UI
stay English on either host language; saved-snapshot argument positions are unchanged.
Earlier bilingual test results are historical, not current English-only acceptance.
Original small sample
tables are unchanged. `createDemo(container, darkMode, saved)` accepts a complete
Aster snapshot with the original workbook and both sheet IDs, validating it before
mounting and cloning it without normalization. Dispose the previous controller
first. A fresh owner re-subscribes the guard; guard state and the ephemeral event
log are not snapshot data. Same-owner `disposeUnit()` / `createWorkbook(saved)`
rebinds the actual renderer event sources and preserves the full saved model.

## Strict acceptance and remaining boundaries

`scripts/test-aster-custom-event-native.mjs` tests this selected export; the strict
report is `test-results/aster-custom-event-native/report.json`. All four literal
recipes run verbatim. Real native context-menu deletion covers C cancellation,
allowed F, partial overlap B–D, both sheets, actual B2 clicks inside A1:B2, event
order, guard removal/rebinding and independent consumer disposal. Full snapshots,
native editing/history, saved and empty recovery, invalid input, initial EN/ZH,
760/390/320 px, stable-owner themes, active/pending double disposal, normal export
CSS/source parity and pagehide cleanup are checked independently. Screenshots wait
for native paint and the startup skeleton to disappear.

Four raw SDK failures remain visible: deletion Undo restores values but adds
`t: 1` to the four F cells; first text Undo adds `t: 1` and an allocated style;
new-owner reconstruction changes the empty defined-name resource from `''` to
`'{}'`; unchecked deletion of nonexistent F decreases the column count. Redo,
same-owner snapshot reconstruction, restored-owner fresh-input history and the
explicit missing-F recipe guard pass separately. No model fields, IDs or events
are rewritten to turn these strict failures green.
