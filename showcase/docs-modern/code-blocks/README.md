# Beacon / Code Blocks

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

An original Community Lighting Digest, with fictional sensor data rather than real safety thresholds. The six-section brief preserves its TypeScript ingestion, independent SQL comparison, review rules, tasks, caution, editorial quotation and link. The original JSON manifest, Python filter and SQL summary now appear as separate native business blocks in the same document. Tabs, a blank line, long source lines and the Unicode dash are deliberate content, not host-rendered examples.

Native Grid and the code language picker provide the UI. There are no sample loaders, language/layout/tab forms, duplicate editing/history controls or readback panels. Preview and export share one factory, six official stylesheets, all six English packs, English UI and same-owner theme changes. The owner has idempotent disposal; trial watermarks remain untouched.

## Literal Facade examples

Run snippet 1 first. Other snippets are separate experiments unless their captions specify an order; reload or restore the baseline between them. The samples are displayed, never executed. Configuration success does not prove the renderer or history works.

### 1. Capture the document and resolve live targets

Run first in the preview frame or standalone console. IDs remain stable; no host controls or diagnostic panels are added.

```ts
window.beaconCheckpoint = structuredClone(window.univerAPI.getActiveDocument().save())
window.beaconCode = () => {
  const code = window.univerAPI.getActiveDocument().getCode('beacon-ingest')
  if (!code) throw new Error('Ingestion code is absent')
  return code
}
window.beaconParagraph = marker => {
  const paragraphs = window.univerAPI.getActiveDocument().getParagraphs().filter(p => p.getText().includes(marker))
  if (paragraphs.length !== 1) throw new Error('Expected one paragraph: ' + marker)
  return paragraphs[0]
}
```

### 2. typescript syntax

This changes the primary block language, not its source text. The original JSON/Python/SQL business blocks already show language-appropriate content elsewhere in the same brief.

```ts
if (!window.beaconCode().updateConfig({ config: { language: 'typescript' } })) throw new Error('Language rejected')
```

### 3. javascript syntax

This changes the primary block language, not its source text. The original JSON/Python/SQL business blocks already show language-appropriate content elsewhere in the same brief.

```ts
if (!window.beaconCode().updateConfig({ config: { language: 'javascript' } })) throw new Error('Language rejected')
```

### 4. json syntax

This changes the primary block language, not its source text. The original JSON/Python/SQL business blocks already show language-appropriate content elsewhere in the same brief.

```ts
if (!window.beaconCode().updateConfig({ config: { language: 'json' } })) throw new Error('Language rejected')
```

### 5. python syntax

This changes the primary block language, not its source text. The original JSON/Python/SQL business blocks already show language-appropriate content elsewhere in the same brief.

```ts
if (!window.beaconCode().updateConfig({ config: { language: 'python' } })) throw new Error('Language rejected')
```

### 6. sql syntax

This changes the primary block language, not its source text. The original JSON/Python/SQL business blocks already show language-appropriate content elsewhere in the same brief.

```ts
if (!window.beaconCode().updateConfig({ config: { language: 'sql' } })) throw new Error('Language rejected')
```

### 7. plaintext syntax

Compare plain text with TypeScript highlighting. Every source character must remain unchanged.

```ts
if (!window.beaconCode().updateConfig({ config: { language: 'plaintext' } })) throw new Error('Language rejected')
```

### 8. Wrap long lines

Inspect actual line geometry, not only the returned config. The deliberately long summary line is the comparison target.

```ts
if (!window.beaconCode().updateConfig({ config: { wrap: true } })) throw new Error('Wrap config rejected')
```

### 9. Do not wrap long lines

The known beta.2 renderer limitation is retained as a strict layout gate.

```ts
if (!window.beaconCode().updateConfig({ config: { wrap: false } })) throw new Error('Wrap config rejected')
```

### 10. Show line numbers

A config update does not prove a gutter was drawn. The test checks actual native rendering.

```ts
if (!window.beaconCode().updateConfig({ config: { showLineNumbers: true } })) throw new Error('Line-number config rejected')
```

### 11. Hide line numbers

Run after 10 for a visual comparison.

```ts
if (!window.beaconCode().updateConfig({ config: { showLineNumbers: false } })) throw new Error('Line-number config rejected')
```

### 12. One-column tabs

The original code contains real tab characters, not spaces inserted by the demo.

```ts
if (!window.beaconCode().updateConfig({ config: { tabSize: 1 } })) throw new Error('Tab config rejected')
```

### 13. Eight-column tabs

Compare the actual first non-whitespace glyph position with snippet 12.

```ts
if (!window.beaconCode().updateConfig({ config: { tabSize: 8 } })) throw new Error('Tab config rejected')
```

### 14. Validate integration-supplied settings

The original allowed language list and integer tab-width range are preserved without duplicate property inputs.

```ts
window.beaconTab = value => {
  if (!Number.isInteger(value) || value < 1 || value > 8) throw new Error('Tab size must be an integer from 1 to 8')
  if (!window.beaconCode().updateConfig({ config: { tabSize: value } })) throw new Error('Tab config rejected')
}
window.beaconLanguage = language => {
  if (!['typescript','javascript','json','python','sql','plaintext'].includes(language)) throw new Error('Unsupported example language')
  if (!window.beaconCode().updateConfig({ config: { language } })) throw new Error('Language rejected')
}
```

### 15. Append an actual blank line

This inserts a document paragraph break before the code block end. No HTML or alternate source buffer is substituted.

```ts
const doc = window.univerAPI.getActiveDocument()
if (!doc.insertText(window.beaconCode().getRange().endIndex - 1, '\r')) throw new Error('Blank line rejected')
```

### 16. Select the code for native typing

Click the native document first. Selection uses live paragraph boundaries, whose end offsets already exclude the paragraph break.

```ts
const doc = window.univerAPI.getActiveDocument()
const range = window.beaconCode().getRange()
const paragraphs = doc.getParagraphs().filter(p => p.getRange().startOffset >= range.startIndex && p.getRange().endOffset <= range.endIndex)
if (!paragraphs.length) throw new Error('Code has no paragraphs')
doc.setSelection(paragraphs[0].getRange().startOffset, paragraphs.at(-1).getRange().endOffset)
```

### 17. Unwrap code while preserving whitespace

Unwrap intentionally removes block sentinels. Preserve all code paragraphs, tabs and blank lines; do not normalize snapshots in history checks.

```ts
if (!window.beaconCode().unwrap()) throw new Error('Unwrap rejected')
```

### 18. Wrap the existing ingestion paragraphs

Run 17 first. This guard prevents duplicates; the last empty paragraph includes its actual paragraph break.

```ts
const doc = window.univerAPI.getActiveDocument()
if (!doc.getCode('beacon-ingest')) {
  const paragraphs = doc.getParagraphs()
  const first = window.beaconParagraph('02 · Ingestion example').getInfo().paragraphIndex + 1
  const last = window.beaconParagraph('03 · Review rules').getInfo().paragraphIndex - 1
  if (last < first) throw new Error('No ingestion paragraphs remain')
  if (!doc.insertCode({ blockId: 'beacon-ingest', startOffset: paragraphs[first].getRange().startOffset, endOffset: paragraphs[last].getRange().endOffset + (paragraphs[last].getText() === '' ? 1 : 0), config: { language: 'typescript' } })) throw new Error('Wrap rejected')
}
```

### 19. Delete code and content

This removes the primary block and its content, unlike unwrap. The independent SQL comparison and other business blocks must remain.

```ts
if (!window.beaconCode().remove()) throw new Error('Deletion rejected')
```

### 20. Undo explicitly

A false return or complete snapshot difference is a failure, not a reason to repair fields.

```ts
if (!window.univerAPI.getActiveDocument().undo()) throw new Error('Undo failed or history is empty')
```

### 21. Redo explicitly

Check the complete saved model and newly drawn canvas.

```ts
if (!window.univerAPI.getActiveDocument().redo()) throw new Error('Redo failed or history is empty')
```

### 22. Query block identity and configuration

Optional console inspection does not add an editor readback panel.

```ts
const doc = window.univerAPI.getActiveDocument()
console.log(doc.getCodes().map(code => ({ id: code.getId(), range: code.getRange(), config: code.getConfig(), description: code.describe() })))
console.log(doc.findCodes({ blockId: 'beacon-ingest' }).map(code => code.getId()))
```

### 23. Missing ID without a fallback target

An absent block must not silently select comparison code.

```ts
if (window.univerAPI.getActiveDocument().getCode('missing-code') != null) throw new Error('Unexpected code block')
```

### 24. Read Facade code text

The installed beta.2 getText() loses paragraph breaks. The strict test compares it with the authored multiline text and retains the failure.

```ts
console.log(window.beaconCode().getText())
```

### 25. Copy the Facade result unchanged

This intentionally exposes the same whitespace failure instead of silently claiming correct copying. Clipboard permission/secure context is required; rejection is not caught or hidden.

```ts
if (!navigator.clipboard?.writeText) throw new Error('Clipboard requires HTTPS or localhost and permission')
await navigator.clipboard.writeText(window.beaconCode().getText())
```

### 26. Read source from the public saved-model range

An explicitly separate integration alternative. This is not a fix to getText(): remove only the structural final paragraph break and convert document CR separators to LF for a text clipboard. Tabs and internal blank lines remain. Full saved-model comparisons are never transformed.

```ts
window.beaconSource = () => {
  const doc = window.univerAPI.getActiveDocument()
  const range = window.beaconCode().getRange()
  return doc.save().body.dataStream.slice(range.startIndex + 1, range.endIndex).replace(/\r$/, '').replaceAll('\r', '\n')
}
console.log(window.beaconSource())
```

### 27. Copy current saved-model source

Run 26 first. Copy edited source, never the static SAMPLES array. Some OS clipboards convert LF to CRLF; this is a clipboard transport concern, not permission to normalize SDK snapshots. Displayed code is never executed.

```ts
if (!navigator.clipboard?.writeText) throw new Error('Clipboard requires HTTPS or localhost and permission')
await navigator.clipboard.writeText(window.beaconSource())
```

### 28. Recreate edited data with the same unit ID

Retain code resources, exact source, tabs, ranges and neighboring blocks. No time-derived IDs or field substitutions.

```ts
const api = window.univerAPI
const saved = structuredClone(api.getActiveDocument().save())
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument(saved)
```

### 29. Open an empty modern document

Use a fixed separate empty-unit ID.

```ts
const api = window.univerAPI
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument({ id: 'beacon-code-empty', documentStyle: structuredClone(window.beaconCheckpoint.documentStyle), body: { dataStream: '\r\n', paragraphs: [{ startIndex: 0, paragraphId: 'beacon-code-empty-paragraph' }], textRuns: [], sectionBreaks: [{ startIndex: 1 }] } })
```

### 30. Restore the exact captured baseline

No history clearing or model repair is required for this explicit snapshot path.

```ts
const api = window.univerAPI
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument(structuredClone(window.beaconCheckpoint))
```

### 31. Inspect all four business samples without a loader

TypeScript ingestion, JSON batch manifest, Python review filter and SQL daily summary are separate real blocks in one brief. The original SQL average query remains an independent fifth block.

```ts
const doc = window.univerAPI.getActiveDocument()
for (const id of ['beacon-ingest','beacon-json','beacon-python','beacon-sql','beacon-query']) {
  const code = doc.getCode(id)
  if (!code) throw new Error('Missing business block: ' + id)
  console.log(id, code.getConfig(), code.getRange())
}
```

### 32. Append a review note to the original comment

A real paragraph edit inside code. Native slash-menu behavior is tested separately; no example is executed as JavaScript.

```ts
if (!window.beaconParagraph('// Beacon batch:').appendText(' Review pending.')) throw new Error('Comment append rejected')
```

## Verification boundary

The dedicated test compares original multiline content, real native glyphs/draw calls and full saved models. Installed beta.2 can draw native syntax colors, change language through its picker, insert a code block through Grid, and undo ordinary code text/blank-line edits. Configuration success alone does not prove rendering: wrapping, line numbers and tab widths currently fail the actual-layout checks. getText() drops paragraph breaks, so copying it unchanged also fails whitespace preservation. The explicitly separate saved-model clipboard path preserves those breaks; Windows clipboard output is checked against exact CRLF transport text without normalizing returned values or saved models.

Complete history remains strict: language Undo leaves the changed language in place and undoes an earlier checklist operation; deleting then undoing a code block does not restore its resource; Grid insertion then Undo leaves the new resource behind. Native slash-menu handling intercepts a slash inside code and fails literal slash input; ordinary typing is tested separately, never silently substituted. Explicit same-ID recreation and captured-baseline restore are separate passing recovery paths, not substitutes for history. The old internal fit-width/scroll adapter is removed: automatic narrow viewport fitting is not claimed, while native zoom remains available.
