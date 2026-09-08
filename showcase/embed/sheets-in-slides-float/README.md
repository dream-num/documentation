# Tamar / Quarterly assumptions

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier EN/ZH reports below describe historical interaction runs,
not current bilingual SDK acceptance. English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

An original independent print-studio review embeds a native two-sheet workbook
inside a three-slide presentation. Direct editions, bookshop partners and print
workshops have different prices and unit costs. Volume sensitivity keeps fixed
quarterly costs unchanged. All people, dates and figures are fictional.

The saved Beautiful.ai sales-report cover informs the split composition and plum
palette only. The cream review, dark driver cards and mint decision gates are
original SDK shapes and text. No competitor artwork is redistributed.

The native SlideFloating drawing and child workbook use separate models and
history. No iframe or screenshot replaces the workbook. The baseline narrative
does not automatically change with the model; this is not Formula Shape. Use
native ribbon and floating controls, without generic fixture panels or duplicate
host buttons. Preview and standalone share the same factory, data and official
SDK CSS. The native Sheets ribbon registers its actual feature dependencies.

## Selected evidence and a failing gate

`test-results/embed-sheet-child-themes-visible/report.json` passes the actual
React Preview in EN/ZH without fullscreen: native float activation and inline
B5 typing to 1,800 yield operating result 13,932; a public Facade slide-title edit
is independent of the child. Dark/light next-themes storage events preserve the
same owner and full edited snapshots, and active-child React unmount has no
browser errors. Official CSS/locales and reviewed screenshots confirm the
selected surfaces. This does not resolve the native fullscreen failure below.

`test-results/embed-sheet-slide-float-fullscreen-keyboard/report.json` verifies
the final independent production build at 1220px up to fullscreen: native float
activation, official white/Grid CSS, recalculation from 1,600 to 1,800 direct
units (revenue 49,680; operating result 13,932), native Undo/Redo and preservation
of the whole host presentation. The overall report is **failing**: the native
fullscreen button does not open a shell. Mouse activation also fails in the
current-workbook and fullscreen-session reports; the latter observes a null
root fullscreen session. An overlay selector is absent in the active child.
The full test still requires fullscreen, populated menus, sensitivity navigation,
host thumbnails and disposal; those later gates have not passed.

The first source and production attempt hit the beta.2 number-format interceptor:
it reads the current workbook even when FRange includes the unit ID. This demo
owns one workbook and now explicitly selects that unit type after loading, while
keeping Slides focused. No SDK or package file is patched. This is not a general
multi-workbook routing solution. The initial click selected the floating object;
the corrected runner double-clicks to activate its child.

The first layout clipped the contribution column. Narrower authored columns,
24px rows and a taller float expose the working totals. Initial Slides zoom now
fits the native render viewport without restyling SDK chrome. License text still
overlays some cells and remains unmodified.

`embed-sheet-slide-float-next-final/report.json` passes EN/ZH guide structure and native
preview CSS; it does not exercise fullscreen. `embed-sheet-slide-float-export-final/report.json`
checks eleven source files and live official CSS/Canvas. The standalone project
installs 218 packages. Main JS is 18,254.36 kB / 4,528.73 kB gzip; CSS is 137.59 /
20.80 kB gzip. Cold Next guide/playground responses took 61s/20.6s, with a Gzip
MaxListenersExceededWarning. These are not acceptable-performance claims.

## Still open

### Native click diagnosis

`test-results/embed-sheet-slide-float-dom-moves/report.json` records the same
native button receiving pointerdown and mouseup, while its entire
`embed-float-dom-chrome` ancestor is moved with `insertBefore` and `appendChild`.
The stacks point to the SDK chrome-layout effect cleanup and registration.
No click reaches even a window capture listener installed before SDK startup;
`EmbedFullscreenService.enter` is not called. The button identity survives, so
checking only `isConnected` missed this ancestor removal/reinsertion.

The local SDK source supplies `hostFloatDomLayout$={of(viewState)}` on each
`SlideEmbedFloatingLayer` render. `EmbedFloatDomRenderer` includes that observable
in the chrome-layout effect dependencies; cleanup moves chrome back into its
original parent, and registration appends it to the body again. This is the
leading source-level cause consistent with the observed event sequence. A
stable layout subscription/portal lifetime needs an SDK fix and regression
test, not a demo button that invokes fullscreen programmatically. No SDK files,
package files or production event handlers were patched. The full gate remains
failing; `SHOWCASE_DIAGNOSTIC=1` enables observational traces in the source runner.

Fix native fullscreen first, then finish five-tab menu dependencies, Sensitivity
navigation, broader native cell typing, host navigation/preservation,
print, failed resources, repeat mounting, narrow layouts,
touch/accessibility and performance. This is a partial implementation with a
known runtime failure, not a completed demo. No backend, sales orders, payments,
Exchange conversion or persistence is provided. Reload loses edits.
