# Layered Diagram Layout

Three original archive-intake diagrams use 15 native fixed-size shapes, 12 bound connectors and four separate text labels. The public layout helper receives an explicit array of layers; it does not infer a graph, detect dependencies, avoid obstacles or route around unrelated objects.

- **Horizontal:** layers progress left to right, with their contents centered across the flow.
- **Vertical:** the same branching structure progresses top to bottom. Connector sites are authored for this orientation.
- **Unequal sizes:** wider Digitize/Archive nodes and a taller Assess node make cross-axis alignment visible.

The shapes remain native editable Boards objects. Drag a node to inspect its bound connectors and use the native zoom/pan controls. Layout is a source/API capability here, not a custom host toolbar or a claimed automatic-layout menu. Labels describe the initial layouts.

## Public Facade recipes

Run these independent blocks in the preview console after initialization. Positions, sizes and gaps are in Board coordinates.

### Increase horizontal layer spacing

```ts
const board = window.univerAPI.getBoard('layered-archive-board')
board.arrangeElementsInLayers(
  [['h-intake'], ['h-scan', 'h-review'], ['h-store', 'h-return']],
  { direction: 'horizontal', layerGap: 90, itemGap: 28, align: 'center', itemAlign: 'center', start: { x: 60, y: 160 } },
)
```

### Increase vertical spacing between sibling nodes

```ts
const board = window.univerAPI.getBoard('layered-archive-board')
board.arrangeElementsInLayers(
  [['v-intake'], ['v-scan', 'v-review'], ['v-store', 'v-return']],
  { direction: 'vertical', layerGap: 55, itemGap: 65, align: 'center', itemAlign: 'center', start: { x: 670, y: 160 } },
)
```

### Center unequal-size layers and their members

```ts
const board = window.univerAPI.getBoard('layered-archive-board')
board.arrangeElementsInLayers(
  [['u-intake'], ['u-scan', 'u-review'], ['u-store', 'u-return']],
  { direction: 'horizontal', layerGap: 55, itemGap: 28, align: 'center', itemAlign: 'center', start: { x: 60, y: 600 } },
)
```

### Align unequal-size layers and their members to the end

```ts
const board = window.univerAPI.getBoard('layered-archive-board')
board.arrangeElementsInLayers(
  [['u-intake'], ['u-scan', 'u-review'], ['u-store', 'u-return']],
  { direction: 'horizontal', layerGap: 55, itemGap: 28, align: 'end', itemAlign: 'end', start: { x: 60, y: 600 } },
)
```

`align` positions each layer across the flow; `itemAlign` aligns unequal members within the layer's thickness. The order of IDs controls sibling order. The helper preserves node sizes and text; connector endpoint bindings are separate from the geometry recalculated after nodes move. Reload restores the initial layouts.
