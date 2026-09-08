# Marlow / Large grid and bulk data

The native worksheet has **1,000,000 rows and ten columns**, but starts with only
100 fictional reservoir measurements plus headers. Capacity is not populated
cell count. The original deterministic source varies text, decimals, zero flow,
missing pH, negative variance, status and owner. No backend or automatic infinite
loader is involved. No elapsed-time, FPS or memory benchmark is claimed.

Only capacity, load and jump controls are outside the native Grid.
Use native cells, selection and Undo/Redo for editing. Preview and normal export
share this factory, official Core CSS and complete Core English packs. Theme changes
retain the owner and edited workbook.

## 1. Resize capacity without leaving hidden values beyond the boundary

```ts
const book = univerAPI.getWorkbook('marlow-million-grid')
if (!book) throw new Error('The Marlow workbook is unavailable')
const sheet = book.getSheetBySheetId('samples')
if (!sheet) throw new Error('The sample sheet is unavailable')
const rows = 10000
if (rows < sheet.getMaxRows()) {
  sheet.setActiveRange(sheet.getRange(0, 0)).scrollToCell(0, 0)
  const overflow = Object.entries(book.save().sheets[sheet.getSheetId()].cellData ?? {})
    .filter(([row, cells]) => Number(row) >= rows && Object.values(cells).some(cell => cell?.v != null || cell?.f || cell?.p || cell?.si != null))
    .map(([row]) => Number(row)).toSorted((a, b) => a - b)
  for (let i = 0; i < overflow.length; i++) {
    const first = overflow[i]
    let end = first
    while (overflow[i + 1] === end + 1) end = overflow[++i]
    sheet.getRange(first, 0, end - first + 1, sheet.getMaxColumns()).clearContent()
  }
}
sheet.setRowCount(rows)
```

The host choices are 10,000 / 100,000 / 1,000,000. beta.2 setRowCount alone retains
out-of-bounds values. The integration therefore inspects the **actual sparse
snapshot**, groups adjacent populated overflow rows and clears them before
shrinking. It never creates a million-row values array to find those rows.
This also covers more than eight loads, large-then-small overlapping windows and
native edits outside loaded windows. A separate load-history cache would forget
these cells. Formatting may remain: clearContent is not deletion of all metadata.

This is a compound action: clearing each overflow range and resizing are separate
SDK history entries, not an invented atomic capacity transaction. Native Undo can
step through them individually. It does not restore a cached list of windows.

## 2. Bulk-load a deterministic window

```ts
const book = univerAPI.getWorkbook('marlow-million-grid')
if (!book) throw new Error('The Marlow workbook is unavailable')
const sheet = book.getSheetBySheetId('samples')
if (!sheet) throw new Error('The sample sheet is unavailable')
const start = 2000
const count = 250
if (!Number.isInteger(start) || start < 1 || start + count > sheet.getMaxRows()) throw new Error('The window is outside the worksheet')
const values = window.marlowDemo.createRows(start, count)
sheet.getRange(start, 0, count, 10).setValues(values)
sheet.setActiveRange(sheet.getRange(start, 0)).scrollToCell(start, 0)
```

createRows is this example's exported deterministic generator, **not a Facade
API**. The visible loader calls the exact same function from data.ts. A single
setValues writes the selected 250 / 1,000 / 5,000 × 10 block. Repeating a load
overwrites those values; a smaller load does not erase the larger load's tail.
Loading is an explicit user action and may overwrite native edits in that range.

## 3. Navigate without loading values

```ts
const book = univerAPI.getWorkbook('marlow-million-grid')
if (!book) throw new Error('The Marlow workbook is unavailable')
const sheet = book.getSheetBySheetId('samples')
if (!sheet) throw new Error('The sample sheet is unavailable')
const row = Math.floor(sheet.getMaxRows() / 2)
sheet.setActiveRange(sheet.getRange(row, 0)).scrollToCell(row, 0)
```

Facade rows are zero-based; the host's Start row is one-based. Top uses row 2,
Middle uses the capacity midpoint and Bottom fits the whole chunk at the end.
Custom input must be an integer from 2 to the current capacity; near the end it
clamps backward to fit the chosen whole chunk. Empty, fractional and out-of-range
custom input is rejected without changing the workbook. Jump does not populate
empty rows.

## 4. Download the actual sparse workbook JSON (optional integration recipe)

```ts
const book = univerAPI.getWorkbook('marlow-million-grid')
if (!book) throw new Error('The Marlow workbook is unavailable')
const href = URL.createObjectURL(new Blob([JSON.stringify(book.save(), null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = href
link.download = 'marlow-sparse-million-grid.json'
document.body.append(link)
link.click()
link.remove()
setTimeout(() => URL.revokeObjectURL(href), 1000)
```

There is no host download button. Only save is a Facade operation here;
Blob/download are optional browser integration.
This preserves the original workbook ID and current edited values. It is JSON,
not XLSX conversion, and does not claim the size of a workbook with ten million
resident populated cells. JSON serialization omits undefined properties; live
history validation must compare the unmodified model before serialization.

## Strict history boundary

The prior selected native run passed 18 of 21 gates and executed all four
literal recipes. Three complete Undo comparisons fail in beta.2: native typing,
bulk overwrite and clearing A2:J101 with the native Delete key add `t: 1` / `t: 2`
fields to previously untyped cells when undone. Native typing additionally leaves
a style entry. Visible values restore, but complete models do not. All three
Redo snapshots match their edited models exactly. The original data is not padded
with types/styles and snapshots are not normalized to hide these differences.

The 100 initial measurements, actual middle/end canvas values, more than eight
loads, 5,000→250-row overlap tails, native edits outside loaded windows, all three
capacities, invalid custom input, JSON bytes, stable themes, initial Chinese UI
and pending/double disposal have separate positive evidence. Those passes do not
erase the complete-history failures. The retained old panel-based test is not
current native acceptance evidence.

## Running the selected example

`node scripts/test-big-data-preview.mjs` starts and closes only this actual React
Preview on isolated port 4426. Its bounded EN/ZH check uses 10,000-row capacity,
the initial 100 records plus 250 middle rows, native keyboard input in D2, and
exact full edited snapshots through next-themes storage events and unmount.
It does not rerun the 5,000-row end window or the strict history suite below.
This bounded check and the independent export CSS/canvas check pass; neither
clears the previously observed full-history differences or measures performance.

Run the documentation dev:showcase server on port 3030, then
`node scripts/test-marlow-big-data-native.mjs`. The test supports SHOWCASE_DEMO_URL,
SHOWCASE_BASE_URL and SHOWCASE_RESULTS_DIR. Its --prepare command exports only
this case and uses exact-version package junctions without installing dependencies.
Strict SDK history differences remain failures, not normalized snapshots.
