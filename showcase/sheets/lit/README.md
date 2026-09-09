# Sheets in Lit

The custom element mounts the official Sheets Core preset inside an open Shadow DOM. The installed preset CSS is bundled as a local shadow stylesheet and also imported globally for SDK portals. No CDN or copied utility styles are used.

`createDemo().setDarkMode(boolean)` forwards theme changes to the existing custom-element owner, preserving workbook edits. Removing the element disposes its captured owner after the enclosing commit; reconnecting creates a fresh workbook. The element registration is guarded and `window.univerAPI` points to the real mounted Facade.
