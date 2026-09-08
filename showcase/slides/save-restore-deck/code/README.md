# Tern / Keep the field briefing intact

The runtime is English-only on every host page. Complete official English SDK packs
and styles are retained. A legacy locale argument, where present, is ignored without
shifting the saved-snapshot argument.

Eight original fictional coastal-observation pages cover a title, mission, habitat
cards, sampling procedure, paired observation windows, sample comparison, quotation
and handoff. The 126 sample observations are authored data; the three bars are native
slide shapes, not a chart or live Formula results. Cream, mint, blue and coral pages
use transparent native Shape text boxes, not white panels behind every label.

Use the native page list, text editor, speaker notes and Grid ribbon. There is no
fixture, inspector, checksum, duplicate editing or history panel. Snapshot recipes
below explain application integration without adding buttons already in the editor.
This is browser-only SDK JSON, not PPTX Exchange, collaborative revision history or
a server save. The authored date is fixed; the SDK clock is not frozen.

## Literal Facade examples

Run these exact snippets in order in the Preview iframe or standalone page console.
They use the explicit presentation ID, not whichever product currently owns focus.
For native editing, select the corresponding page and double-click its text.

### 1. Inspect the evidence page

The native page list selects Counts; its three bars and speaker notes are visible.

```ts
const deck = window.univerAPI.getPresentation('tern-deck')
deck.setActiveSlide(deck.getSlideById('counts'))
```

### 2. Give the review an authored title

```ts
window.univerAPI.getPresentation('tern-deck').getSlideById('counts').getElementById('counts-title').getText().setText('126 samples / ready for review')
```

### 3. Preserve a presenter-only observation

```ts
window.univerAPI.getPresentation('tern-deck').getSlideById('counts').setSpeakerNotes('Estuary 42; Dunes 31; Harbor 53. Ask Mina to review the paired readings.')
```

### 4. Put results before the narrative

```ts
const deck = window.univerAPI.getPresentation('tern-deck')
deck.moveSlide(deck.getSlideById('counts'), 0)
deck.moveSlide(deck.getSlideById('comparison'), 1)
```

### 5. Name the reviewed edition

```ts
window.univerAPI.getPresentation('tern-deck').setName('Tern / Reviewed coastal briefing')
```

### 6. Capture the complete checkpoint

Keep every field, including the root ID, active page, zoom, notes and resource data.
This console variable is intentionally volatile: browser reload loses it.

```ts
window.ternCheckpoint = JSON.parse(JSON.stringify(window.univerAPI.getPresentation('tern-deck').save()))
```

### 7. Make a shorter live edition

```ts
const deck = window.univerAPI.getPresentation('tern-deck')
deck.deleteSlide(deck.getSlideById('closing'))
```

### 8. Create an audience edition without notes

```ts
const deck = window.univerAPI.getPresentation('tern-deck')
for (const id of deck.save().slideOrder) deck.getSlideById(id).setSpeakerNotes()
```

### 9. Keep the audience edition separately

The two snapshots must not alias each other. Restoring the audience edition must
not resurrect the deleted closing page or presenter notes.

```ts
window.ternAudienceCopy = JSON.parse(JSON.stringify(window.univerAPI.getPresentation('tern-deck').save()))
```

### 10. Download the saved review, not later live edits

```ts
const url = URL.createObjectURL(new Blob([JSON.stringify(window.ternCheckpoint, null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'tern-reviewed-briefing.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 1000)
```

## Restore through the same exported entry

```js
const restored = structuredClone(checkpoint)
validateSnapshot(restored)
const darkMode = demo.univerAPI.isDarkMode()
const locale = demo.univerAPI.getCurrentLocale()
demo.dispose()
demo = createDemo(container, darkMode, locale, restored)
await demo.ready
if (container.querySelector('.deck-roundtrip[data-error]')) throw new Error('The restored editor did not start.')
```

This recreates the editor owner as well as its unit, using the same ID and complete
snapshot. Do not stop at `save()` equality: navigate all restored pages, inspect
their actual painted content and notes, then perform a fresh native edit. A restored
owner starts a new local editing session, not the old Undo stack. Theme toggles use
`toggleDarkMode` on the existing owner and do not reset the presentation.

An invalid active-page reference must leave the live owner untouched:

```js
const invalid = structuredClone(checkpoint)
invalid.activeSlideId = 'missing-page'
validateSnapshot(invalid)
```

`createData('field-brief')`, `createData('review-order')`, `createData('notes-free')`
and `createData('empty')` remain independent startup variants in this example's
own data module. The empty variant is a real zero-page presentation, not a hidden
starter slide. Restoring an SDK-produced empty snapshot must be checked separately
from restoring an authored empty variant: the SDK may serialize a stale active ID.

## Source and acceptance

Preview and export call the same factory; the export includes all five official
SDK stylesheets and complete Design, UI, Docs UI, Shape Editor UI and Slides UI
locale packs in English. Host document language does not change the editor locale.
No sibling demo code or report is a runtime dependency.

The selected native test covers 13 gates: all ten literal examples
(including the actual JSON download), exact complete snapshots for both editions,
real owner replacement, native thumbnail navigation and painted text on every
restored page, fresh native text input with exact full-model Undo/Redo, four startup
variants and an SDK-produced empty snapshot. It also checks invalid input before
disposal, immediate pre-ready disposal, initial Chinese, both complete locale packs
and same-owner theme changes. No snapshot fields are dropped or normalized to pass
equality. The eight authored layouts and both restored native edits were visually
inspected; native Pro licensing watermarks remain visible without a license.

Run the guide checks from the documentation repository:

The default target is `http://localhost:3030/en-US/playground/slides/save-restore-deck`.
Use `SHOWCASE_DEMO_URL` for an exact URL or `SHOWCASE_BASE_URL` for another guide
origin. Reconstruction and startup-variant checks require the standalone test-only
harness, which exposes the same factory without adding controls to the shipped demo.
In PowerShell, build and test only this case:

This is evidence for the listed workflows, not every SDK feature. All native menu
paths, arbitrary imported resources, conversion, mobile/accessibility and delivery
performance remain outside the evidence until tested. The habitat bars are authored
shapes, not a live chart or Formula integration.
