# Northlight / Native page lifecycle

The runtime is English-only on every host page. Complete official English SDK packs
and styles are retained. A legacy locale argument, where present, is ignored without
shifting the saved-snapshot argument. EN/ZH reports below are historical evidence
from before this language change, not current bilingual-runtime acceptance.

Eight original fictional museum-night pages demonstrate route choices, room
capacities, staffing, access and closing. Use native thumbnails and their
Copy/Paste, Add slide below and Delete menus. Native ribbon Undo/Redo owns
page history. No fixture selector, reset/load/inspect panel or duplicate
navigation/edit/delete toolbar is mounted.

## An independent room-plan branch

Right-click Atrium, Copy, then right-click it again and Paste. Select the new
page and edit its title in the SDK. The equivalent Facade edit is:

```ts
const presentation = window.univerAPI.getActivePresentation()
const copy = presentation.getActiveSlide()
copy.getShape('title').getText().setRichText(
  window.univerAPI.newRichText().span('Atrium / Quiet arrival option', {
    fontSize: 34, bold: true, color: '#233D49',
  }),
)
```

Return to the original Atrium: its content and notes must be unchanged. Delete
the copy through its thumbnail menu, then use native Undo/Redo to restore or
remove it. Add slide below opens the native layout picker; choose Blank to
start another plan at that position. Copying external or embedded resources
is not certified by this text/shape example.

## Source variants

Change `createData()` in create-demo.ts to `createData('repeated-labels')`,
`createData('single')` or `createData('empty')`. The same exported data factory
supports identical page names with distinct IDs and one/zero-page boundaries.
`createInsert(id)` remains available in data.ts for a scripted lantern activity
via `presentation.insertSlide(index, createInsert(id))`. These variations are
not exposed as another host toolbar. Reload restores authored content; theme
changes use the existing API owner and preserve the model.

## Scope and acceptance

The current native-only UI supersedes the former host-panel test. Old reports
that exercised its labeled buttons do not prove this UI works or is accessible.
The strict renderer-free `scripts/test-slides-history-sdk.mjs` reproduction is
retained with an explicit legacy Text element: legacy title Undo and insertion selection were failing in beta.2. Removing
controls does not fix those SDK issues. Native thumbnail focus/current-page
semantics and broader keyboard interaction remain unverified.

Exchange and Slides Exchange clients are not registered: their binary file
conversion uses an HTTP upload backend, which this local demo does not provide.
The native Print settings retain the Slides Print plugin and official CSS in
both Preview and independent source. This is not a physical-print guarantee.
No backend, booking,
collaborative revision history or persistence is provided. Runtime, export
parity, narrow-layout, error, lifecycle and performance acceptance must be
recorded separately before this capability is called complete.

After removing HTTP-backed Exchange, the selected EN/ZH native workflow passes
in `test-results/slides-lifecycle-frontend-en/report.json` and
`test-results/slides-lifecycle-frontend-zh/report.json`: all eight pages,
Copy/Paste, independent Facade title editing, native Delete/Undo/Redo and Blank
insertion, Print settings/Cancel, and owned teardown. The Exchange command is
absent and there are no browser errors, warnings or backend requests. The
Chinese Print screenshot was reviewed. This does not certify physical printing
or resolve the separate strict legacy history failures.

The source run in `test-results/slides-lifecycle-native-shapes/report.json`
passes all eight authored pages, native Copy/Paste, independent shape-text
editing, Delete and Add slide below with native Undo/Redo, live Facade theme
preservation, historical File/Print menu opening and owned disposal. That File
menu-only evidence did not verify conversion and its backend-dependent plugin
has since been removed. Text uses native
transparent shapes instead of legacy Text elements with opaque backgrounds.
This result does not certify legacy Text Undo, previous-selection restoration,
source variants, keyboard accessibility, conversion or printed output.

Selected independent production also passes the same workflow in
`test-results/slides-lifecycle-native-production-readme/report.json`. The runner
executes the TypeScript example above verbatim, not a separately maintained
approximation. Eleven exported files and official white SDK CSS pass in
`test-results/slides-lifecycle-native-export/report.json`. Actual EN/ZH Next
guides, four variants/actions/states, native Grid and theme changes preserving
the same API owner and edited snapshot pass in
`test-results/slides-lifecycle-native-next/report.json`.

The retained strict legacy regression still fails in
`test-results/slides-lifecycle-native-history/report.json`: stale rich text after
Undo and selection returning to welcome rather than Atrium. Previous host-panel
accessibility checks are obsolete and removed from this capability's evidence.

Performance is not accepted: the independent build installs 172 offline packages;
main JS is 14,764.51 kB (3,528.16 kB gzip), CSS 113.33 kB (16.89 kB gzip).
The selected Next cold guide/playground responses took 53s/27.2s and emitted a
Gzip listener warning. Only this demo was compiled; no SDK or package was patched.
