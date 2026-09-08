# Services agreement / paged clause revision

Current language contract: native UI, startup alerts and authored content are English under either host language. The full English Docs Core locale pack and official CSS remain in the independent export. Existing saved-snapshot argument positions are unchanged; any legacy locale argument is accepted but ignored. Earlier bilingual acceptance is historical, and its SDK limitations remain unresolved unless separately verified.

Fictional sample content, not a legal template for production use. The original
sixteen clauses, $184,000 fee, parties, footer and dedicated signature-page break
remain. Use the native Grid editor for text and formatting; there is no external
approval or Reset toolbar. Complete English core resources and official CSS are shared
by Preview and the independent export.

## Revise Clause 15 and its authored reference

Run this literal recipe with the demo's `univerAPI`. It checks current paragraphs,
not a hidden acceptance flag. Repetition leaves the accepted text unchanged;
unexpected user edits are rejected rather than silently overwritten. These are
three separate native mutations, not an atomic approval workflow or automatic
cross-reference field.

```ts
const doc = window.univerAPI.getDocument('services-agreement-v3-2')
if (!doc) throw new Error('Services agreement is not open')
const replacements = [
  ['15. Reserved', '15. Limitation of liability'],
  ['The parties will finalize the limitation language before signature.', 'Aggregate liability is limited to fees paid in the twelve months before the claim, excluding confidentiality and data-protection breaches.'],
  ['Commercial approval: pending Clause 15.', 'Commercial approval: Clause 15 accepted · cap equals twelve months of fees.'],
]
const targets = replacements.map(([before, after]) => {
  const matches = doc.getParagraphs().filter(p => p.getText() === before || p.getText() === after)
  if (matches.length !== 1) throw new Error('Expected one unchanged clause/reference paragraph')
  return { paragraph: matches[0], after }
})
for (const { paragraph, after } of targets) {
  if (paragraph.getText() !== after && !paragraph.setText(after)) throw new Error('Clause mutation rejected; inspect the non-atomic partial state')
}
```

## Save the native document

```ts
window.agreementSaved = structuredClone(window.univerAPI.getDocument('services-agreement-v3-2').save())
```

This is a native model, not a DOCX/PDF file or a durable saved approval.

## 3. Add a review note without replacing the accepted language

```ts
const paragraph = window.univerAPI.getActiveDocument().findParagraphByText('Commercial approval:')
if (!paragraph || !paragraph.appendText(' Reviewed against Version 3.2.')) throw new Error('Review note rejected')
```

## 4. Select the limitation for native editing

Click the native paper first; this selection is not a replacement for browser focus.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphByText('Aggregate liability is limited to fees paid')
if (!paragraph) throw new Error('Accepted limitation is absent')
doc.setSelection(paragraph.getRange().startOffset, paragraph.getRange().endOffset)
```

## 5. Read actual page geometry

```ts
const doc = window.univerAPI.getActiveDocument()
if (!doc.isTraditional()) throw new Error('The agreement must be a traditional document')
console.log(doc.getSection(0).getEffectivePageSetup())
```

## 6. Leave more margin for review annotations

```ts
if (!window.univerAPI.getActiveDocument().getSection(0).setPageSetup({ marginLeft: 100, marginRight: 100 })) throw new Error('Review margins rejected')
```

## 7. Undo the latest native command

```ts
if (!window.univerAPI.getActiveDocument().undo()) throw new Error('Undo rejected or history empty')
```

## 8. Redo the latest native command

```ts
if (!window.univerAPI.getActiveDocument().redo()) throw new Error('Redo rejected or history empty')
```

## 9. Restore an edited native document with unchanged IDs

The full snapshot includes the version footer, paragraph identities, sections and resources.

```ts
const api = window.univerAPI
const saved = structuredClone(api.getActiveDocument().save())
api.disposeUnit(saved.id)
api.createDocument(saved)
```

## 10. Open intentionally empty body content

The existing footer remains part of the complete model; an empty body is not an empty whole snapshot.

```ts
const api = window.univerAPI
const empty = structuredClone(api.getActiveDocument().save())
empty.body = { dataStream: '\r\n', paragraphs: [{ startIndex: 0, paragraphId: 'agreement-empty-paragraph' }], textRuns: [], sectionBreaks: [{ startIndex: 1 }] }
api.disposeUnit(empty.id)
api.createDocument(empty)
```

## 11. Restore the complete accepted checkpoint

```ts
const api = window.univerAPI
api.disposeUnit(api.getActiveDocument().getId())
api.createDocument(structuredClone(window.agreementSaved))
```

## 12. Reset by recreating the original reserved agreement

The original initialization uses SDK-generated paragraph and footer IDs, so a new reset is not an exact model restore.
Use snippet 11 for identity-preserving recovery.

```ts
window.location.reload()
```

## Lifecycle and acceptance

The factory's fourth argument accepts a complete saved native model; the third remains a legacy locale argument that is accepted but ignored.
Validate with `validateSnapshot(saved)`, dispose the old controller and call
`createServicesAgreementDemo(container, darkMode, locale, saved)`. Restores skip original initialization,
so they never re-create the footer, rewrite paragraph IDs or reset edited clauses. Theme changes retain the current owner.

This sample does not implement legal approval, access control, electronic signatures, automatic cross-reference fields,
tracked-change acceptance, backend storage or binary conversion. The clause/reference update is authored text editing.
Run `node scripts/test-services-agreement-native.mjs` for selected-only native tests. The report under
`test-results/services-agreement-native-acceptance` distinguishes method returns, actual paint, raw history and identity.

Selected acceptance: **33/33 gates passed, including all 12 literal recipes**. Coverage includes original sixteen-clause content, actual two-page layout and footer paint,
native keyboard input and full raw Undo/Redo snapshots, the three-step revision history, same-ID owner recovery and fresh edits,
empty-body recovery, invalid saved input rejection, initial EN/ZH, stable-owner theme and idempotent disposal.
The normal production screenshot waits for current canvas text pixels and a settled native word count as well as no skeleton;
stylesheet presence alone is not proof that the agreement is visible.
