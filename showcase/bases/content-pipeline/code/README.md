# Launch Content Pipeline — one Base, three native views

Twelve fictional launch assets share one table: the original pricing page, migration playbook, webinar, security FAQ, Aeris customer story, and regional email sequence remain unchanged. Six additional editorial tasks add pre-launch video, APAC translation, undated interview notes, accessibility review, a retrospective, and a same-day follow-up. Six statuses, six channels, distinct owners, 0–100 progress, and both scheduled/unscheduled work make this an actual content-operations story.

Only the native Base UI is mounted. Use Editorial grid, Status board, and Publishing calendar in the native sidebar/view menu. Edit records and move statuses with the native controls. There is no external view switch, Add record, Reset, or activity panel.

The authored dates are fixed launch-plan dates around September 2026, initially stored as UTC milliseconds. The native calendar initially anchors on the first dated item in August; use its navigation controls to inspect September. The demo does not replace the computer clock. The interview starts without a publication date and should remain absent from dated calendar events until scheduled. Null is not the Unix epoch. Trial/license UI is retained.

Native date edits may store the SDK's supported Excel date serial representation. The native drag test moves the webinar from September 5 to September 6: raw storage becomes 46271, and the real calendar projection resolves it to 2026-09-06T00:00:00.000Z. Full-model Undo restores the original millisecond value; comparisons never convert either snapshot to make it pass.

## Sixteen literal Facade examples

Run the blocks in order in the loaded demo console. Stable model IDs are defined in data.ts. These examples integrate the real Base; they do not manufacture a separate host calendar or Kanban renderer. Native editing and public Facade commands share the SDK's history.

### 1. Read the shared source and projections

```ts
const table = window.univerAPI.getBase('content-pipeline-base').getTableById('content')
console.log(table.getRecords().map(record => record.getValues()))
for (const id of ['grid', 'board', 'calendar']) console.log(id, table.getViewById(id).getProjection())
```

### 2. Open the status board

```ts
await window.univerAPI.getBaseUI().activateView('board')
```

### 3. Open the publishing calendar

```ts
await window.univerAPI.getBaseUI().activateView('calendar')
```

### 4. Return to the editorial grid

```ts
await window.univerAPI.getBaseUI().activateView('grid')
```

### 5. Move the migration playbook into review

```ts
const record = window.univerAPI.getBase('content-pipeline-base').getTableById('content').getRecordById('r02')
if (!record.setValue('status', 'In review')) throw new Error('The review transition was not applied.')
```

### 6. Schedule previously undated interview notes

```ts
const record = window.univerAPI.getBase('content-pipeline-base').getTableById('content').getRecordById('r09')
if (!record.setValue('publishDate', Date.UTC(2026, 8, 20))) throw new Error('The interview was not scheduled.')
```

### 7. Assign the interview and update progress

```ts
const record = window.univerAPI.getBase('content-pipeline-base').getTableById('content').getRecordById('r09')
if (!record.setValues({ owner: 'Priya Shah', progress: 48 })) throw new Error('The handover was not applied.')
```

### 8. Add the original analyst briefing variant

A repeated run is rejected before inserting a duplicate. The returned record ID is used in subsequent integration work, never guessed.

```ts
const table = window.univerAPI.getBase('content-pipeline-base').getTableById('content')
if (table.getRecords().some(record => record.getValue('asset') === 'Analyst briefing deck'))
  throw new Error('The analyst briefing already exists.')
const [record] = table.addRecords([{ values: {
  asset: 'Analyst briefing deck', status: 'Planned', owner: 'Maya Chen', channel: 'Slides', progress: 20,
  publishDate: 1789516800000,
} }])
if (!record) throw new Error('The briefing was not inserted.')
window.briefingId = record.getId()
```

### 9. Focus the grid on blocked work

This changes only the grid projection, not the records or the other views.

```ts
const api = window.univerAPI
const grid = api.getBase('content-pipeline-base').getTableById('content').getViewById('grid')
grid.setFilter({ conjunction: api.Enum.BaseFilterConjunction.AND, conditions: [
  { fieldId: 'status', operator: api.Enum.BaseFilterOperator.IS, operand: 'Blocked' },
] })
```

### 10. Clear the editorial filter without resetting edits

```ts
window.univerAPI.getBase('content-pipeline-base').getTableById('content').getViewById('grid').setFilter(null)
```

### 11. Weekly calendar planning

```ts
const calendar = window.univerAPI.getBase('content-pipeline-base').getTableById('content').getViewById('calendar')
calendar.updateConfig({ mode: 'week' })
await window.univerAPI.getBaseUI().activateView('calendar')
```

### 12. Return to monthly planning

```ts
const calendar = window.univerAPI.getBase('content-pipeline-base').getTableById('content').getViewById('calendar')
calendar.updateConfig({ mode: 'month' })
```

### 13. Undo the last calendar configuration

```ts
await window.univerAPI.undo()
```

### 14. Redo it

```ts
await window.univerAPI.redo()
```

### 15. Save the complete edited owner

```ts
window.pipelineCheckpoint = structuredClone(window.univerAPI.getBase('content-pipeline-base').save())
console.log(window.pipelineCheckpoint)
```

### 16. Download the real JSON snapshot

This is a local JSON checkpoint, not XLSX/PDF conversion or a backend upload.

```ts
const snapshot = window.univerAPI.getBase('content-pipeline-base').save()
const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'launch-content-pipeline.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 1000)
```

## Complete owner recovery

Place this recipe in exported src/index.ts after the factory is ready; the test-only standalone harness exposes the same bindings. Validate before disposal. The entire snapshot preserves record/view/field IDs, resources, and edits; do not rebuild a subset from projected rows. View activation is ephemeral UI state and is restored explicitly here, not represented as a new saved record.

```js
const saved = structuredClone(window.pipelineCheckpoint ?? demo.univerAPI.getBase('content-pipeline-base').save())
if (saved.id !== 'content-pipeline-base' || !saved.tables?.content?.views?.grid)
  throw new Error('Restore the complete launch content Base.')
const api = demo.univerAPI
const locale = api.getCurrentLocale()
const darkMode = api.isDarkMode()
const viewId = api.getBaseUI().getActiveViewId()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
await demo.ready
if (viewId) await demo.univerAPI.getBaseUI().activateView(viewId)
```

Preview and exported source use the same factory, all five complete EN/ZH packs, and four official SDK CSS imports. Initial locale follows document.documentElement.lang. Theme toggles keep the existing owner and edited values. There is no backend, copied template screenshot, or fabricated API.

## Verification

The dedicated script defaults to http://localhost:3030/en-US/playground/bases/content-pipeline; SHOWCASE_DEMO_URL overrides it and SHOWCASE_BASE_URL changes the guide origin. Lifecycle tests require the standalone harness, not hooks added to production UI.

PowerShell from documentation:

```powershell
$env:SHOWCASE_BUILD_STANDALONE = '1'
$env:SHOWCASE_VITE_DIRECTORY = '<USERPROFILE>/AppData/Local/Temp/univer-aster-formula-SHm1UE/node_modules/vite'
$env:SHOWCASE_RESULTS_DIR = 'test-results/content-pipeline-native'
node scripts/test-content-pipeline-native.mjs
Remove-Item Env:SHOWCASE_RESULTS_DIR
```

Only this case is built on strict port 4416. Dependencies are individually linked at the exported exact versions; no installation or whole node_modules junction is required. The report records complete snapshot differences, native view/render failures, and page errors rather than normalizing them away.

## Retained native acceptance gaps

- After a native status edit and switching to the board and back, Ctrl+Z currently does not revert the status. The strict comparison retains status, cellData, and updatedAt differences. Clicking the grid and using native toolbar Undo/Redo passes separately; that does not erase the cross-view shortcut failure or establish its cause.
- Calendar weekday labels are shifted: the native September 5 webinar is drawn beneath “Fri”, although September 5, 2026 is Saturday. The test saves actual canvas text coordinates, the unchanged source timestamp, and the expected weekday. No replacement calendar or header patch is applied.
- Clicking Next once from the initial August 31 anchor skips September and opens October. The separate date-drag setup uses one explicit Previous after this observed rollover to reach September; the original next-month gate remains FAIL.

The declared getRenderedView() Facade currently returns null in this SDK. It is not used by production or the literal examples. Native pointer tests locate actual SDK canvas paint instead; the early diagnostic report is retained. Full owner recovery includes the complete resources emitted by this text-only Base, but does not claim attachment-file recovery.
