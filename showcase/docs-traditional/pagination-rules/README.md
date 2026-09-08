# Page breaks, section breaks and pagination rules

A short opening lab adds native continuous, next-page, odd-page and even-page section boundaries plus a real manual page-break token. The original seven keep/widow/page-break-before specimens follow unchanged. These are different mechanisms: a page break starts a page inside a section; a section break creates another persisted section. The headings say “Initially” where edits can change placement. No custom page layout or host panels are used.

## Four public Facade recipes

Turn the odd-page boundary into a next-page boundary. Observe whether the parity blank leaf disappears.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphs({paragraphId:'odd-page'})[0]
if (!doc.getSectionAt(paragraph.getRange().startOffset).setSectionType(window.univerAPI.Enum.SectionType.NEXT_PAGE)) throw new Error('Section type rejected')
```

Make that section continuous instead.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphs({paragraphId:'odd-page'})[0]
if (!doc.getSectionAt(paragraph.getRange().startOffset).setSectionType(window.univerAPI.Enum.SectionType.CONTINUOUS)) throw new Error('Section type rejected')
```

Insert a new next-page section before the manual-break reference paragraph.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphs({paragraphId:'manual-before'})[0]
if (!doc.insertSectionBreak(paragraph.getRange().startOffset,{nextSectionType:window.univerAPI.Enum.SectionType.NEXT_PAGE})) throw new Error('Section insertion rejected')
```

Apply paragraph page-break-before without creating another section.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphs({paragraphId:'continuous'})[0]
if (!paragraph.setStyle({pageBreakBefore:window.univerAPI.Enum.BooleanNumber.TRUE})) throw new Error('Paragraph rule rejected')
```

The native Breaks menu is present, but selecting Section Break (Next Page) currently throws an unregistered `doc.menu.section-break.next-page` command error. That strict native check remains failed; public Facade recipes are checked independently. Next-column breaks are not included because this lab has one column; header/footer linking remains in its dedicated gallery.

The initial manual break is inserted with the public `FDocument.insertText(offset, '\f')`. A native Ctrl+Enter attempt at the body caret did not insert a page-break token in the tested SDK; that strict keyboard check remains failed rather than being replaced by an API call. This is not a claim of complete native page-break keyboard support.

## Original pagination specimens and historical limits

Current language contract: native UI, startup alerts and authored content are English under either host language. The full English Docs Core locale pack and official CSS remain in the independent export. The legacy locale argument is accepted but ignored. Earlier bilingual acceptance is historical, and its SDK limitations remain unresolved unless separately verified.

Seven native rule specimens compare natural flow, a stronger natural-heading reference, keep-with-next, keep-lines, widow/orphan control, explicit page-break-before and an oversized paragraph. All rule changes use `FDocumentParagraph.setStyle()`. No host Inspect, Reset or history controls are present. The preview and exported source share the factory, official Docs Core CSS and the complete English locale pack.

Each short page is 560 × 480. Natural/keep-lines/widow/break specimens share 245-point lead-in space. The stronger heading pair uses 270-point spacing to create an orphan heading in its reference. The authored English boundary pressures are identical under either host language.

`node scripts/test-pagination-native-gallery.mjs` (selected server on port 4336; override `SHOWCASE_ORIGIN`) records every paragraph's physical line-to-page assignment. Historical bilingual runs rendered 16 pages. Both show the natural heading stranded on its prior page and keep-with-next moving the heading with the body; keep-lines keeps the short paragraph intact; the oversized paragraph still spans pages.

**Historical SDK boundary, not fixed by this language migration:** The former Chinese widow-control specimen still splits three lines as two on one page and one on the next, despite `widowControl: TRUE`. The English one-plus-two boundary moves intact to the next page. The strict test remains failing for the Chinese case. Do not treat model flags as proof of full pagination correctness. Both the initial run and a warm rerun also emitted a Next Performance/NotFound timestamp error; browser errors are not filtered by the test.

Historical evidence: `test-results/pagination-native-gallery`. Private skeleton access is used only in diagnostic tests, not in exported demo code. Complete widow/orphan combinations remain unverified. Current section-break evidence separately verifies standalone startup/source/CSS and actual Preview section edits, full-snapshot theme retention, unmount and fresh remount; it does not establish complete native break-menu or keyboard support.

The valid-route Performance error was subsequently traced with debugger exception parameters to root `app/not-found.tsx` throwing `NEXT_REDIRECT`: React's development timing used a negative end time. Reusing the existing not-found UI removes that redirect trigger; both valid locale routes pass `test-showcase-performance-timing.mjs` (`showcase-performance-timing-fixed`). `--not-found` still fails for the framework's negative timing on an actual missing page, although the page correctly returns 404 and renders its fallback (`showcase-performance-timing-missing`). No timing API or error logger is patched.
