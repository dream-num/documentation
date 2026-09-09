# Text Box Insets and Vertical Alignment

Two native slides compare text placement inside fixed 280 × 335 shapes. The first uses the same text and 20 px insets with top, middle and bottom alignment. The second keeps top alignment and compares zero, symmetric and asymmetric insets. Padding is measured in px in the SDK model, not percentages or font points; zoom changes its screen size.

Use native thumbnails to switch slides. Double-click the actual shape text to edit, then click blank canvas to commit. Square wrapping is enabled and autofit is disabled: edits may wrap or eventually overflow, but do not intentionally resize the shape or shrink the font. Labels describe the initial settings, not live property readouts.

## Move top-aligned text to the bottom

On slide 1, run this public recipe. Only the first specimen's vertical alignment changes; text, rich text styles, insets and shape geometry remain the same.

```ts
const shape = window.univerAPI.getActivePresentation().getSlideByIndex(0).getShape('top')
shape.getText().setVerticalAlign(window.univerAPI.Enum.VerticalAlign.BOTTOM)
```

## Change just one inset

Switch to slide 2. The middle specimen changes its left inset from 20 to 44 px. Omitted sides retain their resolved values (20 px each). Wrapping may change; the outer box does not.

```ts
const shape = window.univerAPI.getActivePresentation().getSlideByIndex(1).getShape('symmetric')
shape.getText().setTextBoxOptions({ padding: { left: 44 } })
```

## Reset all four insets

The asymmetric specimen becomes flush with its text rectangle. Other specimens stay unchanged.

```ts
const shape = window.univerAPI.getActivePresentation().getSlideByIndex(1).getShape('asymmetric')
shape.getText().setTextBoxOptions({ padding: { left: 0, right: 0, top: 0, bottom: 0 } })
```

Reload restores the authored comparison. Preview and source use the same factory with official English locales and CSS. This sample covers text-box alignment and margins, not automatic font shrinking, vertical writing, every native formatting-menu action or export fidelity.
