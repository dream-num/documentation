# Cedar field station: native cell and floating images

Native UI and authored data are English-only. Earlier bilingual/native reports below are historical evidence, not acceptance of this migration.

Run `pnpm install`, `pnpm dev`; `pnpm build` / `pnpm preview` produce the standalone frontend.
Preview/export share one factory, the official core/drawing preset CSS and complete English preset packs.
The SDK UI and authored content stay English on every host language. Theme changes keep the same SDK owner and current edits.

## Original business document

Three original embedded SVG illustrations represent a ridge route, sensor badge and safety tag. A4:A6 contain real cell-rich-text images; E4 onward holds three independent native floating drawings with wide, square and portrait proportions. The two-sheet Cedar inventory retains decimal mass, zero sensor stock, Éloïse's tag, the packed-mass formula and a separate checklist. No remote assets are required.

Use the native Grid ribbon and image context menu: select a drawing, drag its body or resize handles, open image properties, and use native Undo/Redo. There is no host image selector, property form, fixture switch, history toolbar or raw-data panel.

## Literal Facade variants

Run these blocks in order on a fresh demo. Block 1 retains the original sources; local file selection is optional but the next local insertion requires a valid selection. Save needed work before the final document replacements. The detached builder is a real SDK path, not a rendered substitute: it avoids mutating live nested data before `updateImages` captures history.

### 1. Read the two image models and retain original sources

```ts
window.cedarSources = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImages().map(image => image.toBuilder().getSource())
window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getDrawingLayout()
window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getRange('A4:A6').getCellDataGrid()
```

### 2. Stretch to a square

```ts
if (!await window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById('cedar-route').setSizeAsync(120, 120)) throw new Error('Size rejected')
```

### 3. Restore the wide dimensions

```ts
if (!await window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById('cedar-route').setSizeAsync(240, 120)) throw new Error('Size rejected')
```

### 4. Move the route to G6 with offsets

```ts
if (!await window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById('cedar-route').setPositionAsync(5, 6, 12, 12)) throw new Error('Position rejected')
```

### 5. Crop all four edges

```ts
{
  const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory')
  const image = sheet.getImageById('cedar-route')
  const detached = structuredClone(await image.toBuilder().buildAsync())
  const builder = sheet.newOverGridImage().setImage(detached).setPlacement(structuredClone(image.getPlacement()))
  builder.setCropTop(20).setCropLeft(20).setCropBottom(20).setCropRight(20)
  sheet.updateImages([await builder.buildAsync()])
}
```

Crop values use the SDK crop convention; inspect actual pixels, not merely crop properties.

### 6. Restore uncropped source

```ts
{
  const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory')
  const image = sheet.getImageById('cedar-route')
  const detached = structuredClone(await image.toBuilder().buildAsync())
  const builder = sheet.newOverGridImage().setImage(detached).setPlacement(structuredClone(image.getPlacement()))
  builder.setCropTop(0).setCropLeft(0).setCropBottom(0).setCropRight(0)
  sheet.updateImages([await builder.buildAsync()])
}
```

### 7. Rotate 30 degrees

```ts
{
  const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory')
  const image = sheet.getImageById('cedar-route')
  const detached = structuredClone(await image.toBuilder().buildAsync())
  const builder = sheet.newOverGridImage().setImage(detached).setPlacement(structuredClone(image.getPlacement()))
  builder.setRotate(30)
  sheet.updateImages([await builder.buildAsync()])
}
```

### 8. Restore upright orientation

```ts
{
  const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory')
  const image = sheet.getImageById('cedar-route')
  const detached = structuredClone(await image.toBuilder().buildAsync())
  const builder = sheet.newOverGridImage().setImage(detached).setPlacement(structuredClone(image.getPlacement()))
  builder.setRotate(0)
  sheet.updateImages([await builder.buildAsync()])
}
```

### 9. Replace the route source with the sensor

```ts
{
  const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory')
  const image = sheet.getImageById('cedar-route')
  const detached = structuredClone(await image.toBuilder().buildAsync())
  const builder = sheet.newOverGridImage().setImage(detached).setPlacement(structuredClone(image.getPlacement()))
  builder.setSource(window.cedarSources[1], window.univerAPI.Enum.ImageSourceType.BASE64)
  sheet.updateImages([await builder.buildAsync()])
}
```

### 10. Restore the route source

```ts
{
  const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory')
  const image = sheet.getImageById('cedar-route')
  const detached = structuredClone(await image.toBuilder().buildAsync())
  const builder = sheet.newOverGridImage().setImage(detached).setPlacement(structuredClone(image.getPlacement()))
  builder.setSource(window.cedarSources[0], window.univerAPI.Enum.ImageSourceType.BASE64)
  sheet.updateImages([await builder.buildAsync()])
}
```

### 11. Move with cells

```ts
{
  const image = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById('cedar-route')
  const bounds = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getDrawingLayout().drawings.find(item => item.drawingId === image.getId()).bounds
  if (!image.setPlacement({ kind: window.univerAPI.Enum.SheetDrawingAnchorType.Position, bounds })) throw new Error('Placement rejected')
}
```

### 12. Force row 6 to 150 pixels

```ts
window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').setRowHeightsForced(5, 1, 150)
```

Forced height differs from content-aware auto-height; 90px may clip the portrait cell image.

### 13. Undo the row-height change

```ts
window.univerAPI.getActiveWorkbook().undo()
```

### 14. Move and size with cells

```ts
{
  const image = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById('cedar-route')
  const bounds = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getDrawingLayout().drawings.find(item => item.drawingId === image.getId()).bounds
  if (!image.setPlacement({ kind: window.univerAPI.Enum.SheetDrawingAnchorType.Both, bounds })) throw new Error('Placement rejected')
}
```

### 15. Force row 6 to 150 pixels

```ts
window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').setRowHeightsForced(5, 1, 150)
```

Forced height differs from content-aware auto-height; 90px may clip the portrait cell image.

### 16. Undo the row-height change

```ts
window.univerAPI.getActiveWorkbook().undo()
```

### 17. Fixed absolute coordinates

```ts
{
  const image = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById('cedar-route')
  const bounds = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getDrawingLayout().drawings.find(item => item.drawingId === image.getId()).bounds
  if (!image.setPlacement({ kind: window.univerAPI.Enum.SheetDrawingAnchorType.None, bounds })) throw new Error('Placement rejected')
}
```

### 18. Force row 6 to 150 pixels

```ts
window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').setRowHeightsForced(5, 1, 150)
```

Forced height differs from content-aware auto-height; 90px may clip the portrait cell image.

### 19. Undo the row-height change

```ts
window.univerAPI.getActiveWorkbook().undo()
```

### 20. Overlap the sensor with the route

```ts
if (!await window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById('cedar-sensor').setPositionAsync(5, 6, 12, 12)) throw new Error('Overlap rejected')
```

### 21. Forward one layer

```ts
if (!window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById('cedar-route').setForward()) throw new Error('Layer command rejected')
```

A layer-boundary command may be a successful no-op; visible effects require overlapping drawings.

### 22. Backward one layer

```ts
if (!window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById('cedar-route').setBackward()) throw new Error('Layer command rejected')
```

A layer-boundary command may be a successful no-op; visible effects require overlapping drawings.

### 23. Bring to front

```ts
if (!window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById('cedar-route').setFront()) throw new Error('Layer command rejected')
```

A layer-boundary command may be a successful no-op; visible effects require overlapping drawings.

### 24. Send to back

```ts
if (!window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById('cedar-route').setBack()) throw new Error('Layer command rejected')
```

A layer-boundary command may be a successful no-op; visible effects require overlapping drawings.

### 25. Insert a cell image into a rectangle

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getRange('A4:B5')
  range.activate()
  if (!await range.insertCellImageAsync(window.cedarSources[2])) throw new Error('Cell image rejected')
}
```

Only the top-left cell receives the image; neighboring equipment text must survive.

### 26. Insert at the final cell

```ts
{
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getRange('L36')
  range.activate()
  if (!await range.insertCellImageAsync(window.cedarSources[1])) throw new Error('Boundary cell rejected')
}
```

### 27. Clear only the final cell

```ts
window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getRange('L36').clearContent()
```

### 28. Download the original single-cell image

```ts
if (!await window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getRange('A4').saveCellImagesAsync()) throw new Error('Cell download rejected')
```

The SDK may suggest A4.png while preserving SVG bytes. This is not PNG conversion; retain the strict format/extension failure.

### 29. Reject download from an empty cell

```ts
if (await window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getRange('L36').saveCellImagesAsync()) throw new Error('An empty cell must not download an image')
```

### 30. Insert a new floating drawing

```ts
{
  const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory')
  const drawing = await sheet.newOverGridImage().setSource(window.cedarSources[2], window.univerAPI.Enum.ImageSourceType.BASE64)
    .setColumn(9).setRow(8).setWidth(72).setHeight(120).buildAsync()
  window.cedarInsertedId = drawing.drawingId
  sheet.insertImages([drawing])
}
```

### 31. Remove the newly inserted drawing

```ts
if (!window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getImageById(window.cedarInsertedId).remove()) throw new Error('Remove rejected')
```

### 32. Choose a validated local PNG/JPEG source

```ts
{
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/png,image/jpeg'
  const file = await new Promise(resolve => {
    input.addEventListener('change', () => resolve(input.files?.[0] ?? null), { once: true })
    input.addEventListener('cancel', () => resolve(null), { once: true })
    input.click()
  })
  if (file) {
    if (!['image/png', 'image/jpeg'].includes(file.type) || !file.size || file.size > 2 * 1024 * 1024) throw new Error('Choose a non-empty PNG/JPEG up to 2 MiB')
    const bytes = new Uint8Array(await file.arrayBuffer())
    const png = [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)
    const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
    if (!(file.type === 'image/png' ? png : jpeg)) throw new Error('Image signature mismatch')
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    bitmap.close()
    if (width > 4096 || height > 4096) throw new Error('Image dimensions exceed 4096px')
    let binary = ''
    for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192))
    window.cedarLocalSource = 'data:' + file.type + ';base64,' + btoa(binary)
  }
}
```

This temporary file picker is a browser integration example, not a second editor panel. Cancellation/invalid input changes neither workbook nor prior source. Nothing uploads.

### 33. Insert the local source into A6

```ts
{
  if (!window.cedarLocalSource) throw new Error('Choose a valid local image first')
  const range = window.univerAPI.getActiveWorkbook().getSheetBySheetId('inventory').getRange('A6')
  range.activate()
  if (!await range.insertCellImageAsync(window.cedarLocalSource)) throw new Error('Local source rejected')
}
```

### 34. Save the full local snapshot

```ts
window.cedarSnapshot = structuredClone(window.univerAPI.getActiveWorkbook().save())
```

### 35. Reload the exact snapshot and retain IDs

```ts
{
  const api = window.univerAPI
  api.disposeUnit(api.getActiveWorkbook().getId())
  api.createWorkbook(structuredClone(window.cedarSnapshot))
}
```

No regenerated document ID and no coordinate correction. Absolute placement round-trip remains a separately checked SDK limitation; native history is not serialized.

### 36. Open a genuinely blank two-sheet document

```ts
{
  const api = window.univerAPI
  api.disposeUnit(api.getActiveWorkbook().getId())
  api.createWorkbook({ id: window.cedarSnapshot.id, name: 'Empty Cedar inventory', sheetOrder: ['inventory', 'checks'], sheets: {
    inventory: { id: 'inventory', name: 'Field inventory', rowCount: 36, columnCount: 12, cellData: {} },
    checks: { id: 'checks', name: 'Reference', rowCount: 20, columnCount: 8, cellData: {} },
  } })
}
```

### 37. Restore the saved edited inventory

```ts
{
  const api = window.univerAPI
  api.disposeUnit(api.getActiveWorkbook().getId())
  api.createWorkbook(structuredClone(window.cedarSnapshot))
}
```

## Strict acceptance boundary

Original unmet requirements remain explicit: beta.2 direct `setCrop`, `setRotate` and `setSource` have paint/history defects; absolute placement may shift by header offsets after save/reload; SVG bytes may download with a .png extension. The dedicated native regression must retain those failures independently of successful builder variants and unchanged authored spreadsheet content.

### Current independent evidence

The 16 failed assertions are intentionally not hidden:

- Four raw serialized-history checks (native drag/properties, builder rotation/source) differ in JSON object-key order.
  Separate complete parsed-resource comparisons pass; they retain every value and ID. Raw failures are still reported.
- Direct crop, rotation and source setters each fail actual repaint, raw history and parsed-resource history (nine assertions).
  These are real content/history defects, not merely JSON ordering; detached-builder examples remain separate.
- SVG cell download preserves SVG bytes but supplies a .png filename.
- Absolute placement reload changes bounds by +46px X / +20px Y and fails the complete snapshot check.
  Authored cell/checklist content and workbook ID remain intact; no coordinate correction is applied.
