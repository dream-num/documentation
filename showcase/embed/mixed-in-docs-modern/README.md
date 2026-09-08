# Northstar / Complete project brief

Current language contract: native UI, startup alerts and authored data stay English under either host language. The legacy third locale argument remains accepted but is ignored. All complete English plugin packs, official CSS, native Grid menus and independent host/child models are retained. Earlier bilingual evidence below is historical; this language migration does not resolve its recorded SDK limitations or certify every interaction.

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

Disposal while the Board is fullscreen initially produced stale host/LocaleService
errors. The demo now waits for the SDK's actual `exited$` release signal and queued
focus recovery before releasing its host. The selected fullscreen-disposal recheck
passes. `dispose()` is asynchronous; await it when switching an owned demo yourself.
Repeated/racing mounts and background-tab disposal still require verification.

Complete menus, source failures, saved reload, repeated mounts, multiple owners,
native editing in every child, mobile/touch, accessibility and performance require
separate acceptance. Earlier production, scoped-controls, keyboard, native-focus,
all-history and release failures remain in their report directories.

Names, numbers, dates and statuses are synthetic. No planting advice, suitability
or germination claim, real distribution, purchase, participant data collection,
notifications, backend or Exchange conversion is included. Registering Print
does not certify a produced PDF or the complete host document. License
watermarks remain unchanged. Reload loses local edits.
