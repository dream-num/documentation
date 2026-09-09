# Large Record Set

This native Base Grid contains 5,000 original dispatch records, six business fields and the built-in Record ID field. Three views share the same records: all records, North (initially 1,000 records), and five region groups with value sorted descending. Initial view counts describe the generated data; editing Region can change them.

Data is regenerated deterministically from the zero-based record index, without randomness or remote resources. Products cycle across seven names, regions across five names, and status across four colored options. Units range from 0 to 100, values vary in cents, and every eleventh handling note is empty. Record IDs and timestamps are stable across reloads.

Use the native view tabs, scroll, double-click cells to edit, and try Filter, Sort and Group By. These are SDK operations on the full dataset, not JavaScript-sorted copies or a substitute virtual table. The canvas renderer owns viewport rendering; this sample still holds all records in memory. It is not server pagination, a maximum capacity claim, or a guarantee of latency or frame rate.

## Inspect and navigate

```ts
const table = window.univerAPI.getActiveBase().getTableById('dispatches')
console.log(table.getRecords().length) // 5000 before adding or deleting records
const ui = window.univerAPI.getBaseUI()
await ui.activateView('all')
console.log(table.getRecordById('dispatch-05000').getValue('name'))
```

Use the native grid scrollbar or scroll wheel to reach the final row. The final record is Books / 05000, Central, Review, 47 units and 848.63 USD. In the installed SDK, `scrollToRecord(id)` does not resolve the record ID: its public options only apply scroll coordinates, and `getRenderedView()` returns null. The lookup above reads data; it does not claim to navigate. Return to the top using explicit public scroll coordinates:

```ts
window.univerAPI.getBaseUI().scrollToRecord('dispatch-00001', { x: 0, y: 0 })
```

The first record is Ceramics / 00001, North, Queued, 0 units, 0 USD and an empty note.

## Edit without replacing the dataset

```ts
const record = window.univerAPI.getActiveBase()
  .getTableById('dispatches').getRecordById('dispatch-05000')
if (!record.setValue('note', 'Checked at archive end')) throw new Error('Update rejected')
console.log(record.getValue('note'))
```

Other fields and records stay unchanged. Reload restores the deterministic sample.

## Filter, sort and group with the public Facade

```ts
const api = window.univerAPI
const view = api.getActiveBase().getTableById('dispatches').getViewById('all')
view.setFilter({
  conjunction: api.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'region', operator: api.Enum.BaseFilterOperator.IS, operand: 'North' }],
})
view.setSort([{ fieldId: 'amount', direction: api.Enum.BaseSortDirection.DESC }])
view.setGroup([{ fieldId: 'state', direction: api.Enum.BaseSortDirection.ASC }])
```

Initially this projection contains 1,000 North records, four status groups of 250 records, and descending amounts within each group. Clear the rules without deleting records:

```ts
const view = window.univerAPI.getActiveBase().getTableById('dispatches').getViewById('all')
view.setFilter(null)
view.setSort([])
view.setGroup([])
```

The intended acceptance scope is initial counts, first/last navigation, a native cell edit, native view switching, filter/sort/group projections and the literal recipes above. Device-dependent timing, sustained editing, concurrent users, cross-browser and accessibility performance are not certified by this workload. Preview and exported source use the same factory, full official English locale packs and CSS.
