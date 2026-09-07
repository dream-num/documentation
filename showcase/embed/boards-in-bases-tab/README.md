# Cove / Boards in a native Base tab

The fictional equipment lending desk tracks eight different requests through
four linked touchpoints: Reserve, Collect, Use and Return. Open Service blueprint
from the native Base sidebar to see twelve editable responsibility cards in
three lanes: borrower, front desk and backstage. Seventeen native bound
connectors show sequences and handoffs. The map has 41 elements in total.

## Run and explore

Use pnpm install and pnpm dev in the standalone export. Board uses its native
floating tools; Base keeps its native table controls. There are no fixture
selectors, diagnostics panels or duplicate editing buttons.

This exact README example updates one handoff card. It does not change any Base
request or touchpoint:

```ts
window.univerAPI
  .getBoard('cove-service-blueprint')
  .getShape('desk-collect')
  .getText()
  .setText('A clear handoff\nConfirm the return desk.')
```

Use native Board Undo/Redo, edit the card directly, or move it with an arrow
key. Bound connectors should keep their endpoints attached. Return to Requests:

```ts
window.univerAPI
  .getBase('cove-lending-desk')
  .getTableById('requests')
  .getRecordById('requests-1')
  .setValue('next', 'Confirm microphone and spare battery')
```

In Touchpoints, rename Reserve to Plan a loan. Three linked request labels
should change while retaining the same record ID. The Board must stay unchanged:
its headings and arrows are a service design, not live Base fields or workflow
automation. Moving a card does not transfer ownership or change its stage.

## Integration and acceptance

One createDemo factory powers the Preview and independent export. Nine
official stylesheets cover Design, UI, Docs, Drawing, Bases, Boards, Shape
editor, Slides editor and Embed. The SDK chrome remains native; blue-gray, lavender and sand
differentiate the authored responsibilities. The local provider validates the
Board unit type and exact source ID. Prepare, materialize and restore create a
BasesTableListBlock anchor. Owned child content roots are released before SDK
teardown; SDK packages and license watermarks are not patched.

Board Embed mounts the floating editor exported by Slides UI. In beta.2,
registering the Slides plugin does not start it without a Slides unit. This
example uses UniverBoardsUIPlugin.registerRuntimeScopedDependencies with the
SDK's real EditorUIService, following the SDK's child-scoped service extension
and isolation test. No substitute editor or unrelated Slides document is created.
Boards do not accept Slides' pageId display target; activePageId selects the page.

Selected production checks pass in
test-results/embed-board-base-tab-production/report.json: both literal README
examples, actual Board text input with two-step native Undo/Redo, menu and
keyboard history, arrow-key card movement, and all seventeen rendered routes'
endpoints before/after movement and Undo. Base keyboard rename/history updates
three linked labels without changing their IDs. Full host/child snapshots remain
independent across navigation; only the native Board theme palette may regenerate.
Active-child disposal passes without observed browser errors or backend requests.

The eleven-file standalone export and official white/flex/Canvas styling pass
test-results/embed-board-base-tab-export/report.json. Source and export use the
same factory and nine official CSS imports. EN/ZH guides pass
test-results/embed-board-base-tab-next/report.json: all three variants, actions
and states, native Board tools, white child CSS, the same owner and both edited
models across actual media-theme changes. Source parity is rechecked in
test-results/embed-board-base-tab-export-final/report.json after documentation updates.
The independently installed project uses 206 packages; main JS is 18,481.04 kB
(4,555.99 kB gzip), CSS 154.79 kB (22.20 kB gzip), so load performance remains open.
Selected cold Next guide/playground requests took 2.5 minutes / 51 seconds;
the server also emitted a Gzip drain-listener warning. These are not optimized
production timing measurements and are not performance acceptance.
Earlier failed source reports are retained: display target, missing editor service
and the incorrect setPlainText name. The public text API is setText. Visual review
removed empty text-box placeholders from decorative lanes and shortened wrapped
labels; content uses distinct blue-gray, lavender and sand responsibilities.

Full menus, failed/empty/delayed providers,
repeat mounts, resource persistence, narrow/touch layouts, accessibility and
performance remain open. No Exchange conversion or Print output is claimed.

The saved Miro diagram reference informs the visible sequence and handoff
structure. All content and geometry are original; no competitor artwork is
exported. This frontend demo does not reserve equipment, contact borrowers,
process payments, approve condition checks or synchronize models. All request
IDs, people and circumstances are fictional. Reload loses local edits.
