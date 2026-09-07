# Grove / Research backlog on a Board

An original park-route discovery story places nine research questions beside
four visual notes: wayfinding, comfort, access and trust. Linked Themes records
separate the research boundary and method from each question's owner, state,
confidence and review date. All observations, people and dates are fictional.
An evidence state is not an accessibility certification or release approval.

## Run and explore

Run pnpm install and pnpm dev in the standalone export. Double-click the Base
to activate native record editing; use the native fullscreen control to explore
Questions and Themes. Rename a theme and inspect its linked labels in Questions.

This literal Facade example updates a research question without changing the
Board's narrative cards:

```ts
window.univerAPI
  .getBase('grove-research-backlog')
  .getTableById('questions')
  .getRecordById('questions-1')
  .setValue('title', 'Move the cue before the turn')
```

Try native Undo/Redo. Return to the Board and refine its pending next step:

```ts
window.univerAPI
  .getBoard('grove-route-research')
  .getShape('decision-note')
  .getText()
  .setText('NEXT / Walk the short loop before changing signs.')
```

Record links retain theme IDs when labels change. They are not Formula Shapes
and do not rewrite Board notes. No route is approved, measured or published;
no notifications or assignments are sent. Reload loses local edits.

## Integration and acceptance

Preview and the eleven-file standalone export share one factory and official
host, child, Embed, drawing and shape CSS. The local provider accepts only the
authored Base ID/type. BoardFloating owns geometry while Base owns its tables.
Board text editing uses the SDK's real EditorUIService registered through
Board's public runtime dependency extension; no unrelated Slides unit is created.

Selected independent production passes both literal README examples, full Base
snapshots across native Undo/Redo, actual keyboard theme rename and history,
three visible linked labels preserving their theme IDs, native fullscreen/table
navigation, independent Board text and movement/history, theme changes and
active-child disposal without observed browser errors or backend requests.
The host keeps Board floating tools; the child keeps its native Base controls.

EN/ZH guides pass three variants/actions/states and actual media-theme changes
preserving the same owner and both edited snapshots. Eleven-file export parity
includes nine official CSS imports and the white native workbench. Board themes
may regenerate a palette; its theme ID and all authored content stay strict.

- Production: `test-results/embed-base-board-float-production-final/report.json`
- Guides: `test-results/embed-base-board-float-next-recheck/report.json`
- Export: `test-results/embed-base-board-float-export-final/report.json`

The first production test incorrectly looked for a workbench inside fullscreen.
The actual Base fullscreen is its own native shell; the test now checks the
observed base-canvas-root and official white background. No CSS override was
added. The failed report remains. Screenshot review separated the heading from
native floating menus and widened the theme scope/method columns.

One later Next run failed with an invalid-token/ChunkLoadError before the child
mounted (`embed-base-board-float-next-final`). The same live server passed the
recheck without restart. Its current 97,899,092-byte development chunk matches
the served/disk SHA-256 and parses along with all 1,008 wrapped modules
(`test-results/grove-next-chunk`). This does not establish or fix the cause of
the earlier failure; development loading reliability remains open.

The selected build installs 206 packages offline and transforms 1,847 modules.
Its main JavaScript is about 18.48 MB / 4.56 MB gzip. Cold selected Next requests
took 70s for the guide and 6.8s for the playground, with a Gzip drain-listener
warning on a later request. Performance is not accepted.

Full menus, filters/sort/group variants, failed/empty/delayed providers, repeated
mounts, persistence, focus boundaries, accessibility, narrow screens and
performance remain open. No Exchange conversion or Print output is claimed.
No SDK package or license watermark is patched.

The saved Airtable calendar reference informs category colors and dated work
items, not a claim that this Grid is a calendar. All business content and Board
geometry are original; no competitor artwork is redistributed.
