# Lumen / Create a Relational Table and tables

Native UI and authored data are English-only, including on Chinese documentation pages. Legacy locale arguments are ignored; saved-snapshot argument positions are unchanged. Bilingual runtime reports below describe earlier revisions, not acceptance of this English-only revision.

Run `pnpm install` and `pnpm dev`. Preview and export share `createDemo()`, five complete English locale packs and four official SDK stylesheets. The native Relational Table owns its sidebar, grid and toolbar; there is no fixture panel, duplicate editing/history toolbar or snapshot inspector. Theme changes keep the same owner and user edits.

The community theatre renewal contains 12 renovation projects, 30 distinct work packages and 18 acceptance milestones. Text, number, select, person, date, attachment, checkbox and canonical RecordLink fields retain their original types. Original data-URL text attachments need no upload service. People IDs are stored in the snapshot; the local display-name directory is supplied separately by `setPersonOptions(PEOPLE)` on each mount.

Use the native sidebar to explore the three stories. Double-click a cell to edit it and use native Undo/Redo. The following application recipes show variations that were previously hidden behind demo-only buttons. Run each fenced example in order in the browser console after the Relational Table is ready, or inside an async application function. Reload the example before starting the sequence again; table names intentionally identify the created objects.

## Literal Facade examples

### 1. Open work packages

Thirty different tasks point to real renovation projects.

```ts
await window.univerAPI.getBaseUI().activateTable('tasks')
await window.univerAPI.getBaseUI().activateView('tasks-grid')
```

### 2. Open acceptance milestones

Eighteen inspection and handover records include dated evidence.

```ts
await window.univerAPI.getBaseUI().activateTable('milestones')
await window.univerAPI.getBaseUI().activateView('milestones-grid')
```

### 3. Return to renovation projects

Selection is native UI state, not a change to the stored Relational Table.

```ts
await window.univerAPI.getBaseUI().activateTable('projects')
await window.univerAPI.getBaseUI().activateView('projects-grid')
```

### 4. Insert at the start

The new table is empty and has a real primary field and Grid view.

```ts
window.univerAPI.getBase('lumen-base-lifecycle').insertTable('Arrival checks', { index: 0, primaryFieldName: 'Arrival item' })
```

### 5. Insert after the active table

The position is derived from the current native selection, not a hard-coded array index.

```ts
const api = window.univerAPI, base = api.getBase('lumen-base-lifecycle')
const index = base.save().tableOrder.indexOf(api.getBaseUI().getActiveTableId()) + 1
base.insertTable('Access reviews', { index, primaryFieldName: 'Access item' })
```

### 6. Append a typed checklist

Three different records use real Person and SingleSelect fields. This is five SDK commands (table, two fields, batch records, column width), not one artificial transaction; native Undo steps through them. The primary column is wide enough to read the checklist text.

```ts
const api = window.univerAPI, base = api.getBase('lumen-base-lifecycle')
const table = base.insertTable('Finish checklist', { index: base.save().tableOrder.length, primaryFieldName: 'Check item' })
const person = table.addField('Assigned person', api.Enum.BaseFieldType.Person, { field: { config: { allowMultiple: false } } })
const status = table.addField('Status', api.Enum.BaseFieldType.SingleSelect, { field: { config: { options: [
  { id: 'planned', name: 'Planned', color: '#64748b' },
  { id: 'active', name: 'In progress', color: '#2563eb' },
  { id: 'review', name: 'In review', color: '#d97706' },
] } } })
table.addRecords([
  { values: { [table.getPrimaryFieldId()]: 'Collect paint colour samples', [person.getId()]: 'nia', [status.getId()]: 'planned' } },
  { values: { [table.getPrimaryFieldId()]: 'Approve recycled timber finish', [person.getId()]: 'imani', [status.getId()]: 'active' } },
  { values: { [table.getPrimaryFieldId()]: 'Publish volunteer shift handover', [person.getId()]: 'tomas', [status.getId()]: 'review' } },
])
table.getViews()[0].setFieldWidth(table.getPrimaryFieldId(), 380)
```

### 7. Rename the display label

The table ID and formula name stay unchanged; only the visible label changes.

```ts
const table = window.univerAPI.getBase('lumen-base-lifecycle').getTableByName('Finish checklist')
console.log(table.getId(), table.getFormulaName())
if (!table.setName('Finish and handover')) throw new Error('The table rename was rejected.')
console.log(table.getId(), table.getFormulaName())
```

### 8. Duplicate schema without records

The copy has its own table and regenerated view IDs. Field definitions and primary-field configuration are retained.

```ts
const base = window.univerAPI.getBase('lumen-base-lifecycle')
const copy = base.duplicateTable(base.getTableByName('Finish and handover'), { includeRecords: false, regenerateViewIds: true })
if (!copy.setName('Next season template')) throw new Error('The copy rename was rejected.')
```

### 9. Duplicate schema with records

This copy begins with the same three checklist values, not a link to the original table.

```ts
const base = window.univerAPI.getBase('lumen-base-lifecycle')
const copy = base.duplicateTable(base.getTableByName('Finish and handover'), { includeRecords: true, regenerateViewIds: true })
if (!copy.setName('Second-stage handover')) throw new Error('The copy rename was rejected.')
```

### 10. Edit only the copied record

The original checklist still says “Collect paint colour samples”.

```ts
const table = window.univerAPI.getBase('lumen-base-lifecycle').getTableByName('Second-stage handover')
table.getRecords()[0].setValue(table.getPrimaryFieldId(), 'Compare foyer colour samples in daylight')
```

### 11. Inspect the copy in its native Grid

```ts
const api = window.univerAPI, table = api.getBase('lumen-base-lifecycle').getTableByName('Second-stage handover')
await api.getBaseUI().activateTable(table.getId())
await api.getBaseUI().activateView(table.getViews()[0].getId())
```

### 12. Delete the unused schema copy

Run this intentionally on the newly created, unreferenced template. The last-table check is application policy, not a claim about SDK validation. A host application should ask for user confirmation before deleting user content.

```ts
const base = window.univerAPI.getBase('lumen-base-lifecycle')
if (base.getTables().length < 2) throw new Error('Keep at least one table.')
base.deleteTable(base.getTableByName('Next season template'))
```

### 13. Undo that deletion

Native local editing history, not a collaborative revision-history service.

```ts
await window.univerAPI.undo()
```

### 14. Redo that deletion

```ts
await window.univerAPI.redo()
```

### 15. Reject an invalid name

Native validation must reject the slash and preserve the entire snapshot.

```ts
const base = window.univerAPI.getBase('lumen-base-lifecycle')
let rejected = false
try { base.insertTable('Bad/name') } catch (error) { rejected = true; console.log(String(error)) }
if (!rejected) throw new Error('Expected native table-name rejection.')
```

### 16. Reject a case-insensitive duplicate name

```ts
const base = window.univerAPI.getBase('lumen-base-lifecycle')
let rejected = false
try { base.insertTable('RENOVATION PROJECTS') } catch (error) { rejected = true; console.log(String(error)) }
if (!rejected) throw new Error('Expected native duplicate-name rejection.')
```

### 17. Reject an invalid display rename

Like insertTable, the installed Facade throws for an invalid name. Preserve that diagnostic instead of treating the rename as successful.

```ts
const table = window.univerAPI.getBase('lumen-base-lifecycle').getTableByName('Finish and handover')
let rejected = false
try { table.setName('Bad/name') } catch (error) { rejected = true; console.log(String(error)) }
if (!rejected) throw new Error('Expected native rename rejection.')
```

### 18. Inspect incoming links before deletion

The project table is referenced by both supporting tables. This read-only check makes the application guard explicit instead of deleting and repairing user data.

```ts
const api = window.univerAPI, saved = api.getBase('lumen-base-lifecycle').save()
const references = Object.values(saved.tables).flatMap(table => Object.values(table.fields)
  .filter(field => field.type === api.Enum.BaseFieldType.RecordLink && field.config.targetTableId === 'projects')
  .map(field => ({ tableId: table.id, fieldId: field.id })))
console.log({ target: 'projects', references, mayDelete: saved.tableOrder.length > 1 && references.length === 0 })
```

### 19. Download the complete current snapshot

This is Relational Table JSON, not CSV/XLSX conversion. No backend or upload is involved.

```ts
const saved = window.univerAPI.getBase('lumen-base-lifecycle').save()
const url = URL.createObjectURL(new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'lumen-theatre.base.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 0)
```

### 20. Return to the original projects

The original 60 records, attachments and RecordLinks were not replaced by the checklist experiments.

```ts
await window.univerAPI.getBaseUI().activateTable('projects')
await window.univerAPI.getBaseUI().activateView('projects-grid')
```

## Save, reconstruct and restore a checkpoint

In the application entry use `let demo = createDemo(container)` so the pagehide callback disposes the current handle. Keep the imported factory and mount element. The following literal example rebuilds the **whole owner**, restores a detached snapshot and then restores the selected table/view. The factory restores the person directory as well. History starts fresh; English and the current theme are retained.

```js
const saved = JSON.parse(JSON.stringify(demo.univerAPI.getBase('lumen-base-lifecycle').save()))
const tableId = demo.univerAPI.getBaseUI().getActiveTableId()
const viewId = demo.univerAPI.getBaseUI().getActiveViewId()
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
await demo.ready
await demo.univerAPI.getBaseUI().activateTable(tableId)
await demo.univerAPI.getBaseUI().activateView(viewId)
```

To keep a checkpoint, retain that detached `saved` value and its table/view IDs **before** later edits, then run the disposal/recreation portion using that checkpoint. To reset to original content, pass `createData()` instead. Import `createData` from `./data` for separately constructed variants: `empty` is one zero-record project table; `boundary` reverses table order and includes zero and 999999.99 budgets; `error` starts with the original data so the invalid-name snippets can be tried without replacing content. No state-selector panel is added.

## Acceptance boundary

The beta.2 native Grid still paints raw person IDs such as `nia, imani` despite a valid local directory. Do not replace Person fields with text or fake names as IDs. The installed SDK also lacks a Facade/native sidebar operation to move an existing table: insertion index demonstrates only positioning a **new** table. Both limitations remain explicit.

Maintainer test: `node scripts/test-bases-lumen-native.mjs` in the documentation repository. Set `SHOWCASE_BUILD_STANDALONE=1` for factory reconstruction tests, and `SHOWCASE_VITE_DIRECTORY` to the exact installed Vite package directory if the selected export has no Vite yet. It builds only this case on port 4366 and closes its test server afterward. `SHOWCASE_EXPORT_DIRECTORY` can reuse this case's prepared export. Without the harness, `SHOWCASE_DEMO_URL` selects an existing page; factory-only gates are explicitly unverified.

The selected standalone report at `test-results/lumen-native-final/report.json` passes 29 of 30 gates: all 20 literal snippets; actual title typing and Person picker with exact full-snapshot Undo/Redo; native three-table navigation/current paint; five complete EN/ZH packs; same-owner themes; full-owner reconstruction with saved table/view selection, fresh native editing and exact Undo; detached checkpoint; all four constructed datasets; invalid input preserving the owner; active/pre-ready disposal. No browser errors, warnings or backend requests were observed. The strict report remains FAIL on native Person display names: first-row canvas text is `nia, imani` although the directory returns the real names.

The first test run exposed three test/example mistakes that were corrected without SDK changes: the native Grid clips long text rather than painting an entire hidden suffix; a reconstructed owner initially selects the first saved table, which may be a newly inserted table; and the installed setName Facade throws on invalid input rather than returning false. The checklist recipe now sets a readable native column width. The current report tests the exact corrected README snippets, not replacement actions.

The native-only migration is not full acceptance. All native table-menu paths, existing-table reorder, complete restore validation, Print/Exchange support, Next page integration, responsive/accessibility checks and delivery performance remain open. No SDK patch, fake calculation, collaboration service, binary conversion claim or native-renderer override is included. Pro trial notices remain.
