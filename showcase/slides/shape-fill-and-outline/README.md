# Shape Fill and Outline

Four native slides, twelve comparison shapes, no extra toolbar. Use thumbnails to compare fill, outline weight, shape type, rotation and gradients. Select a shape for the native formatting tools. This is object formatting, not the page-background demo.

The factory follows the local SDK Slides advanced example: a real presentation, native Grid ribbon, public Facades and official styles. English packs cover UI, Design, Docs UI, Shape Editor UI, Slides UI and Slides Print. The exported project includes all six official CSS imports. Data and initialization do not import any other demo.

## Change fill without changing geometry

Run in the browser console on the first slide. The cyan rectangle becomes coral; the other two shapes stay unchanged.

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(0)
const solid = slide.getShape('solid')
if (!solid) throw new Error('The solid sample was removed; reload the demo.')
solid.setSolidFill('#EAA383')
```

## Remove fill, keep the outline

The mint rectangle becomes transparent while its dark outline remains.

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(0)
const combined = slide.getShape('combined')
if (!combined) throw new Error('The outlined sample was removed; reload the demo.')
combined.setNoneFill()
```

## Change outline weight

Open slide 2 with the native thumbnails. The middle sample changes from 4 to 8 pt without moving.

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(1)
const middle = slide.getShape('weight-4')
if (!middle) throw new Error('The middle sample was removed; reload the demo.')
middle.setStrokeWidth(8)
```

## Change rotation

Open slide 3. The right-hand rectangle rotates from 15 to -15 degrees.

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(2)
const rotated = slide.getShape('rotated')
if (!rotated) throw new Error('The rotated sample was removed; reload the demo.')
rotated.setRotation(-15)
```

## Insert a shape through the public Facade

On slide 1, add a small violet square between the samples and their labels. Each invocation inserts a new independent shape; no claim of idempotence is made.

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(0)
const inserted = slide.insertShape({
  shapeType: univerAPI.Enum.ShapeTypeEnum.Rect,
  transform: { left: 335, top: 390, width: 35, height: 35 },
  shapeData: { fill: { fillType: univerAPI.Enum.ShapeFillEnum.SolidFill, color: '#8C77BD' } },
})
if (!inserted) throw new Error('Shape insertion failed.')
```

## Change gradient direction and stops

Open slide 4. The first rectangle changes from a mint/violet 0-degree linear gradient to a coral/gold 45-degree gradient. Its geometry and the other two samples stay unchanged. Positions run from 0 to 1; use at least two stops.

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(3)
const linear = slide.getShape('linear-0')
if (!linear) throw new Error('The linear sample was removed; reload the demo.')
linear.setGradientFill(univerAPI.Enum.ShapeGradientTypeEnum.Linear, [
  { position: 0, color: '#EAA383' },
  { position: 1, color: '#F5D77A' },
], 45)
```

## Change radial gradient stops

Still on slide 4, the right-hand rectangle changes to a pale-mint/deep-teal radial fill. The linear samples remain unchanged; radial geometry does not use a linear angle.

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(3)
const radial = slide.getShape('radial')
if (!radial) throw new Error('The radial sample was removed; reload the demo.')
radial.setGradientFill(univerAPI.Enum.ShapeGradientTypeEnum.Radial, [
  { position: 0, color: '#D2F3E8' },
  { position: 1, color: '#176B73' },
])
```

Reload restores the authored samples. Native Undo/Redo belongs to the editor, not an additional history demo. Trial watermarks remain. This gallery does not claim shadows, image fills, style copying, binary import/export or complete native-menu compatibility.

The text labels describe the initial authored settings, not live property readouts. For example, rotating the right-hand shape does not rewrite its editable label.

## Scoped verification

This does not certify every native formatting-menu action, full keyboard accessibility, all export formats or all SDK shape features. A first paint write may add optional undefined flip fields without changing geometry.
