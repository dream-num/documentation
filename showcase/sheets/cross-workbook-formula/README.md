# Cross-workbook formula gallery

Revision: native-gallery-v2. Four local workbook units share one Univer formula engine. A workbook picker calls setCurrent(); all cell editing remains in the native Grid Ribbon/editor. The picker changes workbooks, not worksheets, so it does not duplicate native sheet tabs.

Summary B4:B9 contains six simultaneous variants: single cell, SUM range, two sources, same-workbook worksheet, missing workbook and missing sheet. B11:B12 demonstrate a third source and transitive dependency. The real formulas are in B; D contains their text for visual comparison. No host-computed results, write/reset/history buttons or readback panel remain.

Source inputs are original small sales/cost data, not live financial information. IDs, formulas and English workbook/worksheet labels stay stable on either host language. The complete English locale pack and official Core CSS are imported in the exported shared factory. Legacy locale/data-language arguments are ignored. Theme changes retain the same SDK owner and all four edited snapshots.

Expected initial B4:B9: 1500, 2700, 1920, 42, #REF!, #NAME?. Sales B4=180 changes the first three values to 2250, 3450, 2670. The errors are real beta.2 behavior, not text substituted by the host.

Startup waits for SDK Steady before selecting a rendered workbook and requesting calculation. `setCurrent()` before a render unit exists throws `Unit not found`. For numeric assertions use `getRawValues()`; `getValue()` can return formatted strings such as `1500.00`.

Earlier bilingual test results are historical; current English-only native editing
and theme behavior need rerunning. Startup/source checks do not certify all
cross-file formula capabilities.
