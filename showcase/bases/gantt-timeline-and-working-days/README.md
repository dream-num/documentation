# Gantt Timeline and Working Days

Eight original, fictional exhibition-installation tasks show intervals, overlapping work, completed/in-progress/not-started work, and a one-day access review. Switch the native sidebar between **Quarter overview**, **Working week**, and **Source records**. These are three views of one table, not three copies of the records.

The quarter-scale view fits the overall schedule into the initial timeline. The week view configures Monday–Friday working days and offers a closer view; use native horizontal scrolling to see later tasks. Both use phase colors and the same progress field. The source Grid exposes the underlying dates and progress for editing. There are no host-made timeline bars, extra action buttons, fixture panels or explanation cards.

## 1. Change the time scale of one view

```ts
const table = window.univerAPI.getBase('exhibition-gantt').getTableById('installation')
const view = table.getViewById('overview')
if (!view.updateConfig({ scale: 'month' })) throw new Error('Scale change rejected')
```

This changes Quarter overview to the closer month scale; it does not rename the view or alter the Working week configuration. Later tasks may require native horizontal scrolling at this scale. The native view settings can select other scales.

## 2. Add a working-calendar exception

```ts
const table = window.univerAPI.getBase('exhibition-gantt').getTableById('installation')
const view = table.getViewById('working-week')
if (!view.updateConfig({ workingDaysOnly: true, workingDays: {
  weekdays: [1, 2, 3, 4, 5],
  exceptions: [{ id: 'gallery-closure', date: new Date(2028, 8, 12, 12).getTime(), name: 'Gallery electrical inspection', type: 'off' }],
} })) throw new Error('Working calendar rejected')
```

The exception belongs to this view's calendar. It does not move task dates or implement automatic scheduling. Working-day counts/shading and pointer writeback require separate runtime verification; a successful configuration write is not proof of their presentation.

## 3. Update progress, then inspect the source Grid

```ts
const table = window.univerAPI.getBase('exhibition-gantt').getTableById('installation')
const task = table.getRecordById('task-3')
if (!task.setValue('progress', 80)) throw new Error('Progress update rejected')
if (task.getValue('progress') !== 80) throw new Error('Progress was not stored')
window.univerAPI.getBaseUI().activateView('source')
```

Build modular plinths changes from 65 to 80. All three views share the changed record. Switch back to either Gantt view to inspect its native progress presentation.

## 4. Extend a task without changing its start

```ts
const table = window.univerAPI.getBase('exhibition-gantt').getTableById('installation')
const task = table.getRecordById('task-4')
const originalStart = task.getValue('start')
if (!task.setValue('end', Number(task.getValue('end')) + 2)) throw new Error('Date update rejected')
if (task.getValue('start') !== originalStart) throw new Error('The start date changed')
window.univerAPI.getBaseUI().activateView('overview')
```

Each run extends Print interpretive panels by two days. Reload for the authored schedule before repeating examples. This demonstrates a Facade data edit, not drag-and-drop or dependency scheduling.

## 5. Collapse the timeline's left pane

```ts
const table = window.univerAPI.getBase('exhibition-gantt').getTableById('installation')
if (!table.getViewById('overview').updateConfig({ leftPaneCollapsed: true })) throw new Error('Pane change rejected')
```

Restore the pane using native settings or the same call with `false`. The other views keep their own layout, and records remain intact.

## Export and scope

Run `pnpm install`, then `pnpm dev` in the independent export. The factory registers the Grid ribbon configuration, all five English dependency locale packs and four official CSS files. The demo stays English even on a non-English documentation page; it does not mutate the host page language. Theme changes retain the existing owner and edits. Native licensing notices remain visible.

Dates use the installed public `dateToExcelSerial` helper with explicit local calendar components. Working-calendar exception dates are timestamps, not serials. Saved data across browser timezones is not a scheduling guarantee. No backend, dependency upgrade, SDK modification, cross-demo import or invented scheduling API is included.

This implementation targets a concise native view comparison. Dependency connectors, complete holiday behavior and native rendering of every setting still require separate acceptance.

## Current native interaction evidence

`scripts/test-base-gantt-gallery.mjs` against selected build `test-results/selected-export-builds-uAVTBg/manifest.json` records English SDK rendering on both English and Chinese host pages. The current report is `test-results/base-gantt-native/report.json` and remains **FAIL**, not complete interaction acceptance.

- Native dragging of the left-pane progress bar changes Build modular plinths from 65 to 19.05, preserving its dates, other records and all view settings. This is actual mouse interaction, separate from the progress Facade recipe above. The reviewed screenshot shows 19% in the left pane but the selected task's timeline bar appears absent or covered by the row highlight; the passing model-write gate does not certify complete post-edit timeline painting.
- A bar-body drag changed the task dates but changed the stored interval from seven days to six. Duration-preserving movement is not accepted.
- A right-edge resize attempt changed the start as well as the end; end-only resize is not accepted. The cause has not been isolated between date snapping/normalization and native hit handling, so this is an observed failure, not a claimed SDK root cause.
- In this installed runtime `getRenderedView()` returned null despite the visible timeline. The test locates actual painted labels and bar pixels before sending mouse input; it does not replace pointer operations with Facade writes.

Native scale switching, three view tabs, the five literal Facade recipes and full edited-model preservation through theme changes continue to pass independently. No SDK code was modified to bypass these failures. The referenced native run tested the matching factory, data and styles; the coverage ledger separately records the latest complete export, including this evidence section.
