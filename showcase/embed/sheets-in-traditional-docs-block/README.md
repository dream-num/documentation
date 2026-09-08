# Estuary / Grant cost schedule in a traditional report

Current language contract: native UI, startup alerts and authored data stay English under either host language. The legacy third locale argument remains accepted but is ignored. All complete English plugin packs, official CSS, native Grid menus and independent host/child models are retained. Earlier bilingual evidence below is historical; this language migration does not resolve its recorded SDK limitations or certify every interaction.

An original fictional community archive memorandum separates purpose, a cost
schedule and review gates on traditional A4 pages. Serif body text, numbered
chapters and explicit chapter breaks are inspired by technical reports in the
saved Typst reference. No competitor artwork or template source is redistributed.

Six work packages total USD 15,820. The illustrative 7.5% reserve gives a
USD 17,006.50 envelope, with USD 2,993.50 remaining against a USD 20,000 ceiling.
These are planning assumptions, not an award, quotation or authorization.

## Run and explore

Run pnpm install and pnpm dev in the standalone export. Scroll to chapter 02
and activate the native Sheets block. Expand it to use the Grid ribbon and
Phasing worksheet. This literal example adds four scanning days:

```ts
window.univerAPI
  .getWorkbook('estuary-archive-costs')
  .getSheetBySheetId('costs')
  .getRange('B7')
  .setValue(22)
```

Costs D14 should become 17952.50 and D17 should become 2047.50. Phasing allocates
25%, 50% and 25% of the envelope by default. The first two shares are editable;
the final share and amount balance the remainder. First allocations are rounded
to cents, so the changed model displays 4488.13, 8976.25 and 4488.12, summing
exactly to 17952.50. This is illustrative allocation logic, not payment advice.
Expand the workbook to read the full scope notes. Try native Undo/Redo; no narrative decision
should change. Then append text above the native body anchor:

```ts
window.univerAPI
  .getDocument('estuary-grant-memorandum')
  .getParagraphs()[1]
  .appendText(' Revised.')
```

The block should follow its UTF-16 body anchor while the whole workbook remains
unchanged. This is not cross-document Formula CustomRange synchronization.

## Integration and acceptance

Preview and the eleven-file independent export use one factory and nineteen
official CSS imports. The host explicitly uses DocumentFlavor.TRADITIONAL,
794 by 1123 layout pixels, 72-pixel margins and chapter pageBreakBefore flags.
The selected production test verifies three rendered A4 pages, with chapter 02
and its workbook on the same page and chapter 03 starting the third. Both
worksheets retain 22 rows: the previous 40-row Costs sheet made the native block
1163 pixels tall and caused a five-page report. No business rows were removed.

Native keyboard input, both literal examples, formula recomputation, full workbook
history, independent host state, five populated Grid tabs, fullscreen, one-page
Sheet Print preview/cancel, moved UTF-16 anchor and disposal have selected runtime
coverage. History comparison only equates absent and empty per-sheet validation
rule lists; other snapshot fields remain strict. An earlier strict comparison
failure is retained in test-results/embed-sheet-traditional-block-pagination.
EN/ZH guide tests verify three variants/actions/states and unchanged owner and
both edited snapshots across light/dark changes. Full acceptance remains open.

Known intermittent failures are retained, not treated as fixed: the production
final run failed to mount Print after fullscreen exit (missing renderer/clientWidth),
while the same-build recheck passed. The Next final run timed out after its
playground returned HTTP 500 with an unexpected end of JSON error; an earlier
EN/ZH run passed. Print and documentation-loading reliability remain open.
Selected production evidence is in test-results/embed-sheet-traditional-block-recheck;
source/CSS parity is in test-results/embed-sheet-traditional-block-export-final.
The build contains 1928 modules; main JS is 18304.65 kB (4538.89 kB gzip),
CSS 128.30 kB (19.59 kB gzip). Cold Next requests took about 80s/33s and emitted
a Gzip drain-listener warning. These measurements do not meet a performance budget.

The Sheet Print plugin prepares the child and exits Embed fullscreen when its
native print preview opens. Registration is not proof of actual output.
No grant approval, real rights review, recordings, publishing, backend service,
Exchange conversion, physical printing or saved PDF output is claimed.

Full native menus, paging/scroll/focus boundaries, failure states, repeated
mounts, persistence, accessibility and performance remain open. No fixture
panel or duplicate native editing buttons. License watermarks remain unchanged.
Reload discards local edits.
