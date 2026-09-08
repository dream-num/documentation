# View-specific field layouts

Native UI and authored data are English-only, including on Chinese documentation pages. Legacy locale arguments are ignored; saved-snapshot argument positions are unchanged. Bilingual runtime reports below describe earlier revisions, not acceptance of this English-only revision.

Use the native view tabs to switch between Full record, Compact fieldwork, Notes-first review and Lab handover. The four views share eight original synthetic records but have distinct field order/visibility, sample-column widths (240/180/280/220), row heights and frozen-field counts. Field and view controls remain in the SDK, not a duplicate host panel.

Preview and exported code share the same factory, official CSS and complete available English plugin locales. Theme changes preserve the owner. Pro trial/license notices are unmodified. The SDK currently paints null numeric values as `0.00`; the saved records retain null. This demo does not claim that null is a measured zero.

`node scripts/test-base-field-layout-native.mjs` checks both languages through native view-tab clicks, active view identity, exact field layout/config and unchanged records. Screenshots and report: `test-results/base-field-layout-native`. Current screenshots show the compact and taller notes-review layouts; frozen-field scrolling and exact pixel geometry remain to be tested.

Historical host selector/Inspect/Reset reports do not certify this revision. Card layouts, the larger virtualization workload, native field-edit interactions, standalone execution and pending-activation lifecycle remain open.
