# Tide / Callout Blocks

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

An original offline language-kit rollout brief. The original release risk and optional-audio note are joined by an approved-glossary success note and a blocking fallback-label warning. Each is real document content, with a different semantic visual treatment. The original content bullets, acceptance tasks, two-line TypeScript block, editorial quotation, bold emphasis and review-checklist link remain.

Native Grid, document canvas and callout floating menus provide editing. No host property form, fixture picker, edit/history buttons or readback panel is added. Preview and standalone export share the same factory, six official stylesheets and all six English locale packs. The UI stays English; business prose stays English. Theme changes preserve the same editor and edited document.

## Runnable Facade variants

Run snippet 1 first. Snippets 2–32 are independent experiments except where their captions specify an order. Reload for a fresh comparison, or restore the captured baseline. The comparison audio note and other callouts must remain unchanged when RISK is targeted. Trial watermarks remain native and are not hidden.

### 1. Capture the brief and target a block

Run once in the preview-frame or standalone console. Resolve live Facades by stable block ID or unique visible marker.

```ts
window.tideCheckpoint = structuredClone(window.univerAPI.getActiveDocument().save())
window.tideRisk = () => {
  const block = window.univerAPI.getActiveDocument().getCallout('tide-risk')
  if (!block) throw new Error('Risk callout is absent')
  return block
}
window.tideParagraph = marker => {
  const matches = window.univerAPI.getActiveDocument().getParagraphs().filter(p => p.getText().includes(marker))
  if (matches.length !== 1) throw new Error('Expected one paragraph: ' + marker)
  return matches[0]
}
```

### 2. Warning semantic style

Release completeness. The opening brief already shows this style on its own business note; this example applies it to RISK without replacing its wording. Config and text color are two commands, not an atomic history operation.

```ts
if (!window.tideRisk().updateConfig({ icon: '!', showIcon: true, backgroundColor: '#FEF0C7', borderColor: '#D97706', borderWidth: 1 })) throw new Error('Config rejected')
if (!window.tideRisk().setTextColor('#78350F')) throw new Error('Text color rejected')
```

### 3. Information semantic style

Optional audio scope. The opening brief already shows this style on its own business note; this example applies it to RISK without replacing its wording. Config and text color are two commands, not an atomic history operation.

```ts
if (!window.tideRisk().updateConfig({ icon: 'i', showIcon: true, backgroundColor: '#DBEAFE', borderColor: '#2563EB', borderWidth: 1 })) throw new Error('Config rejected')
if (!window.tideRisk().setTextColor('#1E3A8A')) throw new Error('Text color rejected')
```

### 4. Success semantic style

Approved glossary. The opening brief already shows this style on its own business note; this example applies it to RISK without replacing its wording. Config and text color are two commands, not an atomic history operation.

```ts
if (!window.tideRisk().updateConfig({ icon: '✓', showIcon: true, backgroundColor: '#DCFCE7', borderColor: '#16A34A', borderWidth: 1 })) throw new Error('Config rejected')
if (!window.tideRisk().setTextColor('#14532D')) throw new Error('Text color rejected')
```

### 5. Critical semantic style

Missing fallback labels. The opening brief already shows this style on its own business note; this example applies it to RISK without replacing its wording. Config and text color are two commands, not an atomic history operation.

```ts
if (!window.tideRisk().updateConfig({ icon: '×', showIcon: true, backgroundColor: '#FEE2E2', borderColor: '#DC2626', borderWidth: 1 })) throw new Error('Config rejected')
if (!window.tideRisk().setTextColor('#7F1D1D')) throw new Error('Text color rejected')
```

### 6. Text icon

Change the existing icon without changing the body.

```ts
if (!window.tideRisk().setIcon('i')) throw new Error('Icon rejected')
```

### 7. Emoji icon

The native renderer handles the icon; there is no host emoji overlay.

```ts
if (!window.tideRisk().setIcon('💡')) throw new Error('Emoji rejected')
```

### 8. Hide the icon

Only visibility changes; the original text remains.

```ts
if (!window.tideRisk().setIconVisible(false)) throw new Error('Visibility rejected')
```

### 9. Show the icon

Restore the native icon.

```ts
if (!window.tideRisk().setIconVisible(true)) throw new Error('Visibility rejected')
```

### 10. Independent background

Try a lavender editorial-review note while preserving border, text and identity.

```ts
if (!window.tideRisk().setBackgroundColor('#EDE9FE')) throw new Error('Background rejected')
```

### 11. Solid border

Border style, width and opacity are a single Facade command. Installed DashStyleType values are SOLID=1, DOT=2 and DASH=3.

```ts
if (!window.tideRisk().setBorder({ style: 1, width: 1, opacity: 0.75 })) throw new Error('Border rejected')
```

### 12. Dashed border

Border style, width and opacity are a single Facade command. Installed DashStyleType values are SOLID=1, DOT=2 and DASH=3.

```ts
if (!window.tideRisk().setBorder({ style: 3, width: 2, opacity: 0.75 })) throw new Error('Border rejected')
```

### 13. Dotted border

Border style, width and opacity are a single Facade command. Installed DashStyleType values are SOLID=1, DOT=2 and DASH=3.

```ts
if (!window.tideRisk().setBorder({ style: 2, width: 3, opacity: 0.75 })) throw new Error('Border rejected')
```

### 14. No border

Border style, width and opacity are a single Facade command. Installed DashStyleType values are SOLID=1, DOT=2 and DASH=3.

```ts
if (!window.tideRisk().setBorder({ style: 1, width: 0, opacity: 0.75 })) throw new Error('Border rejected')
```

### 15. Default density

Compare actual text inset and fragment height, not only config values. A known beta.2 layout defect may update padding metadata without moving text or resizing the block; the strict test retains that failure.

```ts
if (!window.tideRisk().updateConfig({ paddingTop: 16, paddingBottom: 16, paddingLeft: 20, paddingRight: 20, borderRadius: 8 })) throw new Error('Density rejected')
```

### 16. Compact density

Compare actual text inset and fragment height, not only config values. A known beta.2 layout defect may update padding metadata without moving text or resizing the block; the strict test retains that failure.

```ts
if (!window.tideRisk().updateConfig({ paddingTop: 6, paddingBottom: 6, paddingLeft: 10, paddingRight: 10, borderRadius: 2 })) throw new Error('Density rejected')
```

### 17. Roomy density

Compare actual text inset and fragment height, not only config values. A known beta.2 layout defect may update padding metadata without moving text or resizing the block; the strict test retains that failure.

```ts
if (!window.tideRisk().updateConfig({ paddingTop: 24, paddingBottom: 24, paddingLeft: 28, paddingRight: 28, borderRadius: 16 })) throw new Error('Density rejected')
```

### 18. Reset text color

Restore inherited text color. Compare the original inline bold emphasis separately.

```ts
if (!window.tideRisk().resetTextColor()) throw new Error('Text color reset rejected')
```

### 19. Append editorial review

Resolve the paragraph again after editing rather than caching offsets.

```ts
if (!window.tideParagraph('[RISK]').appendText(' Reviewed by the eight-language editorial panel.')) throw new Error('Text append rejected')
```

### 20. Native text selection

The end offset already excludes the paragraph break. Click the native document first, then run this example and type ordinary prose.

```ts
const doc = window.univerAPI.getActiveDocument()
const range = window.tideParagraph('[RISK]').getRange()
doc.setSelection(range.startOffset, range.endOffset)
```

### 21. Unwrap while retaining text

Remove callout formatting but preserve wording and inline emphasis.

```ts
if (!window.tideRisk().unwrap()) throw new Error('Unwrap rejected')
```

### 22. Wrap the original paragraph

Run after 21. A second execution must not add a duplicate. This is an explicit integration guard, not a simulated SDK operation.

```ts
const doc = window.univerAPI.getActiveDocument()
if (!doc.getCallout('tide-risk') && !doc.insertCallout(window.tideParagraph('[RISK]'), { blockId: 'tide-risk', config: { icon: '!', backgroundColor: '#FEF0C7', borderColor: '#D97706', borderWidth: 1 } })) throw new Error('Wrap rejected')
```

### 23. Delete the block and its content

Unlike unwrap, this removes the risk wording. Use the captured baseline restoration for exact recovery if history fails.

```ts
if (!window.tideRisk().remove()) throw new Error('Removal rejected')
```

### 24. Undo

Check the complete model, not just the boolean. Text-color Undo has a known beta.2 block-range/color defect.

```ts
if (!window.univerAPI.getActiveDocument().undo()) throw new Error('Undo failed or history is empty')
```

### 25. Redo

Check the complete model and newly drawn canvas.

```ts
if (!window.univerAPI.getActiveDocument().redo()) throw new Error('Redo failed or history is empty')
```

### 26. Query content and identity

Descriptions are optional console inspection, not a raw-readback panel in the editor.

```ts
const doc = window.univerAPI.getActiveDocument()
console.log(doc.findCallouts({ text: '[RISK]' }).map(block => block.getId()))
console.log(doc.getCallouts().map(block => block.describe()))
```

### 27. Missing ID without mutation

An absent block must not silently target another business note.

```ts
const doc = window.univerAPI.getActiveDocument()
if (doc.getCallout('missing-callout') != null) throw new Error('Unexpected missing-ID match')
```

### 28. Validate an integrator-supplied color

The original six-digit color input policy is retained without a duplicate property panel. Invalid values must be rejected before the Facade call.

```ts
window.tideBackground = color => {
  if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error('Enter a six-digit hex color')
  if (!window.tideRisk().setBackgroundColor(color)) throw new Error('Background rejected')
}
```

### 29. Recreate the edited model with the same ID

Dispose the unit, then recreate its complete saved data. Do not rewrite its ID, repair ranges or remove fields in equality checks.

```ts
const api = window.univerAPI
const snapshot = structuredClone(api.getActiveDocument().save())
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument(snapshot)
```

### 30. Empty modern document

Use a fixed separate ID, with the original page style.

```ts
const api = window.univerAPI
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument({ id: 'tide-empty', documentStyle: structuredClone(window.tideCheckpoint.documentStyle), body: { dataStream: '\r\n', paragraphs: [{ startIndex: 0, paragraphId: 'tide-empty-paragraph' }], textRuns: [], sectionBreaks: [{ startIndex: 1 }] } })
```

### 31. Restore the captured baseline exactly

Original unit ID, callout metadata, inline styles and neighboring blocks are retained.

```ts
const api = window.univerAPI
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument(structuredClone(window.tideCheckpoint))
```

### 32. Independent text color

A single text-color command isolates color history from the config command used by semantic styles.

```ts
if (!window.tideRisk().setTextColor('#14532D')) throw new Error('Text color rejected')
```

## Verification boundaries

The source demonstrates all variants; that does not promise every beta.2 renderer/history path passes. The dedicated strict test compares real callout descriptions, renderer fragments, glyph positions/colors, actual canvas pixels and complete saved models. Text-color Undo and padding layout are explicit regression gates; failed results are not normalized or repaired. Native keyboard/menu history, semantic styles, unwrap/delete, same-ID reconstruction, missing/invalid inputs, full locale packs and same-owner themes are checked separately.

Current selected beta.2 verification retains four failures: compact/roomy padding leaves actual glyph inset and fragment height unchanged; Facade paragraph append Undo splits an otherwise identical text-color run; callout removal Undo restores body ranges but loses the removed callout's resource configuration; isolated text-color Undo returns false. Native background-menu and keyboard Undo/Redo pass full saved-model comparisons. Edited same-ID recreation and exact captured-baseline restoration pass without ID rewriting or snapshot normalization. A successful styling command is not a promise that its history is correct.
