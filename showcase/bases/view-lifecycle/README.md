# View lifecycle / one table, multiple projections

Borrow Again tracks six original repair-library items. All items shows the complete
record; Dispatch projection hides handover notes and uses compact rows. Scratch
copy starts with the same projection settings, but remains an independent view.
All three tabs share the same records, not three copies of the library.

Use the native tab menu to rename, duplicate or delete Scratch copy. The native
add-view control creates another projection. No host buttons replace these actions.
Deleting a view does not delete its table records. Reload restores authored data.
The installed native Duplicate view action changes an empty `filter: null` to
`filter: undefined` (omitted by JSON serialization). Its copy is therefore not
byte-identical to the source projection; strict comparison records that difference.

## Literal Facade recipes

Run in order, each block in its own scope. Create and activate a new Grid:

```ts
const table = univerAPI.getActiveBase().getTableById('items')
const view = table.createView('Packing review', univerAPI.Enum.BaseViewType.Grid)
await univerAPI.getBaseUI().activateView(view.getId())
console.log(view.getId(), view.getName())
```

Rename that view without changing its ID:

```ts
const table = univerAPI.getActiveBase().getTableById('items')
const view = table.getViewByName('Packing review')
console.log(view.setName('Volunteer handover'), view.getId())
```

Copy the Dispatch projection through `createView` options. There is no claimed
`view.duplicate()` Facade: the native Duplicate view menu is a separate UI action.
The new view gets a fresh ID, while records remain table-owned.

```ts
const table = univerAPI.getActiveBase().getTableById('items')
const source = structuredClone(table.getViewById('dispatch').getView())
const { id, ...settings } = source
const copy = table.createView('Dispatch experiment', source.type, { view: { ...settings, name: 'Dispatch experiment' } })
copy.setFieldVisible('note', true)
await univerAPI.getBaseUI().activateView(copy.getId())
console.log(id, copy.getId(), copy.getView().fieldSettings.note)
```

Delete only the experimental view, activating All items first:

```ts
const table = univerAPI.getActiveBase().getTableById('items')
await univerAPI.getBaseUI().activateView('all')
console.log(table.getViewByName('Dispatch experiment').delete())
console.log(table.getViews().map(view => [view.getId(), view.getName()]))
```

## Scope

Preview and standalone export share one independent factory, five complete English
locale packs and four official stylesheets. Grid is configured; Relational Tables owns its native
toolbar and sidebar. Theme changes do not recreate the owner. No SDK modifications.

Dashboard, personal/locked views, permissions, collaboration, native history and
saved-model reconstruction are not demonstrated. Native menu interaction and literal
recipe acceptance are reported separately; a configured tab alone is not proof of
interaction support.

`scripts/test-base-view-lifecycle.mjs` checks native tab activation, Rename View,
Duplicate view, confirmed Delete view and Add Grid, then all four recipes under
English and Chinese host pages with English SDK UI. Records remain exactly unchanged,
the source Dispatch projection survives the copy edit, and themes preserve the full
saved model and owner. The strict native-copy gate remains failed solely for the
empty-filter representation difference above; no snapshots are normalized to pass it.
