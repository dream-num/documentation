# Cobalt / Slide order and host section metadata

The runtime is English-only on every host page. Complete official English SDK packs
and styles are retained. A legacy locale argument, where present, is ignored without
shifting the saved-snapshot argument. EN/ZH reports below are historical evidence
from before this language change, not current bilingual-runtime acceptance.

Eight original fictional street-shade briefing pages cover 12 sites, 84 trees,
planting stages, paired temperature observations, a resident quote and a decision.
The figures are illustrative, not evidence of a causal effect.

Use native thumbnails to navigate and drag pages. Context menus, keyboard navigation
and Undo/Redo belong to the SDK; no host ordering, fixture, navigation or audit panel
is added. Page titles are editable slide content, not section controls.

## Sections are host metadata, not native SDK sections

`page.custom.sectionId` tags Context, Roadmap, Review and Decision. These tags do not
create native headings, folding or atomic section history. The exported `sections`
and `sectionOrder` helpers derive membership from the current snapshot and calculate
an ordinary sequence of page IDs. Every page move is a separate SDK command.

## Executable Facade examples

Run the numbered blocks sequentially in the preview console. They use the live
`window.univerAPI`; no hidden action handlers are needed. The export exposes the same API.
Positions are zero-based unless explicitly converted.
Before running them, click once in the native slide canvas to focus its document.
The Facade `undo()` and `redo()` target the currently focused document; selecting a
thumbnail alone does not establish this focus in the tested SDK build.

### 1. Open Planting by stable ID

```ts
const deck = window.univerAPI.getPresentation('cobalt-deck')
deck.setActiveSlide(deck.getSlideById('planting'))
```

### 2. Move one position earlier

```ts
const deck = window.univerAPI.getPresentation('cobalt-deck')
const index = deck.save().slideOrder.indexOf('planting')
if (index > 0) deck.moveSlide(deck.getSlideById('planting'), index - 1)
```

### 3. Move one position later

```ts
const deck = window.univerAPI.getPresentation('cobalt-deck')
const index = deck.save().slideOrder.indexOf('planting')
if (index >= 0 && index < deck.getSlides().length - 1) deck.moveSlide(deck.getSlideById('planting'), index + 1)
```

### 4. Lead with the decision

```ts
const deck = window.univerAPI.getPresentation('cobalt-deck')
deck.moveSlide(deck.getSlideById('decision'), 0)
```

### 5. Return the decision to the end

```ts
const deck = window.univerAPI.getPresentation('cobalt-deck')
deck.moveSlide(deck.getSlideById('decision'), deck.getSlides().length - 1)
```

### 6. Validate a one-based position before moving

```ts
const deck = window.univerAPI.getPresentation('cobalt-deck')
const position = 3
if (!Number.isInteger(position) || position < 1 || position > deck.getSlides().length) {
  throw new Error('Choose a whole-number position inside the deck.')
}
deck.moveSlide(deck.getSlideById('planting'), position - 1)
```

### 7. Gather tagged Review pages before Roadmap

Preserve the members' current relative order, even when an earlier page move split
the group. This is a sequence of SDK page moves, not an atomic section operation.

```ts
const deck = window.univerAPI.getPresentation('cobalt-deck')
const data = deck.save()
const members = data.slideOrder.filter((id) => data.slides[id].custom?.sectionId === 'review')
const remainder = data.slideOrder.filter((id) => !members.includes(id))
const before = remainder.findIndex((id) => data.slides[id].custom?.sectionId === 'roadmap')
if (!members.length || before < 0) throw new Error('Both host groups must contain pages.')
const desired = [...remainder.slice(0, before), ...members, ...remainder.slice(before)]
window.cobaltMoves = 0
for (const [index, id] of desired.entries()) {
  if (deck.save().slideOrder[index] !== id) {
    if (!deck.moveSlide(deck.getSlideById(id), index)) throw new Error('SDK rejected a page move.')
    window.cobaltMoves++
  }
}
```

### 8. Undo the last command only

```ts
if (!(await window.univerAPI.undo())) throw new Error('Focus the native slide canvas before undoing.')
```

### 9. Redo that command

```ts
if (!(await window.univerAPI.redo())) throw new Error('Focus the native slide canvas before redoing.')
```

### 10. Split a host group without changing tags

```ts
const deck = window.univerAPI.getPresentation('cobalt-deck')
deck.moveSlide(deck.getSlideById('observations'), deck.getSlides().length - 1)
```

### 11. Save the complete reordered deck

```ts
window.cobaltCheckpoint = structuredClone(window.univerAPI.getPresentation('cobalt-deck').save())
```

### 12. Edit the live title after capture

This later edit must not mutate the saved checkpoint.

```ts
window.univerAPI.getPresentation('cobalt-deck').getSlideById('decision').getElementById('title').getText().setText('Decision / review before expanding')
```

## Restore through the same exported factory

In `src/index.ts`, import `validateSnapshot` alongside `createDemo`. `checkpoint` is
the complete saved copy. Validate before disposing the live owner; this structural
guard covers this example's SDK snapshots, not arbitrary untrusted uploads.

```js
const restored = structuredClone(checkpoint)
validateSnapshot(restored)
const darkMode = demo.univerAPI.isDarkMode()
const locale = demo.univerAPI.getCurrentLocale()
demo.dispose()
demo = createDemo(container, darkMode, locale, restored)
await demo.ready
if (container.querySelector('.slide-order[data-error]')) throw new Error('The restored editor did not start.')
```

The owner and unit are genuinely replaced with the same ID and complete page content,
notes, tags, master/layout references and active-page state. History starts a new
session. Theme changes call `toggleDarkMode` on the existing owner and retain edits.

## Startup variants and boundaries

In the factory, change the default `createData()` to `createData('review-first')`,
`createData('repeated-names')`, `createData('single')` or `createData('empty')`.
The first changes order only; repeated navigation names retain distinct IDs. Treat
single-page endpoint moves as host no-ops. Empty means zero pages, not a hidden
starter slide. `sectionOrder` rejects identical or absent host groups before any
commands. Keep position validation in applications: arbitrary invalid positions are
not assumed to be rejected by the SDK.

## Source and acceptance

Preview and export share the factory and all five official stylesheets. Complete
Design, UI, Docs UI, Shape Editor UI and Slides UI packs cover English;
the editor locale is independent of the host document language. No sibling demo is a runtime
dependency. Native Pro licensing watermarks remain without a license.

The selected native test completes 78 checks with **13/16 gates PASS** and three
strictly failed gates. All eight authored pages were visually inspected, including
notes and transparent native text; the full reordered snapshot survives a real
owner replacement without dropping or normalizing fields. All twelve literal
examples pass with the stated canvas-focus prerequisite. Fresh native text input
and exact full-model keyboard Undo/Redo after restoration also pass. All five startup
variants, SDK-produced empty recovery, complete locales, same-owner themes, invalid
input before disposal and pre-ready disposal pass. No runtime errors, warnings or
backend requests were recorded.

| Original acceptance | Result and boundary |
| --- | --- |
| Native drag order, content and paint | PASS; Context moves before Opening with unchanged page content. |
| Keyboard Undo immediately after thumbnail drag | FAIL; order stays moved while the native canvas has not focused the document. |
| Thumbnail Enter / Space navigation | FAIL; installed beta.2 thumbnail nodes have no role or tabindex and cannot receive keyboard focus. No host tabindex or keyboard handlers are injected. |
| Context-menu Delete then keyboard Undo | Delete succeeds; Undo FAILS before canvas focus and the deleted page stays absent. |
| Native toolbar history after real canvas click | PASS; the initially disabled Undo button becomes enabled, and complete snapshots match after Undo/Redo. This does not override the thumbnail-only failure. |
| Host-tag grouping | PASS through individual page commands; not native sections or atomic group history. |

Failure models, screenshots, every literal's before/after snapshot and independent
owner comparisons are retained in `test-results/slides-cobalt-order-native-final`.
These results cover the listed workflows, not every SDK menu, arbitrary imported
resources, accessibility, mobile behavior or delivery performance. Native section
UI, folding and atomic section history remain outside the SDK capability claimed here.

## Maintainer verification

From the documentation repository, `node scripts/test-slides-cobalt-order-native.mjs`
defaults to `http://localhost:3030/en-US/playground/slides/reorder-and-sections`.
Set `SHOWCASE_DEMO_URL` for an exact target or `SHOWCASE_BASE_URL` for another guide
origin. Owner reconstruction and startup variants require the standalone test-only
harness; its factory handles are not shipped as a host panel.

Build only this case in PowerShell using an existing exact Vite 8.2.2 installation:

```powershell
$env:SHOWCASE_BUILD_STANDALONE = '1'
$env:SHOWCASE_VITE_DIRECTORY = '<installed Vite 8.2.2 package directory>'
$env:SHOWCASE_RESULTS_DIR = 'test-results/slides-cobalt-order-native-final'
node scripts/test-slides-cobalt-order-native.mjs
Remove-Item Env:SHOWCASE_BUILD_STANDALONE
Remove-Item Env:SHOWCASE_VITE_DIRECTORY
Remove-Item Env:SHOWCASE_RESULTS_DIR
```

The test reserves port 4394 and closes its own service. A strict failed gate returns
exit code 1. `exports.json` records the standalone directory; `linked-versions.json`
records individual exact-version package links. Set `SHOWCASE_EXPORT_DIRECTORY` to
reuse that directory. No sibling demo report or whole node_modules link is needed.
Check the ordinary exported entry separately from the test-only harness:

```powershell
$selectedExport = (Get-Content test-results/slides-cobalt-order-native-final/exports.json -Raw | ConvertFrom-Json)[0].directory
Push-Location $selectedExport
node node_modules/vite/bin/vite.js build
Pop-Location
$env:SHOWCASE_EXPORT_PORT = '4394'
$env:SHOWCASE_RESULTS_DIR = 'test-results/slides-cobalt-order-native-export-ui'
node scripts/test-showcase-export-ui.mjs test-results/slides-cobalt-order-native-final/exports.json
Remove-Item Env:SHOWCASE_EXPORT_PORT
Remove-Item Env:SHOWCASE_RESULTS_DIR
```
