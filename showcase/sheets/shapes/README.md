# Native shape gallery

Native UI and authored data are English-only. Earlier bilingual/native reports below are historical evidence, not acceptance of this migration.

Four native worksheets compare geometry and fills, text and strokes, bound connectors, and cell anchoring. Use worksheet tabs and native drawing tools; no fixture, duplicated formatting buttons or JSON panel is included.


The exported factory includes official Core, Drawing and Advanced CSS and complete English preset locale packs. The original inline SVG needs no remote asset. Theme changes toggle the existing SDK instance without recreating the workbook. SDK trial notices remain visible.

## Check

Current selected EN/ZH checks pass four native tabs, 27 shape/connector objects,
model variants, text mutation and theme identity. Eight gallery screenshots were
inspected selectively; geometry labels/placement were adjusted and rerun. This
does not certify native dragging, every toolbar action or lifecycle teardown.

Run `node scripts/test-sheet-shapes.mjs` against the selected-demo development server using `SHOWCASE_BASE_URL`. The check covers native tabs, model variants, shape text mutation and theme identity. It does not prove every native drawing toolbar command or every preset. Visual inspection, native dragging and lifecycle navigation are separate acceptance checks; no prior control-panel test result is claimed for this new gallery.

Not included: SmartArt, exhaustive preset coverage, permission claims, collaborative history, XLSX exchange. Existing SDK lifecycle/unmount errors in the wider collection remain a separate open acceptance item until navigation is checked for this case.
