# Rowan / Field-station evidence review

Current language contract: native UI, startup alerts and authored data stay English under either host language. The legacy third locale argument remains accepted but is ignored. All complete English plugin packs, official CSS, native Grid menus and independent host/child models are retained. Earlier bilingual evidence below is historical; this language migration does not resolve its recorded SDK limitations or certify every interaction.

An original fictional review uses traditional A4 pages, wine-colored headings
and serif body text. Seven evidence items cover calibration, clock drift,
battery endurance, enclosure observations, recovery, storage and exposure.
Four owners are linked records, not copied labels. The saved Typst catalog
informs the formal report composition; no competitor artwork is redistributed.

## Run and explore

Run pnpm install and pnpm dev in the independent export. Scroll to chapter 02,
activate the Base, and expand it to see all evidence notes and the Owners table.
This literal example updates the first review item:

```ts
window.univerAPI
  .getBase('rowan-station-evidence')
  .getTableById('evidence')
  .getRecordById('evidence-1')
  .setValue('title', 'Calibration source and trace')
```

Try native Undo/Redo. In Owners, rename Imani Cole to Imani Brooks: the first
and seventh evidence items should show the new label with the same owner ID.
The written report must remain unchanged. Now append text above the body anchor:

```ts
window.univerAPI
  .getDocument('rowan-readiness-review')
  .getParagraphs()[1]
  .appendText(' Revised.')
```

The anchor should move nine UTF-16 units while the entire Base remains unchanged.
This does not synchronize narrative names or implement Formula CustomRange.

## Acceptance and limits

Preview and the eleven-file independent export share one factory and seven
official CSS imports. The host explicitly uses DocumentFlavor.TRADITIONAL,
794 by 1123 layout pixels and numbered chapter breaks. The host defaults to
Grid; Base uses its native record controls. No fixture panel or duplicate toolbar.
Selected production verifies three real A4 skeleton pages, with the complete
native Base on the evidence chapter page. Both literal examples, actual owner
keyboard editing, full Base snapshots across native Undo/Redo, stable owner IDs
and repainted linked labels, fullscreen navigation, the moving UTF-16 body anchor
and active-child disposal pass without observed browser errors or backend calls.
The host snapshot remains strict across Base edits; the Base remains strict
across narrative edits. Expanded columns keep owner handover notes readable.

Build: 208 offline packages, 1845 modules; main JS 18451.72 kB / 4539.57 kB gzip,
CSS 134.30 kB / 18.98 kB gzip. Cold selected Next requests took 104s/78s and
emitted a Gzip drain-listener warning. Loading performance is not accepted.

All names, dates and observations are invented. This is neither equipment
certification nor a safety procedure, deployment approval or live field report.
No notifications, real assignments, backend, Exchange conversion, Print output
or saved PDF are claimed. License watermarks remain intact. Reload loses edits.
Full menus, lifecycle/failure states, accessibility, expanded-data pagination
and performance remain open.
