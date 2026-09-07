# Willow / Responsive width and zoom

The original nursery memo keeps its two shift columns, supplies table, native
chart and map. Resize the host or reading width and compare actual native layout.
Edit and select text directly in the document; use native Undo/Redo. There is no
fixture, Reset, fixed note insertion, selection shortcut or raw geometry panel.

Host width is a CSS container operation, not a Facade method. Reflow currently
uses the SDK RichTextEditingMutation with noHistory. Use the native footer for
zoom: its SetDocZoomRatioOperation updates the document's actual settings, which
the reflow listener reads. There is no separate host zoom state. These are explicit
SDK operations, not invented FDocument setters. Their implementation is exported.

## Native source edit

```ts
const doc = univerAPI.getDocument('willow-responsive')
if (!doc) throw new Error('The Willow document is unavailable')
const paragraph = doc.getParagraphs().find(p => p.getText().includes('Review seedling counts'))
if (!paragraph) throw new Error('The review paragraph was removed')
doc.insertText(paragraph.getRange().startOffset, 'Field note: Ridge trays checked at 16:40.\r')
```

Resize the host after editing. The inserted text must survive; theme changes
use the same owner rather than restoring a fixture.

## Preserve the complete snapshot

```ts
const doc = univerAPI.getDocument('willow-responsive')
if (!doc) throw new Error('The Willow document is unavailable')
window.willowSaved = structuredClone(doc.save())
```

This is document JSON, not a PDF or Word export. Do not rewrite its ID or strip
resources to make a recovery comparison pass.

## Programmatic zoom: lower-level SDK operation

```ts
const doc = univerAPI.getDocument('willow-responsive')
if (!doc) throw new Error('The Willow document is unavailable')
const percent = 150
if (!Number.isFinite(percent) || percent < 10 || percent > 400) throw new Error('Zoom must be within the native 10–400% range')
if (!univerAPI.syncExecuteCommand('doc.operation.set-zoom-ratio', {
  unitId: doc.getId(), zoomRatio: percent / 100,
})) throw new Error('The SDK zoom operation was rejected')
```

The literal command ID is SetDocZoomRatioOperation.id in the installed SDK.
This is not an FDocument zoom setter. Host/reading-width changes remain explicit
container integration; automatic block resizing uses the exported JSONX mutation
implementation, not CSS scaling. Zoom and reflow do not intentionally add history.

## Read the actual zoom

```ts
const doc = univerAPI.getDocument('willow-responsive')
if (!doc) throw new Error('The Willow document is unavailable')
const actualZoom = doc.getDocumentDataModel().getSettings()?.zoomRatio ?? 1
if (!Number.isFinite(actualZoom)) throw new Error('The document zoom is invalid')
```

getDocumentDataModel exposes the lower-level model. Reading it does not update it.

## Recreate the complete same-ID owner

```ts
const previous = window.willowDemo
if (!previous || !window.willowSaved) throw new Error('Capture the complete snapshot first')
const { container, createDemo } = previous
previous.dispose()
createDemo(container, false, window.willowSaved)
```

willowDemo is this example's lifecycle controller, not a Facade API. Passing a
snapshot skips original content initialization and never regenerates its IDs.
Wait for the native document to become ready before editing it. Saving/recreating
is a strict equality check, not permission to normalize resources.

## Empty same-ID document and restoration

```ts
const previous = window.willowDemo
if (!previous || !window.willowSaved) throw new Error('Capture the complete snapshot first')
const { container, createDemo } = previous
previous.dispose()
createDemo(container, false, {
  id: window.willowSaved.id,
  title: 'Empty responsive document',
  documentStyle: structuredClone(window.willowSaved.documentStyle),
  body: { dataStream: '\r\n', paragraphs: [{ startIndex: 0 }], sectionBreaks: [{ startIndex: 1 }] },
})
```

Run the preceding same-ID recreation recipe to restore all original saved blocks.
These lifecycle recipes have no fixture-loader buttons in the visible demo.

The shared factory imports five official stylesheets and complete core, drawing,
chart, column and table EN/ZH locale packs. SDK controls use the initial document
language; original business content is English.

## Strict acceptance boundary

The dedicated `scripts/test-willow-responsive-native.mjs` uses native footer input
and menus, real keyboard text/selection and unmodified complete snapshots. Native
text input, its complete Undo/Redo, four host widths, four zoom values, same-owner
themes and initialization-between-chart-and-map disposal have been exercised.
English and Chinese initial UI include all five complete dependency packs.

The installed beta.2 still fails strict requirements: 390px/150% produces a
visible `breakType` layout error; focused reading width updates the chart model
to about 506.67 while the actual native frame stays at 520. A resize cycle can
change the serialized drawing-resource string, so complete text Undo after resize
does not exactly restore the original snapshot. Same-ID saved/empty restoration
drops optional `clipBounds`, `flipX` and `flipY` properties with undefined values
from drawing transforms. Content and fresh native editing are checked separately
and do not turn those full-model failures into passes.

Modern document margins leave little text space at extreme narrow/high-zoom
combinations. A wider host is a recovery action, not a fix for the failing narrow
configuration. No SDK package is patched; no properties/resources are normalized,
no IDs are rewritten and no CSS scale substitutes for document reflow.

For a development server use `dev:showcase` (port 3030), then run
`node scripts/test-willow-responsive-native.mjs`. A standalone selected export can
be tested with `SHOWCASE_DEMO_URL`; the script also accepts `SHOWCASE_BASE_URL`
and `SHOWCASE_RESULTS_DIR`. `--prepare` exports only this case and reuses the
manifest's directory with exact-version, individual package junctions.
