# Linked record picker

Six original field requests borrow from five equipment records. Two devices intentionally share the name **Field recorder**; model and storage context distinguish them in the native picker. All records live in one Base, with no backend or remote lookup.

## Try the native UI

- Select a Primary equipment cell and press F2 to open the native picker and replace its single selection. Open Additional equipment the same way, select several records, then uncheck one to remove it.
- Compare the two Field recorder options: the chip uses the equipment name, while the picker also shows model and storage. Those extra labels do not become stored link values.
- Volunteer training starts with empty links. Select equipment; recipe 4 demonstrates clearing the association through the public API. The single picker replaces a target rather than unchecking it when you select the same option again.
- Switch to Equipment and rename the first recorder to `Dawn recorder`. Return to Requests: the linked chip should resolve the new name while its target ID remains `recorder-north`.
- Open a linked record from its native chip to inspect the target record. This is a record relationship, not a URL hyperlink.

## Executable Facade recipes

Run in the browser console after the demo is ready. Native picker edits and these programmatic commands are separate acceptance paths.

### 1. Replace the single target

```ts
const request = window.univerAPI.getBase('equipment-record-links').getTableById('requests').getRecordById('dawn')
request.setLinkedRecordIds('primary', ['recorder-south'])
console.log(request.getLinkedRecordIds('primary'))
```

### 2. Ordered multiple targets and duplicate removal

```ts
const request = window.univerAPI.getBase('equipment-record-links').getTableById('requests').getRecordById('pond')
request.setLinkedRecordIds('extras', ['tripod', 'meter', 'tripod'])
console.log(request.getLinkedRecordIds('extras'))
```

### 3. Remove one association, not the target record

```ts
const request = window.univerAPI.getBase('equipment-record-links').getTableById('requests').getRecordById('pond')
request.removeLinkedRecord('extras', 'tripod')
console.log(request.getLinkedRecordIds('extras'))
```

### 4. Clear a link

```ts
const request = window.univerAPI.getBase('equipment-record-links').getTableById('requests').getRecordById('training')
request.setLinkedRecordIds('primary', [])
console.log(request.getLinkedRecordIds('primary'))
```

### 5. Change the target label without rewriting relationships

```ts
const base = window.univerAPI.getBase('equipment-record-links')
base.getTableById('equipment').getRecordById('recorder-north').setValue('name', 'Dawn recorder')
console.log(base.getTableById('requests').getRecordById('dawn').getLinkedRecordIds('primary'))
```

Recipe 5 does not reconnect a link changed by recipe 1: label resolution follows the IDs currently stored. Reload first when comparing the original dawn request.

## Scope and persistence

RecordLink stores canonical target IDs; `getLinkedRecordIds()` reads IDs rather than labels. `serializeRecordLinkIds()` authors initial snapshot values. Use the dedicated Facade methods for subsequent edits; a single-link field accepts at most one target and targets must exist in the same Base. Multi-link order is preserved and duplicate IDs keep their first occurrence.

`displayFieldId` chooses one target field for the chip label. `pickerFieldIds` supplies selection context only. This example does not implement reverse relationships, lookup fields, rollup totals, cross-file links or a custom picker. Saving with `base.save()` retains both tables, IDs and field configuration; restoring requires the complete snapshot, not copied display labels.

Preview and export share one factory, five complete English locale packs, four official SDK stylesheets and native Grid UI. Theme changes keep the edited Base owner. No SDK patches or host-side editing controls are included.

## Native acceptance boundary

The installed beta.2 runtime passed native single/multiple selection, removing one multi-link target, and target-name editing with live linked labels on both English and Chinese host pages. In the focused Delete check, the selected single-link cell and native keyboard input were confirmed, but the association remained. The inspected native context menu offered record operations rather than Clear content. These clear-operation checks remain failures; no SDK patch or replacement control hides them. Recipe 4 clears the link successfully through the Facade, which is a separate path.

The focused test compares the entire saved Base through same-owner theme changes and same-ID unit reconstruction. It does not establish outer-factory disposal/recreation or native Undo/Redo parity for record links.
