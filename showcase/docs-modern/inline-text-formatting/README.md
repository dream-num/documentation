# Inline Text Formatting

A short modern document compares bold and italic emphasis, foreground color, highlight, strikethrough, underline and a combined style. Each style applies only to the named phrase; surrounding text stays ordinary.

Select a phrase in the native document and use the existing formatting controls. This is editable document text, not an HTML mockup. The revision line uses visual strikethrough only: it is not collaborative track changes.

## Public text-range recipe

Run against a freshly loaded demo. Recompute offsets after edits instead of retaining a stale range.

```ts
const doc = window.univerAPI.getActiveDocument()
const text = doc.save().body.dataStream
const phrase = 'confirm the venue'
const start = text.indexOf(phrase)
if (start < 0) throw new Error('The sample phrase is missing')
const changed = doc.getTextRange(start, start + phrase.length)
  .setTextStyle({ bg: { rgb: '#BAE6FD' }, bl: 1 })
if (!changed) throw new Error('The document rejected the style update')
```

The highlighted phrase changes from yellow to light blue and becomes bold. Its text and the rest of the sentence remain unchanged.

Preview and exported source share the document factory. The complete English Docs core preset locale, official CSS and Grid ribbon are used. No block plugins or extra host buttons are needed.
