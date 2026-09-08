# Reed / Operations map

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

A native Base is both host and source. Its Operations map tab contains a native
Board with twelve Formula Shapes and three bound connectors. This is Board@Base
Tab, with Base -> Board calculation; moving a card does not update a record.

Three fictional repair-station workstreams start with assigned loads 14, 9 and
7 hours against capacities 18, 12 and 10 hours. Total load is 30 of 40 hours (75%).
Repair is blocked, independently of its three spare hours. Authored labels and
notes explain the story; numbers and the review prompt are native formulas, not
JavaScript aggregates. Cards are not charts; arrows describe dependencies, not
workflow automation. A negative remainder is visible rather than clamped to zero.

## Sixteen literal examples

Run these in order in the demo iframe or standalone console. Use Workstream
register for native cell editing and Operations map for the live outputs. No
manual refresh or extra action panel is required. Native Board tools edit the
authored map; Base record edits drive the formula values.

### 1. A fuller repair bench

Total becomes 33 hours, utilization 82.5%, and Repair has zero spare hours.
Blocked status still requires a conversation.

```ts
window.univerAPI.getBase('reed-repair-station').getTableById('streams').getRecordById('stream-2').setValue('load', 12)
```

### 2. Capacity changes independently

Available capacity falls to 38. Repair is two hours over capacity; the review
prompt becomes Rebalance the load. Utilization is about 86.8% overall, proving
that a comfortable total can still conceal one overloaded workstream.

```ts
window.univerAPI.getBase('reed-repair-station').getTableById('streams').getRecordById('stream-2').setValue('capacity', 10)
```

### 3. Unblock without inventing more capacity

Blocked count becomes zero; overload remains one and keeps priority in the prompt.

```ts
window.univerAPI.getBase('reed-repair-station').getTableById('streams').getRecordById('stream-2').setValue('status', 'Ready')
```

### 4. Rebalance the work

Total becomes 29; Repair has two hours free. The prompt becomes Ready to review.

```ts
window.univerAPI.getBase('reed-repair-station').getTableById('streams').getRecordById('stream-2').setValue('load', 8)
```

### 5. Context is not a metric

No calculated value changes. Map prose is authored, not a live copy of this field.

```ts
window.univerAPI.getBase('reed-repair-station').getTableById('streams').getRecordById('stream-1').setValue('note', 'Add a labelled shelf for small electrical items.')
```

### 6. An empty working view is not an empty source

All three records are Ready, so this view has no rows. The formulas still read
the entire table; capacity and load must not become zero.

```ts
window.univerAPI.getBase('reed-repair-station').getTableById('streams').getViewById('streams-grid').setFilter({
  conjunction: window.univerAPI.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'status', operator: window.univerAPI.Enum.BaseFilterOperator.IS, operand: 'Blocked' }],
})
```

### 7. Update a hidden workstream

Handover now has minus one spare hour and overload count returns to one.

```ts
window.univerAPI.getBase('reed-repair-station').getTableById('streams').getRecordById('stream-3').setValue('load', 11)
```

### 8. Unknown load

The stored value is null. SUM/SUMIF ignore it, so total is 22 and the Handover
load card shows zero; this arithmetic does not mean the source value is known.

```ts
window.univerAPI.getBase('reed-repair-station').getTableById('streams').getRecordById('stream-3').setValue('load', null)
```

### 9. Known zero load

The aggregate is unchanged, but the stored source value is now numeric zero.

```ts
window.univerAPI.getBase('reed-repair-station').getTableById('streams').getRecordById('stream-3').setValue('load', 0)
```

### 10. No capacity is not zero utilization

Total load stays 22; capacity is zero. Utilization must show a native division
error, while Intake and Repair are visibly over capacity.

```ts
const table = window.univerAPI.getBase('reed-repair-station').getTableById('streams')
for (let i = 1; i <= 3; i++) table.getRecordById('stream-' + i).setValue('capacity', 0)
```

### 11. Recover numbers and status, retaining context

Baseline amounts and status return. The filter still shows only the blocked
Repair record; the new context note remains.

```ts
const table = window.univerAPI.getBase('reed-repair-station').getTableById('streams')
for (const [i, load, capacity, status] of [[1,14,18,'Ready'],[2,9,12,'Blocked'],[3,7,10,'Ready']]) {
  const record = table.getRecordById('stream-' + i)
  record.setValue('load', load)
  record.setValue('capacity', capacity)
  record.setValue('status', status)
}
```

### 12. Reveal the complete register

```ts
window.univerAPI.getBase('reed-repair-station').getTableById('streams').getViewById('streams-grid').setFilter(null)
```

### 13. Rename and prove fresh calculation

The original unit ID and Streams formula name remain stable. A new load returns
33 hours, proving more than a retained pre-rename picture.

```ts
const base = window.univerAPI.getBase('reed-repair-station')
base.setName('Reed / Reviewed operations')
base.getTableById('streams').getRecordById('stream-2').setValue('load', 12)
```

### 14. Unavailable source

The real Base remains intact; this changes the Board's qualifier mapping. Native
errors must remain visible, not become cached totals or estimated values.

```ts
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'reed-operations-map', qualifier: 'Reed Operations', sourceUnitId: 'reed-unavailable-source', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 15. Repair the mapping

```ts
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'reed-operations-map', qualifier: 'Reed Operations', sourceUnitId: 'reed-repair-station', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 16. Inspect both native snapshots

Reading snapshots is not persistence or file conversion. The Base contains the
embed reference, not the Board's complete content.

```ts
console.log({ host: window.univerAPI.getBase('reed-repair-station').save(), board: window.univerAPI.getBoard('reed-operations-map').save() })
```

## Integration and references

### Edit the native map

Click the ONE BASE / THREE CONNECTED WORKSTREAMS node and press ArrowRight:
the node moves and all three bound connectors follow it. Double-click its text
to append a note. Click outside to commit; the native text box may grow and its
connectors follow the new bounds. Click the canvas again before using keyboard
Undo/Redo, since committing unmounts the floating text editor. Map editing does
not write back to Base records or replace their formulas.

### Reconstruct the edited pair

In the standalone entry module, declare the factory result with `let demo`
instead of `const demo`. Keep its existing `createDemo` import and `container`.
This example serializes both native snapshots and replaces the owner; it does
not reset the Board to its seed formulas or map. Run it after editing the source
and map, then change another source record to check fresh calculation.

```js
const saved = JSON.parse(JSON.stringify({
  host: demo.univerAPI.getBase('reed-repair-station').save(),
  board: demo.univerAPI.getBoard('reed-operations-map').save(),
}))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
```

This is same-pair native snapshot recovery, not arbitrary file import or durable
storage. A Base snapshot holds the embed reference, not the complete Board.

One factory powers Preview and standalone. Base stays the root; the native Base
workbench owns its canvas. The renderer-only ownership rule excludes that canvas
and thumbnails from the generic main-canvas focus switcher. Base-list
prepare/materialize/restore uses SDK services as in the local example; it is not
advertised as a public Facade method. Board text editing registers the SDK's real
EditorUIService through Board's runtime-scoped extension, without a hidden Slides
unit. User snippets use public Facade APIs. Ten official stylesheets and complete
English packs cover the registered UI dependencies. Base uses Grid where applicable;
Board retains its native floating tools rather than receiving a duplicate ribbon.

Saved snapshots can be passed as the fourth factory argument, `{ host, board }`.
Restore uses saved native resources without reinstalling initial formulas. This
path has the selected runtime evidence described below. Native snapshot recovery
is not arbitrary import or durable storage. No server is used.

The cached Gamma Budget Review reference informs the prominent review hierarchy
only. The supplied Deep Ocean color system informs original navy, teal, amber
and lavender combinations. All business data, map prose and geometry are original;
no competitor artwork is redistributed.

## Acceptance status

Partial, not fully accepted. test-results/embed-reed-formula-owned-ui/report.json
passes all sixteen literal examples and twelve results on the current Board
canvas, not a historical paint log. The complete authored pages, order, geometry,
text and name are preserved (only calculated formula lastValue is excluded).
All three native rendered connector routes resolve to their actual bound sites.
Empty filters, hidden-record edits, null/zero distinction, negative spare capacity,
division/missing-source error status, explicit repair and source rename/fresh
writes pass. Native Base typing 9 -> 11 updates all outputs; exact full-Base
Undo/Redo and passive Board-visible source writes/return navigation pass.

Ten entire EN/ZH dependency packs and complete Base/Board snapshot preservation
through theme changes pass. Active Board-tab disposal releases owned UI and API
with no observed errors, warnings or backend requests. The first report at
test-results/embed-reed-formula-initial/report.json retained two setup failures:
the initial fallback theme differed from the SDK's first resolved theme, and a
Board content React root outlived its scoped injector. Fresh Board creation now
uses the SDK createBoardThemePreset with ThemeService's resolver; saved themes
are not overwritten. Disposal explicitly unmounts the owned native Board content
root before child/host unit and injector disposal. No SDK package is patched.

test-results/reed-formula-export-ui/report.json checks eleven-file exact source
parity and native white/flex/canvas styling. Ten official CSS imports are included.
The selected production export reuses an installed dependency tree only after
checking every requested dependency/devDependency version, avoiding a second
large installation. This does not establish optimized delivery performance.
The updated README export also passes eleven-file parity and live official-CSS
checks in test-results/reed-recovery-export-ui/report.json.
The native-editing guide update is checked by
test-results/reed-native-export-ui/report.json using the same eleven-file export.

test-results/embed-reed-roundtrip-preserved/report.json passes the literal
two-unit reconstruction across four replacement owners: edited content/formula/
number format, unavailable binding, Chinese dark appearance and a deleted Formula
Shape. Both complete snapshots match, except the checked native embed activation
timestamp. Five invalid pairs leave the current owner intact. A saved empty view
still excludes every record without changing whole-table calculations; fresh
hidden-record edits and real Base keyboard input repaint all twelve results.
The custom total formula remains SUM(Load)+2 with one-decimal hours. Changed map
text and all three connector routes survive recovery after FBoard.translateElement
moves the source node. Deleting utilization stays respected after recovery and
another fresh input updates the other eleven results. Missing bindings remain
native errors until explicit repair. Disposal has no errors, warnings or backend
requests in this selected test.

Native interaction now has separate evidence at
test-results/embed-reed-native-history/report.json. Actual painted-glyph clicks
and ArrowRight move the node and bound routes in fresh, edited-source/formula,
and Chinese dark states. Native movement Undo/Redo preserves the full serialized
Board and leaves the Base unchanged. Text typing/commit and full serialized
Undo/Redo pass in EN/ZH; after editor commit, the surviving canvas is refocused
before sending shortcuts. Fresh Base writes still update the edited map.

The stronger recovery report at
test-results/embed-reed-roundtrip-native-layout/report.json repeats all four
saved-state variants after real keyboard movement and native text typing, not
Facade translation alone. Connector comparison uses the post-text-edit bounds:
native text auto-fit legitimately grows the node before saving. No runtime
factory or SDK package was changed for these tests.

Earlier coordinate/selection attempts in embed-reed-roundtrip and
embed-reed-roundtrip-native timed out; the actual painted-text interaction passes
the equivalent edited-source flow. Intermediate embed-reed-native-paint also
compared absent properties against SDK-added undefined flip fields; the final
test compares every JSON-serialized field without stripping model data. The
first text-history attempt left focus on body after the editor unmounted;
refocusing the native canvas provides an explicit working keyboard workflow.
These observations do not certify every selection or focus path. All remaining
native tools, valid-source rebinding, durable storage, Print/Exchange,
responsive/accessibility, Next integration and delivery performance stay open.
