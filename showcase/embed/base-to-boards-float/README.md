# Flint / Delivery control room

An original fictional visitor-centre installation uses five Base records to drive nine native Board Formula Shapes. The data flow is **Base -> Board**; the embedding direction is **Base@Board Float**. There is no hidden Sheet, JavaScript aggregation, manual refresh or custom action toolbar. Native conditional formulas distinguish retained estimates from unfinished effort.

Initial open effort is **25 h** (Content 12, Build 8, Access 5), with **3 open items, 2 blockers, 40% done**. Two completed records retain 4 h and 6 h, giving **35 h** of total recorded estimates. Completion is a record count, not effort-weighted progress. Estimates do not authorize work, guarantee delivery dates or publish a project.

## Nine literal examples

Run these exact snippets in order with this demo's `univerAPI`. Explicit Base/table/record/field IDs define the mutation. Native focus, editing/history and visible Formula Shape repaint are separate acceptance gates.

### 1. Resolve the eight-hour blocker

Open effort becomes 17 h, Build becomes 0 h, open items 2, blockers 1 and completion 60%. All estimates stay 35 h: Done does not delete the eight-hour estimate.

```ts
univerAPI.getBase('flint-delivery-register').getTableById('tasks').getRecordById('task-2').setValue('status', 'Done')
```

### 2. Revise a completed estimate

The completed kiosk estimate becomes 20 h. All estimates rise to 47 h; open effort, open counts and stream subtotals must not change.

```ts
univerAPI.getBase('flint-delivery-register').getTableById('tasks').getRecordById('task-2').setValue('hours', 20)
```

### 3. Unblock without completing

Access remains open for five hours, but no blockers remain. The native text formula changes to Review next step. Completion stays 60%.

```ts
univerAPI.getBase('flint-delivery-register').getTableById('tasks').getRecordById('task-3').setValue('status', 'Open')
```

### 4. Revise one open workstream

Content becomes 18 h, total open effort 23 h and all estimates 53 h. Build and Access do not change.

```ts
univerAPI.getBase('flint-delivery-register').getTableById('tasks').getRecordById('task-1').setValue('hours', 18)
```

### 5. A true blank estimate

Clear Content's estimate with null. The item remains open, while native SUMIF/SUMIFS ignore the blank number: open effort 5 h, Content 0 h, all estimates 35 h. Blank is not a completed item.

```ts
univerAPI.getBase('flint-delivery-register').getTableById('tasks').getRecordById('task-1').setValue('hours', null)
```

### 6. Zero effort is not zero open items

Both open estimates become explicit zeros. Open effort is 0 h but there are still two unfinished items; completion stays 60%. All estimates are 30 h.

```ts
const tasks = univerAPI.getBase('flint-delivery-register').getTableById('tasks')
tasks.getRecordById('task-1').setValue('hours', 0)
tasks.getRecordById('task-3').setValue('hours', 0)
```

### 7. Restore the original estimate and status inputs

```ts
const tasks = univerAPI.getBase('flint-delivery-register').getTableById('tasks')
for (const [id, status, hours] of [['task-1', 'Open', 12], ['task-2', 'Blocked', 8], ['task-3', 'Blocked', 5], ['task-4', 'Done', 4], ['task-5', 'Done', 6]]) {
  tasks.getRecordById(id).setValue('status', status)
  tasks.getRecordById(id).setValue('hours', hours)
}
```

### 8. Change unrelated metadata

Renaming the owner does not alter any formula result or surrounding Board prose. This does not rename the external source or change its identity.

```ts
univerAPI.getBase('flint-delivery-register').getTableById('tasks').getRecordById('task-1').setValue('owner', 'Mira')
```

### 9. Inspect real native formulas and results

```ts
const board = univerAPI.getBoard('flint-delivery-control')
for (const id of ['remaining', 'open', 'blocked', 'completion', 'content-remaining', 'build-remaining', 'access-remaining', 'retained', 'signal']) {
  const shape = board.getShape(id)
  console.log(id, shape.getFormula(), shape.getFormulaResult())
}
console.log(board.save())
```

## Source identity, view projection and recovery

These additional examples start from the original five-record state. Display names, stable IDs, formula names and view projections are different things.

### 10. Rename labels, not formula identities

The Base unit ID stays `flint-delivery-register`; the table ID stays `tasks` and its stable formula name remains `Tasks`. Existing external qualifiers remain bound to that unit ID. This does not demonstrate field renaming.

```ts
const base = univerAPI.getBase('flint-delivery-register')
base.setName('Flint / Live delivery register')
const table = base.getTableById('tasks')
table.setName('Delivery items')
console.log(base.getId(), table.getId(), table.getFormulaName())
```

### 11. Show only completed records

The view contains two Done records, but the Board still reports 25 h open and 40% complete. These formulas explicitly aggregate the entire table, not the view's filtered rows. `getProjection()` describes the view, not the formula source.

```ts
const view = univerAPI.getBase('flint-delivery-register').getTableById('tasks').getViewById('tasks-grid')
view.setFilter({
  conjunction: univerAPI.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'status', operator: univerAPI.Enum.BaseFilterOperator.IS, operand: 'Done' }],
})
console.log(view.getProjection())
```

### 12. Change a record hidden by the view

Content is hidden by the Done filter, but changing its estimate from 12 to 18 updates open effort to 31 h, Content to 18 h and retained estimates to 41 h. The visible view still has two Done records. Filtering does not remove the hidden source record from this dependency.

```ts
univerAPI.getBase('flint-delivery-register').getTableById('tasks').getRecordById('task-1').setValue('hours', 18)
```

### 13. Reveal all records again

```ts
univerAPI.getBase('flint-delivery-register').getTableById('tasks').getViewById('tasks-grid').setFilter(null)
```

### Restore both native snapshots in the application

This module-level integration example uses the same exported `createDemo` factory as Preview. `demo` and `container` are the existing application-owned handle and mount element from `src/index.ts`; use a mutable `let demo` for replacement. It is not an extra `univerAPI` method. Both native snapshots must be retained, including their resources; saving the Board alone cannot persist the separate Base records. No localStorage or backend write is performed.

```js
const saved = structuredClone({
  host: demo.univerAPI.getBoard('flint-delivery-control').save(),
  source: demo.univerAPI.getBase('flint-delivery-register').save(),
})
await demo.dispose()
demo = createDemo(container, false, saved)
```

The factory must recover the saved native embed and formula bindings rather than recreate the starter formulas or reset the Base records. Wait for `.flint-embed[data-ready="true"]` before interacting. After recovery, edit the source again to prove live recalculation; persisted display text alone is insufficient. This does not restore undo history or promise arbitrary-file import.

## Composition and acceptance

The saved Miro diagram reference informs source-to-dependent branches, not copied artwork. Original ink/slate, blue, terracotta, sage and lilac cards surround a real Base Float. Three native bound connectors show the relationship to Content, Build and Access. Board uses its native floating tools; embedded menus use Grid. Official SDK CSS is included in the same factory used by Preview and standalone export. License notices remain visible.

**Partial evidence, not full acceptance.** All nine literal examples pass selected independent-production checks against nine native formula values/statuses and final canvas text. Conditional sums, counts, completion, stream isolation, completed-record estimates, blank versus zero and unrelated owner edits match their published expectations. The complete authored Board prose, geometry, order and bound connector data remain unchanged by source changes. The native Base preview is visible; source fullscreen text editing and exact Base Undo/Redo, status-change native history, host return and active-fullscreen disposal pass selected checks without observed browser errors or backend requests. These do not certify every native editor path.

Both English and Chinese guides execute all thirteen exact examples, including display-name changes, whole-table versus view-filter behavior and hidden-record edits. Light/dark changes preserve the API owner and Base snapshot; Board content is exact except for native palette regeneration with the same theme ID. However, the expanded guide run remains **FAIL** overall: the Next development server returns an initial playground HTTP 500 with `Unexpected end of JSON input` in `loadManifest`, then recovers. Completing both locales after recovery does not erase that delivery failure. An eleven-file independent export installs 206 packages offline, includes all nine official CSS imports, and passes actual native white workbench/source parity checks. No SDK or package patch was made.

Native numeric editing also passes: after the kiosk is Done, typing 18 into Content Hours changes open effort 17 -> 23 h, Content 12 -> 18 h and retained estimates 35 -> 41 h. Exact full-Base Undo/Redo and unchanged authored Board content are checked. The first numeric test clicked the adjacent Owner field because a right-aligned paint anchor was treated as a left edge; the corrected cell hit point, not an SDK patch, fixes this test.

The four additional identity/projection snippets and the exact application recovery snippet pass against the exported factory. Recovery retains an intentionally edited formula, Base records and Board content/resources in one new owner. A subsequent source edit updates and repaints the affected formulas. Base snapshots are exact; the native embed changes its `updatedAt` reactivation timestamp, so raw Board snapshot equality is **false**. The test isolates that one timestamp and compares everything else exactly. Four wrong-unit/missing-page/table snapshot cases are rejected before mounting or changing the existing owner. SDK cleanup emits 18 `formula.mutation.remove-other-formula` warnings across disposal/reconstruction; the test retains them and does not certify warning-free lifecycle behavior.

Evidence in the documentation repository: `scripts/test-embed-flint-formula.mjs`, `test-results/embed-flint-formula-restorable/report.json`, `scripts/test-embed-flint-roundtrip.mjs`, `test-results/embed-flint-roundtrip-guards/report.json`, `scripts/test-embed-flint-formula-guide.mjs`, `test-results/embed-flint-formula-next-identity-final/report.json` (FAIL), and `test-results/flint-formula-export-ui-restorable/report.json`. The selected 1850-module production build has an 18,493.35 kB entry (4,559.91 kB gzip) and 154.80 kB CSS (21.95 kB gzip). Cold selected Next guide/playground requests previously took 66s/15.8s and emitted a Gzip listener warning; delivery performance is not accepted.

These formulas aggregate the whole Base table, not its visible filtered view; the selected filter and hidden-record tests confirm this distinction. Missing/invalid external sources, field/formula-identity renaming and rebinding, arbitrary-file recovery, every native menu/editor path, warning-free lifecycle, Next delivery, Print/Exchange, accessibility, touch and performance remain separate gates. No collaboration, server persistence or export conversion is claimed.
