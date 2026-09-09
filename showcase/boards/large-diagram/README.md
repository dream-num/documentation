# Large diagram

Twelve independent production lines each contain twelve editable native fixed-size shapes and eleven bound connectors. The page has **144 shapes + 132 connectors + 1 title = 277 elements**. Colors distinguish neighboring lines. No external assets, DOM cards or host canvas are used.

Use native zoom controls for an overview and the hand tool to pan. The distant lower-right node is **Line 12 / Archive**, ID `flow-12-stage-12`. Native Find can locate its text; double-click the node to edit it. This is a fixed-size performance sample, not an FPS benchmark, memory measurement or maximum-capacity claim.

Allow the native text editor to activate after double-clicking before typing. Rapid input followed by clicking away can report `Cannot read properties of null (reading 'getSnapshot')`, including when clicking the canvas. Edited text was retained in this case, but this unresolved editor-exit error is not suppressed or fixed by the demo.

## Count native elements

```ts
const board = univerAPI.getActiveBoard()
console.log(board.describeElements().length)
console.log(board.describeElements({ elementType: univerAPI.Enum.BoardElementType.Shape }).length)
console.log(board.describeElements({ elementType: univerAPI.Enum.BoardElementType.Connector }).length)
```

Expected counts are 277, 144 and 132.

## Find and focus the distant node

```ts
const board = univerAPI.getActiveBoard()
console.log(board.findElementsByText('Line 12 / Archive'))
board.focusElement('flow-12-stage-12', { x: 500, y: 350 })
console.log(board.getElementViewportPoint('flow-12-stage-12'))
```

Focus selects the native element and pans its center to the requested viewport point. It does not reposition the diagram model or require a private viewport service.

## Change only one fill

```ts
const board = univerAPI.getActiveBoard()
board.getShape('flow-12-stage-12').setSolidFill('#E8BE83')
```

The fill recipe retains text, dimensions and position, and leaves the other 276 elements unchanged. Native text editing keeps the node's fixed size but can recompute the connected line's bounding rectangle; connector endpoints and bindings remain unchanged. Native edits and public API edits operate on the same board; reload restores the initial sample.
