# Violet / Editorial review

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

Eight original fictional articles live in a real Base data page inside the
native Slides page list. This is **Base@Slide Tab**, not a Float or a bottom tab.
Data flows **Base -> Slides** through thirteen native Formula Shapes on three
authored pages. There is no hidden Sheet, JavaScript aggregation or refresh button.

Initially 5 / 8 pieces are Ready (62.5%), but only 4,400 / 8,200 words are Ready
(53.66%). Guides have 1,900 / 2,700 ready words, Essays 1,400 / 3,200 and Interviews
1,100 / 2,300. Word totals are editorial estimates, not publishing approval.

## Twelve literal examples

Open Editorial data in the native page list before each example. Run these in
order in the demo iframe or standalone preview. Inspect Overview, Sections and
Decision after each edit. Each mutation uses explicit Base/table/record/field IDs.

### 1. Mark the long essay ready

Ready becomes 6 / 8 (75%); ready words become 6,200 / 8,200 (75.61%).
Only the Essays ready subtotal changes.

```ts
window.univerAPI.getBase('violet-editorial-register').getTableById('pieces').getRecordById('piece-6').setValue('status', 'Ready')
```

### 2. Revise a ready article's length

The ready essay becomes 2,000 words. Ready count stays six, but the word-weighted
share becomes 6,400 / 8,400 (76.19%). The two percentages are not interchangeable.

```ts
window.univerAPI.getBase('violet-editorial-register').getTableById('pieces').getRecordById('piece-6').setValue('words', 2000)
```

### 3. Unblock without declaring ready

The native IF result changes from Resolve blockers to Review the mix.
Neither the ready count nor the ready-word subtotal increases.

```ts
window.univerAPI.getBase('violet-editorial-register').getTableById('pieces').getRecordById('piece-7').setValue('status', 'Review')
```

### 4. A genuinely missing word estimate

The first Guide still counts as Ready. SUM ignores its null estimate:
ready words 5,500 / 7,500, with Guide ready words 1,000.

```ts
window.univerAPI.getBase('violet-editorial-register').getTableById('pieces').getRecordById('piece-1').setValue('words', null)
```

### 5. Explicit zero is a different source value

Aggregates match example 4, but the source now contains an observed zero, not null.
A zero-word Ready article still contributes one Ready record.

```ts
window.univerAPI.getBase('violet-editorial-register').getTableById('pieces').getRecordById('piece-1').setValue('words', 0)
```

### 6. Recover original estimates and statuses

```ts
const table = window.univerAPI.getBase('violet-editorial-register').getTableById('pieces')
for (const [i, status, words] of [[1,'Ready',900],[2,'Ready',600],[3,'Ready',1400],[4,'Ready',1100],[5,'Ready',400],[6,'Review',1800],[7,'Blocked',1200],[8,'Draft',800]]) {
  table.getRecordById('piece-' + i).setValue('status', status)
  table.getRecordById('piece-' + i).setValue('words', words)
}
```

### 7. Change display labels without replacing identities

The stable Base/table IDs and table formula name Pieces remain unchanged.
Subsequent edits must still recalculate; unchanged cached output alone is not proof.

```ts
const base = window.univerAPI.getBase('violet-editorial-register')
base.setName('Violet / November editorial register')
base.getTableById('pieces').setName('November articles')
```

### 8. Filter the view to ready articles

The native view shows five records, while whole-table formulas retain all eight.
A view filter does not remove records from these formula dependencies.

```ts
const view = window.univerAPI.getBase('violet-editorial-register').getTableById('pieces').getViewById('pieces-grid')
view.setFilter({
  conjunction: window.univerAPI.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'status', operator: window.univerAPI.Enum.BaseFilterOperator.IS, operand: 'Ready' }],
})
```

### 9. Edit an article hidden by that filter

The blocked interview grows to 1,500 words. Ready stays 5 / 8, but ready-word
share becomes 4,400 / 8,500 (51.76%). Interviews total becomes 2,600 and unfinished
words become 4,100. Stable references still work after the display-name changes.

```ts
window.univerAPI.getBase('violet-editorial-register').getTableById('pieces').getRecordById('piece-7').setValue('words', 1500)
```

### 10. Reveal the complete table

```ts
window.univerAPI.getBase('violet-editorial-register').getTableById('pieces').getViewById('pieces-grid').setFilter(null)
```

### 11. Zero total words / Native ratio error

Ready count and count percentage remain valid, but ready words / all words
divides zero by zero. The native result must expose the error, not display 0%.

```ts
const table = window.univerAPI.getBase('violet-editorial-register').getTableById('pieces')
for (let i = 1; i <= 8; i++) table.getRecordById('piece-' + i).setValue('words', 0)
```

### 12. Recover all word estimates

```ts
const table = window.univerAPI.getBase('violet-editorial-register').getTableById('pieces')
for (const [i, words] of [[1,900],[2,600],[3,1400],[4,1100],[5,400],[6,1800],[7,1200],[8,800]]) {
  table.getRecordById('piece-' + i).setValue('words', words)
}
```

## Implementation and export

The existing SDK local Slides Tab pattern prepares, materializes and restores a
real SlidesPageListBlock. Formula bindings use a readable qualifier plus stable
Base unit ID. Preview and standalone export share the factory and all eight
official SDK CSS imports. Grid is the configured ribbon; the Base retains its own
native view controls. There are no duplicate host toolbar actions or fixture panels.

Below 640px, Show pages / Hide pages uses FUniver.setUIVisible with the native
LEFT_SIDEBAR part. It exposes the original page list, not a replacement menu.
Enter and Space operate the button; closing the list fits the slide to the
available canvas. Returning to desktop restores the native list and hides the
extra button. Native zoom updates the saved zoomRatio, not the authored layout.

The cached Gamma Team Retrospective cover informs the editorial review hierarchy;
the supplied Deep Ocean colors inform plum, warm paper and teal pages. All article
names, people and prose are fictional and original. No competitor artwork is
redistributed. No network publishing, Exchange conversion, whole-deck printing,
collaborative history or Base print capability is implied.

## Acceptance status

Responsive update: test-results/embed-violet-responsive-native/report.json passes
an initial 320px load, keyboard navigation through all three result pages at
320/390px, desktop restoration and the complete existing twelve-snippet suite.
Current-canvas text, source data, authored content and API ownership are checked;
there are no observed browser errors or backend calls in this independent build.
test-results/violet-responsive-export-ui/report.json passes eleven-file source
parity and official native white CSS. The rebuilt bundle has 1,846 modules,
18,441.31 kB JS (4,542.23 kB gzip), 151.28 kB CSS (21.44 kB gzip).
This is not complete mobile editing acceptance: Grid ribbon clipping, small
slide text and the Base data page's own narrow-screen controls remain open.
The EN/ZH outer-page checks complete at all three widths, but
test-results/showcase-card-free-responsive/report.json is FAIL on Next development
Performance.measure negative timestamp errors in the React Server Components
client. Those errors are retained, not suppressed. Earlier reports below describe
the pre-responsive build and must not substitute for current-build verification.
The current EN/ZH formula guide also completes twelve snippets, thirteen outputs
and full-model theme preservation in both locales, but remains FAIL for the same
development exception: test-results/embed-violet-responsive-next/report.json.

Partial, not fully accepted. test-results/embed-violet-formula-native/report.json
passes all twelve literal examples, thirteen native results and current canvases
on all three result pages. Unchanged authored prose/layout, display-name stability,
five-row filtered projection versus eight-record formula source, hidden-record
edits, null versus zero, native zero-denominator error/recovery and off-page writes
are checked. Native title and word editing, exact full-Base Undo/Redo and active
data-page disposal pass with no observed browser errors or backend requests.

Earlier test failures are retained: the test looked for the old title after a
successful native rename, then for 900 instead of the native formatted 900.00.
These were test assumptions, not SDK defects; the SDK was not patched.

The eleven-file independent export passes source/CSS parity and native white UI:
test-results/violet-formula-export-ui/report.json. The selected build has 1,846
modules, 18,440.54 kB JS (4,541.90 kB gzip) and 150.83 kB CSS (21.30 kB gzip).
Large-bundle warnings remain. EN/ZH pages also pass all twelve snippets, removal
of the redundant explanation card, and API owner/full-model preservation through
dark/light changes: test-results/embed-violet-formula-next/report.json. Cold Next
startup took about two minutes for the guide and 22.8 seconds for the playground;
a Gzip listener warning remains. These timings are not performance acceptance.
Missing-source/rebinding, persistence/reload, all native menus, accessibility and
delivery performance remain open. A registry entry is not complete acceptance.
