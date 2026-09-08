# Team knowledge / Three modern documents

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

Engineering Handbook, API Standards and Legacy Deployment Guide retain their original prose, owners, tags, review dates
and document IDs: `knowledge-handbook`, `knowledge-api`, `knowledge-legacy`. Each has native title/heading paragraphs and
an individual blue, teal or amber accent. The archived story remains editable: archive is an application review policy,
not an SDK permission or read-only claim.

The three page links are useful application navigation, not replacement editing controls. They save each complete SDK
snapshot in memory before opening the next document. Editing uses the native Grid and document canvas. No Reset space,
Mark reviewed, activity/readback or fixture panel is present. Preview and standalone export share the complete factory,
official Docs Core preset CSS, full English preset packs and stable editor ownership during theme changes.

## Literal Facade examples

Run in the preview frame or standalone browser console. Select Engineering Handbook first. Examples 1–3 are sequential;
example 4 intentionally rejects the archived page. Return to Engineering Handbook for 5–13. Example 14 resets everything.
Commit native edits before saving. Check complete history and rendered text independently: a successful method call alone
is not proof of a correct undo or repaint.

### 1. Capture the exact current document

```ts
window.knowledgeSaved = structuredClone(window.univerAPI.getActiveDocument().save())
```

### 2. Define the original application review policy

This is a literal integration function, not an SDK permission or a hidden production handler. It always resolves the live
document and rejects the archived identity before any mutation.

```ts
window.knowledgeReview = () => {
  const doc = window.univerAPI.getActiveDocument()
  if (!['knowledge-handbook', 'knowledge-api'].includes(doc.getId())) throw new Error('Archived or unknown page cannot be reviewed')
  const paragraph = doc.findParagraphByText('Last reviewed:')
  if (!paragraph || !paragraph.setText('Last reviewed: 2027-01-15 · Fresh')) throw new Error('Review update rejected')
}
```

### 3. Review the live handbook or API standards

```ts
window.knowledgeReview()
```

### 4. Reject a review on the archived page

Select Legacy Deployment Guide first. This call intentionally throws and must leave the complete document unchanged.
Its native text remains editable, so this example does not imply access control.

```ts
window.knowledgeReview()
```

### 5. Restyle the handbook's native heading

```ts
const heading = window.univerAPI.getActiveDocument().findParagraphByText('Delivery standards')
if (!heading || !heading.setStyle({ textStyle: { fs: 19, bl: 1, cl: { rgb: '#147B73' } } })) throw new Error('Heading style rejected')
```

### 6. Add a specific delivery requirement

```ts
const paragraph = window.univerAPI.getActiveDocument().findParagraphByText('Every change has an owner')
if (!paragraph || !paragraph.appendText(' Record the rollback owner before release.')) throw new Error('Delivery requirement rejected')
```

### 7. Select the review date for native editing

Click the document first; the selection API is not a replacement for browser focus.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphByText('Last reviewed:')
if (!paragraph) throw new Error('Review paragraph missing')
doc.setSelection(paragraph.getRange().startOffset, paragraph.getRange().endOffset)
```

### 8. Append a distinct review observation

```ts
window.univerAPI.getActiveDocument().appendParagraph('Review observation: Platform Enablement confirmed the rollback handoff with Developer Experience.')
```

### 9. Undo the last operation

```ts
if (!window.univerAPI.getActiveDocument().undo()) throw new Error('Undo rejected or history is empty')
```

### 10. Redo the last operation

```ts
if (!window.univerAPI.getActiveDocument().redo()) throw new Error('Redo rejected or history is empty')
```

### 11. Recreate the edited document with the same identity

```ts
const api = window.univerAPI
const saved = structuredClone(api.getActiveDocument().save())
api.disposeUnit(saved.id)
api.createDocument(saved)
```

### 12. Open an empty document without changing its identity

```ts
const api = window.univerAPI
const empty = structuredClone(api.getActiveDocument().save())
empty.body = { dataStream: '\r\n', paragraphs: [{ startIndex: 0, paragraphId: 'knowledge-empty-paragraph' }], textRuns: [], sectionBreaks: [{ startIndex: 1 }] }
api.disposeUnit(empty.id)
api.createDocument(empty)
```

### 13. Restore the exact captured handbook

```ts
const api = window.univerAPI
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument(structuredClone(window.knowledgeSaved))
```

### 14. Reset the complete in-memory space

```ts
window.location.reload()
```

## Application lifecycle

The returned controller's `save()` captures all three documents and the active page; pass that complete value as the third
argument of `createKnowledgeBaseDemo(container, darkMode, saved)` after disposing the previous owner. This preserves the
same three IDs, not new-ID copies. `openPage()` rejects unknown pages before mutation. `dispose()` is idempotent.
Only this local in-memory persistence is demonstrated; there is no backend, authentication, binary conversion, collaboration
or cross-document link resolver. The related-pages prose does not pretend to be clickable SDK hyperlinks.

## Strict evidence

Five installed-SDK boundaries remain strict failures: ordinary native typing Undo, fresh typing Undo after rebuilding,
and Facade review Undo add empty optional body arrays instead of restoring the exact original snapshot; heading
`setStyle()` changes the target paragraph ID; typing ` / Reviewed` produces `  Reviewed`, consuming the literal slash.
The review action itself preserves paragraph identities. Heading paint succeeds but identity retention does not.
No empty-array normalization, new-ID recreation, hidden shortcut handler or SDK patch hides these differences.
