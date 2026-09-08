# Cedar / Document Tables

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

The Seed Library Pilot now contains all three original decision datasets at once: packing, inventory reconciliation and weekend handoff. A fourth, independent packaging comparison table sits beside a two-column narrative. The original CC0 SVG illustration and all three native collection charts preserve the different packet counts. Table IDs, original chart/image IDs and business content are retained; new comparison instances have stable descriptive IDs. Nothing is rendered as host HTML.

Use the native Grid and the table's native controls to select and edit. There are no dataset loaders, row/column/cell forms, duplicate history/reset controls or readback panels. The factory waits for Rendered before inserting drawing content. Preview and export share that factory, all five official stylesheets and five complete English packs. Theme changes keep the owner and its edits. No internal history clearing, fit-width controller or replacement unit ID is used. Native zoom remains available; automatic narrow-screen fit is not claimed.

## Literal Facade recipes

The initial nonempty narrative uses the public `body.columnGroups` model and column stream tokens in `data.ts`. Its public `documentStyle.autoHyphenation` is explicitly false: this short-label decision memo does not need automatic hyphenation. With automatic hyphenation enabled, beta.2 can throw while laying out columns (an empty line has no final divide). This is an explicit layout choice, not an SDK fix; the isolated regression remains strict. Recipes 24–25 exercise the actual column Facades independently.

Run 1 first in the preview/export console. Each recipe is an independent experiment unless an order is stated; reload between experiments. They use live targets, never a cached snapshot as an editing substitute. Return values, complete history and actual paint are separate checks. The original owner-row operation deliberately remains an insertion plus four text mutations, not an atomic history transaction.

### 1. Resolve live targets and capture the baseline

```ts
window.cedarSaved = structuredClone(window.univerAPI.getActiveDocument().save())
window.cedarDoc = () => window.univerAPI.getActiveDocument()
window.cedarTable = () => {
  const table = window.cedarDoc().getTable('cedar-decisions')
  if (!table) throw new Error('Decision register is absent')
  return table
}
window.cedarRequire = (result, message) => { if (!result) throw new Error(message) }
```

### 2. Assign the coordinator

```ts
window.cedarRequire(window.cedarTable().setCellText(1, 1, 'Mara Chen — coordinator'), 'Cell edit failed')
```

### 3. Leave an owner intentionally unassigned

```ts
window.cedarRequire(window.cedarTable().setCellText(1, 1, ''), 'Empty cell edit failed')
```

### 4. Select real cell text for native keyboard input

```ts
const range = window.cedarTable().getCellContentRange(1, 1)
if (!range) throw new Error('No editable cell content range')
window.cedarDoc().setSelection(range.startOffset, range.endOffset)
```

### 5. Add accessibility sign-off once

```ts
const table = window.cedarTable()
const values = ['Accessibility sign-off', 'Lena', '11 Apr 2027', 'Scheduled']
if (!Array.from({length:table.getRowCount()}, (_, row) => table.getCellText(row, 0)).includes(values[0])) {
  window.cedarRequire(table.appendRow(), 'Owner row insertion failed')
  const row = table.getRowCount() - 1
  values.forEach((text,column) => window.cedarRequire(table.setCellText(row,column,text), 'Owner cell edit failed'))
}
```

### 6. Remove a body decision with a header guard

```ts
window.cedarDeleteBodyRow = row => {
  const table = window.cedarTable()
  if (!Number.isInteger(row) || row < 1 || row >= table.getRowCount()) throw new RangeError('Choose a body row, not header row 0')
  window.cedarRequire(table.deleteRow(row), 'Row deletion failed')
}
window.cedarDeleteBodyRow(2)
```

### 7. Give the owner column more room

```ts
window.cedarWidth = (column,width) => {
  const table = window.cedarTable()
  if (!Number.isInteger(column) || column < 0 || column >= table.getColumnCount() || !Number.isInteger(width) || width < 60 || width > 360) throw new RangeError('Column or width outside example limits')
  window.cedarRequire(table.setColumnWidth(column,width), 'Column resize failed')
}
window.cedarWidth(1,180)
```

### 8. Reserve vertical space for a review note

```ts
window.cedarHeight = (row,height) => {
  const table = window.cedarTable()
  if (!Number.isInteger(row) || row < 0 || row >= table.getRowCount() || !Number.isInteger(height) || height < 24 || height > 160) throw new RangeError('Row or height outside example limits')
  window.cedarRequire(table.setRowHeight(row,height), 'Row resize failed')
}
window.cedarHeight(1,72)
```

### 9. Mark the decision header in warm cream

```ts
const table = window.cedarTable()
window.cedarRequire(table.setCellBackground(table.getRowRange(0),'#FEF3C7'), 'Header fill failed')
```

### 10. Equal-width comparison columns

```ts
window.cedarRequire(window.cedarTable().distributeColumns(), 'Column distribution failed')
```

### 11. Add a deep-sea border to the register

```ts
window.cedarRequire(window.cedarTable().setTableBorder({preset:window.univerAPI.Enum.DocsTableBorderPreset.All,color:'#176B78',width:2}), 'Table border failed')
```

### 12. Highlight the header's bottom boundary

```ts
const table = window.cedarTable()
window.cedarRequire(table.setBorder(table.getRowRange(0),{preset:window.univerAPI.Enum.DocsTableBorderPreset.Bottom,color:'#B84E3A',width:3}), 'Header border failed')
```

### 13. Add a review-channel column

```ts
const table = window.cedarTable()
window.cedarRequire(table.appendColumn(), 'Column insertion failed')
const column = table.getColumnCount()-1
window.cedarRequire(table.setCellText(0,column,'Review channel'), 'Column header failed')
window.cedarRequire(table.setCellText(1,column,'Desk meeting'), 'Review channel failed')
```

### 14. Remove the outcome column

```ts
window.cedarRequire(window.cedarTable().deleteColumn(3), 'Column deletion failed')
```

### 15. Delete only the packing decision table

```ts
window.cedarRequire(window.cedarTable().deleteTable(), 'Table deletion failed')
```

### 16. Reinsert the original packing matrix without duplicates

Run 15 first to see insertion. Other tables, charts, image and narrative stay independent.

```ts
const doc = window.cedarDoc()
if (!doc.getTable('cedar-decisions')) {
  const marker = doc.getParagraphs().filter(p=>p.getText()==='Inventory reconciliation')
  if (marker.length!==1) throw new Error('Missing packing insertion anchor')
  const table = doc.insertTableFromData([
    ['Decision','Owner','Due','Outcome'],
    ['Use paper envelopes','Mara','02 Apr 2027','Approved'],
    ['Separate fragrant varieties','Ivo','04 Apr 2027','Trial batch'],
    ['Add large-print labels','Nia','06 Apr 2027','Review pending'],
  ],{tableId:'cedar-decisions',offset:marker[0].getRange().startOffset,columnWidths:[220,140,120,220],width:700,headerRowCount:1})
  window.cedarRequire(table, 'Packing insertion failed')
  window.cedarRequire(table.setCellBackground(table.getRowRange(0),'#DBEAFE'), 'Packing header failed')
}
```

### 17. Inspect all four native tables

```ts
for (const id of ['cedar-decisions','cedar-inventory','cedar-handoff','cedar-comparison']) {
  const table=window.cedarDoc().getTable(id)
  if (!table) throw new Error('Missing table: '+id)
  console.log(table.describe(),table.getSource(),table.getCellContentRange(1,1))
}
```

### 18. Missing IDs leave content unchanged

```ts
if (window.cedarDoc().getTable('missing-table') !== null) throw new Error('Unexpected missing-ID result')
```

### 19. Undo the actual preceding SDK operation

```ts
window.cedarRequire(window.cedarDoc().undo(), 'SDK Undo did not complete')
```

### 20. Redo the actual SDK operation

```ts
window.cedarRequire(window.cedarDoc().redo(), 'SDK Redo did not complete')
```

### 21. Inspect independent native narrative, illustration and charts

```ts
const doc = window.cedarDoc()
console.log(doc.getColumnGroups().map(group=>group.describe()))
console.log(doc.getCharts().map(chart=>chart.getInfo()))
console.log(doc.save().drawings)
```

### 22. Save complete edited data, including all resources

```ts
window.cedarEdited = structuredClone(window.cedarDoc().save())
if(window.cedarEdited.id!=='cedar-table-demo') throw new Error('Unexpected document ID')
```

### 23. Prepare an explicitly empty document

Pass this model as the factory's optional third parameter after disposing the old owner. It intentionally has no tables, charts or drawings.

```ts
window.cedarEmpty = {id:'cedar-table-empty',title:'Cedar — empty draft',documentStyle:structuredClone(window.cedarSaved.documentStyle),body:{dataStream:'\r\n',paragraphs:[{startIndex:0,paragraphId:'cedar-empty-paragraph'}],textRuns:[],sectionBreaks:[{startIndex:1}]}}
```

### 24. Insert a separate follow-up comparison

```ts
const doc = window.cedarDoc()
if (!doc.getColumnGroup('cedar-followup-columns')) {
  const group = doc.insertColumnGroup(2,{columnGroupId:'cedar-followup-columns',columnIds:['cedar-followup-desk','cedar-followup-home'],gap:24,widthRatios:[1,1]})
  window.cedarRequire(group, 'Column insertion returned no group')
}
```

### 25. Write a real narrative column

```ts
const column = window.cedarDoc().getColumnGroup('cedar-packaging-narrative')?.getColumn('cedar-desk')
if (!column) throw new Error('Missing desk narrative')
window.cedarRequire(column.setText('At the desk\nVolunteers compare labels before the Saturday seed swap.'), 'Narrative text edit failed')
```

## Whole-owner recovery

Capture `controller.univerAPI.getActiveDocument().save()`, call `controller.dispose()`, then call `createDemo(container, darkMode, saved)`. Pass the complete edited model or captured baseline unchanged: original ID, all table/chart/column resources and drawings are retained. This is explicit recovery, not Undo, and full raw snapshot equality remains a strict gate. The optional saved input is validated before creating an editor; dispose is idempotent and a disposal before Rendered prevents late initialization. No internal service is used to clear or repair history.

## Verification boundary

`node scripts/test-cedar-tables-native.mjs [selected-export-manifest.json]` runs actual native input/menu/paint, literal table operations and complete saved-model comparisons. Default URL is localhost:3030/en-US/playground/docs-modern/document-tables; SHOWCASE_DEMO_URL, SHOWCASE_BASE_URL, SHOWCASE_HARNESS_URL and SHOWCASE_RESULTS_DIR support isolated selected exports. The lifecycle harness imports the identical factory. Known beta.2 cell-text Undo remains strict; no observe-mode success or snapshot normalization is permitted. Trial watermarks stay visible and source data never executes as code.
