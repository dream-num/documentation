# Text lists and bullets

Three editable native shapes compare unordered bullets, ordered numbering and a list with nesting levels 0, 1, 2, 1, 0. The body contains ordinary text only: markers and indentation come from `RichTextBuilder.listItem()` metadata. Each specimen uses a separate stable list identity.

Double-click a specimen and wait for the text caret before editing. At the end of the numbered list, Enter continues with the next number; try adding “Label the edition” as item 4. In the installed SDK, Tab at the start of that item does not increase its list level. Use the public rich-text model for explicit nesting changes rather than assuming keyboard indentation support. This sample does not claim custom numbering formats or automatic continuation across shapes.

## Change the ordered specimen to bullets

This recipe reads existing paragraphs and rebuilds the list with one uniform font. It preserves wording but deliberately replaces list and inline styling; it is not a general style-preserving transformer.

```ts
const api = window.univerAPI
const text = api.getActivePresentation().getSlideByIndex(0).getShape('ordered').getText()
const rich = api.newRichText()
for (const paragraph of text.getRichText().getParagraphs()) {
  rich.listItem(paragraph.toPlainText().replace(/[\r\n]+$/, ''), {
    type: api.Enum.PresetListType.BULLET_LIST,
    listId: 'make-bullets',
    level: 0,
    paragraphStyle: { spaceAfter: 14 },
  })
}
text.setRichText(rich)
text.setFontFamily('Arial')
text.setFontSize(18)
```

## Flatten the nested list into an ordered sequence

```ts
const api = window.univerAPI
const text = api.getActivePresentation().getSlideByIndex(0).getShape('nested').getText()
const rich = api.newRichText()
for (const paragraph of text.getRichText().getParagraphs()) {
  rich.listItem(paragraph.toPlainText().replace(/[\r\n]+$/, ''), {
    type: api.Enum.PresetListType.ORDER_LIST,
    listId: 'review-steps',
    level: 0,
    paragraphStyle: { spaceAfter: 14 },
  })
}
text.setRichText(rich)
text.setFontFamily('Arial')
text.setFontSize(18)
```

The target retains five paragraphs but their list levels become zero. Other shapes and slide dimensions are not changed. Reload restores the authored variants. Preview and exported source share the same factory and official English locale packs and CSS. List markers are rendered by the SDK; they are not characters inserted into the paragraph text.
