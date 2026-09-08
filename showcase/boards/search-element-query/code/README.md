# Board search and element query

Native UI, demo labels and authored data are English-only, including on Chinese documentation pages. Legacy locale arguments are ignored; saved-snapshot argument positions are unchanged.

The small host form demonstrates SDK queries; native Board controls still handle editing. Preview and standalone entry use the same factory, official CSS and complete English locale bundles, including native shape-editor and ink dependencies. Theme changes preserve the canvas and query state. Native license notices remain visible.

The four cards contain three `Risk` matches. One connector has `Risk` in both its name and label, illustrating multiple hits for one element. `Approved` matches the other connector's label. The English tokens cover uppercase/lowercase query variants.

## 1. Search the native index

```ts
const board = demo.univerAPI.getActiveBoard()
if (!board) throw new Error('Open the board first.')
const hits = board.findElementsByText(' risk ')
```

The SDK searches text, names, IDs and labels using case-insensitive substring matching. A blank query returns no hits. Run the query again after native edits; the example does not maintain a second search index.

## 2. Filter by type

```ts
const shapes = board.describeElements({
  elementType: demo.univerAPI.Enum.BoardElementType.Shape,
})
const allowed = new Set(shapes.map((element) => element.id))
const shapeHits = hits.filter((hit) => allowed.has(hit.elementId))
```

Use `BoardElementType.Connector` for connectors. `describeElements()` without a type lists all elements regardless of search text.

## 3. Deduplicate and read bounds

```ts
const ids = [...new Set(shapeHits.map((hit) => hit.elementId))]
const bounds = board.getElementsBoundingRectByIds(ids)
```

One element can match more than once. The result list contains each ID once. The bounds API returns the union rectangle, or `null` when no requested element has bounds.

## 4. Focus one result

```ts
const id = ids[0]
if (id && !board.focusElement(id, { x: 400, y: 250 })) {
  throw new Error('Result is absent or cannot be focused.')
}
const viewportPoint = id ? board.getElementViewportPoint(id) : null
```

Coordinates are relative to the native Board viewport. The factory uses the canvas host's center. `focusElement()` selects that element and pans the viewport. This SDK exposes no public bulk-selection or clear-selection Facade; the demo does not substitute internal selection services.
