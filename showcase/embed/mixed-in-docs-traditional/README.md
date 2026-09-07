# Estuary / Grant review dossier

An original fictional museum proposal uses three listening rooms, twenty-four
illustrative excerpts and eighteen caption panels. The traditional A4 dossier
has an executive assessment and four chapters with native cost Sheet, evidence
Base, hearing Slides and release Board. Eight costs, seven evidence items/four
custodians, four slides and eight process cards with ten bound connectors make
the resources distinct. No real recordings, personal data or application is used.

The saved Typst Universe reference informs the formal chapter hierarchy, not the
content or template code. Georgia body/title text, navy headings, blue-gray costs,
warm inputs, wine-colored hearing material and muted process cards vary the design.
The native SDK UI remains white with Grid menus. No generic fixture panel,
redundant action toolbar or iframe child replacement is added.

## Run and explore

Run pnpm install and pnpm dev in the independent export. Read each chapter and
use the native fullscreen control for the corresponding resource. The opening
direct estimate is USD 6,234; eight percent contingency produces USD 6,732.72.
Revise transcript reviews from 24 to 30:

```ts
window.univerAPI.getWorkbook('estuary-exhibition-budget').getSheetByName('Grant costs').getRange('B6').setValue(30)
```

The new requested envelope is USD 7,004.88. The narrative and hearing baseline
remain authored text. Revise a separate evidence note:

```ts
window.univerAPI.getBase('estuary-exhibition-readiness').getTableById('evidence').getRecordById('evidence-2').setValue('note', 'Confirm review scope for 30 illustrative transcripts.')
```

Change the hearing title and process label independently:

```ts
window.univerAPI.getPresentation('estuary-exhibition-strategy').getSlideById('purpose').getShape('title').getText().setText('Listen with context.')
```

```ts
window.univerAPI.getBoard('estuary-exhibition-dependencies').getShape('prepare').getText().setText('Review transcripts\nSofia / In review')
```

Finally append above all four chapter anchors:

```ts
window.univerAPI.getDocument('estuary-exhibition-project').getParagraphs()[1].appendText(' Revised.')
```

Each anchor should move nine UTF-16 units without changing any child. Use native
Undo/Redo in the active product. These examples are not cross-unit Formula,
Formula Shape, Formula CustomRange, permission grants or workflow automation.

## Acceptance and limits

Preview and export use the same factory, data and all official CSS imports.
`test-results/embed-mixed-docs-traditional-page-size/report.json` confirms five actual
A4 renderer pages, with the four blocks in their respective chapters. Native
fullscreen opens all four products; native thumbnail navigation reaches all four
hearing layouts. All five literal examples modify only the intended unit. The
cover edit moves all four anchors nine UTF-16 units and retains the five-page
layout. The cost Sheet's one-page native Print preview opens and cancels without
observed backend requests. Selected active-fullscreen Board disposal has no
browser errors. This is not whole-document printing or a produced PDF.

The strict production gate still **fails**: the first Sheet Facade Undo changes
empty validation serialization from `{}` to `{"resources":[]}`. Values restore;
this is not proven data loss. Exact snapshots are retained without normalization.
Base, Slides and Board literal Undo/Redo comparisons pass. After the initial map
materialization, actual Sheet keyboard input from 30 to 36 and full-five-model
Undo/Redo pass. An explicit input ink color avoids introducing a new style on
typing. The initial production probe targeted B5 instead of B6; the corrected
canvas position passes. Both the original and cell-target reports remain.
The hearing deck uses 800-by-450 pages; an over-wide initial authored size was
corrected after screenshot inspection, without changing the Board's wider canvas.

EN/ZH guide and theme checks: `test-results/embed-mixed-docs-traditional-next-final/report.json`.
They preserve the API owner and five edited models, apart from the native Board's
same-ID palette regeneration. Independent export/CSS evidence:
`test-results/embed-mixed-docs-traditional-export-final/report.json` (eleven files,
23 official CSS imports). The selected 1,944-module build is about 18,834 kB main
JS / 4,646 kB gzip and 170.48 kB CSS / 25.11 kB gzip. Cold Next guide/playground
requests took about 64s/15s with a Gzip listener warning; performance is not accepted.

The demo uses the prior mixed case's asynchronous fullscreen-release ordering;
await dispose() when switching your owned instance. Repeated/racing mounts,
background tabs, failed sources, reload/resource preservation, full menus, all
native edits, accessibility, small screens and performance require acceptance.
No backend, Exchange conversion, whole-document printing, produced PDF, funding
decision, publication rights, license-watermark removal or real submission is claimed.
Reload discards local edits and restores the original snapshots.
