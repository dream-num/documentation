# Long Modern Document

A deterministic working archive contains 24 chapter headings, 288 field-note paragraphs, a title, an introduction and a closing paragraph: 315 paragraphs and 288 native inline style runs. Four sites and six topics vary the original prose; there are no external assets or customer records.

This is a moderate, editable modern-document sample, not the existing million-character traditional/paged snapshot. The complete document is supplied to the native Docs editor. No host virtualization, prerecorded rendering, performance score or maximum-capacity guarantee is used.

## Native inspection

Scroll through distant chapters and edit a field note. Use the native editor's document-end navigation to reach the closing sentence, edit it, then undo. Verify earlier headings and bold teal record identifiers remain intact. Rendering and editing depend on the browser, device and SDK build; development compilation is not an SDK load-time measurement.

## Inspect the actual snapshot

```ts
const doc = window.univerAPI.getActiveDocument()
const snapshot = doc.save()
console.log({
  paragraphs: snapshot.body.paragraphs.length,
  textRuns: snapshot.body.textRuns.length,
  characters: snapshot.body.dataStream.length,
})
```

The initial count is 50,900 characters, including paragraph and document terminators. Counts refer to the initial sample, before edits.

## Edit the final sentence through the public API

```ts
const doc = window.univerAPI.getActiveDocument()
const text = doc.save().body.dataStream
const phrase = 'Archive complete.'
const start = text.indexOf(phrase)
if (start < 0) throw new Error('The closing paragraph is missing')
const changed = doc.getTextRange(start, start + phrase.length)
  .setText('Archive reviewed.')
if (!changed) throw new Error('The document rejected the edit')
```

Only the closing phrase changes. The 24 chapter headings and 288 styled record identifiers remain unchanged. Recompute offsets after text edits. Preview and standalone share the same factory, complete English Docs core locale, official CSS and Grid ribbon.
