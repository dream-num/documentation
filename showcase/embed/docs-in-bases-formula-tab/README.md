# Ember / Release notes

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

Twelve original fictional release records drive twelve native inline formulas in a modern Doc embedded in the Base list. This is **Doc@Base Tab**, with **Base -> Doc** calculation: embedding direction does not imply write-back.

No hidden Sheet, JavaScript aggregation, generated prose or extra control panel. Native Grid ribbon and complete English dependency packs are included with official CSS in the standalone export. Authored content is English.

## Twenty literal examples

Run in order in the standalone page or demo iframe. Switch between Changes and Release notes through native Base navigation. Source changes must update formulas even while the other tab is selected; no manual refresh is required. Each formula has a stable external source binding.

### 1. Finish one review

Complete becomes 10 / 12 (83.3%); 9.5 hours remain. The blocker still requires attention.

```ts
window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-10').setValue('stage', 'Complete')
```

### 2. Revise the migration estimate

Changing 8 to 13 hours gives 14.5 remaining and 7.25 per unfinished record. Counts do not change.

```ts
window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-11').setValue('hours', 13)
```

### 3. Unblock without claiming completion

Move migration into Review. There are 2 Review, 0 Blocked; the prompt changes to Finish the review queue.

```ts
window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-11').setValue('stage', 'Review')
```

### 4. Keep context separate

Owner and note are not formula inputs. No result should change.

```ts
window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-11').setValue('owner', 'Eli / review partner')
window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-11').setValue('note', 'Review duplicate handling with a small sample before any migration.')
```

### 5. Filter the native view

Show only Review records; all 12 records remain in whole-table formulas.

```ts
window.univerAPI.getBase('ember-release-register').getTableById('changes').getViewById('changes-grid').setFilter({ conjunction: window.univerAPI.Enum.BaseFilterConjunction.AND, conditions: [{ fieldId: 'stage', operator: window.univerAPI.Enum.BaseFilterOperator.IS, operand: 'Review' }] })
```

### 6. Change a hidden record

Reopen the hidden shortcut guide. Complete falls to 9, Review rises to 3, completed guides falls to 1. Its zero estimate remains an explicit zero.

```ts
window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-9').setValue('stage', 'Review')
```

### 7. Clear the view filter

All rows return. Neither counts nor remaining hours change.

```ts
window.univerAPI.getBase('ember-release-register').getTableById('changes').getViewById('changes-grid').setFilter(null)
```

### 8. Leave an estimate unknown

Native SUMIF excludes null: 13 hours remain. Unknown is not proof that no work remains.

```ts
window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-12').setValue('hours', null)
```

### 9. Record an explicit zero

The total is unchanged, but source storage is now 0, not null.

```ts
window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-12').setValue('hours', 0)
```

### 10. Restore the release baseline

Return to 9 complete, 2 review, 1 blocked, 12.5 remaining hours and 8 blocked hours.

```ts
const table = window.univerAPI.getBase('ember-release-register').getTableById('changes')
for (let i = 1; i <= 12; i++) {
  const record = table.getRecordById('change-' + i)
  record.setValue('stage', i <= 9 ? 'Complete' : i === 11 ? 'Blocked' : 'Review')
  record.setValue('hours', i <= 9 ? 0 : i === 10 ? 3 : i === 11 ? 8 : 1.5)
}
```

### 11. Complete every tracked item

Completion is 100%, but average remaining hours has no denominator: preserve native #DIV/0!. The prompt requests editorial sign-off, not automatic publication.

```ts
const table = window.univerAPI.getBase('ember-release-register').getTableById('changes')
for (let i = 1; i <= 12; i++) table.getRecordById('change-' + i).setValue('stage', 'Complete')
```

### 12. Recover from the empty unfinished queue

Restore the register; the error must clear without manual recalculation.

```ts
const table = window.univerAPI.getBase('ember-release-register').getTableById('changes')
for (let i = 1; i <= 12; i++) {
  const record = table.getRecordById('change-' + i)
  record.setValue('stage', i <= 9 ? 'Complete' : i === 11 ? 'Blocked' : 'Review')
  record.setValue('hours', i <= 9 ? 0 : i === 10 ? 3 : i === 11 ? 8 : 1.5)
}
```

### 13. Rename the Base display label

The document binds the original qualifier to a stable Base ID. Renaming the workspace must not detach it.

```ts
window.univerAPI.getBase('ember-release-register').setName('Ember / Release review')
```

### 14. Prove a post-rename update

Migration hours become 10: total remaining 14.5, blocked 10.

```ts
window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-11').setValue('hours', 10)
```

### 15. Make the source unavailable

Deliberately bind the document alias to a missing unit. Eleven native results become #VALUE!. COUNTA counts the returned error as one non-empty value and displays 1; that is not proof of one source record. Read the failures together, not that number in isolation. These are current native calculations, not cached successful totals.

```ts
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'ember-release-notes', qualifier: 'Ember Release', sourceUnitId: 'ember-unavailable-source', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 16. Repair the actual source binding

Restore the original stable Base ID. Current values return without re-inserting formulas or replacing prose.

```ts
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'ember-release-notes', qualifier: 'Ember Release', sourceUnitId: 'ember-release-register', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 17. Reject an invalid numeric value

Unlike a Sheet cell, this Base Number field rejects non-numeric text. The call returns false and the SDK logs an invalid-number error. Migration remains 10 hours and every result stays unchanged. Keep this rejection visible; do not substitute zero or claim an import succeeded.

```ts
const accepted = window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-11').setValue('hours', 'Unpriced')
console.log({ accepted, stored: window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-11').getValue('hours') })
```

### 18. Restore the numeric estimate

Migration hours become 8. Every baseline result returns.

```ts
window.univerAPI.getBase('ember-release-register').getTableById('changes').getRecordById('change-11').setValue('hours', 8)
```

### 19. Edit the authored review line

Select Release notes first. This changes prose, not Base records or formulas. Click inside the document to give keyboard shortcuts an editing target; selecting its Base navigation item alone does not focus document text. Explicit document undo/redo is a separate Facade path.

```ts
window.univerAPI.getDocument('ember-release-notes').getParagraphs()[2].setText('Editorial draft / Reviewed by Noor')
```

### 20. Inspect independent owners

These are local snapshots, not durable storage or an Exchange conversion. Read-only inspection should not change either model.

```ts
console.log({ base: window.univerAPI.getBase('ember-release-register').save(), doc: window.univerAPI.getDocument('ember-release-notes').save(), formulas: window.univerAPI.getDocument('ember-release-notes').getFormulas().map(formula => formula.getResult()) })
```

## Boundaries and acceptance

Native Base typing with exact serialized Undo/Redo passes. Native Doc content-click, typing and body Undo/Redo preserve the Base. Selecting the navigation item alone does not focus the document: keyboard Undo then leaves both owners unchanged. Explicit FDocument Undo/Redo restores authored content, formula IDs, expressions and formats; full Redo equality passes. Full Undo snapshot equality fails on native DOC_FORMULA_PLUGIN lastValue caches. Raw snapshots retain the strict comparison separately from authored-state checks; no cache is rewritten by the application.

The saved Gamma Budget Review cover informed title hierarchy and restrained contrast, not a release-notes template. All story, data and typography are original. No competitor artwork is redistributed. Modern continuous prose is separate from traditional paginated document cases.

Correct native error classification, both-language formula popup interaction, every native edit/menu path, different valid-source rebinding, complete snapshot reconstruction, supported frontend conversion, Next integration, responsive/accessibility and delivery/performance remain open. This case does not claim Doc Print or Exchange support merely because another product registers those plugins. No SDK patch, backend or publishing service. Local dependency links were version-checked, not freshly installed; trial notices and large-chunk warnings remain.
