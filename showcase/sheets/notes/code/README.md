# Riverside textiles: native cell notes

Native UI and authored data are English-only. Earlier bilingual/native reports below are historical evidence, not acceptance of this migration.

Run `pnpm install`, `pnpm dev`; use `pnpm build` and `pnpm preview` for the independent frontend.
Preview and export share the same factory, official core/note preset CSS and complete English preset packs.
The SDK UI and authored content stay English on every host language. Theme changes preserve the same owner and edited document.

## Original conservation records

The fictional Riverside lab tracks linen, silk, wool and storage containers. Intake has a pinned humidity note at B2,
a multiline Unicode note at B3 and an independent lining note at C4. Storage has a battery-monitoring note at B2.
All four stable note IDs, original cell values, zero quantities and empty locations are retained. These are plain-text
cell notes, not threaded comments: no fabricated authors, replies or collaboration accounts.

The native Grid ribbon/context menu and the actual note popup are the editor. Edit the pinned textarea directly,
resize its native handle, hover an unpinned note, switch native sheet tabs and use native Undo/Redo.
There is no external note draft, target selector, property form, history button, fixture switch or readback/event panel.

## Literal Facade variants

Run these blocks in order in DevTools on a fresh demo. Block 14 intentionally rejects invalid application input;
block 25 reloads the page. Optional event listeners must be disposed when no longer needed.

### 1. Read actual notes without changing them

```ts
window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('B2').getNote()
window.univerAPI.getActiveWorkbook().getSheets().map(sheet => ({ id: sheet.getSheetId(), notes: sheet.getNotes() }))
```

### 2. Observe real SDK events

```ts
window.riversideEvents = []
window.riversideSubscriptions = ['SheetNoteAdd', 'SheetNoteUpdate', 'SheetNoteDelete', 'SheetNoteShow', 'SheetNoteHide'].map(name =>
  window.univerAPI.addEvent(window.univerAPI.Event[name], event => {
    window.riversideEvents.push({ name, sheet: event.worksheet.getSheetId(), row: event.row, col: event.col })
  })
)
```

This is an optional application subscription, not an on-screen audit panel; the final unsubscribe block releases it.

### 3. Unpin the humidity note

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('B2')
  range.createOrUpdateNote({ ...range.getNote(), show: false })
}
```

Hover B2 afterward: the native note appears temporarily without persisting show=true.

### 4. Pin the humidity note

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('B2')
  range.createOrUpdateNote({ ...range.getNote(), show: true })
}
```

### 5. Update multiline Unicode text while pinned

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('B2')
  range.createOrUpdateNote({ ...range.getNote(), note: 'Humidity 48%; inspected by River team.\nRecheck — tomorrow.' })
}
```

Do not automatically close/reopen the popup: compare its live text with getNote(). The pinned-popup stale-text defect remains visible.

### 6. Request a wide note

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('B2')
  range.createOrUpdateNote({ ...range.getNote(), width: 320, height: 180 })
}
```

The stored dimensions and actual popup dimensions are tested separately. A mounted popup may keep its prior size.

### 7. Request the compact size

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('B2')
  range.createOrUpdateNote({ ...range.getNote(), width: 220, height: 110 })
}
```

### 8. Explicitly unpin

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('B2')
  range.createOrUpdateNote({ ...range.getNote(), show: false })
}
```

### 9. Explicitly pin again

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('B2')
  range.createOrUpdateNote({ ...range.getNote(), show: true })
}
```

This user-requested visibility variant may show the latest data. It is not evidence that live updates or Undo refreshed the existing popup.

### 10. Address a rectangle: only its top-left note

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('B3:C4')
  range.activate()
  range.createOrUpdateNote({ ...range.getNote(), note: 'Covered storage until Friday.\nNo direct sunlight.' })
}
```

B3 changes; the independent C4 lining note and all cell values must remain intact.

### 11. Delete only the rectangle top-left note

```ts
window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('B3:C4').deleteNote()
```

### 12. Attach a note to an empty cell

```ts
window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('E6').createOrUpdateNote({ note: 'Mount reserved — no object assigned yet.', width: 240, height: 120, show: true })
```

E6 remains empty of cell values. A cell note does not create authors, replies or threaded comments.

### 13. Remove the empty-cell note

```ts
window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('E6').deleteNote()
```

### 14. Reject whitespace-only application input

```ts
{
  const text = '   '
  if (!text.trim()) throw new Error('Enter non-empty note text')
  window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('E6').createOrUpdateNote({ note: text, width: 220, height: 110, show: true })
}
```

This intentionally throws before writing; it demonstrates application validation, not an SDK rejection guarantee.

### 15. Read a cell without a note

```ts
window.univerAPI.getActiveWorkbook().getSheetBySheetId('intake').getRange('E6').getNote()
```

### 16. Switch to the independent storage notes

```ts
window.univerAPI.getActiveWorkbook().setActiveSheet('storage')
window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2').getNote()
```

### 17. Pin the storage monitoring note

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('storage').getRange('B2')
  range.createOrUpdateNote({ ...range.getNote(), show: true })
}
```

### 18. Unpin the storage monitoring note

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('storage').getRange('B2')
  range.createOrUpdateNote({ ...range.getNote(), show: false })
}
```

### 19. Return to intake

```ts
window.univerAPI.getActiveWorkbook().setActiveSheet('intake')
```

### 20. Save complete data and resources

```ts
window.riversideSnapshot = structuredClone(window.univerAPI.getActiveWorkbook().save())
```

### 21. Reload using exactly the same workbook and note IDs

```ts
{
  const api = window.univerAPI
  api.disposeUnit(api.getActiveWorkbook().getId())
  api.createWorkbook(structuredClone(window.riversideSnapshot))
}
```

No new UUIDs and no filtering of saved resources. Native Undo history is not persisted.

### 22. Create a genuinely blank two-sheet document

```ts
{
  const api = window.univerAPI
  api.disposeUnit(api.getActiveWorkbook().getId())
  api.createWorkbook({ id: window.riversideSnapshot.id, name: 'Empty Riverside intake', sheetOrder: ['intake', 'storage'], sheets: {
    intake: { id: 'intake', name: 'Intake', rowCount: 30, columnCount: 8, cellData: {} },
    storage: { id: 'storage', name: 'Storage', rowCount: 30, columnCount: 8, cellData: {} },
  } })
}
```

### 23. Restore the saved edited notes

```ts
{
  const api = window.univerAPI
  api.disposeUnit(api.getActiveWorkbook().getId())
  api.createWorkbook(structuredClone(window.riversideSnapshot))
}
```

### 24. Release the optional event listeners

```ts
window.riversideSubscriptions.forEach(subscription => subscription.dispose())
window.riversideSubscriptions = []
```

### 25. Reset to the original authored data

```ts
window.location.reload()
```

Reloading this demo discards edits and reruns the original factory. Save needed work first; theme changes do not reset the document.

## Original unmet acceptance remains explicit

In the pinned beta build, Facade note writes execute mutations outside Undo history. Mounted popup text and size may
remain stale after direct Facade changes, and native Undo can restore model content without refreshing the open textarea.
This factory does not automatically unpin/re-pin or edit popup DOM to conceal these failures. Native edits use debounced
commands; wait for actual getNote() data before saving. Model content, rendered popup and complete raw snapshot history
are separate strict checks, with no normalization or regenerated IDs.

## Strict native acceptance

Real textarea edits, native resize-handle drags, native menu pin/delete, hover, sheet tabs and keyboard Undo/Redo were tested.
Complete raw snapshots, including serialized resources and stable IDs, pass native edit/resize/pin/delete history and
same-ID save/reload/blank/restore. Five real event types and their sheet/cell payloads pass. Initial Chinese native menus,
complete core/note EN/ZH packs, both official stylesheets, same-owner edited state across themes and owner disposal pass.
No backend requests, browser errors or runtime warnings were observed. Screenshots wait for actual painted cells and the
original pinned note, as well as the absence of the SDK startup skeleton.

Five strict failures remain, without a host workaround or SDK patch:

- Native text Undo restores the model but leaves the edited text in the mounted popup.
- Native resize Undo restores 220×110 in the model but leaves a 300×160 popup on screen.
- Direct Facade text updates leave the existing popup text unchanged.
- Direct Facade size changes store 320×180 while the popup remains 220×110.
- Direct Facade note mutations do not enter native Undo history.
