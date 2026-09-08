# Shape rotation and flipping

Nine native editable shapes compare orientation without changing their positive 170 × 110 dimensions.

- **Triangles:** original, 45° and 90° rotation; horizontal, vertical and both-axis reflection.
- **Bent arrows:** original, 180° rotation, and 90° rotation combined with horizontal reflection.

Labels are separate native text elements: they remain upright when their specimen rotates. The coral triangles share one fill and the sage arrows share another. No mirrored image files, CSS transforms or redrawn substitutes are used.

## Public Facade recipes

Rotate the original triangle; its left/top, width/height, fill and outline stay unchanged:

```ts
const board = univerAPI.getActiveBoard()
const shape = board.getShape('original')
shape.setRotation(45)
console.log(shape.getTransform())
```

Apply horizontal reflection with no rotation:

```ts
const shape = univerAPI.getActiveBoard().getShape('original')
shape.setTransform({ rotation: 0, flipX: true, flipY: false })
```

Combine a quarter-turn and horizontal reflection on the original bent arrow:

```ts
const arrow = univerAPI.getActiveBoard().getShape('arrow-original')
arrow.setTransform({ rotation: 90, flipX: true, flipY: false })
```

Restore both originals:

```ts
const board = univerAPI.getActiveBoard()
for (const id of ['original', 'arrow-original']) {
  board.getShape(id).setTransform({ rotation: 0, flipX: false, flipY: false })
}
```

Only the addressed shape changes. Select a specimen and use the native rotation handle to explore other angles. Rotation and single-axis reflection are different operations; reflecting both axes has the same final orientation as a half-turn, but different saved flags. This case demonstrates shape geometry, not text mirroring, connector routing or export fidelity.

Preview and export use the same factory, complete official English locales and CSS, and native floating tools. The board can be panned and zoomed using its own navigation controls.
