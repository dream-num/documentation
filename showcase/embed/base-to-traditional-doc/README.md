# Linen / Services schedule

Current language contract: the native UI, startup alerts and authored data are English under either host language. The legacy third locale argument remains accepted but is ignored. Complete English dependency packs, official CSS, native Grid menus and the distinct source/document story are preserved. Earlier bilingual evidence below is historical; this migration does not resolve its recorded SDK limitations.

Four original fictional service records drive twelve native inline formulas across
three A4 chapters. Included discovery 1200, facilitation 850 and handoff 450 total
2500; the optional clinic 300 is separate. The phases, fees and hours are independent
recorded inputs, not a generated invoice or legal agreement.

Base@Traditional Doc uses a real DocBlock on page two. The document reads Base
structured references directly, without a hidden Sheet or JavaScript totals.
The service count uses ROWS, not COUNTA: an unavailable reference must propagate
an error rather than count the error value as one nonempty service.
The layout takes a restrained editorial cue from the cached Typst Universe reference;
all prose, data and muted teal/brown/rose styling are original. No competitor artwork
is redistributed. Native Grid UI and official plugin CSS are included in the export.

## Fifteen literal examples

Run these in order inside the demo iframe or standalone page. Double-click the Base
block and use its native fullscreen control for editing. Return to page one and
page three to compare results. There is no refresh button or fixture panel.

### 1. Correct the facilitation fee

Included 2500 → 2650; delivery 850 → 1000. Optional stays 300.

```ts
window.univerAPI.getBase('linen-service-register').getTableById('services').getRecordById('service-2').setValue('fee', 1000)
```

### 2. Include the optional clinic

Four included lines total 2950 and 27 hours. Delivery is 1300; optional fees become zero.

```ts
window.univerAPI.getBase('linen-service-register').getTableById('services').getRecordById('service-4').setValue('status', 'Included')
```

### 3. Change context, not arithmetic

The scope note changes; all twelve formula results remain unchanged.

```ts
window.univerAPI.getBase('linen-service-register').getTableById('services').getRecordById('service-2').setValue('scope', 'Two accessible workshops with a quiet participation option.')
```

### 4. Show only delivery records

Two records are visible, but whole-table totals and phases do not change.

```ts
window.univerAPI.getBase('linen-service-register').getTableById('services').getViewById('services-grid').setFilter({
  conjunction: window.univerAPI.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'phase', operator: window.univerAPI.Enum.BaseFilterOperator.IS, operand: 'Delivery' }],
})
```

### 5. Correct a hidden discovery record

The hidden record changes 1200 → 1350. Included total becomes 3100; delivery stays 1300.

```ts
window.univerAPI.getBase('linen-service-register').getTableById('services').getRecordById('service-1').setValue('fee', 1350)
```

### 6. A missing handoff fee

Store null, not zero. SUMIF contributes zero; included total is 2650 and the included
line count remains four. A mean per included line is not a mean of known fees.

```ts
window.univerAPI.getBase('linen-service-register').getTableById('services').getRecordById('service-3').setValue('fee', null)
```

### 7. Explicitly record no handoff fee

The stored value becomes zero; the previous numeric totals stay unchanged.

```ts
window.univerAPI.getBase('linen-service-register').getTableById('services').getRecordById('service-3').setValue('fee', 0)
```

### 8. Zero fees expose a real share error

Included fees and mean become zero. Hours remain 27; delivery share exposes the native
division error instead of a fabricated percentage. Record statuses are not reset.

```ts
const table = window.univerAPI.getBase('linen-service-register').getTableById('services')
for (const id of ['service-1', 'service-2', 'service-3', 'service-4']) table.getRecordById(id).setValue('fee', 0)
```

### 9. Recover the starting fee scope

Included total 2500, optional 300, hours 24 and delivery share 34%. Edited notes and
the current view filter remain intact.

```ts
const table = window.univerAPI.getBase('linen-service-register').getTableById('services')
for (const [index, fee] of [1200, 850, 450, 300].entries()) table.getRecordById('service-' + (index + 1)).setValue('fee', fee)
table.getRecordById('service-4').setValue('status', 'Optional')
```

### 10. Restore the complete view

Four records are visible again; formulas remain unchanged.

```ts
window.univerAPI.getBase('linen-service-register').getTableById('services').getViewById('services-grid').setFilter(null)
```

### 11. Change effort independently of fees

Included hours 24 → 26. Fees, fee shares and line counts stay unchanged.

```ts
window.univerAPI.getBase('linen-service-register').getTableById('services').getRecordById('service-2').setValue('hours', 10)
```

### 12. Rename the Base without changing the formula qualifier

The Doc's explicit Linen Services binding still points to the same source ID.
Changing handoff fee 450 → 500 must produce 2550; a cached result is not enough.

```ts
const base = window.univerAPI.getBase('linen-service-register')
base.setName('Linen / Reviewed service register')
base.getTableById('services').getRecordById('service-3').setValue('fee', 500)
```

### 13. An unavailable source is not zero scope

The real Base remains present. Point the known qualifier to an unavailable ID and
inspect native errors in both chapters; do not replace them with zero values.

```ts
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'linen-services-schedule', qualifier: 'Linen Services', sourceUnitId: 'linen-unavailable-register', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 14. Repair the original source binding

Included fees return to 2550 and hours 26, with the same document body and formula ranges.

```ts
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'linen-services-schedule', qualifier: 'Linen Services', sourceUnitId: 'linen-service-register', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 15. Inspect a detached reading copy

The projected snapshot contains current display text. It does not replace the live
document or convert it to DOCX/PDF. Persist both native units separately for a
future reconstruction workflow; reading snapshots alone is not persistence.

```ts
const doc = window.univerAPI.getDocument('linen-services-schedule')
console.log({ live: doc.save(), readingCopy: doc.saveFormulaDisplayTextSnapshot(), source: window.univerAPI.getBase('linen-service-register').save() })
```

## Acceptance status

Remaining: native error classification, every menu/editor action, actual two-unit
reload, rebinding to another valid source, Print/Exchange conversion, Next
integration, responsive/accessibility and delivery-performance acceptance.
