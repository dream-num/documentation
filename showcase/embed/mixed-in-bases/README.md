# Acorn / Complete Operating Workspace

The demo runtime, authored data and startup alerts are English-only, including on
Chinese-language guide pages. The legacy third locale argument remains accepted
but is ignored. Earlier  English-only source/CSS/startup checks do
not certify every native interaction or resolve the recorded SDK failures.

A fictional touring-exhibition studio combines ten opportunities, six follow-ups
linked to those opportunities, and four partner groups. Four native Base
table-list tabs open a two-sheet forecast, modern delivery playbook, three-slide
review and process Board. No custom product switcher, fixture toolbar or iframe
child substitutes are used. The documentation site's outer preview frame is not
an embedded-product implementation.

## Explore the native workspace

Start with Opportunities, Follow-ups and Accounts. Each product tab owns a real
SDK unit: Weighted forecast, Delivery playbook, Studio review, Service blueprint.
The native Grid ribbon is used where applicable; Base retains its own official
table UI. Use those menus for ordinary editing, formatting and Undo/Redo.

Forecast begins at USD 375,500 gross and USD 228,400 weighted. Its ten rows use
VLOOKUP into Assumptions and ROUND on each result. Changing the Qualified weight
from 40% to 50% changes three opportunities and the weighted total to USD 236,650.
The USD 180,000 target is an illustrative planning input, not booked revenue.

Written totals in the playbook and review are authored baselines. Base values,
Sheet values, prose and shapes are independent after startup. This case does not
claim Formula Shape, CustomRange or automatic cross-product synchronization.

## Five literal Facade examples

Open the named native tab before executing each example in its preview frame or
the standalone demo console. Do not edit an unmounted child from another tab.

### 1. Weighted forecast / Revise Tidal Atlas

The weighted total changes to 231,000. The opportunity record stays unchanged.

```ts
window.univerAPI.getWorkbook('acorn-studio-forecast').getSheetByName('Forecast').getRange('C5').setValue(52000)
```

### 2. Delivery playbook / Revise the narrative

```ts
window.univerAPI.getDocument('acorn-studio-playbook').getParagraphs()[1].appendText(' / Revised')
```

### 3. Studio review / Revise the headline

```ts
window.univerAPI.getPresentation('acorn-studio-review').getSlideById('cover').getShape('title').getText().setText('Build once.\nTravel thoughtfully.')
```

### 4. Service blueprint / Request sample review

```ts
window.univerAPI.getBoard('acorn-studio-workflow').getShape('kits').getText().setText('Prepare a sample\nAsha / In review')
```

### 5. Follow-ups / Clarify evidence

```ts
window.univerAPI.getBase('acorn-studio-operations').getTableById('tasks').getRecordById('tasks-2').setValue('next', 'Review one large-print label sample with the learning partner.')
```

## Source, styling and ownership

Preview and independent export execute the same create-demo.ts and data.ts.
The export includes the official SDK CSS imports, the small container stylesheet
and the React preview reference files. Color is authored in content: navy/cyan,
sand inputs, mint totals, warm portfolio cards, plum review and multicolor Board
nodes. No CSS overrides the native white workbench or removes license marks.

The native Base tab path uses exported EmbedCreationService and
EmbedHostRestoreService to materialize a child before inserting its native
table-list anchor. This setup is not claimed to be Facade-only; the five editing
examples above use the public Facade. Providers match exact unit ID and type,
honor cancellation and reject unknown sources. Slides initializes before Board;
the Board's public runtime-scope dependency extension follows Board startup.

Open the Sheet tab and select Forecast before using Print. Undo/Redo of an
Assumptions edit can activate Assumptions instead. The public async call
`await window.univerAPI.executeCommand('sheet.operation.print-open')` opens the
native preview; the beta.2 synchronous openPrintDialog wrapper has a separately
recorded Promise-handler failure. Native Cancel returns to editing. This case
does not claim an exported PDF or Exchange file conversion.

## Reference and acceptance

The cached airtable-template-02.png informs sidebar grouping and restrained
category colors only. All scenario data and product content are original and
fictional; no reference artwork is redistributed. No email, orders, shipments,
bookings, approvals or backend requests are implemented.

Selected runtime evidence is partial, not complete acceptance:

The first ribbon assertion searched inside the child, but the native Base tab
replaces the shared host ribbon. It now checks the shared Grid's embed owner.
The initial Print probe selected Assumptions through history while expecting
Forecast; explicit native Forecast selection fixes that test expectation. A text
paint locator did not identify the numeric cell reliably; the final keyboard
check uses the authored C5 geometry and asserts real cell and formula results.
All earlier reports and the canvas mount trace remain available.

Still required: native tab reselection repair, complete menu/editing/selection
paths, saved resource reload, provider failure/delay/empty states, repeated/racing
mounts, all disposal paths, accessibility, small screens and performance. The
selected build includes 1,944 modules, about 18.84 MB main JS / 4.65 MB gzip;
cold Next guide/playground compilation was about 56/16 seconds with a Gzip
listener warning. These are observations, not performance acceptance. There is
no Exchange conversion, actual PDF output or collaborative history in this case.

The shared factory explicitly imports the official Ink UI English pack and CSS
required by the registered Boards UI dependency. Other product locale packs and
styles remain intact. This is resource coverage, not native pen acceptance.
