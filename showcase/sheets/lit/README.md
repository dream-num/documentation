# Sheets in Lit

The custom element mounts the official Sheets Core preset inside an open Shadow DOM. The installed preset CSS is bundled as a local shadow stylesheet and also imported globally for SDK portals. No CDN or copied utility styles are used.

`createDemo().setDarkMode(boolean)` forwards theme changes to the existing custom-element owner, preserving workbook edits. Removing the element disposes its captured owner after the enclosing commit; reconnecting creates a fresh workbook. The element registration is guarded and `window.univerAPI` points to the real mounted Facade.

The complete official English preset locale is included. `scripts/test-sheets-lit-headers-theme.mjs` exercises native cell input and full edited workbook/owner preservation through actual Preview StorageEvents and teardown. `scripts/test-showcase-lit-css.mjs` verifies exact bundled CSS bytes, reconnect, resize and reload with `SHOWCASE_LIT_PRODUCT=sheets`.

## Installed Shadow DOM keyboard limitation

With `1.0.0-beta.2`, double-click a cell to edit and click another cell to commit. Single-click typing did not start editing, and Enter did not commit the open editor in the selected browser test. Native pointer commit works. The installed shortcut service tests the retargeted event target with `container.contains(target)`; the custom-element host is outside its inner editor container. These failures are preserved in `test-results/sheets-native-theme-lit/report.json` and `test-results/sheets-native-theme-lit-native-edit/report.json`. No keyboard forwarding, SDK patch or simulated cell write hides this limitation. Full Shadow DOM keyboard compatibility is not claimed.
