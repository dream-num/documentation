# Paragraph Layout

Three native PDF pages compare ten editable semantic paragraph frames. The text is identical within each comparison group; only the paragraph layout differs. Labels are separate text objects and describe the initial state.

1. **Alignment:** left, center and right paragraphs, plus a stored `justify` sample. The installed SDK renders that sample left-aligned rather than distributing spaces to justify the lines. It is retained to show this limitation, not presented as working justification. Block alignment is distinct from the frame's horizontal text anchor.
2. **Spacing:** 1.2 and 1.8 line-height multipliers, plus a two-block example with 8 pt before and 12 pt after each block.
3. **Indents:** an 18 pt first-line indent, an 18 pt hanging indent, and a 36 pt right inset.

Use native page thumbnails and zoom controls to inspect all three pages. Edit text with the native text editor; this is not an HTML or CSS paragraph overlay.

## Units

Frame position and size use PDF points. Paragraph `lineHeight` is a unitless font-size multiplier. The five block lengths—`indent`, `firstLineIndent`, `rightIndent`, `spacingBefore` and `spacingAfter`—use EMU, so use the public `ptToEmu()` conversion. The native properties panel presents these lengths in CSS pixels, not points.

## Public Facade recipes

These TypeScript recipes run in the example source after initialization with `univerAPI` available. Import `ptToEmu` from the public package for the length recipes; they are not browser-console snippets with unresolved imports.

### Change alignment without moving the frame

```ts
const paragraph = univerAPI.getActivePdf().getPageByIndex(0).getParagraphs().find(p => p.getId() === 'left')
paragraph.setBlockStyle(paragraph.getBlocks()[0].id, { align: 'right' })
```

### Increase line height

```ts
const paragraph = univerAPI.getActivePdf().getPageByIndex(1).getParagraphs().find(p => p.getId() === 'compact')
for (const block of paragraph.getBlocks()) paragraph.setBlockStyle(block.id, { lineHeight: 1.8 })
```

### Remove paragraph gaps

```ts
const paragraph = univerAPI.getActivePdf().getPageByIndex(1).getParagraphs().find(p => p.getId() === 'paragraph-gap')
for (const block of paragraph.getBlocks()) paragraph.setBlockStyle(block.id, { spacingBefore: 0, spacingAfter: 0 })
```

### Replace a first-line indent with a right inset

```ts
import { ptToEmu } from '@univerjs-pro/pdfs'

const paragraph = univerAPI.getActivePdf().getPageByIndex(2).getParagraphs().find(p => p.getId() === 'first-line')
paragraph.setBlockStyle(paragraph.getBlocks()[0].id, { firstLineIndent: 0, rightIndent: ptToEmu(36) })
```

These recipes modify block styles, not text, block IDs, frame geometry or other paragraph objects. Reload to restore the original comparison. Export fidelity is outside this example's scope.
