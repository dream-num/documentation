# Northstar / Quarterly Business Review

The runtime is English-only on every host page. Complete official English SDK packs
and styles are retained. A legacy locale argument, where present, is ignored without
shifting the saved-snapshot argument.

Eight original fictional leadership pages: scorecard, regional comparison, revenue movement,
retention, pipeline, operating rhythm, risks and decisions. Deep Ocean navy, teal, lilac and
warm paper separate the narrative sections. Original revenue 43.8, target 45.0, retention
94.2% and pipeline 61.4 are retained.

Use the native Grid ribbon, slide list and Speaker notes. There is no external control
panel, hidden one-shot target flag or reset button. Preview and standalone use the same
factory, five official CSS files and five complete English locale packs. Theme changes
toggle the existing owner, preserving edits.

## Literal Facade examples

Run in sequence in the demo frame. These are authored shapes, not Formula Shapes or
native Chart series. Changing one label does not calculate another label or resize a bar.

### 1. Revise the target and its explanatory gap

```ts
window.univerAPI.getPresentation('qbr-fy2027-q2').getSlideById('scorecard').getElementById('target').getText().setText('$46.5M\nRevenue target')
window.univerAPI.getPresentation('qbr-fy2027-q2').getSlideById('scorecard').getElementById('gap').getText().setText('Target gap: $2.7M')
```

### 2. Explain the changed assumption

```ts
window.univerAPI.getPresentation('qbr-fy2027-q2').getSlideById('scorecard').setSpeakerNotes('Revised target $46.5M; actual $43.8M; gap $2.7M. Both labels were explicitly edited.')
```

### 3. Navigate without a custom host button

```ts
window.univerAPI.getPresentation('qbr-fy2027-q2').setActiveSlide(window.univerAPI.getPresentation('qbr-fy2027-q2').getSlideById('regions'))
```

### 4. Move an authored comparison bar

This changes layout, not the regional revenue. Keep labels and geometry conceptually separate.

```ts
window.univerAPI.getPresentation('qbr-fy2027-q2').getSlideById('regions').getElementById('north-america-bar').setTransform({ left: 310, top: 264 })
```

### 5. Record the leadership decision

```ts
window.univerAPI.getPresentation('qbr-fy2027-q2').getSlideById('decision').setSpeakerNotes('Rowan: protect renewals and approve targeted onboarding coverage. Recheck pipeline timing in September.')
window.univerAPI.getPresentation('qbr-fy2027-q2').setActiveSlide(window.univerAPI.getPresentation('qbr-fy2027-q2').getSlideById('decision'))
```

### 6. Save the complete presentation

```ts
window.northstarSaved = window.univerAPI.getPresentation('qbr-fy2027-q2').save()
```

### 7. Restore through the exported factory

Application integration, not a built-in import-format converter. Retain your controller,
dispose it, then pass the saved SDK model as the fourth argument. The stable ID is retained.
Save/recreate does not promise to restore the previous owner's Undo stack.

```js
import { createQuarterlyBusinessReviewDemo } from './src/create-demo'
const container = document.getElementById('app')
let controller = createQuarterlyBusinessReviewDemo(container)
await controller.ready
const saved = controller.univerAPI.getPresentation('qbr-fy2027-q2').save()
controller.dispose()
controller = createQuarterlyBusinessReviewDemo(container, false, undefined, saved)
await controller.ready
```

## Verification boundary

Known focus boundary: immediately after saving in Speaker notes, Ctrl+Z/Y does not
route to presentation history. Select a native slide shape before using slide-history
shortcuts; the corresponding complete notes Undo/Redo passes. This is not absent notes
history and no custom history control or focus workaround is added to the demo.

No Formula, binary Exchange, native Chart, collaboration, mobile or exhaustive keyboard
acceptance is claimed. Regional bars and pipeline bands are editable native shapes. Quarterly movement
40.8 + 2.4 + 1.8 - 1.2 = 43.8 is separate from the target shortfall.
