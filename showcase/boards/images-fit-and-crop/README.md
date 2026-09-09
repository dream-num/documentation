# Board images: fit and crop

Four native Board images use original local SVG artwork: a wide orchard sign, a square trail badge, a portrait plant marker, and the center of the wide sign. Nothing is rendered as a host image or fetched from a remote asset server.

Fit here means proportional image dimensions, not a per-element object-fit API. The 640 × 320 sign is shown at 320 × 160; the 360 × 360 badge at 180 × 180; the 240 × 480 marker at 120 × 240. The crop removes 80 logical units at either side of a 320-unit-wide source frame, leaving a 160 × 160 visible center. Labels describe the initial state, not subsequent edits.

The public Board image shape has crop offsets but no specialized image `setCrop()` Facade. This example uses `FBoard.updateElement()` for crop/source changes and `setElementTransform()` for geometry. The existing Slides image example uses different image handles; those APIs are not assumed to work in Boards.

## 1. Resize proportionally

```ts
univerAPI.getActiveBoard().setElementTransform('wide', { width: 280, height: 140 })
```

The wide sign remains 2:1. Other elements are untouched.

## 2. Widen the source crop

```ts
const board = univerAPI.getActiveBoard()
const image = board.getElement('cropped')
board.updateElement('cropped', { element: {
  ...image,
  transform: { ...image.transform, width: 240 },
  crop: { left: 40, right: 40, top: 0, bottom: 0 },
} })
```

The saved width becomes 240 with crop offsets of 40 on each side. Expected paint is a 320 × 160 source frame with a wider visible center. In the installed beta.2 runtime, the mounted image retains its original crop: native drawing expands to 480 × 160 and visibly stretches horizontally instead. This is a retained strict paint failure, not a working live-crop claim.

## 3. Rotate the portrait marker

```ts
univerAPI.getActiveBoard().setElementTransform('portrait', { rotation: 12 })
```

Only the portrait rotation changes.

## 4. Replace the crop with the square badge

```ts
const board = univerAPI.getActiveBoard()
const image = board.getElement('cropped')
board.updateElement('cropped', { element: {
  ...image,
  source: board.getElement('square').source,
  crop: { left: 0, right: 0, top: 0, bottom: 0 },
  transform: { ...image.transform, width: 160, height: 160 },
} })
```

The saved image contains the square source, a 160 × 160 frame, and zero crop at the existing position. Other images retain their sources. The installed beta.2 runtime still paints the original orchard center in this mounted image; source replacement is a retained strict paint failure. The example does not force a remount to conceal it.

## Scope and verification

The native Board toolbar is the only toolbar; there is no duplicate office ribbon or host control panel. Eight complete English locale packs and eight official CSS files cover Board's transitive native UI. Preview/export share the same independent factory. Initial viewport fitting uses the exported BoardViewportService, not an invented image Facade.
