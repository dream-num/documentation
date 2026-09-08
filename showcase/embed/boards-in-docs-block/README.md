# Pine / Architecture decision

Current language contract: native UI, startup alerts and authored data stay English under either host language. The legacy third locale argument remains accepted but is ignored. All complete English plugin packs, official CSS, native Grid menus and independent host/child models are retained. Earlier bilingual evidence below is historical; this language migration does not resolve its recorded SDK limitations or certify every interaction.

An original exhibition-reservation decision record embeds a native service
boundary diagram: seven colored nodes, seven bound orthogonal connectors and
four narrative labels. Reservation state and notification delivery have separate
owners. Retry work must not create a second booking. This is a fictional design
proposal, not a running message service.

The saved Miro diagram-library reference informs the diagram/decision vocabulary
only. All text and data are original; no competitor artwork is redistributed.
Native Grid chrome and nine official CSS imports remain intact. There are no
generic fixture panels, duplicate host buttons or iframe substitutes. Preview
and standalone share the same factory and data. Canvases use the official child-
scoped EditorUIService extension, without a dummy Slides unit or SDK patches.

## Selected evidence

`test-results/embed-board-doc-block-two-row/report.json` verifies source
activation, Shape text Facade edit and paint, native keyboard Undo/Redo, fullscreen
dragging of the connected retry node and whole-Canvas restoration through Undo.
Child operations preserve the entire host document. Appending to the host title
moves the native block anchor while preserving the entire edited Canvas. Selected
active-child disposal completes without browser errors or backend requests.
`embed-board-doc-block-production-final/report.json` repeats these checks at
1220px against the independent production build of the final two-row layout.
`embed-board-doc-block-production-status-selection/report.json` additionally
double-clicks the native retry shape, selects the final status with keyboard
arrows, types Reviewed and clicks outside to commit. Facade reports exactly
`Retry queue\n30 min / Reviewed`; the whole host remains unchanged. The final
host-anchor and active-child disposal checks also pass after this native edit.

The first runner used a nonexistent generic fullscreen exit selector; the failure
is retained in `embed-board-doc-block-first`. The corrected runner uses the native
Exit fullscreen button. Visual inspection prompted a two-row arrangement instead
of three, improving inline readability while retaining seven nodes, seven bound
connectors and four labels. Native selection toolbars can overlay nearby labels;
the case does not hide or restyle SDK controls.
The first native-typing attempt used the wrong editor selector; the actual SDK
surface is `shape-text-editor-content`. Subsequent Ctrl+A replacement retained
the first paragraph, and Home/Shift+End did not select the status line as expected.
These failures remain in the production-typing, production-native-editor and
production-status-edit reports. The passing status-selection path uses
Ctrl+End and Shift+Left to select the nine-character status. It does not certify
select-all, Home/End selection or concurrent editor/Facade writes.

`embed-board-doc-block-next/report.json` verifies EN/ZH guides, three variants,
actions and states each, live native previews and official white/flex CSS.
`embed-board-doc-block-export-final/report.json` checks all eleven exported files
against the authored source and live CSS/Canvas. The selected independent build
contains main JS of 18,181.31 kB / 4,517.30 kB gzip and CSS of 125.97 / 18.48 kB
gzip. Bundle size and cold-start performance are not accepted.
The selected Next server's first guide/playground responses took 86s/54s and it
emitted a Gzip `MaxListenersExceededWarning`. These remain diagnostics to address,
not a clean server-performance or repeated-mount pass.

## Still open

The actual Preview theme check (`embed-board-docblock-theme-complete/report.json`)
remains a strict failure in EN/ZH: the same owner and edited document/Canvas remain,
but switching dark/light changes the Canvas's saved theme color/format schemes.
The SDK's `BoardThemeFollowUniverController` calls
`BoardSettingsService.syncFollowUniverTheme()` and `SetBoardThemeOperation`.
No snapshot fields are filtered out to claim a pass. Native activation, separate
host/child edits and final React unmount completed without browser errors or
backend writes. Screenshots were inspected; this is not full-save preservation.

Broader native text selection and editing-state conflicts, complete connector-routing and
menu/dialog checks, broader history/focus/scrolling, narrow layouts, touch and
accessibility, early/pending removal, failed sources, repeated mounting/theme
changes and reload/resource preservation remain open. Warm guide integration
does not certify cold starts or all React cleanup paths. License watermarks remain
visible and unmodified. No backend, booking, message delivery, Exchange/Print
conversion or persistence is claimed. Reload loses edits. Host and Canvas content
are independent, not formula-linked. This case remains partial, not full SDK
certification.
