# Text Search and Targeted Replacement

An original fieldwork note demonstrates public Facade text queries in a real editable modern document. This is not a native Find/Replace panel, outline or bookmark navigator. No host search input or browser search override is installed. Execute the recipes in the browser console; the document remains editable through its native toolbar and keyboard.

## Compare case sensitivity

Initially the exact lowercase query returns one match; case-insensitive matching returns three, preserving their original spelling. Queries are literal substrings within one paragraph, not regular expressions, whole-word matching or cross-paragraph search.

```ts
const paragraph = window.univerAPI.getActiveDocument().findParagraphByText('Case study:')
console.log(paragraph.findAllText('archive').map(range => range.getText())) // ['archive']
console.log(paragraph.findAllText('archive', { matchCase: false }).map(range => range.getText())) // ['Archive', 'archive', 'ARCHIVE']
```

## Replace only the second occurrence

Occurrence is zero-based. This changes the bridge marker to pine while the gate and return markers remain cedar. Reload before repeating this recipe: occurrence numbers describe the current text, not persistent match IDs.

```ts
const paragraph = window.univerAPI.getActiveDocument().findParagraphByText('Repeated terms:')
const second = paragraph.findText('cedar', { occurrence: 1 })
if (!second || !second.setText('pine')) throw new Error('Second occurrence replacement failed')
console.log(paragraph.findAllText('cedar').length) // 2
```

## Handle a missing query

No match returns null or an empty array, not a selection somewhere else. This read-only recipe does not alter the document.

```ts
const paragraph = window.univerAPI.getActiveDocument().findParagraphByText('Route note:')
console.log(paragraph.findText('violet')) // null
console.log(paragraph.findAllText('violet').length) // 0
```

## Re-query after an earlier edit

First add a sentence to the Practice paragraph using the native editor. Then run this recipe: it resolves the route paragraph and its current amber range, replacing only that word with silver. The blue reference and other paragraphs remain intact.

```ts
const paragraph = window.univerAPI.getActiveDocument().findParagraphByText('Route note:')
const current = paragraph.findText('amber')
if (!current || !current.setText('silver')) throw new Error('Current route replacement failed')
console.log(paragraph.findText('silver').getText()) // 'silver'
```

A paragraph wrapper re-resolves its persisted paragraph ID, but a text-range wrapper stores fixed offsets. Do not reuse an old range after inserting or removing earlier content; query again. `setText` replaces a range with plain text, not a rich-text fragment. Reload restores all examples. Preview and source share the same factory, full official English locale and CSS. This case does not certify whole-document replace-all, regex, native Ctrl+F, or formatting inheritance for every replacement boundary.
