# North Gallery / Paragraph Typesetting

An original fictional three-chapter museum dossier retains the blue vessel description, dimensions and provisional attribution. The catalog, provenance entries and display review use different paragraph treatments. The actual SDK paginates A4-sized pages; no host page cards or comparison controls simulate pagination.

Native Grid menus own editing, alignment and history. Preview and standalone share one factory, the official Docs Core stylesheet and complete EN/ZH preset locale packs. Initial language follows page lang; business content remains English. Theme changes retain the owner and edited document. Only startup failures show a host alert.

## Runnable Facade variants

Run the numbered examples in order in the preview frame or standalone console. Exact markers are resolved afresh; missing or duplicate targets throw rather than silently changing a different paragraph.

### 1. Capture and find a paragraph

The checkpoint contains the original three-chapter dossier.

```ts
window.northCheckpoint = structuredClone(window.univerAPI.getActiveDocument().save())
window.northParagraph = marker => {
  const matches = window.univerAPI.getActiveDocument().getParagraphs().filter(p => p.getText().includes(marker))
  if (matches.length !== 1) throw new Error('Expected one paragraph: ' + marker)
  return matches[0]
}
```

### 2. Compact description

Apply to "This small blue vessel" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, {  })
if (!window.northParagraph('This small blue vessel').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 3. Book-style description

Apply to "This small blue vessel" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, { lineSpacing: 1.4, spaceAbove: { v: 8 }, spaceBelow: { v: 14 }, indentFirstLine: { v: 28 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.JUSTIFIED })
if (!window.northParagraph('This small blue vessel').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 4. Hanging source entry

Apply to "NG-R01" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, { lineSpacing: 1.2, indentStart: { v: 36 }, hanging: { v: 36 }, spaceBelow: { v: 12 } })
if (!window.northParagraph('NG-R01').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 5. Double-spaced review

Apply to "Reviewer note:" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, { lineSpacing: 2, spaceAbove: { v: 12 }, spaceBelow: { v: 20 }, indentEnd: { v: 24 } })
if (!window.northParagraph('Reviewer note:').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 6. Centered display statement

Apply to "A short label invites" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, { horizontalAlign: window.univerAPI.Enum.HorizontalAlign.CENTER })
if (!window.northParagraph('A short label invites').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 7. Right-aligned byline

Apply to "Prepared by Mira" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, { horizontalAlign: window.univerAPI.Enum.HorizontalAlign.RIGHT })
if (!window.northParagraph('Prepared by Mira').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 8. Left-aligned second source

Apply to "NG-R02" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, {  })
if (!window.northParagraph('NG-R02').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 9. Justified evidence introduction

Apply to "Evidence is filed" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, { horizontalAlign: window.univerAPI.Enum.HorizontalAlign.JUSTIFIED })
if (!window.northParagraph('Evidence is filed').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 10. Narrow display draft

Apply to "DISPLAY DRAFT:" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, { indentStart: { v: 24 }, indentEnd: { v: 36 } })
if (!window.northParagraph('DISPLAY DRAFT:').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 11. Comfortable access review

Apply to "Access review:" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, { lineSpacing: 1.5, spaceAbove: { v: 10 }, spaceBelow: { v: 16 } })
if (!window.northParagraph('Access review:').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 12. First-line source note

Apply to "NG-R02" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, { indentFirstLine: { v: 24 } })
if (!window.northParagraph('NG-R02').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 13. Exact reviewer leading

Apply to "Reviewer note:" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, { spacingRule: window.univerAPI.Enum.SpacingRule.EXACT, lineSpacing: 22 })
if (!window.northParagraph('Reviewer note:').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 14. Restore compact source layout

Apply to "NG-R01" while retaining its wording and the other chapters. Reset all layout properties before applying the chosen variation.

```ts
const style = { spacingRule: window.univerAPI.Enum.SpacingRule.AUTO, snapToGrid: window.univerAPI.Enum.BooleanNumber.FALSE, lineSpacing: 1, spaceAbove: { v: 0 }, spaceBelow: { v: 6 }, indentFirstLine: { v: 0 }, hanging: { v: 0 }, indentStart: { v: 0 }, indentEnd: { v: 0 }, horizontalAlign: window.univerAPI.Enum.HorizontalAlign.LEFT }
Object.assign(style, {  })
if (!window.northParagraph('NG-R01').setStyle(style)) throw new Error('Paragraph style rejected')
```

### 15. Append an editorial decision

Keep original evidence and accession unchanged.

```ts
window.northBeforeEdit = structuredClone(window.univerAPI.getActiveDocument().save())
if (!window.northParagraph('Editorial decision:').appendText(' Final wording reviewed.')) throw new Error('Append rejected')
window.northAfterEdit = structuredClone(window.univerAPI.getActiveDocument().save())
```

### 16. Undo the edit

Native history; full snapshots include paragraph IDs.

```ts
await window.univerAPI.undo()
```

### 17. Redo the edit

Return to the complete edited model.

```ts
await window.univerAPI.redo()
```

### 18. Select for native typing

Click the canvas first, execute this selection, then use the real keyboard.

```ts
const doc = window.univerAPI.getActiveDocument(), range = window.northParagraph('This small blue vessel').getRange()
doc.setSelection(range.startOffset, range.endOffset)
```

### 19. Read real style and content

No separate audit model is maintained.

```ts
window.northReadback = { text: window.northParagraph('This small blue vessel').getText(), style: structuredClone(window.northParagraph('This small blue vessel').getInfo().paragraph.paragraphStyle) }
```

### 20. Reconstruct the checkpoint

New unit identity resets history; the actual canvas must also remount.

```ts
window.univerAPI.disposeUnit(window.univerAPI.getActiveDocument().getId())
window.univerAPI.createDocument({ ...structuredClone(window.northCheckpoint), id: 'north-restored' })
```

## Verification boundary

Run `node scripts/test-north-typesetting-native.mjs`. Default URL: `http://localhost:3030/en-US/playground/docs-traditional/paragraph-typesetting`; `SHOWCASE_DEMO_URL` overrides the exact URL and `SHOWCASE_BASE_URL` the documentation origin. Native menu, keyboard, glyph/layout, full model history and lifecycle checks are strict gates. No backend, print conversion fidelity, mobile, exhaustive menus, accessibility or performance acceptance is implied.

Selected evidence is in `test-results/north-typesetting-native/report.json`. All twenty examples execute. The three native 794 × 1123 pages, 24 original paragraphs, Georgia glyphs, thirteen layout variations including 22pt exact leading, native keyboard input, native menu centering, reconstruction/canvas, complete initial EN/ZH locale handling, edited-model theme ownership and disposal pass. Browser/runtime errors and backend requests are zero.

Full history is not accepted: Facade text Undo/Redo adds an empty `customBlocks` field; native typing Undo adds empty range/decorations/block arrays; native alignment Undo changes paragraph IDs. These remain strict full-snapshot failures, without stripping fields, clearing history or patching the SDK. Native typing/alignment Redo is not certified after its failed Undo. The selected run passes 21 of 25 gates including source parity, not 100% acceptance.

Pass `test-results/north-typesetting-export/manifest.json` as the test's first argument to verify all nine exported files byte-for-byte and every independently linked dependency's exact version. The export uses separate package junctions, never a junction of the entire project node_modules. The explicit existing Vite runtime builds only this demo.
