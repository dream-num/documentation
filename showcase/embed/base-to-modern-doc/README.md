# Cinder / Incident briefing

Eight fictional service incidents live in one native Base DocBlock. Ten inline
formulas drive an authored modern document: status counts, session totals,
resolution share, open-incident average and a conditional handoff signal.
No hidden Sheet, backend, JavaScript aggregation or custom control panel is used.

This is a partial SDK demo. Native source binding now preserves calculations
after renaming the Base. Native error status and Undo after fullscreen reentry
retain failures. See Acceptance status below.

## Seventeen literal examples

Run these in order in the standalone page or demo iframe. Double-click the Base
block, use its native Enter fullscreen control, run one snippet, then exit
fullscreen to read the summary. Repeat for the next source edit. Native Base
editing uses the same source model. No manual recalculation is needed.

Status is a manually maintained field. Monitoring is not Resolved. Session counts
are illustrative and may overlap across incidents; their sum is not unique users,
an uptime measure or a production health signal.

### 1. Resolve one investigation

Open count becomes 2, resolved count 4 and resolved share 50%. Open sessions fall to 165; total sessions remain 300. The open average becomes 82.5.

```ts
window.univerAPI.getBase('cinder-incident-register').getTableById('incidents').getRecordById('incident-3').setValue('status', 'Resolved')
```

### 2. Correct the recorded impact

Change login sessions from 120 to 150. Open sessions become 195, total 330 and the open average 97.5. Status counts do not change.

```ts
window.univerAPI.getBase('cinder-incident-register').getTableById('incidents').getRecordById('incident-1').setValue('sessions', 150)
```

### 3. Move from investigation to monitoring

Login is now Monitoring, not Resolved. Open becomes 1, monitoring 3, resolved stays 4. Open sessions are 45; monitored sessions 190.

```ts
window.univerAPI.getBase('cinder-incident-register').getTableById('incidents').getRecordById('incident-1').setValue('status', 'Monitoring')
```

### 4. Leave an estimate unknown

The receipt incident stores null. Open sessions and their average become zero under native SUMIF semantics; the open record still exists. Total sessions become 285. Zero in this aggregate does not establish that the source had no impact.

```ts
window.univerAPI.getBase('cinder-incident-register').getTableById('incidents').getRecordById('incident-2').setValue('sessions', null)
```

### 5. Record an explicit zero

The aggregate stays unchanged, but the stored input is now 0, not null. Inspect the source as well as the summary.

```ts
window.univerAPI.getBase('cinder-incident-register').getTableById('incidents').getRecordById('incident-2').setValue('sessions', 0)
```

### 6. Recover the initial register

Restore every status and count. Baseline: 8 records, 3 Open, 2 Monitoring, 3 Resolved; 180 open / 40 monitored / 300 total sessions, 37.5% resolved and an open average of 60.0.

```ts
const table = window.univerAPI.getBase('cinder-incident-register').getTableById('incidents')
for (const [i, status, sessions] of [[1,'Open',120],[2,'Open',45],[3,'Open',15],[4,'Monitoring',30],[5,'Monitoring',10],[6,'Resolved',60],[7,'Resolved',20],[8,'Resolved',0]]) {
  const record = table.getRecordById('incident-' + i)
  record.setValue('status', status)
  record.setValue('sessions', sessions)
}
```

### 7. Change handoff context

Changing owner and note must not change any result; later numerical edits must still recalculate. Source display-name stability is tested separately below.

```ts
const table = window.univerAPI.getBase('cinder-incident-register').getTableById('incidents')
const record = table.getRecordById('incident-1')
record.setValue('owner', 'Mara / next shift')
record.setValue('note', 'Compare a fresh callback trace before the next handoff.')
```

### 8. Show only open incidents

The native view contains incidents 1, 2 and 3. Whole-table formulas continue to include all eight records, including resolved ones.

```ts
const view = window.univerAPI.getBase('cinder-incident-register').getTableById('incidents').getViewById('incidents-grid')
view.setFilter({
  conjunction: window.univerAPI.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'status', operator: window.univerAPI.Enum.BaseFilterOperator.IS, operand: 'Open' }],
})
```

### 9. Edit a hidden resolved record

Image fallback is hidden by that view. Its 60 sessions become 90, so total sessions rise to 330. Open/monitoring counts and their impacts stay unchanged.

```ts
window.univerAPI.getBase('cinder-incident-register').getTableById('incidents').getRecordById('incident-6').setValue('sessions', 90)
```

### 10. Reveal the complete register

Clearing the view filter restores eight visible records without changing any formula result.

```ts
window.univerAPI.getBase('cinder-incident-register').getTableById('incidents').getViewById('incidents-grid').setFilter(null)
```

### 11. Empty the investigation queue

Mark all records Resolved. The signal changes to No open investigations, resolved share to 100%, and open/monitoring counts and impacts to zero. The open average must display native #DIV/0!, not a fabricated zero. Total historical sessions remain 330.

```ts
const table = window.univerAPI.getBase('cinder-incident-register').getTableById('incidents')
for (let i = 1; i <= 8; i++) table.getRecordById('incident-' + i).setValue('status', 'Resolved')
```

### 12. Recover the queue

Restore initial statuses and counts. The division error must clear and every baseline result must return without refreshing the page.

```ts
const table = window.univerAPI.getBase('cinder-incident-register').getTableById('incidents')
for (const [i, status, sessions] of [[1,'Open',120],[2,'Open',45],[3,'Open',15],[4,'Monitoring',30],[5,'Monitoring',10],[6,'Resolved',60],[7,'Resolved',20],[8,'Resolved',0]]) {
  const record = table.getRecordById('incident-' + i)
  record.setValue('status', status)
  record.setValue('sessions', sessions)
}
```

### 13. Inspect native bindings and a detached text projection

The native save retains formula resources. The display-text snapshot is a detached projection of the last successful values, not a fresh calculation, live document or Exchange export. Neither read should change the live document.

```ts
const doc = window.univerAPI.getDocument('cinder-incident-brief')
console.log(doc.getFormulas().map(formula => formula.getResult()))
console.log(doc.save())
console.log(doc.saveFormulaDisplayTextSnapshot())
```

## Separate source identity check

### 14. Rename and prove the next edit still calculates

Run with the Base expanded. All ten formulas remain live: open sessions become
181, all sessions 301 and the open average 60.3333 (displayed as 60.3). The factory
persists the source mapping with FFormula.upsertExternalReference before inserting
hand-authored formulas. The qualifier Cinder Incidents stays bound to the stable
source ID even when its display name changes. An unchanged cached value alone
is not a pass; this example edits a number after the rename.

```ts
const source = window.univerAPI.getBase('cinder-incident-register')
source.setName('Cinder / May shift register')
source.getTableById('incidents').getRecordById('incident-1').setValue('sessions', 121)
```

### 15. Repeat the same mapping safely

The call succeeds without changing the complete saved document. It neither
duplicates the reference nor rewrites formulas. This is the same public Facade
operation used by the factory before initial formula insertion.

```ts
const bound = window.univerAPI.getFormula().upsertExternalReference({
  unitId: 'cinder-incident-brief',
  qualifier: 'Cinder Incidents',
  sourceUnitId: 'cinder-incident-register',
  sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE,
})
if (!bound) throw new Error('Could not bind the incident register')
```

### 16. Remove the mapping without deleting the source

The Base still exists and accepts 122 sessions. Its renamed display label no
longer matches the formula qualifier, and the explicit mapping is now absent.
Native reference/value errors must remain visible in the summary. This removes
a binding, not a Base unit, record, paragraph or formula. Error-status metadata
is a separate known SDK limitation, not something this demo normalizes.

```ts
const removed = window.univerAPI.getFormula().removeExternalReference({
  unitId: 'cinder-incident-brief', qualifier: 'Cinder Incidents',
})
if (!removed) throw new Error('Source mapping was not found')
window.univerAPI.getBase('cinder-incident-register').getTableById('incidents').getRecordById('incident-1').setValue('sessions', 122)
```

### 17. Repair the mapping and prove live recovery

Bind the existing renamed source again, then change its sessions to 123. Open
sessions become 183, total sessions 303 and average 61.0. All ten formulas recover
in place without reloading the document. This repairs the same-source mapping;
it does not demonstrate replacing the Base with a different unit.

```ts
const bound = window.univerAPI.getFormula().upsertExternalReference({
  unitId: 'cinder-incident-brief',
  qualifier: 'Cinder Incidents',
  sourceUnitId: 'cinder-incident-register',
  sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE,
})
if (!bound) throw new Error('Could not repair the incident source mapping')
window.univerAPI.getBase('cinder-incident-register').getTableById('incidents').getRecordById('incident-1').setValue('sessions', 123)
```

## Native implementation and visual reference

FUniver.createEmbed uses DocBlock and loadAsync. FDocument.insertFormula binds
COUNTA, COUNTIF, SUM, SUMIF and IF to [Cinder Incidents]!Incidents columns.
FFormula.upsertExternalReference persists the source mapping before insertion.
The formula engine updates native inline custom ranges without replacing prose.

The cached Notion project-brief reference informs a clear title, a concise
summary and a working-register section. All incident names, prose and data are
original. Slate ink, rust accents and amber/sage status colors vary the Deep
Ocean-inspired palette; the editor retains official white UI. No reference
artwork is redistributed.

Preview and standalone share one factory, Grid ribbon and all required official
SDK CSS. The only controls are native editor controls. This case does not claim
Base Print, Exchange conversion, collaboration, paging or status-page publishing.

## Formula editor language coverage

The shared factory includes official English and Simplified Chinese locale packs
for every previously configured locale import, including Docs Formula UI, Shape
Editor UI and Embed Unit UI. The last two are dependencies of the native formula
editor and source selector; loading only Docs Formula UI does not translate them.
Their official CSS is included in the independent export. The factory follows
the page's HTML language at startup (English otherwise); FUniver.setLocale can
switch between enUS and zhCN without recreating the document.

Run scripts/test-docs-formula-locales.mjs with SHOWCASE_CASE=cinder and the
selected SHOWCASE_ORIGIN. It checks all official leaves in the three formula
editor packs, the native Edit formula action, the formula editor, more number
formats, visible text/accessible labels/placeholders, and exact document/owner
preservation after cancellation in both languages. Selected production evidence:
test-results/docs-formula-locales-cinder/report.json.
This is language acceptance, not full layout acceptance: native dialog bounds
are recorded separately. Cinder's development integration also retains React
synchronous-unmount warnings when dismissing the source viewer; see sdk-issues.md.

## Acceptance status

test-results/embed-cinder-formula-binding-recovery/report.json remains a strict FAIL.
Twelve source-edit examples update all ten expected results on the current native
document canvas, preserving the complete authored body, paragraph styles and
custom ranges. The thirteenth example produces a detached display-text projection
without changing the live document or its ten formula bindings. Status versus
impact, null versus zero, metadata isolation, filtered-view versus whole-table
scope, hidden edits and empty-queue recovery all have selected evidence.
Examples 14–17 additionally verify source rename with live current-canvas updates,
persisted qualifier/ID mapping, idempotent binding with an unchanged full document,
visible missing-binding errors and same-source repair without replacing prose.

Native fullscreen input also passes: 120 becomes 140, open sessions become 200,
total sessions 320 and the open average 66.7. Exact snapshot Undo/Redo passes
within that same fullscreen session. After leaving and reentering fullscreen,
Undo does not restore the Base input; Redo for that path is unverified. The
rename/disposal check therefore uses a fresh owner, rather than hiding the history
failure with a model repair. Active Base fullscreen disposal passes. No browser
errors or backend calls were observed in the independent run.

The zero-open average displays #DIV/0! but its result reports success/string
instead of error. Missing-binding errors also retain incorrect status metadata.
The earlier rename failure in embed-cinder-formula-history/report.json is historical:
the factory now explicitly persists hand-authored references with the documented
FFormula.upsertExternalReference API before insertion. Both rename and subsequent
live editing pass. This is a demo initialization fix, not a patched SDK or a claim
that insertFormula alone persists every supplied Base reference. No JavaScript
fallback, automatic repair after edits or result-status normalization is used.

The eleven-file independent export passes source parity and native white UI:
test-results/cinder-formula-export-bound/report.json. All eight official SDK CSS
imports are included. Selected build: 1,852 modules, 18,522.34 kB main JS
(4,563.91 kB gzip), 134.30 kB CSS (19.04 kB gzip), plus language chunks.
Large-bundle warnings remain; this is not performance acceptance.
The final export check used port 4390 because another task owned 4190; that
unrelated process was left running. The earlier port-collision report is retained.

test-results/embed-cinder-formula-next-bound/report.json passes all seventeen
literal examples in EN/ZH, unchanged authored body, redundant-card absence,
official white UI and theme changes preserving the same owner and complete
Doc/Base models. The first integration report failed because a frame handle was
captured during iframe initialization; the corrected test waits for the live
preview before acquiring its frame. No running service was restarted for that
observation failure. Earlier thirteen-example and unbound-source reports remain historical.

Complete save/reload, missing-unit recovery and different-source rebind, invalid field input, native
menus, accessibility and delivery remain open. No claim is made that this one
story covers every Modern Docs feature.
