# Native PDF text boxes and typography

Page 1 uses simple text boxes, which do not automatically wrap in this SDK. Page 2 deliberately uses story-backed FPdfParagraph frames for width-driven line layout. PdfTextAnchor.START/END visibly control horizontal alignment; the installed declaration's vertical wording is not used as a behavior claim.

Two original pages compare plain text, styled UTF-16 ranges, a horizontal anchor and the same sentence in wide/narrow text frames. These are structured editable PDF objects, not DOM overlays or text-markup annotations. Use native Text and Selection modes and the page rail. No host controls duplicate the native workbench.

## Literal public Facade recipes

Run each snippet on the initial gallery; native input is checked separately.

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getTextBoxes().find(box => box.getId() === 'editable').setText('A revised sentence stays editable.')
```

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getTextBoxes().find(box => box.getId() === 'emphasis').setTextStyle({ underline: true, fill: '#116d71' }, { start: 0, end: 8 })
```

```ts
window.univerAPI.getActivePdf().getPageByIndex(0).getTextBoxes().find(box => box.getId() === 'anchored').setTextAnchor(window.univerAPI.Enum.PdfTextAnchor.START)
```

```ts
window.univerAPI.getActivePdf().getPageByIndex(1).getParagraphs().find(box => box.getId() === 'narrow').setSize(360, 160)
```

Five full English locale packs and five official SDK CSS bundles accompany the shared factory. Grid is native; English stays independent of host language. Theme changes retain the SDK owner and edited PDF. Initial viewport fitting uses the installed exported PDF runtime service, separately from these public editing recipes.

Callout leaders/bindings are not exposed by the installed published PDF Facades. An annotation FREE_TEXT enum alone does not establish callout support, so this gallery does not manufacture a connector-label substitute. Width changes are tested for actual painted wrapping, not inferred from stored bounds. This structured snapshot gallery does not demonstrate binary PDF conversion, OCR, printing or redaction. Trial notices are retained.
