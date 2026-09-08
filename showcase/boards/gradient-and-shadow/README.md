# Gradient, opacity and shadow

Nine native rounded rectangles compare three independent effects:

- Three identical color stops with a horizontal, vertical or radial gradient.
- Solid teal at 100%, 55% and 20% opacity. A native amber rectangle beneath each specimen makes transparency visible.
- No shadow, a sharp shadow, and a 16 px blurred shadow. Both shadows use the same color, opacity, direction and distance.

Select a specimen to use the SDK's native floating tools. All shapes, underlay stripes and labels belong to the board model; no CSS-painted effects or bitmap assets are used.

## Public Facade recipes

Turn the first gradient diagonally while retaining its three stops:

```ts
const shape = univerAPI.getActiveBoard().getShape('linear-0')
shape.setGradientFill(univerAPI.Enum.ShapeGradientTypeEnum.Linear, [
  { position: 0, color: '#24566B' },
  { position: 0.5, color: '#4FA7A0' },
  { position: 1, color: '#E2BE83' },
], 45)
```

Make the middle specimen more transparent:

```ts
univerAPI.getActiveBoard().getShape('translucent').setSolidFill('#4FA7A0', 0.3)
```

Change the soft shadow's direction and distance. `update` replaces shape data, so preserve its other fields:

```ts
const shape = univerAPI.getActiveBoard().getShape('soft-shadow')
shape.update({ shapeData: {
  ...shape.getShapeData(),
  outerShadow: { color: '#18394A', opacity: 0.4, blurRadius: 16, direction: 225, distance: 24 },
} })
```

Remove the sharp shadow without changing its fill or geometry:

```ts
const shape = univerAPI.getActiveBoard().getShape('sharp-shadow')
shape.update({ shapeData: { ...shape.getShapeData(), outerShadow: undefined } })
```

Opacity ranges from 0 to 1. Shadow direction is in degrees: 0 points right and 90 points down. These recipes do not resize or move the shapes. This case does not cover inner shadows, reflection, 3D effects or export fidelity.
