# Tern field station — native Board lifecycle

Native UI, demo labels and authored data are English-only, including on Chinese documentation pages. Legacy locale arguments are ignored; saved-snapshot argument positions are unchanged.

The preview contains only the native Board workbench and its own floating tools. There are no fixture selectors, duplicated Move/Text/Undo buttons, audit panels or live snapshot inspectors. The two original pages remain: an opening plan with three different crew stickies, standalone headings, a background zone and the local SVG field-map placeholder; and a distinct evening handover. Authored review date, page sizes, page order and layer order remain part of the sample data.

Install the selected export with `pnpm install`, then `pnpm dev` or `pnpm build`. Build only this selected case. Preview and standalone use the same factory and eight official stylesheets, including Boards' Shape Editor, Ink UI and transitive Embed Unit UI dependencies. Eight complete English dependency locale packs are registered. Changing theme updates the current owner rather than recreating it. Boards keeps its native floating toolbar; the host UI is configured with Grid preference rather than a redundant Sheets-style ribbon. Native trial notices remain intact.

## Nine executable Facade examples

Run in order in the standalone console, after the Board has loaded. These demonstrate integration variants; normal interaction is through native dragging, double-click text editing and shortcuts.

### 1. Inspect every page

FBoard.save() includes inactive pages, authored custom data and registered resources. It does not save pointer focus or Undo stacks.

```ts
const board = window.univerAPI.getBoard('tern-station-lifecycle')
console.log(board.save(), board.getElementOrder())
```

### 2. Move a sticky relative to its current position

The SDK command changes real geometry. Use the native canvas for everyday dragging.

```ts
const board = window.univerAPI.getBoard('tern-station-lifecycle')
const id = board.save().activePageId === 'review' ? 'handover' : 'supplies'
const bounds = board.getElementBounds(id)
if (bounds) console.log(board.setElementTransform(id, { left: bounds.left + 120, top: bounds.top + 60 }))
```

### 3. Move back

Reverse the previous translation without replacing the other page or any shape data.

```ts
const board = window.univerAPI.getBoard('tern-station-lifecycle')
const id = board.save().activePageId === 'review' ? 'handover' : 'supplies'
const bounds = board.getElementBounds(id)
if (bounds) board.setElementTransform(id, { left: bounds.left - 120, top: bounds.top - 60 })
```

### 4. Edit a standalone heading

A nonblank host input guard precedes the real Facade call. Standalone text and sticky shape text are separate element types.

```ts
const board = window.univerAPI.getBoard('tern-station-lifecycle')
const title = 'Tern field station / Ready for opening'
if (!title.trim()) throw new Error('Enter a nonblank heading; no SDK write was made.')
board.setTextContent(board.save().activePageId === 'review' ? 'review-title' : 'title', title)
```

### 5. Edit sticky text through its shape Facade

The visible native text editor remains the primary editing surface. This integration example preserves a multiline supplies handoff.

```ts
const board = window.univerAPI.getBoard('tern-station-lifecycle')
const id = board.save().activePageId === 'review' ? 'handover' : 'supplies'
board.getShape(id).getText().setText('Mina / Ready for dispatch\n12 sampling kits sealed\nDock pickup 08:45')
```

### 6. Focus an existing canvas object

The real Facade selects the active-page object and pans to it; it does not create a duplicate object or sidebar inspector.

```ts
const board = window.univerAPI.getBoard('tern-station-lifecycle')
const id = board.save().activePageId === 'review' ? 'handover' : 'supplies'
console.log(board.focusElement(id, { x: 640, y: 400 }), board.getElementViewportPoint(id))
```

### 7. Reject a missing target

A false return is the native result, not a fixture error message. Verify the full snapshot remains unchanged.

```ts
const board = window.univerAPI.getBoard('tern-station-lifecycle')
const before = JSON.stringify(board.save())
console.log(board.setElementTransform('missing-element', { left: 20 }))
console.log(before === JSON.stringify(board.save()))
```

### 8. Inspect local history ownership

These are native editing-history methods, not a collaborative history-record feature or a custom snapshot stack.

```ts
const board = window.univerAPI.getBoard('tern-station-lifecycle')
console.log(board.undo())
console.log(board.redo())
```

### 9. Download complete snapshot JSON

Only a local browser download occurs. JSON is not a PDF/image export, and does not upload the field map.

```ts
const data = window.univerAPI.getBoard('tern-station-lifecycle').save()
const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'tern-station.board.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 0)
```

## Save an earlier checkpoint and restore it

```js
const checkpoint = JSON.parse(JSON.stringify(demo.univerAPI.getBoard('tern-station-lifecycle').save()))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
const board = demo.univerAPI.getBoard('tern-station-lifecycle')
const id = checkpoint.activePageId === 'review' ? 'handover' : 'supplies'
const bounds = board.getElementBounds(id)
if (bounds) board.setElementTransform(id, { left: bounds.left + 240, top: bounds.top + 90 })
demo.dispose()
demo = createDemo(container, darkMode, locale, checkpoint)
await demo.ready
```

Every serialized field is retained and compared; no geometry/default fields are stripped to force equality. The old SDK owner is actually disposed. Reconstructing resets its native Undo stack and viewport selection. The factory preserves saved theme and custom data instead of reseeding them.

## Reload current edits

```js
const saved = JSON.parse(JSON.stringify(demo.univerAPI.getBoard('tern-station-lifecycle').save()))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
await demo.ready
```

## Reset and separately construct the variants

Import `createData` from `./data` in the same application entry. After disposing the old `demo`, call `createDemo(container, darkMode, locale, createData(state))`.

- `default`: original two-page opening plan and evening handover.
- `empty`: one actual empty page; serialization, download and reload still apply.
- `boundary`: reversed pages and layers, active handover page, a rotated sticky at negative coordinates.
- `error`: original full data used with example 7's genuine missing-target rejection. It does not generate a fake SDK alert.

The installed Board Facade does not expose a page-navigation method, so active-page changes are supplied in data when reconstructing. The sample does not invent one. Resetting means constructing `createData('default')`, not simulating native Undo. Saved checkpoints remain under the host application's lifetime policy.

The factory's `await demo.fit()` helper calls the public `BoardViewportService.fitContent()`; it is explicitly a host helper, not a Facade method. It also runs once at startup. Use native viewport controls during normal editing. Empty content is a no-op.

## Acceptance boundary

Native text acceptance remains **strict FAIL** on SDK `1.0.0-rc.0`:

The test commits native text by clicking outside the editor; Escape cancels. Success at rendering or a passing reconstruction is not a claim that native text/history is fully accepted. No fixture result, silent snapshot normalization or SDK modification is used. Complete menu coverage, browser/touch/accessibility, pending-operation teardown and performance remain separate acceptance work.
