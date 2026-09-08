# Aster / Pilot appendix

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier EN/ZH reports below describe historical interaction runs,
not current bilingual SDK acceptance. English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

An original community-radio team reviews an eight-week pilot. Three authored
slides frame the editorial mix and commissioning decision. A native SlidePage
embed inserted second in the page list opens the real two-sheet production
workbook. This is the Slides equivalent of a tab, not a floating object or iframe.

The saved Gamma team-retrospective cover informs the dark teal composition.
All artwork is native SDK shapes/text, with original sand and sage alternatives;
no competitor artwork is included. Names, figures and dates are fictional.

## Try the working model

Open **Pilot schedule** in the native page list. Schedule contains eight different
episodes and Resources contains shared rates, studio capacity and budget.
The baseline is 22 studio hours, 35 editing hours and $2,040 production cost.
Change Schedule!D5 from 2 to 3: studio hours become 23, production cost $2,085,
studio capacity remaining 1 hour and budget remaining $915. Native Undo/Redo
should restore/reapply only the workbook edit. Editorial slides stay independent;
they are not Formula Shapes. Editing rates also recalculates all episode costs.

With D5 still at 3, change Resources!B4 from 45 to 50: all eight episodes
recalculate and total cost becomes $2,200. Set B4 to 0 to model a sponsored
studio: editing still costs $1,050, so free studio time does not mean a free
programme. Two native Undo operations restore the $45 studio rate and $2,085
total. To test keyboard entry, select D5 and type 4, then Enter: total cost
becomes $2,130. Undo restores 3 hours. These variants use the actual worksheet
and formulas, not separate fixture controls.

Use native ribbon and worksheet tabs, without fixture panels or duplicate host
buttons. Default ribbon is Grid. Preview and standalone use the same factory,
data and official host/child/Embed CSS. The workbook is provided locally; no
backend, booking, broadcast, invoice or persistence is performed. Reload loses edits.

## Selected evidence

`test-results/embed-sheet-slide-tab-production-paginated/report.json` passes the
independent production build at 1220px: native page insertion and workbook UI,
real formula recalculation, native Undo/Redo, five populated Grid tabs, Resources
navigation, whole-host/child preservation, native host rich-text editing and
active-child disposal without browser errors or backend requests. Resources
prints as one populated native preview page at Fit to width and cancels back to
the workbook. Physical printing, file conversion and Exchange are not claimed.

The earlier `production-print` and `native-print` checks accepted the initial
zero-page print shell too early. They are superseded by the stronger paginated
gate, which waits for nonzero pages. The final screenshot was visually reviewed.
The first editorial cards overflowed; shorter copy and 17pt type now fit all
three cards without overriding SDK CSS.

The first creation path, `createEmbed` then `loadAsync`, left the native page's
child ID absent and showed an empty appendix. Preloading the ResourceRef or
restoring an existing anchor did not fix this; one transient run reached a
missing-render error in the auto-height interceptor. The final setup follows
`slides-embed-local`: `prepareCreateEmbed`, materialize the descriptor, then
`restoreEmbed` to create the native page with its child ID. This public SDK
service integration is included in exported source; it is not a Facade-only
creation claim. No SDK/package file or internal model is patched. A separate
test selector initially clicked the formula-bar canvas; it now clicks the real
worksheet area. All failed reports remain available.

The selected source Grid test and EN/ZH guide/native-preview checks also pass.
`embed-sheet-slide-tab-export-final/report.json` checks all eleven exported source
files against the preview sources and verifies live official CSS/Canvas rendering.
The standalone export contains official host, child and Embed CSS. Its 218
packages install offline; main JS is 18,253.77 kB / 4,528.96 kB gzip and CSS is
137.59 / 20.80 kB gzip. The first Next guide/playground responses took 78s/29.2s
and emitted a Gzip MaxListenersExceededWarning. Performance is not accepted.

## Editing and lifecycle follow-up

`test-results/embed-sheet-slide-tab-production-theme/report.json` passes the
extended independent production test: native D5 keyboard entry with Undo/Redo,
both shared-rate variants with every episode's raw numeric result, plus live
Facade dark/light switching that preserves complete edited host/child snapshots
and the child canvas. All prior print, navigation and disposal gates still pass.
The first `production-editing` run compared formatted strings such as `300.00`
with numbers; the test now uses `getRawValues()`, not number coercion.

`test-results/embed-sheet-slide-tab-source-lifecycle/report.json` passes four
same-container factory recreations, alternating dark/light official SDK chrome.
Each starts with fresh authored data, remains editable and releases its canvases
and global API; repeated disposal and immediate disposal before readiness also
pass. This is not a heap-leak proof or delayed-provider cancellation test.

The Preview previously recreated the model whenever `resolvedTheme` changed,
discarding edits. It now calls `FUniver.toggleDarkMode()` on its existing owner.
`test-results/embed-sheet-slide-tab-next-theme-final/report.json` verifies actual
next-themes media changes in both EN/ZH pages: the same API owner and canvas
survive, with the complete edited presentation/workbook unchanged. The first
`next-theme` run passed those interactions but failed its report-count assertion;
theme results now have their own list and the complete rerun passes. This does
not certify all React unmount races. The selected Next first responses were
50s/19.2s and the Gzip warning remains; no performance acceptance is claimed.

`test-results/embed-sheet-slide-tab-export-theme/report.json` is the follow-up
eleven-file source/official CSS parity check, including the updated Preview
reference and this README. The standalone factory/data/CSS bundle is unchanged.

## Still open

Complete broader native selection/editing and menu dialogs, delayed/pending
removal, failed sources, resource reload/persistence, React unmount races,
narrow layouts, touch, accessibility and loading performance. Creating a new
factory or reloading intentionally restores authored data; a theme change does
not. Physical printing and Exchange conversion remain unverified. This is
partial capability coverage, not a fully accepted demo.
