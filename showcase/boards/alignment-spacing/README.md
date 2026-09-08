# Publishing desk / Native alignment and spacing

Native UI, demo labels and authored data are English-only, including on Chinese documentation pages. Legacy locale arguments are ignored; saved-snapshot argument positions are unchanged. Earlier bilingual acceptance reports below remain historical evidence, not validation of this English-only revision.

Five unequal editorial cards, three supporting nodes and twelve connectors make
edge alignment visibly different from equal-center spacing. Sand, blue-gray,
sage and lavender distinguish the workflow stages. All content is fictional.

Use Shift-click to select the five top-row cards, then right-click and use the
native Align submenu. Top, middle, bottom, left, center and right alignment need
at least two shapes; distribution needs at least three. Supporting nodes should
remain outside the selection. Native keyboard shortcuts and Undo/Redo remain SDK
operations. There is no fixture selector, host layout toolbar, reset or inspector.

Preview and export include all eight English dependency packs and official Design, UI, Docs UI, Drawing UI, Boards UI, Shape Editor, Ink UI and transitive Embed Unit UI CSS.

## Equivalent SDK code

This example aligns top edges and then distributes equal horizontal edge gaps.
It performs two commands; Undo steps through distribution and alignment.

```ts
const board = window.univerAPI.getBoard('editorial-alignment-board')
const ids = ['assignment', 'draft', 'copy', 'art', 'publish']
board.alignElements(ids, 'top')
board.distributeElements(ids, 'horizontal')
```

Custom spacing is a source/API variation, not a second layout toolbar:

```ts
window.univerAPI.getBoard('editorial-alignment-board').arrangeElements(
  ['assignment', 'draft', 'copy', 'art', 'publish'],
  { direction: 'horizontal', gap: 40, start: { x: 70, y: 65 } },
)
```

For other variants use `left`, `center`, `right`, `top`, `middle` or `bottom`
with alignElements; `horizontal` or `vertical` with distributeElements; and
`horizontal` or `vertical` with arrangeElements. Compare gaps of 0, 40 and 120.
The data file retains VARIANTS as a source reference, not a mounted selector.
Reload restores the original desk. Theme changes preserve the current model.

## Native guides and source-only boundaries

Drag Draft near Assignment. A visible guide may indicate soft attraction before
exact snapping. Continue past it to release; press Ctrl/Cmd during the drag to
bypass snapping. A visible grid alone does not quantize shape coordinates.
For explicit grid placement use a single `setElementsTransform()` batch with
origins rounded to a chosen grid size. Alignment can overlap objects; it is not
obstacle avoidance. For an empty starting point clear `pages.desk.elements` and
`pages.desk.elementOrder` in the source snapshot before creation.

## Current acceptance / 2026-09-06

- `test-results/boards-alignment-native-production/report.json`: the independent
  production build passes six alignments, both literal README examples,
  horizontal/vertical distribution and gaps 0/40/120, atomic missing-target
  rejection, native Shift-click/context-menu alignment, native Undo, keyboard
  movement, theme preservation and owned disposal. No browser errors or warnings
  were observed. Snap tests use a single selected card at native 100% zoom:
  soft attraction from requested top 93 reaches 91.2107, hard attraction from
  91 reaches 90, Ctrl bypass stays at 91, and breakaway reaches 105. Native Undo
  restores the five card bounds after each drag.
- `test-results/boards-alignment-native-next/report.json`: EN/ZH guides expose
  ten variants, four actions and four states. Actual media-theme transitions
  preserve the same SDK API owner and edited Board snapshot. Boards uses its
  own native floating tools; there is no empty global ribbon or host toolbar.
- `test-results/boards-alignment-native-export/report.json`: all eleven exported
  files match the displayed source, including official CSS and Preview references.
  Native context-menu icons come from `@univerjs/icons` and are explicitly
  registered through `IconManager`; no replacement SVG or SDK patch is used.
- Earlier failed source reports remain: raw optional undefined fields were not
  a serializable-snapshot comparison; immediate Ctrl+Z after the context menu
  did not restore; the first drag test retained a multi-selection instead of
  isolating Draft. Current tests explicitly check native Undo, canvas-focused
  keyboard Undo and cleared single-card selection rather than hiding failures.
  The initial incremental export install left a broken peer-dependency junction
  and failed builds even after forced installation. A fresh eleven-file export
  installed 169 offline packages and built successfully without hand-edited links.

Remaining: independently compare renderer-object bounds with model bounds; test
fixed-grid batches, empty/source variants, repeated mounts and React unmount
races, narrow/touch layouts and accessibility. Old host-panel reset/accessibility
tests do not certify this UI. Full performance acceptance is also open: the
selected build's main JS is 15,016.88 kB / 3,585.18 kB gzip; CSS is 100.71 / 14.90
kB. The first selected Next guide and playground requests took 79s and 22s,
with a Gzip listener warning. No backend, collaborative revision history,
persistence, Exchange conversion or print output is claimed by this layout demo.
