# Latency-aware reconciliation / Traditional research paper

Current language contract: native UI, startup alerts and authored content are English under either host language. The full English Docs Core locale pack and official CSS remain in the independent export. Existing saved-snapshot argument positions are unchanged; any legacy locale argument is accepted but ignored. Earlier bilingual acceptance is historical, and its SDK limitations remain unresolved unless separately verified.

This is an illustrative fictional manuscript, not a verified scientific publication or SDK benchmark. The original title,
authors, abstract, sections, two reference entries and Appendix A are retained. In particular, 12,480 sessions, 37% conflict
reduction, 80 / 240 / 1,200 ms latency, 142 / 611 ms reconciliation, 0.8% / 2.6% conflict density, the 25 MB limit and the
reproduction seed, clock and retry schedule are unchanged. The small replay matrix and scope note reorganize those same facts.

The manuscript uses native A4 geometry (794 × 1123 layout pixels), 72-pixel margins, serif typography, blue section headings
and real SDK pagination. Appendix A begins on a new native page. There are no custom page images, copied assets or HTML
overlays inside the paper. The former Add appendix / Reset / activity panel and hidden appendix flag are removed.
The former factory relied on a random SDK document ID; this version assigns the stable `research-paper` ID at creation
and never changes it during recovery.

Preview and normal export use one factory with native Grid, official Docs Core preset CSS, the complete English preset locale pack and an English native interface. Business prose remains English. Theme switching retains the owner and current edits.
Use native text editing, pagination, zoom and Page setup; the appendix examples below are real Facade operations.

## Literal Facade examples

Run each block in order in the browser console of the demo frame or standalone export. Example 4 deliberately throws on a
repeat request. Commit native edits before saving. A returned success flag is not proof of complete history or correct paint.

### 1. Capture the complete original manuscript

```ts
window.researchSaved = structuredClone(window.univerAPI.getActiveDocument().save())
```

### 2. Define a model-guarded, distinct reviewer appendix

Appendix A is already visible. This adds a genuinely different Appendix B; the guard queries the live document, not a hidden
boolean. The append and styling calls are real SDK commands, not an atomic multi-command transaction.

```ts
window.appendResearchReview = () => {
  const doc = window.univerAPI.getActiveDocument()
  const title = 'Appendix B. Reviewer Checklist'
  if (doc.findParagraphByText(title)) throw new Error('Reviewer appendix already exists')
  const heading = doc.appendParagraph(title)
  if (!heading.setStyle({ pageBreakBefore: 1, textStyle: { fs: 13, bl: 1, ff: 'Times New Roman', cl: { rgb: '#24467A' } } })) throw new Error('Appendix heading rejected')
  const body = doc.appendParagraph('Review the replay seed and frozen clock; compare all three latency bands; retain unresolved conflicts; document the media and font-substitution exclusions.')
  if (!body.setStyle({ textStyle: { fs: 11, ff: 'Times New Roman', cl: { rgb: '#202735' } }, spaceAbove: { v: 8 } })) throw new Error('Appendix body rejected')
}
```

### 3. Append the reviewer checklist

```ts
window.appendResearchReview()
```

### 4. Reject a duplicate without changing the manuscript

```ts
window.appendResearchReview()
```

### 5. Annotate the interpretation without changing the original results

```ts
const paragraph = window.univerAPI.getActiveDocument().findParagraphByText('Median reconciliation time was 142 ms.')
if (!paragraph || !paragraph.appendText(' Reviewer note: compare the tail latency with the median before drawing conclusions.')) throw new Error('Results annotation rejected')
```

### 6. Restyle the Method heading

```ts
const paragraph = window.univerAPI.getActiveDocument().findParagraphByText('2. Method')
if (!paragraph || !paragraph.setStyle({ textStyle: { fs: 14, bl: 1, ff: 'Times New Roman', cl: { rgb: '#735195' } } })) throw new Error('Method style rejected')
```

### 7. Select the results for native review

Click the paper first; selection does not replace browser focus.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphByText('Median reconciliation time was 142 ms.')
if (!paragraph) throw new Error('Results paragraph missing')
doc.setSelection(paragraph.getRange().startOffset, paragraph.getRange().endOffset)
```

### 8. Create wider annotation margins

This changes the real section geometry and may change page count, not the authored research facts.

```ts
const section = window.univerAPI.getActiveDocument().getSection(0)
if (!section || !section.setPageSetup({ marginLeft: 100, marginRight: 100 })) throw new Error('Annotation margins rejected')
```

### 9. Undo the previous command

```ts
if (!window.univerAPI.getActiveDocument().undo()) throw new Error('Undo rejected or history is empty')
```

### 10. Redo the previous command

```ts
if (!window.univerAPI.getActiveDocument().redo()) throw new Error('Redo rejected or history is empty')
```

### 11. Recreate the edited manuscript with its unchanged ID

```ts
const api = window.univerAPI
const saved = structuredClone(api.getActiveDocument().save())
api.disposeUnit(saved.id)
api.createDocument(saved)
```

### 12. Open an intentionally empty paper with the same identity

```ts
const api = window.univerAPI
const empty = structuredClone(api.getActiveDocument().save())
empty.body = { dataStream: '\r\n', paragraphs: [{ startIndex: 0, paragraphId: 'research-empty-paragraph' }], textRuns: [], sectionBreaks: [{ startIndex: 1 }] }
api.disposeUnit(empty.id)
api.createDocument(empty)
```

### 13. Restore all original content and Appendix A

```ts
const api = window.univerAPI
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument(structuredClone(window.researchSaved))
```

### 14. Reset by rerunning the original application

```ts
window.location.reload()
```

## Owner lifecycle and honest scope

Capture the complete document with `save()`, dispose the old controller, and pass that snapshot as the third argument of
`createResearchPaperDemo(container, darkMode, saved)`. The factory validates the original identity and positive page
dimensions before creating a replacement. Empty content is supported; active disposal is idempotent.

This demo does not claim automatic citation management, a LaTeX/Typst compiler, Equation/Formula computation, actual
collaboration experiments, binary import/export or backend storage. It demonstrates an editable authored manuscript.
No snapshot normalization or new recovery IDs hide SDK defects.

## Strict evidence

Run `node scripts/test-research-paper-native.mjs` for the selected-only production export and independent native harness.
The report separates original facts/pagination, actual painted text, keyboard input, complete history, literal API behavior,
same-ID recovery, initial EN/ZH, stable-owner themes and disposal. Final evidence is stored under
`test-results/research-paper-native-acceptance`: **29 / 33 strict gates pass, and all 14 literal blocks pass**.
The original two-page manuscript, native Appendix A on page two, and distinct appended Appendix B on page three all paint.
True keyboard edits, same-ID full-owner recovery and fresh editing, empty/full recovery, initial EN/ZH, stable themes and
idempotent disposal pass. The original paragraph identities remain intact when appending Appendix B.

Four strict SDK differences remain: ordinary native typing Undo and fresh typing Undo after recovery add empty optional
body arrays; the margins Undo changes the section identity; Method heading styling replaces that paragraph's identity.
Their complete before/after/undo/redo models are retained, without filling arrays or replacing IDs to normalize equality.
Heading glyph color and page geometry pass independently from identity/history fidelity.

The nine-file normal export manifest is `test-results/research-paper-native-acceptance/exports.json`.
Final current source/CSS parity is `test-results/research-paper-native-export-parity/report.json`.
The dedicated normal-production gate waits for current-canvas ink, native word count and no startup skeleton on the
unmodified production entry. Its actually inspected `normal-production-settled.png` is the cover candidate; a generic
CSS screenshot alone is not proof that body content has painted. Other inspected images include `baseline.png`,
`appendix-a.png`, and `appendix-b.png`. Earlier first/complete runs remain historical visual/test iterations.
