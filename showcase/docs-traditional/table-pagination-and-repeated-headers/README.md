# Table Pagination and Repeated Headers

Three native tables contain identical original archive data: two introductory rows and 18 distinct records. The tables mark zero, one or two leading rows as headers. Short physical pages force each table to continue across page boundaries. The SDK controls pagination; no copied header paragraphs, page images or separate continuation tables are used.

Scroll to each table's continuation page and compare its top rows. Each new specimen begins after a native paragraph page break. Exact page count and row boundaries can change when text is edited or row dimensions change. Header shading is the same in all specimens so color alone does not imply repetition.

## Repeat both leading rows in the reference

```ts
const table = window.univerAPI.getActiveDocument().getTable('none')
if (!table.setHeaderRowCount(2)) throw new Error('Header update rejected')
console.log(table.getHeaderRowCount()) // 2
```

## Stop repeating the two-row header

```ts
const table = window.univerAPI.getActiveDocument().getTable('two')
if (!table.setHeaderRowCount(0)) throw new Error('Header update rejected')
console.log(table.getHeaderRowCount()) // 0
```

## Pin two rows using the equivalent public API

```ts
const table = window.univerAPI.getActiveDocument().getTable('one')
if (!table.pinHeaderRows(2)) throw new Error('Header update rejected')
console.log(table.getHeaderRowCount()) // 2
```

These operations change leading-row metadata, not the 20-row dataset. Other tables and narrative remain independent. Click an archive record to edit it natively; reload restores all original records and header settings. This sample covers header repetition, not arbitrary row-splitting rules, merged cells across page boundaries, or a complete print/export fidelity matrix. Preview and source share the same factory with full official English locales and CSS.
