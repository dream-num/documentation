# Northstar / Complete project brief

An original fictional neighborhood seed-library pilot combines a modern narrative
with four native body blocks: resource Sheet, readiness Base, strategy Slides
and dependency Board. Six stations, 72 illustrative starter packs and six
orientation sessions frame the discussion. Six workstreams link to four owners.

The saved Notion project-brief reference informs the narrative structure; native
editable content replaces reference artwork. Forest headings, sage budget cells,
sand inputs, a dark-green strategy cover, warm role cards and lavender review
vary the visual roles. No competitor artwork is redistributed.

## Run and explore

Run pnpm install and pnpm dev in the independent export. Scroll through all four
sections, activate a block and use its native fullscreen control when more room
is needed. The Sheet starts at USD 3,435 direct cost plus twelve percent reserve:
USD 3,847.20. Change starter packs from 72 to 84:

```ts
window.univerAPI.getWorkbook('northstar-seed-budget').getSheetByName('Resource plan').getRange('B6').setValue(84)
```

The new total is USD 4,008.48. Written baseline amounts deliberately stay unchanged.
Update the workstream note separately:

```ts
window.univerAPI.getBase('northstar-seed-readiness').getTableById('workstreams').getRecordById('workstreams-2').setValue('note', 'Review descriptions for 84 illustrative starter packs.')
```

Revise the native strategy title and dependency card:

```ts
window.univerAPI.getPresentation('northstar-seed-strategy').getSlideById('purpose').getShape('title').getText().setText('A shared beginning.')
```

```ts
window.univerAPI.getBoard('northstar-seed-dependencies').getShape('prepare').getText().setText('Describe materials\nNoel / In review')
```

Finally edit above all four body anchors:

```ts
window.univerAPI.getDocument('northstar-seed-project').getParagraphs()[1].appendText(' Revised.')
```

Each anchor should move nine UTF-16 units and all four children should preserve
their edited data. Use native Undo/Redo in the relevant active product.
This is not Formula Shape, Formula CustomRange or cross-product synchronization.

## Acceptance and limits

Preview and standalone export share the same factory, snapshots and all official
CSS imports. Docs defaults to Grid; full native Sheet feature plugins match
the embedded ribbon rather than displaying unregistered operations. No generic
fixture panel, duplicate toolbar or iframe child substitute is introduced.
The actual child-scoped Board editor-service registration follows Board startup,
after the real Slides unit supplies the root service.

Selected production evidence is in
`test-results/embed-mixed-docs-modern-print-release/report.json`.
All four native blocks render and open fullscreen. All five literal examples
modify their intended unit; the host edit moves all four anchors by nine UTF-16
units without changing the children. Base, Slides and Board literal edits pass
native full-five-model Undo/Redo. Actual Sheet keyboard input changes 84 packs
to 90 and Undo restores 84. Its native one-page Print preview opens and cancels
without backend requests; this is not whole-document printing or a produced PDF.

The strict production gate remains **failing**, with three snapshot comparisons
covering two Sheet serialization differences: the first Facade Undo leaves an
empty validation map (`{}` becomes `{"resources":[]}`), and native text entry
leaves a generated input-style cache entry after Undo. These observations do not
establish lost user values; the test retains exact snapshots and does not silently
normalize either difference. Other checks continue so those failures do not hide
independent product results. Do not report this as full history acceptance.

Disposal while the Board is fullscreen initially produced stale host/LocaleService
errors. The demo now waits for the SDK's actual `exited$` release signal and queued
focus recovery before releasing its host. The selected fullscreen-disposal recheck
passes. `dispose()` is asynchronous; await it when switching an owned demo yourself.
Repeated/racing mounts and background-tab disposal still require verification.

EN/ZH guide/theme checks are in `test-results/embed-mixed-docs-modern-next-recheck/report.json`.
They exercise all five literal examples, preserve the same API owner and edited
models through theme changes; the native Board may rebuild its palette with the
same theme ID. The independent export contains eleven source files and 23 official
CSS imports; see `test-results/embed-mixed-docs-modern-export-final/report.json`.
The intermediate `next-final` run caught old server guide text versus updated
client metadata during development refresh, plus a React pre-mount update warning.
A same-server recheck passes; that is not proof of general hydration reliability.
The selected build transforms 1,944 modules: main JS about 18,833 kB / 4,645 kB gzip,
CSS 170.48 kB / 25.10 kB gzip. Cold Next guide/playground took about 88s/29s with a
Gzip listener warning; performance is not accepted.

Complete menus, source failures, saved reload, repeated mounts, multiple owners,
native editing in every child, mobile/touch, accessibility and performance require
separate acceptance. Earlier production, scoped-controls, keyboard, native-focus,
all-history and release failures remain in their report directories.

Names, numbers, dates and statuses are synthetic. No planting advice, suitability
or germination claim, real distribution, purchase, participant data collection,
notifications, backend or Exchange conversion is included. Registering Print
does not certify a produced PDF or the complete host document. License
watermarks remain unchanged. Reload loses local edits.
