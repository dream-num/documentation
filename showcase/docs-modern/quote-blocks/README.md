# Harbor / Quote Blocks

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

An original fictional walking-guide pilot, not real navigation advice. The original 21 paragraphs remain: a steward’s voice, context and attribution, a contrasting observation, routes, acceptance tasks, caution, TypeScript configuration and review link. Five new community/research paragraphs make four native business quotes visible: editorial blue, community green, research violet and high contrast. The latter two demonstrate two- and three-paragraph boundaries. `visible route` remains bold and italic; `clear directions` remains bold.

Edit with native Grid and document canvas. The registered quote UI also supplies a floating toolbar, but its opening click path is currently a strict failure in this installed build; do not assume it is available from the screenshot. There is no host property form, fixture picker, history toolbar or raw-readback panel. Preview/export use one factory, all six official stylesheets and six complete English locale packs. The UI stays English; the fictional business prose stays English. Theme switching preserves the current editor and edits. Trial watermarks are not hidden.

## Literal Facade examples

Run snippet 1 in the preview frame or standalone console. The remaining snippets are separate experiments; reload or restore the baseline between them unless a caption specifies an order. All mutations below call real SDK Facades. No success boolean is treated as proof of correct history.

### 1. Capture a baseline and resolve live targets

```ts
window.harborCheckpoint = structuredClone(window.univerAPI.getActiveDocument().save())
window.harborVoice = () => {
  const quote = window.univerAPI.getActiveDocument().getQuote('harbor-voice')
  if (!quote) throw new Error('Voice quote is absent')
  return quote
}
window.harborParagraph = marker => {
  const paragraphs = window.univerAPI.getActiveDocument().getParagraphs().filter(p => p.getText().includes(marker))
  if (paragraphs.length !== 1) throw new Error('Expected one paragraph: ' + marker)
  return paragraphs[0]
}
```

### 2. Single-paragraph quote

Run 5 first to unwrap VOICE. Repeating this guarded insertion does not create duplicates; unwrap again before changing scope.

```ts
const doc = window.univerAPI.getActiveDocument()
if (!doc.getQuote('harbor-voice') && !doc.insertQuote(window.harborParagraph('[VOICE]'), { blockId: 'harbor-voice' })) throw new Error('Single quote rejected')
```

### 3. Voice with its context

Run 5 first. The two original paragraphs become one quote, while the original attribution remains outside. The green community quote already shows a separate two-paragraph business example.

```ts
const doc = window.univerAPI.getActiveDocument()
if (!doc.getQuote('harbor-voice') && !doc.insertQuote({ blockId: 'harbor-voice', startOffset: window.harborParagraph('[VOICE]').getRange().startOffset, endOffset: window.harborParagraph('[CONTEXT]').getRange().endOffset })) throw new Error('Context quote rejected')
```

### 4. Voice, context and attribution

Run 5 first. Include all three original paragraphs within one boundary. The violet research quote already includes an observation, method and fictional attribution.

```ts
const doc = window.univerAPI.getActiveDocument()
if (!doc.getQuote('harbor-voice') && !doc.insertQuote({ blockId: 'harbor-voice', startOffset: window.harborParagraph('[VOICE]').getRange().startOffset, endOffset: window.harborParagraph('[ATTR]').getRange().endOffset })) throw new Error('Attributed quote rejected')
```

### 5. Unwrap while preserving prose and inline marks

Unwrap intentionally removes block sentinels and shifts offsets. It does not delete the quotation or normalize its text runs.

```ts
if (!window.harborVoice().unwrap()) throw new Error('Unwrap rejected')
```

### 6. Editorial voice

Apply both colors as the real combined-style command. The SDK promises a command, but complete Undo remains a separate regression check.

```ts
if (!window.harborVoice().setStyle({ lineColor: '#2563EB', textColor: '#1E3A8A' })) throw new Error('Editorial style rejected')
```

### 7. Community feedback

```ts
if (!window.harborVoice().setStyle({ lineColor: '#16A34A', textColor: '#14532D' })) throw new Error('Community style rejected')
```

### 8. Research evidence

```ts
if (!window.harborVoice().setStyle({ lineColor: '#7C3AED', textColor: '#4C1D95' })) throw new Error('Research style rejected')
```

### 9. High-contrast comparison

```ts
if (!window.harborVoice().setStyle({ lineColor: '#111827', textColor: '#111827' })) throw new Error('Contrast style rejected')
```

### 10. Independent left rule

The current text color and neighboring quotes must remain unchanged.

```ts
if (!window.harborVoice().setLineColor('#B45309')) throw new Error('Line color rejected')
```

### 11. Independent text color

The current left rule and existing bold/italic marks must remain unchanged.

```ts
if (!window.harborVoice().setTextColor('#0F766E')) throw new Error('Text color rejected')
```

### 12. Append attribution inside the current boundary

The last paragraph is resolved from the live quote range. Repeating this integration guard leaves an existing attribution unchanged. With snippet 4 it already exists inside the quote.

```ts
const doc = window.univerAPI.getActiveDocument()
const quote = window.harborVoice()
const attribution = '— Mira Bell, fictional route steward'
if (!quote.getText().includes(attribution)) {
  const range = quote.getRange()
  const last = doc.getParagraphs().findLast(p => p.getRange().startOffset >= range.startIndex && p.getRange().endOffset <= range.endIndex)
  if (!last || !last.appendText(' ' + attribution)) throw new Error('Attribution append rejected')
}
```

### 13. Select quote text for native editing

Click the native document first. Block offsets include start/end sentinels; paragraph range end offsets already exclude the paragraph break. This selection covers every paragraph inside the current quote.

```ts
const doc = window.univerAPI.getActiveDocument()
const range = window.harborVoice().getRange()
const paragraphs = doc.getParagraphs().filter(p => p.getRange().startOffset >= range.startIndex && p.getRange().endOffset <= range.endIndex)
if (!paragraphs.length) throw new Error('Quote has no paragraphs')
doc.setSelection(paragraphs[0].getRange().startOffset, paragraphs.at(-1).getRange().endOffset)
```

### 14. Delete quote and content

This differs from unwrap: all content inside the quote is removed. Check delete history separately; the captured baseline is the exact-recovery path if history fails.

```ts
if (!window.harborVoice().remove()) throw new Error('Quote removal rejected')
```

### 15. Undo with an explicit failure

```ts
if (!window.univerAPI.getActiveDocument().undo()) throw new Error('Undo failed or history is empty')
```

### 16. Redo with an explicit failure

```ts
if (!window.univerAPI.getActiveDocument().redo()) throw new Error('Redo failed or history is empty')
```

### 17. Query identities, boundaries and styles

Optional console inspection does not add a readback panel. The same APIs can drive an integrator’s own tools.

```ts
const doc = window.univerAPI.getActiveDocument()
console.log(doc.getQuotes().map(q => ({ id: q.getId(), range: q.getRange(), text: q.getText(), style: q.getStyle(), description: q.describe() })))
console.log(doc.findQuotes({ text: '[VOICE]' }).map(q => q.getId()))
console.log(doc.getQuoteAt(window.harborParagraph('[VOICE]').getRange().startOffset)?.getId())
```

### 18. Missing identity is not a fallback target

```ts
if (window.univerAPI.getActiveDocument().getQuote('missing-quote') != null) throw new Error('Unexpected quote')
```

### 19. Validate a user-supplied color before mutation

Retain the original six-digit hex policy without a duplicate property form. Unknown channels and invalid colors are rejected before calling the SDK.

```ts
window.harborColor = (channel, color) => {
  if (!['line', 'text'].includes(channel) || !/^#[0-9a-f]{6}$/i.test(color)) throw new Error('Choose line/text and a six-digit hex color')
  const quote = window.harborVoice()
  if (!(channel === 'line' ? quote.setLineColor(color) : quote.setTextColor(color))) throw new Error('Color rejected')
}
```

### 20. Recreate the edited document with the same ID

Preserve the complete model, including its ID, resources and overlapping inline marks. No time-derived ID or equality normalization is used.

```ts
const api = window.univerAPI
const saved = structuredClone(api.getActiveDocument().save())
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument(saved)
```

### 21. Open an empty modern document

```ts
const api = window.univerAPI
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument({ id: 'harbor-quote-empty', documentStyle: structuredClone(window.harborCheckpoint.documentStyle), body: { dataStream: '\r\n', paragraphs: [{ startIndex: 0, paragraphId: 'harbor-quote-empty-paragraph' }], textRuns: [], sectionBreaks: [{ startIndex: 1 }] } })
```

### 22. Restore the exact captured baseline

```ts
const api = window.univerAPI
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument(structuredClone(window.harborCheckpoint))
```

### 23. Append a review observation

The paragraph belongs to the existing quote. Compare native text/glyphs and full Undo/Redo snapshots, not just the appended words.

```ts
if (!window.harborParagraph('[VOICE]').appendText(' Reviewed with the accessibility group.')) throw new Error('Observation append rejected')
```

## Verification boundary

The dedicated test executes these literal examples, inspects real native glyphs/rules and canvas pixels, exercises native menu/typing and compares complete history/recreation snapshots. Known beta.2 combined-color Undo failure stays a strict regression gate. Source examples are not a promise that every SDK history path passes; failures are neither hidden nor repaired.

Current installed beta.2 boundaries: combined-style and text-only Undo return false; Facade append Undo splits an otherwise identical text-color run at the paragraph tail. The quote floating toolbar did not open at the actual VOICE hit region, so its picker/history remains unaccepted. Native Grid quote insertion and left-line-only/delete history are tested separately. Same-ID reconstruction retains complete saved data; no ID or text-run rewriting is used. The old host's internal fit-width/scroll adapter is removed; narrow viewport auto-fit is not claimed, and native zoom controls remain available.
