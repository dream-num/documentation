# Viewport and Zoom

Three native worksheets separate display scale, scroll position and selection. Choose percentages from the bottom-right zoom dropdown, and use native scrollbars, wheel and name box; there are no replacement controls. This is not a large-data loading benchmark or a freeze-configuration tutorial. Use the dropdown options rather than typing percent text: the installed zoom input interprets typed `75%` as a ratio and clamps it to 400%.

- **Reading density** contains collection supplies. Compare 75%, 100% and 150%: smaller zoom exposes more cells in the same container. D5 starts at 21 (`=B5-C5`); zooming does not change the input values or formulas.
- **Wide schedule** contains thirty weeks of exhibition work. Scroll horizontally while watching the name box: viewing a different region is not selecting it. Enter AA12 in the name box to navigate and select a distant cell.
- **Frozen routes** has four frozen rows and two frozen columns. Scroll down/right, then zoom. The depot/route identities and header rows remain anchored while the main viewport changes size.

## Public recipes

Reload before each block. Activate the target sheet before using viewport APIs. These APIs inspect the rendered active worksheet; they are not a reliable background-sheet layout measurement. Let rendering settle before inspecting the resulting range or scroll state. Exact visible row/column counts depend on the container size and zoom, so they are not hard-coded expectations.

### 1. See more cells at 75%

```ts
const workbook = window.univerAPI.getActiveWorkbook()
const sheet = workbook.setActiveSheet('density')
sheet.zoom(0.75)
```

After rendering, `sheet.getZoom()` is 0.75. Compare `sheet.getVisibleRange()` with the initial 100% range: more rows and columns fit. D5 remains 21. Native zoom controls make the same type of change.

### 2. Inspect larger cells at 150%

```ts
const workbook = window.univerAPI.getActiveWorkbook()
const sheet = workbook.setActiveSheet('density')
sheet.zoom(1.5)
```

After rendering, `sheet.getZoom()` is 1.5 and fewer rows/columns fit than at 100%. Values, formulas, row heights and column widths remain stored unchanged; zoom changes their screen scale. The installed public `zoom()` method clamps numeric ratios to 0.1–4.0.

### 3. Scroll without selecting the destination

```ts
const workbook = window.univerAPI.getActiveWorkbook()
const sheet = workbook.setActiveSheet('wide')
sheet.setActiveRange(sheet.getRange('B5'))
sheet.scrollToCell(11, 26)
```

The viewport moves toward AA12 (zero-based row 11, column 26), but B5 remains the selection. Inspect `sheet.getScrollState()` after rendering. Scrolling is constrained near sheet edges; it is not a promise that every target always becomes the exact top-left visible cell. The schedule data are already present and are not populated during navigation.

### 4. Select and reveal a destination explicitly

```ts
const workbook = window.univerAPI.getActiveWorkbook()
const sheet = workbook.setActiveSheet('wide')
sheet.setActiveRange(sheet.getRange('AA12'))
sheet.scrollToCell(11, 26)
```

AA12 is now selected as well as visible. Compare with the previous recipe, or perform the same navigation through the native name box. No cells are edited by either recipe.

### 5. Zoom and scroll a frozen viewport

```ts
const workbook = window.univerAPI.getActiveWorkbook()
const sheet = workbook.setActiveSheet('frozen')
sheet.zoom(0.75)
await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
sheet.scrollToCell(24, 12)
```

The frame wait lets zoom rendering finish before scrolling; issuing both operations in the same task can reset the requested scroll. After rendering, compare `sheet.getVisibleRange()` (main viewport) with `sheet.getVisibleRangesOfAllViewports()` (a Map of viewport keys to ranges). The main viewport starts at row 25 / column M in this sample, while the frozen corner, header strip and identity strip remain separate. `sheet.getFreeze()` still records four frozen rows and two frozen columns; zoom does not change that configuration. Return to the native zoom dropdown and compare 100% and 150% while scrolling. This example does not claim arbitrary split panes or synchronized windows.
