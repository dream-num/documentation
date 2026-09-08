# Native column layouts

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

Six real column groups show two to five equal columns and two asymmetric layouts. The native Grid ribbon handles interactive editing; the preview adds no host property or diagnostic panel. Preview and standalone entry share `createDemo()`, official styles and English locale bundles. Theme changes preserve edits.

Use the returned API after the gallery is ready:

```ts
const { univerAPI } = demo
const doc = univerAPI.getActiveDocument()
const group = doc?.getColumnGroup('columns-two')
if (!doc || !group) throw new Error('Open the column gallery first.')
```

## 1. Edit a column

```ts
const column = group.getColumn(0)
if (!column?.setText('Heading\rA short paragraph.')) throw new Error('Text edit failed.')
column.appendParagraph('Another paragraph.')
```

## 2. Change proportions

```ts
if (!group.setWidthRatios([2, 1])) throw new Error('Width update failed.')
```

Use one positive finite ratio per column. `[1, 1]` restores equal widths; `[1, 2]` widens the right column.

## 3. Insert a new group

```ts
const anchor = doc.getParagraphs().at(-1)
if (!anchor) throw new Error('Document paragraph is absent.')
const added = doc.insertColumnGroup(3, {
  offset: anchor.getRange().startOffset,
  widthRatios: [1, 1, 1],
  gap: 16,
})
if (!added) throw new Error('Column insertion failed.')
if (!added.getColumn(0)?.setText('First column')) throw new Error('Text edit failed.')
```

Resolve paragraph offsets immediately before insertion; previous edits may have moved them.

## 4. Add or delete a column

```ts
import { ColumnPosition } from '@univerjs-pro/docs-column'

const first = group.getColumn(0)
if (!first) throw new Error('Column is absent.')
const newColumn = group.addColumn(first.getId(), ColumnPosition.RIGHT)
if (!newColumn) throw new Error('Column insertion failed.')
if (!newColumn.setText('New column')) throw new Error('Text edit failed.')
if (!group.deleteColumn(newColumn.getId())) throw new Error('Column deletion failed.')
```

A group supports two to five columns. Deleting a column also removes its text. Column insertion and filling its text are separate history steps.

## 5. Remove a group

```ts
if (!added.remove()) throw new Error('Group removal failed.')
```

Use native Undo/Redo to reverse edits. Removing a group removes its column text.

## Scope and known SDK gaps

Column groups require a MODERN document. Native license notices remain visible. The gallery contains only text, without nested tables, images or charts.

The earlier beta.2 mixed-content example exposed two separate SDK defects: a nested image had an anchor and layout bounds but was hidden by drawing UI; removing its group deleted content anchors while retaining image/table resources, causing same-ID reinsertion conflicts. Removing those fixtures from this focused gallery does **not** fix those defects or demonstrate correct mixed-child cleanup. Their existing regression cases remain separate from this text-only example.
