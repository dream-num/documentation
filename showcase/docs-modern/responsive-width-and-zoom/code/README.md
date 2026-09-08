# Responsive width and native zoom

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

The only host control changes the external CSS container width. Native Grid and footer controls handle editing and zoom. Preview and standalone share the same factory, official core CSS and complete English locale bundles. Theme changes preserve the owner and edits.

## Three different measurements

- **Container width** is a browser measurement. Changing CSS alone does not rewrite logical document width.
- **Logical page width** lives in the SDK document. The adapter sets it to the host width minus 16 pixels, capped at 820 document units and bounded below at 240. The SDK lays out the same paragraphs again, creating real new line breaks.
- **Native zoom** magnifies the existing layout. At 150%, logical page width and line breaks stay the same, but the page is larger on screen. Narrow hosts may need horizontal scrolling. Zoom does not trigger the adapter.

Automatic fit-to-width scaling is disabled. There is no CSS scaling, smaller font, cloned document or replacement rendering.

## Read and edit through the Facade

```ts
const doc = univerAPI.getActiveDocument()
if (!doc) throw new Error('Open the width example first.')
const snapshot = doc.save()
const logicalWidth = snapshot.documentStyle.pageSize?.width
if (!doc.insertText(0, 'An extra line.\r')) throw new Error('Text insertion failed.')
```

The returned `univerAPI` is also exposed as `window.univerAPI` in the example. Text, paragraph IDs and styles survive host resizing; only logical page width changes.

## Host adapter: a lower-level SDK mutation

The installed Facade has no page-width setter. The factory uses `RichTextEditingMutation` and JSONX explicitly, without adding Undo history. This is host integration, not a Facade width API.

```ts
import { JSONX } from '@univerjs/core'
import { RichTextEditingMutation } from '@univerjs/docs'

const oldWidth = doc.save().documentStyle.pageSize!.width
const width = 600
if (!univerAPI.syncExecuteCommand(RichTextEditingMutation.id, {
  unitId: doc.getId(),
  noHistory: true,
  textRanges: null,
  actions: JSONX.getInstance().replaceOp(['documentStyle', 'pageSize', 'width'], oldWidth, width),
})) throw new Error('Page width update failed.')
```

Use this pattern inside the adapter. A subsequent host resize applies its measured width again.

## Read native zoom

```ts
const zoom = doc.save().settings?.zoomRatio ?? 1
```

Set zoom with the native footer. Its `SetDocZoomRatioOperation` updates this setting; the example adds no duplicate zoom buttons.

## SDK limits retained

This text specimen does not repair the earlier beta.2 mixed-content failures: narrow/high-zoom layout could throw `breakType`; chart model width and visible frame could diverge; resize/history could change serialized drawing resources; saved-owner recreation could omit optional drawing transform fields. Removing the mixed fixture and zoom-triggered reflow is not a fix for those SDK cases. Their regressions remain separate.

New layout failures are surfaced and logged. Enlarging the container is a possible recovery action, not evidence that the failed narrow layout works. The browser check compares actual skeleton widths and line counts alongside model preservation; a successful model update alone does not prove reflow.
