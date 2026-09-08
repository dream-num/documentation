# Tern field station — native Canvas lifecycle

Native UI, demo labels and authored data are English-only, including on Chinese documentation pages. Legacy locale arguments are ignored; saved-snapshot argument positions are unchanged. Earlier bilingual acceptance reports below remain historical evidence, not validation of this English-only revision.

The preview contains only the native Canvas workbench and its own floating tools. There are no fixture selectors, duplicated Move/Text/Undo buttons, audit panels or live snapshot inspectors. The two original pages remain: an opening plan with three different crew stickies, standalone headings, a background zone and the local SVG field-map placeholder; and a distinct evening handover. Authored review date, page sizes, page order and layer order remain part of the sample data.

Install the selected export with `pnpm install`, then `pnpm dev` or `pnpm build`. Build only this selected case. Preview and standalone use the same factory and eight official stylesheets, including Canvases' Shape Editor, Ink UI and transitive Embed Unit UI dependencies. Eight complete English dependency locale packs are registered. Changing theme updates the current owner rather than recreating it. Canvases keeps its native floating toolbar; the host UI is configured with Grid preference rather than a redundant Sheets-style ribbon. Native trial notices remain intact.

## Nine executable Facade examples

Run in order in the standalone console, after the Canvas has loaded. These demonstrate integration variants; normal interaction is through native dragging, double-click text editing and shortcuts.

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

In the application entry, keep the imported `createDemo`, mount `container`, and a replaceable `let demo = createDemo(container)` handle. Wait for `demo.ready` before running the following. This explicitly saves a detached checkpoint, makes another actual edit, and reconstructs the earlier state. It is application-owned memory, not a server write or durable storage.

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

Reload saves the current content rather than an earlier checkpoint. All pages are part of this single Canvas owner.

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

The installed Canvas Facade does not expose a page-navigation method, so active-page changes are supplied in data when reconstructing. The sample does not invent one. Resetting means constructing `createData('default')`, not simulating native Undo. Saved checkpoints remain under the host application's lifetime policy.

The factory's `await demo.fit()` helper calls the public `BoardViewportService.fitContent()`; it is explicitly a host helper, not a Facade method. It also runs once at startup. Use native viewport controls during normal editing. Empty content is a no-op.

## Acceptance boundary

The selected native harness verifies all nine literal Facade examples against real snapshots and current canvas paint; native pointer dragging and ArrowRight movement with exact whole-model Undo/Redo; real sticky and standalone-heading typing; edited-checkpoint/current-content disposal and reconstruction; four separately constructed data variants; seven complete EN/ZH packs; same-owner theme preservation; initial Chinese language and final disposal. Reconstructed owners preserve every serialized field, including inactive pages and native resources, and accept fresh edits. These checks make no backend requests.

Native text acceptance remains **strict FAIL** on SDK `1.0.0-beta.2`:

- Sticky editing accepts and paints new multiline text, but a native Ctrl+A replacement retains two old paragraphs instead of replacing the whole text. Its actual edited snapshot can still be undone and redone exactly.
- The sticky edit path also emits `TypeError: Cannot read properties of null (reading 'getSnapshot')` from the SDK editor. It is recorded, not suppressed.
- Standalone-heading editing commits and paints the new heading; Undo does not return the complete pre-edit model. The strict comparison reports 38 field differences across `pages` and the SDK's serialized `slides` alias, including retained text document defaults, formatting and size changes (520×55 to 266×21). Redo matches the actual edited snapshot exactly.

The test commits native text by clicking outside the editor; Escape cancels. Success at rendering or a passing reconstruction is not a claim that native text/history is fully accepted. No fixture result, silent snapshot normalization or SDK modification is used. Complete menu coverage, browser/touch/accessibility, pending-operation teardown and performance remain separate acceptance work.

## Maintainer verification

From the documentation repository, `node scripts/test-boards-tern-native.mjs` targets `http://localhost:3030/en-US/playground/boards/create-save-and-restore-board`. Override `SHOWCASE_DEMO_URL` for an explicit page, or `SHOWCASE_BASE_URL` for another documentation origin. This route checks native interactions and literal Facade examples; lifecycle reconstruction and separate data construction require the standalone harness and are explicitly marked unverified on the guide route.

For the complete selected-only harness on the reserved port 4362, first ensure that port is free. Set `SHOWCASE_BUILD_STANDALONE=1` and run the same script. Supply `SHOWCASE_EXPORT_DIRECTORY` pointing to this case's installed standalone export (with `node_modules/vite`), or set `SHOWCASE_VITE_DIRECTORY` to the exact installed Vite package directory matching the exported manifest. The script links only exact existing dependencies and never installs packages or reads another demo's report to locate Vite. Its default results directory is `test-results/tern-native`; override `SHOWCASE_RESULTS_DIR` if needed. The generated `exports.json` identifies this case's standalone directory.

Build that selected export's normal entry using `pnpm build` there. Then set `SHOWCASE_EXPORT_PORT=4362` and `SHOWCASE_RESULTS_DIR=test-results/tern-native-export-ui`, and run `node scripts/test-showcase-export-ui.mjs test-results/tern-native/exports.json` from the documentation repository. That separate test checks the unmodified exported entry, source parity and official native CSS, not the harness-only lifecycle handles. Keep report directories distinct: UI/runtime checks use `report.json`; the static CSS check uses `css-report.json`.
