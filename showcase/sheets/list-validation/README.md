# List Data Validation

Native UI and authored data are English-only. Earlier bilingual/native reports below are historical evidence, not acceptance of this migration.

Use the native worksheet tabs and dropdowns, not a host control panel.

- `single`: B2:B7 chips, C2:C7 arrows, D2:D7 plain text
- `multiple`: B2:B7 multi-select; B2 initially contains SDK-serialized Paper and Textiles.
- `source`: B2:B7 references editable H2:H6
- B4 is unknown, B5 explicitly blank, B7 absent.

All initial rules allow blanks and invalid input; invalid values are not silently replaced. Edit policies with the native Data validation menu. The factory exports both official preset CSS files, complete English locale packs, and the live `window.univerAPI` for exploring Facade calls.


Run `node scripts/test-list-validation.mjs` against a selected local preview for runtime checks. Immediate disposal after rule edits must still be tested against the installed SDK; no pending SDK errors are suppressed here.

Selected EN/ZH Next preview checks pass: no host panels, three native rule variants,
white workbench, real single-dropdown selection with Undo/Redo, native multi-select
pointer addition/removal with worksheet isolation, unchanged blank
and invalid boundaries, and live source changes becoming valid then invalid after
SDK recalculation. Source validation is asynchronous; the test waits for its real
result rather than adding a manual refresh button. Captures and report are in
`test-results/list-validation-native-gallery/`.

Native dropdown Edit opens the rule sidebar in both languages. Clicking Allow
blank values and Done updates the real rule, makes the existing blank invalid,
and preserves all stored values. This replaces the removed duplicate rule panel;
the test does not call a Facade setter to simulate that UI action.

This does not certify keyboard-only multi-select paths, every native rule setting,
reconstruction, immediate teardown, or the separate `--clipboard` gate.
Earlier fixture-panel acceptance belongs to the retired UI, not this revision.
