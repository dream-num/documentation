# Shape Fill and Outline

Nine editable native triangles compare one property per row:

- Fill: no fill, solid rose, a rose-to-sage linear gradient. All retain the same 2 pt outline.
- Outline width: 1, 4 and 8 pt with identical fill and solid stroke.
- Line pattern: solid, dashed and round dots at the same 3 pt width.

Use the native selection tools to edit a specimen. There is no host toolbar, CSS drawing or external artwork.

## Public Facade recipes

Remove the solid specimen's fill while retaining its stroke:

```ts
window.univerAPI.getActiveBoard().getShape('solid').setNoneFill()
```

Change fill and outline independently:

```ts
const shape = window.univerAPI.getActiveBoard().getShape('solid')
shape.setSolidFill('#B9CDA7')
shape.setStrokeWidth(6)
shape.setStrokeColor('#6B3C47')
shape.setStrokeLineDashType(window.univerAPI.Enum.ShapeLineDashEnum.Dash)
```

Turn the gradient by 90 degrees:

```ts
window.univerAPI.getActiveBoard().getShape('gradient').setGradientFill(
  window.univerAPI.Enum.ShapeGradientTypeEnum.Linear,
  [{ position: 0, color: '#D49A82' }, { position: 1, color: '#B9CDA7' }],
  90,
)
```

These operations preserve shape geometry and separate labels. Preview and export share the factory, full English plugin locales and official CSS. Boards uses its native floating tools rather than a duplicate ribbon. This case does not demonstrate image fills, shadows or binary export fidelity.
