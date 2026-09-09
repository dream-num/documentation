# Mosaic / Lists and Task Items

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

An original pop-up museum opening brief: three borrowed objects, five installation steps, a separate two-step partner handoff and three opening checks. LABEL and LIGHT are nested under the accessible-route step; collected keys are already complete. The warning, operating code, quotation and handling link remain real neighboring SDK blocks.

Use the native Grid ribbon and editable document, including list menus, indentation, checkboxes, typing and native Undo/Redo. No fixture picker, duplicate formatting/history controls or model-readback panels are added. Preview and standalone export share the factory, six official stylesheets and all six English locale packs. The UI stays English; business content stays English. Theme changes preserve the owner and edits.

## Runnable Facade variants

Run snippet 1 once in the preview-frame or standalone console. Snippets resolve visible markers afresh after editing; offsets are not cached. Snippets 2–27 are independent experiments: reload for a pristine comparison, or use the snapshot examples. All methods below are real Facades. Inspect returned descriptions in the console, not a replacement SDK UI.

### 1. Capture the document and resolve targets

```ts
window.mosaicCheckpoint = structuredClone(window.univerAPI.getActiveDocument().save())
window.mosaicParagraph = marker => {
  const matches = window.univerAPI.getActiveDocument().getParagraphs().filter(p => p.getText().includes(marker))
  if (matches.length !== 1) throw new Error('Expected one paragraph: ' + marker)
  return matches[0]
}
window.mosaicItem = marker => {
  const matches = window.univerAPI.getActiveDocument().findListItems({ text: marker })
  if (matches.length !== 1) throw new Error('Expected one list item: ' + marker)
  return matches[0]
}
```

### 2. Promote one preparation step

```ts
if (!window.mosaicItem('[LABEL]').promote({ mode: window.univerAPI.Enum.DocsListSelectionMode.Item })) throw new Error('Promote rejected')
```

### 3. Demote one preparation step

```ts
if (!window.mosaicItem('[LABEL]').demote({ mode: window.univerAPI.Enum.DocsListSelectionMode.Item })) throw new Error('Demote rejected')
```

### 4. Demote the current level

LABEL and LIGHT share a level. Compare both rendered markers and indentation; current-level scope is not single-item scope.

```ts
if (!window.mosaicItem('[LABEL]').demote({ mode: window.univerAPI.Enum.DocsListSelectionMode.Level })) throw new Error('Level demote rejected')
```

### 5. Demote the whole installation list

```ts
if (!window.mosaicItem('[FLOOR]').demote({ mode: window.univerAPI.Enum.DocsListSelectionMode.List })) throw new Error('List demote rejected')
```

### 6. Decimal marker for one step

```ts
if (!window.mosaicItem('[WALK]').setGlyphType(window.univerAPI.Enum.ListGlyphType.DECIMAL, { mode: window.univerAPI.Enum.DocsListSelectionMode.Item })) throw new Error('Decimal marker rejected')
```

### 7. Uppercase letters for the preparation level

```ts
if (!window.mosaicItem('[LABEL]').setGlyphType(window.univerAPI.Enum.ListGlyphType.UPPER_LETTER, { mode: window.univerAPI.Enum.DocsListSelectionMode.Level })) throw new Error('Letter markers rejected')
```

### 8. Roman numerals for one item; strict scope regression

Run immediately after 7 to reproduce the known beta.2 boundary. LIGHT must not change when only LABEL changes. The strict test retains a failure if a shared custom-list definition leaks the item edit to LIGHT; this demo does not repair the SDK state.

```ts
const neighborBefore = window.mosaicItem('[LIGHT]').describe()
if (!window.mosaicItem('[LABEL]').setGlyphType(window.univerAPI.Enum.ListGlyphType.LOWER_ROMAN, { mode: window.univerAPI.Enum.DocsListSelectionMode.Item })) throw new Error('Roman marker rejected')
const neighborAfter = window.mosaicItem('[LIGHT]').describe()
if (neighborAfter.glyphType !== neighborBefore.glyphType) throw new Error('Single-item marker changed its neighbor')
```

### 9. Diamond bullets for the object shortlist

```ts
if (!window.mosaicItem('[RADIO]').setGlyphSymbol('◆', { mode: window.univerAPI.Enum.DocsListSelectionMode.List })) throw new Error('Diamond bullets rejected')
```

### 10. Restart rehearsal numbering at seven

Numbering restarts can affect following continuous items even with item scope. Compare visible numbering, not only the configured start value: the internal list definition stores a counter offset (6 for visible 7).

```ts
if (!window.mosaicItem('[WALK]').setStartNumber(7, { mode: window.univerAPI.Enum.DocsListSelectionMode.Item })) throw new Error('Restart rejected')
```

### 11. Continue the partner handoff from the previous ordered segment

```ts
if (!window.mosaicItem('[EMAIL]').continueNumbering()) throw new Error('No compatible previous numbering segment')
```

### 12. Step n: formatting for the installation list

```ts
if (!window.mosaicItem('[FLOOR]').setPrefixSuffix('Step ', ':', { mode: window.univerAPI.Enum.DocsListSelectionMode.List })) throw new Error('Prefix/suffix rejected')
```

### 13. Complete the exit check

```ts
if (!window.mosaicParagraph('[EXIT]').setTaskChecked(true)) throw new Error('Task completion rejected')
```

### 14. Reopen the collected-keys task

```ts
if (!window.mosaicParagraph('[KEYS]').setTaskChecked(false)) throw new Error('Task reopening rejected')
```

### 15. Native single-item selection

```ts
if (!window.mosaicItem('[LABEL]').select(window.univerAPI.Enum.DocsListSelectionMode.Item)) throw new Error('Item selection rejected')
```

### 16. Native same-level selection

```ts
if (!window.mosaicItem('[LABEL]').select(window.univerAPI.Enum.DocsListSelectionMode.Level)) throw new Error('Level selection rejected')
```

### 17. Native whole-list selection

```ts
if (!window.mosaicItem('[FLOOR]').select(window.univerAPI.Enum.DocsListSelectionMode.List)) throw new Error('List selection rejected')
```

### 18. Update wording without replacing the list

```ts
if (!window.mosaicParagraph('[LABEL]').appendText(' · matched to the loan register')) throw new Error('Text edit rejected')
```

### 19. Undo the preceding edit

```ts
if (!window.univerAPI.getActiveDocument().undo()) throw new Error('Nothing to undo')
```

### 20. Redo the preceding edit

```ts
if (!window.univerAPI.getActiveDocument().redo()) throw new Error('Nothing to redo')
```

### 21. Read structure and render-relevant definitions

```ts
console.table(window.univerAPI.getActiveDocument().describeListItems())
console.log(window.univerAPI.getActiveDocument().getLists().map(list => list.describe()))
```

### 22. Recreate the current edited snapshot

Dispose the active unit before recreating its saved snapshot with the same unit ID. Compare the complete model including that ID; do not delete empty arrays or change paragraph IDs to force equality. Verify the recreated canvas too.

```ts
const api = window.univerAPI
const snapshot = structuredClone(api.getActiveDocument().save())
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument(snapshot)
```

### 23. Empty modern document

```ts
const api = window.univerAPI
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument({ id: 'mosaic-empty', documentStyle: structuredClone(window.mosaicCheckpoint.documentStyle), body: { dataStream: '\r\n', paragraphs: [{ startIndex: 0, paragraphId: 'mosaic-empty-paragraph' }], textRuns: [], sectionBreaks: [{ startIndex: 1 }] } })
```

### 24. Restore the original captured brief

```ts
const api = window.univerAPI
api.disposeUnit(api.getActiveDocument().getId())
const snapshot = structuredClone(window.mosaicCheckpoint)
api.createDocument(snapshot)
```

### 25. Guard a user-supplied start number before invoking the Facade

This input policy belongs to an integrator, not a fake SDK operation. The original demo's 1–99 limit is retained here without a duplicate input panel. Try 0, a fraction or NaN: rejection must precede any document mutation.

```ts
window.mosaicRestart = number => {
  if (!Number.isInteger(number) || number < 1 || number > 99) throw new Error('Enter a whole number from 1 to 99')
  if (!window.mosaicItem('[WALK]').setStartNumber(number, { mode: window.univerAPI.Enum.DocsListSelectionMode.Item })) throw new Error('Restart rejected')
}
```

### 26. Prefix and suffix for the current level

Only LABEL and LIGHT share this preparation level. Compare their markers with FLOOR, WALK and OPEN.

```ts
if (!window.mosaicItem('[LABEL]').setPrefixSuffix('Prep ', ')', { mode: window.univerAPI.Enum.DocsListSelectionMode.Level })) throw new Error('Level prefix/suffix rejected')
```

### 27. Explicit single-item nesting boundary policy

The original integration allows levels 0–8. This optional integrator guard returns an explicit boundary result before invoking the SDK; it does not claim that a rejected SDK command succeeded. Native ribbon behavior remains untouched. To nest LABEL and LIGHT together, call this function once per item; these remain two real commands and require two Undo operations.

```ts
window.mosaicMove = (marker, direction) => {
  if (direction !== 'promote' && direction !== 'demote') throw new Error('Choose promote or demote')
  const item = window.mosaicItem(marker)
  const level = item.describe().nestingLevel
  if ((direction === 'promote' && level === 0) || (direction === 'demote' && level === 8)) return 'boundary'
  if (!item[direction]({ mode: window.univerAPI.Enum.DocsListSelectionMode.Item })) throw new Error('Nesting rejected')
  return 'changed'
}
```

## Verification

Native keyboard/menu changes, complete-model Undo/Redo, list glyphs/positions and actual pixels are separate checks. Known scope/history defects remain strict failures. Initial nesting boundaries are SDK behavior, not silently intercepted host no-ops. Browser export reconstruction, English UI on either host language and same-owner theme checks must be accepted independently. No backend is needed for this native list/task case; the guide URL is a fictional attribution target, not a data dependency.
