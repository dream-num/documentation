# Paragraph alignment and spacing

Two slides isolate paragraph layout in native rectangle shapes rather than character styling or text-box autofit.

1. **Paragraph alignment:** identical copy in four equal boxes, aligned left, center, right and justified.
2. **Paragraph spacing and indents:** a baseline beside five single-property variants: 1.5 line height, 12 pt before, 12 pt after, 24 pt first-line indent and 24 pt leading indent.

Use native thumbnails to switch slides. Double-click a specimen shape to edit its paragraphs; click blank canvas to commit. Native text-format controls are available while editing. Specimens use fixed-size rectangle shapes with top-aligned text; this is not an autofit text-box example.

## Public Facade recipes

Change the complete left shape's text to centered alignment without replacing its copy:

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(0)
const shape = slide.getShape('left')
shape.getText().setHorizontalAlign(univerAPI.Enum.HorizontalAlign.CENTER)
```

Rebuild the baseline's existing paragraphs with 1.5 line height and 12 pt space after each paragraph. This example deliberately reapplies its uniform font; it is not a general rich-text style-preserving transformer.

```ts
const slide = univerAPI.getActivePresentation().getSlideByIndex(1)
const shape = slide.getShape('baseline')
const text = shape.getText()
const paragraphs = text.getRichText().getParagraphs()
const rich = univerAPI.newRichText()
for (const paragraph of paragraphs) {
  rich.paragraph({
    align: univerAPI.Enum.HorizontalAlign.LEFT,
    lineHeight: 1.5,
    lineHeightRule: univerAPI.Enum.SpacingRule.AUTO,
    spaceBefore: 0,
    spaceAfter: 12,
  }).span(paragraph.toPlainText().replace(/[\r\n]+$/, ''), {
    fontFamily: 'Arial', fontSize: 16, color: '#27384B',
  })
}
text.setRichText(rich)
```

The wording and shape position/size remain unchanged; only the paragraph layout changes. Numeric paragraph lengths use document points. With AUTO, lineHeight is a multiplier, not a pixel height. First-line indent affects the first line; leading indent moves the whole paragraph. Paragraph alignment is distinct from vertical alignment of the text within a shape.

No CSS text rendering, fabricated spacing or host controls are used. Native rendering, not stored options alone, determines the demonstrated scope.
