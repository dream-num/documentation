# Meaningful Facade actions

Every SDK demonstration button must use an API provided by the installed Facade and have an observable purpose. A click handler or success message is not implementation evidence. Host controls (navigation, source download, fixtures, reset) must be distinguished from SDK capabilities.

## Current native-only policy

### Attachment startup failures release the editor

The attachment factory now uses the already-tested formula-field cleanup
pattern: failed table/view activation releases the event, native mount, unit
and owner before showing a removable English alert. Both original and cleanup
errors remain available. `node scripts/test-base-formula-fields.mjs --startup-only`
checks both actual factories with stubbed fault boundaries; six checks pass in
`test-results/attachment-cleanup-faults/report.json`. Before the fix the
attachment factory released none of those resources. This is a demo fix, not
an SDK patch. The selected attachment export, exact English/CSS/source parity,
seven native gates per host and actual StrictMode/theme/remount regression
also pass under `attachment-cleanup-export`, `attachment-cleanup-export-ui`,
`attachment-cleanup-native` and `attachment-cleanup-previews` respectively.

### Section and page breaks in the existing pagination gallery

The existing `docs-traditional/pagination-rules` now opens with genuine
continuous, manual, next/odd/even break specimens. Initial physical placement
has a blank fourth leaf before the odd-page fifth leaf, not a host-created page.
`test-results/section-break-native-final-readback/report.json` completes four
literal recipes per host with independent physical-layout readback. Native
Ctrl+Enter and Next Page menu insertion remain failed, with the latter emitting
an unregistered command error. Neither is substituted with a hidden API call.
The exact English/CSS export and actual Preview StrictMode/full-model themes/
unmount/fresh original boundaries pass separately. Main reviewed initial and
blank/odd-page screenshots. This extends one route and keeps original rule
specimens; it does not certify every old keep/widow condition or mixed page
geometry. No SDK edits or new host control panel are involved.

The original seven-rule regression subsequently passes on both hosts in
`test-results/section-break-original-seven-final-visible/report.json`, within
22 physical pages. Retained boundary diagnostics show the old character-index
probe reading the previous carriage return rather than the first body glyph;
the test correction preserves all keep/widow/orphan assertions and uses actual
specimen page positions for wheel screenshots. The earlier failed probe remains
under `section-break-original-seven-final`. This is a test correction, not an
SDK pagination fix or a resolution of the historical Chinese widow specimen.

### Local Base formula-field gallery

`bases/formula-fields` adds six original records and six real calculated fields
across numeric, text/date and empty/error Grid projections. No computed output
is prefilled or calculated by host code. All 36 initial results, real keyboard
source editing/repaint, four literal recipes, full-model themes and disposal
pass in three contexts. `test-results/base-formula-native/timezone-cleanup/report.json`
remains unsuccessful for native Los Angeles date display; it does not hide
March 2 appearing beside Days = 2 for the March 3 serial. Native null-number
display is also disclosed. Three isolated actual-factory failure checks prove
event/unit/editor/owner release, preserved original errors and removable alerts.
Exact nine-file English/CSS export passes. Main reviewed cost/error and timezone
screenshots. Actual Preview StrictMode, recalculation, full-model themes and
fresh remount pass in `test-results/clipboard-formula-previews/timezone-cleanup/report.json`.
No SDK/dependency changes or generic fixture panels are involved.

### Native clipboard variants and actual Preview

`sheets/clipboard-and-paste-special` compares native ordinary, values, formulas,
formats and column widths with four original source rows and visibly distinct
destinations. All five native paths and four literal external-data recipes pass
separately in `test-results/clipboard-native/reviewed/report.json`; overall
26/30 retains strict Undo/Redo style-interning differences on both hosts.
Exact nine-source/English/CSS/Grid export passes at
`test-results/clipboard-export-ui/reviewed/report.json`. Main reviewed the
native cover. No host copy/paste controls or invented APIs are used.
`test-results/clipboard-formula-previews/final/report.json` also verifies its
actual React Preview, StrictMode single owner, real payload paste, complete
edited-model StorageEvent/provider theme preservation, teardown and exact
original fresh remount. Cut, transpose and broader clipboard boundaries remain
unaccepted; the official SpreadJS comparison does not imply full parity.

### Actual sparkline and attachment Preview lifecycle

`test-results/sparkline-attachment-previews/readback/report.json` passes four
case/host runs using the actual Preview sources, development React StrictMode
and next-themes. Each has one editor, a real source/attachment edit, complete
unchanged edited snapshots through both StorageEvent and provider dark/light
updates, retained owner/canvases, clean unmount and a fresh original remount.
The Base remount matches its entire original snapshot. Sparkline remount checks
original source sheets and eighteen objects with three plot types, not old
generated identities. Main reviewed the remounted Base rendering. These are
not Next routing, native history or saved edited-state reconstruction tests.
Initial test-only guesses of two getters failed and are retained under
`initial`; the corrected check uses published `getAllSubSparkline` and record
`getValue`/`setValue`. No production demo or SDK changes were needed, and prior
native Undo/settings failures remain open.

### Native sparkline types with explicit limits

`sheets/sparkline-types` renders eighteen actual source-linked line/column/
win-loss objects across three concise sheets. Native edits repaint all three
types, four literal recipes execute, full-model themes and saved reconstruction
pass in `test-results/sparkline-native/reviewed/report.json` (24/28 gates).
Strict Undo retains a numeric type/style entry; native settings opens an empty
sidebar and is not accepted from its header alone. High-point marker paint is
uncertified, and README makes no visible amber-marker promise. Group config
recipes select their target cell explicitly because the current command path
uses selection. Main reviewed line/win-loss images. Final exact nine-source/
English/CSS evidence is `test-results/sparkline-export-ui/reviewed/report.json`.
Four factory failure checks preserve cleanup and an English alert; no SDK fix,
custom plotting, replacement settings panel or license-notice suppression.

### Native Base attachment packets

`bases/attachment-fields` uses five original local image/text/CSV packets in a
native attachment column, not plain links styled as files. Both hosts pass
seven gates in `test-results/base-attachment-native/readback/report.json`:
four literal recipes, actual image Gallery/Next with original decoded bytes,
native whole-cell Delete preserving other records, text download with exact
bytes/name, complete saved-model themes and pagehide cleanup. Record detail
is opened through the public UI Facade; native opening/deletion are distinct.
Main reviewed the cover. Final exact nine-source/CSS/English evidence is
`test-results/base-attachment-export-ui/readback/report.json`. No uploads,
per-file removal, resource history, durable persistence or SDK changes claimed.

### Bound Slides connectors

`slides/connectors-and-endpoints` shows straight, elbow and one-free-end native
connectors across three simple slides. Both hosts pass actual target dragging
with retained binding and corresponding endpoint displacement, four literal
recipes, reviewed painted routes/arrowheads, actual Preview exact presentation
themes and unmount in `test-results/slides-connectors-native-final/report.json`.
Final nine-source export/CSS/English evidence is
`test-results/slides-connectors-final-export/ui/report.json`. Main reviewed the
cover. Interior route points are distinct from endpoints; the half-pixel limit
of minimum-height horizontal connectors is disclosed, not patched. Native
rebinding and saved-state reconstruction remain separate acceptance work.

### Actual table and sticky Preview lifecycle

The `tables-and-stickies` group in `scripts/test-validation-link-previews.mjs`
passes four runs in `test-results/table-sticky-previews/readback/report.json`.
The actual Previews run under development StrictMode with one editor, real table
value/range and sticky-text edits, and exact complete saved models through both
storage and provider theme changes. Unmount releases the owner and canvases;
fresh remount restores original cells/table membership and Board page/element
identity/sticky text. It does not certify saved-state reconstruction or generated
rich-text paragraph IDs. An initial test used a nonexistent nested getText getter;
the published getPlainText fixes the readback only. Production source is unchanged.

### Native table ranges and Board text specimens

`sheets/table-create-and-resize` provides three small original table comparisons
with native create/range-dialog actions and four literal Facade recipes.
`test-results/table-create-resize-native/referenced/report.json` passes 22/26
checks; strict Undo range restoration and reconstruction resource IDs fail on
both hosts. Native values and paint are checked independently. Seven isolated
factory cleanup checks pass; final exact nine-source/CSS/English evidence is
`test-results/table-create-resize-export-ui/referenced/report.json`.

`boards/text-and-sticky-notes` compares real standalone text and short/multiline/
wide sticky shapes without host cards. Four literal recipes and native standalone
editing pass; Ctrl+A replacement in the multiline sticky retains its first
paragraph and remains a strict failure on both hosts. Actual Preview themes and
unmount preserve full models. Final native evidence is
`test-results/board-text-sticky-native-cleanup-delivery/report.json`, and exact
source/CSS/English evidence is `test-results/board-text-sticky-cleanup-delivery-export/ui/report.json`.
Startup errors retain both original and cleanup causes. Main reviewed both new
gallery covers; no SDK changes, host formatting panels or fake capabilities.

### Demo-owned startup cleanup

The validation-message factory now releases its lifecycle subscription, SDK
owner and root when workbook creation or deferred validation setup throws;
startup and cleanup errors are both retained when necessary. The isolated
real-factory fault check is `scripts/test-validation-startup-cleanup.mjs`.
It stubs dependencies for failure injection, not native capability acceptance.
Final source is rebuilt in `validation-error-messages-exports/guarded`, with
exact source/CSS/English checks in `validation-error-messages-export-ui/guarded`.
Native `validation-error-messages-native/guarded` retains the same 28/30 outcome;
the strict generated-style difference is not changed. The guarded Preview
suite `references-navigation-previews/guarded/report.json` passes all six runs.
The original date-validation/Base-link Preview group also passes all four
post-navigation regression runs.

### Preview lifecycle and source-provider boundaries

The `references-and-navigation` group in `test-validation-link-previews.mjs`
passes six final runs in `test-results/references-navigation-previews/final/report.json`.
It mounts the actual formula-reference, validation-message and PDF-navigation
Previews under development StrictMode, checks one owner, edits real SDK models,
retains exact full snapshots through storage/provider theme changes, and unmounts
and remounts cleanly. Both Sheets galleries accept native typing after themes.
Fresh PDF creation requires new object/patch timestamps while preserving authored
content; it is not snapshot restoration. The initial harness's incorrect fresh
timestamp equality remains recorded separately; same-owner comparisons are exact.

Grove's new `test-results/grove-source-lifecycle/final/report.json` deliberately
fails source unload/restore. Removing the Base Float succeeds, but references
still cause the baseline provider to reload its source after disposal. Recreating
the saved same-ID Base throws. Real formula propagation, three-model theme
preservation, unchanged Sheet and teardown pass separately. The guide describes
this boundary; no SDK/provider change or successful restore recipe is claimed.

### Reference modes, validation feedback and PDF navigation

`sheets/formula-reference-modes` compares relative, absolute and mixed references
using actual formulas and native fill-handle translation. Four literal README
recipes use real `FRange.autoFill` and cell writes. Final native evidence is
`test-results/formula-reference-native-final-anchor/report.json`; both hosts
pass calculation, full-model themes and unmount. Column C visibly shares E5,
not a host-computed mirror. Async calculation is awaited rather than masked.

`sheets/validation-error-messages` compares native STOP, WARNING and generated
messages with four literal rule/status recipes. Native evidence is
`test-results/validation-error-messages-native/reviewed/report.json`: 28/30
pass, including actual paste, tooltip paint, cancellation and valid recovery.
The retained style entry after rejection remains a strict snapshot failure.
Unused prompt fields and ineffective custom dialog titles are not imitated.

`pdfs/page-navigation-and-zoom` compares four real page geometries. Native
thumbnail page-number clicks fit the page; footer jumps preserve zoom, and
native presets change painted dimensions. Three literal FPdf readbacks are
read-only, not invented navigation Facades. The exported runtime service used
for initial fit is documented separately. Final native evidence is
`test-results/pdf-navigation-zoom/final/report.json`; both hosts pass all six
gates. Direct zoom text entry is not certified. All three cases export exact
source with full English packs and official CSS; no SDK changes or host panels.

### Base views and Slides groups: native controls, distinct data behavior

`bases/view-lifecycle` has three native projections of one six-record table.
`test-results/base-view-lifecycle/final/report.json` passes ten interaction
gates per host: view creation/rename/duplicate/confirmed deletion, four literal
recipes, full-model theme retention and a real cell edit painted in both other
views without changing sibling records. Strict projection equality remains
failed for empty filter null becoming undefined; interactionsPassed is not a
global passed flag. The copy recipe uses createView options and explicitly
does not invent a duplicate Facade. Final exact source/English/CSS evidence is
`test-results/base-view-lifecycle-export-ui/final/report.json`.

`slides/grouping-and-stacking` uses three simple slides and the actual Shape
Format ribbon, without duplicate host buttons. The actual Preview native report
`test-results/slides-grouping-native-delivery/report.json` passes group/ungroup,
front/back, four literal recipes on both hosts, edited-model StorageEvent theme
retention and unmount. The right-click object menu was not exposed in separate
attempts and is not advertised as the working route. Final export evidence is
`test-results/slides-grouping-export/ui/report.json`. Native table and element
distribution gaps are not replaced with host-drawn substitutes.

### Conditional visuals: native scales, bars and icons

`sheets/conditional-format-visuals` separates six visual comparisons across
three native sheets: two/three-colour scales, solid/gradient signed data bars,
and icons with/without visible values. Source and README use real conditional
rule builders; no host renderer or prefabricated data-cell fills imitate them.
`test-results/conditional-format-visuals-native/reviewed/report.json` passes
32/34 gates across both hosts, including native edits and pixel boundaries,
four literal recipes and the real native data-bar editor checkbox/Submit.
Only strict Undo's generated style entry remains failed; values/paint and
exact Redo pass separately. Export source/English/CSS evidence is
`test-results/conditional-format-visuals-export-ui/referenced/report.json`.
This follows the official SpreadJS Conditional Rules family split, not a claim
that all its options are implemented or accepted.

### Actual Preview lifecycle: conditional rules and swimlanes

`scripts/test-validation-link-previews.mjs` now also accepts
`SHOWCASE_PREVIEW_GROUP=rules-and-lanes` with the two selected export manifests.
`test-results/rules-swimlanes-previews/final/report.json` passes all four
case/host runs using the actual Preview source, development React StrictMode
and next-themes. It checks one editor, real Facade edits, unchanged complete
saved models and owners across storage/provider themes, unmount and fresh
remount; conditional rules also pass native cell typing after theme changes.
This is not Next routing, native history or snapshot reconstruction acceptance.
Fresh conditional-rule creation generates new IDs, so the remount gate checks
original cells and complete rule/range settings with new identities explicitly;
it does not pretend this is exact snapshot restoration. Initial, edited and
remounted raw models are preserved. Earlier harness-only readiness and fresh-ID
expectation failures remain in separate result directories.

### Swimlane layout gallery

`boards/swimlane-orientation-and-lanes` uses three real containers and nine
native children to compare horizontal, vertical, unequal and collapsed layouts.
The native final report `test-results/swimlane-native/final/report.json` passes
real right-click Expand lane, retained membership, four literal Facade recipes,
changed text paint and exact saved-model/same-owner theme checks on both hosts.
Main reviewed initial and final recipe screenshots. Rename, reorder and resize
are Facade paths, not native menu/drag acceptance. Complete eight-pack English
and eight-sheet official CSS export passes independently; no duplicate host
ribbon or property buttons are added. Cross-lane dragging, removal policies,
reconstruction and actual Preview lifecycle remain separate acceptance work.

### Conditional rule gallery: edits change actual rule paint

`sheets/conditional-format-rules` compares numeric, text, duplicate and relative
formula rules on four compact native sheets. No data-cell fill is authored as
a substitute for conditional formatting. Final selected source/export evidence
is in `test-results/conditional-format-rules-exports/final/selected-export-builds-jiRyap/manifest.json`
and `test-results/conditional-format-rules-export-ui/final/report.json`.
The native reviewed report passes 28/30 checks: actual matching pixels after
edits, native threshold editing, all four literal recipes, Undo values/paint,
exact full-model Redo and theme/save checks. Only strict raw Undo retains a
generated style entry; see `sdk-issues.md`. Date rules, visual rule families
and overlap/priority are still separate work, not claimed complete here.

### Header/footer gallery and Boards transitive assets

`docs-traditional/headers-footers-and-section-links` uses six actual pages and
two sections, without a host toolbar. Final evidence in
`test-results/header-footer-native-delivery/report.json` covers native header
typing and first/even switches, all four literal Facade recipes on both hosts,
actual page/segment paint, edited-model theme retention and unmount. Automatic
page numbering, TOC, native link-checkbox/history and full dark ribbon visual
acceptance remain outside the passing scope.

Four existing Boards factories (alignment-spacing, create-save-and-restore-board,
connector-routing and incident-response) now include their transitive EmbedUnit
English locale and official CSS. Selected builds and exact-source export checks
pass in `test-results/boards-embed-assets-exports/selected-export-builds-tl2agd/manifest.json`
and `test-results/boards-embed-assets-export-ui/report.json`. The focused settled
runtime report `test-results/boards-embed-assets-runtime/settled/report.json`
passes actual English context menus, all three EmbedUnit locale leaves and
complete saved-model preservation. This does not re-accept every prior native
interaction or a formula/resource picker not exposed in those shape menus.
No SDK code, dependency versions or plugin registration was changed.

### Sort gallery: native multiple keys without breaking rows

`sheets/sort-values-and-columns` has three native sheets with eight original
repair bookings. The selected range excludes the header and always contains all
five record fields. README covers actual Keep range sorting confirmation, numeric
directions, two keys, tied rows, explicit third key and blank estimates.

`test-results/sheet-sort-native/host-font/report.json` passes 26/26 across both
hosts, including native ascending/descending/two-key dialogs, exact complete
snapshot Undo/Redo, row integrity, five literal recipes and same-owner saved model
themes. Main reviewed selected dialog radios and the undimmed sorted rows.
Standalone entry sets the host body's font so body-mounted portals inherit Arial;
this does not alter SDK styles or the shared Preview. Exact nine-file build and
English/CSS checks pass in `test-results/sheet-sort-exports/host-font/selected-export-builds-Ilw4Og/manifest.json`
and `test-results/sheet-sort-export-ui/host-font/report.json`. Blank/third-key
paths are Facade-only evidence; full SpreadJS sorting parity is not claimed.

### PDF table themes: container and text styling checked separately

`pdfs/table-themes-and-cell-styles` adds five small, distinct native tables with
plain grid, row bands, header, column emphasis and cell override variants. Main
reviewed the green row-band layout and the final green centered Ready cell.
`test-results/pdf-table-themes-native/readback-final/report.json` passes 20/20
across both hosts: native cell typing, real Properties theme/band changes and
page pixels, four literal recipes and exact complete edited model through themes.
The final recipe verifies both container fill and owned text-story color/alignment.
README explains why `getStyle()` does not return the whole text story; a prior
test expectation to that effect was corrected, not the SDK or its model.

`test-results/pdf-table-themes-exports/readback/selected-export-builds-G6f5m5/manifest.json`
and `test-results/pdf-table-themes-export-ui/readback-final/report.json` pass exact
nine-file export, five full English packs and five official styles. No backend or
network writes. Native history, all style options, actual Preview lifecycle and
binary I/O remain unaccepted. These are structured PDF models, not table images.

### Next source-audited traditional Docs candidate

The installed FDocumentSection declarations expose default/first/even headers
and footers, section-specific switches, effective segment IDs and previous-section
link/unlink operations. A focused headers/footers-and-section-links specimen can
therefore extend the ordinary headers in existing annual/agreement stories.
Native switches, double-click editing, per-page paint and inherited segment
independence still need implementation and runtime evidence. Automatic page-number
field insertion/formatting and generated TOC are not established by the inspected
Facade declarations; do not replace them with literal text or mark blueprint
standalone-docs-traditional-003 complete. SDK remains read-only.

### Actual Preview lifecycle: validation and linked records

`test-results/validation-link-previews/final/report.json` adds current real
Preview coverage for date/number validation and linked records. The harness
bundles the exact source against their final export files with development React
StrictMode and the real next-themes provider. Both browser/host locales pass
single-editor startup, storage-event and provider theme changes with the same
owner and complete edited saved model, actual unmount and fresh remount. The
date validation case also passes native name-box navigation and typing after
themes. All four runs report no runtime errors or network writes. This supersedes
the actual-Preview gap in the earlier entries below, but does not certify Next
page routing, native Base clearing or history, or every failure lifecycle.

### Slides images: real crop geometry and matching recipes

`slides/images-fit-and-crop` uses three native slides to compare proportional
frames, source crop and replacement, with original inline SVG edge markers.
Logical crop offsets are documented rather than mislabeled as percentages;
static specimen labels say Initially so subsequent edits do not contradict them.

`test-results/slides-images-native-labels-final/report.json` passes both hosts:
three actual image/clip variants, native crop handle drag with Undo/Redo, all four
literal README recipes and readbacks, actual Preview StorageEvent themes with
same owner and full edited presentation, unmount and zero runtime errors/network
writes. Replacement is a Facade recipe, not an invented native button.

`test-results/slides-images-labels-final/selected-export-builds-nnm66o/manifest.json`
and `test-results/slides-images-labels-final/export-ui/report.json` pass the exact
eleven-file selected export with required full English packs and official CSS,
including transitive ShapeEditor and EmbedUnit UI assets. Main reviewed the final
directory cover. Masks, alt text, corrupt sources, reconstruction and performance
remain open; no SDK edits or host image renderer.

### Linked record picker: contextual single and multiple targets

`bases/linked-record-picker` uses six equipment requests and five target records
in two native tables. Two Field recorder labels are intentionally identical;
model/storage context distinguishes them in the native picker. No host picker,
action toolbar, lookup or rollup simulation is supplied.

`test-results/base-linked-record-picker/final/report.json` passes 22/26 gates
across both hosts: single replacement, multiple selection/removal, native target
rename with live chip paint and stable IDs, same-owner complete saved Base through
themes and same-ID restoration, all five literal README recipes and no runtime
errors. Focused native Delete leaves the single link in place; the inspected
context menu offers record operations, not Clear content. Both checks stay failed
in each host. README separately documents successful Facade clearing.

The final nine-file selected build is
`test-results/linked-record-picker-exports/final/selected-export-builds-Klf9xx/manifest.json`;
`test-results/linked-record-picker-export-ui/final/report.json` passes exact source,
five full English packs, four official styles and English UI on a Chinese host.
Main reviewed the actual single picker used for the directory cover. Native
Undo/Redo, actual Preview lifecycle, reciprocal links and missing targets remain
unverified. No SDK or dependency modifications.

### Date and number validation: real boundary states

`sheets/date-number-validation` compares whole 1–12, decimal 0–1, strict positive,
inclusive September dates, strictly-before and on-or-after rules in two native
sheets. Six probes per sheet expose limits, fractions and allowed blanks. Plum
and green native headings distinguish the sheets; amber inputs are editable,
with real SDK invalid markers, not a host-created status/error panel.

`test-results/date-number-validation-native/final/report.json` passes 28/28
gates in en-US/UTC and zh-CN/AsiaShanghai browser/host contexts. Checks cover
exact stored values/grouped statuses, seven invalid addresses per sheet, native
red marker pixels, formatted date paint, real keyboard invalid/valid/blank
transitions, all four literal README recipes, actual Integer 1–12 rule panel,
strict full saved model/owner retention through themes and same-ID restoration.
The final nine-file build is
`test-results/date-number-validation-exports/readback/selected-export-builds-5dVGd3/manifest.json`;
exact source/full English Core+Validation packs/both official styles pass in
`test-results/date-number-validation-export-ui/readback/report.json`. Main
reviewed Numbers and Dates and the published native cover.

README clarifies formatted date readback versus stored serials and grouped
cross-rule validation results. The SDK error object's inputValue drops numeric
zero to null; full evidence retains that limitation, with correct addresses and
statuses. No SDK changes or value normalization. This does not certify actual
Preview lifecycle, all rule editors, warning/stop dialogs, clipboard, accessibility
or other browsers.

### Value and condition filters: six native contrasts

`sheets/filter-values-and-conditions` introduces twelve original records with
six independent worksheet filters: value lists, numeric AND, text wildcards,
blanks versus zero, combined columns and no matches. Static descriptions say
"Initially" so user-edited criteria do not turn them into misleading live status.
No duplicate host buttons or JavaScript row-filter implementation is supplied.

`test-results/sheet-filter-native-readme-final/report.json` passes both hosts:
twelve initial exact ID/current-canvas comparisons, eight real popup operations,
two native cell edits, four actual Preview StorageEvent themes with full saved
model/owner preservation, all twelve executions of the six literal README
recipes and both unmounts. No errors or network writes were observed. Native
numeric conditions change to 20–50; a value checkbox selects the literal kit*
record separately from the wildcard pattern. The unaccepted Filter Only hover
shortcut and earlier test-target/paint-history failures remain historical;
ordinary native checkboxes are used without forced clicks.

The selected build
`test-results/sheet-filter-english/selected-export-builds-EVStmb/manifest.json`
and `test-results/sheet-filter-english/export-ui/report.json` pass eleven-file
source parity, official Core/Filter CSS and English UI on a Chinese host. Main
reviewed initial/native numeric sheets and the final exported cover. This does
not certify date/color/OR filtering, all operators, sorting, persistence,
accessibility or performance.

### Final scoped-font exports and stronger feature acceptance

The final Dynamic Array and Checkbox sources add only an Arial/sans-serif font
to their own demo containers, matching the existing number-format gallery.
This fixes native tab/panel fallback typography without overriding SDK component
styles. Both exact exports build in
`test-results/sheets-new-galleries-final/selected-export-builds-vtllpv/manifest.json`;
both nine-file source/CSS/English startup checks pass in that directory's
`export-ui/report.json`. Their catalog covers are current reviewed captures.

`test-results/checkbox-validation-native/scoped-font/report.json` passes 34/34:
the earlier checks plus five distinct toggles, native Delete to allowed blank
and recovery, actual clipboard paste of invalid text and recovery, and the real
validation panel showing Checkbox, Packed/Open and Allow blank. Main reviewed
the panel with corrected typography. This tests permissive invalid paste, not
rejection or every rule editor option.

`test-results/dynamic-array-native/scoped-font/report.json` retains the same
34/36 native result (only inferred-type Undo differences).
`test-results/dynamic-array-preview/final/report.json` separately passes the
actual development React Preview StrictMode lifecycle and both StorageEvent/
theme-provider transitions on both hosts, preserving the exact edited workbook
and owner. Toolbar presence alone initially left ambiguous disabled-looking
controls; a stronger test now performs real B3 pointer selection and non-forced
native Bold, verifying only the intended B3 style changes in the full snapshot.
Main reviewed the resulting usable toolbar. This is selected toolbar evidence,
not every command, Next routing, accessibility or complete cross-browser testing.

### Checkbox validation: numeric and custom text states

`sheets/checkbox-validation` uses two native sheets and six original field-kit
tasks to distinguish default 1/0 from Packed/Open checkbox values. Native cell
formulas show stored values and count completed tasks. Invalid typed input is
allowed and visibly marked, not silently rewritten or falsely called rejected.
The complete English Core/Validation locales and both official preset styles
are shared by Preview and export; the Grid ribbon supplies normal editing.

`test-results/checkbox-validation-exports/selected-export-builds-6H6xWX/manifest.json`
and `test-results/checkbox-validation-export-ui/report.json` pass exact nine-file
build/source/CSS/Chinese-host English startup. Native
`test-results/checkbox-validation-native/final/report.json` passes 26/26 gates:
real checkbox clicks, exact full-model Undo/Redo, invalid text/status, all three
literal recipes, same-owner themes and saved-unit/rule reconstruction. Main
reviewed both native variants and published the initial numeric screenshot as
the catalog cover. Clipboard/paste, complete dialog interaction, actual Preview
lifecycle and broader accessibility are not implied by this selected pass.

### Dynamic array formulas: one anchor, real spilled output

`sheets/dynamic-array-formulas` adds three concise native worksheet specimens:
direct `=A1:B10`, FILTER/SORT/UNIQUE/SEQUENCE, and blocked-output recovery with
spill shrinkage and an explicit-range dependent sum. Nine original delivery
routes include repeated regions and a zero load. The Core preset supplies the
complete English locale, official CSS and Grid; no host arithmetic or extra
controls are involved. The catalog cover is an actual reviewed native capture.

The final selected build is
`test-results/dynamic-array-exports/reviewed/selected-export-builds-j35eXn/manifest.json`.
Exact nine-file source/CSS/Chinese-host English startup passes in
`test-results/dynamic-array-english-export/reviewed/report.json`.
`test-results/dynamic-array-native/reviewed/report.json` passes 34/36 native gates:
all output variants, native edits/deletion/shrinking, all three literal README
recipes, same-ID saved-unit reconstruction and same-owner theme/model retention.
Both strict failures are Undo adding an inferred numeric `t:2` to B3, despite
restoring source/spill values. The failed checks remain failed. Theme evidence
does not certify the settled toolbar or actual Preview StorageEvent lifecycle.
Computed spill readback uses `getValues()`, not stored-cell `getRawValues()`.
Postfix `#` evaluation is unsupported in the installed SDK and disclosed in the
README; it is not implemented or emulated in demo code.

### Remaining owner integrations and hidden Tab children

Lazy-load and isolated-instance demos now keep native UI, authored data and
README English, with the complete required packs and official CSS. Meaningful
load/cancel/release/download controls remain; no fixture panels were added.
`test-results/lazy-editor-english/report.json` passes 8/9 gates, including real
deferred JS/CSS, cancellation, network failure recovery, all nine literal recipes
and owner reconstruction. Initial native Undo still adds C4.t=2. The final
markup-only cleanup preserves emitted HTML, and independent source/CSS/English
startup passes `test-results/lazy-editor-english/final-markup/report.json` against
`test-results/selected-export-builds-Hh2L5X/manifest.json`.

`test-results/isolated-regions-english/final/report.json` passes 35/36 gates:
actual independent iframe owners, exact exported source/CSS, native editing,
five literal recipes, complete saved snapshots, independent themes and actual
Preview StrictMode cleanup. Only South native Undo's added t=2 fails. Main
reviewed the English UI and both differently themed native regions on a Chinese
host. Same-origin iframe isolation is not a security sandbox.

The twenty other-host startup captures are now supplemented by actual hidden
child navigation: `test-results/embed-other-hosts-english/child-tabs-summary.json`
records 19/19 authored children painted and reviewed across eleven cases.
Six reselection checks pass; five Bases hosts fail when the native host canvas
intercepts sidebar clicks after reselecting the active child. No forced click,
API navigation substitute, event suppression or SDK patch was used. Main also
reviewed the actual Base child inside the Copper Slides Tab. Startup, child
paint and repeated navigation are separate acceptance claims.

### English host integrations: real events, lifecycle and CRM inputs

Three existing customization examples now use the full English Core preset,
official SDK stylesheet and Grid on either documentation language. Juniper keeps
only real event subscription/clear-log controls; Kestrel keeps six meaningful
lifecycle/snapshot operations; Northstar keeps Apply/Read host inputs. Original
datasets, calculation graph and saved argument positions are unchanged. The CRM
retains HTML validity checks but reports English bounds instead of the browser's
localized validation message. No SDK/dependency changes or new fixture panels.

Final selected builds in
`test-results/embed-integration-english/final/selected-export-builds-vnEtCw/manifest.json`
and exact source/CSS/Chinese-host English startup in
`test-results/embed-integration-english/final/export-ui/report.json` pass all three.
Main reviewed all three initial screenshots and current native edited views.

Current native reports retain strict failures rather than normalizing snapshots:

- `test-results/univer-events-english-native/report.json`: 8/10 gates, 30 checks.
  Real payloads, unsubscribe/rebind/no-replay, other-owner filtering, nine literal
  examples and three recovery variants pass. Initial and fresh-owner text Undo
  add an inferred type and style; full Redo and same-ID restoration match.
- `test-results/kestrel-lifecycle-english-native/report.json`: 7/8 gates, 37 checks.
  Five TypeScript/four JavaScript literals, native edits, complete checkpoint/
  remount/download, multi-sheet targeting and pending/disposal guards pass.
  The ordinary production entry also passes native edit and complete remount.
  Initial native quantity Undo adds `t:2`; full Redo matches.
- `test-results/crm-quote-english-native/report.json`: 28/29 gates. Fourteen
  literals, two host actions, actual USD/EUR/JPY calculations and canvas paint,
  error/recovery, draft preservation, source isolation and full reload/download
  pass. Chinese-host invalid input gives an English error and preserves data.
  Native quantity Undo adds `t:2`; full Redo matches.

All three current native runs have no observed browser errors or backend writes.
Full English pack, same-owner theme and narrow host-control checks pass within
these runners; they do not certify complete React remount, all native mobile
interactions or SDK-internal failure recovery. Coverage remains partial.

### Twenty other hosts and twenty-three cross-file formula examples

The twenty existing Boards/Bases/Slides host and mixed-workspace factories retain
authored data and native plugin registrations while using complete required
English UI packs. Actual transitive Boards Ink UI CSS is now exported in eleven
cases; Drawing/Sheets Drawing locales are included where needed, without unused
Embed Unit plugin additions. All twenty selected builds and exact source/CSS/
Chinese-host English startup pass in
`test-results/embed-other-hosts-english/selected-export-builds-lyWhcR/manifest.json`
and `test-results/embed-other-hosts-english/export-ui/report.json`. All initial
screenshots were reviewed. Parent/cover startup screenshots do not certify
inactive Tab children; native tab activation is separate acceptance.

Twenty-three existing cross-file formula cases likewise preserve formulas,
data, Grid, plugin registration and saved argument positions, while adding
missing direct/transitive English packs and official shape-editor CSS. Final
combined evidence is `test-results/embed-formula-remainder-english/final-manifest.json`
and `final-report.json` in that directory: 23 builds/startup checks pass with no
observed browser errors. All screenshots and five delayed-chart captures were
reviewed. The five actual charts paint after the bounded wait; the initial
generic captures were premature. Tide's separate source Float remains blank in
the delayed capture. Startup is not formula propagation, dialog, edit/history
or round-trip acceptance, and no SDK fix is claimed.

### Nineteen remaining Sheets entries: preserve platform differences

The nineteen registered Sheets entries now have English factories, authored data
and README instructions. Required full English model/UI packs are preserved or
added, including engine/model, validation, filter, conditional-formatting and
hyperlink dependencies in the manual registration examples. Basic/mobile also
export the official thread-comment UI CSS. Current metadata language claims and
the Find/Replace `Café` literal now agree with the source; Chinese site navigation
translations remain. No dependency versions or SDK files changed.

`test-results/sheets-remaining-english/summary.json` records eighteen browser
builds, seventeen applicable generic source/CSS/English-on-Chinese-host passes,
and the independent Lit Shadow DOM check. The initial generic Lit failure is
retained because that runner does not traverse Shadow DOM; dedicated exact shadow
CSS, dimensions, reconnect/resize/reload and Chinese-host English checks pass.
All eighteen GUI screenshots were reviewed by the assigned agent. The actual Node
entry/factory also produces an English two-sheet saved snapshot; it has no browser
canvas or UI CSS and is not counted as a GUI startup.

Final build manifests are `test-results/selected-export-builds-nsFBaz/manifest.json`,
with basic/mobile overrides in `selected-export-builds-DXnz4D` and Find/Replace in
`selected-export-builds-E4SKzm`. Final generic overrides are the `full-packs-final`
and `find-replace-final` reports under `sheets-remaining-english`. The million-row
capacity and original hundred populated rows remain; mobile and slim classic
layouts remain intentional. Collaboration covers only the frontend local
fallback, and Exchange conversion is not certified. Older bilingual interaction
runners need separate maintenance/reruns; these startup checks do not certify
complete feature, history, theme, print or file-conversion behavior.

### Eight Sheets-host embeddings: English packs and an actual CSS omission

The Float/Tab pairs for Slides, Boards, Docs and Bases in Sheets now stay English
on both host languages, preserving authored stories, argument positions and
native Grid. Existing English packs remain; missing Drawing UI/Sheets Drawing UI
packs were added where required, with Shape Editor/Ink packs for the Boards pair.
An initially added Embed Unit locale was removed after checking that these
factories and their transitive UI consumers do not register that plugin.

The installed Boards UI does register Ink UI transitively, and its JavaScript
does not import the official stylesheet. Both Boards factories were missing
`@univerjs-pro/ink-ui/lib/index.css`: 16 of its 91 rules were absent from their
previous CSS union. The official import is now present in both exports and the
post-fix missing-rule comparison is zero. This addresses real missing pen UI
styles, not SDK behavior. Package/export/dependency evidence is in
`test-results/embed-sheet-hosts-english/css-dependency-audit.json`.

Final eight selected builds and exact source/CSS/English-on-Chinese-host startup
pass in `test-results/embed-sheet-hosts-english/css-final/selected-export-builds-UIKJQl/manifest.json`
and `test-results/embed-sheet-hosts-english/css-final/export-ui/report.json`.
Every final screenshot was reviewed; actual child content paints and trial marks
remain visible. There are no observed browser errors. These checks certify
stylesheet inclusion and startup, not all pen actions or theme/editing paths;
the documented Boards Tab snapshot/theme boundary remains open. Together with
the following three batches, 32 existing demos were migrated this turn, with no
SDK/dependency-version changes and no new routes.

### English Docs-host compositions and eight Sheets feature examples

Ten existing Docs-host compositions now keep native UI English on either host
language: Sheets/Bases/Boards/Slides blocks in modern and traditional Docs, plus
the two mixed Docs-host stories. Their authored English data and distinct stories
are unchanged; all existing English pack lists and official CSS are preserved.
`test-results/selected-export-builds-TxcnRR/manifest.json` and
`test-results/embed-doc-hosts-english/report.json` pass all ten builds and exact
source/CSS/English startup checks. Screenshots were reviewed; later pages,
fullscreen editing and complete native interaction are not certified by startup.

Eight Sheets features likewise keep UI/data English: charts, shapes, images,
hyper-link, notes, outline, list-validation and crosshair-highlighting. Original
variants remain; only language-dependent labels, chart locale/theme names and
note text were translated. Full English packs, official CSS, Grid and saved
argument positions are preserved. `test-results/selected-export-builds-FHXBIG/manifest.json`
and `test-results/sheets-features-english/report.json` pass eight selected builds
and exact source/CSS/Chinese-host English startup. All eight native screenshots
were reviewed. Trial notices and documented SDK failures remain. Six older
native runners still need English expectations/data updates and reruns; no
interaction acceptance is inferred from these startup results. Related metadata
now describes English bundles instead of claiming removed bilingual resources.

### English Sheets customization and local formula examples

Six shared Preview/export factories now stay English: custom-menu, custom-event,
custom-shortcuts, custom-header, custom-formula and cross-workbook-formula.
Complete English core preset packs, official CSS, Grid and snapshot argument
positions are preserved. Custom-menu retains its documented classic creation
variant. Cross-workbook labels and their authored formula references use stable
English names; all six reference/error variants and both transitive expressions
remain. Other original datasets are unchanged. No SDK or dependency changes,
new buttons or fixture panels are included.

The remaining controls have specific scope: menus demonstrate real menu
registration; header controls use header Facade settings absent from the ribbon;
the event button removes/restores a real guard listener; the shortcut Host input
tests focus exclusion; formula controls exercise calculation/cache/registration;
the workbook picker switches owners, not native worksheet tabs. Shortcut
registration uses documented SDK services, not an invented Facade method.

All six selected builds in `test-results/selected-export-builds-foMQLm/manifest.json`
and exact source/CSS/English-on-Chinese-host startup in
`test-results/sheets-customization-english-export/report.json` pass. Main reviewed
native menu, custom header and four-workbook screenshots. Startup does not
certify every event, key binding or header operation after language migration.

`test-results/custom-formula-english-native/report.json` passes the selected
production export's native numeric boundaries, async scalar/spill results,
cache/reload/registration controls, native edits and dependent calculation,
missing/fault/timeout recovery, explicit reload history discard and keyboard
controls at 760/390/320 px. `test-custom-formula-source.mjs` also passes numeric
semantics, source sharing/cache/errors/deadline and cancellation. This standalone
run does not execute the existing conditional React theme/detail-page tests.

`test-results/custom-menu-english-native/report.json` retains strict failures:
full native Undo adds inferred cell types/styles, owner reconstruction changes
the empty defined-name resource, and invalid native menu items remain enabled.
The callbacks correctly reject invalid selections; that is not a disabled UI.
All six literal recipes, actual native actions, release/no-ghost checks and full
English pack/Chinese-host English startup pass scoped checks. Grid and classic
snapshot differences remain unnormalized. The production-export combined gate
fails its exact native history comparison, not source/CSS startup. There are no
observed browser errors or backend requests. No SDK fix is claimed.

The dedicated cross-workbook rerun in
`test-results/cross-workbook-english-native/report.json` passes on both host
languages. It mounts the actual React Preview after matching the final selected
export source. Native Sales B4=180 and Rates B4=2 drive SDK values/paint, including
5340/1560 direct/transitive results; all six reference/error variants remain.
Switching among four workbooks and actual theme events preserve complete edited
snapshots and the same owner, without browser errors or network writes. This
does not certify remote linking, interrupted disposal or all restore boundaries.
The external-function blueprint is now assessed as partial using the custom
formula results above: 137 partial, 133 unassessed and no fully verified
capability. This is an evidence update, not an added route or percentage complete.

### Three native Sheets galleries: English-only current acceptance

Freeze panes, merged-cell layouts and the 20-sample number-format gallery now
keep native UI and data English on either host language. Complete core preset
English packs, official CSS, Grid and every existing geometry/value/pattern
variant remain intact. No duplicate buttons or SDK changes were added. Main
reviewed native English screenshots and registered/refreshed all three covers.

`test-results/sheets-galleries-english-native/freeze/report.json` passes actual
wheel scrolling, unchanged frozen-region pixels and cell data, moving body
pixels and native freeze-menu operations. The sibling `merge/report.json`
passes native merge/input/unmerge/history, four public Facade variants and all
eight gallery ranges. `number-format-final/report.json` passes accounting and
fraction keyboard edits with actual displayed values and unchanged comparison
cells. All three retain complete edited snapshots and the actual Preview owner
through theme changes on both host languages. Number-format additionally waits
for skeleton removal, enabled native controls and fresh canvas paints before
theme screenshots; earlier transient-placeholder captures remain historical.
No browser errors or backend writes were observed. Existing accounting fill
alignment and unverified boundary/lifecycle/accessibility gaps remain open.

After README updates, final three selected builds in
`test-results/selected-export-builds-vI0ywx/manifest.json` and exact source/CSS/
Chinese-host English checks in `test-results/sheets-galleries-english-final-export/report.json`
pass. The current catalog remains 174 routes, including 68 Compose & Embed;
this batch improves existing examples rather than adding routes or declaring
full product coverage. Static source, CSS, ribbon and directory checks are
separate from runtime interaction acceptance.

### English document and PDF exports: scope of current evidence

The 15 migrated modern Docs, seven traditional Docs, five legacy Docs and five
PDF factories now use English independently of host language, retaining complete
English plugin packs, official CSS and existing factory argument positions.
Grid remains the default; the intentionally minimal classic plugin example is
unchanged. No SDK or dependency changes are included. International glyph
specimens and font-family identifiers are data, not translated SDK controls.

Selected build manifests are `docs-modern-english/selected-export-builds-9PO0cK`,
`selected-export-builds-eyrLkf`, `selected-export-builds-DoYmsW` and
`selected-export-builds-pjiH67` under `test-results/`. Exact source/CSS and
Chinese-host English startup pass 15 modern, seven traditional and five PDF
exports in `docs-modern-english/export-ui/report.json`,
`docs-traditional-english/report.json` and `pdfs-english-export/report.json`.
The legacy generic report `legacy-docs-english/report.json` passes four of five:
its document-level canvas query cannot inspect Lit's Shadow DOM. The dedicated
`legacy-docs-english-lit-shadow/report.json` passes native shadow CSS, resizing,
reconnection and reload. Its reviewed Chinese-host screenshot has English UI;
the empty Lit document is not evidence of authored document content.

`pagination-english-export-native/report.json` passes 16 native pages and four
distinct wheel-navigation paints on each host language, retaining the existing
pagination geometry assertions. This English specimen run does not resolve the
historical Chinese specimen's widow-control failure. Native editing and reload
acceptance remain separate. `pdf-viewer-english-native/report.json` passes three
page sizes, native page navigation, five complete English packs and Facade text
editing with full snapshot/owner retention through standalone Facade theme
changes; it does not test native keyboard text editing or the React theme bridge.

`financial-english-native/report.json` passes 24 selected gates: 14 painted
pages, 15 literal recipes, native title/table editing and annotation
drag/Properties/history, five complete English packs, theme ownership and
disposal. This is original fictional content and local JSON, not binary PDF
conversion, printing or fulfillment of the larger 40-page blueprint.
`pdf-image-english-native/report.json` and `pdf-ink-english-native/report.json`
retain strict failures rather than masking them: image removal/its dependent
Undo, drag/model disagreement and missing native crop; ink position changes
selection/model without repainting the stroke. Image Properties/history and
native ink drawing/history pass their scoped checks. Both have English UI on a
Chinese host, complete packs/CSS, owner/theme/disposal checks and no observed
browser errors or backend requests. Other native suites not rerun are not
certified by startup screenshots or by maintaining English test expectations.

### Four data-source-to-document compositions migrated to English

`embed/base-to-modern-doc`, `base-to-traditional-doc`, `sheet-to-modern-doc`
and `sheet-to-traditional-doc` retain their distinct original stories, formulas,
data and plugins while forcing English native startup. Legacy locale argument
positions remain valid and ignored. `test-results/selected-export-builds-cYK6vq/manifest.json`
and `test-results/embed-english-next/report.json` pass all four independent
builds, exact source, official CSS and English startup on a Chinese host with
no browser errors. All four screenshots were reviewed. This does not certify
every formula dialog or resolve the documented error-status/history limitations.

### Modern document columns and responsive width: English native reruns

The current modern document reruns are recorded in
`test-results/docs-modern-english-native/columns/report.json` and
`test-results/docs-modern-english-native/width/report.json`. Columns verifies
native Grid navigation, six groups/counts/ratios and independent Facade text/width
edits against the final selected export. Width verifies the actual React Preview
after export source comparison: 960/600/390/320 px containers paint 12/16/27/37
lines; native 150% zoom changes scale, not logical geometry. Full Facade-edited
snapshots and the same owner survive actual theme events. Both host languages
pass without strict browser errors. Reviewed narrow/high-zoom screenshots can
clip horizontally; these results do not certify fit-width or native text editing.
Initial test-only virtual-entry/getter diagnostics remain separate from current
passing results; no production or SDK source was changed for these reruns.

### English formula compositions and native formula editing

Three existing independent demos now always start with English native UI: `embed/formula-customrange`, `embed/formula-shape` and `embed/cross-unit-formula`. Their original English story datasets, installed plugin registrations, full English dependency packs, official CSS and Grid menus remain intact. No SDK code, dependency versions, host-language metadata, formula calculation logic or fixture panels were changed. The last two pass both selected builds in `test-results/embed-formula-english/selected-export-builds-g8tHFJ/manifest.json` and exact eleven-file/CSS/Chinese-host English startup in `test-results/embed-formula-english/export-ui/report.json`; these startup results do not resolve Harbor's existing blank passive Float, source-keyboard ownership or Print failures.

Estuary passes selected build `test-results/selected-export-builds-1WiHnh/manifest.json` and complete source/CSS startup in `test-results/estuary-english-final-export/report.json`. A reviewed native screenshot is now its catalog cover. `test-results/estuary-english-calculation/report.json` executes all six literal recipes, checks actual Sheet SUM and four native document values, unchanged body, detached display-text projection and active Base fullscreen cleanup, with no console errors/backend requests. Its strict zero-denominator status failure remains: visible #DIV/0! is returned as a successful string result.

The extended `scripts/test-docs-formula-locales.mjs` keeps its legacy bilingual mode for unmigrated cases and adds explicit English-only host-page checks. Estuary's native dialogs have complete Docs Formula UI, Shape Editor UI and Embed Unit UI packs; Edit, number format and Cancel are real SDK controls. Keyboard input and Confirm change the first formula to =1+2, then native editing restores its external formula. International date-format code samples containing quoted year/month/day literals are recorded as format data, not omitted evidence or missing English labels. Selected production success does not erase the separately documented development-shell React unmount warning.

Final `test-results/estuary-english-dialogs-final/report.json` passes against the complete `1WiHnh` export on both host languages, with zero console errors. Per-host formula-bindings files contain all four IDs/formulas/results; the other three remain exactly unchanged after both the native edit and restore, and the first result is success/3 then success/16000. The full source snapshots/owners and cancellation assertions remain intact. This is not a claim about arbitrary formulas, error recovery, accessibility or all embed editors.

### Gantt pointer verification, not configuration-only acceptance

`test-results/base-gantt-native/report.json` now separately exercises actual pointer move, end-resize and left-pane progress. Progress writes 65 to 19.05 while preserving dates/other records/views; main reviewed the 19% left-pane screenshot. The selected timeline bar appears absent/covered, so full post-edit rendering is not accepted. Move changes a seven-day interval to six; an end-resize attempt also changes the start. Both strict failures remain, without claiming an isolated SDK root cause. Existing scale/view/recipe/theme checks still pass independently. Final README/source export `selected-export-builds-J59UDf` / `gantt-pointer-source-export` passes. No SDK modification or host-rendered replacement was made.

### Kanban and Calendar: native variants with explicit SDK limits

The directory now registers 174 routes, including 68 Compose & Embed cases. The two new Bases / Features / Views cases have independent factories, five complete English locale packs, four official CSS imports, Grid configuration and no host control panels. Reviewed native Kanban cover and Calendar Day screenshots are catalog resources. Registration is not full acceptance.

Kanban compares six instrument repairs in compact composed pills, normal labeled cards, native attachment-cover cards and Source Grid. Using normal layout for field labels fixes an authoring mistake; grouping column titles/colors come from the real select option, not a view-local override. `test-results/base-kanban-cards/report.json` passes both host languages for all four views, two native covers, field order, six literal recipes and actual card dragging with isolated Status writeback. Its strict collapse gate remains failing: the config is stored without changing projected lanes. Final selected export `selected-export-builds-5cvZId/manifest.json` and `kanban-final-source-export/report.json` pass exact nine-file source, CSS and startup. Record-detail editing, arbitrary grouping fields and broader lifecycle/accessibility remain open.

Calendar compares seven appointments in Month/Week/Day and Source Grid, including overlapping timed sessions, a multi-day interval and an undated request. The Day default now uses short slots: 52 px/hour rather than 832, showing morning and afternoon together. `test-results/base-calendar-compact/report.json` checks both host languages in Shanghai and UTC, actual canvas clocks, six literal recipes and edited snapshot/owner preservation. Strict weekday alignment and UTC caption failures remain visible. Final selected build `selected-export-builds-JXy75q/manifest.json` and `calendar-compact-export-final/report.json` pass independent source/CSS/English startup. Native editing/dragging and detailed navigation/field/color boundaries remain unverified.

No SDK sources, installed SDK packages or dependency versions were changed. The export UI verifier can use the exact-version Vite target recorded by the build manifest when temporary export junctions are absent; it still compares every exported source file and the exported Vite version before rendering.

Final lint cleanup removes local no-op resolvers, preserves cleanup error causes and avoids shadowed test callback parameters. After these source changes, Kanban `selected-export-builds-rMKic8` / `kanban-lint-final-export` and Calendar `selected-export-builds-HZSMoq` / `calendar-lint-final-export` pass selected builds and exact source/CSS startup again. `kanban-lint-final-native` and `calendar-lint-final-native` reproduce only the same collapse and Calendar label failures above; other scoped gates pass. TypeScript and scoped lint pass. The metadata validator also exposed missing packages/states in the existing Slides shape gallery; these metadata fields are now present without inventing extra controls or changing its runtime. The capability ledger remains 136 partial and 134 unassessed, with no full capability certified by these scoped tests.

### Boards English migration and current native evidence

All six Boards factories now use complete English plugin locale packs independently of the documentation host language. Alignment additionally includes the Shape Editor and Ink UI locale packs and official CSS required by its registered plugins. Existing factory argument positions and snapshot recovery remain intact. No SDK or dependency changes are part of this work.

`test-results/selected-export-builds-6hPuJY/manifest.json` and `test-results/boards-english-export/report.json` pass the six selected independent exports: exact source, settled startup, official white/flex CSS and English initial DOM/canvas on a Chinese host. This is startup coverage, not every native menu or editing path.

`test-results/board-query-english-native/report.json` passes both host languages: six text queries, three type counts, actual viewport focus, native board controls, and edited content plus query state retained on the same underlying owner through themes. This run uses standalone Facade theme changes; it does not certify the documentation React theme bridge or full accessibility.

`test-results/incident-board-english-native/report.json` retains a strict 8/9 result. Native pointer movement/resizing, literal recipes, full owner recovery, English packs/CSS and lifecycle checks pass. Native card-text replacement and complete history still fail; the old first line remains and Undo differs from the complete expected snapshot. This is a disclosed SDK limitation, not permission to modify the SDK. Connector and Tern harnesses now assert English startup/packs, but have not been newly runtime-certified by this migration.

### Remaining Bases factories migrated to English

The nine older Bases factories now force English independently of the host language or legacy locale argument, preserving saved-snapshot argument positions, all five English plugin packs, four official CSS imports and existing Grid/native toolbar configuration. Group/layout data no longer selects translated names. Bracken repair notes and shore-survey boundary text now use English with Unicode punctuation/accents while retaining field types, record IDs, long-text boundary purposes and data variants, not exact original string lengths. Nine READMEs describe current English behavior and distinguish historical bilingual evidence. No SDK, package versions or site-navigation translations changed.

`selected-export-builds-CGROdI/manifest.json` built the nine selected cases. Its source check passed create-base-and-tables, filter-builder and select-options; six others correctly failed exact parity because final formatting and a small helper cleanup landed during the build. Those six were rebuilt in `selected-export-builds-O4Ofja/manifest.json`; `test-results/bases-english-final-export/report.json` passes all six. Together with the three passing entries in `test-results/bases-english-export/report.json`, all nine current independent exports have exact source, settled startup, official white/flex CSS and English initial DOM/canvas on a Chinese host. These checks cover startup, not every menu/record/variant. The three recent Base galleries were already English; all twelve Bases factories are now migrated, not fully accepted products.

`test-results/base-field-layout-english-final-native/report.json` passes both host languages against the final export: four native tabs, exact field visibility/order/config and all eight records unchanged. `test-results/lumen-english-native/report.json` retains strict **29/30**, including all twenty literal recipes, real title/person-picker edits and exact history, complete English packs, same-owner themes, reconstruction/fresh editing, four data variants and cleanup. Its remaining failure is native Person display text `nia, imani` instead of the supplied names; no values, expectations or SDK behavior were rewritten to hide it. Six legacy test scripts now check English packs rather than selecting a removed Chinese SDK locale; Filter/Sort retain Chinese-host startup assertions. Apart from Lumen and the field-layout runner, those maintained suites are not newly runtime-certified here. The older host-panel tests remain historical.

### Gallery native details: keyboard editing, not a Facade substitute

`test-results/base-gallery-native-detail/report.json` passes both EN/ZH host pages against the final `uAVTBg` export, with English native UI. The existing runner observes the painted Oat linen card title, double-clicks that position, inspects the real record-detail drawer and uses keyboard select-all/type/Tab in the Sample note textbox. Exactly that value changes; other fields, records and view settings remain intact. Source Grid and Large cards paint the new note, reopening preserves its exact text, and the same underlying owner/full snapshot survive themes. Main inspected the edited drawer screenshot. Six literal Facade recipes remain separate and pass. No SDK or demo runtime changes were required. Record-detail navigation/deletion, other field editors, uploads, accessibility and save/reload remain outside this scoped acceptance.

### Gantt and Gallery view galleries; Slides English migration

Two independent Base feature demos are registered under Bases / Features / Views. `gantt-timeline-and-working-days` has eight original installation tasks with a quarter overview, working-week view and editable source Grid. Visual review of the initial month view showed most tasks off screen; the default quarter now shows all eight bars and a dedicated Progress column. `gallery-covers-and-card-layout` has six original material samples, five original inline SVG attachment covers, an explicit missing cover, three native card sizes/layouts and a source Grid. Neither adds host controls, explanation cards, cross-demo imports or SDK changes. Both have reviewed native cover images. The catalog is now 172 routes / 68 Compose & Embed.

Final selected build `test-results/selected-export-builds-uAVTBg/manifest.json` and `test-results/base-views-final-export/report.json` pass both nine-file independent exports, official CSS, settled startup and English native startup on a Chinese host. Gantt native evidence in `test-results/base-gantt-native-canvas/report.json` passes native scale/view switching, all five literal recipes and same-owner full-save theme retention. The failed preceding runner looked for a DOM Year button that is actually painted on canvas; the corrected runner clicks its observed canvas coordinates, not a replacement API. Gallery evidence in `test-results/base-gallery-native/report.json` passes all four tabs and six literal recipes; native SVG cover draw widths increase 192/240/296, labels and notes visibly differ by view, and edited data/owner survive themes. Main inspected the quarter and large-card screenshots. Neither suite certifies Gantt dragging/dependencies/holiday calculations or native Gallery record-detail editing.

All twelve Slides factories now stay English, including callers passing the old locale argument. The eleven older factories retain the existing snapshot argument positions and all required English packs/CSS; ten available READMEs distinguish current English behavior from historical bilingual tests. `selected-export-builds-jetIfa` / `rich-slides-english-export` pass the two rich stories; `rich-slides-english-native/report.json` additionally passes English notes Save, fonts, full-save theme retention and cleanup under both host languages. `selected-export-builds-N2yo7S` / `slides-remaining-english-export/report.json` pass the other nine migrated cases, including actual initial DOM/canvas English on a Chinese host. The shape gallery's separate evidence is below. Startup checks are not an all-pages/all-menus language or interaction certification; the rest of the catalog's English migration and older native tests remain pending.

### English-only runtime: first two galleries verified

The new Base galleries were also rerun against their final export manifest after formatting and catalog integration: `test-results/base-gantt-final-native/report.json` and `test-results/base-gallery-final-native/report.json` both pass two English-native host-language runs. These are the current interaction references in the capability ledger; the preceding diagnostic evidence remains retained.

`bases/date-time-formats` and `slides/shape-fill-and-outline` now use complete English plugin locale packs, English data and English alerts regardless of the documentation host language. Neither factory reads or changes `document.documentElement.lang`; no SDK package is changed. Site metadata/navigation translations remain separate. This is the first two-case migration, not an English-only certification of the entire catalog.

Selected build `test-results/selected-export-builds-eLaQnw/manifest.json` passes both cases. The Base export's local dependency links were missing after the build; they were restored only after checking every recorded target and exact package version. `test-results/new-galleries-english-export/report.json` subsequently passes both independent nine-file source comparisons, settled startup and official white/flex CSS. No full build was performed.

`test-results/base-date-english-only/report.json` passes four English-native runs under EN/ZH host languages and Shanghai/UTC: initial canvas text, English native picker, actual day and time submissions, unchanged neighboring fields, all four literal README recipes and same-owner full-save theme retention. `test-results/slides-shapes-english-only/report.json` passes both host languages with English native UI, four-page navigation, seven literal recipes and edited model/owner retention. These scoped checks do not close the remaining feature, accessibility, persistence or full-product acceptance requirements.

### Native date and time submission; expanded Bases product scope

`test-results/base-date-native-time/report.json` passes EN/ZH × Shanghai/UTC with real native date selection (29 to 28 February, time unchanged), native time input plus Enter (09:30 to 10:45, day unchanged), unchanged neighboring fields, four literal README examples and the same edited BaseDataModel through themes. Main inspected the committed native date/time screenshots. No Facade write stands in for either native submission. Runtime factory/data/CSS are unchanged. Earlier diagnostic failures used an attribute from newer SDK source and attempted to reopen the same selected cell directly after Escape; beta.2 tests now use visible day text and another-row selection before returning. The first two failed reports are retained, not interpreted as a SDK fix.

The user's additional requirement for every Base view's distinguishing capabilities, Table and Dashboard is tracked in `bases-product-plan.md`. Installed beta.2 provides Grid, Kanban, Calendar, Gantt and Gallery. Grid is the table-style view; Base tables are separate shared data containers. Gantt and Gallery lack dedicated cases; Kanban and Calendar currently have narrower integrated-story coverage. Dashboard exists in newer local SDK source, not the installed packages, and remains an explicit future requirement without copying or modifying SDK code. A new-record dialog is not a Form view. Counts are unchanged at 170 routes, not full product acceptance.

The README now explains both native submissions and the selected-cell reopening behavior. Final selected build `test-results/selected-export-builds-awVoLS/manifest.json` and exact nine-file/source/CSS verification `test-results/base-date-native-commit-export/report.json` pass after this documentation update. No runtime or SDK changes were needed for the verified submissions.

### Date/time field gallery: verify paint, not only stored serials

Added `bases/date-time-formats` under Bases / Features / Fields: six concise appointments compare four real Date fields, with no demo-only buttons or cards. The standalone factory includes all four official stylesheets and the five applicable EN/ZH locale packages. README has four literal public Facade examples for revealing stored time, changing the display clock, writing a time and clearing to null. The fields begin with equal values but are independent, not falsely linked copies.

Main visual inspection caught a real authoring error in the first export: raw serials painted eight hours later in Shanghai, moving a leap-day sample into March. The factory now uses installed `dateToExcelSerial(new Date(...local components))`; it does not patch the SDK, force UTC or pretend snapshots are timezone-independent. Main inspected the corrected baseline and Chinese native February 2028 date picker. The earlier `base-date-formats-export` report only proves source/CSS/startup; its screenshot is explicitly not accepted date correctness evidence.

Selected build `test-results/selected-export-builds-H6rqaw/manifest.json` and exact nine-file/styles verification `test-results/base-date-formats-final-export/report.json` pass. `test-results/base-date-formats/report.json` runs EN/ZH in both Shanghai and UTC, checking actual initial and changed canvas text, four literal snippets, native picker opening/Escape and complete edited snapshot retention through themes. Native picker submission is still unverified, not inferred from Facade mutation. The matching multi-field blueprint remains partial; checkbox/rating/progress are not claimed. Directory count is 170 with 68 Compose & Embed cases. No SDK changes, dependency upgrades or full demo build.

### Shape-gradient variants without another route or toolbar

`slides/shape-fill-and-outline` now adds a fourth page with linear 0-degree, linear 90-degree and radial gradients using the same two stops. Twelve samples remain simple feature comparisons; the previous three pages are preserved. Two new README snippets call `FShape.setGradientFill()` with different stops and geometry. `test-results/slides-shape-gradients-native/report.json` passes all seven literal snippets in EN/ZH, original four-page navigation, unchanged neighboring gradient/geometry, and complete edited snapshots plus underlying owner through themes. Main inspected both the original gradient page and changed coral/gold and mint/teal output.

Selected build `test-results/selected-export-builds-Nz0Cs8/manifest.json` and exact nine-file/styles verification `test-results/slides-shape-gradients-export/report.json` pass. The catalog cover is refreshed from the reviewed native gradient page. This does not certify all native formatting menus or the still-unverified shadow/radius/style-copy features. No SDK modifications or full demo build.

### SDK boundary and shape-formatting gallery

The user explicitly limits this work to documentation demos: do not modify the SDK. SDK failures remain disclosed limitations, not permission to patch packages and not a blocker for unrelated demo work. Historical coverage requirements that say "fix SDK" are issue tracking, not implementation tasks authorized here.

Added `slides/shape-fill-and-outline` under Slides features / Elements: three simple native pages and nine distinct fill, outline-weight and geometry samples. No host buttons, fixture panel or explanation card. The independent factory follows the local advanced Slides example, uses Grid and includes six official CSS imports and corresponding complete EN/ZH plugin packs. Five README snippets use public shape Facades; none imports another demo.

`test-results/selected-export-builds-5MC4Fp/manifest.json` passes the selected build. `test-results/slides-shape-gallery-export/report.json` passes exact nine-file export parity, settled rendering and official white/flex styles. `test-results/slides-shape-gallery-final/report.json` passes both languages: native three-page navigation, all five literal code blocks, documented model changes and complete edited snapshots plus underlying model identity across themes. Main inspected original fill/geometry and changed fill/rotation screenshots; the catalog cover is an original-state native screenshot. No browser errors or conversion requests were observed. Source, TypeScript, directory, ribbon policy and formatting checks pass; the directory now contains 169 routes, still 68 Compose & Embed entries.

Earlier new-test failures are preserved: a paint write adds optional undefined flip keys; geometry values do not change. `getActivePresentation()` allocates Facade wrappers, so owner checks now compare the underlying model, not wrapper identity. Internal access is test-only. This evidence does not certify every native shape menu, shadow/radius/style-copy behavior, binary conversion or full accessibility. The matching capability stays partial. All pre-existing SDK limitations remain unchanged.

### Vale native fullscreen activation diagnosis

Only Docs-in-Slides Float was independently built (`test-results/selected-export-builds-NNIAsk/manifest.json`). The existing native runner now records descriptor resolution, menu props, DOM events and original fullscreen service calls, and separately exercises keyboard activation after the failing mouse path. `test-results/vale-fullscreen-keyboard-trace/report.json` retains both fullscreen failures: correct IDs and resolved descriptor, mouse down/up but no observed click, and no root service session. Native typing/history/scroll, literal edits, navigation, themes and cleanup still pass without observed errors or backend writes. Main inspected the native decision memo screenshot. The exact interception cause remains unproven; local source/package fallback divergence is documented in `sdk-issues.md`. No runtime, SDK dependency, replacement button or artificial success state was introduced. Final README diagnostic text was added after the selected build; runtime evidence applies to unchanged factory/data, not a new final exported-README parity run.

### Rich annual-report narrative and bounded requirement audit

The traditional Corporate Annual Report now contains ten chapters rather than five short sections. Added native paragraphs distinguish the customer journey, reliability and delivery, capital allocation, governance responsibilities and reporting basis. All original financial figures and the guarded two-paragraph Facade revision remain. The visible subtitle identifies fictional, unaudited content. The SDK root explicitly uses Arial while authored report typography stays Georgia. Metadata reflects the richer narrative, removes two absent external actions and replaces the misleading internal `audited` variant ID with `baseline`. The reviewed native cover updates its existing catalog image.

`test-results/annual-rich-narrative/report.json` passes all nine scoped gates and 26 checks with no snapshot differences, browser errors or observed network writes. The actual renderer produces two A4 pages and five compact pages. All ten compact headings stay with their following paragraph. Literal recipes, native typing/history, native paper/margin edits, full-owner reconstruction, fresh editing after recovery, complete EN/ZH preset packs, same-owner themes and disposal pass. The normal independent export also passes source parity and real input. Main inspected the first page and the second-page narrative. Final README-aligned build `test-results/selected-export-builds-JsBFYB/manifest.json` and `test-results/annual-rich-final-export/report.json` pass ten-file parity and official CSS/startup. This does not certify Office conversion or the complete SDK.

Two read-only agents checked actual user requirements rather than inventing new generic acceptance gates. The bounded feature audit found no proven remaining redundant native-feature panels in its sample. The Compose plan test reports 32 pair/mode routes, six mixed stories and 30 formula routes; this proves declarations, not runtime correctness. Two stale descriptions are corrected: Formula Shape distinguishes successful native Base grid editing from the failing root Base Facade path, and Docs-in-Slides Float points to the existing separate Tab case instead of calling it planned. Existing SDK focus/fullscreen failures remain open; no SDK behavior was patched. Only the annual report was built in this turn.

### CustomRange startup localization and fresh native formula checks

`embed/formula-customrange` now declares pending readiness before attachment, marks asynchronous initialization failures explicitly, and provides an English/Chinese error alert covering both source loading and calculation. Actual exceptions remain visible in diagnostics; disposal still suppresses late callbacks. The existing callback unit test now covers this seventh case in both languages and live/disposed branches. This is not SDK failure injection. The calculation runner waits for explicit success/error instead of treating the pending string `false` as ready.

Only this demo was independently rebuilt: `test-results/selected-export-builds-tlftpq/manifest.json`. `test-results/customrange-current-export/report.json` passes eleven-file parity, completed startup and official white/flex CSS. `test-results/customrange-current-locales/report.json` passes both languages, all three formula-related official packs, the actual Edit formula button, formula/number-format dialogs, desktop bounds and complete-document/same-owner preservation after cancellation, without production console errors. Main inspected the Chinese editor screenshot; no untranslated formula keys appear in the exercised surface. Earlier development-only SDK unmount warnings are not declared fixed.

`test-results/customrange-current-calculation/report.json` reaches all six literal README examples, actual Sheet SUM and four native inline values, unchanged complete document body, successful display-text projection and active Base-fullscreen disposal, with no observed errors or backend requests. Main inspected the native zero-denominator screenshot. Overall calculation acceptance remains **FAIL** because beta.2 still returns `status: success` and string cell type for visible `#DIV/0!`. No results are rewritten or normalized. Recovery/rebinding, unavailable sources, error-state projection and the remaining full acceptance matrix are not certified by these checks.

### Mixed-story metadata matches native-only controls

All six `embed/mixed-in-*` definitions now declare empty external actions instead of eighteen stale operation labels. Their Previews mount only the shared exported native factory; the labels did not correspond to extra host buttons. This is metadata cleanup, not removal of eighteen visible buttons or removal of SDK capabilities. Existing variants, guides, native menus and literal README Facade recipes remain unchanged. No runtime, stylesheet, model, export content or screenshot changes are needed for this correction.

The existing reviewed-catalog test now imports these definitions and checks empty actions plus retained variants and API references. That test, EN/ZH directory tests, source preservation and scoped Showcase TypeScript pass. Catalog regeneration retains 168 routes / 68 Compose & Embed. No demo compilation or new runtime certification is claimed for this metadata-only change; previously recorded SDK failures remain open.

### Four remaining mixed-host covers and current traditional native regression

Selected build `test-results/selected-export-builds-l2xrVt/manifest.json` and `test-results/mixed-other-hosts-export/report.json` pass all four remaining mixed hosts: Slides, Boards, modern Docs and traditional Docs. Each independent export passes eleven-file source parity, completed startup and official white/flex CSS without observed browser errors. This is startup acceptance, not full native interaction acceptance. Main inspected all four native screenshots. Their catalog cards now use these reviewed resources; the traditional card instead shows its actual cost chapter after the documented transcript edit to 30, visibly embedded in the A4 host. Trial notices remain intact. Together with Sheets and Bases, all six mixed hosts now have reviewed card images. No new routes or backend are added.

The traditional runner now explicitly waits for `data-ready="true"` or the error state, rather than treating the pending string `"false"` as ready, bounds default browser waits at 30 seconds, and captures inline chapters as well as native fullscreens. Current `test-results/mixed-traditional-current-native-inline/report.json` reaches all eleven scoped checks: five actual A4 pages; four native resources; all four hearing slides; literal examples changing only their intended models; Sheet keyboard edits and recalculation; one-page Sheet Print preview/cancel; nine-unit host-anchor movement; and active-Board cleanup. Main inspected Sheet, Base, Slides, Board and the inline cost chapter. Browser errors and observed backend requests are empty.

Overall native regression remains **FAIL**, not normalized: the first Sheet Undo changes empty validation serialization from `{}` to `{"resources":[]}`. All other exercised strict history comparisons pass. This is not evidence of complete accessibility, performance, failure recovery, whole-document printing, Office conversion or all-product acceptance. Existing detailed limits remain in each README.

### Mixed workspaces: localized failure states and reviewed catalog covers

All six `embed/mixed-in-*` factories now declare pending readiness before attachment and set an explicit error state when asynchronous resource loading fails. Their existing alerts now have both English and Chinese text specific to each story; the original exception remains in the console and diagnostic dataset. Disposed instances still ignore late rejection callbacks. No new controls, replacement SDK behavior or data changes are introduced.

`scripts/test-mixed-embed-startup-errors.mjs` checks the actual authored callback bodies with minimal DOM/log doubles across six hosts, two languages and live/disposed branches. It also asserts initialization precedes attachment. This is a callback unit test, not fault injection into a running SDK and not full recovery acceptance. TypeScript and source-preservation checks pass.

Only the Sheets and Bases mixed workspaces were independently built in `test-results/selected-export-builds-Snbymc/manifest.json`. `test-results/mixed-workspace-export-current/report.json` passes eleven-file source parity, completed startup and official white/flex native CSS for both. Main inspected the real Harbor budget/Slides Float and Acorn register/four-product Tab screenshots. These reviewed PNGs now appear on their catalog cards, with the native trial notices retained. This startup evidence does not re-certify all child editing, history, print or error paths. Both-locale directory and catalog-image tests pass after regeneration; the catalog remains 168 routes / 68 Compose & Embed. No full build was performed.

### Traditional story export contracts and fictional benchmark labeling

Research Paper and Services Agreement no longer list four external actions that are not mounted controls. Native editing and the README Facade recipes remain unchanged. Both export roots now specify Arial for the SDK interface while preserving the authored Times New Roman document typography. Selected build `test-results/selected-export-builds-zESusc/manifest.json` and `test-results/traditional-stories-export-fonts/report.json` pass exact source parity, completed startup, official white/flex CSS and computed interface fonts for both cases. This is not a new full interaction or pagination-matrix certification.

Visual review exposed another content issue: the research sample's precise timings and fictional citations could be mistaken for real Univer performance claims. Its native abstract now explicitly labels authors, references and measurements as fictional typesetting content, not Univer benchmark results. The illustrative numbers and story remain. Final paper-only build `test-results/selected-export-builds-Oan61S/manifest.json` and `test-results/research-paper-fiction-label/report.json` pass; main inspected the visible first-page label. Previous full interaction/recovery evidence predates this abstract change and is not represented as a fresh full pass. Catalog regeneration, both-locale directory and source-preservation checks pass; no full demo build was performed.

### Rich product stories: content, Preview retention and honest native boundaries

`docs-modern/incident-postmortem` retains every original incident fact and its A-04 Facade recipe, adding four native document sections: containment decisions, customer communication, release validation and uncertainty. These distinguish sampled observations from decisions and explicitly say editing A-04 does not deploy a monitor. Original burgundy incident headings and teal follow-up headings separate the review visually; there is no external explanation/fixture panel. Metadata now says A-04 completed, not all follow-ups completed, and no longer advertises two absent host buttons. The reviewed final independent screenshot updates the catalog card.

`postmortem-follow-up-native/report.json` passes 12 scoped gates, including literal recipes/current paint, native title input, complete Undo/Redo, native end-of-document review navigation, same-owner full-save themes, initial Chinese UI and cleanup, with no errors or backend writes. `postmortem-follow-up-recovery/report.json` passes all four full-owner reconstruction/invalid-input/early-disposal gates. These are under `test-results/`; neither suite is full product acceptance. Final source-aligned export `selected-export-builds-YdBVD4/manifest.json` and `postmortem-follow-up-export-final/report.json` pass after README evidence updates.

Postmortem, Product Brief and Company Knowledge Base now set Arial on their own roots; standalone native controls no longer depend on the website's font inheritance. The latter two retain their original stories and native/navigation controls. Selected build `selected-export-builds-1qgKHb` and `modern-stories-export-fonts/report.json` verify all three independent fonts/official CSS/startup; the postmortem's final README-only rebuild is listed above. New runnable `scripts/test-modern-story-previews.mjs` mounts the actual React Previews under the theme provider. `modern-story-previews/report.json` passes all six story/language runs: real keyboard input preserving original text, complete edited snapshots through site-theme storage events on the same owner, and unmount cleanup. Knowledge Base additionally edits and revisits all three pages after each theme transition. No errors or network writes occur. This exercises Preview components, not the whole Next routing surface.

Atlas Product Launch (11 slides) and Northstar Quarterly Business Review (8 slides) retain distinct stories and five complete EN/ZH locale/CSS packs, with Grid and native notes. Their metadata drops 15 already-removed external button declarations; both roots now export Arial. Selected build `selected-export-builds-7I8JHq` and `rich-slides-current-export-ui/report.json` pass source/CSS/startup checks. The reusable `scripts/test-rich-slides-export-native.mjs` covers EN/ZH native notes Save, font, same-owner complete-deck theme retention and actual pagehide cleanup. Earlier Atlas raw-history/image and Northstar notes-focus Undo failures remain, and factory theme calls are not React Preview integration proof.

The Base content pipeline and Board incident response already have differentiated native stories, so their runtime/data are unchanged. Current `content-pipeline-rich-recheck/report.json` retains 9/12 passing gates: three failures are cross-view status Undo, a wrong native calendar weekday header, and August Next skipping September. `incident-response-rich-recheck/report.json` retains 8/9 passing gates: multiline replacement leaves the old first line and a single Undo differs in 46 snapshot fields. Both pass their literal Facade recipes, substantive native edits, full owner recovery and scoped locale/CSS/theme checks without browser errors or uploads. These failures are not normalized away. Their READMEs replace stale Vite paths to another demo with an explicit installed-Vite placeholder; runners accept an optional isolated port.

The catalog remains 168 entries / 68 Compose & Embed after regeneration; EN/ZH directory and source checks pass. `rich-stories-style-isolation/report.json` passes all 168 exported stylesheet boundary probes. Only selected cases were built. Approximately 34 GB remained free, so no user files were deleted.

Final Slides rerun `test-results/rich-slides-export-native-final/report.json` passes all four demo/language combinations after adding exact exported-source parity, console-error checks and completed theme-frame waits to the reusable runner. No source or SDK behavior is altered by the test.

### Host CSS boundaries and completed startup screenshots

The current export-style audit initially stopped on stale fixture-panel assumptions. Its probes now match the actual single selectors in protection shadows, cross-workbook navigation and responsive Docs, the Board query form, and slim factories that add a class to their supplied container. Missing host styling is collected as a failure alongside SDK collisions, rather than aborting before the remaining cases are inspected. No assertion is waived. The retained `test-results/showcase-style-boundaries-baseline/report.json` exposes native-control collisions in Board query and responsive Docs.

Host CSS is narrowed in three actual demos: Board query fieldsets/selects now stay within the direct host form, responsive Docs dark selects stay within the host width label, and protection-shadow dark options stay within the host strategy selector. Native SDK styles are untouched. `test-results/showcase-style-boundaries-fixed/report.json` passes all 168 exported stylesheets against nested form/readout/table probes in both theme-selector states, including focus and conditional selectors. This is a CSS boundary test, not complete runtime acceptance of 168 demos.

Only those three demos were independently rebuilt (`test-results/selected-export-builds-wTxaAP/manifest.json`, exact-version local dependency junctions). Initial UI checks passed but visual inspection showed responsive Docs captured before its text had appeared. The shared selected-export runner now waits for the exposed SDK lifecycle to reach Steady and bounds browser waits at 30 seconds. Final `test-results/style-boundaries-export-steady/report.json` passes source parity, official white/flex SDK styling and startup for all three; protection also passes native input. Main inspected the Board canvas and the final responsive document PNG, which now visibly contains the complete short text specimen. Native license notices remain. This is not a new full resize/query/permission interaction certification. No full Showcase build was performed.

Read-only installed-package review confirms both formula cases already have complete relevant EN/ZH strings. CustomRange has DocsFormula (6 leaves), ShapeEditor (663) and EmbedUnit (3); Formula Shape has ShapeEditor and EmbedUnit, with EmbedUnit supplied by the advanced preset. Advanced CSS contains the installed EmbedUnit stylesheet; explicit duplicate imports are unnecessary. The existing `docs-formula-locales-estuary-regression/report.json` remains historical native editor proof, not a fresh runtime run in this review.

### Actual print output and frontend Exchange boundary recheck

`scripts/test-sheets-print-output.mjs` now exercises native Print → NEXT on the actual selected production export, not only settings/cancel. It suppresses the OS print call while preserving the SDK's `beforeprint` renderer, captures the real printing canvases and print-media DOM, and dispatches `afterprint` to check cleanup and complete workbook preservation. EN/ZH default output contains two 794 by 1124 A4 portrait pages. Native Fit to width produces one page containing all eleven columns. Main and agent inspected the actual PNGs; canvas text-call logs alone are not visible-content proof. `test-results/sheets-print-output-fit-width/report.json` passes. The final rerun `sheets-print-output-fit-width-final/report.json` retains a null `clientWidth` browser error as overall FAIL despite passing page assertions. It is not filtered or called fixed. No physical print job, PDF driver or service upload is certified. Existing broken synchronous `openPrintDialog()` and strict history/reconstruction boundaries remain separate.

Read-only comparison of installed beta.2 shared/Sheets/Slides Exchange and local advanced/local examples confirms the distinction documented in `frontend-io.md`: frontend picker/menu registration does not imply offline conversion. Snapshot output still uploads, creates a conversion task, polls and downloads JSON; only model/protocol encoding and Blob download are local helpers. Sheets advanced explicitly supplies service URLs, Sheets local does not register Exchange, and traditional-local/Slides advanced use clients with shared HTTP dependencies. Docs Exchange is not installed in documentation, so its conclusion is source-level only. No uploaded files or authorized external service were used. The Exchange ledger now references the current native report, retaining Office conversion and full Undo differences, rather than the retired service-double implementation.

The copied print-plan reviewer/revision fixture was unrelated to print and contradicted the user's exclusion of collaborative history; it is replaced by a print-focused financial report fixture, without removing pagination, repeated-header, scope, orientation or scale requirements. The comment-thread fixture also no longer requests saved revisions. Big-data ledger references now reflect the actual bounded native test and removed timing/download controls.

The Compose host/mode audit found routes for all inspected supported cross-product pairs: Sheets/Slides Float and Tab, Bases Tab, Boards Float, and modern/traditional Docs blocks. Installed beta.2 additionally advertises Sheet-in-Sheet Float, already used by cross-unit-formula. This is route/capability coverage, not runtime acceptance. The suspected raw metadata category/group inconsistencies are not navigation bugs: `directoryPlacement()` already maps multi-output stories to Showcases and formula cases to host groups. No speculative directory changes or unsupported mode placeholders were added.

One bounded print phase/stack diagnostic passes in `sheets-print-output-phase-diagnostic/report.json` without reproducing the intermittent error. The runner now records locale, lifecycle phase and stack. Installed UI `useVirtualList` has an unguarded ResizeObserver `containerTarget.current.clientWidth` read and the print view uses that hook, but the original failure had no stack: this is a candidate, not a confirmed cause. No SDK patch, swallowed exception or arbitrary sleep is added. The print README now uses an explicit installed-Vite placeholder instead of another demo's temporary directory and distinguishes repository acceptance scripts from ordinary standalone npm installation.

After the README-only clarification, the final selected print export builds successfully in `test-results/selected-export-builds-2erarP/manifest.json`. `test-results/sheets-print-output-export-final/report.json` passes nine-file source parity, official white SDK styling and native canvas startup without browser errors. This last check is startup/source validation, not another full print-flow run; it does not supersede the retained intermittent print failure. No full Showcase build was performed.

### Merge gallery, accounting/fractions and measurable native freeze coverage

New `sheets/merge-cells` is registered under Sheets Features / Cell layout. Its small bilingual gallery compares horizontal, row-by-row, column-by-column and rectangular merges; a separate practice tab uses native Grid controls. No duplicate toolbar or fixture panel is introduced. `test-results/merge-cells-native-final/report.json` passes EN/ZH exact eight initial merge geometries, actual native painted text, native Merge all, merged-label typing, native Cancel merge with exact full-snapshot Undo/Redo, and live `merge`, `mergeAcross`, `mergeVertically`, `breakApart` calls on an isolated block. Gallery data and full edited workbook/owner survive theme changes and clean teardown. Populated-range conflict dialogs, invalid/forced overlapping ranges, reload and full accessibility remain unverified. The reviewed independent screenshot backs its catalog card. Final selected build is `selected-export-builds-cYSPe8`; the initial ten-file source/CSS/render check passes in `merge-cells-export-ui`. The coverage ledger stays partial.

`sheets/number-format-gallery` expands from fourteen to twenty comparisons without removing the originals: accounting positive/negative/zero and mixed, fixed-denominator and approximate fractions. `number-format-gallery-expanded-verified/report.json` passes EN/ZH real native edits, painted output, raw-value distinction and full snapshot/owner/theme retention. `number-format-gallery-export-ui/report.json` passes the selected eight-file export. Standard accounting section patterns display amounts correctly, but the installed renderer does not expand `*` currency-symbol padding; the cell note, metadata and README state this limitation. No custom formatter masks it.

`freeze-native-final/report.json` adds stronger EN/ZH runtime proof for all three freeze fixtures: actual wheel scrolling changes the body pixels and scroll state while pinned-region PNG bytes remain identical and cell data stay unchanged. Native View-menu cancellation, first-visible row/column and selection freezes, edited full-save/theme retention and teardown pass. Menu reopen tests now wait for actual finite exit animations; no runtime workaround was added. The installed native first-row/column command uses the first visible row/column after scrolling: `startRow/startColumn` are boundaries, while `ySplit/xSplit` count frozen dimensions. Earlier selector/semantic failures remain separately. `freeze-native-export-ui/report.json` passes the final selected ten-file export (`selected-export-builds-Edg2nt`).

`sheets/big-data` keeps meaningful capacity, chunk generation, row/window selection and jump-only controls. The redundant JSON download host button and arbitrary elapsed-time status are removed; the optional public snapshot-download recipe remains in README. `big-data-preview-bounded/report.json` passes EN/ZH on a bounded 10K-capacity sample with 100 initial and 250 loaded middle rows, native D2 input, jump-without-model-mutation, full saved workbook/owner through themes and teardown. `big-data-export-final/report.json` passes ten-file parity and actual official CSS/grid rendering (`selected-export-builds-hkUGbt`). No maximum-size benchmark or resolution of existing strict Undo snapshot gaps is claimed.

The selected Next preview on port 4336 now compiles only these four cases; `showcase-screenshots-gxOu1S/report.json` passes their real page captures. The full catalog has 168 entries, including 68 Compose & Embed cases. `showcase-directory-merge/report.json` passes EN/ZH all 168 sidebar routes, 27 formula routes, empty folders and responsive filter checks with the actual merge Preview. A subsequent attempt to infer unprefixed English sidebar links from next-intl routing was wrong; `showcase-directory-merge-prefix/report.json` preserves that failed check. The sidebar's observed explicit locale hrefs are retained in the test, now with a bounded default timeout and selectable demo.

Final follow-up gates for the four-case batch above: `merge-cells-export-final/report.json` confirms the final ten-file source/CSS export; `showcase-directory-merge-final/report.json` passes the bounded EN/ZH full-directory browser test. Selected TypeScript, lint, source preservation, blueprint/coverage schema and whitespace checks pass. Only the selected 4336 server remains running; temporary isolated test servers are closed. This is not a full production build or full-capability certification.

### Baseline initialization, Shadow DOM, mobile and local collaboration follow-up

The Sheets basic Plugin/Preset pair, Sheets and Docs slim Plugin/Preset pairs, Docs Lit/watermark, Sheets Lit/hidden-headers, mobile, Luckysheet migration and default local collaboration previews now retain their existing owner through site theme changes. Factories include official CSS/locales and scoped container fonts; exported entry points and file maps match the actual implementation. The intentionally minimal Plugin examples retain classic ribbons; the desktop baseline cases use Grid. Existing feature datasets and the migration converter are preserved, without adding parallel host toolbars.

Runtime evidence: `sheets-basic-previews-history/report.json` passes four EN/ZH cases with native numeric input, a computed formula, exact full saved workbook/owner retention across themes, native Undo/Redo after theme changes, localized Find and teardown. `sheets-slim-previews/report.json`, `docs-slim-plugin-native-final/report.json`, `docs-slim-preset-native-final/report.json`, `docs-native-theme-lit/report.json` and `docs-native-theme-watermark/report.json` cover their respective native edits and full save/owner retention. Paths in this section are under `test-results/`; these checks do not certify every ribbon command.

`sheets-mobile-migration-final/report.json` passes four EN/ZH cases, preserving the eight-sheet mobile and eleven-sheet migrated workbooks. Mobile was exercised with mouse pointer and browser keyboard at 390px, not physical touch hardware. `sheets-native-theme-hide-headers-final/report.json` passes actual hidden headers, native input/formula, full saved workbook/theme retention and teardown. `sheets-native-theme-lit-final/report.json` passes native double-click input and pointer commit, formula calculation, full save/owner retention and teardown, but explicitly records `enterCommit: false`: the installed SDK retargets keyboard events to the Shadow DOM host, outside the inner editor container. Single-key editing and Enter commit are not certified. The exported README preserves this limitation; no SDK patch or synthetic cell writes hide it.

`sheets-collaboration-previews-network/report.json` passes EN/ZH real local cell input, full workbook/theme retention and teardown with no network writes, Universer requests or application WebSockets. Only the exact local Vite HMR socket is excluded. The default remains frontend-only; explicit unit URLs still require the user's configured backend and authenticated session. Remote synchronization was not invoked or certified. The first runner selected B50 outside this fixture's twenty rows; its failed report is retained separately. The corrected test edits valid B15.

Selected independent builds pass for Sheets basic (`selected-export-builds-PobLEM`), Docs Lit/watermark (`selected-export-builds-dXYAE8`), Sheets Lit/hidden-headers (`selected-export-builds-pwb0O9`) and collaboration (`selected-export-builds-9WNa0z`). Their browser source/CSS checks pass in `sheets-basic-export-ui`, `docs-watermark-export-ui`, `sheets-hide-headers-export-ui` and `sheets-collaboration-export-ui`. Both Lit exports additionally pass exact bundled Shadow DOM CSS, reconnect, narrow resize and reload checks in `docs-lit-export-reconnect` and `sheets-lit-export-reconnect`. These builds use exact-version local dependency junctions, not a clean network install. Missing authored `styles.css` alone did not prove old exports were broken: the exporter already synthesized a fallback stylesheet; explicit per-case files improve sizing/font parity and isolation.

Six further selected builds (`selected-export-builds-7fAHtf`) exposed three genuine standalone sizing regressions even though their Preview tests passed: migration and both Sheets slim examples lacked document/body/app height after their factory CSS was scoped. The failing `baseline-six-export-ui/report.json` remains; mobile and both Docs slim exports pass in that report. Explicit standalone entry sizing fixes the Sheets slim pair; final build `selected-export-builds-LacFID` and `sheets-slim-export-sized/report.json` both pass. This is why Preview-only validation is insufficient.

The fourteenth follow-up case, `docs/big-data`, retains the complete 1,104,019-character fixture. Its cloned creation snapshot enables editing and supplies stable section identities required by the current SDK; the original data file is unchanged. `docs-big-native-bounded/report.json` passes EN/ZH one native input event, exact preservation of the original text after removing the typed marker, complete edited save/owner retention across themes and clean teardown with no errors/network writes. Earlier disabled-input and missing-section failures remain. Crucially, key-by-key input was still unfinished after approximately four minutes (`docs-big-native-section-identity`); the single-input pass does not certify normal typing responsiveness or overall performance. Development navigation-to-Steady observations are not benchmarks. The selected independent build `selected-export-builds-sRQKFA` passes.

Migration's standalone entry sizing is also corrected; final build `selected-export-builds-DLAzcA` and `migration-export-height-fixed/report.json` pass all 54 source files and a 1440 by 811 native grid inside a 1440 by 1000 workbench without browser errors. `docs-big-export-ui/report.json` passes the large document's nine-file source parity and official white/flex native UI. These are startup/render checks, not performance or complete feature acceptance.

The mobile standalone entry now supplies explicit viewport height as well. Its final nine-file build/source/UI check passes in `selected-export-builds-jL2vqk` and `mobile-export-height-final/report.json`; the shell remains 390px wide. Final selected TypeScript, source preservation and both-locale 167-route directory checks pass. No full Showcase build was performed.

### Slides native galleries and frontend conversion correction

`slides/layouts-and-placeholders`, `text-editing-and-autofit` and `theme-and-background` now keep their existing Preview owner on site theme changes; previously their theme effects recreated the deck. Each also declares initial readiness before attachment and its own Arial/sans-serif root font. Their native visual galleries remain, without replacement host toolbars.

`test-results/slides-layouts-native-editor-ready/report.json` passes EN/ZH: all eight native thumbnails paint their page titles and inherited master footer, seven layout identities are present, actual keyboard edits to a slide-owned placeholder commit, and the complete edited deck plus owner survive dark/light changes and clean unmount. The first two harnesses incorrectly required new `fillText` calls when returning to a cached slide; another typed before the async native editor was ready. Those failed reports remain separately. The final harness waits for visible native text-editor content and commits through native pointer/thumbnail navigation. The package layout test now targets this native gallery rather than the obsolete fixture/Inspect panel suite; it requires an explicit `SHOWCASE_VITE_MODULE`. The old suite remains historical, not proof of removed controls. Selected independent build `selected-export-builds-A0hWpM/manifest.json` and eight-file source/CSS/font checks in `slides-layouts-export-native/report.json` pass. The reviewed initial screenshot now backs the layout catalog card.

`test-results/slides-text-native-gallery-committed/report.json` passes EN/ZH native committed text input, the three distinct emphasis/list/alignment pages, full edited save and owner retention through themes, and clean unmount. `slides-text-native-autofit-steady/report.json` still strictly fails: noAutoFit, normAutoFit and spAutoFit render the tested long text at the same 37.3333px and retain a 250 by 80 box; a smaller-font control works. This is not hidden by the simplified gallery, and no fake text scaling or SDK patch was introduced. The text export was not rebuilt in this follow-up.

Actual native Save As in `slides/theme-and-background` contradicted its frontend-only conversion claim: `test-results/slides-theme-files/report.json` records `/universer-api/stream/file/upload` POST requests, 404 responses and no download. The installed Exchange client is a client of a conversion service, not a browser-only converter. HTTP-backed Exchange registrations, unused imports/locales/CSS and package metadata are removed from both this case and the other affected `slides/slide-lifecycle` case; the native Print plugin remains. No replacement JSON-as-PPTX export is offered. Their guides now disclose that binary conversion requires a service. This removes a broken action but does not fulfill standalone frontend PPTX import/export.

After removal, `slides-theme-frontend-only/report.json` passes EN/ZH absent conversion entry, zero network writes and native eight-page Print settings. `slides-theme-owner-final/report.json` passes real notes edits, full saves and owner/theme retention; `slides-theme-native-export-final/report.json` passes the existing eight-page/twelve-theme/four-background and history/narrow-layout checks against the final selected export (`selected-export-builds-iC5qEL/manifest.json`). These Print checks open/cancel settings, not final printed-page fidelity. `slides-lifecycle-frontend-en/report.json` and `slides-lifecycle-frontend-zh/report.json` pass native copy/paste, copy editing, deletion/history, blank insertion, Print settings and cleanup without backend requests. Existing stricter lifecycle/history failures are not waived.

`bases/text-number-currency` retains its native-only gallery. It now declares initial readiness, exports its root font and localizes startup errors; its guide no longer claims changing language routes preserves an owner. `test-results/bases-number-preview-first-row/report.json` passes EN/ZH real number/currency keyboard edits, three independently painted formatting variants without changing record values, preservation of other tables, complete edited save/owner retention through themes, and clean unmount. Existing Base null/formatting defects remain documented; the initial repeated-value locator failure is retained. This does not certify all field types or rebuild the Base independent export.

### Remaining early Compose previews: native input and serialized theme boundaries

The Base and Docs Float/Tab previews hosted in Sheets now explicitly export their local sans-serif root styling and bilingual startup alerts; both Board-in-Sheets roots receive the same correction. Board/Slides DocBlock startup alerts are localized too. SDK CSS imports and native menus remain intact; no new host controls or SDK patches are introduced.

`test-results/embed-sheet-base-themes-final/report.json` passes four EN/ZH Float/Tab runs with actual native host cell input, dependent totals, native Base text editing, complete edited host/child snapshot retention through Preview storage-event theme updates, stable API ownership and active-child React unmount. Docs-in-Sheets passes both languages in `embed-docsheet-theme-float-final/report.json` and `embed-docsheet-theme-tab-verified/report.json`: the child is edited using real keyboard input, the host is independently changed through its Facade, and both edited saves and the owner survive dark/light changes and clean unmount. These tests do not certify every native tool, fullscreen route, error path or history operation.

Slides-in-Docs passes both languages in `test-results/embed-slide-docblock-theme-rendered/report.json`, including actual embed activation, visibly rendered Facade text changes, separate host narrative edits, full saves and clean unmount. Child shape-editor focus is explicitly exited before programmatic text edits so the screenshot reflects the current model, not an active editing buffer.

The strict Board theme results remain mixed. `test-results/embed-sheet-board-themes-diagnostic/report.json` passes Board-in-Sheets Float EN/ZH, including native canvas dragging after themes and clean unmount. Its Tab cases preserve the owner, host and all child content outside the serialized `theme` field, support native dragging after both themes, and cleanly unmount, but still fail the full-snapshot assertion. `test-results/embed-board-docblock-theme-complete/report.json` likewise retains EN/ZH full-snapshot failures with clean cleanup and no browser errors. The corresponding local SDK source's `BoardThemeFollowUniverController` subscribes to UI theme/dark-mode changes and `BoardSettingsService.syncFollowUniverTheme` executes `SetBoardThemeOperation`, updating color/format schemes. This is evidence of native theme serialization, not evidence of content loss or Preview owner replacement; it is not labeled an exact-save roundtrip pass. No snapshot-restoration workaround is applied. The earlier Tab test's missing Grid toolbar was an initial active-child-tab assumption; it now selects the real host sheet first, and the original failed report is retained.

The selected Board-in-Sheets exports build in `test-results/selected-export-builds-2RajQn/manifest.json` and pass eleven-file source/CSS/font/startup checks in `embed-sheet-board-exports/report.json`. Both reviewed independent screenshots now back their catalog cards. The selected Base-in-Sheets exports build in `embed-bases-sheet-exports/selected-export-builds-dT0eSj/manifest.json` and pass the equivalent checks in `embed-bases-sheet-export-ui-font/report.json`. These exact-version local-junction builds are not clean installs; large-bundle warnings remain, so no broad performance acceptance is claimed.

The remaining Sheet children also pass EN/ZH in `test-results/embed-sheet-child-themes-visible/report.json`: native cell input and dependent totals in Docs DocBlock and Slides Float, independent host Facade narrative edits, complete edited snapshots and owner retention through both themes, and clean active-child unmount. Initial hidden zero-size editor-canvas selector failures remain separately; the test now targets the visible native canvas. This does not fix or waive the previously documented Tamar fullscreen defect. Across the thirteen early previews, eleven now pass these selected theme/edit paths and two retain the Board serialized-theme strict failures; this is not catalog-wide feature completion.

After the Board README follow-up, the final selected rebuild is `test-results/selected-export-builds-RMlLM2/manifest.json`, with eleven-file parity/CSS/font checks passing in `embed-sheet-board-exports-final/report.json`. Docs-in-Sheets similarly passes its final selected builds (`selected-export-builds-7KBUES/manifest.json`) and `embed-docsheet-export-font-verified/report.json`. The selected Next Board Float/Tab playground captures pass in `showcase-screenshots-rq05R4/report.json`; only these two demos are compiled on port 4336. TypeScript, thirteen preview source contracts, the 73-case Embed locale-pack audit and 167-route directory/ribbon source checks pass. They do not replace the explicit retained runtime failures above.

### Compose preview ownership, native interaction and export appearance

Thirteen early Embed previews now update the existing owner through `toggleDarkMode` instead of recreating the SDK on theme changes. Each factory publishes an explicit initial readiness state before attaching its root; legacy browser checks now require successful readiness rather than treating the string `false` as truthy. `scripts/test-embed-preview-theme-contract.mjs` passes all thirteen source contracts. This is not thirteen-case runtime certification.

`test-results/embed-sheet-slide-themes-final/report.json` passes Float and Tab Slides hosted in Sheets in both locales: native host cell edits and dependent formulas, actual embed navigation, separately identified Facade child text edits, and full host/child snapshot retention through dark/light changes. Owner and root identity remain stable. Tab thumbnail canvases may be replaced by the SDK; tests require visible native rendering and preserved data, not identity of every internal canvas. Earlier overly strict canvas and initial-tab assumptions remain in their failed reports.

Only these two selected exports were rebuilt in `test-results/selected-export-builds-ATP32Z/manifest.json`. `test-results/embed-sheet-slide-theme-exports-font/report.json` passes source parity, official white native CSS, startup completion and explicit local Arial inheritance for both. These are local-junction builds, not clean package installs. Reviewed independent-export screenshots now back both directory cards. The local font declaration removes an unintended dependency on the documentation site's global font styling.

The representative Base-in-Docs block also passes EN/ZH actual Preview theme events, native embed activation, Facade edits, full host/child snapshots and unmount in `test-results/embed-docblock-theme-sdk-verified/report.json`. The other ten corrected previews have source/type checks but still need individual runtime regression. Custom Canvas independently passes actual native cell input, renderer pixel change and native Undo in `test-results/mossbrook-native-current/report.json`; this does not certify full snapshot history.

Formula CustomRange remains partial. Production locale checks pass, but the installed beta.2 formula-editor Cancel path still emits development React unmount warnings, reproduced outside Next in `test-results/estuary-formula-4427-unmount-fulltrace/report.json`. The strict `test-results/estuary-formula-4427-child-sum-verified/report.json` also fails because an SDK `#DIV/0!` result reports success status. Neither failure is filtered or patched in SDK code. Native child keyboard editing, complete lifecycle/error paths, accessibility and broad performance coverage remain open.

### Custom formula native controls and CSV file-read interaction

The current `sheets/custom-formula` removes the route picker/Apply, fixture Reset, introductory host paragraph and JSON readback panel. Users edit B4 and inspect actual formula cells in the native Grid. Three bilingual host controls remain for real source/function behavior: cached recalculation, cache invalidation plus recalculation, and disposal/re-registration of async function handles. Source request/hit/pending counters do not duplicate workbook results. Re-registration explicitly warns that the beta.2 snapshot-reload recovery clears Undo; normal editing and theme changes do not. The exported README documents these boundaries and complete core CSS/EN/ZH locale registration.

Direct-Facade/native-input checks pass in `test-results/custom-formula-native-controls-facade/report.json` and `test-results/custom-formula-native-controls-zh/report.json`, including six route transitions, numeric boundaries, cache/reload differences, actual errors/spill cleanup, native input/Undo/Redo and same-owner/full-edited-snapshot theme retention. The first direct-read test exposed an old JSON serialization assumption (`undefined` raw cells had become `null`); the failing report is retained in `custom-formula-native-controls`, and the corrected test normalizes only composed empty cells while checking raw storage directly. The reviewed native initial screenshot now backs the catalog card.

Only this formula demo and the CSV diagnostic export were built. Formula export `test-results/selected-export-builds-NA1T2S/manifest.json` passes exact local-junction Vite build; `custom-formula-native-export-ui/report.json` passes eleven-file source parity and native white CSS/paint; `custom-formula-native-controls-export/report.json` passes the independent built version's real feature transitions. This is not a clean install. `custom-formula-native-ownership-retained/report.json` passes three theme/unmount/remount cycles plus unmount during reload and TIMEOUT, with all six observed owners disposed and no browser errors. The previous ownership harness incorrectly demanded owner recreation on theme changes; its failed report remains separately. Other cases in that broad legacy harness still need their own current-gallery migration and are not certified here.

`scripts/test-csv-file-native-edit.mjs` passes twice against the unchanged CSV factory (`test-results/csv-file-native-edit-final/report.json` and `-final-repeat/report.json`). It selects a real browser file, holds and then releases its original byte read, checks the B4 target before/during/after staging, imports B4:C5, verifies the native browser caret, types into B5 and undoes it. Values in A1:F15 return exactly; the full saved snapshot does not, so full history round-trip remains unverified. An earlier target shift without an explicit initial selection-readiness gate remains timing-ambiguous and is retained rather than labeled an SDK bug. No speculative `inert` fix was applied. The CSV parser suite and selected build `selected-export-builds-FoW2os/manifest.json` pass; file-error/disposal/mobile/all-keyboard interleavings are not covered by this targeted check.

### Custom formula boundaries and theme ownership

The following describes the previous boundary-only batch; its remaining host-control limitation is superseded by the native-controls revision above.

`sheets/custom-formula` adds six visible native-cell boundary examples in B19:B24: blank range, zero, signed decimal, numeric text rejection, boolean rejection and overflow. These enrich an existing route, not six new routes. The preview now calls `toggleDarkMode()` on the existing owner instead of recreating it. `test-results/custom-formula-boundaries-theme/report.json` passes actual native edits, full edited-snapshot/owner retention through both themes, Undo/Redo, asynchronous scalar/spill/cache/error/recovery cases and EN/ZH detail-page interaction. The source-level test also passes. Existing explicit reset and registration recovery still discard history; theme changes do not.

Only this demo was compiled. `test-results/selected-export-builds-AAT1Lk/manifest.json` records its exact-version local-junction Vite build, `test-results/custom-formula-boundaries-export/report.json` verifies ten-file source parity and native CSS/paint, and `test-results/custom-formula-boundaries-native-export/report.json` passes the native feature transitions in that independent build. The initial screenshot was visually inspected. This is not a clean dependency reinstall or full feature certification. Host controls/readback remain in this async-source example and still need presentation consolidation; host copy and fixture text are English, although SDK locales and detail-page instructions support EN/ZH.

### Sheets outlines and cross-workbook references

`sheets/permission` replaces host profile/write/reset/readback controls with six independent native worksheets and one global shadow selector. The previous 19 native-input failures are retained in `test-results/sheet-protection-native-gallery/report.json`. A controlled browser comparison located the cause in the factory's initial `inert` host: the hidden editor later received focus but its browser Selection had zero ranges, so typing emitted no input event. Removing `inert` and gating only user events restores the native caret without SDK patches or substitute inputs. `test-results/sheet-protection-native-gallery-final/report.json` now passes all 36 allowed/denied native input attempts, 48 shadow pixel comparisons and same-owner/full-native-edited-snapshot theme checks in EN/ZH, with no browser errors.

The event gate is scoped to this editor at window capture so native ancestor handlers cannot consume input first. `test-results/sheet-protection-startup/report.json` passes held/released and deliberately rejected first-protection calls: native typing/tab attempts preserve the full workbook and active sheet, successful release enables native C4=83, rejection remains visible and blocked, and an unrelated host input still works. Initial tab-switch failures are retained. These two scenarios do not certify disposal, partial later-rule failures or every IME/event path. The current exported project builds in `test-results/selected-export-builds-YfSLsd/manifest.json`; source parity, native CSS and actual exported C4 typing pass in `test-results/sheet-protection-export-input/report.json`. Frontend permissions remain distinct from server authorization and confidential-data protection.

`sheets/outline` replaces its 120-order host-panel workbench with five compact native worksheet variants: row groups, nested rows, parent collapse, child collapse and nested columns. Native gutters, sheet tabs and Grid are the interaction surface. `test-results/sheet-outline-native-gallery-ready-contract/report.json` passes EN/ZH initial untouched gutter interaction, dimension visibility, unchanged cells/formulas and same-owner/full-edited-snapshot theme transitions. Screenshot review exposed a missing initial `data-ready=false` marker that allowed a generic capture to run before initialization; the readiness contract is now explicit, with public `refreshCanvas()` after seeding. No artificial gutter, tab-switch workaround or fixed delay remains. Earlier incomplete screenshots and intermediate reports are retained.

`sheets/cross-workbook-formula` now shows six native reference variants at once plus direct/transitive rate calculations across four local workbooks. Its sole host control selects the viewed workbook. `test-results/cross-workbook-native-gallery-final/report.json` passes EN/ZH native Sales B4 editing (120 to 180), three dependent Summary results (2250/3450/2670), native Rates B4 editing (1.25 to 2), direct/transitive results (5340/1560), canvas repaint and same-owner/full-four-workbook-snapshot theme preservation. Browser errors and network writes are empty. A real startup error was fixed by waiting for the SDK render lifecycle before `setCurrent()`; its failed reports remain. This is a local single-engine graph, not remote fetching, cross-instance linking or XLSX external-link conversion.

Before the permission caret fix, all three selected exports built with Vite using exact-version local dependency junctions (`test-results/selected-export-builds-CdQdE9/manifest.json`). That batch's original source parity and real native-white CSS/canvas startup pass in `test-results/sheets-native-gallery-export-ui-ready-contract/report.json`; this was not a clean dependency reinstall or permission-input acceptance. The current permission export is verified separately above. The initial cross-workbook startup failure remains in the earlier export report. Build logs retain large-chunk warnings; initial delivery performance is not certified. Reviewed native captures back all three catalog thumbnails.

The three default Sheets package test commands now use native-gallery suites. Former outline/protection/theatre host-panel harnesses are labeled historical; the original cross-workbook fixture is retained separately. Their older lifecycle/accessibility results must not be counted as current-gallery acceptance. Directory checks retain 167 registered routes, including the existing Compose & Embed host classification; these revisions enrich existing entries rather than increasing the route count. Full API/menu coverage, export reinstall, accessibility and cross-browser/structural edge cases remain open.

### Base grouping, document width and PDF viewer

`bases/group-records` replaces the 90-record fixture/host-control/subtotal workbench with seven native grid views over 16 varied records. No synthetic empty groups or host aggregate table remains. `test-results/base-groups-native-gallery-native-check/report.json` passes EN/ZH projected ordering and recursive membership, actual native group-arrow collapse/expand, source preservation during view switching, a real Facade record edit and same-owner/full-edited-snapshot preservation through Preview theme events. The two empty-group flags compare saved settings, not a proven rendering difference. The relocated `test-bases-empty-group-sdk.mjs` still strictly fails; the null-number display defect also remains documented.

`docs-modern/responsive-width-and-zoom` now has only one external-container selector and simple native text. The host explicitly updates logical page width through the lower-level SDK mutation; native footer zoom independently magnifies the existing layout. No host drawing/image/table resizing or font shrinking simulates SDK responsiveness. `test-results/doc-width-native-gallery/report.json` passes both locales: 960/600/390/320 px hosts produce logical widths 820/584/374/304, and actual line counts increase from 12 to 37 in English and 11 to 25 in Chinese. Native 150% zoom retains logical width and line breaks with scene scale 1.5. Edited data is preserved except the explicitly changed width/zoom fields; theme changes preserve the full snapshot and owner. The first zoom harness needed the real click/focus-before-fill sequence; its failure is retained separately. The old mixed-resource failures and independent empty-divide regression are not fixed by this text-only gallery.

`pdfs/create-load-viewer` removes nine host lifecycle/history/review/download controls and JSON readback. Three native pages compare portrait text, landscape table and square image. Screenshot review caught point/pixel unit mismatch that clipped content; page sizes now use the same point units as Facade object placement. `test-results/pdf-viewer-native-gallery-points/report.json` passes EN/ZH native page navigation, all object/page bounds, real text mutation and same-owner/full-snapshot Preview theme preservation without browser errors or network writes. Three-page screenshots were inspected. Installed Exchange remains HTTP-backed and was not enabled for this frontend-only sample; binary import/export and print are not certified.

The actual localized Base detail iframe and four-level directory are exercised in `test-results/bases-groups-detail/report.json`, including a native view change and narrow detail-page overflow checks. Reviewed native-white screenshots replace the width thumbnail and add Base/PDF thumbnails. Source/CSS/locale/ribbon/metadata and type gates pass, but these selected checks do not establish full accessibility, independent export builds, arbitrary resource roundtrips or production delivery performance.

### Boards organization and query cleanup

`boards/group-lock-z-order` now uses four compact native clusters for overlapping layers, a single group, nested groups and locked/movable shapes. The museum story, unrelated connectors and host property/history/JSON controls are removed. Grouping and layer initialization use public Board Facades; the documented beta.2 locking limitation still requires the exported metadata operation. Native Boards tools remain visible without an extra generic office toolbar.

`boards/search-element-query` retains only meaningful text/type query and individual-result focus. Four cards and two connectors demonstrate case, whitespace, connector labels, duplicate-hit removal, empty results and type-only enumeration. Query/focus use actual public Facades; the former internal bulk-selection and simulated business mutations are removed. Both factories export official CSS and paired SDK locales.

The default package tests now target `scripts/test-board-groups-native-gallery.mjs` and `scripts/test-board-query-native.mjs`. The former host-panel scripts are historical, not current-gallery acceptance. The original mixed Board fixture is retained in `scripts/fixtures/board-groups-mixed-data.ts`: the strict `test-boards-group-undo-sdk.mjs` still fails sibling layer-order restoration after nested disband Undo. A simpler gallery does not fix or waive this SDK defect.

The selected query test passes EN/ZH in `test-results/board-query-native/report.json`: six text-query variants, type counts 4/2/6, five hits deduplicated to four elements, exact public viewport focus and dark/light Preview theme events preserving the owner, full edited Board snapshot and query state. Screenshots show actual native Board controls. The first cold run recorded script-parse and React pre-mount errors; a clean rerun does not establish that these intermittent development errors are fixed. Complete keyboard/accessibility, native edited-query refresh and standalone export verification remain open.

The latest groups layout passes EN/ZH in `test-results/board-groups-native-gallery-layout-verified/report.json`: 18 native elements including three containers, expected parent chains/layer ordering, actual locked-drag rejection versus unlocked movement, and same-owner/full-edited-snapshot preservation through Preview dark/light changes. The nested specimens were moved down to clear native container titles; screenshots were inspected. Earlier cold/HMR parse failures remain in the original and final-layout result folders. Native grouping/layer menu paths and complete history are not certified by these drag/theme checks.

### Remaining Modern Docs native-menu cleanup

`images-and-wrapping`, `shapes-in-documents` and `charts-in-documents` now restore the actual Grid toolbar and replace their host panels with 10 image specimens, six shapes and seven inline chart variants respectively. They no longer include unrelated business tables, columns or chart/image stories. Official CSS and complete registered EN/ZH locale packs travel with the shared factories; Preview theme effects update the existing owner instead of rebuilding content. The ribbon source gate rejects hidden toolbars and fixture/readback HTML in these three galleries.

Selected EN/ZH browser checks pass in `test-results/doc-images-native-gallery`, `test-results/doc-shapes-native-gallery`, `test-results/doc-charts-native-gallery` and `test-results/doc-charts-native-gallery-zh`. Native Grid tabs are clicked; shapes check Facade text/history-command roundtrips, charts check independent data updates, and images compare initial crop rectangles with renderer state. These are not full pointer-editing, live crop/resize, accessibility, lifecycle or standalone rebuild certification. Older mixed-layout and host-panel scripts are historical and do not prove the new galleries; the three default package test commands now run their native-gallery suites. Previous beta.2 crop, resize-frame and narrow-layout defects remain documented.

`column-layouts` now removes the same host panels: six text-only groups compare two through five equal columns and 2:1 / 1:2 widths. Native Grid and EN/ZH packs/CSS are visible and exported. Public `FDocument.setSelection(0, 0)` opens the gallery at its title after initialization. Selected EN/ZH group-count/ratio, native tab and Facade text/width checks pass in `test-results/doc-columns-native-gallery`; this is not full pointer-editing or responsive-layout acceptance. The ribbon source gate now covers all four galleries.

The original mixed-child data is preserved in `scripts/fixtures/doc-columns-mixed-data.ts` for `scripts/test-docs-column-resources-sdk.mjs`. The relocated strict SDK test still reports `orphanTable: true` and `orphanImage: true` after removing a group, and fails as required. Text-only gallery success does not certify mixed-child cleanup. Columns also passes the separate EN/ZH same-owner/full-edited-snapshot theme test in `test-results/doc-columns-gallery-themes`.

`scripts/test-doc-gallery-themes.mjs` now checks explicitly selected galleries through the installed next-themes storage listener, not by directly calling the SDK theme method. Images, shapes and charts pass six EN/ZH cases: insert native document text, switch dark/light, retain the same SDK owner and exactly preserve the full edited snapshot, with no page/console errors. Screenshots and report are in `test-results/doc-gallery-themes`. This tests theme effects, not mount/unmount or stalled-operation disposal.

### Single-product SDK locale registration

32 additional single-product factories now register the Chinese counterparts of their existing English SDK locale packs. Browser factories default to the document language; the headless Sheets factory accepts an explicit locale without accessing the DOM. Existing scenario data, native CSS and factory argument positions are preserved. This batch repairs locale support, not the capability coverage count.

`node scripts/test-embed-locale-packs.mjs --all` checks all 167 registered exports, including deferred source modules. The pure Node Docs script is explicitly classified as `headless-no-ui`; it does not need editor UI plugins. Registration parity, source/CSS preservation, directory checks and the Showcase TypeScript check pass. This does not certify all translations, dialogs, lifecycle paths or translated scenario prose.

`scripts/test-single-product-locales-native.mjs` now passes four selected EN/ZH cases: Slides theme thumbnails, native File labels and print settings/cancel without submitting a print job, plus Sheets native Find/Replace fields. Screenshots are in `test-results/single-product-locales-native`. The previous Find timeout was an initialization race: installed beta.2 registers SheetsFindReplaceController in `onSteady()`, three seconds after rendering, while its menu can already be clicked. The factory exposes a nonvisual `data-sdk-ready` marker from the public Facade LifeCycleChanged event; the test waits for Steady rather than adding fixed sleeps. The SDK's early-click window itself is not patched or claimed fixed. Actual search/replacement results and other dialogs remain outside this locale smoke test.

The initial run recorded a development app/layout chunk-load error (`initial-report.json`). The first readiness run completed all interactions but recorded a React pre-mount state-update error (`readiness-first-report.json`). The final unchanged-source rerun passes with no page or console errors; this does not establish that either intermittent development error has been fixed.

### Embed SDK locale registration

48 Embed factories no longer force the SDK UI to English. Each existing official English plugin locale has its Chinese counterpart registered, with a locale parameter defaulting to the document language. Existing argument positions remain compatible (the saved snapshot stays third in base-to-boards-float). Scenario text, data, embed surface, lifecycle and official CSS were not changed in this batch.

`scripts/test-embed-locale-packs.mjs` checks 73 registered embed-directory exports, including their deferred editor modules: official locale resolution, Chinese import/registration parity and constructor language configuration. This is a static gate, not proof that every native dialog or translation works. `scripts/test-embed-locales-native.mjs` exercises bases-in-docs-block and slides-in-sheets-float in EN/ZH, native Insert menus and child activation; screenshots/report are in `test-results/embed-locales-native`. Other hosts, tab surfaces, dialogs, source rebuilds and locale-specific lifecycle behavior still need runtime acceptance. Trial notices remain unchanged and scenario prose remains authored English.

Latest follow-up: `test-results/native-panel-cleanup-followup-3/report.json`
records **13 cleared / 48 remaining** from the original 61 residual-panel cases.
Riverside notes, Harbor quotes, content pipeline and Northstar QBR now have no
external feature/property/fixture/history/readback interface. Their real native
controls and original business content remain. Notes has 43/48 strict gates,
quotes 26/30 and pipeline 9/12; QBR has eight-page/six-literal production evidence
with deeper native interaction verification in progress. Panel removal is not
full feature acceptance. Earlier counts below are historical batch checkpoints.

Cedar images, Tide callouts and Harbor page setup now remove their complete host
property/edit/history/fixture/readback interfaces. Northstar CRM removes seven
duplicate/sample/fixture/snapshot buttons and its inspector, retaining only the
two meaningful host workflows: validated draft application and explicit readback.
Its native Grid, formula bar and sheet tabs are visible; a stable source ID keeps
host writes away from unrelated active tabs. Native source editing and theme
changes preserve the unapplied host draft. CommandExecuted refreshes display-only
formats even when formula calculation is unnecessary.

Current strict gates are 52/68, 34/38, 8/11 and 28/29 respectively. The 96 literal
recipes preserve meaningful variations without 96 additional routes or buttons.
All four normal nine-file exports pass official CSS and white-workbench checks.
The original 61-case inventory now has nine cleared entries and 52 remaining;
test-results/native-panel-cleanup-followup-2 is the latest bounded follow-up.
The older totals below describe their own earlier batches. Preserving native
Undo/Redo tests checks integrity; it does not create a collaborative-history demo.

Atlas Product Brief, Mosaic lists/tasks, Cobalt slide ordering and Board connector
routing now also remove all duplicate host controls and fixture/readback strips.
Atlas's previous Preview-only decision/reset/activity interface is gone; eight
literal examples execute from the exported README instead. The four cases retain
66 literal examples and varied original business content. Native Grid is retained
for Docs/Slides and Boards uses its native floating tools. All full EN/ZH dependency
packs and official CSS ship with the shared Preview/export factories.

Current strict selected results are Atlas 17/17, Mosaic 32/35, Cobalt 13/16 and
Board connectors 31/32. Mosaic scope/history, Cobalt thumbnail focus/history and
Board label offset/style failures remain visible. Real free-endpoint full-model
Undo/Redo and same-ID Mosaic/Atlas reconstruction are distinct passing checks,
not excuses to normalize other failed snapshots. Together with Asteria, five
entries in the original 61-case audit are cleared of host panels; 56 remain in
that point-in-time list, without implying complete native feature acceptance.

Asteria financial review now removes its complete fixture/description/readback
and duplicate editing/history panel, remote upload actions and case-local
Exchange/proxy configuration. Original fourteen-page data is unchanged. Fifteen
literal Facade blocks and real native text/table/annotation interactions pass
24/24 selected gates; local JSON is not binary PDF conversion. The removed
untracked config files have recovery copies, not Git-restorable history, in
test-results/financial-report-server-path-removed. Five-case source/CSS export
checks pass in test-results/native-sort-typeset-image-deck/export-ui-final/report.json.
The point-in-time 61-case inventory below now has one verified cleanup (Asteria),
leaving 60 of that list before the next batch; it is not a fresh all-case audit.

North traditional typesetting and Tern Slides recovery now also remove all
fixture/description/audit and duplicate editing/history controls. Twenty and ten
literal recipes retain real paragraph variations and saved reviewed/audience
editions. Grid and full dependency locales/CSS are retained; themes preserve
the same owner. Current native tests keep the Docs full-model history changes
and the intermittent restored-Slides double-click activation failure explicit.

The all-case source audit in `test-results/native-panel-inventory/report.json`
reads 885 runtime/Preview files and finds 61 residual cases at its timestamp.
Twenty-eight are feature panels, twenty-two mix meaningful host integration
with residual harness UI, and eleven are Preview-only template strips.
Do not delete legitimate CRM, lifecycle, event or native page controls merely
because they contain buttons. One other candidate is legitimate navigation only;
103 cases have no residual detected, not proven full UI acceptance.

Calibration Base sorting and Ridgeway PDF images now remove all host fixture,
property/edit/history and audit controls and handlers. Ten and sixteen literal
Facade examples respectively retain the distinct data and image variants.
Native sorting, image dragging/removal and unavailable native crop UI retain
strict failures; successful Facade calls do not certify those native paths.
Current package entry points select the new native tests, and reviewed native
covers are connected to both localized catalog views. See the per-case READMEs.

Partner Base filters, Lumen modern heading blocks and Meridian PDF ink now also
remove all fixture/description/outline/audit and duplicate edit/history panels
and handlers. Twelve/twenty-one/twelve literal examples preserve meaningful
variants without replacing native tools. Native filter, heading and ink property
failures remain strict despite passing source snippets. Rivet adds the same
factory's full-owner saved-snapshot reconstruction as an entry-module recipe,
not a new restore button; the separate unit-only failure is retained. Current
package test scripts point to the native checks, and current cover images show
the actual product UI. See the current batch at the top of `showcase/README.md`.

Lumen Base lifecycle, Tern Board lifecycle, Rivet slide sizes and Aster PDF markup
now remove their fixture, duplicate editing/history and audit panels and handlers.
Their original business content is retained; 20/9/20/12 literal Facade examples
replace the host-only controls. Native pointer/keyboard/pixel checks are separate
from source examples. Current strict reports retain Base Person-name painting,
Board sticky replacement/editor and heading Undo, and Slides reconstruction
failures. Rivet's 24 transparent native text shapes now pass complete native text
Undo/Redo; the previous legacy Text result remains historical. PDF native
drag-selected markup is now tested. Complete language
packs and official CSS are included; InkUI is an exact declared Board dependency.
See the current per-case README and coverage report paths. Historical control
counts and fixture buttons below do not describe these migrated implementations.

Bracken text-number-currency and arts-festival record-lifecycle also remove all
fixture/duplicate editing/history controls and audit panels. They retain their
different three-table/60-record business data and 23/20 literal code examples.
Native input/exact history, complete EN/ZH packs, same-owner themes and export
parity pass selected checks. Bracken retains type/default/null-display defects;
record-lifecycle retains attachment Undo and empty reconstructed view failures,
with native form submission still unaccepted pending diagnosis. Current README
and reports supersede historical host-control tests below.

Sable select-options now removes the complete fixture/host-editing/history and
readback panels and their handlers. Native Base menus occupy the preview while
the original three tables/60 records remain. Fourteen literal README examples
retain the option identity, appearance, selection and integrity variants. Real
single/multi pickers with exact history, chip recoloring, complete five EN/ZH
packs and model-preserving themes pass selected checks. Strict raw unknown-ID
acceptance still fails; earlier host-control tests are historical, not current
UI acceptance. Current evidence: test-results/sable-native-current/report.json
and test-results/sable-native-export-ui/report.json.

Remove generic fixture panels and their handlers rather than collapsing them. Host actions that duplicate native editing do not belong in this visual-first collection. The Lumen theme/background and Saffron text cases now have zero host controls; other cases below still require migration. Historical button counts are not current acceptance.

Saffron's three authored pages demonstrate rich-text emphasis, native lists and paragraph alignment in coral/cream, mint and lilac. `slides-text-native-serialized` and `slides-text-native-production` pass actual rendered paragraphs/colors, official Grid CSS, real Facade text write followed by native Undo/Redo, Print settings open/cancel and 760/390/320px canvas resizing. The production run verifies all nine exported files. A Facade write plus native history does not certify keyboard editing or every Ribbon operation. Autofit, native accessibility, print-output fidelity and current lifecycle fault injection remain open. Exchange Client's default server-backed conversion transport must not be counted as browser-only import/export.

## Historical Slides theme/background controls

`slides/theme-and-background` now exposes only a fixture selector and five host buttons: Load fixture and Reset call `FUniver.disposeUnit/createPresentation`, Reload snapshot round-trips `FPresentation.save`, Fit slide uses the registered zoom operation through `FUniver.syncExecuteCommand`, and Inspect reads the Facade snapshot with explicitly diagnostic SDK model/render bounds. These are host integration/readback operations, not invented editor features. Native thumbnails, Themes, Format Background and Ribbon Undo/Redo supply editing/navigation without host duplicates.

The first four Background study pages demonstrate distinct solid, gradient, pattern and inline-image fills. Pattern selection is not present in the installed native panel and is documented as authored snapshot content. `slides-theme-native-background-export-collapsed` and `slides-theme-native-background-next-collapsed` verify native background Reset/Undo/Redo against real pixels and snapshots, native gradient editing, twelve themes, all eight pages, six keyboard-reachable host controls, and source parity/EN-ZH guides respectively. Native thumbnail navigation adds no undo entry; descriptions and tests no longer carry the old host-navigation behavior forward. Neither pass establishes every other native toolbar command or all lifecycle/accessibility boundaries.

## Embed inventory lifecycle

Inventory selection and quantity updates now use the stable stock worksheet ID for both reads and writes. The old host mixed a named-sheet read with an active-sheet write, allowing native tab changes to redirect the action. `embed-stock-target-baseline-selected` reproduces the error; `embed-stock-target-standalone` and `embed-stock-target-details-final` verify native new-tab/rename/delete operations, unchanged non-target worksheet data, returning selection, missing-target disablement and exact complete remount/checkpoint snapshots. The new native sheet events share real listener cleanup; current twenty-owner fault acceptance passes. The fixed A4:F36 lookup and unique-SKU assumption remain explicit limits, not general structural-edit acceptance.

Lifecycle waits now have 10-second deadlines, and host removal cancels Rendered waiting. A calculation-wait failure requests the actual `FFormula.stopCalculation()` Facade, then attempts unload, all listener cleanup and core disposal even if an earlier cleanup step reported an error. Errors stay visible and stop automatic replacement; they do not produce fake success. `embed-lifecycle-faults-complete` verifies twenty owners across seven explicitly injected boundary faults, ordinary pending Apply/Remount/Mount teardown and theme cycles. This tests the application's failure handling around the real SDK, not real failure occurrence or universal external-formula cancellation. Core disposal exceptions and synchronous blocking still require separate acceptance.

`embed/mount-dispose-remount` has five variants, ten EN/ZH explained actions and four repeatable fixtures. Mount/dispose/remount use actual `FUniver.createWorkbook/disposeUnit/getWorkbook`, `FWorkbook.save` and the explicitly distinguished core owner `Univer.dispose()`. The same host slot remains while the old workbook and canvases disappear. Quantity updates and selection use `FRange.setValue/activate`; full checkpoint restore, fixture selection and browser JSON download are labeled host integration, not invented Facades or binary export.

Duplicate Mount/Dispose, missing targets/checkpoints, identical checkpoints and unchanged quantities disable their actions. Validation precedes fieldset disabling and SDK writes; synchronous input readback permits immediate keyboard activation. Native typing and Undo/Redo compare complete snapshots, independently of host recreation. Reset restores the full default and clears the checkpoint; four fixtures load twice without stripped snapshot fields. The missing-unit error case actually returns false from `disposeUnit`, leaving the valid inventory editable.

`embed-mount-standalone-final`, `embed-mount-details-final`, `embed-mount-export-ui-final` and `embed-mount-pending-ownership-final` record production/docs interactions, both localized guides, nine-file source parity, official white/theme/flex CSS and eleven disposed owners including pending Apply/Remount/Mount teardown. Grid is the native default, not host styling. The original 18-record three-depot inventory differs from the CRM quote. Stalled readiness/failure cleanup, globally frozen SDK time, arbitrary imported/structural edits, complete native accessibility and delivery performance remain open in blueprint 001; ordinary HTML lifecycle does not claim nested Pro Embed plugin support.

## Historical host controls: Bases single and multi-select option identity

The following describes the removed host-control implementation. Current native-
only Sable behavior and evidence are recorded above and in its exported README.

`bases/select-options` exposes six variants, twelve EN/ZH action groups and four repeatable fixtures. Fourteen buttons cover option creation, stable-ID rename, color, earlier/later order, confirmed deletion, replacement/add/remove/clear writes, a raw unknown-ID probe, native history and full snapshot reload/download/Reset. `FBaseTableField.setConfig`, `FBaseTableRecord.setValue`, `FBase.save`, focused-Base `FUniver.undo/redo` and Base UI activation are real installed Facades. Fixture loading, cardinality/list validation, local download and reference reporting are explicitly host integration.

The Sable coastal observatory differs from the repair café and theatre cases: 30 individually named surveys, 12 coastal projects and 18 sample handovers have different priority/habitat combinations, samples, blanks, multilingual notes, people, dates, original local text attachments and linked sites. The inspector resolves current labels and orphan IDs from actual field config/record values. Unchanged names/colors/writes, duplicate Weather creation, boundary moves, unconfirmed deletion, missing targets and unavailable history disable their buttons. Scope is the Survey checklist, so the other table's similarly named Priority field stays unchanged.

Tests check native chip pixel changes on recoloring, stored-ID preservation through rename/order, unused deletion, single/multi write variants, complete native history and snapshot/download/Reset. Actual native single/multi pickers also save IDs and survive native history/reload. The raw probe and used deletion deliberately report beta.2 integrity defects rather than replacing SDK behavior with a successful-looking host fix. Four official CSS imports and explicit Grid configuration are included in the shared Preview/export factory; host styles do not match nested native controls. Blueprint 004 remains partial pending the exact requirements in `coverage.json`.

## Historical host controls: Bases text, number and currency fields

`bases/text-number-currency` groups five capability variants with eleven EN/ZH action groups and four repeatable fixtures. The thirteen buttons exercise real field creation, merged format configuration, schema conversion, typed/raw/null writes, set/clear defaults, default-value record creation, native history and full snapshot reload/download/Reset. `FBaseTable.addField/addRecord`, `FBaseTableField.setConfig/changeType/setDefaultValue`, `FBaseTableRecord.setValue`, `FBase.save` and focused-Base `FUniver.undo/redo` supply the SDK operations. Fixtures, host validation and JSON downloads are labeled separately.

The three-table, 60-record repair café has distinct jobs, quotes, fractional/negative/zero values, multilingual notes, people, dates, links and original local text attachments. Buttons disable repeated named-field creation, same-type conversion, numeric formatting on Text, absent cell targets/defaults and unavailable history. Last-operation reports display actual stored types, not inferred successful normalization; host Undo/Redo clears that report and synchronizes controls. Currency formatting changes native paint without rounding stored precision or performing FX conversion.

Strict tests retain two beta.2 defects: old text is not normalized on schema change, and raw numeric defaults can accept invalid strings. Host-validated safe defaults are explicitly not SDK validation. Browser tests verify numerical parsing, rejection with full snapshot preservation, native currency/separator painting, omitted/null/zero behavior and exact downloaded/reloaded snapshots. Four official stylesheets and Grid configuration travel with the shared Preview/export factory. This is partial blueprint 003 coverage, not a claim that all native field menus, accessibility, lifecycle races or production performance are complete.

## Grid default and optional single-row menu

All registered desktop entry points now explicitly select Grid, except the two deliberately slim plugin starters using classic. Mobile/Node are separate; visibility settings are not rewritten. `scripts/test-showcase-ribbon.mjs` checks Preview/export source policy, while `test-showcase-ribbon-ui.mjs` visits only explicit selections and checks actual native toolbar markers and CSS. No shared host stylesheet simulates the SDK ribbon.

Custom Menu starts in Grid and offers classic through real preset initialization. The installed beta.2 lacks `FUniver.setRibbonType`, so the control is honestly documented as owner recreation from `FWorkbook.save()`, not a made-up runtime Facade. Selection/content/formatting survive and history is cleared; the SDK normalizes its empty defined-name resource on reload. The live output labels layout as host configuration, separate from actual SDK snapshot data. Classic uses the SDK's overflow popup where needed. Highlight/approval callbacks still call the same Facades, and current tests exercise them in both layouts. Existing grouped ribbon submenu failures remain unresolved.

## Historical host controls: Bases record lifecycle and batch editing

`bases/record-lifecycle` groups capability variants rather than splitting CRUD into separate empty pages: one/three-record intake, named two-field patches versus three-row/two-column ranges, order/identity, and native history versus checkpoint recreation. Eleven EN/ZH action groups describe 14 buttons plus explicit target/scope controls. Operations use actual `FBaseTable.addRecord/addRecords/getRange/deleteRecords`, `FBaseTableRecord.setValues/setOrderKey/duplicate/delete`, `FBaseTableRange.setValues`, `FBase.save` and focused-Base `FUniver.undo/redo`. Ordinary host downloads/fixtures and snapshot recreation are identified as host operations.

Actions always target the Production checklist by stable record ID; range coordinates follow table order, not sorted/filtered projections. Unrelated field values are compared exactly, duplicate IDs differ, deleted records disappear, ordering changes, and native edits survive exported JSON/recreation. Repeated intake, unchanged updates, absent targets, unavailable history and unconfirmed deletion are disabled. The retained-resource diagnostic is not a success replacement: strict history tests fail the beta.2 insertion-Undo resource defect; observed-mode tests assert the specific defect and verify the remaining operations. Checkpoint restoration does not masquerade as SDK Undo. The original arts-festival three-table fixture differs from the Lumen lifecycle and pipeline examples.

## Historical Bases creation controls (superseded by native-only Lumen)

`bases/create-base-and-tables` has four variants, ten EN/ZH explained action groups and four repeatable states. `FUniver.createBase`, `FBase.insertTable/duplicateTable/deleteTable/save`, `FBaseTable.setName/addField/addRecords`, `FBaseUI.activateTable/activateView/setPersonOptions`, and `FUniver.undo/redo` supply the actual SDK operations. A three-table theatre fixture has 12 projects, 30 distinct work packages and 18 milestones, with canonical dates, numbers, person IDs, embedded attachments and actual RecordLinks.

Insert positions, stable formula identity on rename, schema/record duplication, native editing, linked-table delete protection, confirmation, full deletion Undo/Redo, downloaded JSON and full-owner reload/checkpoint restore have observable model assertions. Unchanged names/checkpoints, unavailable history, referenced/last-table deletion disable their controls. Restoration is a host snapshot operation, not substituted native Undo. Four independent initialization commands are disclosed rather than claiming atomic insertion history. Person-name Grid rendering and existing-table movement remain explicit SDK gaps; tests with known-defect observation enabled are not full acceptance. The model regression covers typed Facade writes for every original record, not just loading raw snapshots.

## Historical Board lifecycle controls (superseded by native-only Tern)

`boards/create-save-and-restore-board` uses actual `FUniver.createBoard()`, `FBoard.save()`, `setElementTransform()`, `setTextContent()`, `focusElement()`, `undo()` and `redo()`. Four variants, nine EN/ZH action groups and four states distinguish checkpoint restore from reloading current content. Full JSON readback includes every page and registered resource, not a hand-picked success summary. Native pointer/keyboard edits are saved and recreated. SDK setters return observable changes; identical heading/checkpoint, missing targets and empty history disable their corresponding buttons. Invalid-target actions intentionally exercise the real SDK rejection and preserve all serialized fields.

Outer actions focus the Board before reading focused-unit history; they do not manufacture history availability or replace Undo with host snapshots. Restore/Reload deliberately recreate the SDK owner and clear native history. Download uses the browser and SDK snapshot, with no demo backend. Fit uses the explicitly labeled public viewport service. No page-navigation Facade is invented. Original multi-page fixture data varies labels, colors, transforms, negative coordinates, rotation and layer/page order. Native SDK text padding/wrapping fixes edge-clipped fixture text without restyling the editor. Current browser evidence is in `board-roundtrip-padded-standalone`, `board-roundtrip-details-final`, `board-roundtrip-export-ui-final` and `board-roundtrip-ownership`; remaining requirements are retained under blueprint 001.

## Traditional Docs fonts, fallback and glyphs

The current revision is a compact native typography gallery: four requested font stacks, size/weight comparisons and six script/glyph specimens, with the Core Grid ribbon and complete EN/ZH locale packs. The fixture controls, custom history command, browser probes and report table/figure have been removed. The paragraphs below and their artifacts describe the retired revision; they do not establish acceptance of the current gallery. The separate SDK history regression remains useful, but is not an interaction advertised by this demo.

Current evidence: `test-doc-fonts.mjs` runs `test-doc-font-native-gallery.mjs`, passing EN/ZH checks for two physical pages, four requested stacks, six script markers, real range-style edits with text preservation, and native Ctrl+B on/off after `FDocument.setSelection()`. `test-results/doc-font-native-gallery` contains both-page screenshots and the report. This does not establish per-glyph font identity, complete RTL correctness, every ribbon control or lifecycle acceptance.

`docs-traditional/fonts-fallback-and-glyphs` has ten buttons, eight explained EN/ZH action groups (including a view selector), four variants and four repeatable states. Font/size/weight operate on actual `FDocumentTextRange` instances; unique sample markers are resolved again after native edits. Unchanged styles, absent/duplicated samples and empty history disable their actions. A real `setSelection()` call supports native keyboard editing. Whole-body family changes reach headings and table text. Invalid sizes and a real negative-range SDK error preserve the complete snapshot.

For beta.2 history, the range Facade is called inside the explicitly registered `demo.command.alder-text-style` command, invoked through `FUniver.syncExecuteCommand()`. This is disclosed SDK command integration, not an invented built-in font Facade or host snapshot history. `test-doc-font-history-sdk.mjs` distinguishes the failing direct-history path from the passing registered-command path. Reload/download and cached state/reset use real save/createDocument calls; browser FontFace probes are automatic, labeled diagnostics and do not pretend to prove glyph coverage. Bootstrap table creation uses its Facade and the reference figure uses the existing drawing command pattern, with no fake image-insertion button.

`doc-fonts-responsive-standalone-final`, `doc-fonts-responsive-details-final`, `doc-fonts-responsive-export-ui` and `doc-fonts-responsive-ownership` contain current evidence. View uses installed `SetDocZoomRatioOperation` through `FUniver.syncExecuteCommand()`, never CSS scale; native paper-pixel checks verify fit at 760/390/320 px. 100% permits native horizontal scrolling. Resize only reacts to width changes and does not dismiss SDK errors. Eighteen alternate-family applications preserve all six specimens; duplicate native markers are rejected as ambiguous. Native footnotes (not exposed by the inspected installed Facades), licensed font embedding, full glyph/RTL acceptance, native accessibility and pending-operation/resize lifecycle remain open under blueprint 006.

## PDF image placement and cropping

`pdfs/image-placement-crop` demonstrates installed `FPdfPage.newImage()/insertImage()/getImages()` and `FPdfImage.setSource()/setTransform()/setCrop()/setOpacity()/remove()` with live getters, not CSS clipping or a host image replica. Thirteen buttons have nine EN/ZH action groups, four variants and four states. No-op, missing-target and empty-history buttons are disabled. Real invalid crop/dimension/opacity errors preserve the snapshot. Source replacement, cropping, opacity and transform changes are checked against native canvas output as well as getters; removal leaves captions intact. Native history restores content while SDK revision counters may advance.

The target is a stable managed illustration ID on page 1. State/reset/reload/download are explicit host integrations using `createPdf()`/`save()`; whole-page fitting is a public runtime-service integration. The SDK stretches a cropped source window into the existing frame, retaining complete source bytes: this is neither CSS masking nor redaction. See `pdf-image-details-final`, `pdf-image-standalone-final`, `pdf-image-export-ui-final`, `pdf-image-ownership`, and coverage blueprint 025 for verified scope and outstanding composition/native-selection/accessibility checks.

## Ink and freehand review

`pdfs/ink-freehand-review` uses installed `FPdfPage.insertAnnotation()` with `INK`, `getAnnotations()`, and `FPdfAnnotation.getInk()/getStyle()/setStyle()/remove()`. Real native pointer strokes appear in the same readback and survive exact full-snapshot reload/download. Color and width updates preserve path coordinates; native Undo/Redo restores style and removed objects. Duplicate preset insertion, unchanged styles, absent ink and empty history disable their controls. Empty paths exercise the actual SDK guard, while invalid host widths preserve the snapshot.

Ten host buttons form seven EN/ZH action groups; three variants and four repeatable fixtures explain their visible outcomes. Reset/state loading and JSON download are host integrations backed by `createPdf()`/`save()`, not claimed as binary conversion. The controls/readback target page 1, styling targets preset IDs, and removal deletes the last complete ink annotation in SDK page order. No partial-path eraser, guessed shape/stamp Facade or custom drawing canvas is presented. Native pen keyboard/screen-reader accessibility remains unmet. See `pdf-ink-details`, `pdf-ink-standalone`, `pdf-ink-ownership` and `pdf-ink-export-ui` reports and the explicit remaining requirements in coverage blueprint 008.

## Financial report review

`pdfs/financial-report` now shares its factory, eleven host buttons and six official SDK stylesheet imports across Preview and exported source. Highlight/Remove call native annotation Facades; Undo/Redo call the installed Facade and re-read actual annotations to enable Add correctly. Native paragraphs and tables hold the report. Find reads live paragraph blocks, with page navigation explicitly identified as public runtime-service integration rather than a PDF search Facade. State loading, Reset and snapshot download are labeled host integration; `save()` and `createPdf()` provide the durable data.

Four selectable fixtures and complete snapshot equality replace the old one-page/add-only demonstration. Native paragraph input, annotation pixels/history, downloads, reload and narrow keyboard controls pass in documentation and independent production. The extended test also exercises native table text and localized embedded actions; see the specific reports in `showcase/README.md`, including retained failures. Missing threaded comments, verified binary import/export and the larger first-wave financial review package remain unmet, not represented by inert buttons or renamed JSON exports.

Binary conversion now registers the installed Exchange and PDF Exchange plugins. Consent-aware buttons call `importPdfToSnapshotAsync()`, `exportPdfBySnapshotAsync()` and `downloadFile()`; JSON download stays separate. The real development endpoint fails browser CORS directly and returns 401 through the existing same-origin development rewrite. The exported project includes a Vite development/preview proxy, not a conversion backend or production authorization. No successful binary conversion is claimed. `test-pdf-exchange.mjs --service-errors` explicitly injects rejected requests to check consent, file-header validation, exact report preservation, restored controls and no substitute download; it is not a conversion-fidelity test. Seven-owner disposal and eleven-file source/CSS parity pass after registration. The cold localized React script warning remains a failed gate, not filtered away.

## Acceptance

`pdfs/create-load-viewer` now disables Set review decision when the actual sign-off is absent or already matches. Public `undo()`/`redo()` restore real native text and re-enable applicable actions; no separate host history is maintained. The duplicate Inspect button is removed because Facade readback already updates automatically. Blank snapshots are cached for exact repeatability, owning-instance replacement waits for Rendered, and asynchronous fitting captures its owner. Nine buttons form eight documented action groups with three variants and four states, all with English/Chinese outcome descriptions. Host controls start collapsed to leave the native footer inside the 640px preview; no SDK CSS selector is overridden. See `pdf-lifecycle-editor-first` and `pdf-lifecycle-editor-first-standalone` for actual native text/history, image bytes/pixels, error preservation, edited remount, Reset, blank and localized checks. The global-clock and broader lifecycle/accessibility requirements remain in blueprint 001.

- Identify the exported handler and exact installed Facade method. Prefer feature-specific methods over injector services or command IDs; existing command-dispatch examples need review.
- Explain inputs, target unit/range/element, meaningful variants and expected changes.
- Assert before/after SDK state and rendered results. Inspection must read the SDK, not a separate host model.
- Disable unavailable/already-satisfied actions or explain preconditions. Never report success after an absent/failed controller call.
- Verify error preservation, reset and disposal during operations.
- Use the same controls/handlers in Preview and exported standalone projects, including SDK CSS and accurate metadata.

## Historical PDF markup controls (superseded by native-only Aster)

`pdfs/text-markup` uses `FPdfPage.insertAnnotation()` for highlight, underline, strikeout and squiggly variants; `FPdfAnnotation.setStyle()` changes color/opacity, and `remove()` removes durable annotations. Three distinct known targets in an original two-page Aster draft demonstrate renewal date, fee and a two-line obsolete clause. Source words stay intact. It deliberately does not claim automatic text-selection detection. Page navigation and fitting use the public runtime service, labeled separately from Facade mutations. Clear all issues one removal per annotation; native Undo restores one at a time.

The same exported factory owns all controls, five official SDK stylesheets and fixture construction. The regression compares actual native annotation-region pixels, SDK geometry/style readback, invalid-opacity preservation, source words, per-item history, complete reload/download/reset snapshots, and keyboard actions at three narrow widths. Undo creates new durable audit metadata: the comparison permits only the edit-state revision and the restored annotation's creation timestamp/revision to differ, not content or other objects. Standard theme/remount ownership tests pass. No SDK CSS or package was patched. Cold detail compilation still emits the retained shared React script warning, despite a warmed EN/ZH guide/iframe pass. Native drag-selected text and full accessibility acceptance remain open in coverage entry 007.

The state-selector follow-up now loads default, empty, boundary and error fixtures through the same Facade construction and saved snapshots. Default visibly seeds three distinct marks, empty keeps all words, boundary distinguishes invisible opacity 0 from removed annotations, and error restores default before calling the SDK with invalid opacity 1.5. Repeated fixture loads/downloads compare every snapshot field; unknown fixture IDs fail before disposal. Existing targets disable Add, unchanged appearance disables Apply, and selecting a target reads actual stored type/color/opacity. Four variants, seven action groups and four states now each have English/Chinese outcome explanations. Native disclosure controls keep the initial highlight inside the visible preview; ready waits for the public Rendered lifecycle, not just canvas presence. Current documentation, independent production and seven-owner reports pass under `test-results/pdf-markup-states-*`; the earlier cold/HMR failures remain failed evidence.

## List validation: actual native behavior and sample semantics

The following list-validation paragraphs record the retired control-panel revision, not acceptance of the current native worksheet gallery. The gallery removes the fixture panel, duplicate rule editor, sample-write/reset/download buttons and JSON readback. Its replacement interaction script reads Facade state and operates native dropdowns; no passing historical button test certifies the new revision.

Previously, `sheets/list-validation` shared nine controls, a thirty-object fixture and official Core/DataValidation CSS in Preview and export. Builder methods created single/multiple, fixed/range, rendering, blank and invalid-input policies, and Facades supplied writes and readback. That UI has been superseded to keep the editor and feature variants primary.

The feature test passes actual native single/multiple option toggles, STOP rejection with native dialog, WARNING acceptance, live source mutation, save/reload rules, category-only empty and keyboard reset in documentation and production standalone. Ownership does not pass: an immediate rule change followed by React teardown exposes beta.2 automatic-row-height work after workbook disposal. `scripts/test-showcase-ownership.mjs sheets/list-validation` preserves the strict failing regression; the runtime, both guides and coverage ledger disclose it. Source/style checks are not used to waive this failure.

List validation follow-up adds four explicit fixture loads and actual snapshot JSON downloads through the same exported implementation. B34 readback now comes from the live cell, not a seed constant. Full downloaded snapshots retain every field through reload; reset comparison excludes only regenerated rule UIDs. Native single-dropdown Undo/Redo is tested. These improvements do not certify Windows CRLF paste: the separate `test:showcase:list-validation:clipboard` gate fails on invented trailing spaces and the runtime discloses it. Cold detail compilation also retains a failed console-warning report despite a warmed EN/ZH pass. Blueprint 011 remains partial.

## Intentional no-host-action setup cases

`sheets/slim-via-plugin` is the explicit-registration counterpart to the minimal Preset example. It intentionally exposes no host button: adding one would obscure the smallest valid plugin graph or create a second feature demonstration. Its meaningful interactions are the installed SDK's native cell editor, formula bar, toolbar and Undo/Redo UI. Preview and standalone now execute the same `createDemo()`, with the same six official SDK styles and owning-instance disposal. `test-results/slim-plugin-ownership/report.json` and `slim-plugin-export-ui/report.json` verify lifecycle, exact nine-file source parity, production canvases and native opaque-white theme CSS.

`sheets/basic-via-plugin` is the broad explicit-registration overview. Its original eight-sheet workbook, native ribbon/context features and watermark remain the interaction surface; detailed Facade controls live in focused cases instead of being duplicated here. `docs/slim-via-plugin` is the corresponding minimal native document setup. Both now share Preview/export factories, exact official CSS and owner disposal. Their ownership and export-UI reports verify seven-owner replacement sequences, exact nine-file source, native white/theme/flex styling, canvases and the Basic workbook's watermark paint. No no-op host button or synthetic status was added.

`sheets/node-via-plugin` also has no host button, but for a different reason: it is a headless Node program. Its shared factory performs the meaningful public-Facade operations (`createWorkbook()` and `save()`), while Preview renders the exact serialized result. The executable export, strict type check, varied fixture assertions and seven-owner lifecycle pass. It intentionally exports no Univer UI CSS because it registers no UI plugin and renders no editor; CSS parity applies to UI demos, not server models.

`sheets/mobile-via-plugin` deliberately exposes the installed Mobile UI as its operation surface instead of placing duplicate host buttons over it. The Start/Insert/Formulas/Data/View tabs and their editing commands are real plugin controls; the exported host supplies only a plain white 390px viewport, with no simulated phone chrome. Preview and standalone share the same plugin registration, eight-sheet fixture, 16 official style imports and lifecycle gate. The ownership report verifies safe theme replacement after the public Facade reaches Steady, while the production export report verifies exact source, native 390px white app layout, canvas paint and watermark. Focused Sheets cases remain responsible for documenting individual Facade variants.

`sheets/migrate-from-luckysheet` is a load-time interoperability example, so it does not add a no-op Convert button after the same snapshot is already loaded. Its meaningful host operation is the exported `luckyToUniver()` field mapping; its SDK operation is public `createWorkbook()`, and inspection uses the native workbook UI. Metadata separates supported mappings from source tabs whose charts, pictures, pivots, comments or sparklines are not converted. Preview/export share all 47 converter files, one factory and the same three official Preset styles. Ownership and 54-file production export reports pass without claiming 1:1 migration completeness.

`docs/big-data` is likewise load-time/native-interaction evidence, not a host-button feature case. Public `createDocument()` loads the original 1.1-million-character snapshot; native scrolling, editing and history are the user operations. There is no fake Run benchmark button or unmeasured timing badge. Preview/export share the nine files and official Docs Core CSS; ownership and production export reports verify lifecycle, exact source, native opaque-white styling and real canvas paint. Controlled performance measurements remain separate work.

`sheets/univer-pro-collaboration` does not add a fake Sync button. Its default local workbook is operated through native Sheets UI and explicitly labeled `local-fallback`; real sync is activated only by a configured unit URL and actual Pro plugin registration. The production test asserts zero Universer HTTP/WebSocket requests in the frontend-only default, while the exported config lists the real backend endpoints. Preview/export share the same 11 files, dynamic Facade-extension path and owner. Presence, concurrent edits, reconnect and conflict handling still require a real backend test and are not claimed here.

## Corrected: Sheets Print

The former Print control strip lived only in the React Preview, while the downloaded entry mounted an editor without those controls; Reset merely changed a React key. `showcase/sheets/print/code/create-demo.ts` now owns the two visible controls for both entry points. Open calls public `FUniver.executeCommand(SheetPrintOpenOperation.id)` and reports the installed public `SheetPrintOpen` event. Reset calls public `disposeUnit()` and `createWorkbook()` and restores the rendered fixture after a real native edit. The explicit Print Facade extension, shared host stylesheet and all three official Preset styles are part of the exported source.

`test-results/print-facade/report.json` and `test-results/print-standalone/report.json` pass the same native interaction in documentation and production: the two-page SDK print settings surface opens, the event names the real active sheet, a B2 native edit paints, Reset repaints the original value, the workbench is opaque SDK white and no write request occurs. `test-results/print-ownership/report.json` passes seven-owner theme/unmount cleanup. The fresh nine-file project at `<USERPROFILE>/AppData/Local/Temp/univer-print-facade-20260905` passes exact source/CSS UI checks, strict TypeScript and a targeted Vite production build.

This is partial coverage of print blueprint 031: the existing portfolio proves the browser-only plugin path and meaningful buttons, but it does not yet implement deterministic print-area, repeated-header, one-page-wide, empty/error and final OS-print variants. Those requirements remain in `coverage.json`; opening a configuration surface is not complete print-output certification.

## Corrected: Browser Import and Export

The former controls existed only in `preview/main.tsx`, while the standalone entry mounted an editor without any way to import, export or reset. `showcase/sheets/univer-pro-import-export/code/create-demo.ts` now owns all four controls, official CSS imports and Facade handlers for both entry points. Import calls public `FUniver.importSheetToSnapshotAsync()`, then public `disposeUnit()` / `createWorkbook()`. XLSX and active-sheet CSV export call public `exportSheetBySnapshotAsync()` with the current `FWorkbook.save()` result and pass the returned file to public `downloadFile()`. Reset recreates the varied regional-sales fixture through the same public unit Facades. Busy state disables every control, and absent/unauthorized service results produce an explicit no-file status instead of success.

The exported `config.ts` selects production on `univer.ai`, defaults local development to `https://dev.univer.plus`, and accepts an explicit `?exchangeOrigin=` override. It no longer depends on the documentation repository's localhost sign-url route. This is still a browser client for a configured Exchange service, not a claim that Office conversion runs locally in JavaScript or needs no service authorization.

`scripts/test-import-export.mjs` exercises actual installed Facades and the Exchange protocol in both the documentation route and the independently built project. It verifies compressed live-snapshot upload after a native edit, XLSX and active-sheet CSV requests/downloads, file-picker import into a replaced workbook, rendered reset/import results and a rejected export. `test-results/import-export-ownership/report.json` verifies seven owners, three theme replacements and detached old canvases. `test-results/import-export-export-ui/report.json` verifies ten exact exported files and native opaque-white SDK styling. The service double isolates client behavior; real format-fidelity, production authorization, full state/accessibility and cross-browser acceptance remain open in `coverage.json`.

## Corrected: CRM Quote Calculator

Sources: `showcase/embed/crm-quote-calculator/code/create-demo.ts`, `code/index.ts`, `preview/main.tsx` and `code/data.ts`.

| Action/display | Former defect | Verified correction |
| --- | --- | --- |
| Apply Enterprise | Returned a hardcoded total after writing inputs | Shared `FRange.setValues()` handler; `getRawValue()` readback after `FFormula.calculationResultApplied()`, including native edits |
| First-year value | Displayed subscription subtotal as contract value | Distinct SDK E4 subtotal and E11 contract values, with pending/error states and no stale-total fallback |
| Reset | Implemented only in React Preview | Shared `disposeUnit()` / `createWorkbook()` reset; three cycles now compare the complete saved workbook, including stable ID and resources |
| Exported controls | Exported entry only initialized the sheet | Same `createDemo()` shell/handlers/CSS in Preview and independently built standalone; current nine-file export includes its explanatory README |
| Repeated Enterprise | Reported success even when inputs matched | Disabled while raw A4:D4 values match; real native edits re-enable it |

The third shared button calls `FRange.activate()` to select A4:D4 and reports the selected range. It is tested by keyboard without pretending to change values. Related API names and each action's input/effect are documented in English and Chinese metadata.

`test-results/crm-quote-documentation-final/report.json`, `test-results/crm-quote-standalone-final/report.json` and `test-results/crm-quote-ownership-final/report.json` pass with zero page/console errors. They cover real native B4 edits, SDK formula errors, reset, narrow screens, exact source/SDK CSS export, and owner disposal. The documentation run includes both localized detail pages and working iframes. The raw-value getter choice was validated against formatted currency/percentage cells, not guessed from its name.

The host-command follow-up adds product, integer quantity, monthly USD price, discount, currency and illustrative FX fields. Apply validates before `setValues()`/`setNumberFormat()`; totals are displayed with `getDisplayValue()`, not host arithmetic. Label/format-only calculation passes ending in NOT_EXECUTED no longer leave buttons permanently disabled. Read sheet into form only synchronizes the draft, and E11 selection activates the actual total. Preset writes retain currency and FX. JSON download/reload compare every snapshot field; load/reset discard history and unapplied drafts, as documented. Separate SDK commands are not presented as a transactional undo group.

Current scoped evidence is `crm-host-standalone-final`, `crm-host-details-final`, `crm-host-export-ui-final` and `crm-host-ownership-final`. Nine buttons, five EN/ZH variants and four repeatable fixtures cover the added host fields, all three currencies, custom FX, empty/full-discount/error boundaries, invalid input preservation, exact resets and snapshot roundtrips, native edits/paint, 320/390/760px controls and seven disposed owners. The SDK's default white background and official CSS are retained. Earlier failed pending-state and documentation React-warning runs remain recorded, not converted to passes. Broad in-flight cancellation, missing-unit/write-failure recovery, globally frozen SDK time, native accessibility and cross-browser acceptance still keep the blueprint partial. See `coverage.json`.

## Corrected: Custom Menu

The former SingleButtonOperation and both DropdownList operations only returned `true`; their alerts were commented out. The shared `showcase/sheets/custom-menu/code/create-demo.ts` now registers native menus with `FUniver.createMenu()`, `createSubmenu()` and `FMenu.appendTo()`. Review highlight toggles real `FRange.setBackground()` values; Approved / Needs changes update column E of selected order rows with `FRange.setValue()`. Readback comes from SDK ranges, including an actual yellow native-canvas pixel assertion. An already-matching approval does not report a change. Header/outside selection is rejected without mutation. Host selection and reset buttons use `FRange.activate()`, `disposeUnit()` and `createWorkbook()`.

`test-results/custom-menu-documentation-verified/report.json` and `test-results/custom-menu-standalone-final/report.json` pass single/multi-row actions, native context-menu operations, native Undo/Redo, boundary preservation and three resets. At 390px the native context submenu still approves an order. English/Chinese detail pages expose three variants, six actions and four states with working iframe buttons. Eight-file export/native CSS parity and real owner disposal pass separately. The earlier cold Next detail run failed on a React script-tag error; the passing rerun does not establish that cold-development issue is fixed.

The beta.2 ribbon-submenu implementation skips groups and dispatches the wrong ID for Facade callbacks. The demo exposes direct ribbon buttons and a native context submenu, without patching the SDK. This limitation remains open, alongside the blueprint's Escalate/Open supplier and empty/error variants; see `sdk-issues.md` and `coverage.json`. Eleven old plugin scaffolding files were replaced, not retained as a second nonfunctional implementation.

## Corrected: Custom Event

The empty sheet and console-only demonstration have been replaced by Aster sampling data, a second sheet, four Facade-based host controls, and a visible custom-event/readback panel. Deletion calls `FWorksheet.deleteColumns()`, guard removal disposes the actual `addEvent()` subscription, and reset recreates the unit through Facade APIs. Audit listeners stay active after removing the guard. The guard is a positional event policy, not permission enforcement. Out-of-range deletion preserves data and explains how to reset.

`test-results/custom-event-documentation-pass/report.json` and `test-results/custom-event-standalone-pass/report.json` pass actual cancellation, column data/count changes, Before/After order, native Undo, unsubscribe/resubscribe, three resets, A1/B2 native menus across two sheets, pointer targeting inside a multi-cell selection, missing-column errors and narrow-screen host keyboard actions. The documentation check additionally covers both themes and English/Chinese guide counts and working iframes. Source parity, opaque white native workbench / SDK CSS and owner disposal pass separately; see the README for exact reports. The incremental Next chunk parse failure and cold detail-page script-tag error are retained, not filtered or claimed fixed. Wider in-flight and native-menu keyboard checks remain open.

## Corrected: Custom Shortcuts

The original native binding performed a real command but had no data or in-page explanation. It also duplicated initialization in Preview and export. Swift dispatch now exposes three Facade host controls and the C3/ordinary-selection/empty/input-focus variants. Shortcut registration remains native SDK infrastructure; the command action calls the existing Facade instance's `FRange.clearContent()` instead of creating another API or returning a dummy success. Values, formulas and fill are read from SDK ranges; initial and dependent formula readback follows calculation-result application. `undefined`, `null` and empty-string values are all recognized as empty; zero remains content.

`test-results/custom-shortcuts-documentation-final/report.json` and `custom-shortcuts-standalone-final/report.json` pass native keypress clearing, formula removal, fill preservation, Undo/Redo, repeated empty actions, three resets, multi-cell drag selection, host/native-input focus isolation and narrow host controls. Documentation also verifies both themes and localized guides/iframe actions. The macOS mapping check simulates the platform in Chromium, not physical macOS. Export/CSS/owner checks pass separately; the README records the exact artifacts and retained cold detail error. Filtered/merged/protected selections and wider in-flight behavior remain unaudited.

## Corrected: Read Only

The former duplicated, unawaited read-only setup now uses one shared factory and a fictional Tide Museum timetable. Three modes distinguish hidden chrome, pointer/keyboard selection policy and editing permissions. Four buttons call Facade `setReadOnly()`, `setEditable()`, `disableSelection()` / `enableSelection()`, a retained `FShortcut` handle, and unit disposal/creation for reset. Current mode controls are disabled; permission setup is awaited and checked before interaction is released. Readback uses actual workbook and worksheet permission snapshots, selection and raw cell/formula results.

`test-results/read-only-documentation-pass/report.json` and `read-only-standalone-final/report.json` pass native read-only typing/Delete/paste, explicit F2/select-all editable counterexamples, formula recalculation, editor Undo/Redo and viewer history guards, three resets followed by native editing, and 760/390/320px host controls. Documentation also passes theme replacements and both localized guides/working iframes (three variants, four actions, four states). Export/native white background checks and pending-owner teardown pass separately. See README for exact artifacts.

Two integration boundaries are explicit: transient `inert` prevented native text input from recovering and was replaced with transition-only input-event gating; SDK viewer permissions alone did not block existing Undo history, so public Facade `BeforeUndo` / `BeforeRedo` guards enforce that host policy. The SDK-only history reproduction remains strictly failing without the guard. No SDK or background/theme defaults are patched. Failure recovery under partially rejected permission batches, broader range/sheet protection, and cross-browser/mobile editing remain unaudited; this is not server-side security or complete permission-capability acceptance.

## Corrected: Custom Formula

The empty workbook and duplicated Preview have been replaced with Juniper delivery data and a shared factory. `FFormula.registerFunction()` / `registerAsyncFunction()` own three registrations. Apply uses `FRange.setValue()`; cached/reload operations use `executeCalculation()` with separately labeled host caching; unregister disposes actual registration handles; reset uses `stopCalculation()`, `disposeUnit()` and `createWorkbook()`. The already-matching route is disabled. Scalar/table/error output comes from the SDK, not host-computed replacements. A 1x1 reference matrix is unwrapped for the source lookup; wider matrices are rejected.

`test-results/custom-formula-documentation-pass/report.json` and `custom-formula-standalone-final/report.json` pass the native calculation, spill cleanup, genuine ISERROR, missing/failure/timeout recovery, caching, native edit/Undo, registration recovery preserving edits, three pending resets and narrow keyboard checks. Both localized guides and themes work. Nine-file source/native white CSS parity and pending-owner disposal pass separately. Recovery explicitly reloads the current snapshot because plain beta.2 re-registration remains stale; Undo history is discarded, not silently reconstructed. The source is fictional and frontend-only. Cold documentation-shell errors, full external-formula integration and broader concurrency/coercion/cross-browser variants remain open.

## Corrected: Custom Header

The former setup-only example now shares a factory, original Lumen equipment data and SDK CSS between Preview and export. Six controls use actual Facade header customization, native dimensions, active-sheet switching and fixture recreation. Workbook defaults and worksheet overrides are demonstrated separately; clearing the active override does not falsely promise removal of the workbook default. Clear all preserves cell edits and dimensions. The inspector does not pretend that remembered host requests are SDK style readback.

`test-results/custom-header-documentation-pass/report.json` and `custom-header-standalone-final/report.json` pass native Canvas text/color/alignment and purple pixels, native full-row/column selection, scoped inheritance and clearing, compact-dimension hit testing, edited-cell preservation/Undo, three resets and narrow keyboard interaction. Both themes and localized guides (five variants, six actions, four states) have working iframe actions. Eight-file source/native-white-CSS parity and seven-owner disposal pass separately. Reset explicitly clears rendering configuration in addition to recreating cell data, after strict tests showed stale headers surviving unit replacement. Header labels are positional; printing, arbitrary structural edits and wider cross-browser behavior remain unaudited.

## Corrected: Find and Replace

The setup-only fixture and duplicated Preview are replaced with a shared factory and original two-season seed library. `createTextFinderAsync()`, the three match-option setters, all/current/next/previous matches, single/all replacement, range activation, sheet switching and reset are demonstrated with real SDK readback. Buttons wait for Steady, which is when the provider registers, rather than the earlier canvas mount. No-match actions and replacement of calculated values are disabled. Whole-active-sheet search explicitly collapses prior multi-cell selection to A1; formula-text mode can edit the formula itself. Every replacement target has actual before/after values and formulas, in addition to the SDK return value.

`test-results/find-replace-documentation-responsive/report.json` and `find-replace-standalone-responsive/report.json` pass native matching, formula updates, repeated-text removal, actual Undo/Redo, other-sheet preservation, three resets, drag-selection boundaries, native Ctrl+F, narrow/fresh-mobile use and per-action native white/CSS checks. Both localized guides and live-iframe replacements pass in documentation. Exact eight-file source parity and eight-owner teardown, including one held search completion, pass separately. Native advanced scope controls, internal finder-resource cleanup, error/empty workbook variants and the broader operations-workbook blueprint remain open in the coverage ledger.

## Corrected host actions: Cell Notes (SDK acceptance remains partial)

Riverside replaces the generic scaffold with four distinct notes on two original textile/storage sheets. Preview/export share `getNote()`, `createOrUpdateNote()`, `deleteNote()`, range activation, sheet switching and snapshot recreation. Read is explicitly read-only; identical/blank Apply is disabled; missing-note actions are disabled. Range writes target only the top-left cell. An independent C4 note and all cell values survive B3:C4 writes/deletion; E6 can hold a note without a value. Eight exported files include both SDK stylesheets and scoped host controls.

`notes-standalone-history/report.json` passes with the explicit status `passed-with-known-sdk-defect`. It verifies rendered popup dimensions/text, hover/pin, two-sheet resources, native model history, actual SDK events, three resets and keyboard/mobile actions. `notes-native-undo-strict/report.json` remains failing: native Undo changes the model without refreshing the visible popup. Direct Facade writes bypass history and also leave existing popups stale, so Apply/Resize disclose their public-Facade unpin/reopen workaround. Interleaving host pin writes before Redo has a retained failing run; the passing sequence is uninterrupted native history followed by reopening. Do not claim complete history semantics.

Exact export CSS/source and eight-owner teardown pass separately. Native pending-debounce teardown, hover-popup refresh, native resize gestures and fuller accessibility remain open. This is not the distinct comment-thread or revision-history blueprint.

## Corrected host actions: Hyperlinks

Driftwood preserves and explains external URLs, whole-sheet/range/defined-name links and two rich-text spans, with original two-sheet harbor data. The original URL suffix concatenation is removed. Shared Preview/export buttons use `setHyperLink`, `updateHyperLink`, `cancelHyperLink`, `getHyperLinks`, `getUrl`, `getUrlOfDefineName`, `parseSheetHyperlink`, `navigateToSheetHyperlink`, range activation and snapshot recreation. Actual boolean results and cell data are inspected; native range navigation is read through `getActiveRangeList` because it may have no primary cell. Unavailable and identical writes are disabled. Missing defined names throw through the real Facade before any mutation; host invalid-URL rejection preserves both sheets.

`hyperlinks-documentation/report.json` and production `hyperlinks-selection/report.json` pass popup/new-tab URL preservation, actual internal selections, rendered labels, native Undo/Redo, rich-text boundary behavior, all host actions, resource reload/reset and narrow keyboard navigation. Localized guides and their actual iframe navigation pass in documentation. Eight-file native-white CSS/source parity and eight-owner teardown pass separately. These are exercised paths, not full capability acceptance: strict `hyperlinks-enumeration-sdk/report.json` fails because the Facade returns one of two links. Native popup editing, second-span native clicks, interruption during void-returning navigation and wider accessibility remain open.

## Corrected host actions: Row and column outlines

The setup-only sample now shares one original 120-order factory between Preview and export. Buttons call public `addRowOutline`, `addColumnOutline`, `setDimensionOutlineCollapsed`, `removeDimensionOutline`, `clearDimensionOutlines`, `getDimensionOutlines`, `save`, `disposeUnit` and `createWorkbook`. Chainable worksheet returns are not success booleans: status compares real group/visibility state, while readback includes actual values and hidden dimensions. The command picker resets after use, so native edits cannot leave a stale preset that cannot be reapplied. Missing group, duplicate and invalid host-input actions are disabled. Boundary requests intentionally reach the actual SDK and verify native rejection.

`outlines-documentation-final/report.json` and `outlines-standalone-final/report.json` pass all eight host buttons, live group selection, four detail presets, native level control, collapse/add/clear Undo/Redo, nested preservation, adjacency, row/column custom ranges, empty/error states, resources, resets, responsive keyboard interaction and native CSS. Removing a collapsed group retains hidden columns, so the guide explicitly does not promise unhide. Both localized guides and their live iframe action pass in documentation. Exact eight-file export parity and seven-owner teardown pass separately. Native eight-level limits, structural edits, full native accessibility and cold-shell warning resolution remain open.

## Corrected host actions: Crosshair Highlighting (SDK event acceptance remains partial)

The former empty scaffold and duplicated bootstrap now share original two-week rehearsal data and eight meaningful host actions. Enable/Disable call `setCrosshairHighlightEnabled` and inspect `getCrosshairHighlightEnabled`; already-satisfied requests are disabled. Sample/Go use `getRange().activate()` and public viewport scrolling, week switching calls `setActiveSheet`, Reload uses `save` / `disposeUnit` / `createWorkbook`, and Empty/Reset explicitly recreate the owning instance. Current selections and full cell data come from SDK readback, not a host mirror. The native palette is exposed as native UI, not attributed to an absent Facade color setter.

`crosshair-documentation-mobile/report.json` and `crosshair-standalone-mobile/report.json` pass with explicit known-defect observation. They require actual band/opacity pixels, no tint on the active cell, no cell-format writes, native drag/keyboard selections, shared instance state, native editing/recalculation preserved through Reload, invalid endpoint/bounds rejection preserving edited data, genuine empty/reset behavior and narrow keyboard navigation with the target column visible. The documentation run also verifies EN/ZH 8/8/5 guides, tree interaction and real iframe toggle. Exact eight-file export/native-white CSS and seven-owner cleanup pass separately.

The strict `crosshair-standalone-strict-mobile/report.json` remains failing: the palette enables rendering without delivering the declared EnabledChanged event. The readback also listens to public CommandExecuted to show current state, but never manufactures a missing event. Native accessibility, disjoint selections, frozen viewports and cross-browser behavior remain unverified. This correction is not certification of the separate general-selection blueprint.

## Corrected host actions: CSV import with Facade

The old custom mutation/undo-stack implementation is removed. `createMenu` / `appendTo` registers a native Open CSV action that stages a local file; `FRange.setValues` writes explicitly typed text to a validated destination. Current selection, cell types/values/formulas and backgrounds are read from Facade. Host parsing, file download and draft editing are labeled separately from SDK capabilities. Native Undo restores values/formulas/backgrounds, although the SDK normalizes implicit types and inline styles to explicit types/style IDs; raw snapshot equality is not claimed. No service injection, fake import API or custom history stack is used.

`csv-documentation-multiline/report.json` and `csv-standalone-multiline/report.json` pass actual file chooser, all parser fixtures, formula-like literal text, multiline canvas paint, range write, native Undo/Redo, style/outside preservation, boundaries, same-file re-selection, cancel-handler preservation, resets and keyboard/mobile use. Documentation also verifies both themes, both localized guides and live iframe imports. Its shell's identified Next server-action requests are recorded separately from the forbidden editor upload requests. Exact ten-file source/CSS/type-package export and eight-owner/pending-read cleanup pass separately; see README for exact commands and artifacts.

This is not the full Exchange import/export blueprint or certification of OS-dialog cancellation, arbitrary CSV dialects, protected/merged destinations or broader native accessibility. The original unsafe `split(',')` behavior is replaced by the installed parser, with explicit local limits and UTF-8 validation.

## Corrected host actions: cell and floating images

`sheets/images` shares one exported factory with its Preview and includes Core/Drawing CSS. Original wide, square and portrait assets replace repeated remote avatars. Public builders, insertImages/updateImages, placement/layer APIs, cell-image APIs and native Undo/Redo drive visible changes; Inspect reads current Facade state. Local file staging and JSON snapshot download are labeled host actions, not invented SDK APIs. Narrow layouts reveal the selected image through native scrolling without rewriting its position.

Direct setCrop/setRotate/setSource fail the independent installed-SDK Undo regression; initial browser crop/rotation checks also failed native paint. The corrected host deep-clones builder data and uses updateImages, which passes the tested paint/history variants. Forced row heights demonstrate clipping explicitly. Redundant sheet activation was removed; actual native sheet switching is tested separately.

Strict acceptance still fails absolute-placement snapshot reload and SVG download filename matching. Downloaded SVG bytes are verified exactly, not merely a download event; the native .png filename is visibly disclosed and not silently patched. Explicit known-defect observation runs continue other checks but do not certify those invariants. Format/anchor combinations, remote-source failures and full native accessibility remain unverified.

## Corrected host actions: cross-workbook formulas

`sheets/cross-workbook-formula` replaces the internal-service/global-state switcher with public setCurrent and a shared exported factory. Source fields write through setValue/clearContent; six reference variants target Summary B4, while the unchanged summary graph exercises range, multi-source and transitive formulas. Both formatted and raw Facade results are shown. No host-computed totals or remote link simulation is used.

The strict browser checks verify source edits, actual native cell input, native paint, per-workbook Undo/Redo, zero/blank/text/error outcomes, unload/restore, downloaded snapshots, reload with edits preserved and repeated reset. Recalculate observes an actual calculationResultApplied event; Inspect reads fresh SDK data without modifying it. The SDK's missing-worksheet result is #NAME?, distinct from missing-workbook #REF!, rather than a fabricated common error.

Reload and Reset rebuild the owner to clear per-ID history, since unit disposal alone did not do that. JSON download and input validation are explicitly host integration; source lifecycle uses public save/create/dispose APIs. The feature is distinct from async host functions and file-based external-reference updates. Native keyboard/screen-reader coverage, arbitrary reference transformations and cross-instance/network sources remain outside the current verification.

## Corrected host actions: Custom Canvas

`sheets/custom-canvas` now uses one shared factory for Preview and export. Main/row/column layers register through public Facade with disposable handles. Bars/dots are real SDK Canvas extension paint, not DOM imitation, success messages or host-computed cell values. Registration does not change workbook data. Raw and display readbacks are separate from explicitly labeled host configuration. Write, clear, literal text, row/column sizing and visibility, freeze, scroll, zoom and worksheet switch use native APIs; real cell editing is also tested. Inspect reads SDK state. Download uses save() JSON. Reload/reset replace the owner, preserving data only when requested and reattaching default renderers.

The standalone ten-group and documentation eleven-group strict runs verify actual pixels, removal/reapplication, native editing/history, varied inputs and invalid-input rejection, worksheet scope, geometry, real downloaded bytes, fresh reload, responsive layout, themes and keyboard actions in both localized iframes. A whole-column native selection tints the bar colors; tests deselect with the native name box before comparing unselected pixels. Native UI styles are never replaced with host control styles. Rendering functions are not serialized workbook objects, and this demo does not pretend to provide custom editors or print/export parity. Broader geometry/accessibility/rejection combinations remain open.

## Corrected host actions: protection shadows

`sheets/permission` retains the original no-shadow protected worksheet and adds six real worksheet/range profiles versus four public shadow strategies. Profile changes await rule removal/creation and permission points; actual rules and cell permission getters are reported. Shadow actions call the SDK strategy setter/getter. Native cell input proves allowed and denied editing independently of host preflight; host Write/Clear uses canEditCell and real range mutations. Explicit numeric bounds are necessary because the busy disabled fieldset bars browser checkValidity. Selection, sheet switching, inspect, JSON download, empty and reset have observable native effects; there are no alert-only controls. Export and Preview share handlers and Core CSS.

The strict matrix compares actual texture pixels and unchanged data, then tests mixed-range editing, formula updates, invalid input, separate notes, JSON contents, reset, small hosts, localized iframes and keyboard activation. Pending authorization is held in a separate ownership test: native input is gated and destruction waits for settlement. Protected data is still locally loaded and exposed by developer readback/download; no server-security, password, collaborative backend or permission-history guarantee is implied. Wider command and rejection cases remain in blueprint 036.

This audit has corrected host implementations in twenty cases; disclosed SDK gaps remain. It does not certify the other 62 cases. Existing tests need review against these requirements.

## Corrected host actions: Sheets Charts

Historical control-panel evidence below predates the native worksheet gallery.
The new revision removes these host controls and requires fresh native interaction,
export and lifecycle acceptance. The atomic-history SDK regression remains in scope.

The former four-chart initializer now shares native builders and actual Facade handlers with its exported project. Six chart variants, rectangular/year-vector sources, numeric/missing source writes, independent title/palette/legend setters, size, native scrolling, multiple-chart selection/removal, PNG and workbook JSON all have observable model/render/download checks in `scripts/test-sheet-charts.mjs`. No host chart library, private service or fake exported illustration is substituted. Preview/source/export include identical Core/Drawing/Advanced CSS and authored scoped controls.

The first history test found that full FChart.update creates three history steps despite its documented one-step contract. `--atomic-history` remains a strict failing regression; the normal suite explicitly tests that boundary. Style and Size now use direct single-property setters and pass individual Undo/Redo checks. Host Undo/Redo still call the SDK exactly once, reporting unavailable history or unchanged snapshots instead of falsely promising a visible change. Full variant/source updates disclose their multi-step limitation. Removing a chart does not remove cells, Empty preserves labels/station data, and Reset uses a new workbook ID. Broader types/options, native accessibility, export-equivalence, reload and SDK history/type-declaration defects remain partial in blueprint 027.

## Corrected host actions: Sheets Shapes

Historical control-panel evidence below predates the native shape gallery.
The current revision replaces these host controls with visible worksheet variants;
old button/readback results do not establish current rendering or native interaction.

The original create-only example no longer switches sheets on a timer. Its native shape workbench shares the exact exported handlers and Core/Drawing/Advanced CSS. `insertShape`, `setShapeData`, custom-path/adjustment, fill/stroke/text setters, transform/order/visibility/selectability and `FSheetShape.setPlacement` are linked to explicit controls and live SDK readback. Connections resolve actual sites through `getConnectionSites`; route, arrows, binding and unbinding use `FConnectorShape`. One-cell/two-cell/absolute behavior is checked using rows before and within Intake. The image is original inline SVG, not a remote service or host rendering substitute.

`scripts/test-sheet-shapes.mjs` verifies stable IDs, actual native canvas changes for preset/fill/text/order/visibility variants, binding-dependent node movement, geometry/history/error preservation, native cell edits, real downloaded JSON, snapshot reload, Empty/Reset, reference-sheet navigation, small hosts, themes and localized keyboard/iframe behavior. The existing reference data remains intact. Returning from custom geometry explicitly clears that geometry through public setShapeData; no silent ineffective preset button remains. Connector route arrays contain intermediate points, so endpoint getters are also checked. Multi-setter actions are not atomic Undo transactions; selectability is not protection; JSON is not XLSX. Blueprint 037 retains native interaction, structural, rendering/accessibility and stalled-operation gaps.

## Corrected host actions: Sheets Big Data

The former load-only case allocated ten million coordinate strings during module import, duplicated initialization and exposed no operation. It now shares a sparse deterministic fixture, owning factory, Core CSS and all handlers between Preview/export. Capacity, rectangular window load, far navigation, bounded numeric write/clear, one-step history, inspect, sparse JSON, fresh-ID reload, content Empty and Reset call public Facades. Host position/data generation and API-call timing are labeled integration, not SDK incremental loading or an FPS result.

`scripts/test-big-data.mjs` checks one-million-row extent with only 100 initial records; 250/1,000/5,000 × 10 writes; native canvas text and viewport at top/middle/bottom; zero/missing/negative/decimal values; row-count history; native keyboard input; downloaded bytes; stable snapshot reload; empty/reset; invalid inputs; small hosts; themes and localized iframe keyboard controls. The capacity handler normalizes selection and clears tracked out-of-bounds window tails before beta.2 `setRowCount`, rather than leaving inaccessible data or a crashing active-cell read. This multi-command host action is explicitly non-atomic. Broader performance, resident-data, structure, accessibility and failure matrices remain partial in blueprint 032.
