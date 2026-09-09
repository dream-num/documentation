# Lumen / Paragraph and Heading Blocks

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

Original fictional field-research brief. Six sections retain the audience list, consent task, risk callout, TypeScript code, quotation and protocol link. Edit through the native Grid ribbon and document canvas; no host outline, fixture selector, edit buttons or history controls are added.

Preview and standalone export use the same factory, six official stylesheets and six complete English locale packs. The UI stays English. Authored business content remains English. Theme changes preserve the same editor and edited document. Startup failures alone show a visible alert.

The authored document uses native named styles instead of directly overriding paragraph font size. This keeps the native heading menu and rendered typography aligned. The installed styles resolve H1–H5 to 20/18/16/14/12pt, title to 26pt, and this normal-text document to 11pt. Four summary-layout variants remain literal examples below, not a second formatting toolbar.

## Runnable variants

Run in order in the preview-frame or standalone console. Promote/demote mean changing one heading level within H1–H5; body is a separate semantic choice. Native Grid menus expose editing and formatting without duplicated controls.

### 1. Capture and target a unique paragraph

Run once on a fresh editor. Each later example resolves the unique visible marker afresh; it does not assume paragraph IDs survive history.

```ts
window.lumenCheckpoint = structuredClone(window.univerAPI.getActiveDocument().save())
window.lumenParagraph = marker => {
  const matches = window.univerAPI.getActiveDocument().getParagraphs().filter(p => p.getText().includes(marker))
  if (matches.length !== 1) throw new Error('Expected one paragraph: ' + marker)
  return matches[0]
}
```

### 2. Heading 1

Apply to [SCOPE]; replace it with [PLAN] to exercise the second section. namedStyleType 4 is the installed SDK's HEADING_1 enum value. Native named styles resolve typography; no direct paragraph font size overrides the menu.

```ts
if (!window.lumenParagraph('[SCOPE]').setStyle({ namedStyleType: 4, headingId: 'lumen-scope' })) throw new Error('Heading style rejected')
```

### 3. Heading 2

Apply to [SCOPE]; replace it with [PLAN] to exercise the second section. namedStyleType 5 is the installed SDK's HEADING_2 enum value. Native named styles resolve typography; no direct paragraph font size overrides the menu.

```ts
if (!window.lumenParagraph('[SCOPE]').setStyle({ namedStyleType: 5, headingId: 'lumen-scope' })) throw new Error('Heading style rejected')
```

### 4. Heading 3

Apply to [SCOPE]; replace it with [PLAN] to exercise the second section. namedStyleType 6 is the installed SDK's HEADING_3 enum value. Native named styles resolve typography; no direct paragraph font size overrides the menu.

```ts
if (!window.lumenParagraph('[SCOPE]').setStyle({ namedStyleType: 6, headingId: 'lumen-scope' })) throw new Error('Heading style rejected')
```

### 5. Heading 4

Apply to [SCOPE]; replace it with [PLAN] to exercise the second section. namedStyleType 7 is the installed SDK's HEADING_4 enum value. Native named styles resolve typography; no direct paragraph font size overrides the menu.

```ts
if (!window.lumenParagraph('[SCOPE]').setStyle({ namedStyleType: 7, headingId: 'lumen-scope' })) throw new Error('Heading style rejected')
```

### 6. Heading 5

Apply to [SCOPE]; replace it with [PLAN] to exercise the second section. namedStyleType 8 is the installed SDK's HEADING_5 enum value. Native named styles resolve typography; no direct paragraph font size overrides the menu.

```ts
if (!window.lumenParagraph('[SCOPE]').setStyle({ namedStyleType: 8, headingId: 'lumen-scope' })) throw new Error('Heading style rejected')
```

### 7. Body without deleting text

Apply to [SCOPE]; replace it with [PLAN] to exercise the second section. namedStyleType 1 is the installed SDK's NORMAL_TEXT enum value. Native named styles resolve typography; no direct paragraph font size overrides the menu.

```ts
if (!window.lumenParagraph('[SCOPE]').setStyle({ namedStyleType: 1, headingId: '' })) throw new Error('Heading style rejected')
```

### 8. Compact

Change the summary layout without changing wording or supporting blocks.

```ts
if (!window.lumenParagraph('[SUMMARY]').setStyle({ spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 8 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE })) throw new Error('Paragraph style rejected')
```

### 9. Comfortable inset

Change the summary layout without changing wording or supporting blocks.

```ts
if (!window.lumenParagraph('[SUMMARY]').setStyle({ spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, lineSpacing: 1.5, spaceAbove: { v: 12 }, spaceBelow: { v: 18 }, indentStart: { v: 24 }, indentEnd: { v: 0 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE })) throw new Error('Paragraph style rejected')
```

### 10. Centered

Change the summary layout without changing wording or supporting blocks.

```ts
if (!window.lumenParagraph('[SUMMARY]').setStyle({ spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, lineSpacing: 1.25, spaceAbove: { v: 0 }, spaceBelow: { v: 8 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.CENTER, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE })) throw new Error('Paragraph style rejected')
```

### 11. Hanging indent

Change the summary layout without changing wording or supporting blocks.

```ts
if (!window.lumenParagraph('[SUMMARY]').setStyle({ spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 8 }, indentStart: { v: 36 }, indentEnd: { v: 0 }, indentFirstLine: { v: 0 }, hanging: { v: 24 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE })) throw new Error('Paragraph style rejected')
```

### 12. Append to an existing heading

Content edits must preserve the heading and supporting blocks.

```ts
if (!window.lumenParagraph('[PLAN]').appendText(' · reviewed')) throw new Error('Append rejected')
```

### 13. Undo content

Native history, without manual normalization or clearing pending history.

```ts
await window.univerAPI.undo()
```

### 14. Redo content

The exact edited snapshot is the acceptance target.

```ts
await window.univerAPI.redo()
```

### 15. Select for native keyboard editing

Click the canvas first, execute this example, then return focus to the document. Type with the real keyboard; no host textbox proxies the edit.

```ts
const doc = window.univerAPI.getActiveDocument(), range = window.lumenParagraph('[SCOPE]').getRange()
doc.setSelection(range.startOffset, range.endOffset)
```

### 16. Remove the selected section paragraph

Destructive only within this fictional example. A later missing-marker lookup throws instead of styling another section.

```ts
if (!window.lumenParagraph('[SCOPE]').remove()) throw new Error('Remove rejected')
```

### 17. Undo removal

Complete snapshot equality remains a strict gate, including paragraph IDs.

```ts
await window.univerAPI.undo()
```

### 18. Save current work

This detached snapshot is the real SDK model, not a host audit model.

```ts
window.lumenSaved = structuredClone(window.univerAPI.getActiveDocument().save())
```

### 19. Reconstruct the checkpoint

A new unit resets editing history. Model equality alone does not prove that the canvas remounted.

```ts
window.univerAPI.disposeUnit(window.univerAPI.getActiveDocument().getId())
window.univerAPI.createDocument({ ...structuredClone(window.lumenCheckpoint), id: 'lumen-reconstructed' })
```

### 20. Empty modern document

```ts
const data = structuredClone(window.lumenCheckpoint)
data.id = 'lumen-empty'
data.body = { dataStream: '\r\n', paragraphs: [{ startIndex: 0, paragraphId: 'lumen-empty-paragraph' }], textRuns: [], sectionBreaks: [{ startIndex: 1, sectionId: 'lumen-empty-section' }] }
window.univerAPI.disposeUnit(window.univerAPI.getActiveDocument().getId())
window.univerAPI.createDocument(data)
```

### 21. Restore the original brief

Recovery is reconstruction, not an artificial Undo implementation.

```ts
window.univerAPI.disposeUnit(window.univerAPI.getActiveDocument().getId())
window.univerAPI.createDocument({ ...structuredClone(window.lumenCheckpoint), id: 'lumen-restored' })
```

## Verification boundary

The remaining strict failure is native heading-format Undo: the following summary paragraph's ID changes from its original ID even though the visible content is restored. Full-model equality fails, and heading-format Redo is not certified after that failure. No ID filtering, pending-history clearing, synthetic snapshot, or SDK modification hides this difference. The removed host outline was not a native outline capability and is not counted as coverage.
