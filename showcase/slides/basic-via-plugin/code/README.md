# Build / edit / extend a presentation

The runtime is English-only on every host page. Complete official English SDK packs
and styles are retained. A legacy locale argument, where present, is ignored without
shifting the saved-snapshot argument.

The original plugin-mode introduction now includes all three authored pages: the SDK cover,
plugin registration with native ellipse/hexagon geometry, and Q3 product momentum. The independent
signals remain +31% pipeline growth, 94% customer retention and seven feature launches. They are
editable text, not Formula or native Chart calculations. Navy, teal, lilac and warm amber distinguish
the three pages without copying another business story.

Use the actual Grid ribbon, slide thumbnails, text/shape editor and Speaker notes. There is no
host summary button, reset button, activity panel or hidden one-shot summary flag. Legacy Text
records are expressed as native text-box Shapes while retaining the original text and element IDs.

Preview and export share one factory, all five official CSS files and five complete English packs.
The editor always uses English. A theme toggle preserves the existing edited owner.
Run pnpm install / pnpm dev in the independent export, or pnpm build / pnpm preview for production.

## Literal Facade recipes

Run these 14 blocks in order on a fresh demo. Block 8 intentionally rejects a duplicate application
request; block 14 reloads and discards edits. Browser DevTools uses the actual window.univerAPI.
Page-copy IDs are intentionally new, whereas saved-document restore must retain every original ID.

### 1. Read the complete presentation

```ts
window.univerAPI.getPresentation('slides-pro-demo').save()
```

### 2. Edit the cover title

```ts
window.univerAPI.getPresentation('slides-pro-demo').getSlideById('cover').getElementById('title').getText().setText('Univer SDK / Product studio')
```

### 3. Navigate to the plugin page

```ts
window.univerAPI.getPresentation('slides-pro-demo').setActiveSlide(window.univerAPI.getPresentation('slides-pro-demo').getSlideById('feature'))
```

### 4. Move and rotate the native ellipse

```ts
window.univerAPI.getPresentation('slides-pro-demo').getSlideById('feature').getElementById('shape-a').setTransform({ left: 795, top: 192, rotation: 18 })
```

### 5. Record the integration decision

```ts
window.univerAPI.getPresentation('slides-pro-demo').getSlideById('feature').setSpeakerNotes('Register the selected plugins before creating the presentation. Keep theme changes on the same owner. Review.')
```

### 6. Read the authored summary as actual page data

```ts
window.basicSummary = structuredClone(window.univerAPI.getPresentation('slides-pro-demo').getSlideById('summary').getData())
```

SUMMARY_SLIDE in data.ts is already part of the initial model. This reads its current native page,
including any user edits; it does not substitute an unrelated fixture.

### 7. Append and activate a deliberately revised summary

```ts
{
  const deck = window.univerAPI.getPresentation('slides-pro-demo')
  if (deck.getSlideById('summary-review')) throw new Error('The review summary already exists')
  const blank = Object.values(deck.save().layoutPages ?? {}).find(layout => layout.layoutType === 'blank')
  if (!blank) throw new Error('A blank layout is required for this authored summary')
  const added = deck.appendSlide({ ...structuredClone(window.basicSummary), id: 'summary-review', name: 'Q3 review copy', layoutPageId: blank.id, masterPageId: blank.masterPageId, pageSize: deck.getSlideById('summary').getPageSize() })
  added.getElementById('metric-growth').getText().setText('+34%\nPipeline growth').setHorizontalAlign(window.univerAPI.Enum.HorizontalAlign.CENTER).setVerticalAlign(window.univerAPI.Enum.VerticalAlign.MIDDLE)
  deck.setActiveSlide(added)
}
```

The copy has a new page ID but preserves the original summary. Its other independent signals stay
94% and 7. Repeating a request is checked against the real document, never a hidden summaryAdded flag.
The real blank layout avoids inheriting unrelated title/subtitle placeholders. Explicit native text alignment
keeps the revised metric centered; neither operation removes or conceals SDK elements after insertion.

### 8. Reject the duplicate before mutation

```ts
{
  const deck = window.univerAPI.getPresentation('slides-pro-demo')
  if (deck.getSlideById('summary-review')) throw new Error('The review summary already exists')
  deck.appendSlide({ ...structuredClone(window.basicSummary), id: 'summary-review' })
}
```

### 9. Remove the copy, keeping the original summary

```ts
{
  const deck = window.univerAPI.getPresentation('slides-pro-demo')
  deck.deleteSlide(deck.getSlideById('summary-review'))
  deck.setActiveSlide(deck.getSlideById('summary'))
}
```

### 10. Save full document data and resources

```ts
window.basicSaved = structuredClone(window.univerAPI.getPresentation('slides-pro-demo').save())
```

### 11. Recreate the saved unit with exactly the same ID

```ts
{
  const api = window.univerAPI
  api.disposeUnit('slides-pro-demo')
  api.createPresentation(structuredClone(window.basicSaved))
}
```

This is SDK snapshot reconstruction, not a binary import or a promise to persist the Undo stack.
For a full owner replacement, dispose your createSlidesDemo controller and pass this same snapshot
as its fourth argument; await the returned ready promise. Theme changes should not reconstruct it.

### 12. Create a genuinely empty presentation

```ts
{
  const api = window.univerAPI
  api.disposeUnit('slides-pro-demo')
  api.createPresentation({ ...structuredClone(window.basicSaved), slideOrder: [], slides: {}, activeSlideId: undefined })
}
```

### 13. Restore every saved page and element

```ts
{
  const api = window.univerAPI
  api.disposeUnit('slides-pro-demo')
  api.createPresentation(structuredClone(window.basicSaved))
}
```

### 14. Reset by rerunning the original factory

```ts
window.location.reload()
```

## Honest scope

Raw complete snapshots and actual canvas paint must agree; do not normalize away IDs, resources or
history differences. Native edits must be committed before saving. Save Speaker notes with its native
button; presentation Undo shortcuts require focus back on the slide canvas, not the notes field.

The original summary append ability remains in block 7, with explicit repeat-request validation and
a genuinely different copied metric. This basic example does not claim threaded collaboration,
binary Exchange, Formula linkage, native Chart data, mobile or exhaustive keyboard accessibility.

## Strict native evidence

One focus boundary remains strict FAIL: Ctrl+Z/Y immediately after saving in the Speaker notes area does not route to
presentation history. Selecting the real native title shape first passes complete notes Undo/Redo and visible text checks;
notes history itself exists. No hidden host handler redirects these shortcuts.
