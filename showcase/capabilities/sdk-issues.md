# SDK observations requiring follow-up

## Northstar QBR: notes keyboard focus

`test-results/qbr-native-interaction-parity/report.json` is strict 15/16. Notes
save through the actual textarea and Save button. Immediate Ctrl+Z/Y while focus
remains in that area does not route to presentation history. Selecting the
painted title shape before the shortcut passes exact notes Undo/Redo; do not
describe this as absent notes history. Native title editing/full histories,
same-ID owner reconstruction/fresh editing, empty restore and both initial
locales pass. Prior harness-only missing heights and a guessed Chinese label
are corrected in the parity run, without changing SDK or production source.

## Harbor quotes and content pipeline: native-only regressions

- Quotes: `test-results/modern-quotes-native/report.json` is 26/30 strict gates,
  with 23/23 literal examples. Combined-style and text-color Undo return false;
  append Undo splits the VOICE color run at 348. The native floating quote toolbar
  does not open at the tested actual VOICE bounds. Its pointer root cause is not
  isolated; native Grid insertion works and does not certify the floating menu.
  Full native typing/insertion histories, same-ID edited/empty reconstruction,
  six EN/ZH packs and model-preserving themes pass selected checks.
- Content pipeline: `test-results/content-pipeline-native-final/report.json` is
  9/12 gates, 38 checks. Native state editing followed by view switching leaves
  status/cellData/updatedAt unchanged on Ctrl+Z; a separately canvas-focused
  toolbar Undo/Redo path passes. Calendar places the 5 September 2026 webinar
  under Friday instead of Saturday. One Next from the initial August 31 anchor
  opens October, skipping September. Native record creation, text, Kanban drag,
  date drag and corresponding complete histories pass. Date drag writes the
  SDK-supported serial 46271; Undo restores original milliseconds exactly.
  No data normalization, calendar replacement or SDK patch hides these failures.

## Riverside plain notes: current native-only evidence

`test-results/sheets-notes-native-complete/report.json` is strict 43/48 gates.
Native text Undo restores the complete serialized model but leaves the mounted
textarea showing edited text. Native resize Undo restores 220x110 in the model
while mounted geometry remains 300x160. Direct Facade text/size writes also leave
the mounted popup stale; direct mutations do not enter native Undo history.
No automatic reopen hides these five failures. Native text/resize/pin/delete
full raw snapshots and same-ID save/empty/restore pass, as do all 25 literal
examples. Plain notes must not be described as threaded review comments.

## Current Cedar, Tide, Harbor and CRM observations

- Cedar images: test-results/sheets-images-native-acceptance/report.json is
  52/68. Four raw history comparisons differ only in serialized resource key
  order; separate complete parsed-resource equality passes and the raw failures
  remain. Direct crop/rotate/source still fail nine paint/history assertions.
  SVG download preserves SVG bytes but names the file .png. Absolute placement
  reload adds 46px/20px header offsets and changes the full model. Native drag
  and real property width editing paint correctly. One Canvas readback warning
  is retained; there are no observed runtime errors or backend requests.
- Tide callouts: test-results/tide-callouts-native/report.json is 34/38. Padding
  leaves actual glyph inset/fragment height unchanged. Facade append Undo splits
  the RISK color run at offset 407; delete Undo loses the tide-risk resource;
  isolated text-color Undo returns false. Native background-menu and text-input
  histories pass full models separately. The initial 0-word screenshot was
  native statistics debounce: the finish report/capture waits for actual 188
  words without changing SDK time or counting text itself.
- Harbor page setup: test-results/harbor-page-setup-native-final/report.json is
  8/11. No native Orientation control exists in the dialog; tested Facade and
  startup landscape variants are not a replacement claim. FDocument.undo()
  returns true but leaves annotation margins 96/96/120/120 rather than the saved
  50/60/90/40. Initial native typing Undo adds three empty body arrays; Redo adds
  customBlocks. Native Letter/margin toolbar history and post-reconstruction
  new input/history pass complete models on their own paths.
- Northstar CRM: test-results/crm-quote-native-verified/report.json is 28/29.
  Native Undo restores 48 seats but adds cellData[3][1].t=2; Redo equals the full
  edited snapshot. No type normalization is applied. The initial format-only
  stale host amount was an integration bug, now fixed by CommandExecuted
  readback without fake calculations. First-run fieldset/mobile failures were
  test predicates, not SDK defects: inspect the disabled property/actual inputs,
  and expect the preserved Business draft's pricing rather than Enterprise.

## Current Mosaic, Cobalt and connector observations

- Mosaic lists/tasks: test-results/mosaic-lists-native/report.json is strictly
  32/35. A level marker change followed by a single-item change leaks into LIGHT.
  Native bullet conversion Undo changes OPEN's para_mosaic_12; native checkbox
  Undo changes KEYS' para_mosaic_20. Actual glyph/check rendering passes, while
  full Undo fails and the following Redo is not certified. Exact native text
  history and same-ID snapshot recreation/empty restore pass without ID repair.
- Cobalt ordering: test-results/slides-cobalt-order-native-final/report.json is
  13/16. Thumbnails have no focusable role/tabindex; Enter/Space cannot navigate.
  Ctrl+Z immediately after thumbnail drag or menu Delete does not undo before
  the canvas focuses the document. A separate real canvas click enables native
  toolbar history, whose full model checks pass. Host section tags do not create
  native sections, folding or atomic history.
- Board connectors: test-results/connector-native-complete/report.json is
  31/32. Native source-lint label editing changes its text but resets offset.y
  from -58 to 0 and discards the prior fill/lineBreak/lineGap style. The displaced
  label is visible in native-label-edited.png. No relocation patch hides it.
  A separate free-endpoint drag checks complete before/after/Undo/Redo snapshots;
  Undo removes the derived fallbackPoint and Redo equals the full changed model.
- Atlas Product Brief: test-results/product-brief-native/report.json passes
  17/17 selected checks. Earlier input probes incorrectly subtracted one from
  paragraph endOffset, treated '/' as neutral typing rather than a slash-menu
  trigger, and expected unhyphenated fillText for a wrapped title. Their retained
  diagnoses explain corrected test predicates. Exact model and visible-paint
  checks remain; no SDK failure or full native menu acceptance is inferred.

## Frontend conversion and Print boundary

Source-only six-product evidence is in
test-results/frontend-exchange-print-capabilities/README.md and report.json.
Standard Exchange snapshot and unit conversion use HTTP upload/import/export/task
and signed-file routes. No official local browser binary converter was found in
the bounded source/API search. Five products have browser-native Print source;
Base-specific Print remains unestablished. Missing installed product packages
are documented separately from checkout availability. No upload, runtime test or
SDK patch was performed for this source audit.

Asteria financial-report removes its old remote path and redundant host controls;
test-results/financial-report-native-verified/report.json passes 24/24 selected
native/local-JSON gates. This creates no claim of binary PDF conversion, Print,
threaded comments, auditor opinion or full first-wave acceptance.

## Current calibration sorting and Ridgeway image observations

North traditional typesetting adds twenty literal examples and measured native
three-page layout evidence. `test-results/north-typesetting-native/report.json`
passes 21/25 gates. Literal Undo/Redo adds `customBlocks: []`; native text Undo
adds empty `customBlocks/customDecorations/customRanges`; native alignment
Undo changes two paragraph IDs. The report compares complete models without
normalization. These structural differences are not claimed to be lost prose.
Actual thirteen layout variants, real text/center paint, full preset EN/ZH,
initial Chinese, theme ownership and rebuilt canvas pass selected checks.

Tern Slides recovery initially passed 13/13 gates; the subsequent selected run
is strict 12/13 because a restored review title intermittently only selects
on double-click without opening the native text editor. The target is under
bounded activation/timing diagnosis, not yet established as an SDK defect.
Complete review/audience snapshots and all page paints still pass. Retain the
latest strict run rather than citing only the earlier green result. See
`test-results/slides-tern-roundtrip-native/report.json`.

The bounded diagnosis is now complete, without a fix claim. The immutable failing
run and diagnosis remain in
test-results/slides-tern-roundtrip-native-activation-failure-20260907/. Three
subsequent activation probes pass 13/13; they do not supersede the strict failure.
The SDK hit-test uses a 300 ms Date.now interval and matching element identity,
not DOM dblclick detail. The failing run lacks handler timing; first-click work
is only a hypothesis. Probe 3 captured a 38 ms pointer interval, not internal SDK
handler timing. No clock, activation threshold, SDK package or test retry hides
the missing editor.

- Calibration Base sorting is strictly 4/7 gates PASS in
  `test-results/calibration-sort-native/report.json`. Elm's stored null score
  paints as 0.00. Updating Meridian from 82 to 98 through either native typing
  or Facade updates its painted value but leaves it fourth in both projection
  and canvas order, below three 95-point records. Reconstructing the complete
  edited owner calculates the correct new order; this does not fix live sorting.
  Native sort/cell Undo/Redo restores full snapshots. Six sorting variants,
  ten literal examples and exact edited-owner recovery have selected evidence.
- Ridgeway PDF images are strictly 20/24 gates PASS in
  `test-results/pdf-image-native-verified/report.json`. The image-removal
  recipe throws an atomic mutation batch error; its dependent Undo is not
  accepted. Native dragging visibly moves the image and native Undo/Redo
  restores its pixels, but the image Facade transform remains at 72/145 points
  after forty frames. Native Properties X editing does update both model and
  pixels. Selected-image Properties and the context menu expose no Crop image
  control; actual left/right/full crops through the Facade are verified
  separately. These are three distinct native functionality/consistency gaps,
  not four independent SDK bugs merely because four test gates fail.

Both cases now contain only native workbenches, complete EN/ZH dependency packs
and model-preserving theme changes. Nine-file production exports include four
and five official CSS imports respectively and pass source parity, opaque white
SDK UI and absence of startup overlays. The scoped tests observed no browser
console errors, warnings or backend requests; captured command exceptions still
fail their gates. No SDK source, host comparator, fake crop control or model
normalization was introduced.

## Current Partner / headings / ink / Rivet recovery observations

- Partner Base filters: `test-results/partner-filter-native/report.json` passes
  6/7 gates, including actual native filter and cell history. Native editing of
  an existing OR/greater-or-equal filter changes the configuration to AND/is.
  The exact before/after filter is retained in `native-or-edit.json` beside the
  report. Twelve literal Facade recipes and full-owner recovery do not fix this
  native editor round-trip. The ninety-record/nested-condition requirements remain.
- Lumen modern headings: direct authored paragraph font overrides conflicted
  with named heading styles. Removing those overrides fixes the integration:
  native Heading 3 now paints 16pt glyphs as its menu indicates. All 21 literal
  examples pass selected checks, but native heading-format Undo changes the next
  paragraph ID. Strict full equality fails in
  `test-results/lumen-headings-native/report.json`; format Redo after that failure
  is not certified. No paragraph-ID filtering hides the difference.
- Meridian PDF ink: native Properties X editing changes left from 50 to 75pt
  and moves the selection bounds, but the red ink paths/pixels remain unchanged
  even after forty frames. Native Undo restores the model. This is the only
  failing gate in `test-results/pdf-ink-native-review-verified/report.json`
  (19/20 PASS), not a claim that the ink moved because its Facade did.
- Rivet: the original 20-step unit-only reconstruction still fails to attach a
  main canvas. A fresh/simple delete-create probe passes, so it is insufficient
  to disprove the continuous-flow failure. Full-owner snapshot recovery now
  passes actual eight-page navigation and fresh native editing/history for
  edited/deleted-page/Chinese-dark states. The empty deck remains empty, but the
  SDK removes a stale activeSlideId; the complete comparison remains FAIL.
  `test-results/rivet-size-recovery-verified/report.json` passes 23/25 gates.
  Early recovery tests typed before the native text editor mounted; waiting for
  its paint boundary corrected the test, without SDK changes or forced events.

All four new native runs observed no browser errors or backend requests; those
facts do not waive their command/model/rendering gate failures. Independent
exports pass in `test-results/native-filter-heading-ink-recovery/export-ui-final/report.json`.

## Current Lumen / Tern / Rivet native-only evidence

Lumen Base lifecycle now has 29/30 passing selected gates in
`test-results/lumen-native-final/report.json`. The remaining strict gate records
first-row Person canvas text `nia, imani` alongside the correct display-name
directory. Native picker writes, exact full Undo/Redo, 20 literal table recipes,
complete saved-owner reconstruction with new edits, checkpoint, four datasets,
initial/active disposal and theme preservation pass. This does not resolve the
older existing-table reorder gap. The initial migration test's clipped-text,
first-saved-table expectation and invalid setName return-value assumptions were
test/README mistakes, corrected without an SDK patch; setName throws on invalid
input in the currently installed package.

Tern Board lifecycle remains strict FAIL in `test-results/tern-native/report.json`:
native sticky Ctrl+A replacement retains two old paragraphs and emits one SDK
null `getSnapshot` error. Standalone-heading Undo retains edited textData and
changed width/height; the complete comparison reports 38 differences including
serialized pages/slides aliases. Actual sticky Undo/Redo and heading Redo pass,
as do pointer/ArrowRight history and full owner reconstruction. These narrower
passes do not waive native content/history defects. The missing InkUI direct
dependency was a documentation integration gap: exact beta.2 EN/ZH/CSS are now
declared and included, with no SDK source or installed package edits.

Current Rivet visual evidence is in `test-results/rivet-size-native-visual/report.json`:
sixteen of seventeen selected gates pass. The published recreation recipe still
preserves the model but fails to attach the main canvas within 12 seconds.
Twenty-four native NoFill/NoLine text shapes now pass full native text Undo/Redo,
alongside actual sizes/geometry, rotated overflow and two-step size/drawing history.
The older `rivet-size-native-acceptance` report preserves a different legacy Text
path's edited-textData Undo failure; current shape-text success does not fix that
SDK path or certify every text element. No SDK patch was made.

An independent verification bug was found by looking at the Aster PDF export
screenshot: the generic source/CSS test accepted a canvas painted underneath a
native startup skeleton. The verifier now waits for the actual SDK
`workbench-skeleton-content` to disappear before taking a screenshot. Earlier
overlay-covered images are not usable UI evidence despite a passing report.

## Native-only Base migrations: current visual and integrity boundaries

Bracken's test-results/bracken-native-final/report.json covers 23 literal snippets,
eight real canvas formats, native typing/history, sidebar navigation, five full
EN/ZH packs, whole-owner theme preservation, selected recreation and data variants.
Strict FAIL retains a string after numeric schema conversion, an invalid numeric
default accepted unchanged, and null stored values visibly painted as 0.00.
No unexpected console errors, warnings or backend requests occur.

The arts-festival test-results/record-lifecycle-native-acceptance/report.json runs
20 literal examples and actual cell input/history with complete model comparison.
Attachment insertion Undo retains resource entries. After same-ID recreation the
model restores 30 records but the native view remains empty. Native Add form
submission did not produce the expected extra record; its cause has not been
isolated, so it is an unaccepted interaction, not an established SDK diagnosis.
Complete locale/theme/disposal checks pass; initial EN/ZH and visible startup
failure alerts have separate evidence. Both demos export nine exact source files
and four official stylesheets. Old fixture panels/handlers are removed, not hidden.

## Beacon: correct formula values can coexist with a lost Slides workbench

test-results/beacon-formula-verified/report.json records eighteen literal cases,
eight native Formula Shape values, actual four-page main-canvas checks and native
Sheet/Base keyboard input. Top-level Base Facade writes remove the Slides host;
two subsequent Sheet writes mutate their values and then throw in auto-height.
These are thirteen failing gates, not a successful source interaction. Seven
independent Sheet variants and both native keyboard paths repaint all four pages.
Twenty-two complete EN/ZH packs, three-owner themes and disposal pass; releasing
the owned units before Univer clears the earlier disposal warnings. Command
exceptions are retained separately despite zero console errors. Eleven-file
official-CSS export passes. Full focus/lifecycle/persistence/conversion and native
action coverage remain open; no SDK/package edit or substitute calculation.

## Harbor and Delta: new evidence does not remove native integration gaps

Harbor's eighteen complete EN/ZH packs, six published snippets, full-model themes,
native host tabs and disposal pass selected checks. Its strict
test-results/harbor-native-final/report.json retains blank passive Float content,
source fullscreen keyboard input overwriting host VLOOKUP, and source Print
throwing on a missing target render. Removing early floating cleanup did not
repair printing and that experiment was reverted. Source/CSS export passes.

Delta's test-results/delta-roundtrip-native/report.json preserves authored content
and fresh formula updates through three native two-owner reconstructions. Nine
invalid inputs preserve the old owner; unavailable bindings and ZH/dark survive.
Strict full equality still fails on five drawing transform defaults, empty
defined-name serialization and embed updatedAt. No normalization hides them.
The current eleven-file rebuilt source/CSS export passes. Neither result is
complete integration acceptance or an SDK patch.

## Sable native-only migration retains unknown-option integrity failure

The fixture/readback panels and duplicate editing/history handlers are removed.
test-results/sable-native-current/report.json runs fourteen literal examples,
actual native single/multi pickers with exact model history, chip recoloring,
five complete EN/ZH packs, theme preservation and disposal. There are no browser
errors/warnings/backend requests. Strict FAIL still records the real unknown-ID
write accepted by beta.2; the explicit repair writes a valid ID, not a hidden
sanitizer. The existing used-option deletion defect remains open. Old host-control
reports do not certify the new native-only UI or full field-editor coverage.

## Juniper: selected native Tab checks pass; Print must verify paper paint

test-results/embed-juniper-formula-paper/report.json passes twenty-two literal
snippets and six selected gates. Fifteen Formula Shapes follow shared assumptions
and independent scenario multipliers; three real connector routes retain their
shape-site bindings. Native Sheet keyboard/exact history, Board text Facade/exact
history and source isolation, errors/repair, fifteen full locale packs, model-
preserving themes and active-Board Tab disposal pass with no browser errors,
warnings or backend requests.

The initial source Undo added an implicit font-color style; declaring original
input colors makes the complete Sheet history match. The first Print capture
only waited for dialog readiness and showed a not-yet-painted paper. A subsequent
test incorrectly excluded every canvas inside the demo root, including the native
Print portal. The corrected gate identifies the A4 paper and checks original sheet
text plus current 175/22 inputs. Actual paper screenshots show the updated content.
This is a test-timing/targeting correction, not an SDK rendering workaround.

Full saved reconstruction, another valid source, the complete native pointer/
formula-editor/menu matrix and actual conversion/delivery remain open. No SDK or
package edits were made; native licensing notices are retained.

## Delta: selected native Float checks pass; full capability matrix remains open

test-results/embed-delta-formula-native/report.json passes twenty-one literal
examples and six selected gates. Thirteen Formula Shapes track six Sheet inputs;
three rendered connector routes retain shape-site bindings. Formula error statuses
match native values, unlike the documented Doc inline classifications. Real Sheet
typing/exact history, Board text Facade history/source isolation, Sheet Print,
fifteen complete locale packs, theme round-trip and fullscreen disposal pass without
browser errors, warnings or backend calls. This does not certify all Board native
pointer/editor/menu paths or saved reconstruction.

The first source-keyboard test failed before typing because it located the canvas
while the child was active and did not exclude every embedded canvas. Returning to
the Sheet and excluding [data-embed-id] canvases makes the actual source-cell click
and serialized Undo/Redo pass. This is a test-target correction, not a UI bypass.
The host Sheet Print dialog owns the correct worksheet, but child Board output
fidelity and actual conversion are not established. No SDK or package edits.

## Ember: source rejection, native Doc focus and formula popup boundaries

test-results/embed-ember-formula-final/report.json executes twenty literal examples
in native Doc@Base Tab. Eighteen source steps preserve the full authored body and
update twelve current-canvas results. Base keyboard input and exact history, actual
Doc content-click/type/body history, ten complete locale packs, themes and active
Doc disposal pass. No unexpected browser errors, warnings or backend requests.

Base Number fields reject text with false and an SDK invalid-number console error;
the source and document remain unchanged. The deliberate rejection is retained in
expectedRejections. It is not silently converted to zero. Missing-source binding
produces eleven #VALUE! results, while COUNTA counts the error as one non-empty
value. This must not be presented as a reliable record count. Twelve native error
results across the sequence still report success/string.

Selecting the Base table-list item alone does not focus document text. An initial
test wrongly expected subsequent keyboard Undo to undo a Facade paragraph edit;
raw snapshots show both owners unchanged. The final test verifies this boundary,
then verifies actual click/type/Undo/Redo with source isolation. A slash in the
typing probe invoked the modern Doc command menu; the ordinary-text history probe
now avoids that command. Neither observation proves native typing is broken.

Explicit FDocument Undo preserves authored content/IDs/formats but full snapshot
equality fails on lastValue caches; full Redo equality passes. Both EN/ZH formula
editor Number format buttons are intercepted by a child-popup layer after stable
bounds. No force click, DOM-dispatch bypass, result override or SDK/package patch.

## Cypress: native Doc Tab values pass; popup pointer and cache gates remain open

test-results/embed-cypress-formula-current/report.json checks twenty-three literal
examples and thirteen native inline results, alternating source edits while the
Sheet or Doc Tab is active. Nineteen edits preserve the complete authored body.
Eighteen native error values still report success/string. Source keyboard input
and exact history, Print preview/cancel, Doc review-line editing, fourteen complete
EN/ZH packs, whole-model themes and active-Doc disposal pass selected checks.

Both EN/ZH Number format buttons in the formula editor are intercepted by another
child-popup layer after stable bounds. This remains a real pointer-path failure;
the test does not force-click or dispatch synthetic DOM clicks to pass it. Packs
are compared leaf-by-leaf separately, so loading locale keys is not conflated with
successful native interaction.

Unlike the tested Saffron Float sequence, Cypress Tab keyboard Undo restores the
Doc's authored body without modifying the host Sheet. Full Undo snapshot equality
still differs in DOC_FORMULA_PLUGIN lastValue caches; full Redo equality passes.
The strict failure is recorded before separate authored-state assertions. Raw
snapshots are retained. No application result override, SDK edit or package patch.

## Saffron: Formula Float errors, popup pointer handling and history context

test-results/embed-saffron-formula-authored-history/report.json exercises twenty-one
literal examples in a native Doc@Sheet Float. Seventeen source steps update twelve
current-canvas inline results while retaining the authored body. Twenty results
display native division/value/reference errors but report success/string. EN/ZH
dependency packs are complete; the English number-format dialog works, while the
Chinese button is intercepted by another child-popup layer after its bounds settle.

The tested activation/paragraph-Facade sequence leaves keyboard Undo targeting
the host Sheet's previous hire change (2,800 back to 2,600), not the Doc review line.
Raw before, after and keyboard-undo snapshots retain that observation. This is a
specific command/focus sequence, not proof that all native Doc keyboard editing
fails. The test separately restores that exact host edit through native Redo and
checks explicit document history. Full Doc comparisons retain changes to native
DOC_FORMULA_PLUGIN lastValue caches; separate authored-state checks preserve the
strict failures. Basic isolated Doc Facade undo/redo succeeds in
test-results/saffron-history-isolated/report.json, which is narrower evidence.

The original failed unavailable-source snippet changed an unused alias: workbook
display rename leaves the Doc formula qualifier Saffron Budget intact. Current
examples modify that actual alias. Bare setValue(null) was rejected and corrected
to the native cell object. A literal newline inside the authored title was also
corrected before current screenshots. These were demo corrections, not SDK fixes.

An expanded history test exhausted memory by returning FWorkbook.redo() through
Playwright: that method returns a live Facade, unlike FDocument.undo()'s boolean.
The current test does not serialize that service graph. Earlier interrupted runs
are not acceptance evidence. No SDK sources or installed packages were patched.

## Prism: first chart reconstruction adds explicit drawing transform defaults

test-results/embed-prism-roundtrip-authored/report.json retains one strict
full-snapshot failure. The first reconstruction adds flipX/flipY false and
angle/skewX/skewY zero to the chart transform in SHEET_DRAWING_PLUGIN; saved
left/top/width/height are unchanged. Full-state comparison fails before a
separate authored-state assertion checks these exact additions. Raw snapshots
are retained unchanged; no SDK package or source was patched.

Four replacements preserve authored formulas, chart identity/configuration,
source data and fresh native calculation. Missing-source bindings stay missing
until repaired; removed charts stay removed. Ten invalid bundles reject before
changing the owner. Embed activation timestamps and the first exact empty-name
serialization are separately recorded. There are no browser errors, warnings
or backend requests in this selected test. This is a serialization-equivalence
gap, not evidence of changed numerical results or chart geometry. The baseline
twenty-five examples and selected native interactions pass independently at
test-results/embed-prism-formula-final/report.json.

## Cobalt: native three-unit recovery retains authored state but changes caches

The installed beta.2 production harness at
test-results/embed-cobalt-roundtrip-layout/report.json reconstructs Doc, Sheet
and Base together through the exported factory and literal README snippet.
Five replacement owners preserve authored formulas/number formats/IDs, prose,
source data and actual four-page A4 boundaries. Missing Sheet and Base bindings
remain missing until explicitly repaired; a formula replaced with text stays
removed. Ten invalid bundles preserve the original owner. Native editing and
fresh results are tested after reconstruction, not only serialized metadata.

The strict report remains FAIL. Four full-snapshot comparisons and one Sheet
Undo comparison differ: SHEET_DATA_VALIDATION_PLUGIN serializes an empty
revenue bucket as {} after loading, then recreates {"revenue":[]} on editing.
The local DataValidationResourceController.onLoad only iterates actual rules;
an empty list does not materialize a subunit. This observation concerns empty
state, not proof of nonempty validation-rule loss. Native DOC_FORMULA_PLUGIN
lastValue caches also change from previous numbers to current error values
after error-state reconstruction, then back to numbers after repaired-state
reconstruction. Formula syntax, formatting, source bindings and live output
remain independently checked. Forty error results still report success/string.

Complete snapshots are retained as before/after evidence. The full-state gate
does not strip empty resources or cached lastValue; only checked native embed
reactivation timestamps are exempted. Separate authored-content assertions are
not presented as full-state acceptance. No SDK package was patched. Baseline
twenty-example, source editing/history, Print and EN/ZH dialog regressions are
in test-results/embed-cobalt-formula-recovery-regression/report.json and
test-results/docs-formula-locales-cobalt-recovery/report.json.

## Reed: selected initial theme and Board child teardown setup corrected

test-results/embed-reed-formula-initial/report.json completed all sixteen source
examples, twelve painted native results, three actual connector routes, native
Base typing/history and passive Board-visible source write/return. It retained
an initial Board theme diff after the first application theme cycle and a React
render accessing an already disposed child injector during teardown.

The initial snapshot's default Board theme uses fallback colors. The SDK
BoardThemeFollowUniverController later regenerates that theme with ThemeService's
actual color resolver. Fresh Reed Board creation now uses the same exported
createBoardThemePreset/resolver pair; it does not reseed saved themes or change
authored shape colors. The child view mounts React at data-embed-content-root,
not the Slides child-render-mode selector: the factory now unmounts the exact
owned Board content root before explicit child/host unit and injector disposal.

test-results/embed-reed-formula-owned-ui/report.json passes the repeated suite,
ten complete EN/ZH packs and both whole-model theme cycles with zero browser
errors, warnings or backend requests. No SDK source or installed package was
modified. This does not certify teardown or theme behavior in other routes.

## Indigo: selected off-page navigation and disposal failures resolved

Snapshot-recovery update: test-results/embed-indigo-roundtrip-preserved/report.json
PASS covers four serialized owners, edited formulas/number formats/notes/background,
filtered and hidden records, fresh native typing, persisted unavailable bindings,
explicit repair and deleted Shape preservation. Base and Slides snapshots are
compared completely except the recorded native embed activation timestamp and
opening-page selection (which must equal the saved displayTarget). No errors,
warnings or backend requests remain in this selected run.

Restoring a saved Base can create Slides thumbnails before the generic UI reaches
Rendered. In test-results/embed-indigo-roundtrip-current-canvas/report.json,
SingleUnitUIController's initial render scan tried to activate a thumbnail and
threw `activate is not a function`, leaving the skeleton visible. Native
SlideThumbnailItem creates non-unit render IDs; RenderManagerService's non-unit
fallback marks these isThumbNail but defaults isMainScene to true and has no
activate method. The scoped created$ rule now excludes thumbnails as well as the
Base workbench canvas from main-render ownership. No renderer methods or SDK
packages are patched. The saved factory loads resources verbatim and never
reinstalls initial formulas or recreates deleted shapes.

Current update: test-results/embed-indigo-continuous-navigation/report.json PASS
proves passive repaint on the active Slides canvas before any navigation, native
return to Project register, and subsequent keyboard editing in the same owner
without reload. The factory keeps the Base as root but sets only its renderer's
isMainScene=false on creation. BaseWorkbenchRenderService owns that canvas, so
the generic single-canvas focus switcher must not remount it. This uses SDK render
infrastructure, not a public Facade method. Unit creation remains unchanged.
No forced clicks, CSS event overrides, manual refresh or SDK patches are used.
test-results/embed-indigo-owned-disposal/report.json separately rechecks active
child/editing, repeated teardown, newer owner preservation and pre-Steady disposal.
Both reports have zero errors, warnings and backend requests. Durable storage, complete
native menu coverage, responsive/accessibility and delivery are still unaccepted.

Historical evidence below records the earlier failures and rejected alternative.

Update: the disposal warnings are resolved in the demo factory without changing
SDK packages. FUniver.disposeUnit(child) then disposeUnit(host), after unmounting
owned UI and before Univer.dispose(), emits the native unitDisposed event while
ShapeFormulaLifecycleController and commands still exist. The previous injector-
only teardown left formula unregistering until after CommandService disposal.
test-results/embed-indigo-unit-disposal/report.json completes the existing
fourteen-example suite with zero warnings/errors/backend requests; it still FAILS
the off-page navigation gate. test-results/embed-indigo-disposal/report.json PASS
also proves active-child and ZH editing teardown, idempotence, newer global-owner
preservation, unit-removal order and no resurrection after pre-Steady disposal.

Navigation tracing: bases/src/commands/commands/update-base-cell.command.ts
focuses the Base after applying its mutation. The generic UI
SingleUnitUIController._changeRenderUnit then mounts that main render into its
content element, competing with BaseWorkbenchRenderService's native grid mount.
A trial ICreateUnitOptions.embeddedRender=true also removed visible Base host
navigation (test-results/embed-indigo-owned-render/report.json); that trial was
reverted. It is not the renderer-only ownership fix described above. The earlier
factory retained the native host and failing navigation evidence. Historical
observations below describe the earlier injector-only teardown.

test-results/embed-indigo-formula-verified/report.json completes fourteen literal
examples, twelve results, all three current Slides canvases, full authored-slide
preservation, native Base keyboard input and exact Base Undo/Redo. Native division
and missing-source errors have correct error status here, unlike the Doc formula
classification issue below. Nine whole EN/ZH packs and complete two-model theme
preservation also pass.

The additional off-page write gate fails: while the presentation child is active,
Base record changes recalculate and repaint all output pages, but
univer-base-main-canvas_indigo-community-portfolio then intercepts clicks on the
native Project register menu. No force-click or pointer-event CSS workaround is
used. The independent native-input phase reloads original source data; this does
not prove recovery of saved user edits or solve off-page navigation.

Active-child disposal releases all owned roots and the global API, but logs twelve
formula.mutation.remove-other-formula commands skipped because CommandService is
disposed. Strict acceptance retains these warnings. No SDK source or installed
package was modified. The first native-input test used the right-aligned numeric
glyph's outer edge; the corrected test clicks inside the Allocation field. A fresh
load also receives new generated formula paragraph IDs and is compared against
its own complete baseline, without stripping authored metadata.

## Linen: traditional Doc error-result classification remains incorrect

test-results/embed-linen-formula-rows/report.json completes fifteen literal source
examples, both current output canvases, stable three-page A4 body/pagination,
native Base typing, source rename/repair, EN/ZH packs/themes and active-fullscreen
disposal. It remains strict FAIL: beta.2 reports one #DIV/0! ratio and twelve
unavailable-source results as success/string rather than error. There are no
browser errors or backend requests in this run. No SDK package or result wrapper
was patched; the underlying errors stay visible.

The original record-count formula used COUNTA. With an unavailable source it
returned 1 because an error is nonempty, while the other formulas errored. This
was an unsuitable counting formula for the demo, not a successful missing-source
case. ROWS now expresses record cardinality and returns native #N/A for the missing
source; other formulas return #VALUE!. The earlier report is retained at
test-results/embed-linen-formula/report.json.

test-results/docs-formula-locales-linen/report.json separately passes complete
docs-formula-ui/shape-editor-ui/embed-unit-ui packs, actual Edit formula and
number-format dialogs, cancellation and whole-document preservation in EN/ZH.
This standalone case does not reproduce the number-format click failure seen
in the multi-output Kestrel/Meridian shells; it does not prove those cases fixed.

## Moss: renamed Base qualifier needs an explicit persisted binding for reload

test-results/embed-moss-roundtrip-serialization/report.json reproduces a beta.2
failure: rename the Base, serialize both native units, dispose and reconstruct.
The formulas contain the new name but UNIVER_EXTERNAL_REFERENCE_PLUGIN still has
only the old `Moss Support` qualifier. Initial cells/columns retain 24; editing
the restored Base record to 28 changes its snapshot but leaves the Sheet at 24.
An initially correct picture is therefore not sufficient reload acceptance.

Moss literal example 11 now uses public FFormula.upsertExternalReference to persist
the new qualifier with the same stable Base ID. The factory reuses saved resources
verbatim, never guessing bindings or repairing missing sources. The selected run
test-results/embed-moss-roundtrip-native/report.json passes post-reload Base edits,
native Sheet criterion typing, current chart geometry, saved invalid binding and
explicit repair, chart deletion preservation, locale/theme and clean disposal.
No SDK source or installed package was patched. Native rename UI without the
explicit binding step remains unaccepted.

Full snapshot comparison permits only the native embed activation timestamp and
the exact empty SHEET_DEFINED_NAME_PLUGIN serialization change from `""` to `"{}"`.
The latter follows sheets/src/controllers/defined-name-data.controller.ts: empty
text parses to an empty map, which is registered then serialized. Populated maps,
formulas, chart resources and every other field are compared without normalization.

## Moss: synchronous Print facade and native source-name rewriting

The installed beta.2 FWorkbook.openPrintDialog calls the asynchronous print-open
operation through syncExecuteCommand. It throws "Command handler should not
return a promise"; see test-results/embed-moss-formula-renamed/report.json.
The exported example instead uses FUniver.executeCommand('sheet.operation.print-open'),
which prepares the correct Sheet asynchronously. First-open FitPage configuration
keeps all columns and the chart together. The selected verification waits for
actual green/gold chart pixels in the native print canvas, not just a page count.

test-results/embed-moss-formula-verified/report.json passes all twenty examples,
current two-series geometry, native Base editing, filtered projections, missing
source/repair, Print/PNG, locale packs/themes and disposal. Base display-name
changes can rewrite Sheet formula qualifiers; this is native behavior, not an
application-generated replacement. Only that exact qualifier change is allowed
by the authored-formula check. Removing an obsolete alias would not prove that
a source is unavailable; the example explicitly binds the current qualifier to
an absent unit ID, verifies native errors and cleared series, then repairs it.
Full persistence, rebinding to another valid source and UI coverage remain open.

## Meridian: two-hop Formula chain and embedded Doc editor

test-results/embed-meridian-formula-native-keyboard/report.json verifies nine
literal examples, 26 current native results, real chart geometry, independent
Base/Sheet keyboard edits, unchanged authored Doc/Slides/Board content, both
saved reference layers and active-Board disposal. Strict FAIL: the Doc share
displays #DIV/0! while its result reports status success and string type.

test-results/docs-formula-locales-meridian/report.json verifies all three
dependency locale packs and native Edit formula/cancel actions in EN/ZH, with
no raw translation keys or browser errors. Strict FAIL: the Number format
trigger's parent intercepts pointer events in both languages, as in Kestrel.
No forced click, result normalization or SDK patch is applied. These selected
checks do not establish multi-unit persistence, rebinding or complete UI coverage.

## Kestrel: dual-source outputs; off-page ownership and Formula dropdown

test-results/embed-kestrel-formula-native/report.json verifies seventeen literal
examples, 26 current native formula values, both chart series' actual column
geometry, independent Base/Sheet keyboard editing and unchanged authored content.
Source-activated display renames retain both saved reference identities, and
active-Board disposal passes. No browser errors/backend requests were observed.
The strict report retains two failures: Doc #DIV/0! status is success/string;
renaming Base while its embedded Sheet is active creates a full-width Base canvas
over the native table-list navigation. The latter is reproduced on a fresh owner
without forced clicks. Activating Expenses before changing its Base display name
passes the documented workflow but does not fix the off-page SDK path.

test-results/docs-formula-locales-kestrel-actions/report.json verifies complete
official Formula dependency packs, native Edit formula actions, visible translated
editor labels, stable desktop dialog bounds and cancellation preserving the full
document in both EN/ZH. Its strict result is FAIL because the number-format trigger
is visibly present but has univer-pointer-events-none and computed pointer-events:
none. A parent div receives the hit instead. The trigger is marked data-state=closed
and tagged as an embedded child popup. This is an interaction failure, not missing
locale text or absent exported CSS. Local SDK source includes a closed-portal input
guard and a test for keeping closed-state triggers interactive; those sources alone
do not prove that the installed beta.2 bundle has the fix. No SDK or DOM/CSS patch
was introduced in this demo. Selected EN/ZH first-snippet/theme integration passes
in test-results/embed-kestrel-formula-next/report.json.

## Aurora: four live outputs; Doc error classification remains incorrect

test-results/embed-aurora-formula-native-final/report.json passes selected checks
for twelve literal examples, native Sheet keyboard input, 22 dependent values on
current Doc/Slides/Board canvases and real chart column geometry. Source display
rename retains the persisted qualifier/ID mapping. All authored Doc content and
Slides/Board pages stay unchanged, excluding only formulaBinding.lastValue, the
SDK's expected calculation cache. Active-Board disposal passes; browser errors
and backend requests are empty.

The strict report is still FAIL: setting Access to Pending makes its share
display #VALUE!, but Docs Formula reports status success and valueType 1. The
Slides error result is correctly classified. This repeats the existing native
Docs Formula issue, not a JavaScript calculation or status override. No SDK
package was patched. EN/ZH first-snippet/theme integration and standalone
source/CSS export pass their separately scoped checks; multi-unit reload,
missing sources, all editor actions and responsive behavior remain unverified.

## Docs Formula editor: locale dependency fix; development teardown remains

The Docs Formula editor renders components from Shape Editor UI and Embed Unit
UI. Cinder omitted both locale packs; Aster omitted their direct imports and
Estuary omitted Embed Unit UI. The live Cinder editor reproduced raw
shape-editor-ui.formulaBinding labels and embed-unit-ui.referencedUnitViewer.base.
All three factories now explicitly merge the three official editor locale packs
in English and Simplified Chinese, alongside their existing plugin locales, and
export the required dependency CSS. This is a demo configuration fix; no SDK
translation or runtime package was patched.

The three test-results/docs-formula-locales-{cinder,estuary,aster}/report.json
reports pass selected production language checks. Each opens the native editor,
more-number-formats dialog, selected-formula action toolbar and its Edit formula
button, checks the official packs and rendered labels, switches locale on the
same owner and preserves the complete saved document after cancellation.
These reports do not certify all SDK menus or layouts.

An initial dialog-bounds observation ran during the native entrance animation
and incorrectly suggested clipping. A subsequent stable-layout probe at 1500 by
1100 measured x=30, y=102, width=1440, height=896, fully inside the viewport.
The language test now waits until bounds remain unchanged for 600 ms before
capturing screenshots and dialogBounds. No SDK CSS override or forced dialog
repositioning was needed. This selected desktop check is not mobile acceptance.

test-results/docs-formula-locales-cinder-next-ready/report.json is a strict FAIL
because dismissing the embedded source viewer in Next development emitted four
React synchronous-root-unmount warnings. Both locale/action sequences and full
document preservation passed; the warnings remain in errors rather than being
filtered. The earlier docs-formula-locales-cinder-next report records a separate
stale dependency-resolution failure while the new direct locale dependency was
being installed. The peer-resolved lock entry is now repaired; the new run loads.

## Cinder Base -> Modern Docs: explicit binding and remaining native errors

`test-results/embed-cinder-formula-binding-recovery/report.json` is a strict FAIL
overall despite seventeen literal examples passing selected checks. Native fullscreen keyboard input and exact
Undo/Redo work inside the same fullscreen session. After leaving and reentering,
Undo does not restore the Base value (140 remains instead of 120). This is a
separate interaction path, not evidence that all Base history fails. Its failed
history can affect later checks, so rename/disposal runs on a fresh owner.

The earlier unbound factory's rename failure is resolved at demo initialization:
FFormula.upsertExternalReference persists the hand-authored qualifier/source ID
before FDocument.insertFormula. The documented Facade requires this step for
hand-written formula text. Supplying externalReferences only to insertFormula
left the runtime's Base mapping empty in the earlier probe. The new check proves
the mapping exists in save(), survives rename and drives a subsequent edit on the
current canvas. No SDK package was changed. This does not certify other demos'
binding paths; they need their own saved-reference and live-edit evidence.

The new literal examples verify idempotency, removal without deleting the source,
visible native reference errors and same-source mapping repair. Removing a mapping
after rename produces #REF!/#VALUE!; repairing it restores all ten live results.
The error-status metadata remains wrong on this path and is retained as a failure.

The empty-queue average displays #DIV/0! but reports success/string, matching the
earlier Doc Formula error-status observation. No SDK patch, hidden recalculation
result, source-name rewrite or error-status normalization is introduced.
Whole-table/view filtering, hidden record edits, unchanged authored prose,
native amount rendering and active-fullscreen disposal have independent passing
checks. EN/ZH integration passes all seventeen literal examples and full-model
theme checks in `test-results/embed-cinder-formula-next-bound/report.json`;
source/CSS export passes. The first integration attempt captured a stale frame
during iframe initialization; waiting for the live preview resolves that test
acquisition failure, not any SDK failure described above.

## Orchid Base@Slides Float: root focus, history and fullscreen

`test-results/embed-orchid-formula-activated/report.json` retains strict FAIL gates.
Root FBaseTableRecord.setValue calls UpdateBaseCellCommand; the inspected local
`packages/bases/src/commands/commands/update-base-cell.command.ts` calls global
focusUnit(unitId) after the mutation. Passive-source runtime reproduces a lost
Slides workbench/page list despite correct formula values. The same occurs from
another slide. Native double-click activation changes the result: the original
root Facade now updates all twelve results on all three current canvases for
each of the twelve snippets. No forced refocus or result rewrite hides failures.
FEmbed.loadAsync resolves through the same root API/injector in the inspected
implementation; merely changing how the FBase is obtained does not establish
scoped command ownership. A scoped-FBase probe still lost the passive host;
the same root API worked after native activation. The experimental helper was
removed. This documents a usable activation prerequisite, not a general SDK fix.

Native inline amount input follows a different path and passes:24000->26000
updates every current slide canvas while retaining layout. Native title editing
changes the correct Base record, but Ctrl+Z and the floating toolbar Undo leave
the new title in place. Redo is not accepted. Enter fullscreen creates no shell.
Disposal after an activated Float passes; no fullscreen-disposal claim is made.
The independent CSS/source export passes and no browser/backend errors are seen.
`test-results/embed-orchid-formula-activated-next/report.json` passes all twelve
literal snippets in EN/ZH and preserves owner/full models through theme changes.
Earlier passive-source native and Next failures remain historical evidence.
The off-page gate still fails in the latest independent run. This extends the
earlier Beacon observation with an isolated Base source and native activation
comparison; it does not establish that Beacon is fixed. No SDK package was patched.

## Showcase development integration: RSC performance timestamp (not an SDK error)

The responsive Violet standalone suite and independent official-CSS export pass.
However, `test-results/showcase-card-free-responsive/report.json` and
`test-results/embed-violet-responsive-next/report.json` both retain strict FAIL
results on Next16.3.4 development `Performance.measure` negative timestamps for
NotFound. Stacks point to React Server Components' `flushComponentPerformance`
and `flushInitialRenderPerformance`, not a Univer command. Both EN/ZH workflows
complete their assertions: card absence, source viewer and layout preservation in
the first; twelve literal snippets, thirteen formula results and full-model theme
preservation in the second. This is not evidence that the exception is harmless
in production. No filtering, browser Performance patch, dependency edit or broad
build was used to turn those failures green. Production Next integration remains
unverified; the independent Vite build is not a substitute for that gate.

## Nova Sheet@Slides Tab Formula: inactive render and Undo

`test-results/embed-nova-formula/report.json` reproduces two strict failures with
a native SlidesPageListBlock source, not a Float. A source-cell Facade write from
the Decision slide throws in AutoHeightController (`getUndoRedoParamsOfAutoHeight`,
undefined `with`) when the source Sheet model exists but its render is absent.
Opening Operating data first makes all ten literal examples work; the test keeps
the separate off-page failure visible rather than silently switching focus.

Native C5 typing and value Undo/Redo pass, and exact Redo passes. First exact Undo
retains an extra peach-input style with resolved text color in the style pool.
The test does not normalize this difference or describe it as lost cell data.
Unlike Lumen's fullscreen path, this full native data page supports five Grid
groups, correct-source native Print menu/Cancel and active-source disposal.
No SDK patch or hidden render was introduced. Persistence/rebinding and complete
menu coverage remain unaccepted independently of these two reproduced failures.

## Lumen Sheet@Slides Formula: inactive render, fullscreen and Undo

`test-results/embed-lumen-formula-print/report.json` retains three distinct
limitations. Writing the pricing Sheet while the active slide does not contain
its Float throws in AutoHeightController.getUndoRedoParamsOfAutoHeight. The
inspected OSS controller dereferences getRenderUnitById(unitId) with a non-null
assertion before calling with(SheetSkeletonManagerService); a model can remain
available while that page's render is absent. Returning to Pricing permits the
same literal write. No keep-alive render, automatic page switch or fallback
mutation was added to conceal the off-page failure.

The native Enter fullscreen button does not create a shell, as previously seen
in Tamar/Beacon. Fullscreen keyboard and active-fullscreen disposal checks remain
failed. Inline B6 keyboard editing and value Undo/Redo work; the first exact Undo
snapshot retains a new amber-input style with resolved text color #1B1C1F. Redo
matches its complete edited snapshot. Do not normalize the style pool or infer
data loss from this difference alone.

The public async executeCommand('sheet.operation.print-open') path opens a native
one-page preview of lumen-pricing-model / pricing and Cancel returns. This does
not repair the fullscreen button or certify exported PDF/whole-deck printing.
Ten literal source snippets update nine Formula Shapes on three painted pages
without changing authored prose/geometry. EN/ZH guides, model-preserving themes,
independent CSS/source export and ordinary owned-demo disposal have separate
passing evidence. No SDK package was modified for this case.

## Acorn Base-host Tab reselection / root canvas remount

`scripts/test-embed-base-tab-reselect.mjs` reproduces a native navigation failure
without editing or Undo: open Weighted forecast, click the already active tab
again, then try Delivery playbook. The Base main canvas overlays the sidebar
and intercepts the next click. `test-results/embed-base-tab-reselect/report.json`
retains the failed gate; no custom click handler, pointer-events override or SDK
patch hides it.

The diagnostic appendChild trace in
`test-results/embed-mixed-bases-mount-trace/report.json` shows the Base canvas
moving from its `base-canvas-root` into the shared workbench section through
`_changeRenderUnit`. Ordinary tab transitions release the peer-host render lease
and remount it; reselecting the current tab ends with the shared section mount.
The inspected ActivateBaseTableOperation focuses the Base even when its table
is already selected; UISharedController mounts a main-scene renderer into the
shared content element. This locates the focus/render interaction; it is not
evidence of an upstream fix. The main mixed test avoids redundant navigation
setup and leaves reselection as this independent mandatory regression.

Acorn also reproduces first-Undo serialization differences: Sheets adds empty
validation arrays per touched sheet, and Base adds empty `attachments` and
`attachmentSets` maps to the four generated tab tables. Values restore; exact
snapshot comparisons remain failing rather than normalizing the differences.
Native partner rename after initialization and Docs/Slides/Board history have
separate passing checks. No data-loss claim is made from empty metadata alone.

Undo/Redo for an Assumptions range activates that worksheet. Print correctly
captured Assumptions in the first probe; the test's expectation of Forecast was
wrong. Select the intended native sheet tab before opening Print and assert the
actual workbook/sheet pair. Do not present a preview of another sheet as success.

## Beacon mixed Slides: fullscreen and Print Facade dispatch

`test-results/embed-mixed-slides-print-menu/report.json` reproduces the native
Sheet Float fullscreen failure already traced in Tamar. The original button
does not open a shell; no replacement event handler or SDK/package patch is
introduced. The first Sheet Undo also materializes the empty validation map.
Exact snapshots remain enabled, while independent product checks still run.

`test-results/embed-mixed-slides-final/report.json` additionally records
`FWorkbook.openPrintDialog()` throwing "Command handler should not return a
promise". The installed public wrapper calls `syncExecuteCommand`, while
`SheetPrintOpenOperation` has an async handler. Awaited
`FUniver.executeCommand('sheet.operation.print-open')` opens the same native
single-page preview and native Cancel, with the child workbook/sheet checked.
This is a supported async command path, not a repair of the wrapper or evidence
of exported PDF. `print()` is the confirmation operation, not preview opening.

The first native preview retained the floating Sheet menu over its content.
After the source is captured, Beacon clears only its owned Float activation
through the exported activation service. The selected recheck verifies the
actual menu is hidden, then cancels, reactivates the Sheet and edits it. The
empty positioning container can remain visible without any editor toolbar.

The first guide probe ran a Sheet edit from the cover before its render mounted
and hit `AutoHeightController`'s missing render dependency. The documented
workflow and corrected guide open each native product before the literal edit.
Selected EN/ZH theme/model preservation passes; this does not certify arbitrary
offscreen Facade editing. Initial keyboard probes appended text or lost keys;
explicit native cell editing/selection and neutral-cell focus before history
shortcuts verify Sheet typing and full snapshots after initialization. All
earlier failed reports are retained.

## Northstar mixed modern Docs: history serialization and fullscreen release

Estuary's mixed traditional dossier reproduces the empty-validation difference
in `test-results/embed-mixed-docs-traditional-page-size/report.json`. Its authored
input style specifies the default ink, so subsequent native keyboard Undo/Redo
does not add a new style-cache entry. This is an authored-style choice, not a fix
to the SDK's first-Undo resource serialization. Five-page chapter flow, four-slide
navigation and selected fullscreen-Board disposal pass their independent checks.

`test-results/embed-mixed-docs-modern-print-release/report.json` retains a failing
strict gate. Sheet values restore, but the first Facade Undo materializes an empty
validation map and native typing leaves a generated input-style cache entry after
Undo. Do not describe these serialization differences as proven data loss. Exact
full-snapshot assertions remain enabled; Base/Slides/Board history comparisons pass.

Disposing an active fullscreen Board initially raised LocaleService and missing
host errors. `EmbedHostToolbarMenu` schedules scope cleanup on requestAnimationFrame;
`EmbedActivationService.clearFullscreen` then schedules host focus recovery.
Northstar's async disposer waits for the public `EmbedFullscreenService.exited$`
signal and the queued recovery frame before destroying its host. The selected
fullscreen-Board disposal recheck has no browser errors. This is demo-owned release
ordering, not an SDK patch or proof for repeated mounts/background tabs/all hosts.


## Mixed Slides and Boards editor-service registration order

Harbor mixed initially fails with duplicate univer.editor-ui.service registration
in test-results/embed-mixed-sheets-production. Slides UI onStarting registers the
root service; Boards UI onStarting installs its runtime-scoped dependency list
into the root as well. Applying the Board-only extension before both products
start therefore adds a duplicate root binding.

The mixed demo creates its real Slides child first, creates its real Board unit,
then uses the public registerRuntimeScopedDependencies extension before that
Board child view mounts. Board startup has finished, so the extra service is
available to the child scope without re-registering it at the root. No installed
package change, dummy unit or root service deletion is used. Selected actual
Board typing/history and five-model isolation pass in embed-mixed-sheets-native-text.
This order is specific to this owner; repeated creates, source failures, alternate
load ordering and all teardown paths still require acceptance.

## Summit fullscreen Slides text selection in a traditional Docs block

The selected independent Summit build passes native shape movement and complete
presentation Undo/Redo, native text insertion/history after an initial no-op
rich-text commit, host isolation, page navigation, fullscreen and disposal.
Those passes do not establish correct caret placement or text selection.

Two stricter modes of `scripts/test-embed-slide-traditional-block.mjs` remain
reproducibly failing on installed beta.2, including after animation-frame waits:

- `SHOWCASE_NATIVE_TEXT_MODE=replace-all`: while the native `SLIDE_SHAPE_TEXT`
  contenteditable has focus, Ctrl+A and typing a two-line replacement produces
  `Compare the shade.\nCompare the shade.\nWalk another route.` instead of
  `Compare the shade.\nWalk another route.`.
- `SHOWCASE_NATIVE_TEXT_MODE=replace-line`: Home, Shift+End and final-line
  replacement produces `Compare the shade.\nWalk the routWalk another route.e.`.

Reports and screenshots remain in
`test-results/embed-slide-traditional-block-select-all-settled` and
`test-results/embed-slide-traditional-block-select-line-settled`. Set
SHOWCASE_ORIGIN to the independently built Summit preview and SHOWCASE_VITE_MODULE
to its Vite node entry. The default `insert` mode only certifies insertion and
history; it must not be used to declare either selection probe resolved.

Local reference `shape-editor-ui/src/views/shape-text-editor/shape-text-keyboard.ts`
dispatches Ctrl+A through DocSelectAllCommand. Its explicit shape-editor key list
does not include Home/End, although Docs UI has separate cursor shortcuts. These
are investigation leads, not a proven cause or a claim about other SDK versions.
No SDK/package patch, manual selection emulation or blanket snapshot
normalization is applied. First-native-commit restoration remains unverified.

The earlier movement failure was a separate test-target error: fresh fillText
coordinates came from a 251px thumbnail while the main canvas reused cached text.
The corrected test derives the centered main scene at its initial 100% zoom and
retains strict movement and full-snapshot history assertions. It does not prove
arbitrary zoom or native text-caret coordinate accuracy.

## Ripple fullscreen Sheets name-box navigation in beta.2

`scripts/test-embed-sheet-board-float-namebox.mjs` isolates native name-box
navigation in the Sheets child of `embed/sheets-in-boards-float`: activate the
Float, enter fullscreen, type B5 in the name box and press Enter. The actual
selection fails to remain on B5. The isolated test records the selected address
and screenshot in `test-results/embed-sheet-board-float-namebox`; it must fail
until native navigation works. No value is written by this diagnostic.

The earlier `embed-sheet-board-float-production-namebox` test typed after this
navigation and changed an unintended cell, so its total and subsequent reserve
assertions fail. The separate production-pointer test clicks B5 using authored
cell geometry, asserts the actual selection is B5, then types and validates
recalculation plus full-workbook Undo/Redo. That narrower pass does not certify
name-box navigation. The demo discloses this limitation and patches no SDK file.

## Boards-only Embed needs a child-scoped editor service in beta.2

Tidal's `embed-board-float-first` and `embed-board-float-editor-service` reports
fail with a missing `univer.editor-ui.service`. Boards Embed renders the shared
EditorUIFloatingContainer, but Boards UI's default runtime dependencies do not
include EditorUIService. Merely registering Slides UI does not start its
Slides-type lifecycle without a Slides unit.

The demo uses the installed public
UniverBoardsUIPlugin.registerRuntimeScopedDependencies extension point to add
the official IEditorUIService/EditorUIService to this child scope. This follows
the ownership pattern tested in the local SDK scoped-injector tests, creates
no dummy presentation and patches no SDK package. Native activation, Shape text
editing/paint, pointer-focused keyboard Undo/Redo, host recalculation/child
preservation and selected teardown pass the independent
`embed-board-float-production` report. Full native editing, multiple owners,
pending sources and repeated mounts remain unverified.

## Base SheetTab child teardown in Embed beta.2

Willow's `test-results/embed-base-tab-first/report.json` passes supplier edits,
native Undo/Redo, linked-record labels and host recalculation, but fails after
disposal with `[LocaleService]: Locale not initialized`. The Base child view
uses `disposeEmbedReactRoot` (deferred by setTimeout) before immediately releasing
its scoped injector. This matches the earlier Slides ownership issue below.

The demo now uses official design unmount on its own Base workbench, scoped by
both child unit ID and render mode, before disposing the host. It does not change
SDK packages or unmount unrelated roots. `embed-base-tab-owned-cleanup` and the
independent `embed-base-tab-production-keyboard` pass selected active-child
teardown without errors; repeated mounts, pending/failed loads and theme changes
remain unverified. The original failing report remains available.

## Slides floating menu teardown in Embed beta.2

`test-results/embed-slide-float-cleanup-diagnostics/report.json` reproduces
`[LocaleService]: Locale not initialized` after disposing an active Slide@Sheet
Float. The native floating menu is in a body portal outside the host root. Local
reference `embed-ui/src/services/react-root-disposal.ts` defers React unmount with
`setTimeout`, while the Slides child view disposes its scoped injector immediately.
The stack identifies `SlideEmbedFloatingMenu` reading its disposed locale service.
The earlier `embed-slide-float-edit` report's PASS flag was premature: its errors
array includes asynchronous teardown errors. Do not treat it as cleanup evidence.

The demo now uses official `@univerjs/design.unmount` for its own native content
root and its exact Embed-ID-scoped menu portal before workbench/core disposal.
`embed-slide-float-portal-cleanup` passes native activation, rich-text mutation,
display-target switching, native Previous page and post-disposal checks with zero
errors. This is a bounded application-side lifecycle workaround, not an SDK fix;
full-screen, early/pending removal, rapid remount and multiple owners need tests.
No installed package or SDK source was changed.

These are local observations, not a claim that all SDK releases have the same behavior. Do not silently patch installed packages or count a workaround as verification of the affected SDK API.

## Slides Shape text autofit options persist without the expected visual change

- On installed `1.0.0-beta.2`, `pnpm test:showcase:slides-text-sdk` verifies real `FShapeText.setText()`, text-box options, detached rich-text edits, and complete serialized Shape Undo/Redo. These model checks do not prove rendering.
- `pnpm test:showcase:slides-text-render` reuses Theme and Background's actual SDK factory and official CSS. It changes the opening `theme-card` to a 250 × 80 shape with 10-unit padding, square wrapping, and a long original print-studio paragraph at font size 28. It then applies `noAutoFit`, `normAutoFit`, and `spAutoFit` through the Facade, checking mode/text readback and actual Canvas text painting.
- The retained `test-results/slides-text-render-target-font-retry/report.json` records all three modes at 37.3333 painted pixels and an unchanged 80-unit shape height, with no browser errors or warnings. The mode screenshots show overflow. Only the probe uses monospace; measurement excludes other slide text and compares the main-canvas scale rather than the thumbnail scale. This is a strictly failing rendering probe, not a passing acceptance gate.
- Expanded programmatic checks cover ordinary Shape / `isTextBox: true` × square / no wrapping. Reports are `test-results/slides-text-shape-square-control/report.json`, `slides-text-shape-none-control/report.json`, `slides-text-textbox-square/report.json`, and `slides-text-textbox-nowrap/report.json`. All four retain the same font size and 250 × 80 geometry for all three modes, without browser errors or warnings. For no wrapping, the strict growth assertion checks width instead of height. Set `SHOWCASE_TEXT_BOX=1` and/or `SHOWCASE_TEXT_WRAP=none` before running the command to select these variants; defaults are ordinary Shape and square wrapping.
- Each expanded run includes an explicit `FShapeText.setFontSize(14)` measurement control after the autofit observations. It visibly reduces painted text, and `explicit-font-size.png` records the change. This proves the harness detects font-size changes; it does not turn the failed autofit checks into passes or claim the text now fits the shape. Mode, wrapping, `isTextBox`, and the text prefix are asserted through readback; the full snapshot is retained for inspection.
- Local reference source `shape-editor-ui/src/views/shape-text-editor/shape-text-document.ts` applies an existing OOXML `fontScale` in `normAutoFit`; this is distinct from calculating a scale from the available box. The installed Shape types expose that imported-data property. This is a source lead, not proof of the complete root cause or permission to inject a manually calculated scale and call it automatic fitting.
- Scope remains programmatic changes in this installed build. Native text editing, imported font-scale metadata, and other releases are not covered. The exact SDK cause remains unproven. No host-side autofit simulation, installed-package patch, or new public demo registration was used to disguise the discrepancy. Blueprint `standalone-slides-007` remains unfinished.

## Same-document instance themes affect one another in beta.2

`scripts/test-univer-instance-isolation.mjs` checks two actual Sheets core owners with distinct workbook IDs, light North and dark South, official CSS and native Grid ribbons. `test-results/instance-isolation-full/report.json` passes independent Facade edits, complete opposite-workbook snapshot preservation, exact South reset, North disposal without disabling South, native South editing/Undo, and final canvas cleanup. It still fails the required theme invariant: both workbench backgrounds are `rgb(31, 33, 36)` although North was created with `darkMode: false`. The retained screenshot shows unreadable light-theme cell text against the inherited dark background; this is not a cosmetic acceptance pass.

The installed `@univerjs/ui/lib/es/index.js` Workbench effect adds/removes `univer-dark` on `document.documentElement`, not only its own mount container. The local reference `univer-pro/submodules/univer/packages/ui/src/views/workbench/Workbench.tsx` has the same effect. Instance-scoped ThemeService values therefore do not imply document-scoped CSS isolation. No installed package, SDK source or background-color override was patched.

The intended multi-instance Showcase needs independent browsing contexts for contrasting themes unless the SDK gains validated scoped theme behavior. That must be implemented and tested as an explicit iframe integration, with real Facades in each child, not represented as a passing same-document multi-instance case. The current script is a feasibility regression and remains strict/nonzero on the theme failure; it is not a new registered demo or completed blueprint. `SHOWCASE_DUPLICATE_UNIT_IDS=1` additionally probes repeated workbook IDs as a negative control. The initial unique-ID attempt (`instance-isolation-unique`) read before Rendered and is retained as a harness readiness failure, not an SDK calculation defect; the final harness waits for Rendered and actual calculation application.

`test-results/instance-isolation-duplicate-control/report.json` repeats the same final harness with duplicate IDs and fails earlier: both SDK totals read `$486.78`, despite South's actual input cells being the boundary fixture (0 and 10,000 runs). Distinct IDs yield `$486.78` and `$142,177.63`. Use distinct workbook identities in the public multi-instance fixture; this observation does not establish the full internal cause of repeated-ID formula interference or certify cross-instance references.

The explicit iframe mode (`SHOWCASE_ISOLATION_FRAMES=1`) passes at `instance-isolation-frames/report.json`: North stays white, South stays dark and the host receives no `univer-dark` class. The public `embed/multiple-isolated-instances` integration now implements separate trusted same-origin documents with distinct regional workbooks; its standalone and selected Next interaction reports are linked in `showcase/README.md`. This avoids the shared-document boundary rather than fixing the SDK's behavior. The strict same-document regression remains failing and must not be counted as resolved.

## Bases select-option references are not cleaned or validated in beta.2

The installed `1.0.0-beta.2` `FBaseTableField.setConfig` removes a used option definition but leaves its ID in existing SingleSelect values, MultiSelect arrays and affected defaults. The original Sable coastal-observatory fixture in `bases/select-options` demonstrates this independently of the numeric-type case. Removing unused Seasonal/Weather options preserves all records, and renaming High to Critical keeps stable IDs and updates native labels correctly. Those successful operations do not prove used-option cleanup.

Raw `FBaseTableRecord.setValue` also accepts an unknown option ID in both select types. The demo's clearly labeled raw probe records that actual mutation, emits a visible warning and lists orphan references; it does not invent rejection or silently repair the data. Safe controls use current option IDs and a separately documented host single-select cardinality check. Native Undo restores the complete prior snapshot, and reload preserves orphan IDs rather than cleaning them.

`test-results/base-options-sdk-strict/report.json` completes all four fixtures while failing the integrity invariants. `base-options-ui-strict/report.json` and `base-options-standalone-strict/report.json` reproduce four browser observations (deletion and raw writes for both field types), with no browser errors or demo write requests. Explicit `SHOWCASE_OBSERVE_KNOWN_DEFECTS=1` continues other tests and retains these defects; it is not completed acceptance. The local newer reference source has `prepareRemovedSelectOptionCleanup` in `packages/bases/src/ot/json1-op-factory.ts`, but the installed package behavior is authoritative for this export. No package, SDK source or fake host history was patched.

## Bases field conversion and numeric defaults

Installed `1.0.0-beta.2` exposes `FBaseTableField.changeType`, `setConfig`, `setDefaultValue` and `FBaseTableRecord.setValue`, but they do not apply identical value validation. The original Bracken repair café fixture in `bases/text-number-currency` reproduces two acceptance gaps:

- Text-to-Number `changeType` returns true and changes the field schema without changing any old record values. `1250.75` remains a string; grouped numeric text, `12kg`, blanks and nulls also remain unchanged. Number-to-Currency preserves numerical amounts, as expected. A later `setValue` on a numeric field parses an ungrouped numeric string, rejects `12kg` or a disallowed negative value with false and a console diagnostic, and preserves the complete snapshot on rejection.
- `setDefaultValue('not a number')` returns true on a Number/Currency field. A subsequent `addRecord` that omits the field copies that string into the numeric cell. Reload preserves it. A correctly typed default applies only to omitted fields, not explicit null/zero, and adding a default never backfills old records.

`test-results/base-fields-sdk-strict-values/report.json` records both gap categories across all four states. `base-fields-standalone-strict/report.json` completes the browser checks with no unexpected browser errors or write requests but remains failed on the two SDK gaps. Explicit `SHOWCASE_OBSERVE_KNOWN_DEFECTS=1` tests the observed behavior and continues unrelated acceptance; its passing result is not SDK certification. Next dev's same-origin `POST /__nextjs_original-stack-frames` diagnostic requests are recorded separately from demo writes, not silently removed.

The demo's typed-default mode explicitly validates finite/allowed-negative host input before calling the actual Facade. Raw mode deliberately exposes the SDK gap and warns after the accepted mutation. The visible conversion comparison reads actual before/after Facade values; `changeType` itself returns boolean, not a conversion report. No SDK patch, automatic old-value cleanup, fake history or fake success message is used.

## Bases record insertion Undo retains attachment resources

On installed `1.0.0-beta.2`, `FBaseTable.addRecords()` inserts the Harbour Commons intake correctly and one native `FUniver.undo()` removes those records. However, `base.save().tables.tasks.resources` retains their `attachmentSets` entries (including empty sets) and the new `handover-note` attachment. Complete snapshot restoration therefore fails. The default `scripts/test-bases-records-sdk.mjs` and `scripts/test-bases-records.mjs` remain strict; failures are recorded in `test-results/base-records-sdk-strict/report.json` and `base-records-history-strict/report.json`, alongside complete before/inserted/undone JSON. The browser failure has no console/runtime errors or demo write requests.

`SHOWCASE_OBSERVE_KNOWN_DEFECTS=1` is explicit observed-behavior mode. It constructs the full expected snapshot with only the exact inserted attachment resource maps retained, compares every other field, records the defect, and continues testing other operations. Model checks cover all four fixtures; browser checks cover one/three records before/after original rows. The demo displays orphan-set IDs/counts and leaves the SDK resources untouched. Actual batch deletion and its Undo/Redo follow a different path and restore the tested complete snapshots. Current-content reload is not a resource cleanup API; full checkpoint recreation restores its earlier resource set and clears history.

The reference `packages/bases/src/commands/commands/batch-create-base-records.command.ts` computes its undo operation from the creation operation, then applies the mutation. Resource materialization is a separate area to investigate upstream; this source observation does not itself establish a corrected SDK implementation. No installed package or SDK source has been patched, no files uploaded, and no synthetic host history is presented as native Undo. This gap stays in blueprint `standalone-bases-002`.

## Bases lifecycle: person directory is not used by native Grid rendering

Installed `1.0.0-beta.2` reproduces this in `bases/create-base-and-tables`: `FBaseUI.setPersonOptions()` supplies four stable IDs and full names; `getPersonOptions()` returns the correct directory, but the native Grid draws `nia, imani`, not `Nia Park` / `Imani Cole`. `test-results/base-lifecycle-person-strict/report.json` fails the display-name assertion with no browser errors or write requests. The SDK reference `packages/bases-ui/src/fields/field-ui-plugin.ts` uses `textOf(ctx.value)` in `renderPerson`; `base-canvas-render-utils.ts` passes the value without a person-directory lookup. Inline editors separately consume `personOptions`. Do not conflate those two render paths, replace Person with Text, or set IDs equal to display names to mask this defect.

Historical control-panel tests used `SHOWCASE_OBSERVE_KNOWN_DEFECTS=1` in `scripts/test-bases-lifecycle.mjs`. The current package command uses `scripts/test-bases-lumen-native.mjs` instead: it runs every unrelated gate but still exits nonzero for raw-ID painting, without an observed-mode success substitution. Source/exported README and both localized guides disclose the limitation.

An independent demo integration correction uses `allowMultiple` for Person, `pattern: 'yyyy-mm-dd'` for Date, canonical date serials and `decimalPlaces` for Number. Earlier `multiple`, mixed-case date pattern and `precision` keys were inappropriate for those fields. The model test now writes all 60 records back through the real Facade and verifies unchanged typed values, plus actual SDK date/number formatting. No package is patched. The installed API also lacks existing-table move/reorder; insert-at-index remains a different capability, and blueprint 001 retains the original requirement.

## Traditional Docs range styles: direct setter does not create native history

Related integration follow-ups: the responsive typography case now uses installed `SetDocZoomRatioOperation` through `FUniver.syncExecuteCommand()`. Its first ResizeObserver implementation ran the ordinary action wrapper for height-only changes, inadvertently clearing validation errors. Width-only observation and a non-clearing automatic action path fix the host bug; `doc-fonts-responsive-standalone` retains the failure, while `doc-fonts-responsive-standalone-final` explicitly checks error persistence across a real width change. No SDK error is suppressed.

Native footnotes/endnotes remain unavailable through the inspected beta.2 Docs/Core/Docs UI Facade declarations and installed Docs Pro plugin set. The local `packages/core/src/types/interfaces/i-document-data.ts` footnoteReference occurrence is commented out, and the Pro PDF FOOTNOTE semantic enum does not provide a traditional Docs footnote API. The demo does not fabricate native footnotes from ordinary paragraphs. This finding does not assert that no future or uninspected SDK release can provide them.

On installed 1.0.0-beta.2, `FDocumentTextRange.setTextStyle()` calls the rich-text mutation without a `trigger`. `DocStateChangeManagerService` omits triggerless changes from history. `node scripts/test-doc-font-history-sdk.mjs` reproduces a successful direct style change followed by `doc.undo() === false`, then verifies full-body Undo/Redo equality when the same Facade call executes inside an explicitly registered SDK COMMAND. No installed package or SDK source is patched.

`docs-traditional/fonts-fallback-and-glyphs` uses `demo.command.alder-text-style`, registered through `ICommandService` and invoked with `FUniver.syncExecuteCommand()`. The handler still calls the real text-range Facade; SDK command dispatch supplies the trigger. This integration is disclosed in both localized guides and all exported code, not described as a built-in font command. A SDK history subscription refreshes controls for deferred native typing. Direct-setter history remains an SDK follow-up even though the example command path passes.

The same case exposed premature fixture capture: `Rendered` can precede drawing-transform initialization, so later snapshots acquire geometry absent from the initial `(0, 0)` figure. Mount now waits for the owned figure's actual native `transforms`, with a timeout/error and disposal guards, then caches a detached snapshot. The strict repeated-state and Reset assertions still compare complete snapshots. Font-induced repagination may legitimately change the figure's viewport transforms; that separate style-change assertion preserves its source, document transform, anchor and semantic properties instead of requiring a fixed screen position. `doc-fonts-standalone-current` and `doc-fonts-detached-fixtures` retain the earlier failures; `doc-fonts-layout-ready-standalone` passes.

`doc-fonts-details` retains development script/React pre-mount errors; `doc-fonts-details-final` passes the stable EN/ZH paths without filtering errors. That is not certification of all cold-start or HMR paths.

## Sheets charts: full-update history is not atomic; missing host facade declaration

Observed on installed `1.0.0-beta.2` with the original Aster observatory chart. Run `node scripts/test-sheet-charts.mjs --atomic-history` against the selected standalone or documentation playground. `test-results/charts-atomic-history-strict/report.json` strictly fails the documented one-Undo contract: after Column → Line through `FChart.update`, one Undo leaves Line, with zero browser errors and no remote writes. The normal interaction test explicitly records three Undo results (`line`, `line`, `column`) and checks three-step Redo; it is a boundary demonstration, not certification of atomic history.

The inspected `packages/engine-chart/src/facade/f-chart.ts` documents one history item but delegates to the host adapter. `packages/sheets-chart/src/chart-builder/sheet-chart-config-adapter.ts` applies configuration, source and layout through separate history-producing commands. Even unchanged source/layout can consume an Undo step. No history-loop workaround or SDK patch is shipped: host Undo/Redo execute exactly one public SDK call and report whether the workbook snapshot changed. Single-property title, palette, legend and size examples use their direct public setters, each verified separately. Full variant/source updates retain and disclose the limitation.

The installed `@univerjs-pro/sheets-chart/lib/types/facade/f-chart.d.ts` contains only `export {};`, although sibling declarations import and re-export `FSheetChart`. The local source marks that class internal. This demo uses the fully declared public `FChart<ChartSourceSpec, ChartSourceSpec, ISheetChartInfo, ISheetChartMethods>` base as its explicit local type; it does not invent methods, import private services or amend installed declarations. Strict application type checks use `skipLibCheck` and cannot certify the missing SDK declaration itself.

## Sheets images: direct-setter history, absolute reload and download naming

Observed on installed `1.0.0-beta.2`, using the original Cedar field station fixture in `sheets/images`. The default `pnpm test:showcase:images` is strict. `test-results/images-standalone-format-strict/report.json` records two failing browser invariants with zero browser errors: absolute snapshot positioning and SVG filename matching. These are not CSS failures; the independent export checks opaque-white SDK workbench, native flex layout and both Core/Drawing stylesheets.

- `pnpm test:showcase:images-setters-sdk` separately fails all three direct-setter Undo checks without a browser or demo controls: setSource retains new-source, setCrop retains 10px crop and setRotate retains 30 degrees. The inspected `sheets-drawing/src/facade/f-over-grid-image.ts` setters mutate the live image before submitting SetSheetDrawingCommand. The initial browser run also found crop/rotation model changes without new native paint. The host now deep-clones builder data before applying the edit and calls public updateImages; tested canvas paint and Undo/Redo pass through that route. This does not fix or certify the direct setters.
- After absolute setPlacement, Save & reload moves the sensor from `(663,218)` to `(709,238)`, retaining width/height/source. The inspected placement service stores absolute offsets in row/column-zero markers, while drawing renderer initialization converts these through grid geometry, adding the fixture's 46px/20px headers. The test keeps strict coordinate equality by default; explicit observation mode asserts only that reproduced offset and reports it as a known defect. Native sheet switching and forced row heights are checked separately and pass the tested host paths after redundant activation was removed. No coordinate compensation is applied.
- saveCellImagesAsync downloads the exact SVG source bytes as `A4.png`; it does not convert them to PNG. The native batch-save service's getFileExtension falls back to png when source/type matching fails; its BASE64 expression also does not match `svg+xml`. The demo labels the button `SDK download (format caveat)` and explains renaming this original SVG to .svg. Browser tests assert byte equality plus that visible warning, and the strict extension invariant remains failing. Other format/archive combinations are not certified.

`SHOWCASE_OBSERVE_KNOWN_DEFECTS=1` continues other state, native paint, local-file, responsive, theme and iframe checks while recording both exact defects. Observation success is not full SDK acceptance. This case remains partial in coverage.json; no installed package, SDK source or expected coordinate/filename was silently corrected.

## Crosshair palette auto-enable omits the enabled event

Observed with installed `@univerjs/sheets-crosshair-highlight` 1.0.0-beta.2. Disable highlighting, then choose a native color under View > Crosshair Highlight. The canvas changes and `getCrosshairHighlightEnabled()` becomes true, but the registered `CrosshairHighlightEnabledChanged` listener receives nothing. The installed Facade handler listens to Enable, Disable and Toggle operations only; the native SetColor operation also enables the service, without going through those operations. The implementation and browser result agree on this missing notification.

Run `pnpm dev:showcase sheets/crosshair-highlighting` and `pnpm test:showcase:crosshair`. The default test is strict and must fail while this defect exists. `test-results/crosshair-standalone-strict-mobile/report.json` reproduces it without React or the documentation shell: enabled false → true, event count 10 → 10 instead of 11, zero browser errors. The earlier `crosshair-documentation-strict-canonical` run also records an unrelated incremental Next ChunkLoadError; that error is not suppressed or resolved by the later warmed run.

`SHOWCASE_OBSERVE_KNOWN_DEFECTS=1` explicitly asserts the observed missing event and continues other checks, with status `passed-with-known-sdk-defect`, not full SDK acceptance. The demo reads current enabled state after public CommandExecuted events, but never fabricates an enabled event. The last-12 log contains only notifications actually delivered by the SDK.

The installed Facade exposes enable/get-state and the enabled event, not color/opacity setters or a color-change event. The native palette remains available. [SpreadJS Focus Cell](https://developer.mescius.com/spreadjs/demos/features/workbook/focus-cell) exposes independent color/opacity options; the Univer demo uses the native sixteen presets instead of inventing corresponding Facade methods. [The Univer feature guide](https://docs.univer.ai/guides/sheets/features/crosshair-highlighting) still mentions a color-change event that is absent from the inspected installed declarations. Programmatic color APIs, native palette keyboard/screen-reader behavior and cross-browser coverage remain open; no SDK package is patched.

## Hyperlink enumeration omits additional rich-text spans

Installed `@univerjs/sheets-hyper-link` 1.0.0-beta.2 documents `FRange.getHyperLinks()` as returning all hyperlinks, but its implementation filters cell custom ranges then reads only `ranges[0]`. `cancelHyperLink()` without an argument uses that incomplete list, so it also leaves additional spans. `updateHyperLink()` acts on the first top-left link. The revised Showcase describes these actual boundaries instead of labeling range cancellation as removing every span.

Run `pnpm test:showcase:hyperlinks-enumeration-sdk` against the selected case; `SHOWCASE_DEMO_URL` can target the independently built export. `test-results/hyperlinks-enumeration-sdk/report.json` strictly fails with two B6 SDK custom ranges versus one Facade link and zero browser errors. The normal interaction test verifies sequential first-link removal leaves Routing after Permits, preserves text, and then removes the remaining reported link. A passing boundary demonstration does not fix or certify complete enumeration. No private service, synthetic link list or installed SDK modification is used.

## Cell Notes mounted popup does not follow model updates

Observed on installed `1.0.0-beta.2`. Direct `FRange.createOrUpdateNote()` changes stored dimensions from 220×110 to 320×180 while an already pinned native textarea stays at 220×110 (`test-results/notes/report.json`). Native popup editing followed by Undo restores model text but leaves the textarea displaying the edited text. `pnpm test:showcase:notes` is strict by default and fails on that visible mismatch; `test-results/notes-native-undo-strict/report.json` records zero browser errors and both actual/expected texts.

The same strict failure reproduces in the independently built export (`test-results/notes-standalone-strict/report.json`, zero browser errors), so the Undo mismatch is not specific to Next development mode.

The note facade executes mutations directly rather than the native history-producing command. `SheetsNoteContent` initializes local text/dimensions from the model on popup mount and does not subscribe that local state to later model changes. Apply/Resize in the demo therefore close/reopen pinned notes using public `createOrUpdateNote({ show: false/true })`, with a cancellable frame between those operations. This refresh workaround is explicitly disclosed in runtime and English/Chinese guides; neither SDK packages nor private popup DOM/services are patched.

Observation mode (`SHOWCASE_OBSERVE_KNOWN_DEFECTS=1`) requires the known stale native-Undo text to remain observable, then continues other checks. `notes-standalone-history/report.json` is `passed-with-known-sdk-defect`, not full acceptance. Native Undo/Redo is verified as an uninterrupted sequence, followed by explicit popup reopening. Earlier interleaved host pin/Redo runs fail (`notes-documentation-observed`, `notes-standalone-observed`); the exact cause and supported history semantics across intervening Facade writes remain open. Native debounced edits during teardown and temporary hover-popup updates need separate tests.

## Facade callback items in ribbon submenus

Observed with installed `1.0.0-beta.2` while replacing the Custom Menu demo's three no-op commands on 2026-09-04. `FUniver.createSubmenu().addSubmenu(FUniver.createMenu({ action: callback }))` opens an empty ribbon dropdown. `test-results/custom-menu-submenu.png` captures the empty native popup. In `@univerjs/ui/lib/es/facade.js`, `FSubmenu.__getSchema()` wraps leaves in group nodes; in `lib/es/index.js`, `DropdownMenuWrapper`'s branch for a child-bearing node without its own item is empty. The group is consequently not rendered.

Appending leaves directly through `FMenu.appendTo(['ribbon.start.others', submenuId])` makes the options visible, but selecting Approved then throws `[CommandService]: command "harbor.approval.approve" is not registered.` `FMenu` registers callback actions under generated command IDs. `ToolbarItem.handleSelect()` overwrites the selected command with `option.id`, despite the dropdown supplying `option.commandId`. These are two separate defects, not missing CSS.

The runnable case uses direct ribbon buttons and a cell context submenu, all registered through public Facade methods. Context leaves are appended directly to the submenu path; no service injection, command alias, private schema mutation or SDK package patch is used. `scripts/test-custom-menu.mjs` requires visible native actions, actual SDK readback, canvas pixels, Undo/Redo and resets. Its passing fallback does not certify grouped ribbon submenus. A dedicated minimal failing SDK regression and upstream fix remain to be completed.

## Slides title Undo retains new rich text

- Observed with installed `1.0.0-beta.2` on 2026-09-04. A Northlight text element initially has `text` and `textStyle`, without `textData`. Call `setRichText` with a styled replacement title, focus the presentation and call `undo()`. Undo returns true and restores the original plain `text`, but the new `textData.body.dataStream` survives. The native canvas therefore still paints the edited title.
- `pnpm test:showcase:slides-history-sdk` reproduces this with only Core, Drawing and Slides, without a renderer or React. The browser gate separately requires full-element equality and original native title paint; both fail in the documentation Preview and independent production build. The local source routes full-element undo through `SlidePage.updateElement`, whose spread merge retains properties absent from the old element. That source path is consistent with the observed leftover `textData`; it is not a patched or verified fix.
- The runtime and both localized guides disclose the issue. Strict reports remain failing under `test-results/slides-lifecycle-blank-layers` and `test-results/slides-lifecycle-blank-layers-standalone`. No null-field compensation, custom undo stack, fixture reset disguised as Undo or SDK package modification is used.

## Slides insertion Undo loses the prior active page

- In the same release, activate Atrium (page three), insert an independent copy after it, then Undo. The copied page is correctly removed and original page order returns, but the active page becomes Welcome (page one), not Atrium. The captured native history entry has only `RemoveSlidePageMutation` for Undo and no operation restoring prior selection. The SDK-only reproduction confirms the same behavior without the UI.
- The inspected page-manager deletion implementation searches for the deleted ID in the already-filtered order, producing a first-page fallback. This explains the observed fallback; the broader requirement is restoration of the actual prior selection. No SDK source is changed. Insertion Redo restores the copy ID and selects it; the separate Delete command's Undo/Redo passes the exercised selection checks.
- Two host mistakes were corrected independently: `insertSlide` already activates its new page, so a redundant `setActiveSlide` created a no-op history item; recreation after an explicitly focused unit was disposed required focusing the replacement unit to keep the native workbench visible. Neither host fix repairs the native history defects above. Explicit blank master/layout references also prevent default placeholder content on copied pages; that was a fixture-reference correction, not an SDK history workaround.

## Bases Number cells render null as zero

Visual inspection of the same Mistral fixture exposed `null` estimates rendered as `0.00`. The strict browser test now pairs the actual canvas row-title position with the amount label: r001 stores `null`, while r011 stores the real number `0`; both paint `0.00`. The host subtotal table correctly excludes null from numeric counts, so model-only tests had missed the display difference. The local `bases-ui` Number renderer calls `formatNumberLike`, whose first step is `Number(value)` without a null guard; `Number(null)` becomes zero. No null-to-undefined conversion, replacement renderer or SDK patch is used. This issue remains separate from zero-record groups.

Reproduced with `1.0.0-beta.2` in the documentation Preview and independent production build on 2026-09-04. The strict browser reports are `test-results/bases-groups-final-numeric/report.json` and `test-results/bases-groups-final-numeric-standalone/report.json`; both fail the null-cell paint assertion while verifying the real zero remains visible.

## Bases grouping does not materialize zero-record option groups

- Observed with `1.0.0-beta.2` on 2026-09-04 in both the documentation Preview and independently installed Mistral grouping demo. A SingleSelect field declares the unused `Archived` option. `FBaseTableView.setGroup([{ fieldId: 'status', direction: 'asc', hideEmptyGroup: false }])` succeeds and retains the flag, but its projection contains only groups represented by actual records. Moving a record into Archived creates the group; moving its last record away removes it even with the flag false.
- `pnpm test:showcase:bases-empty-group-sdk` reduces the fixture to four records and reproduces both missing-zero-group cases with only Core/Bases plugins and the facade. It has no renderer, React lifecycle, UI state or synthetic grouping implementation. The strict assertion fails. The corresponding browser gate also fails the requested unused-option group requirement while checking other interactions.
- The local projection source builds its group tree by iterating projected rows; it does not enumerate unused select options. This explains the observed limitation, not a claim about all future releases. Blank field values with existing records form a populated bucket and must not be confused with a zero-record group. The example preserves the distinction, displays the limitation and remains partial; it does not fabricate a row to force an empty header.

## Modern Docs crop-and-size update scales renderer crop offsets twice

- Observed with installed `1.0.0-beta.2` on 2026-09-04 in the Kestrel image demo. Start with a 240 × 150 inline image. Send `UpdateDrawingDocTransformCommand` with `srcRect: { left: 60, right: 60, top: 0, bottom: 0 }` and `size: { width: 120, height: 150 }` in the same command. The document retains that crop, but the actual engine `Image.srcRect` becomes left/right 30. The horizon variant requests top 30/bottom 45 and a 240 × 75 image; render offsets become 15/22.5. These are pixel offsets, not percentage values.
- `pnpm test:showcase:modern-images` fails strict model/renderer crop equality. Initial model-only checks passed, but visual review exposed that the image remained squeezed; the gate was strengthened to inspect the actual render object and canvas drawing dimensions. Its observed-defect mode explicitly records the mismatch and checks other interactions. Model Undo/Redo alone is insufficient to accept rendered crop history.
- No SDK package, engine shape or crop offset compensation is patched. The demo retains both requested and actual render state, and separately tests saved crop after snapshot reload. The precise SDK synchronization fix remains upstream work; a live edit must not require recreating the document to paint correctly.

## Modern Docs ColumnGroup nested images are hidden

- Observed with installed `1.0.0-beta.2` in the scoped documentation Preview and independently installed Vite project on 2026-09-04. The Juniper toolbox image has a `customBlocks` anchor inside `juniper-column-0`; its column skeleton includes a 100 × 60 drawing. The persisted drawing nevertheless receives `hidden: true` and an empty `transforms` array. No SVG image paint occurs while the entire column is visible. The nested booking table and independent body chart render normally.
- `pnpm test:showcase:modern-columns` retains a strict actual-image-paint assertion. `SHOWCASE_OBSERVE_KNOWN_DEFECTS=1` explicitly asserts the hidden drawing and absence of its paint before testing other interactions. Layout geometry alone is not image-rendering evidence.
- The demo does not move the required image out of the column or render a host HTML replacement. Its hint and guide explain the missing image. No installed or upstream SDK code was changed.

## Modern Docs ColumnGroup deletion retains orphan resources

- On the same release, removing the Juniper workstation group removes its table ranges and image anchor, but retains the corresponding `tableSource` and `drawings` entries. Reinsert a column group, then insert the same table ID: the SDK reports `Trying to overwrite value at key. Your op needs to remove it first`. `getImage()` still finds the unanchored image, so checking object existence alone would incorrectly report successful image insertion.
- `pnpm test:showcase:docs-column-resources-sdk` reproduces both retained resources using only Core, Docs, Column, Table, Drawing and Render Engine plugins; there is no React host or browser. It logs `{ groupRemoved: true, orphanTable: true, orphanImage: true }` and fails the strict cleanup assertion. This records the current lifecycle limitation, not a claim about every SDK release or its intended retention policy.
- The host detects orphan resources before appending a placeholder paragraph or invoking reinsertion, reports the conflict and offers the existing Reset. Browser checks separately verify that group-deletion Undo restores content and that table/image ownership stays correct through other structural edits. Reset is not presented as SDK cleanup or Undo.

## Docs Table Facade cell-text edits cannot be undone

- Observed with installed `@univerjs-pro/docs-table` and Core/Docs `1.0.0-beta.2` on 2026-09-04. Create the Cedar table from data, clear initial history, call `setCellText(1, 1, 'Mara Chen')`, then Undo. Editing returns true; Undo returns false and the cell still reads `Mara Chen` rather than `Mara`.
- `pnpm test:showcase:docs-table-undo-sdk` reproduces this with the real Render Engine, Docs and Docs Table plugins, without React or a browser. The default browser gate also fails. Its explicit observed-defect mode tests other behavior; it does not establish working edit history.
- The inspected local Facade implementation forwards mutations through `executeRichTextTableActions` without a trigger argument, while Docs history skips mutations with no trigger. This source path is consistent with the failure, but no SDK code or installed package was patched.
- The demo separately verifies deletion Undo, actual header paint and rendered column/row dimensions, snapshot reload and native cell editing. Adding an owner consists of row insertion and four cell edits, not an atomic history action. Reset is explicitly distinct from Undo. The guide and visible hint disclose the defect; coverage remains partial.

## Modern Docs native bookmark navigation is missing

- Observed with installed Docs/Hyperlink `1.0.0-beta.2` on 2026-09-04. Atlas stores actual `CustomRangeType.BOOKMARK` ranges, and hyperlink URLs reference them as `#bookmark=atlas-returns` or `#bookmark=atlas-handoff`.
- The explicit host Open target control resolves the live SDK range, selects the heading and invokes the SDK scroll controller. Inserting a paragraph before the destination moves the range; subsequent navigation still reaches the same heading. This is documented host integration, not a native feature claim.
- The browser test collapses a real selection inside the summary hyperlink, opens the native SDK link popup and clicks its displayed address. A new tab opens with the fragment; selection in the original document does not move to the bookmark. `SHOWCASE_NATIVE_BOOKMARK_CHECK=1 pnpm test:showcase:modern-links` (set the environment variable using the current shell) strictly requires in-document navigation and fails.
- No SDK source, installed package, browser-open function or editor renderer is patched. Host URL validation rejects unsafe schemes, control characters and credential-bearing URLs, but these checks do not certify native popup URL handling. The capability remains partial.
- This release's generic custom ranges use inclusive text indices, without code-block sentinel semantics. The demo reads `[startIndex, endIndex + 1)` and sets selections with an exclusive end. Applying code-block offsets here would omit the first and last characters; that host implementation mistake was corrected before acceptance checks.

## Modern Docs code text, history, layout and slash input

- Observed on installed Core/Docs and Pro Docs Code `1.0.0-beta.2` on 2026-09-04. The Beacon code-block case retains an independent SQL comparison and four distinct source samples.
- `FDocumentCode.getText()` concatenates paragraphs without line breaks; the underlying SDK snapshot retains all paragraph breaks, blank lines and tabs. `pnpm test:showcase:docs-code-text-sdk` reproduces this without a browser and fails strictly. Copy explicitly uses `save().body.dataStream` over the current block range, removes only the structural final break and normalizes paragraph breaks to LF. Inspect shows both the defective getter result and snapshot text. OS clipboard CRLF normalization is accounted for separately.
- Changing the primary language from TypeScript to plaintext correctly changes actual syntax glyph colors without changing code. Undo then returns false and leaves plaintext configured. No replacement history implementation is provided.
- Setting `wrap: false` leaves the long final paragraph on three rendered lines; `showLineNumbers: true` does not paint the first-line number; changing `tabSize` from 2 to 8 leaves the tabbed text inset unchanged. Config readback alone would incorrectly claim these settings work.
- Native ordinary text typing updates the snapshot; typing `/` does not insert the character. The local Docs UI paragraph-menu service intercepts slash keydown/input before checking for a usable paragraph target and has no code-block exclusion in its slash predicate. This is consistent with the observed behavior; no upstream or installed SDK files were changed.
- `test-modern-code.mjs` is strict by default. Its explicit observed-defect mode exercises remaining interactions; adding `SHOWCASE_CODE_CHECK=text|history|wrap|numbers|tabs|native` focuses one strict regression while observing preceding failures. The feature and both localized guides disclose these limitations and coverage remains partial.
- A host range bug was fixed independently: when wrapping an example ending with an empty paragraph, include that final paragraph break rather than passing its collapsed range. This preserves the appended blank line through unwrap/rewrap; it does not repair any SDK getter, history or layout issue.

## Docs list item scope mutates a neighboring custom marker

- Observed on `@univerjs-pro/docs-list` and Core/Docs `1.0.0-beta.2` on 2026-09-04 in the scoped documentation Preview, independent production project, and `pnpm test:showcase:docs-list-scope-sdk`.
- Reproduction: create an ordered installation list; indent LABEL and LIGHT separately; set LABEL to `UPPER_LETTER` with `mode: Level`; then set LABEL to `LOWER_ROMAN` with `mode: Item`. LIGHT changes from glyph type 4 to 7 too, and visibly becomes `ii.` instead of `B.`.
- Both items retain `CUSTOM_LIST_mosaic-install_490`. The custom list type is derived from the active item's list ID and paragraph offset, so the second edit reuses a definition already shared with the neighbor. No host cache or separate DOM rendering is involved.
- The minimal regression registers the real Render Engine, Docs, and Docs List plugins without a canvas or React. It fails the assertion that LIGHT's marker type remains unchanged. The browser script separately exercises remaining behaviors and explicitly observes the disclosed defect; its pass is not an item-isolation acceptance gate.
- The example and bilingual guide disclose the limitation. No SDK source or installed package was patched, no neighboring model was manually repaired, and the capability remains partial.

## Boards standalone delivery size (production observation)

- On 2026-09-04, the independently generated connector-routing project built successfully with Vite `8.2.2` and the installed Univer `1.0.0-beta.2` packages.
- The minified build emitted an approximately 15.02 MB main JavaScript chunk (3.58 MB gzip), plus lazy language and hyphenation chunks, and triggered Vite's default large-chunk warning.
- This does not contradict the feature's interaction and rendering acceptance, but it is a catalog-level delivery concern. Profile shared SDK imports and cold-load behavior before setting a public performance budget; do not silence the warning or claim the bundle is optimized.

## Boards Facade metadata locking rejects valid patches

- Observed with installed `@univerjs/core` and `@univerjs-pro/boards` `1.0.0-beta.2` on 2026-09-04.
- `FBoard.setElementMetadata(id, { locked: true })` returned `false` for an existing, visible, selectable, unlocked root shape. `FBoard.setElementsMetadata()` likewise returned `false` for three valid shapes after grouping; no element changed.
- The exported `SetBoardElementsMetadataOperation`, dispatched with `FUniver.syncExecuteCommand()`, successfully locked and unlocked the same elements and participated in Undo/Redo. Subsequent `FBoard.translateElement()` correctly rejected movement while an element was locked.
- The group/lock/z-order demo therefore uses the public operation and labels it exactly. This verifies locking behavior through that operation, not the two affected Facade helpers; do not replace the operation with the Facade calls until a regression test passes.

## Boards nested disband Undo changes sibling layer order

- Observed with installed Core and Boards `1.0.0-beta.2` on 2026-09-04 in both the browser and a UI-free reproduction: `pnpm test:showcase:boards-group-undo-sdk`.
- Group Photo, Caption, and Credit; wrap that group with Priority; disband the outer and then inner containers; Undo twice. Both containers and parent relationships return, but the outer children change from `[mediaGroup, priority]` to `[priority, mediaGroup]`. The restored containers are appended to the global element order rather than occupying their original positions.
- The strict regression fails on this release. The browser interaction check separately verifies restored membership, current group-ID readback, idempotent regrouping, and rendered geometry; a passing browser check does not establish correct layer-history restoration.
- The demo no longer caches group IDs in host variables. It discovers the exact direct-child groups from the live SDK hierarchy before inspection and actions. That host-state fix prevents stale IDs and duplicate regrouping, but does not repair the SDK's ordering defect.
- The guide and visible hint disclose the ordering limitation. No installed package or upstream SDK source was patched, and this capability is marked partial in the coverage ledger.

## Paragraph IDs change ownership after paragraph-style Undo


- Observed with installed `@univerjs/core` and `@univerjs/docs` `1.0.0-beta.2` on 2026-09-03.
- Reproduction: create a Traditional document with distinct paragraph IDs, get paragraph 3, apply `setStyle({ lineSpacing: 1.4 })`, then call `document.undo()` and inspect every paragraph's `paragraphId`, `startIndex`, and text.
- Before: `para_paragraph-typesetting_3` ended at offset 536; `_4` ended at 572.
- After Undo: `_4` ended at 536; `_3` ended at 572. The document text was unchanged, but looking up the original ID returned the following paragraph.
- The same observation occurred with SDK-generated IDs and explicitly seeded valid `para_` IDs. Valid seeded IDs must retain the SDK's `para_` prefix.
- The paragraph-typesetting demo now resolves the description immediately after its visible marker. This keeps that feature usable through Undo/Redo, but does **not** demonstrate paragraph-ID stability. Do not present it as doing so.
- No SDK source files, installed packages, remote issues, or PRs were changed by this observation.

## Modern Docs history and zoom across recreated units

- Observed on beta.2 on 2026-09-04 while exercising `docs-modern/paragraph-heading-blocks`. Native typing is debounced into history. Disposing and recreating a document with the same ID before that history is flushed let a subsequent Undo combine old typing with the new unit's removal, damaging the restored heading/summary boundary.
- The example explicitly clears pending history through the exported `DocStateChangeManagerService.clearHistory()` and committed history through `IUndoRedoService.clearUndoRedo()` before ending an editing session. The browser check types natively, immediately resets, removes a heading, and undoes that removal.
- A separate same-ID lifecycle problem surfaced when applying `SetDocZoomRatioOperation` after recreation: `getDocEffectiveZoomRatio` received a null model from an old zoom listener. The installed `DocZoomRenderController.dispose()` clears timers but does not call its base disposal method; its registered command listener can therefore survive. No installed or upstream SDK source was modified.
- The example now assigns each recreated document a fresh unit ID while retaining deterministic fixture content and block IDs. Fit-width resizing and reset then pass without the stale same-ID callback. This is a host lifecycle precaution, not proof that the SDK listener leak is repaired or that arbitrary same-ID recreation is safe. A dedicated upstream lifecycle regression is still needed.

## Modern Docs Quote combined-color Undo fails

- Reproduced on installed beta.2 on 2026-09-04 through the documentation Preview and SDK-only `pnpm test:showcase:docs-quote-undo-sdk`.
- Insert the Harbor voice quote; set blue line/text colors; clear setup history; call `setStyle({ lineColor: '#16A34A', textColor: '#14532D' })`; then Undo. Undo returns `false`, and both colors remain green instead of the previous blue pair. The minimal case retains its original quote block range, unlike the separate Callout duplication defect.
- The strict SDK regression asserts both colors, block ranges, inline text runs, content, and Undo success. The browser script defaults to strict failure. Its optional `SHOWCASE_OBSERVE_KNOWN_DEFECTS=1` mode explicitly observes the failed Undo while testing other controls; it does not repair or ignore the failure. Deletion Undo is tested independently and must not be treated as proof of style Undo.
- The demo exposes the failure in its hint and status/readback, keeps the real SDK Undo control, and uses Reset for explicit fixture recovery. No SDK source or installed package was modified.

## Modern Docs Callout text-color Undo corrupts block ranges

- Reproduced on installed beta.2 on 2026-09-04 in the documentation Preview, isolated Vite production project, and SDK-only `pnpm test:showcase:docs-callout-undo-sdk`.
- Create the Tide risk callout, set brown text, clear setup history, set green text, then Undo. Undo returns `false`; the original range `[244, 408]` remains, but additional ranges `[245, 408]` and `[408, 408]` with the same ID appear. The green color remains instead of brown. Repeating Undo adds more duplicates.
- The strict regression checks structural identity, original text runs, text, and Undo success. It intentionally fails; it does not accept the corrupt state as correct. The demo exposes raw ranges and a visible failure message. Reset recreates the original fixture through normal SDK disposal/creation. No installed or upstream SDK code was changed, and no duplicate ranges are silently removed.

## Modern Docs Callout padding config does not update layout

- Reproduced on the same beta.2 installation. `updateConfig({ paddingLeft: 28 })` updates a callout initially configured with left padding 20, but its derived paragraph `indentStart.v` remains 60 rather than 68. `pnpm test:showcase:docs-callout-padding-sdk` is the strict SDK-only regression.
- The browser check also switches compact padding (6 vertical / 10 horizontal) to roomy (24 / 28): config changes, but the actual renderer text inset and fragment height do not. It observes the renderer extension and canvas paint without changing model or rendering behavior. Border styles, colors, icons, and visibility are separately checked through actual paint calls.
- `test-modern-callouts.mjs` defaults to strict acceptance and fails. Set `SHOWCASE_OBSERVE_KNOWN_DEFECTS=1` only to continue the other interaction checks while asserting the disclosed defects remain observable; its report is `passed-with-known-sdk-defect`, not complete capability acceptance. The demo keeps density controls and explains the discrepancy instead of simulating padding in host CSS.

## Exchange endpoint authorization (previous observation)

The existing frontend Exchange integration previously received HTTP 401 from its configured development endpoint. Import/export completion requires an authorized endpoint/session or suitable license configuration. A registered plugin and a dispatched request alone are not evidence that conversion or a round trip succeeded. Recheck the live endpoint before reporting this issue as current or resolved.

## Bases sort-key edits retain stale row order

- Observed with installed `@univerjs/core`, `@univerjs-pro/bases`, and `@univerjs-pro/bases-ui` `1.0.0-beta.2` on 2026-09-04. The npm registry's `beta` tag for all three was still beta.2 when checked that day; no version upgrade was applied.
- Minimal reproduction: `pnpm test:showcase:bases-sort-sdk`. This uses only Core, Bases, and the Facade, without React, UI plugins, or a renderer.
- Set `score DESC` on the calibration fixture, read its projection, then set Meridian's score from 82 to 98. `setValue()` succeeds and source/projection values read 98, but `getProjection()` still puts Atlas/Flux/Indigo (95) ahead of Meridian. The strict assertion fails; this is **not** a passing acceptance test.
- Browser reproduction: `pnpm test:showcase:bases multi-field-sort`. The visible grid also retains the old position after the edit.
- Diagnostic inspection found that the command and cell invalidation were delivered, the renderer and Facade shared the same unit/projection service, and a fresh internal sort calculation produced the correct order. This localizes the symptom to cached projection behavior; it does not establish an upstream code fix.
- The demo discloses the limitation beside its controls and in its guide. It does not clear/reapply sorts, rewrite SDK caches, or sort rows in host code to disguise the failure. Live sorting remains incomplete.

## Bases duplicate canvas after a speculative React mount

- On beta.2, synchronously initializing Bases in a React development effect and immediately disposing/recreating it left two `render-canvas` elements with the same unit ID in one canvas root. A late canvas from the discarded instance covered the active canvas; the host readback and active renderer's draw commands changed, but users saw the baseline.
- All four Bases Preview adapters (three features and Content Pipeline) now schedule SDK startup for the next animation frame and cancel that startup on effect cleanup. They also wait for a resolved theme. This prevents the discarded development mount from launching SDK async UI work. The standalone entries continue to use the same SDK initialization functions.
- Verification now asserts exactly one canvas after initial load, two resets, and reload. It also observes real canvas text calls for the filtered budget and reordered headers, in addition to SDK projection checks and screenshots.
- Content Pipeline's single-canvas checks for initial load, view switching, reset, and reload also pass via `node scripts/test-showcase-regressions.mjs bases/content-pipeline` on a server scoped to that route. This does not establish complete host-control/source parity for that older showcase.
- This is a host lifecycle correction, not proof that beta.2 can safely dispose/recreate an already-starting instance under every host. Rapid navigation/theme changes still require a lifecycle audit.

## Bases numeric null display

The beta.2 grid displays `0.00` for the seeded null score/temperature/pH values in these fixtures, while Facade and projection readback preserve `null`. Do not describe that formatting as distinguishing an empty measurement from a real zero. A dedicated field-formatting demonstration must verify that distinction before claiming it.

## Sheets async formula re-registration and pending disposal

- Observed on installed `1.0.0-beta.2` in Custom Formula. Dispose the two `registerAsyncFunction()` handles, recalculate, and observe genuine `#NAME?`. Register the same names again and force calculation: the cells remain `#NAME?`. `test-results/custom-formula/report.json` retains that strict failure. Reloading a workbook snapshot after registration restores the scalar and spill outputs. The demo labels this as **Register & reload snapshot**, preserving user-edited cells but discarding prior Undo history; it does not claim re-registration alone works or patch the engine.
- The original `stopCalculation()` + immediate owner disposal during an async lookup caused an uncanceled SDK progress timer to call `LocaleService.t()` after destruction. `test-results/custom-formula-ownership/report.json` records the browser exception. Inspection of installed `sheets-formula`'s TriggerCalculationController shows a one-second progress timer cleared by calculation completion, but not explicitly by its `dispose()` implementation. A stop request is not evidence that calculation has finished.
- The shared host factory cancels its deterministic local source (settling promises with a formula error), waits for Facade `calculationEnd()` while retaining the owner, and then disposes it outside the event dispatch. No arbitrary disposal delay, global timer interception, suppressed exception or SDK patch is used. `custom-formula-ownership-final/report.json` passes pending reload and timeout teardown/remount with all nine owners disposed and no errors. This does not establish SDK cancellation of arbitrary remote providers.
- Functional checks are `pnpm test:showcase:custom-formula` (selected running page) and `pnpm test:showcase:custom-formula-source` (local source). Final browser passes include source/export parity and edited-cell preservation across snapshot recovery. The initial failure remains a record of unsupported plain re-registration, not a passing SDK gate.

## Sheets row-count reduction retains out-of-bounds data and selection

- Observed in installed `@univerjs/sheets` / Core preset `1.0.0-beta.2` through `scripts/test-big-data.mjs`. Populate tracked windows around rows 500,001 and 995,001, leave the active range at A995001, then call `FWorksheet.setRowCount(10_000)`.
- The worksheet reports 10,000 rows, but `getLastRow()` still reports the retained row 1,000,000 after capacity is restored; the populated cells were not removed. Immediately calling `getActiveCell()` while capacity is 10,000 throws `Range is out of bounds` because the selection still points at row 995,001.
- The demo moves the selection to A1 and clears only its tracked out-of-bounds windows before shrinking. It does not scan or normalize unknown workbook data, patch the SDK, suppress the exception, or claim the multi-command action is one Undo item. One Undo restores row capacity while earlier clear steps remain separate.
- This is a browser-observed public-Facade regression, not yet a renderer-independent minimal reproduction. Arbitrary selections, merged ranges, unknown sparse data and row-count command failure still need isolation.

## Sheets viewer mode replays existing Undo history

- Installed `1.0.0-beta.2`: edit 18 to 7, switch to `FWorkbookPermission.setReadOnly()`, and invoke native Ctrl+Z. `canEdit()` remains false but the value becomes 18. The browser failure is retained in `test-results/read-only-event-gate/report.json`.
- `pnpm test:showcase:read-only-history-sdk` reproduces this with only Core/Sheets and their Facades: it first proves actual focused-workbook Undo/Redo while editable, then asserts viewer Undo preserves 7. It intentionally fails with `valueAfterUndo: 18`. Calling global `api.undo()` without a focused unit was not a valid reproduction; the final test focuses through `FWorkbook.undo()` and checks the editable counterexample first.
- Read Only uses the public cancelable `BeforeUndo` / `BeforeRedo` Facade events as a disclosed host policy. Editor history still works and remains available after switching back; viewer history changes are canceled. This is not a repaired SDK permission implementation, server-side access control, or a claim that arbitrary low-level mutations are prohibited.

## Slides cross-type Undo retains image bytes; single-element deletion Undo changes stacking order

- Reproduced on installed `1.0.0-beta.2` while building Product Launch's local-media variant. `pnpm test:showcase:slides-media-history-sdk` is a strict model-only reproduction, without renderer or host controls. Change a Shape to an Image with `UpdateSlideDrawingCommand`, then Undo: the type/appearance returns to Shape, but `source` and `imageSourceType` remain on the saved element. Image bytes therefore remain in the snapshot despite apparent removal. This regression intentionally fails; it is not a passing acceptance check. The synthetic source is only a data marker because no image decoding is involved.
- Run the same reproduction with `delete-order` to isolate another issue: deleting a single middle element with `FSlide.deleteElement()` and undoing appends it instead of restoring its original index. The inspected SDK removal path retains insert indices for expanded group removals but not this single-element case. Product Launch's strict browser checks detected both defects; no expected-state normalization removes the retained fields or ignores stacking order.
- The demo uses supported native commands as a host transaction: move the slot to the end if needed, delete it, and insert the image at its original index, under a fresh `IUndoRedoService.beginUndoRedoGroup(..., 'append')` for each replacement. Undo then restores the exact old element and its original order; successive replacements remain independently undoable. Failed insertions attempt native undo of the completed group. This is not an upstream SDK repair, and the command-failure recovery path has not been fault-injected.
- `setActiveSlide()` also contributes a history entry, even when redundantly activating the same page. The media action now activates only when needed and before the image transaction, so the top Undo concerns the image. Native toolbar actions are tested after returning focus to the canvas.
- Snapshot recreation immediately after a focused image edit initially left a blank live editor. Product Launch now clears old history, disposes, gives the old UI two animation frames to unmount, creates a fresh unit ID, and then focuses/clears history for the new unit. Actual Canvas pixels after reload are verified; snapshot metadata alone was insufficient. This scoped lifecycle correction is not certification of arbitrary rapid disposal/recreation across products.
