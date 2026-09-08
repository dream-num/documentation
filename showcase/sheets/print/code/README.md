# Portfolio print

Five original stock, fund and bond positions share an eleven-column portfolio. Negative returns, date formats, column widths and all ten original resource entries remain intact. A7 is an ordinary report caption, not an invisible print shortcut. The original drawing resource is empty; no images or persisted print preferences were present.

Use the native ribbon Print entry. Its preview owns paper size, selected cells/workbook scope, orientation, scaling, margins, formatting and headers/footers. CANCEL returns to the same edited workbook. NEXT opens the browser's print workflow; this demo never sends a print job or workbook to a server. The advanced preset's two HTTP Exchange clients are excluded; the remaining original advanced plugins and official CSS remain registered. Trial/licensing behavior is not hidden.

## Executable Facade examples

Run each block independently in the browser console after the native grid loads. `window.univerAPI` is the current owner, also returned by `createPrintDemo`. There are no duplicate host controls. Print layout is session configuration, not part of `workbook.save()`; retain your own layout object if restoring it is required.

### 1. Inspect the original holdings

```ts
const workbook = window.univerAPI.getActiveWorkbook()
console.assert(workbook.getId() === 'oiQGjk')
console.table(workbook.getActiveSheet().getRange('A1:K6').getValues())
```

### 2. Open the native print preview with the public async command

```ts
await window.univerAPI.executeCommand('sheet.operation.print-open')
```

### 3. Cancel without recreating the workbook

```ts
window.univerAPI.getActiveWorkbook().closePrintDialog()
```

### 4. A4 landscape, fit the portfolio on one page

```ts
const api = window.univerAPI
const workbook = api.getActiveWorkbook()
workbook.updatePrintConfig({
  area: api.Enum.PrintArea.CurrentSheet,
  subUnitIds: [workbook.getActiveSheet().getSheetId()],
  paperSize: api.Enum.PrintPaperSize.A4,
  direction: api.Enum.PrintDirection.Landscape,
  scale: api.Enum.PrintScale.FitPage,
  customScale: 100,
  freeze: [],
  margin: api.Enum.PrintPaperMargin.Normal,
  marginCustom: { top: 19, bottom: 19, left: 19, right: 19 },
  maxRowsEachPage: Infinity,
  maxColumnsEachPage: Infinity,
})
await api.executeCommand('sheet.operation.print-open')
```

### 5. Print a selected account extract

```ts
const api = window.univerAPI
const workbook = api.getActiveWorkbook()
const sheet = workbook.getActiveSheet()
sheet.getRange('A1:F3').activate()
workbook.updatePrintConfig({
  area: api.Enum.PrintArea.CurrentSelection,
  subUnitIds: [{ id: sheet.getSheetId(), range: sheet.getRange('A1:F3').getRange() }],
  paperSize: api.Enum.PrintPaperSize.Letter,
  direction: api.Enum.PrintDirection.Portrait,
  scale: api.Enum.PrintScale.FitWidth,
  customScale: 100,
  freeze: [],
  margin: api.Enum.PrintPaperMargin.Narrow,
  marginCustom: { top: 6, bottom: 6, left: 6, right: 6 },
  maxRowsEachPage: Infinity,
  maxColumnsEachPage: Infinity,
})
await api.executeCommand('sheet.operation.print-open')
```

### 6. Workbook pagination at original scale

```ts
const api = window.univerAPI
const workbook = api.getActiveWorkbook()
workbook.updatePrintConfig({
  area: api.Enum.PrintArea.workbook,
  subUnitIds: workbook.getSheets().map((sheet) => sheet.getSheetId()),
  paperSize: api.Enum.PrintPaperSize.A4,
  direction: api.Enum.PrintDirection.Portrait,
  scale: api.Enum.PrintScale.Origin,
  customScale: 100,
  freeze: [],
  margin: api.Enum.PrintPaperMargin.Normal,
  marginCustom: { top: 19, bottom: 19, left: 19, right: 19 },
  maxRowsEachPage: 4,
  maxColumnsEachPage: Infinity,
})
await api.executeCommand('sheet.operation.print-open')
```

### 7. Gridlines, alignment and page identifiers

```ts
const api = window.univerAPI
api.getActiveWorkbook().updatePrintRenderConfig({
  gridlines: true,
  hAlign: api.Enum.PrintAlign.Middle,
  vAlign: api.Enum.PrintAlign.Start,
  headerFooter: [api.Enum.PrintHeaderFooter.PageSize, api.Enum.PrintHeaderFooter.WorksheetTitle],
  headerFooterSetting: { topLeft: '', topCenter: '', topRight: '', bottomLeft: '', bottomCenter: '', bottomRight: '' },
})
```

### 8. Edit a holding through the same public API

```ts
window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2').setValue('Michael Wang — reviewed')
```

### 9. Undo and redo a data edit

```ts
await window.univerAPI.undo()
await window.univerAPI.redo()
```

### 10. Switch theme on the existing owner

```ts
const api = window.univerAPI
api.toggleDarkMode(true)
api.toggleDarkMode(false)
```

### 11. Download the complete workbook, including resources

```ts
const snapshot = window.univerAPI.getActiveWorkbook().save()
const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'portfolio.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 1000)
```

### 12. Destroy and recreate the complete owner

In `/src/index.ts`, where `container` and mutable `demo` are in scope:

```js
const snapshot = structuredClone(demo.univerAPI.getActiveWorkbook().save())
const darkMode = demo.univerAPI.isDarkMode()
const locale = demo.univerAPI.getCurrentLocale()
demo.dispose()
demo = createPrintDemo(container, darkMode, locale, snapshot)
await demo.ready
```

Compare the complete before/after snapshots without removing IDs, resources or default fields. Print preferences are not silently appended to workbook JSON. History belongs to the disposed owner; a newly edited workbook must have fresh, independently working history.

## Output and scope

At original scale, the eleven-column portfolio can span pages horizontally. Choose **Fit to width** to keep its columns together, or use the selected-range recipe for a smaller extract. Inspect the native preview before proceeding to the browser print dialog.

Browser-generated pages do not verify physical printer output or a particular PDF driver. Print preferences are session state, not persisted workbook data. This example does not demonstrate server-side conversion or Office file export.

For the standalone exported demo, run `npm install` followed by `npm run dev` in its directory.
