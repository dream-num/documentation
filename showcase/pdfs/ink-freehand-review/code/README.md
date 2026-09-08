# Ink and freehand review

Run `pnpm install`, `pnpm dev`; use `pnpm build` and `pnpm preview` for production verification.
Preview and independent export use the same factory, five official CSS files and five complete English locale packs.
Native UI and authored data stay English regardless of the host page language. Bilingual reports below describe historical revisions, not current English-only acceptance.
Theme changes preserve the current PDF instance, edits and native history.

## Native workflow

This original fictional Meridian studio plan contains two reference routes in an embedded SVG.
They are image content, not erasable ink. Three separate PDF ink annotations question Exit A
(red circle), suggest an alternate route (violet) and mark the legend (clay check).
This is an SDK exercise, not a safety plan or site assessment.

Use Start > Freehand drawing to draw over the blank review legend. Exit the drawing tool,
click a stroke in Selection mode, and open View > Properties to inspect the native selection.
Use the native Undo/Redo controls to reverse and restore edits. A single ink annotation may
contain multiple paths; deleting it removes the whole object, not an individual path segment.
There are no host-side drawing, property, history, fixture or audit controls.

## Executable Facade variants

Run these TypeScript/JavaScript blocks in order against a fresh demo using browser DevTools.
Each block stands alone and uses the same live `window.univerAPI` exposed by the factory.
No local counters or simulated calculations stand in for SDK data.

### 1. Read the three original review strokes

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().map(mark => ({
  id: mark.getId(), type: mark.getAnnotationType(), ink: mark.getInk(), style: mark.getStyle(),
}))
```

### 2. Change the circle to coral without changing its path

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'exit-circle').setStyle({ stroke: { color: '#e16c5b', width: 3 } })
```

### 3. Compare a half-point circle

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'exit-circle').setStyle({ stroke: { color: '#dc2626', width: 0.5 } })
```

### 4. Compare a 12-point circle

These are two selected valid examples, not the SDK's complete range.

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'exit-circle').setStyle({ stroke: { color: '#dc2626', width: 12 } })
```

### 5. Restore the original circle

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'exit-circle').setStyle({ stroke: { color: '#dc2626', width: 2 } })
```

### 6. Distinguish the proposal from the embedded blue route

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'alternate-route').setStyle({ stroke: { color: '#a65a35', width: 5 } })
```

### 7. Remove only the review check, preserving source image and other ink

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'legend-check').remove()
```

### 8. Undo that deletion using native history

```ts
await window.univerAPI.undo()
```

### 9. Redo that deletion

```ts
await window.univerAPI.redo()
```

### 10. Insert two disconnected strokes as one review object

Coordinates are PDF points. Both paths belong to one annotation; removal and history treat it as one object.

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).insertAnnotation({
  id: 'legend-check', annotationType: 'ink',
  left: 60, top: 512, width: 76, height: 37,
  ink: { paths: [[[64, 533], [74, 545], [95, 516]], [[110, 522], [131, 522]]], stroke: { color: '#327e68', width: 3 } },
})
```

### 11. Observe native rejection of empty paths

This block must throw. The document should remain unchanged; do not manufacture a successful annotation.

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).insertAnnotation({ annotationType: 'ink', ink: { paths: [] } })
```

### 12. Style both paths together

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getAnnotations().find(mark => mark.getId() === 'legend-check').setStyle({ stroke: { color: '#327e68', width: 2 } })
```

## Boundaries and acceptance

The authored reference date is fixed; SDK-generated timestamps/IDs are not globally frozen.
The native PDF model is authored locally; this is not proof of binary PDF import.
No client-only binary PDF Exchange/Print provider is registered or claimed here.
There is no backend conversion, fake PDF download, host browser-print replacement or snapshot-download panel.
