# Native chart gallery

Native UI and authored data are English-only. Earlier bilingual/native reports below are historical evidence, not acceptance of this migration.

Six native worksheet tabs show column, line, bar, area, a warm theme, and two-level station/quarter categories. Edit B4:D9 (C4:D11 for station/quarter) in the grid; each chart references its own sheet. Monthly data deliberately includes negative, zero, decimal, and missing values. The first five sheets use matching values for meaningful chart-type comparisons.

The shared factory exports Core, Drawing and Advanced CSS and complete English preset locale packs. Grid Ribbon remains native. Theme changes preserve the workbook. Advanced-preset features unrelated to charts and trial limitations remain outside this case's acceptance scope.

## Verification boundary

Current unlicensed beta.2 rejects Area insertion with `Failed to create Sheet chart`.
The factory retains that variant and its source, displays the failure in native
cells, and continues initializing the other five variants. This is not six working
charts or full acceptance. A chart-authorized license is needed to validate Area;
no SDK limits are bypassed. The strict test checks available charts then still fails
if any planned variant is absent. Early development runs also retained startup
timeouts; warm initialization evidence does not certify cold-start performance.

Known beta.2 issue: full `FChart.update()` is not atomic in history (configuration, source and layout take separate steps). `--atomic-history` strictly asserts one-step undo and remains an expected failure until the installed SDK fixes it. This is not represented as an interactive history showcase or hidden by an extra button.

This is partial coverage, not acceptance of every chart type, setting or mobile gesture. Use the real `FChart.exportImage({ format: 'png' })` API for PNG output; no host control panel is added.
