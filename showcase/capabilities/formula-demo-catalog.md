# Data-driven Formula Demo Catalog

Status: 30 registered and implemented Formula routes, all ledgered partial; zero fully accepted. This expands the previous three API-oriented examples. Route count is not capability completion. All authored content and code remain English with EN/ZH guide metadata.

## Start with the visible behavior

These are existing examples, not new implementations announced by this tour. Follow each linked guide for the exact source edit, runnable snippet, expected visible result and known acceptance gaps. Screenshots are existing captures, not a fresh runtime verification.

| Feature | Example and source | What to change and observe |
|---|---|---|
| Edit data inside a presentation | [Lumen / Sheet@Slide Float](../embed/sheet-to-slides-float/README.md) | Change selling price from 45 to 48; revenue becomes 11,520 and dependent values update across three slide pages. |
| Keep a presentation inside the data workspace | [Atlas / Slide@Sheet Float](../embed/slides-in-sheets-formula-float/README.md) | Change equipment cost from 2,400 to 3,000; delivery cost becomes 9,000 and the embedded presentation margin becomes 25%. |
| Keep narrative linked without replacing prose | [Pollen / Campaign pulse](../embed/sheet-to-modern-doc/README.md) | Increase Search spend from 4,800 to 6,300; thirteen inline values distinguish overall return from individual channels. |
| Preserve traditional document structure | [Linen / Services schedule](../embed/base-to-traditional-doc/README.md) | Change service fees and hours independently; twelve inline values update across three A4 chapters while authored text and pagination are checked. |
| Put calculations into an operational map | [Reed / Board@Base Tab](../embed/boards-in-bases-formula-tab/README.md) | Change workstream load or capacity; twelve Formula Shapes distinguish overall capacity from local overload in a connected Board. |
| Drive real chart series | [Moss / Support demand](../embed/base-to-chart/README.md) | Change weekly Base demand; visible Sheet SUMIFS and native chart bars update. Filtering the Base view does not implicitly filter whole-table calculations. |
| Reconcile two sources across four outputs | [Kestrel / Planning and actuals](../embed/mixed-to-many-products/README.md) | Change posted Base actuals independently from the Sheet plan; Doc, Slides, Board and chart must agree on the resulting variance. |
| Follow a two-hop dependency | [Meridian / Calculation chain](../embed/base-sheet-calculation-chain/README.md) | Change Base quantities, then Sheet rates; inspect the intermediate calculated cells and all downstream consumers. |

View the existing native captures: [Sheet@Slide](../../public/assets/showcase/embed-sheet-to-slides-float.png), [Slide@Sheet](../../public/assets/showcase/embed-slides-in-sheets-formula-float.png), [dual-source workspace](../../public/assets/showcase/embed-mixed-to-many-products.png).

### Browse by capability, then by business example

The intended navigation is `Features > Formula / Data-driven composition > Capability family > Example`. The families below organize the existing thirty routes; they do not introduce thirty more routes. Variants remain inside an example, not another navigation level.

| Capability family | Existing examples | Count |
|---|---|---|
| Reference and binding foundations | Harbor, Beacon, Estuary | 3 |
| Data-linked modern narratives | Pollen, Cinder, Saffron, Cypress, Ember | 5 |
| Data-linked traditional documents | Aster, Linen, Cobalt | 3 |
| Live presentations in either hosting direction | Lumen, Orchid, Atlas, Solstice, Indigo, Nova, Violet | 7 |
| Connected operational Boards | Willow, Flint, Grove, Delta, Juniper, Reed | 6 |
| Formula-backed native charts | Tide, Moss, Prism | 3 |
| Multi-output workspaces and calculation chains | Aurora, Kestrel, Meridian | 3 |

Hosting direction is not write-back: `Slide@Sheet` still supports `Sheet -> Slide` calculation. Editing an output's authored text is not editing its source data. Direct Base-to-chart binding, arbitrary chart destinations, PDF formula consumption and cyclic write-back are not implied by this catalog.

Atlas (055) and Solstice (056) now have partial runtime evidence: five/six literal
examples update six/twelve native results across two/three slide pages. Float and
Tab use real native hosts; selected editing/history, theme and source/CSS export
checks pass. Harbor and Beacon retain known native issues;
catalog entries must not be treated as fully accepted merely because a route exists.

Estuary (041) is also partially implemented: six literal examples, two native
DocBlock sources, four visibly updated inline results, unchanged document body,
Base fullscreen return/disposal, EN/ZH themes and independent source/CSS export
have evidence. Its strict runtime report remains FAIL: #DIV/0! is displayed but
reported as success by beta.2. It is not a fully accepted error-state demo.

Willow (049) has partial evidence for Sheet -> Board: eight native Formula Shapes,
one real Sheet Float, nine literal examples, source typing/history, local versus
total overload, zero/blank/text input and recovery, Print preview, selected
fullscreen disposal, EN/ZH themes and source/CSS parity. Complete persistence,
source identity/rebinding, all Board interactions and performance remain open.

Tide (052) has partial evidence for Sheet -> visible formula range -> native
column chart. Seven literal examples, independent Actual/Plan series, zero/share
errors and recovery, real bar-height checks, native PNG export, EN/ZH themes and
source/CSS parity pass selected checks. Its strict native report remains FAIL:
the source Float is blank and fullscreen typing overwrites a host formula instead
of the source cell. This is not a completed native-source interaction demo.

Flint (050) now has partial Base -> Board evidence: five original delivery records
drive nine native conditional formula results and three connected workstreams.
Thirteen literal examples, status/estimate/metadata isolation, blank/zero recovery,
real title/Hours input, exact native Base Undo/Redo, active-fullscreen disposal,
source/CSS export, display-name stability, whole-table versus filtered-view behavior,
hidden-record edits and two-snapshot reconstruction pass selected checks. Recovery
preserves edited formulas and live updates; only the native embed reactivation
timestamp changes. SDK disposal warnings remain. Both EN/ZH guides complete all
thirteen snippets and theme checks, but the overall expanded guide report FAILS
on a Next manifest/playground HTTP 500 before recovery. Missing-source/rebind,
every native path and delivery/performance remain open.

Aster (044) adds partial Sheet -> Traditional Doc evidence: ten native inline
formulas in three A4 chapters. Nine exact examples, visible results on both summary
and interpretation pages, unchanged body/pagination, native source typing/history,
Sheet Print preview/cancel, active-fullscreen disposal, EN/ZH themes and independent
source/CSS export have selected evidence. Its strict report remains FAIL: five
empty-sample errors are displayed but returned as success/string values. This is
not full acceptance of error handling, persistence, document conversion or performance.

Lumen (047) adds partial Sheet@Slide Float evidence: one pricing Sheet drives
nine native Formula Shapes across three launch pages. Ten literal examples,
current native canvas results, independent assumptions, blank/null versus zero,
invalid text, zero-spread errors/recovery and unchanged authored layouts pass
selected checks. Native inline typing/value history, exact Redo, correct-source
async Print preview/cancel, ordinary disposal, EN/ZH themes and source/CSS export
have evidence. Strict runtime remains FAIL on off-page writes, retained Undo
style metadata and fullscreen entry. Fullscreen-dependent disposal remains open.

Nova (064) adds partial Sheet@Slide Tab evidence: a real Sheet data page in the
native Slides page list drives thirteen Formula Shapes across three operating
review pages. Ten literal snippets, independent actuals/targets, zero/blank/text,
local/overall errors, recovery and current canvas values pass selected checks.
Native typing/value history, exact Redo, correct-source Print menu, active-source
disposal, EN/ZH themes and eleven-file source/CSS export have evidence. Strict
runtime remains FAIL on inactive-source writes and retained Undo style metadata.

Violet (065) adds partial Base@Slide Tab evidence: eight fictional editorial
records drive thirteen native results on three pages. Twelve exact snippets,
count versus word-weighted coverage, display labels versus stable IDs, filtered
view versus whole table, hidden edits, null/zero and native error/recovery pass.
Off-page writes, native title/number editing with exact Base Undo/Redo, active
data-page disposal and independent source/CSS export also pass selected checks.
Missing/rebound sources, persistence, all menus and delivery remain open.
Its responsive build adds verified native page-list toggling and current slide
paint at 320/390px without changing business data or authored layout. The rebuilt
standalone formula/CSS checks pass; outer Next page checks retain development
Performance.measure errors. This does not certify the entire mobile editor.
Orchid (048) now has partial Base@Slides Float evidence: after native source
activation, all twelve literal snippets update twelve native values on all three
current canvases. Native amount typing, activated-Float disposal, official-CSS
export and EN/ZH literal/theme integration pass selected checks. Passive/off-page
writes, title Undo and fullscreen retain failures. The activation prerequisite
is explicit in its README; no extra helper API or SDK patch is used.
Cinder (043) adds partial Base -> Modern Docs evidence: eight original incidents
drive ten inline results in real handoff prose. Seventeen literal examples,
current-canvas values, unchanged body, whole-table versus view filtering, hidden
edits, null/zero, empty-queue recovery, native fullscreen typing, same-session
exact Undo/Redo, disposal and independent source/CSS export pass selected checks.
Explicit native source mapping fixes the earlier rename failure. Rename plus
live input, idempotent mapping, visible missing-binding errors and same-source
repair pass current-canvas checks. Native error-status classification and Undo
after fullscreen reentry still fail. EN/ZH integration passes all seventeen
examples, card absence and full-model theme preservation.
Aurora (066) adds partial Sheet -> four outputs evidence: a community exhibition
budget drives eight Doc inline values, eight Formula Shapes on three Slides,
six Board cards and a native chart reading a visible formula-backed Sheet range.
Twelve literal examples, independent assumptions, zero/blank/text and recovery,
real keyboard input, current canvas values and actual chart geometry pass selected
checks. Authored content/layout, source identity after rename and active-Board
disposal are checked. EN/ZH first-snippet/theme integration and eleven-file
source/CSS export pass. Strict runtime remains FAIL on Doc #VALUE! status being
reported as success/string. Full persistence, rebinding, native editor actions,
responsive behavior and delivery performance remain open.

Kestrel (067) adds partial dual-source/multi-output evidence: eight Base expense
records and an independent Sheet plan drive ten Doc values, nine Slide Formula
Shapes, seven Board cards and two native chart series. Seventeen literal examples,
real Base/Sheet keyboard input, current canvases, actual bar geometry, status and
filter isolation, hidden edits, source-activated renames, authored preservation
and active-Board disposal pass selected checks. EN/ZH first-snippet/theme checks
pass. Strict reports retain native Doc error-status, off-page Base rename/navigation
and Formula editor number-format click failures. Both editor languages display
complete dependency labels; a translated button is not proof of usable interaction.

Meridian (068) adds partial two-hop calculation evidence: Base quantities feed
visible Sheet SUMIFS, multiplication and total cells; those cells drive eleven
Doc inline values, nine Slide Formula Shapes, six Board cards and native chart
columns. All nine literal examples, current canvases, real column geometry,
independent Base/Sheet keyboard input, authored-content preservation, both saved
reference layers and active-Board disposal pass selected checks. Eleven-file
source/CSS export passes. Strict reports retain Doc error-status and EN/ZH Formula
number-format click failures. Both languages have complete dependency packs and
working Edit formula/cancel actions. Reload, rebinding, other native interactions,
Next/theme integration and performance remain open.

Moss (053) adds Base -> visible Sheet SUMIFS -> native chart evidence. Twenty
literal examples, actual two-series bar geometry, calculated shares/growth,
filtered projection/hidden-record edits, null/zero, unmatched week, native Base
typing, display-name rewrite and unavailable-source/repair pass selected checks.
Unavailable sources clear both old series; repair preserves chart identity.
Native fitted-page Print (actual painted series), PNG export, five complete
EN/ZH locale packs, model-preserving themes and active-Base disposal pass.
Eleven-file source/CSS export passes. Native Print uses the asynchronous public
command because beta.2's synchronous openPrintDialog wrapper throws. Actual
reload now has selected evidence in test-results/embed-moss-roundtrip-native/report.json:
the literal two-snapshot reconstruction preserves edited formulas, native chart
identity/configuration, filters and both models, apart from checked native embed
activation time and empty named-range serialization. Fresh hidden Base edits and
native Sheet criterion typing repaint the chart. Invalid bindings survive reload,
explicit repair works, removed charts stay absent, and EN light/ZH dark owners
retain locale/theme. Six invalid pairs leave the current owner untouched.
Rename must persist the new qualifier explicitly; the earlier serialization run
demonstrates stale post-reload results without it. Different valid-source rebinding,
arbitrary native rename paths, all menus, Next and responsive/performance remain open.

Linen (045) adds Base -> Traditional Doc evidence: four original service records
drive twelve inline values across three A4 chapters. All fifteen literal examples,
two current output-page canvases, exact body/pagination preservation, included versus
optional fees, independent hours/context, filtered projection and hidden edits,
null/zero, source rename, unavailable bindings and repair pass selected checks.
Native fee typing, detached reading copy, four EN/ZH packs, themes and active-Base
disposal pass. EN/ZH Edit formula, number-format dialogs and cancellation pass the
separate locale test. Source/CSS export passes. Strict runtime remains FAIL because
native errors are reported as success/string. ROWS replaces COUNTA so a missing
source does not misleadingly count its error as one record. Reload, another valid
source, every native action, Print/Exchange, Next and delivery remain open.

Indigo (057) adds the reverse Slides@Base Tab placement: the Base is both host
and formula source. Fourteen literal examples drive twelve Formula Shapes on
three original community-programme pages, including total/mean, per-project
allocation shares and largest-project concentration. Full authored slides,
filtered/hidden records, null/zero, native errors and explicit source repair,
rename and fresh calculation have selected evidence. Native keyboard input,
exact Base Undo/Redo, nine EN/ZH packs, themes and source/CSS export pass. Strict
runtime now passes the selected continuous flow: off-page writes paint the active
child before navigation; native return and further keyboard editing work without
reload. Renderer-only ownership preserves the root Base and its native workbench.
The twelve disposal warnings are resolved by explicit child-then-host disposeUnit
before SDK teardown. The current full-example regression has no warnings, and a
separate lifecycle test passes active-child, native editing, idempotence, newer
global owner and pre-Steady disposal. The literal two-unit reconstruction example
now passes four saved-state variants, full snapshot comparison except declared
opening-page selection/activation time, post-reload hidden-record/native typing,
edited formula/format/content, missing-source recovery and deletion preservation.
See test-results/embed-indigo-roundtrip-preserved/report.json. Saved thumbnail
renders are excluded from generic main-canvas ownership to avoid early startup
activation errors. Durable storage, every editor action, responsive/accessibility
and delivery remain open. Continuous-flow reports:
test-results/embed-indigo-continuous-navigation/report.json and
test-results/embed-indigo-owned-disposal/report.json. This does not establish that
similar navigation failures in other composition routes have been fixed.

Reed (063) adds Board@Base Tab: a fictional repair station drives twelve native
Formula Shapes and three bound connectors from workstream load/capacity/status.
Sixteen literal examples, exact empty-filter projection, hidden edits, null/zero,
negative remainder, division/missing-source errors and repair, source rename,
native typing/history and passive output/return navigation pass selected checks.
The complete authored map is preserved; ten EN/ZH packs, full-model themes,
native connector endpoints and active-child disposal pass without browser errors,
warnings or backend requests. Initial theme resolution and child-root cleanup
were corrected in the factory using existing SDK APIs. See
test-results/embed-reed-formula-owned-ui/report.json. The literal two-unit
reconstruction now passes four new owners: edited formula/format/map text and
translated connector geometry, unavailable binding, Chinese dark appearance and
deleted Formula Shape. Complete snapshots differ only by checked embed activation
time; empty filters, fresh hidden edits and real Base typing retain live results.
See test-results/embed-reed-roundtrip-preserved/report.json. Native ArrowRight,
bound connector movement and full serialized Undo/Redo now pass actual painted-text
clicks in fresh, edited-source/formula and Chinese dark states. EN/ZH native text
commit/history passes after refocusing the canvas following editor unmount.
The stronger test-results/embed-reed-roundtrip-native-layout/report.json repeats
all saved-state variants after keyboard movement and native text edits, preserving
post-text-auto-fit routes. No runtime or SDK patch was needed; see the README for
earlier test-coordinate, undefined-property and editor-focus observations. Every
selection/focus path is not thereby certified. All remaining Board tools,
valid-source rebinding, durable storage, Print/Exchange, Next integration,
responsive/accessibility and delivery remain unaccepted.

Pollen (042) adds Sheet -> Modern Doc evidence: three campaign channels drive
thirteen inline results for blended versus channel return, conversion and an
independent learning target. Seventeen literal examples, current canvas results,
complete authored-body preservation, native Sheet typing/exact workbook history,
source Print preview, twenty-one EN/ZH packs, themes and active-source disposal
pass selected checks. EN/ZH Edit formula and number-format dialogs/cancellation
pass separately. Eleven-file source/CSS export includes twenty-two official
stylesheets. Doc-then-Sheet unit disposal resolves thirteen teardown warnings.
Strict runtime remains FAIL on twenty-one native error-status mismatches, not
on the displayed error text. SDK trial watermark is retained. See
test-results/embed-pollen-formula-owned/report.json. Full reconstruction, other
valid-source rebinding, every native action, Exchange, full Print options,
Next/accessibility/responsive checks and delivery performance remain open.

Cobalt (046) adds Sheet + Base -> Traditional Doc evidence: fourteen native
inline formulas connect four A4 chapters, with separate revenue and cost
DocBlocks. Twenty literal examples, independent inputs/target/scope, empty
filtered views, hidden edits, null/zero/text and separate source repair pass
against current first/final-page canvas values and the complete authored body.
Single-click source activation preserves full models; real Sheet/Base typing
and exact source Undo/Redo, correct-source Sheet Print preview, twenty-three
EN/ZH packs, complete model themes and active-source disposal pass. Actual
formula/number-format dialogs and eleven-file source/CSS parity pass separately.
Strict runtime FAIL retains twenty-two error-status mismatches. Empty Base
re-entry, double-click/editor-exit paths, full persistence/valid-source rebind,
all native actions, Exchange, Next and delivery remain open. No SDK package was
patched. See test-results/embed-cobalt-formula-single-click/report.json.

Cobalt now also has five native three-unit reconstruction variants: edited
formula/format/prose, missing Sheet binding from fullscreen, Chinese dark mode,
missing Base binding and formula-to-text replacement. Authored state, four A4
page boundaries, fresh source edits and removed-formula identity are preserved;
ten invalid bundles preserve the owner. The strict recovery report remains FAIL
on empty validation buckets, formula lastValue caches and native error status,
not hidden by the authored-content checks. See
test-results/embed-cobalt-roundtrip-layout/report.json. Durable storage and
strict full-state recovery remain open; the Formula route count is unchanged.

Grove (051) adds Sheet + Base -> Board evidence: two real source Floats drive
sixteen native results across budget, readiness, independent spending ceiling
and three connected zones. Twenty literal examples, current canvas, independent
source ownership, filters/hidden records, null/zero, separate source errors and
repair pass. Native Sheet/Base typing and exact history, correct-source Print,
Board movement/bound connector routes and EN/ZH native text/history also pass.
Twenty-three complete EN/ZH packs, themes preserving all three models and
active-Base disposal pass without browser errors/warnings/backend requests.
Eleven-file source/CSS parity passes. Initial cached-glyph coordinate probes
were corrected using the live native Float viewport anchor, without SDK edits.
See test-results/embed-grove-formula-native-anchor/report.json. Reconstruction,
other valid sources, the full input/native-action matrix and delivery remain open.

Prism (054) adds Sheet + Base -> native chart evidence: an in-workbook target
Sheet and a separate native Base Tab drive A6:C9 and two real chart series.
Twenty-five literal examples, independent edits, criteria versus view filters,
hidden records, null/zero/text, missing Base with retained target series and
repair pass. Native typing/exact source history, Print preview, chart PNG,
sixteen complete EN/ZH packs, theme preservation, disposal and eleven-file
source/CSS parity pass selected checks. Four reconstructed owners preserve
authored state and fresh calculation; ten invalid bundles preserve the owner.
Strict recovery remains FAIL because the first drawing reload adds five explicit
transform defaults. This is not full-state recovery acceptance or Sheet@Sheet
embedding. See test-results/embed-prism-formula-final/report.json and
test-results/embed-prism-roundtrip-authored/report.json.

Saffron (058) adds Doc@Sheet Float with Sheet -> Doc calculation: twelve native
inline results explain an original community-kitchen budget. Twenty-one literal
examples cover independent assumptions, native blank/zero/text behavior, actual
source mapping/repair, source-owned Print and separate document editing. Current
canvas and complete-body preservation through seventeen source edits pass.
Native Sheet typing/exact history, fourteen complete EN/ZH packs, two-model
themes, eleven-file source/CSS parity and active-Doc disposal have evidence.
Strict runtime remains FAIL on twenty error-status classifications, Chinese
number-format pointer interception and keyboard Undo targeting the host Sheet
after Doc Facade editing, plus an Undo snapshot mismatch in native formula caches.
Explicit Doc history preserves authored state independently; full Redo equality
passes. See test-results/embed-saffron-formula-authored-history/report.json.
Reconstruction, different valid sources, full native paths and delivery remain open.

Cypress (059) adds Doc@Sheet Tab: an original independent-press forecast separates
expected closing cash from collection timing. Twenty-three literal examples,
thirteen current-canvas results and nineteen alternating source/Doc-visible edits
preserve authored prose. Native source typing/exact history, Print preview, separate
Doc editing, fourteen full EN/ZH packs, whole-model themes, active-Doc Tab disposal
and eleven-file official-CSS export have selected evidence. Doc keyboard Undo
preserves authored state and the Sheet; full Undo fails on native lastValue caches,
while full Redo equality passes. Strict runtime also retains eighteen error-status
classifications and both-language Number format pointer interception. See
test-results/embed-cypress-formula-current/report.json. Reconstruction, different
valid sources, complete native interaction and delivery remain open.

Ember (060) adds partial native Doc@Base Tab evidence: twelve original release
records drive twelve inline results. Twenty literal examples include eighteen
alternating Base/Doc-visible source steps, completion versus effort, category
counts, projected view filtering, hidden edits, null/zero, rejected non-numeric
input, empty-queue errors, rename and missing-source repair. Native Base exact
input/history, focused Doc input/body history, explicit Doc authored history, ten
complete EN/ZH packs, whole-model themes, disposal and eleven-file source/CSS pass
selected checks. Strict FAIL retains twelve error-status classifications, both
Number format popup pointer paths and full Undo lastValue caches. Full Redo passes.
COUNTA counts a missing-source error as one, not a real record. The initial
unfocused-keyboard assumption was corrected: navigation selection is not text
focus. Reconstruction, different valid sources, full menus/conversion and delivery
remain open; see test-results/embed-ember-formula-final/report.json.

Delta (061) adds partial native Board@Sheet Float evidence: six original studio
capacity/allocation inputs drive thirteen Formula Shapes and three bound rendered
connectors. Twenty-one literal examples, eighteen alternating source/Board-active
steps, total versus local overload, blank/zero/text and errors/recovery pass.
Real Sheet input/exact history, native Board text/exact history with source
isolation, Sheet Print preview/cancel, fifteen complete EN/ZH packs, whole-model
theme round-trip, fullscreen updates/disposal and eleven-file source/CSS pass
selected checks. Formula error statuses match in this report. The corrected
source-input test leaves the Board and excludes embedded canvases before clicking.
Full persistence, different valid sources, native pointer/menu/editor matrices,
conversion fidelity, Next guides and delivery remain open. Runtime evidence:
test-results/embed-delta-formula-native/report.json (selected PASS, not acceptance).

Juniper (062) adds Board@Sheet Tab: six shared/scenario inputs drive fifteen
native Formula Shapes and three bound connectors. Twenty-two literal snippets,
eighteen alternating source/Board-active edits, current-canvas output, native
errors/repair, authored preservation and exact source/Board history pass selected
checks. Source Print verifies actual paper paint and current 175/22 inputs, not
just the dialog. Fifteen complete EN/ZH packs, whole-model themes, active-Tab
disposal and eleven-file source/CSS parity pass. The early Print capture/selector
failures were test timing/targeting issues, not evidence of permanently blank output.
Full reconstruction, different valid sources, native action matrices, conversion,
Next guides and delivery remain open. See
test-results/embed-juniper-formula-paper/report.json (selected PASS, not acceptance).

Harbor (039) now has ledgered partial evidence: six literal snippets, eighteen
complete EN/ZH packs, full-model themes, native host tabs and disposal pass.
Eleven-file source/CSS export passes. Strict native tests retain a blank passive
source Float, source keyboard input overwriting the host VLOOKUP, and missing
source Print render. The attempted Print lifecycle change was reverted after
retesting failed. See test-results/harbor-native-final/report.json.

Delta's new two-owner reconstruction retains edited formulas, missing bindings
and fresh thirteen-value canvas updates across three owners. Nine invalid pairs
preserve the existing owner; Chinese/dark state survives. Strict recovery still
fails on explicit native transform defaults, defined-name serialization and embed
timestamps. See test-results/delta-roundtrip-native/report.json; rebuilt eleven-
file export passes. These observed differences are not normalized away.

Beacon (040) now has partial evidence from eighteen literal scenarios and native
Sheet/Base keyboard edits. Independent Sheet variants and both keyboard paths
repaint all four main Slide canvases. Twenty-two full EN/ZH packs, three-owner
themes, disposal and eleven-file official-CSS export pass. Strict runtime remains
28/41 gates PASS: top-level Base writes remove the Slides workbench and two
subsequent Sheet commands mutate then throw during auto-height. Correct values
do not count as a usable visual demo after its host disappears. See
test-results/beacon-formula-verified/report.json.

There are now 30 implemented Formula routes, all 30 ledgered partial, none
awaiting initial implementation and no fully accepted Formula capabilities.

## Two independent directions

- `child@host` describes where the native product is embedded.
- `source -> target` describes the formula dependency. Embedding direction does not imply dependency direction or write-back.
- `Sheet@Slide`: the presentation embeds the source Sheet; changing it updates slide-native formulas.
- `Slide@Sheet`: the source Sheet embeds the presentation; the embedded slides still read the Sheet.
- Float and Tab are distinct runnable pages. Docs use Block, not an invented tab surface.

## Catalog

Each row is a separate planned route. Related input/error/layout variations belong inside that example rather than separate add/edit/delete pages.

| ID | Case | Native composition | Data flow | Business proof |
|---|---|---|---|---|
| 039 | Harbor / Fare sensitivity | Sheet@Sheet Float | Sheet -> Sheet | Six fares drive lookup revenue and three scenarios; explicit-ID samples pass, native source input currently fails. |
| 040 | Beacon / Live impact cards | Sheet + Base @ Slides | Sheet + Base -> Slides | Separate revenue and cost sources drive slide-native totals and a combined margin. |
| 041 | Estuary / Data-linked narrative | Sheet + Base @ Modern Docs | Sheet + Base -> Modern Docs | Funding totals update inline formula ranges without replacing surrounding prose. |
| 042 | Pollen / Campaign pulse | sheets@docs-modern / block | sheets -> docs-modern | Spend 12000 and attributed revenue 18600 give illustrative return 55%; spend 13500 changes it to 37.78%. |
| 043 | Cinder / Incident briefing | bases@docs-modern / block | bases -> docs-modern | Eight incidents, three open; closing one open record changes the count to two without rewriting prose. |
| 044 | Aster / Research results | sheets@docs-traditional / block | sheets -> docs-traditional | Five observations total 42.5, mean 8.5; changing 7.5 to 10 makes the mean 9.0. |
| 045 | Linen / Services schedule | bases@docs-traditional / block | bases -> docs-traditional | Three line amounts 1200, 850 and 450 total 2500; the second becomes 1000 and the total 2650. |
| 046 | Cobalt / Annual operating review | sheets+bases@docs-traditional / mixed | sheets + bases -> docs-traditional | Revenue 86000 less costs 57500 gives 28500; changing either source updates only its dependent report numbers. |
| 047 | Lumen / Launch economics | sheets@slides / float | sheets -> slides | 240 units at 45 yield 10800; price 48 yields 11520, with the slide layout unchanged. |
| 048 | Orchid / Pipeline review | bases@slides / float | bases -> slides | Weighted amounts 12000, 9000 and 4000 total 25000; changing the second to 11000 yields 27000. |
| 049 | Willow / Capacity map | sheets@boards / float | sheets -> boards | Available 320 hours minus planned 276 gives 44 free; planned 300 gives 20. |
| 050 | Flint / Delivery control room | bases@boards / float | bases -> boards | Remaining effort 12, 8 and 5 totals 25; resolving the 8-hour item leaves 17. |
| 051 | Grove / Exhibition readiness | sheets+bases@boards / mixed | sheets + bases -> boards | Budget 18000 less planned cost 14600 gives 3400; four of six readiness gates are complete. |
| 052 | Tide / Channel comparison | sheets@sheets / float | sheets -> charts | Channels 120, 180 and 90 total 390; the second becomes 210, total 420 and its column changes. |
| 053 | Moss / Support demand | bases@sheets / tab | bases -> charts | Counts 18, 12 and 6 total 36; changing the first to 22 yields 40 and a matching series. |
| 054 | Prism / Plan versus actual | In-workbook target Sheet + Base@Sheet Tab; external Sheet embedding remains open | sheets + bases -> charts | Target 60000 versus actual 54500 gives a 5500 gap; actual 58000 reduces it to 2000. |
| 055 | Atlas / Quote decision card | slides@sheets / float | sheets -> slides | Quote 12000 minus cost 8400 gives margin 30%; cost 9000 changes the slide margin to 25%. |
| 056 | Solstice / Scenario review deck | slides@sheets / tab | sheets -> slides | Scenario quantities 80, 100 and 125 at price 32 give 2560, 3200 and 4000; price 35 updates all three pages. |
| 057 | Indigo / Portfolio presentation | slides@bases / tab | bases -> slides | Portfolio allocations 15000, 22000 and 8000 total 45000; the third becomes 10000, total 47000. |
| 058 | Saffron / Budget explanation | docs-modern@sheets / float | sheets -> docs-modern | Income 9200 less spending 7600 gives headroom 1600; spending 8100 gives 1100. |
| 059 | Cypress / Forecast notebook | docs-modern@sheets / tab | sheets -> docs-modern | Opening 4000 plus inflow 12500 less outflow 9800 gives 6700; inflow 13000 gives 7200. |
| 060 | Ember / Release notes | docs-modern@bases / tab | bases -> docs-modern | Twelve tracked items, nine complete; completing another changes the summary to ten of twelve. |
| 061 | Delta / Resource allocation map | boards@sheets / float | sheets -> boards | Capacity 480 less assigned 425 leaves 55; assignment 450 leaves 30. |
| 062 | Juniper / Sensitivity workshop | boards@sheets / tab | sheets -> boards | Volume 150 times contribution 18 gives 2700; contribution 20 changes the card to 3000. |
| 063 | Reed / Operations map | boards@bases / tab | bases -> boards | Three workstream loads 14, 9 and 7 total 30; the second becomes 12, total 33. |
| 064 | Nova / Live operating deck | sheets@slides / tab | sheets -> slides | Actual 73500 against target 70000 gives 105%; actual 77000 gives 110%. |
| 065 | Violet / Editorial review | bases@slides / tab | bases -> slides | Five of eight pieces are ready; making one more ready yields six of eight. |
| 066 | Aurora / One model, four outputs | mixed@sheets / mixed | sheets -> docs-modern + slides + boards + charts | Departments 4200, 3600 and 2200 total 10000; the third becomes 2700 and all four outputs report 10500. |
| 067 | Kestrel / Planning and actuals workspace | mixed@bases / mixed | sheets + bases -> docs-modern + slides + boards + charts | Plan 48000 versus Base actuals 45500 gives a 2500 gap; actuals 47000 give 1000 consistently across outputs. |
| 068 | Meridian / Follow the calculation chain | mixed@sheets / mixed | bases -> visible sheets calculation -> docs-modern + slides + boards + charts | Base quantities 40 and 60, Sheet rate 25: total 2500; changing 60 to 80 yields 3000, then rate 30 yields 3600. |

## What each example must visibly explain

1. Source identity, editable source values and the native destination, visible together where that composition allows it.
2. One exact source edit, a numeric before/after expectation and the corresponding literal Facade snippet. No custom JavaScript totals or manual refresh button.
3. Independent edits to Sheet and Base in mixed-source examples: only genuine dependents change.
4. Formula Shape display text/value/status; Doc inline formula value and unchanged surrounding text; Chart source range and actual rendered series. A card reading a number is not accepted as a chart demo.
5. Zero versus blank, invalid values, unavailable source, repair and rebind. Preserve native errors; do not hide them with fallback estimates.
6. Stable source IDs after rename, resource-preserving save/reload, native editing/history ownership and disposal.
7. Native Grid UI, official CSS included in standalone export, no fixture panel, English content and localized guide. Distinct original stories, data, typography and palettes.

## Chart binding boundaries

Use the existing native Sheets Chart builder and a visible calculated Sheet range first. External Sheet/Base references feed that range; the native chart binds its values. This is a real calculation chain, not a manually refreshed JavaScript chart array. The exact bindings and redraw must pass runtime tests.

Do not assume direct Base-to-chart, arbitrary Docs/Slides chart bindings, or Base view-filter semantics from the existence of an external-reference API. Add direct-binding variants only after inspecting and verifying the specific API. A whole-table aggregate must not be described as respecting a UI filter unless tested.

## Presentation and data variety

- Modern Docs: campaign pulse, incident briefing, release notes and forecast notebooks; inline values embedded in real explanatory paragraphs.
- Traditional Docs: research results, paginated service schedules and operating reviews; source edits must preserve page structure.
- Slides: launch economics, pipeline reviews, portfolios and multi-page scenarios; use KPI cards, comparison pages and narrative conclusions, not identical tables on every slide.
- Boards: capacity maps, delivery control rooms and allocation workshops; formula-backed cards participate in an authored connected layout.
- Charts: channel comparison, support demand and plan-versus-actual; use native charts whose series follow source changes.
- Integrated workspaces: one source drives four outputs, two sources reconcile four outputs, and Base -> Sheet calculation -> Doc/Slide/Board/Chart chains.

## Implementation order

1. Keep Harbor's known native editing/printing failures explicit; its six working formula snippets do not certify the embedding UI.
2. Beacon: Sheet + Base -> native Slides Formula Shapes, with separate source and combined-result pages.
3. Atlas and Solstice: reverse composition Slide@Sheet Float and Tab, retaining Sheet -> Slide dependency.
4. Estuary and the single-source Doc/Board paths, then traditional-document layouts.
5. Formula-backed native chart paths and multi-output reconciliation workspaces.
6. Complete native editing, source identity, reload, error and lifecycle matrices for every case. No completion percentage based on catalog size.

## Source evidence

Inspected local SDK examples: `examples/src/embed/slides-embed-formula-local/main.ts`, `docs-embed-formula-local/main.ts`, `boards-embed-formula-local/main.ts`, and `embed-demo-formula-source.ts`. These demonstrate native shape formulas, Doc insertFormula and Sheet/Base external reference syntax. Native chart source API inspected in `packages/sheets-chart/src/facade/f-worksheet.ts` and `f-chart.ts`.

This is implementation evidence for available primitives, not proof that all planned combinations already work. The machine-readable catalog and data-flow expectations are in `embed-product-plan.json` and the main capability ledger in `blueprints.json`.
