# Saffron / Budget explanation

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

A native modern Doc Float lives inside the Sheet it reads. The budget and the
explanation remain separate owners. Twelve native inline formulas read the real
Sheet; no JavaScript totals, fake document cards or manual refresh button.

Original community-kitchen story / 25 September 2029 / illustrative USD amounts.
The saved Gamma budget-review reference informs the financial narrative and
contrast only. Navy, saffron and terracotta are original data/story styling;
no competitor artwork is redistributed. The host uses the native Grid ribbon.

## Run these examples in order

Wait for `.saffron-embed[data-ready="true"]`. Run the literal snippets through
the guide or `window.univerAPI`. Wait for native recalculation after each edit.
Changing a source must leave the complete authored document body unchanged.

### 1. Revise ingredients

Costs become $8,100 and headroom $1,100; income stays $9,200.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B10').setValue(3600)
```

### 2. Add ticket income

Income $9,700; costs stay $8,100, headroom $1,600.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B5').setValue(6700)
```

### 3. Protect a larger reserve

Reserve becomes $1,940; headroom after reserve is -$340. The prompt changes without changing income or costs.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B14').setValue(0.2)
```

### 4. Change the headcount

90 participants changes cost per person to $90. It does not create income or change ingredient spending.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B13').setValue(90)
```

### 5. No participants

Native division by zero must remain visible, not a fabricated zero cost per person.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B13').setValue(0)
```

### 6. Unknown ingredient amount

Clear the cell value through a native cell object. SUM excludes it, but that is not confirmation that ingredients are free. The Facade does not accept a bare null argument.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B10').setValue({ v: null })
```

### 7. Explicit zero

The same arithmetic now has a known zero in its source snapshot.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B10').setValue(0)
```

### 8. Unpriced ingredient estimate

SUM ignores pending while the direct ingredient formula shows the text. No manual fallback replaces native behavior.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B10').setValue('pending')
```

### 9. Restore the baseline

Restore all assumptions explicitly. Income $9,200, costs $7,600, reserve $920 and headroom after reserve $680.

```ts
const sheet = univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget')
sheet.getRange('B5:B6').setValues([[6200], [3000]])
sheet.getRange('B9:B11').setValues([[2400], [3100], [2100]])
sheet.getRange('B13:B14').setValues([[80], [0.1]])
```

### 10. No funding

Cost/funding exposes a native division error; costs are not cleared.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B5:B6').setValues([[0], [0]])
```

### 11. Restore funding

Repair the actual input; do not recreate the document.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B5:B6').setValues([[6200], [3000]])
```

### 12. Invalid reserve policy

Text is not a valid percentage. The native multiplication error must not become an approval signal.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B14').setValue('pending')
```

### 13. Restore the reserve

The linked results recover with the original document prose intact.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B14').setValue(0.1)
```

### 14. Rename and retain the binding

The source ID remains unchanged. Native Doc formulas retain the Saffron Budget qualifier after the workbook display name changes. Keep that actual formula alias bound; creating an unused alias would not change these formulas.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').setName('Saffron / Reviewed budget')
univerAPI.getFormula().upsertExternalReference({ unitId: 'saffron-budget-explanation', qualifier: 'Saffron Budget', sourceUnitId: 'saffron-kitchen-budget', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_SHEET })
```

### 15. Prove fresh calculation after rename

Kitchen hire becomes $2,600; spending $7,800 and headroom $1,400.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').getSheetBySheetId('budget').getRange('B9').setValue(2600)
```

### 16. Make the mapping unavailable

The host budget remains intact. The document must expose native reference errors rather than retain previous numeric results.

```ts
univerAPI.getFormula().upsertExternalReference({ unitId: 'saffron-budget-explanation', qualifier: 'Saffron Budget', sourceUnitId: 'saffron-unavailable-budget', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_SHEET })
```

### 17. Repair the original source mapping

Fresh results return without replacing the document.

```ts
univerAPI.getFormula().upsertExternalReference({ unitId: 'saffron-budget-explanation', qualifier: 'Saffron Budget', sourceUnitId: 'saffron-kitchen-budget', sourceUnitType: univerAPI.Enum.UniverInstanceType.UNIVER_SHEET })
```

### 18. Print the source workbook

Activate the real Sheet and open its registered frontend Print plugin. Inspect the actual preview; no print job is submitted. Complete embedded-Doc print fidelity is not claimed.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').setActiveSheet('budget')
univerAPI.executeCommand('sheet.operation.print-open')
```

### 19. Close Print

Return without submitting a print job.

```ts
univerAPI.getWorkbook('saffron-kitchen-budget').closePrintDialog()
```

### 20. Inspect both native owners

Saving two snapshots is not durable storage, file conversion or retained Undo history.

```ts
console.log({ source: univerAPI.getWorkbook('saffron-kitchen-budget').save(), document: univerAPI.getDocument('saffron-budget-explanation').save(), results: univerAPI.getDocument('saffron-budget-explanation').getFormulas().map(formula => formula.getResult()) })
```

### 21. Edit the explanation, not its source

Activate the native document Float, then edit its review line. This changes the Doc owner only; the Sheet assumptions and linked results remain intact.

```ts
univerAPI.getDocument('saffron-budget-explanation').getParagraphs()[2].setText('Budget explanation / Reviewed by Noor')
```

## Boundaries and acceptance

This is Doc@Sheet Float with Sheet → Doc calculation, not Doc@Sheet Tab or
Doc → Sheet write-back. Formula ranges are fixed authored cells. Null/text are
not measured zero even where SUM ignores them. Reserve coverage is a discussion
prompt, not spending approval. No collaboration, backend or external publishing.

Preview and standalone export share the same data/factory, official CSS and
complete English dependency packs. Theme changes preserve the owner. There is no
fixture toolbar or extra feature-description card. Native Formula UI is registered.

Partial runtime evidence is recorded at
test-results/embed-saffron-formula-authored-history/report.json. Twenty-one
literal examples cover twelve current-canvas results, complete-body preservation
through source edits, native Sheet typing/exact history, source-owned Print,
independent Doc review-line editing, fourteen complete EN/ZH packs and both model
theme preservation. Eleven-file source/CSS parity is checked separately at
test-results/saffron-formula-export-ui/report.json.

Strict acceptance remains FAIL. Twenty native error results display correctly
but report success/string. The Chinese formula dialog's Number format button
is intercepted by another child-popup layer; waiting for stable bounds does not
resolve it. In the tested Float activation/Doc Facade editing sequence, Ctrl+Z
targets the previous host Sheet edit, not the document. Do not assume keyboard
history ownership from which model a Facade call modified.

Explicit document history is assessed separately after restoring that exact
host edit with native Redo. Full Doc snapshot equality retains changed native
DOC_FORMULA_PLUGIN lastValue caches. Raw before/after states are kept; independent
authored-state comparisons do not convert this into complete state preservation.
The isolated basic Doc undo/redo probe at
test-results/saffron-history-isolated/report.json is not a complete sequence test.

An earlier test attempted to serialize the live FWorkbook returned by redo(),
causing test-process memory exhaustion. The test now executes that method without
returning its Facade over the browser bridge. This was not a demo or SDK patch.

Snapshot reconstruction, different valid sources, full Exchange/Print fidelity,
all native menus, Next integration, responsive/accessibility and performance
remain open. Do not count registration as complete acceptance.
