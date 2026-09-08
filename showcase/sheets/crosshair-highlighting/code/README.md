# Oriole / Native reading bands

Native UI and authored data are English-only. Earlier bilingual/native reports below are historical evidence, not acceptance of this migration.

Use View > Crosshair Highlight for the native toggle and sixteen color/opacity
presets. Click or drag cells and use native sheet tabs; no external controls are
needed. Original small schedules and formulas remain unchanged. Two official CSS
imports and complete core/crosshair English packs ship with the shared factory.
Theme changes retain the current owner and edits.

Run these exact snippets inside the preview or standalone page.

## Disable and enable without writing cell backgrounds

```ts
window.univerAPI.setCrosshairHighlightEnabled(false)
```

```ts
window.univerAPI.setCrosshairHighlightEnabled(true)
```

## Rectangular selection

```ts
window.univerAPI.getWorkbook('oriole-rehearsals').getActiveSheet().getRange('C4:E6').activate()
```

Try merged A11:B11, A1, H24, 4:4 and C:C with the same API. After activating the
last cell, use native scrolling or `scrollToCell(20, 5, 0)`. Whole-row/column selections
suppress native bands. This is not a reason to draw a host overlay.

## Observe actual SDK notifications

```ts
window.crosshairEvents = []
window.crosshairSubscription = window.univerAPI.addEvent(
  window.univerAPI.Event.CrosshairHighlightEnabledChanged,
  ({ enabled }) => window.crosshairEvents.push(enabled),
)
```

beta.2 can enable via the palette without delivering EnabledChanged. Read
`getCrosshairHighlightEnabled()` for current state; do not fabricate notifications.
The Facade has no color or opacity setter. The native palette remains the UI.

```ts
window.crosshairSubscription.dispose()
```

## Same-ID workbook reload

```ts
const api = window.univerAPI
const workbook = api.getWorkbook('oriole-rehearsals')
const saved = structuredClone(workbook.save())
api.disposeUnit(workbook.getId())
api.createWorkbook(saved)
```

This intentionally clears unit history, not instance-level palette/enabled state.
It preserves the original workbook ID. A snapshot is not durable storage or XLSX.
New owners initialize default bands; workbook JSON alone cannot restore the palette.
The exported factory accepts `createDemo(container, darkMode, saved)` for a new
owner. It validates the original workbook/sheet IDs and positive dimensions before
creating any DOM or owner, then passes a clone to the SDK without rewriting fields.
Dispose the previous controller first. This is not a full-fidelity recovery claim:
beta.2 changes the defined-name resource from an empty string to `'{}'` on new-owner
reconstruction. Same-owner unit reload is checked separately and retains the full
raw snapshot and current palette.
For a header-only source variant, use `createFixture(true)` in the factory instead
of `createFixture()`, then build that selected case. No fixture picker is rendered.

## Strict native acceptance

`scripts/test-crosshair-native-complete.mjs` runs the six snippets verbatim against
this selected production export. Evidence is in
`test-results/crosshair-native-complete/report.json`: real drag/arrow/header
selections, merged and edge selections, scrolled H24, both sheets, 30%/15% native
palette pixels, native typing with SUM recalculation, full raw histories, saved
and header-only recovery, invalid input rejection, 760/390/320 px viewports,
initial complete EN/ZH packs, same-owner themes, active/pending double disposal,
normal source/CSS parity and actual pagehide cleanup. Screenshots wait for the
native page to paint and for the startup skeleton to disappear.

Three SDK boundaries remain explicit: palette auto-enable omits EnabledChanged;
the first native numeric Undo restores the value but leaves `t: 2` and an allocated
style in the raw snapshot; new-owner reconstruction changes the defined-name
resource described above. Redo and recovery histories are checked independently.
No type, style, resource, ID or notification is normalized to turn a failure green.
