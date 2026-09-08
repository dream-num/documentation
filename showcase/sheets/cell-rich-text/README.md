# Cell Rich Text

Column B contains native rich text; column C contains the same words as plain text. The samples use the public rich-text builder and `FRange.setRichTextValueForCell()`, not HTML overlays or whole-cell font changes.

- **B5:** neutral prefix, bold green status and italic ending.
- **B7:** serif title, monospaced SKU and sans-serif edition.
- **B9:** struck-through old wording and underlined replacement.
- **B11:** a bold heading and a separate italic detail line.

Double-click B5 to enter the native cell editor. Select a word and use the existing ribbon to apply an inline style. Typing over an entire selected cell replaces its content; that is different from editing characters inside its rich text.

## Public API recipe

```ts
const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
const text = window.univerAPI.newRichText()
  .insertText('Status: ')
  .insertText('Approved', { bl: 1, cl: { rgb: '#047857' } })
  .insertText(' for publication', { it: 1 })
sheet.getRange('B5').setRichTextValueForCell(text)
console.log(sheet.getRange('B5').getValue(true).toPlainText())
```

The result is `Status: Approved for publication`, with different styles on individual runs. The initial factory uses the same APIs.

Fonts are common system families, not bundled font downloads. Rendering falls back to fonts available in the browser environment. Preview and standalone source share the factory, complete English core preset locale and official CSS. This sample covers inline text, not hyperlinks, mentions, embedded drawings or collaborative review.
