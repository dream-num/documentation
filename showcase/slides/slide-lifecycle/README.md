# Northlight / Native page lifecycle

The runtime is English-only on every host page. Complete official English SDK packs
and styles are retained. A legacy locale argument, where present, is ignored without
shifting the saved-snapshot argument.

Eight original fictional museum-night pages demonstrate route choices, room
capacities, staffing, access and closing. Use native thumbnails and their
Copy/Paste, Add slide below and Delete menus. Native ribbon Undo/Redo owns
page history. No fixture selector, reset/load/inspect panel or duplicate
navigation/edit/delete toolbar is mounted.

## An independent room-plan branch

Right-click Atrium, Copy, then right-click it again and Paste. Select the new
page and edit its title in the SDK. The equivalent Facade edit is:

```ts
const presentation = window.univerAPI.getActivePresentation()
const copy = presentation.getActiveSlide()
copy.getShape('title').getText().setRichText(
  window.univerAPI.newRichText().span('Atrium / Quiet arrival option', {
    fontSize: 34, bold: true, color: '#233D49',
  }),
)
```

Return to the original Atrium: its content and notes must be unchanged. Delete
the copy through its thumbnail menu, then use native Undo/Redo to restore or
remove it. Add slide below opens the native layout picker; choose Blank to
start another plan at that position. Copying external or embedded resources
is not certified by this text/shape example.

## Source variants

Change `createData()` in create-demo.ts to `createData('repeated-labels')`,
`createData('single')` or `createData('empty')`. The same exported data factory
supports identical page names with distinct IDs and one/zero-page boundaries.
`createInsert(id)` remains available in data.ts for a scripted lantern activity
via `presentation.insertSlide(index, createInsert(id))`. These variations are
not exposed as another host toolbar. Reload restores authored content; theme
changes use the existing API owner and preserve the model.

## Scope and acceptance

Exchange and Slides Exchange clients are not registered: their binary file
conversion uses an HTTP upload backend, which this local demo does not provide.
The native Print settings retain the Slides Print plugin and official CSS in
both Preview and independent source. This is not a physical-print guarantee.
No backend, booking,
collaborative revision history or persistence is provided. Runtime, export
parity, narrow-layout, error, lifecycle and performance acceptance must be
recorded separately before this capability is called complete.

Performance is not accepted: the independent build installs 172 offline packages;
main JS is 14,764.51 kB (3,528.16 kB gzip), CSS 113.33 kB (16.89 kB gzip).
The selected Next cold guide/playground responses took 53s/27.2s and emitted a
Gzip listener warning. Only this demo was compiled; no SDK or package was patched.
