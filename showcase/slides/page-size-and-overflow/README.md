# Rivet / Page Size and Overflow

The runtime is English-only on every host page. Complete official English SDK packs
and styles are retained. A legacy locale argument, where present, is ignored without
shifting the saved-snapshot argument.

An original repair-library briefing uses sixty kits, forty-eight tickets and eight shift assignments. All people, outcomes and quotations are fictional. Eight native slides preserve seven narrative arrangements; the native slide sidebar is the gallery, not a fixture selector.

| Page | Comparison |
| --- | --- |
| Opening | 960 × 540 inherited size; negative, right/bottom, touching-edge and rotated markers |
| Purpose | 720 × 540 override; unchanged wide content |
| Kits | 600 × 600 override; unchanged wide content |
| Workflow | 540 × 960 override; uniformly scaled/centered content |
| Results | 720 × 540 override; uniformly scaled/centered content |
| Quote, rota, closing | Inherited wide pages with separate narrative arrangements |

Size-only changes leave owned geometry intact. Master graphics resolve against page size. Frame overflow does not prove text glyph clipping: stroke, shadow, rich-text layout and nested groups require separate verification. Boundary markers are intentionally visible, not errors to silently clamp. Trial marks remain.

Preview and export share the same factory, five official SDK stylesheets and five English locale packs. Both initial UI and authored content are English. Grid is the default ribbon. Theme changes retain the same editor and model. No fixture, duplicated edit/Undo controls, status explanation card, or audit panel is added; startup errors alone show an alert.

Native no-fill/no-line text-box shapes replace legacy white Text boxes. Eight authored page backgrounds alternate deep ocean, cream, mint and coral; narrow accent rules leave the content open. Text color and fill are SDK data, with native centered text layout and no CSS overrides. Size comparisons and all five geometry markers are unchanged.

## Twenty literal Facade variants

Run in order in the preview-frame or standalone console. All mutations use real Facades or registered native commands; keep the deck focused for Undo/Redo. The scale calculation is explicitly host geometry policy, not a claimed native automatic reflow.

### 1. Capture the complete deck

```ts
window.rivetCheckpoint = structuredClone(window.univerAPI.getActivePresentation().save())
```

### 2. Change the deck to 4:3

Only inherited pages change their resolved size. Explicit portrait/square/4:3 overrides and slide-owned geometry remain unchanged.

```ts
window.univerAPI.getActivePresentation().setPageSize({ width: 720, height: 540, preset: window.univerAPI.Enum.SlidePageSizePresetEnum.Standard4By3 })
```

### 3. Override the opening page with portrait

This changes the page boundary, not the positions of owned content. The wide content intentionally overflows.

```ts
window.univerAPI.getActivePresentation().getSlideById('opening').setPageSize({ width: 540, height: 960, preset: window.univerAPI.Enum.SlidePageSizePresetEnum.Custom })
```

### 4. Return the deck to 16:9

The explicit portrait opening page remains portrait.

```ts
window.univerAPI.getActivePresentation().setPageSize({ width: 960, height: 540, preset: window.univerAPI.Enum.SlidePageSizePresetEnum.WideScreen16By9 })
```

### 5. Clear a page override

The registered native command has an omitted pageSize to restore inheritance. No custom override-removal mutation is used.

```ts
window.univerAPI.syncExecuteCommand('slide.command.set-slide-page-size', { unitId: window.univerAPI.getActivePresentation().getId(), pageId: 'opening' })
```

### 6. Custom page dimensions

An 800 × 600 override leaves owned content unchanged; it is not an automatic layout engine.

```ts
window.univerAPI.getActivePresentation().getSlideById('opening').setPageSize({ width: 800, height: 600, preset: window.univerAPI.Enum.SlidePageSizePresetEnum.Custom })
```

### 7. Viewport zoom / not document size

This native operation changes viewing scale only. Use the native zoom control for Fit; no extra host Fit button duplicates it.

```ts
window.univerAPI.syncExecuteCommand('slide.operation.set-zoom-ratio', { unitId: window.univerAPI.getActivePresentation().getId(), zoomRatio: 0.5 })
```

### 8. Prepare a wide opening page

Select its stable ID and restore a known source size before scaling.

```ts
const deck = window.univerAPI.getActivePresentation()
deck.setActiveSlide(deck.getSlideById('opening'))
deck.getSlideById('opening').setPageSize({ width: 960, height: 540, preset: window.univerAPI.Enum.SlidePageSizePresetEnum.WideScreen16By9 })
```

### 9. Scale content into 4:3 / explicit host policy

The host computes a uniform scale and centers owned plain text/simple shapes; native commands apply size and drawing changes as two history steps. This is not automatic SDK reflow. All validation happens before mutation. Existing overflow stays outside instead of being clamped. Rich-text/image/group edits are explicitly unsupported by this small example.

```ts
const deck = window.univerAPI.getActivePresentation(), page = deck.getSlideById('opening')
const from = page.getPageSize(), to = { width: 720, height: 540, preset: window.univerAPI.Enum.SlidePageSizePresetEnum.Standard4By3 }
if (![from.width, from.height, to.width, to.height].every(n => Number.isFinite(n) && n > 0)) throw new Error('Invalid dimensions')
const factor = Math.min(to.width / from.width, to.height / from.height)
const dx = (to.width - from.width * factor) / 2, dy = (to.height - from.height * factor) / 2
const elements = Object.values(deck.save().slides.opening.elements).map(element => {
  const kind = window.univerAPI.Enum.SlidePageElementTypeEnum
  if (element.type !== kind.Text && element.type !== kind.Shape) throw new Error('Only plain text and simple shapes are supported')
  if (element.type === kind.Text && (element.textData || !element.textStyle?.fontSize)) throw new Error('Rich text requires a document-aware scaler')
  if (element.type === kind.Shape && element.shapeData.shapeText) {
    const label = element.shapeData.shapeText
    if (label.dataModel?.doc || label.isRichText !== false || !label.fontSize) throw new Error('Rich shape text requires a document-aware scaler')
  }
  const copy = structuredClone(element), t = copy.transform
  if (![t.left, t.top, t.width, t.height].every(n => typeof n === 'number' && Number.isFinite(n))) throw new Error('Incomplete geometry')
  t.left = t.left * factor + dx
  t.top = t.top * factor + dy
  t.width *= factor
  t.height *= factor
  if (copy.type === kind.Text) copy.textStyle.fontSize *= factor
  if (copy.type === kind.Shape && copy.shapeData.shapeText) copy.shapeData.shapeText.fontSize *= factor
  return copy
})
page.setPageSize(to)
if (!window.univerAPI.syncExecuteCommand('slide.command.update-drawing', { patches: elements.map(element => ({ unitId: deck.getId(), subUnitId: 'opening', drawingId: element.id, element })) })) throw new Error('Drawing update failed after the size change; use native Undo')
```

### 10. Undo drawing scale

One native Undo restores owned geometry; the page remains 4:3.

```ts
await window.univerAPI.undo()
```

### 11. Undo page size

The next Undo restores the wide boundary. Navigation also has native history; do not switch pages between these two steps.

```ts
await window.univerAPI.undo()
```

### 12. Redo page size

Restore 4:3 before restoring scaled content.

```ts
await window.univerAPI.redo()
```

### 13. Redo drawing scale

Restore the exact scaled elements through native history.

```ts
await window.univerAPI.redo()
```

### 14. Reject zero width

The native command should return false and preserve the full snapshot. No host replacement value is substituted.

```ts
window.rivetInvalidAccepted = window.univerAPI.syncExecuteCommand('slide.command.set-slide-page-size', { unitId: window.univerAPI.getActivePresentation().getId(), pageSize: { width: 0, height: 540 } })
```

### 15. Restore original opening geometry

```ts
const deck = window.univerAPI.getActivePresentation()
window.univerAPI.syncExecuteCommand('slide.command.update-drawing', { patches: Object.values(window.rivetCheckpoint.slides.opening.elements).map(element => ({ unitId: deck.getId(), subUnitId: 'opening', drawingId: element.id, element: structuredClone(element) })) })
```

### 16. Restore the original opening boundary

With original geometry, the negative, right/bottom, touching-edge and rotated markers again have their authored positions.

```ts
window.univerAPI.getActivePresentation().getSlideById('opening').setPageSize({ width: 960, height: 540, preset: window.univerAPI.Enum.SlidePageSizePresetEnum.WideScreen16By9 })
```

### 17. Zero pages

```ts
const deck = window.univerAPI.getActivePresentation()
for (const id of [...deck.save().slideOrder]) deck.deleteSlide(deck.getSlideById(id))
```

### 18. Set a size without an active page

An empty presentation can retain a default 600 × 600 size.

```ts
window.univerAPI.getActivePresentation().setPageSize({ width: 600, height: 600, preset: window.univerAPI.Enum.SlidePageSizePresetEnum.Custom })
```

### 19. Unit-only reconstruction / known failing continuous flow

Recreate with a new root ID, preserving authored content but resetting history. This is not Undo, and full native rendering after reload is a separate gate.

The full sequence above currently restores the model but can leave the main canvas absent. This snippet records that native limitation; use the full-owner integration below for a separately tested reconstruction path. A simple fresh-owner delete/create probe does not reproduce the entire sequence.

```ts
window.univerAPI.disposeUnit(window.univerAPI.getActivePresentation().getId())
window.univerAPI.createPresentation({ ...structuredClone(window.rivetCheckpoint), id: 'rivet-restored' })
```

### 20. Save and inspect

The snapshot contains actual native sizes, geometry, masters, layouts and notes. It is not a separate audit-panel model.

```ts
window.rivetSaved = structuredClone(window.univerAPI.getActivePresentation().save())
```

## Reconstruct the complete editor from saved data

Run this integration in the entry module, using its imported `createDemo`, original `container` and mutable `demo` handle. It saves the current edited deck, not starter data; use the detached `window.rivetCheckpoint` instead of the first expression when recovering from the zero-page exercise. Snapshot reconstruction resets session history and is not an Undo or a PPTX import/export operation.

```js
const saved = JSON.parse(JSON.stringify(demo.univerAPI.getActivePresentation().save()))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
await demo.ready
if (container.querySelector('[data-error]')) throw new Error('Restored editor did not become ready')
```

The factory retains snapshot identities, page overrides, edited text, masters, layouts and notes. It also accepts a genuinely empty deck rather than replacing it with the eight-page gallery. The SDK retains a stale activeSlideId after deleting every page, then removes that field on reconstruction; the strict empty-deck full-snapshot gate therefore remains failing. Structural page/default-size checks run before mounting; this is not an untrusted-file validator. Readiness waits for the native canvas (or an empty deck) and absence of the startup skeleton, with a bounded timeout. Disposal cancels pending readiness and unmounts the UI before releasing the owned unit and SDK. No custom restore button, alternate renderer or SDK patch is used.

## Verification evidence

To include full-owner reconstruction gates, run with `SHOWCASE_BUILD_STANDALONE=1` and set `SHOWCASE_VITE_DIRECTORY` to an installed Vite directory matching the exported version (or reuse this case's installed `SHOWCASE_EXPORT_DIRECTORY`). The harness builds this case only on port 4374 and closes it afterward. Its factory globals exist only in test HTML; exported production code adds no debug panel or helper API.

### Earlier baseline

Full menu, rich-text scaling/rejection variants, mobile/accessibility/performance and lifecycle-timeout acceptance remain outstanding. This selected build is still large; successful loading is not performance acceptance. No backend, printing/conversion guarantee or collaboration history is provided by this case.
