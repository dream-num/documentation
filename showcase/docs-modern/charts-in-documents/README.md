# Native document chart gallery

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

Revision: native-gallery-v2.

Seven small original datasets demonstrate column, line, area, bar, stacked column, pie and donut charts. They vary data, palette and legend placement. All are real inline document charts created with public FDocument builders. No host chart controls, fixture toolbar, JSON readback, repair-hub story, unrelated table or column layout remain.

The native Grid Ribbon is visible. Preview and standalone export share the factory and official Docs Core, Drawing and Chart UI CSS. Complete English locale packs are registered. Theme changes retain edits rather than recreating the document.

If a chart type is rejected by the installed SDK, its section displays the real error; the strict gallery test fails. It is never replaced by a picture or silently changed to another chart type. Trial restrictions remain visible.

## Verification and known limits

Run `node scripts/test-doc-charts-native-gallery.mjs` against this selected local playground (SHOWCASE_DEMO_URL and SHOWCASE_RESULTS_DIR are supported). It checks all seven Facade chart types, native UI, absence of extra panels, independent data and public data updates. It is not full chart capability certification.

The earlier `scripts/test-modern-charts.mjs` targets the removed control-panel revision and is historical evidence, not this gallery's acceptance script. Its known beta.2 defects remain unresolved: FChart.setSize can update model/skeleton dimensions while the visible frame keeps its prior size; Undo of drawing-size commands can likewise leave a stale frame. This cleanup makes no resize/undo correctness claim. Old screenshots do not certify this revision. Narrow-screen layout and lifecycle still require acceptance.
