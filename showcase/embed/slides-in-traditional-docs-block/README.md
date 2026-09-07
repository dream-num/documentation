# Summit / Conference handout with a native discussion deck

An original synthetic route-study handout separates method, a four-slide
discussion and limitations on traditional A4 pages. The deck uses an ocean-blue
cover, gray-blue process cards, warm comparison bars and a lavender review page.
The user's Deep Ocean colors and saved Gamma technical-deck reference inform
the contrast; the saved Typst catalog informs the report format. No competitor
artwork or copy is redistributed.

## Run and explore

Run pnpm install and pnpm dev in the standalone export. Scroll to chapter 02,
activate the native Slides block and use Next page or fullscreen thumbnails.
This literal example changes only the first cover-title paragraph:

```ts
const text = window.univerAPI
  .getPresentation('summit-shade-discussion')
  .getSlideById('question')
  .getShape('cover-title')
  .getText()
const rich = text.getRichText().copy()
rich.getParagraphs()[0].getTextRuns()[0].setText('Compare the shade.')
text.setRichText(rich)
```

Try native Undo/Redo. Expand the deck, type in the title or move a shape.
The process cards and 30%, 55%, 75% bars illustrate different layouts. Bars
and labels are separate editable shapes; they are not live charts or Formula
Shapes and changing a label does not recalculate geometry. All values are invented.
Now append text above the document body anchor:

```ts
window.univerAPI
  .getDocument('summit-route-handout')
  .getParagraphs()[1]
  .appendText(' Revised.')
```

The anchor should move nine UTF-16 units while the complete deck stays unchanged.
This is not Formula CustomRange or automatic synchronization between documents.

## Acceptance and limits

Preview and the eleven-file independent export share one factory and eight
official CSS imports. The host explicitly uses DocumentFlavor.TRADITIONAL,
794 by 1123 layout pixels and chapter page breaks. Host and expanded Slides
default to Grid; the embedded child retains its native floating controls.
No fixture panel, duplicate editing buttons or iframe stands in for Slides.
Selected independent production passes three actual A4 skeleton pages, both
literal examples, full-snapshot Facade Undo/Redo, native shape movement and
Undo/Redo, native text insertion/history, four-page navigation/fullscreen,
the nine-unit anchor shift, independent models and active-child disposal.
See test-results/embed-slide-traditional-block-production-final/report.json.
EN/ZH guides and theme/model preservation pass separately in
test-results/embed-slide-traditional-block-next-final/report.json.
Eleven-file source parity and official white CSS pass in
test-results/embed-slide-traditional-block-export-final/report.json.
These are partial checks, not complete SDK acceptance.

The first movement test selected a thumbnail glyph, not the main canvas.
The retained geometry report exposes its 251px canvas; the final test uses the
centered main canvas at the initial 100% zoom and checks real model movement.
Process labels were shortened to avoid title/body overlap; card padding and
two-line footers keep content clear of the unchanged license notice.

Native selection remains unfinished: Ctrl+A followed by whole-title replacement
duplicates the first paragraph, and Home then Shift+End does not replace the
expected final line. Both still fail after animation-frame settling. Reproduce
with scripts/test-embed-slide-traditional-block.mjs and SHOWCASE_NATIVE_TEXT_MODE
set to replace-all or replace-line (default insert checks only insertion).
Reports: test-results/embed-slide-traditional-block-select-all-settled and
test-results/embed-slide-traditional-block-select-line-settled. No SDK patch or
manual selection workaround is applied. Insertion/history passing does not
certify caret placement, selection, or those shortcuts. The first native commit
also materializes rich text; its exact pre-edit history restoration is not proven.

The independent build contains 1844 modules, with main JS 18136.49 kB / 4502.53 kB
gzip and CSS 121.04 kB / 17.94 kB gzip. Cold selected Next guide/playground requests
took 76s/41s and emitted a Gzip drain-listener warning. Loading performance remains
open; compiling this one demo is not a whole-catalog build.

Six stops and two time windows are a twelve-note discussion exercise, not a
representative study or heat-exposure advice. No data collection, route guidance,
geographic service, publishing, backend, Exchange conversion or Print/PDF output
is claimed. License watermarks remain intact. Reload discards local edits.
Full menus/playback, first-native-edit history, lifecycle/failure cases,
expanded-content pagination, accessibility and performance remain open.
