# Tide Museum / Read-only workbook

Four fictional museum sessions show open, full, walk-in and canceled bookings. E4:E7 hold bookings and F4:F7 calculate capacity minus bookings with real SDK formulas. The original timetable, styles and formulas are unchanged.

Three small controls demonstrate distinct policies: Display only disables selection and shortcuts; Selectable read-only allows navigation while SDK permissions block editing; Editable comparison retains the same hidden chrome but allows native edits. In the editable mode select E4, press F2, select the cell text with Ctrl+A / Cmd+A, enter 7 and press Enter: F4 becomes 17. Mode and theme changes retain the same workbook owner and edits.

Only transitions gate native events. Steady viewer protection uses workbook permissions, not inert or an overlay. Beta.2 can replay pre-existing history after setReadOnly(), so this integration additionally cancels BeforeUndo/BeforeRedo whenever permissions are not editable or a transition is pending. This is frontend local authorization, not server-enforced access control against an untrusted client.

## Literal Facade experiments

Run snippet 1 first in the preview frame or exported demo console. These low-level experiments change the SDK directly, not the three mode buttons' labels; reload between independent experiments. The factory's `setMode()` composes these operations, awaits permission completion, verifies canEdit(), and updates the button state. A failed transition stays interaction-gated and can be retried. Retain a single FShortcut handle when disabling and re-enabling it.

### 1. Capture the active workbook and shared shortcut handle

```ts
window.tideBook = window.univerAPI.getActiveWorkbook()
window.tideShortcut = window.univerAPI.getShortcut()
window.tideSaved = structuredClone(window.tideBook.save())
```

### 2. SDK viewer permission

```ts
await window.tideBook.getWorkbookPermission().setReadOnly()
if (window.tideBook.getWorkbookPermission().canEdit()) throw new Error('Viewer policy not applied')
```

### 3. SDK editable permission

```ts
await window.tideBook.getWorkbookPermission().setEditable()
if (!window.tideBook.getWorkbookPermission().canEdit()) throw new Error('Editor policy not applied')
```

### 4. Display without mouse selection

```ts
window.tideBook.disableSelection()
```

### 5. Enable selection, independently of editing permission

```ts
window.tideBook.enableSelection()
```

### 6. Disable Univer keyboard shortcuts

```ts
window.tideShortcut.disableShortcut()
```

### 7. Release the same shortcut-disable handle

```ts
window.tideShortcut.enableShortcut()
```

### 8. Inspect the actual selection

```ts
console.log(window.tideBook.getActiveSheet().getActiveRange()?.getA1Notation())
```

### 9. Read permission snapshots without adding a UI inspector

```ts
console.log(window.tideBook.getWorkbookPermission().getSnapshot())
console.log(window.tideBook.getActiveSheet().getWorksheetPermission().getSnapshot())
```

### 10. Verify real booking data and formulas

```ts
const sheet = window.tideBook.getActiveSheet()
console.log(sheet.getRange('D4:F7').getRawValues())
console.log(sheet.getRange('F4:F7').getFormulas())
```

### 11. Capture complete edited data

```ts
window.tideSaved = structuredClone(window.tideBook.save())
if (window.tideSaved.id !== 'tide-museum') throw new Error('Unexpected workbook ID')
```

### 12. Guard existing history in a viewer integration

The factory already installs these public events, with an additional pending-transition check. This independent example registers temporary guards and immediately disposes them; it does not remove the factory's guards. Hidden controls alone are not a permission boundary.

```ts
const api = window.univerAPI
const guards = [api.Event.BeforeUndo, api.Event.BeforeRedo].map(event => api.addEvent(event, history => {
  if (!api.getActiveWorkbook()?.getWorkbookPermission().canEdit()) history.cancel = true
}))
guards.forEach(guard => guard.dispose())
```

### 13. Switch theme without recreating the owner

```ts
window.univerAPI.toggleDarkMode(true)
window.univerAPI.toggleDarkMode(false)
```

## Same-ID recovery and lifecycle

For an integration that owns the factory, capture `controller.univerAPI.getActiveWorkbook().save()`, await `controller.dispose()`, then call `createDemo(container, darkMode, locale, saved)` with that complete saved model. The fourth parameter is optional. It never changes the saved ID or regenerates original business data. The new owner starts in Display only as a deliberate safe policy; exact saved-model equality is tested independently. Do not call disposeUnit()/createWorkbook() behind the controller: its permission/history closures own the original workbook.

`controller.setMode('display' | 'selectable' | 'editable')` validates the mode before any mutation. Concurrent transitions are ignored while the active one settles. Calling dispose twice is safe; disposal during a real pending permission call detaches the UI immediately and waits for that call before disposing its owner. Invalid saved input is rejected before creating an editor. Theme updates use the current API and do not rerun the factory.

## Verification

The installed beta.2 native Undo returns the original booking/formula values but adds a cell type and an unused text-color style to the saved model. Same-ID recreation preserves edited values and formulas but changes `SHEET_DEFINED_NAME_PLUGIN.data` from an empty string to `'{}'`. Both complete-model checks remain failures; the integration does not strip, rewrite or pre-seed those fields to make equality pass. Viewer input and history protection are separate strict checks.

`node scripts/test-read-only-native.mjs [selected-export-manifest.json]` uses the normal selected exported source plus a separate factory lifecycle harness. The default URL is `http://localhost:3030/en-US/playground/sheets/read-only`; override `SHOWCASE_DEMO_URL`, `SHOWCASE_BASE_URL`, `SHOWCASE_HARNESS_URL` and `SHOWCASE_RESULTS_DIR` for independent runs. The test preserves complete snapshot differences, including resources and IDs, and reports native viewer typing/Delete/paste, selection/shortcuts, editable formula/history, theme/locale and lifecycle failures without normalizing them. Only this case is built; no Print or backend is used.
