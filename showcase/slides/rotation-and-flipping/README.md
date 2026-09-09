# Rotation and Flipping

Two native slides compare asymmetric geometry. Each shape has the same positive width and height; only rotation and flip flags differ. Separate labels remain upright.

- Triangle: original, clockwise 90 degrees, horizontal reflection, vertical reflection.
- Bent arrow: original, 180 degrees, both axes flipped, 90 degrees plus horizontal flip.

Both-axis reflection and a half-turn have equivalent orientation, but different saved transforms. Rotation alone must not be used as a replacement for a single-axis flip.

## Public Facade recipes

Rotate the original triangle:

```ts
const slide = window.univerAPI.getActivePresentation().getSlideByIndex(0)
slide.getShape('original').setRotation(30)
```

Switch its reflection without changing its position or size:

```ts
const shape = window.univerAPI.getActivePresentation().getSlideByIndex(0).getShape('original')
shape.setTransform({ rotation: 0, flipX: true, flipY: false })
console.log(shape.getTransform())
```

Reset the original:

```ts
window.univerAPI.getActivePresentation().getSlideByIndex(0)
  .getShape('original').setTransform({ rotation: 0, flipX: false, flipY: false })
```

Use native thumbnails and transform handles. Preview and export share the data factory, official CSS, complete English plugin locales and Grid ribbon. Shapes and labels are editable SDK objects, not SVG images or CSS transforms. This case does not demonstrate Docs flip behavior, text mirroring, animation or export fidelity.

On a narrow preview, open the native zoom selector at the bottom right and choose 50% to see the whole slide. At 1024 px wide, the initial 100% view clips the slide; the example does not automatically fit it. Zoom changes the saved viewing ratio, not shape geometry or text.
