# Meridian / Follow the calculation chain

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

An original fictional print studio schedules two editions: Atlas, 40 copies,
and Fieldnotes, 60 copies. Base owns the records. A visible Sheet aggregates
scheduled quantities, applies the editable unit rate of 25 and totals 2,500.
Eleven inline Doc formulas, nine Formula Shapes across three slides, six Board
Formula Shapes and a native column chart read that Sheet calculation layer.

This is a two-hop dependency, not two parallel data sources:

Base records → Sheet quantities → Sheet amounts → Doc / Slides / Board / Chart.

Use the native Production model, Edition register, Review deck, Brief and
Production map tabs. The chart reads A9:D11, category field 0 and value field 3.
The outputs do not query Base directly. Source edits never replace authored prose
or card layouts. There are no JavaScript business totals or refresh buttons.

## Nine literal examples

Run in order. Activate Edition register for Base edits and Production model for
Sheet edits, using the native tabs. These are the actual public Facade calls
used by the runnable preview and standalone source.

### 1. Increase the second edition

With Edition register active, change Fieldnotes from 60 to 80. Production model
shows 120 copies and 3,000. Atlas stays 40 copies / 1,000; Fieldnotes becomes
80 copies / 2,000. Compare the native chart and all editorial outputs.

```ts
window.univerAPI.getBase('meridian-edition-register').getTableById('editions').getRecordById('edition-2').setValue('quantity', 80)
```

### 2. Change the calculation assumption

With Production model active, change B4 to 30. Quantities stay 40 and 80,
but amounts become 1,200 and 2,400: total 3,600, envelope left -100,
discussion signal Review scope. This tests the second input independently.

```ts
window.univerAPI.getWorkbook('meridian-production-model').getSheetBySheetId('production').getRange('B4').setValue(30)
```

### 3. Exclude an edition by business status

With Edition register active, place Atlas on hold. It remains a real Base
record, but the SUMIFS calculation excludes its quantity. One scheduled edition,
80 copies, 2,400 total and Fieldnotes share 100%. The first chart bar disappears.

```ts
window.univerAPI.getBase('meridian-edition-register').getTableById('editions').getRecordById('edition-1').setValue('status', 'On hold')
```

### 4. Editorial context does not change quantities

Keep Edition register active. All computed results should remain unchanged.

```ts
window.univerAPI.getBase('meridian-edition-register').getTableById('editions').getRecordById('edition-2').setValue('note', 'Include a page for observations of the winter shoreline.')
```

### 5. A missing quantity is not a stored zero

Keep Edition register active. The quantity is empty. SUMIFS now yields zero
scheduled copies and zero amount; the scheduled edition count is still one.
The quantity share displays the native division-by-zero error. Do not replace
this unknown share with zero or a made-up percentage.

```ts
window.univerAPI.getBase('meridian-edition-register').getTableById('editions').getRecordById('edition-2').setValue('quantity', null)
```

### 6. Restore scheduled production

Keep Edition register active. Restore both editions: 120 copies at the revised
rate of 30 gives 3,600 again. The editorial note from example 4 remains.

```ts
const table = window.univerAPI.getBase('meridian-edition-register').getTableById('editions')
table.getRecordById('edition-2').setValue('quantity', 80)
table.getRecordById('edition-1').setValue('status', 'Scheduled')
```

### 7. Zero rate, unchanged quantities

With Production model active, a zero rate gives zero amounts in both chart
categories and 3,500 envelope left. Quantities stay 120 and Fieldnotes share
stays two thirds. Zero price is different from missing quantities.

```ts
window.univerAPI.getWorkbook('meridian-production-model').getSheetBySheetId('production').getRange('B4').setValue(0)
```

### 8. Recover the rate

Keep Production model active. At 25, the total returns to 3,000, leaving 500.
The edited quantity and editorial context remain intact.

```ts
window.univerAPI.getWorkbook('meridian-production-model').getSheetBySheetId('production').getRange('B4').setValue(25)
```

### 9. Inspect the five editable native units

These snapshots retain source identities, formulas and authored layouts. This
reads snapshots only; it is not a claim of save/reload or file conversion.

```ts
const api = window.univerAPI
console.log({
  base: api.getBase('meridian-edition-register').save(),
  sheet: api.getWorkbook('meridian-production-model').save(),
  doc: api.getDocument('meridian-production-note').save(),
  slides: api.getPresentation('meridian-studio-review').save(),
  board: api.getBoard('meridian-production-map').save(),
})
```

## Native implementation

The root Sheet owns four native SheetTab embeds. An explicit stable source-ID
mapping resolves Meridian Editions in the Sheet; each editorial output maps
Meridian Model to that Sheet. The initial calculation is awaited during startup;
subsequent edits use the SDK dependency engine without manual recalculation.

The overview uses deep teal and amber, the edition comparison uses warm cream,
blue and rose, and the decision slide uses plum. The native editor remains
white in light mode. Preview and standalone share one factory, Grid ribbon,
English plugin locales and explicit official CSS imports.

## Acceptance status

Remaining: source rename/missing/rebinding, actual five-unit save/reload, full
native menu and editor actions, error classification, theme/Next integration,
responsive/accessibility and performance. No backend, approval, collaboration,
Exchange conversion or Print capability is claimed here.
