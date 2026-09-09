# Atlas / annual reporting narrative

Current language contract: native UI, startup alerts and authored content are English under either host language. The full English Docs Core locale pack and official CSS remain in the independent export. Existing saved-snapshot argument positions are unchanged; any legacy locale argument is accepted but ignored. Earlier bilingual acceptance is historical, and its SDK limitations remain unresolved unless separately verified.

Fictional SDK sample, not audited financial statements or investment guidance.
The original shareholder letter, four business lines, three-year revenues,
18.6% operating margin, $9.2M operating cash flow and risk outlook appear in
the native document. Five additional chapters cover the customer journey, service
reliability, capital allocation, governance and reporting basis. Their narrative
distinguishes authoring from approvals and fictional figures from audited results.
The subtitle labels the sample as fictional and unaudited in the visible document.
Physical page margins, Georgia headings, recurring header/footer, keep-with-next
and widow control use native Docs. Grid, official CSS and complete English
core resources are shared by Preview and export. There is no external revision,
Reset, inspector or activity panel; theme changes retain the current owner.

## Revise the illustrative FY2027 disclosure

Run this literal snippet with the demo's `univerAPI`. It updates both the original
three-year disclosure and its headline, leaving FY2025/FY2026, operating margin,
cash flow and narrative unchanged. This is authored text revision, not a linked
Formula or automatic financial calculation. The original 8.6% label is illustrative.
Two native text mutations are not one atomic transaction or approval workflow.
Unexpected user edits are rejected before writing; repeating the completed recipe
does not rewrite the paragraphs or require a hidden boolean.

```ts
const doc = univerAPI.getDocument('atlas-fy2027-report')
const before = 'FY2027 Revenue · $45.0M · Growth 5.1%'
const after = 'FY2027 Revenue · $46.5M · Growth 8.6%'
const headlines = doc.getParagraphs().filter(p => [before, after].includes(p.getText()))
const oldText = 'FY2027 Revenue · $45.0M'
const newText = 'FY2027 Revenue · $46.5M'
const disclosures = doc.getParagraphs().filter(p => [oldText, newText].includes(p.getText()))
if (headlines.length !== 1 || disclosures.length !== 1) throw new Error('Expected one original disclosure and headline')
const disclosure = disclosures[0]
if (disclosure.getText() !== newText) disclosure.setText(newText)
if (headlines[0].getText() !== after) headlines[0].setText(after)
```

## Save the complete native report

```ts
const snapshot = univerAPI.getDocument('atlas-fy2027-report').save()
console.log(snapshot)
```

This returns a native model, not a PDF/DOCX file or durable server storage.

## Compact review pages

Use smaller physical pages to inspect real pagination, recurring header/footer,
heading keep-with-next and paragraph widow control without adding filler content.
The default 794 × 1123 report remains unchanged until this recipe runs.

```ts
univerAPI.getDocument('atlas-fy2027-report').getSection(0).setPageSetup({
  pageSize: { width: 560, height: 560 },
})
```

## Restore the complete owner

Run in the exported entry module with its `container` and mutable `demo` bindings.
Import `validateSnapshot` alongside `createAnnualReportDemo` from `./create-demo`.
Validation happens before disposal. Do not rebuild header/footer segments or
replace paragraph IDs: the entire saved model is passed through unchanged.

```js
const saved = structuredClone(demo.univerAPI.getDocument('atlas-fy2027-report').save())
validateSnapshot(saved)
const darkMode = demo.univerAPI.isDarkMode()
const locale = demo.univerAPI.getCurrentLocale()
demo.dispose()
demo = createAnnualReportDemo(container, darkMode, locale, saved)
```

The factory clones the input and skips seed creation during restoration. Theme
changes call `toggleDarkMode` on the current owner. Native UI stays English under either initial HTML language. Disposal unmounts the native UI and document and is safe to repeat.
The native Page settings menu can change paper size and margins; native typing
and Undo/Redo remain available without a duplicate host editor.

## Verification

The earlier selected run verifies all three TypeScript literals and the owner
restore literal, settled native word count, Georgia financial disclosure glyphs,
header/footer paint, one-page default and two-page compact layout, native paper
and margin edits, body typing, and complete Undo/Redo snapshots. It also verifies
same-ID reconstruction without regenerating segment or paragraph IDs, fresh
native editing afterwards, full EN/ZH packs, same-owner themes, validation before
disposal and immediate/idempotent cleanup. The earlier failed font-type test and
560 × 720 single-page assumption remain in the first run's report; neither was
hidden by snapshot normalization or a product patch. That one-page/two-page count
predates the expanded ten-chapter narrative; current pagination is checked from
the renderer rather than inferred from the old report.
