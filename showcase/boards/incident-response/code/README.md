# Payments incident response

Native UI, demo labels and authored data are English-only, including on Chinese documentation pages. Legacy locale arguments are ignored; saved-snapshot argument positions are unchanged.

A SEV-1 payment retry storm moves through **Detect → Contain → Recover**. The original three response cards, response frame, two directed free-endpoint connectors and follow-up risk are all visible at startup. The risk concerns 214 duplicate authorizations and a 17:00 UTC deadline. Rounded native Shape text boxes retain their distinct blue, amber, green and red business roles; they are not HTML cards or sticky-note substitutes.

Use native Board tools to select, drag, resize and edit text. There is no host Add Risk, Reset, activity log, hidden-fixture flag or duplicate history editor. The response frame is a native container element, but the cards are not advertised as attached children. Both connectors use **free endpoints**: moving a card does not automatically move those endpoints. Attachment/routing is a separate capability, not silently added here.

## Start and native interaction

In the generated project run `npm install` then `npm run dev`. The documentation target is `/en-US/playground/boards/incident-response`. Drag the Detect card a small distance, observe that the arrow stays in place, and use native Undo/Redo. Double-click a card to edit its text, commit by clicking the empty canvas, then inspect native history. Use the native resize handles on the risk card rather than a host size control.

Preview and export share `createIncidentResponseDemo`, eight official CSS imports and all eight English dependency packs, including Shape Editor, Ink UI and transitive Embed Unit UI. The native runtime is always English. Theme changes call `toggleDarkMode` on the existing owner. `ready` waits up to 20 seconds for the actual Board editor without a skeleton; failure is visible. Disposal is idempotent and removes only this owner's DOM and unit.

## Literal Facade variants

Run the following `ts` snippets in order after the canvas is ready. The dedicated test executes every snippet verbatim, then validates the saved model and painted output. The standard entry exposes `window.univerAPI`; no test-only controls are needed.

### 1. Read the original response structure

```ts
const board = window.univerAPI.getActiveBoard()
console.assert(board.getId() === 'incident-response-board')
console.assert(board.getElementOrder().length === 7)
console.assert(board.getShape('detect').getText().getPlainText().includes('Payment error rate > 8%'))
console.assert(board.getConnectorConnection('detect-contain').start.kind === 'free')
```

### 2. Move the containment card for an alternate review layout

```ts
const board = window.univerAPI.getActiveBoard()
console.assert(board.setElementTransform('contain', { top: 180 }))
console.assert(board.getElementBounds('contain').top === 180)
```

The free arrow stays at y = 220. This intentionally demonstrates the original connection boundary.

### 3. Restore the previous layout with native command history

```ts
const board = window.univerAPI.getActiveBoard()
console.assert(board.undo())
console.assert(board.getElementBounds('contain').top === 150)
```

### 4. Record a substantive follow-up update in the live Shape text

```ts
const board = window.univerAPI.getActiveBoard()
board.getShape('risk-note').getText().setText('RECONCILIATION UPDATE\n193 cleared · 21 authorizations pending\nFinance review by 17:00 UTC')
console.assert(board.getShape('risk-note').getText().getPlainText().includes('193 cleared'))
```

### 5. Give the reconciliation detail a wider native card

```ts
const board = window.univerAPI.getActiveBoard()
console.assert(board.setElementTransform('risk-note', { left: 280, width: 400 }))
console.assert(board.getElementBounds('risk-note').width === 400)
```

### 6. Emphasize the current response transition without changing its endpoints

```ts
const board = window.univerAPI.getActiveBoard()
console.assert(board.setConnectorStyle('contain-recover', { stroke: '#DC2626', strokeWidth: 3 }))
console.assert(board.getConnectorConnection('contain-recover').end.kind === 'free')
```

### 7. Show the original response-path-only variant, then recover the risk

```ts
const board = window.univerAPI.getActiveBoard()
console.assert(board.removeElements(['risk-note']))
console.assert(board.getElementOrder().length === 6)
console.assert(board.undo())
console.assert(board.getElementOrder().includes('risk-note'))
```

The default remains the fuller response-with-risk scene. The test also separately paints and captures the six-element response-only scene before restoring its risk.

### 8. Keep the edited owner during theme changes

```ts
const api = window.univerAPI
const dark = api.isDarkMode()
api.toggleDarkMode(!dark)
console.assert(window.univerAPI === api)
api.toggleDarkMode(dark)
```

### 9. Download the complete Board snapshot as genuine JSON

```ts
const saved = window.univerAPI.getActiveBoard().save()
const url = URL.createObjectURL(new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'payments-incident.board.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 1000)
```

## Complete same-ID owner reconstruction

In generated `/src/index.ts`, `demo`, `container` and `createIncidentResponseDemo` already exist. The standalone test-only harness exposes exactly these bindings. Preserve all pages, IDs, resource data and element properties, not just the visible text. Validate before disposing the live owner; a saved snapshot is accepted only with its ordered pages and active page.

```js
const saved = structuredClone(demo.univerAPI.getActiveBoard().save())
if (!saved.id || !saved.pageOrder?.length || !saved.pageOrder.every(id => saved.pages?.[id]?.id === id) || !saved.pages?.[saved.activePageId]) throw new Error('Invalid Board snapshot')
const locale = demo.univerAPI.getCurrentLocale()
const dark = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createIncidentResponseDemo(container, dark, locale, saved)
await demo.ready
console.assert(demo.univerAPI.getActiveBoard().getId() === saved.id)
```

The restored owner has new local history. Fresh native edits and full raw Undo/Redo must be checked again. A matching screenshot does not prove an identical snapshot; do not normalize IDs, styles, resources or layout to hide differences.

## Maintainer checks

### Retained native acceptance gap

The independent run passes **8 of 9 gates, with 27 checks**, zero browser errors/warnings and zero backend requests. Actual pointer movement, the native resize handle, response-only and reconciliation variants, full same-ID owner restoration, fresh-owner pointer Undo/Redo, seven full EN/ZH packs/CSS, themes and lifecycle all pass. The nine `ts` literals and the reconstruction `js` literal execute against the same factory; the JSON download is compared in full.

Native multiline text replacement remains **strict FAIL**: after double-clicking the risk card, pressing Ctrl+A and typing three lines with actual Enter keys, the old `FOLLOW-UP RISK` first line remains above the replacement. One native Undo restores only part of the editing session, not its initial whole snapshot; 46 differences remain across the native `pages` and `slides` representations (text/paragraphs, internal document ID, rendering configuration, transform and parent attachment). The subsequent Redo matches the edited snapshot exactly. This does not claim that an entire multiline session is one SDK history transaction, nor that the full selection/replacement requirement has passed. No fields or IDs are normalized. The earlier bulk-insert multiline run is retained separately and does not replace the actual-Enter evidence.

The default test target is `http://localhost:3030/en-US/playground/boards/incident-response`; `SHOWCASE_BASE_URL` or `SHOWCASE_DEMO_URL` can override it. Full owner lifecycle and the reconstruction literal require the standalone test-only harness. Normal export has no harness globals or panels.

Only this selected case is built, with exact-version per-package junctions and no installation. The Vite path must point to the exact version declared in the generated package; no other demo's temporary output is required. The script closes its own selected port (4416 by default) and writes a source export manifest, actual screenshots, complete model comparisons and strict failures. These acceptance scripts run from the documentation repository; the standalone exported demo uses its own package install and dev scripts. No HTTP service or SDK patch is used.
