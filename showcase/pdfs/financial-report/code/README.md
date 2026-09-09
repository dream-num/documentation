# Asteria financial report: native front-end review

Run `pnpm install`, `pnpm dev`; production verification uses `pnpm build` and `pnpm preview`.
Preview and standalone export mount the same factory with five official CSS bundles and five full English packs.
Native UI and authored data remain English under any host page language. Theme changes keep the same SDK owner and document edits. Bilingual evidence below is historical, not current English-only acceptance.

The fourteen original FY2026 sections in `data.ts` are unchanged: performance, income statement, financial position,
cash flow, operating segments, recognition, margins, liquidity, working capital, projects, currency exposure,
provisions, policies and illustrative assurance. Figures are fictional editable text, not live financial data,
spreadsheet calculations, an investment recommendation or an audit opinion.

## Native workflow

Use the native page thumbnails, Editing/Selection modes, annotation tools, Properties and Undo/Redo.
There are no host fixture selectors, sample-write buttons, history replicas or JSON inspector panels.
Page 7 distinguishes operating margin (16.9%) from adjusted EBITDA margin (22.4%). A durable annotation
marks its actual paragraph bounds without changing the paragraph words. Opacity zero hides paint, not the object.

This case does not register Exchange or any upload/remote conversion service. There is no exported proxy.
The installed PDF Exchange service delegates binary conversion to HTTP; it is not an offline converter.
Local JSON snapshots are deliberately NOT described as binary PDF import/export. Printing, threaded comments
and accessibility are not certified here, and unavailable operations are not simulated. Trial watermarks remain.

## Runnable Facade examples

Run these blocks in order on a fresh demo in DevTools against `window.univerAPI`.
Each block is literal JavaScript within a TypeScript code fence. The browser console supports top-level await.
Block 10 intentionally throws; the saved state must stay unchanged. Blocks 14-15 replace the active PDF,
so first save anything you need; restoration preserves content, not undo history or viewport position.

### 1. Read all sections and real table values

```ts
window.univerAPI.getActivePdf().getPages().map(page => ({ id: page.getId(), titles: page.getTextBoxes().map(text => text.getText()), rows: page.getTables().map(table => Array.from({ length: table.getRowCount() }, (_, row) => Array.from({ length: table.getColumnCount() }, (_, column) => table.getCell(row, column).getText()))) }))
```

### 2. Revise the overview title

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getTextBoxes().find(text => text.getId() === 'title-0').setText('Annual performance overview - reviewed')
```

### 3. Undo that revision

```ts
await window.univerAPI.undo()
```

### 4. Redo that revision

```ts
await window.univerAPI.redo()
```

### 5. Update the overview's net-debt scenario

This modifies one PDF table cell, not the debt discussion or other statement totals. No recalculation is implied.

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getTables()[0].getCell(6, 1).setText('183.0')
```

### 6. Undo the isolated table scenario

```ts
await window.univerAPI.undo()
```

### 7. Mark page 7's current margin paragraph

Navigate to page 7 using native thumbnails to see the result. Coordinates are PDF points, not CSS pixels.

```ts
{
  const api = window.univerAPI
  const page = api.getActivePdf().getPageByIndex(6)
  const paragraph = page.getParagraphs().find(item => item.getId() === 'margin-note')
  page.insertAnnotation({ id: 'margin-review', annotationType: api.Enum.PdfAnnotationType.HIGHLIGHT, ...paragraph.getTransform() }).setStyle({ fill: { color: '#FACC15' }, opacity: 0.4 })
}
```

### 8. Hide paint while retaining the durable mark

Insertion and the subsequent style patch are separate native history entries; Undo them separately when exploring manually.

```ts
window.univerAPI.getActivePdf().getPageByIndex(6).getAnnotations().find(mark => mark.getId() === 'margin-review').setStyle({ opacity: 0 })
```

### 9. Restore the mark with a different review color

```ts
window.univerAPI.getActivePdf().getPageByIndex(6).getAnnotations().find(mark => mark.getId() === 'margin-review').setStyle({ fill: { color: '#2DD4BF' }, opacity: 0.45 })
```

### 10. Reject an invalid opacity (intentional error)

```ts
window.univerAPI.getActivePdf().getPageByIndex(6).getAnnotations().find(mark => mark.getId() === 'margin-review').setStyle({ opacity: 1.5 })
```

### 11. Save an editable local snapshot

```ts
window.asteriaSavedSnapshot = structuredClone(window.univerAPI.getActivePdf().save())
```

### 12. Download actual JSON, without uploading

```ts
{
  const snapshot = window.univerAPI.getActivePdf().save()
  const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'asteria-review.snapshot.json'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
```

### 13. Reload the current snapshot under the same owner

```ts
{
  const api = window.univerAPI
  const snapshot = api.getActivePdf().save()
  api.disposeUnit(snapshot.id)
  api.createPdf(snapshot)
}
```

### 14. Open a local empty page after saving

```ts
{
  const api = window.univerAPI
  window.asteriaSavedSnapshot = structuredClone(api.getActivePdf().save())
  api.disposeUnit(api.getActivePdf().getId())
  api.createPdf({ id: 'asteria-blank-review', name: 'Blank local review' })
}
```

### 15. Restore all saved report pages

```ts
{
  const api = window.univerAPI
  api.disposeUnit(api.getActivePdf().getId())
  api.createPdf(structuredClone(window.asteriaSavedSnapshot))
}
```
