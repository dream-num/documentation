# Harbor — page size, orientation, and margins

The fictional Harbor Field Guide keeps its fourteen original paragraphs: arrival, fog and visibility, visitor handover, supplies, departure, and publication. Four startup datasets use exactly the same narrative: A4 portrait (794 × 1123), A4 landscape (1123 × 794), US Letter (816 × 1056), and a compact field guide (560 × 720). Dimensions and margins are nominal 96-DPI layout pixels, not millimetres.

The preview contains only Univer's native Grid ribbon and paginated document. Use its Start ribbon → Page setup to change paper and margins; click the paper to type, and use native Undo/Redo. There is no second host editor, fixture selector, inspector, or history toolbar. The installed native dialog has no orientation or arbitrary width/height controls: landscape and compact custom sizes are available through the tested Facade examples and startup data. Its “Custom Paper size” label currently describes the four margin inputs, not custom dimensions. Browser/printer margins, mirrored margins, mixed-section geometry, and format conversion are not claimed.

## Literal Facade examples

Run these blocks in order in the browser console of the running demo. Each block is independently scoped. They use the public Facade, not an alternate renderer. Click the native document before using keyboard shortcuts. The section setter changes explicit section geometry; the native dialog changes document defaults. Both are real SDK capabilities, but a section override can take precedence over a later document-default change.

### 1. Read resolved geometry

```ts
const doc = window.univerAPI.getActiveDocument()
if (!doc?.isTraditional()) throw new Error('Open the Harbor traditional document.')
const section = doc.getSection(0)
if (!section) throw new Error('The first section is missing.')
console.log(section.getPageSetup(), section.getEffectivePageSetup())
```

### 2. A4 landscape

```ts
const api = window.univerAPI
if (!api.getActiveDocument().getSection(0).setPageSetup({
  pageSize: { width: 1123, height: 794 }, pageOrient: 1, // PageOrientType.LANDSCAPE
})) throw new Error('Landscape was not applied.')
```

### 3. US Letter portrait

```ts
const api = window.univerAPI
if (!api.getActiveDocument().getSection(0).setPageSetup({
  pageSize: { width: 816, height: 1056 }, pageOrient: 0, // PageOrientType.PORTRAIT
})) throw new Error('Letter was not applied.')
```

### 4. Compact field guide

```ts
const api = window.univerAPI
if (!api.getActiveDocument().getSection(0).setPageSetup({
  pageSize: { width: 560, height: 720 }, pageOrient: 0, // PageOrientType.PORTRAIT
})) throw new Error('Custom paper was not applied.')
```

### 5. Asymmetric binding space

```ts
const section = window.univerAPI.getActiveDocument().getSection(0)
if (!section.setPageSetup({ marginTop: 50, marginBottom: 60, marginLeft: 90, marginRight: 40 }))
  throw new Error('Asymmetric margins were not applied.')
```

### 6. Wide annotation margins

```ts
const section = window.univerAPI.getActiveDocument().getSection(0)
if (!section.setPageSetup({ marginTop: 96, marginBottom: 96, marginLeft: 120, marginRight: 120 }))
  throw new Error('Annotation margins were not applied.')
```

### 7. Document-scoped undo

The installed SDK returns success here, but the strict test currently finds the previous four margins are not restored. This executable example deliberately retains that failure; inspect the resulting model, not just the boolean.

```ts
if (!window.univerAPI.getActiveDocument().undo()) throw new Error('Undo was not applied.')
```

### 8. Document-scoped redo

```ts
if (!window.univerAPI.getActiveDocument().redo()) throw new Error('Redo was not applied.')
```

### 9. Reject an invalid content area before calling the SDK

This is an application-side guard, not a claim that the SDK rejects every invalid Facade input.

```ts
const doc = window.univerAPI.getActiveDocument()
const section = doc.getSection(0)
const { pageSize } = section.getEffectivePageSetup()
const margins = { marginTop: 50, marginBottom: 50, marginLeft: 500, marginRight: 500 }
const valid = Object.values(margins).every(value => Number.isFinite(value) && value >= 0)
  && margins.marginLeft + margins.marginRight < pageSize.width
  && margins.marginTop + margins.marginBottom < pageSize.height
if (valid) throw new Error('This demonstration must reject its invalid input.')
console.log('Rejected before mutation: the margins leave no positive content width.')
```

### 10. Return to A4 portrait

```ts
const api = window.univerAPI
if (!api.getActiveDocument().getSection(0).setPageSetup({
  pageSize: { width: 794, height: 1123 }, pageOrient: 0, // PageOrientType.PORTRAIT
  marginTop: 72, marginBottom: 72, marginLeft: 72, marginRight: 72,
})) throw new Error('A4 was not applied.')
```

### 11. Edit the narrative without replacing the document

```ts
const paragraph = window.univerAPI.getActiveDocument().getParagraphs()
  .find(item => item.getText().includes('Departure record'))
if (!paragraph?.setText('Departure record — reviewed at the east quay'))
  throw new Error('The departure heading was not updated.')
```

### 12. Preserve the complete checkpoint

```ts
const doc = window.univerAPI.getActiveDocument()
window.harborCheckpoint = structuredClone(doc.save())
if (window.harborCheckpoint.id !== doc.getId()) throw new Error('The owner ID changed.')
console.log(window.harborCheckpoint)
```

## Full owner recovery

In the exported application's `src/index.ts`, import `validateSnapshot` alongside `createDemo`, then execute this recipe after `demo.ready`. The standalone test provides the same bindings. Validation happens before disposal; do not rewrite IDs, paragraph/section IDs, resources, styles, or layout fields to make a comparison pass.

```js
const saved = structuredClone(window.harborCheckpoint ?? demo.univerAPI.getActiveDocument().save())
validateSnapshot(saved)
const darkMode = demo.univerAPI.isDarkMode()
const locale = demo.univerAPI.getCurrentLocale()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
await demo.ready
if (demo.univerAPI.getActiveDocument().getId() !== saved.id) throw new Error('The restored owner ID changed.')
```

Production preview and standalone export use the same factory, data, complete Docs Core EN/ZH locale packs, and official preset CSS. Initial locale follows `document.documentElement.lang`. Theme changes call `toggleDarkMode` on the existing owner and do not recreate it. `ready` signals native canvas availability; it is not a guarantee that every page has been painted.

## Run and verify

The dedicated test defaults to the documentation guide at `http://localhost:3030/en-US/playground/docs-traditional/page-setup`. `SHOWCASE_DEMO_URL` overrides it; `SHOWCASE_BASE_URL` changes only the guide origin. Full lifecycle checks require the standalone harness, not extra hooks in the shipped preview.

PowerShell, from the documentation repository:

```powershell
$env:SHOWCASE_BUILD_STANDALONE = '1'
$env:SHOWCASE_VITE_DIRECTORY = 'C:/Users/wbfsa/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
$env:SHOWCASE_RESULTS_DIR = 'test-results/harbor-page-setup-native'
node scripts/test-docs-harbor-page-setup-native.mjs
Remove-Item Env:SHOWCASE_RESULTS_DIR
```

Only this case is exported and built, on strict port 4406. Exact installed packages are linked individually into its own export directory; no SDK patches, installs, backend calls, or whole dependency-directory links are needed. The report retains complete snapshot differences and native failures. Read the current report before claiming all acceptance criteria pass.

## Retained acceptance gaps

The native orientation control gate remains **FAIL** because the installed SDK does not expose that control. No host substitute is added. Real native Letter selection, four margin inputs, confirmation, document geometry, and toolbar Undo/Redo are checked separately.

All twelve TS examples and the full-recovery JS recipe execute, but the literal-example gate remains **FAIL** on exact margin Undo: example 7 returns true while section margins stay at 96/96/120/120 instead of reverting to 50/60/90/40. The four unchanged fields are retained in `literal-margin-undo.json`. Redo matches the annotation snapshot, but that does not make the failed Undo pass.

The original native typing history gate remains **FAIL** under full-model equality: Undo restores the text but adds absent `body.customRanges`, `body.customDecorations`, and `body.customBlocks` as empty arrays; Redo adds `body.customBlocks`. These fields are deliberately not removed or prefilled to hide the difference. The report saves both complete snapshots and every difference. This is separate from full saved-owner recovery and subsequent fresh-edit history, which can pass after the SDK has already materialized those fields. Resource equality covers the complete saved `resources` array (empty in this text-only story); this case does not prove external-image resource recovery.
