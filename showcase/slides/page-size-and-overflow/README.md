# Rivet / Page Size and Overflow

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

Preview and export share the same factory, five official SDK stylesheets and five EN/ZH locale packs. The initial UI language follows page lang; authored content stays English. Grid is the default ribbon. Theme changes retain the same editor and model. No fixture, duplicated edit/Undo controls, status explanation card, or audit panel is added; startup errors alone show an alert.

Native no-fill/no-line text-box shapes replace legacy white Text boxes. Eight authored page backgrounds alternate deep ocean, cream, mint and coral; narrow accent rules leave the content open. Text color and fill are SDK data, with native centered text layout and no CSS overrides. Size comparisons and all five geometry markers are unchanged.

## Twenty literal Facade variants

Run in order in the preview-frame or standalone console. All mutations use real Facades or registered native commands; keep the deck focused for Undo/Redo. The scale calculation is explicitly host geometry policy, not a claimed native automatic reflow.

### 1. Capture the complete deck

Start on a fresh page. The detached checkpoint contains eight original pages and inherited master/layout content.

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

The real drawing command restores the owned elements from the checkpoint; inherited master content is not copied into the page.

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

Destructively remove this fictional deck's pages; the checkpoint above supports recovery. The presentation still owns a default page size.

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

Current selected evidence: `test-results/rivet-size-recovery-verified/report.json` passes 23 of 25 gates. The exact full-owner recipe restores the original checkpoint after the failing unit-only sequence, with native navigation and actual render objects on all eight pages. Edited content and an 800 × 600 override, a deliberately deleted page and Chinese dark mode each survive exact full-snapshot reconstruction; fresh native text edits and exact Undo/Redo work on each restored nonempty deck. Six invalid page/default-size snapshots leave the current owner intact, and disposal before readiness cancels the pending mount. The empty deck stays empty and usable, but its stale activeSlideId is removed by the SDK. The two retained strict failures are unit-only canvas attachment and that empty-deck serialization difference. No normalization hides either failure.

The first recovery probes clicked/typed before the native shape editor had mounted; waiting for the editor paint boundary fixes those test input failures. Empty-deck validation now permits the SDK's stale active ID instead of rejecting its own saved output. These are integration/test corrections, not SDK patches. No browser errors or backend requests were observed in the current run. Independent production export at `test-results/rivet-size-recovery-export-ui/report.json` passes nine-file source parity, all five official CSS imports, native white workbench and absence of the startup skeleton. This is selected export evidence, not a fresh dependency-install or delivery-performance test.

To include full-owner reconstruction gates, run with `SHOWCASE_BUILD_STANDALONE=1` and set `SHOWCASE_VITE_DIRECTORY` to an installed Vite directory matching the exported version (or reuse this case's installed `SHOWCASE_EXPORT_DIRECTORY`). The harness builds this case only on port 4374 and closes it afterward. Its factory globals exist only in test HTML; exported production code adds no debug panel or helper API.

### Earlier baseline

Run `node scripts/test-slides-size-native.mjs` against the default `http://localhost:3030/en-US/playground/slides/page-size-and-overflow`, or set `SHOWCASE_DEMO_URL` to the selected standalone URL; `SHOWCASE_BASE_URL` overrides the documentation origin.

The selected report at `test-results/rivet-size-native-visual/report.json` is strictly failing, not complete acceptance. It reads the actual SDK render objects (not only saved dimensions) and passes native navigation of all eight pages, inherited/explicit/custom size changes, all five boundary-marker cases including rotation, native scaled frames, two-step size/drawing Undo and Redo, invalid-size rejection, empty-deck sizing, real pointer/keyboard text editing with full-snapshot Undo/Redo, five complete EN/ZH locale packs, edited-model theme preservation and disposal. All twenty snippets execute; no backend request or runtime error was observed. Native Undo requires focus on the slide canvas; a console mutation or thumbnail click alone is not treated as proof of focus.

One strict gate remains: a checkpoint reconstructed under a new root ID matches the saved data but fails to remount the main canvas within the tested twelve-second timeout. Native text-box shapes now pass the full edit/Undo/Redo snapshot gate; the earlier legacy Text result does not certify other element types. No resource normalization, fabricated render, manual history cleanup or SDK patch hides the remaining failure. The independent text-edit gate runs on a fresh browser owner after the reconstruction gate, so one failure cannot obscure another.

Full menu, rich-text scaling/rejection variants, mobile/accessibility/performance and lifecycle-timeout acceptance remain outstanding. This selected build is still large; successful loading is not performance acceptance. No backend, printing/conversion guarantee or collaboration history is provided by this case.
