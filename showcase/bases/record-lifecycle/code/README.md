# Harbour Commons / Record Lifecycle

An original arts weekend contains 30 production tasks, 12 installations and 18 opening checkpoints. Explore the native sidebar, record grid, cell editor and context menus. Text, hours, status, people, dates, local attachment notes and real installation links vary across the three tables.

The editor has no fixture controls, duplicated CRUD/Undo buttons, audit panel or explanatory card. Grid is the default workbench layout. Preview and standalone export use the same factory, data and four official SDK stylesheets. Five complete English dependency locale packs are provided. Authored business content stays English; changing the page theme does not recreate the Base.

Person names use the native local directory. Beta.2 can display person IDs in grid cells even when the native picker resolves their names; IDs are not replaced with display strings. No backend, collaborative history plugin or conversion server is registered.

## Twenty literal Facade variants

Run these in order in the standalone or preview-frame console. Start from a fresh page. Keep the native Base focused for Undo/Redo. The window variables hold returned IDs or detached checkpoints only; they are not fake calculations and are not added to the exported Base model.

### 1. Capture the original three-table checkpoint

A detached snapshot includes all tables and attachment resources. This console variable is not part of Base data.

```ts
window.harbourCheckpoint = structuredClone(window.univerAPI.getBase('harbour-record-lifecycle').save())
```

### 2. Single intake / after the original checklist

One native record gets a new SDK-generated ID and a late order key. Other tables remain unchanged.

```ts
window.harbourSingle = window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').addRecord({ title: 'Check lantern spare connectors', status: 'planned', hours: 1.5, owner: ['ari'], brief: [] }, undefined, { orderKey: 'z0000' }).getId()
```

### 3. Batch intake / three distinct records before the checklist

The third record carries an original local note, so this also exercises resource ownership. IDs are generated, not inferred from titles.

```ts
window.harbourBatch = window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').addRecords([
  { values: { title: 'Pack quiet-hour visitor cards', status: 'active', hours: 0.5, owner: ['zuri'], brief: [] }, record: { orderKey: 'a0000' } },
  { values: { title: 'Check step-free evening route', status: 'planned', hours: 0, owner: [], due: null, brief: [] }, record: { orderKey: 'a0001' } },
  { values: { title: 'Record seed-library handover', status: 'review', hours: 2.5, owner: ['hana', 'mateo'], brief: [{ id: 'handover-note', name: 'handover.txt', mimeType: 'text/plain', sourceType: window.univerAPI.Enum.ImageSourceType.BASE64, source: 'data:text/plain;charset=utf-8,Return%20unopened%20seed%20packets%20to%20the%20community%20library.' }] }, record: { orderKey: 'a0002' } },
]).map(record => record.getId())
```

### 4. Native Undo / full-resource limitation

Use the focused Base native history. The inserted records disappear, but beta.2 may retain their attachment resources. That full-snapshot difference is a strict failing acceptance gate, not fixed by a custom cleanup.

```ts
await window.univerAPI.undo()
```

### 5. Native Redo

The batch records and their IDs return. This is local command undo/redo, not collaborative revision history.

```ts
await window.univerAPI.redo()
```

### 6. Named-field patch / preserve unrelated fields

Update the original single intake using its stable ID. Owner and other fields remain intact.

```ts
window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').getRecordById(window.harbourSingle).setValues({ status: 'review', hours: 6.5 })
```

### 7. Range patch / distinct values per row

The range uses the table's record/field order, excluding the internal ID field, not a sorted or filtered view. Status and Hours are columns 1 and 2.

```ts
window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').getRange(0, 1, 3, 2).setValues([['active', 1], ['review', 2], ['done', 3]])
```

### 8. Order key / move the single intake first

The native manual-order view follows this key; custom sorted views can project a different order.

```ts
window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').getRecordById(window.harbourSingle).setOrderKey('0000')
```

### 9. Duplicate / new identity

Copy every field but give the copy its own title. The returned ID differs from the original.

```ts
const original = window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').getRecordById(window.harbourSingle)
window.harbourCopy = original.duplicate({ values: { ...original.getValues(), title: 'Lantern fallback checklist' }, orderKey: '0001' }).getId()
```

### 10. Duplicate titles / distinct IDs and numeric boundaries

The first two original records intentionally share a label but keep separate identities and independent hours.

```ts
window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').getRecordById('tasks-01').setValues({ title: 'Lantern suspension / review', hours: -0.5 })
window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').getRecordById('tasks-02').setValues({ title: 'Lantern suspension / review', hours: 99999.5 })
```

### 11. Zero hours

Zero is an explicit value, not an empty cell.

```ts
window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').getRecordById('tasks-01').setValue('hours', 0)
```

### 12. Empty hours

Null clears the number without deleting the record.

```ts
window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').getRecordById('tasks-01').setValue('hours', null)
```

### 13. Invalid dimensions / reject without mutation

This snippet intentionally throws the native range error. Inspect it and continue; the test requires the entire snapshot to remain unchanged.

```ts
window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').getRange(0, 1, 1, 1).setValues([['done', 2]])
```

### 14. Single deletion

```ts
window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').getRecordById(window.harbourCopy).delete()
```

### 15. Batch deletion

Remove only the three captured batch IDs, not similarly named original tasks.

```ts
window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks').deleteRecords(window.harbourBatch)
```

### 16. Empty checklist / preserve supporting context

Clear tasks only. Twelve installations, eighteen checkpoints, schema and table relationships remain available.

```ts
const table = window.univerAPI.getBase('harbour-record-lifecycle').getTableById('tasks')
table.deleteRecords(table.getRecords().map(record => record.getId()))
```

### 17. Restore checkpoint / recreate full original content

This is snapshot reconstruction, not Undo. It resets local history and reacquires the table/view, retaining all three original tables and resources.

```ts
window.univerAPI.disposeUnit('harbour-record-lifecycle')
window.univerAPI.createBase(structuredClone(window.harbourCheckpoint))
await window.univerAPI.getBaseUI().activateTable('tasks')
await window.univerAPI.getBaseUI().activateView('tasks-grid')
```

### 18. Save / inspect all resources

The saved object is the actual current native Base, not a manually assembled audit panel.

```ts
window.harbourSaved = structuredClone(window.univerAPI.getBase('harbour-record-lifecycle').save())
```

### 19. Reload current content

```ts
const current = structuredClone(window.univerAPI.getBase('harbour-record-lifecycle').save())
window.univerAPI.disposeUnit('harbour-record-lifecycle')
window.univerAPI.createBase(current)
await window.univerAPI.getBaseUI().activateTable('tasks')
await window.univerAPI.getBaseUI().activateView('tasks-grid')
```

### 20. Download current JSON

Download all actual tables/resources as Base JSON. This is not XLSX, PDF, or a server conversion.

```ts
const url = URL.createObjectURL(new Blob([JSON.stringify(window.univerAPI.getBase('harbour-record-lifecycle').save(), null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'harbour-commons.base.json'
link.click()
URL.revokeObjectURL(url)
```

## Verification boundary

Full attachment-resource Undo fidelity remains a known beta.2 failure; no normalization or cleanup hides orphan attachment sets. Recreating the same Base ID restores the saved model, but the native grid/footer can remain empty. The native Add Record form submission did not produce the expected new model record in this selected test; its cause is not isolated, so native form entry is not accepted. These failures do not prevent the independent keyboard-edit gate from running on a fresh browser owner. Browser reload restores the authored example; it is not equivalent to the tested same-ID reconstruction.

The SDK language and authored business data remain English regardless of the host page language. Startup exceptions display a failure-only alert; no explanatory card is present in a healthy editor. Lifecycle timeout/cancellation behavior has not been accepted.

Full menus, localized-control interactions and mobile/accessibility/performance acceptance remain separate. A successful export proves exact source/CSS parity, not complete feature acceptance.
