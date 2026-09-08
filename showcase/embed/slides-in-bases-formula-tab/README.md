# Indigo / Portfolio presentation

This demo now uses English SDK UI on both English and Chinese host pages. The legacy locale argument remains in its original position but is ignored; saved-state arguments, formulas and authored data are unchanged. Complete English packs cover the registered UI and its formula-editor dependencies, with official CSS included in the independent export. Earlier bilingual evidence below is historical; existing native interaction failures remain open.

The Base is **both host and data source**. A native Slides tab inside its table
list presents twelve Formula Shapes on three authored pages. This is Slides@Base
Tab with Base -> Slides calculation, the reverse placement of Violet Base@Slide.
No hidden Sheet, iframe, JavaScript aggregation or manual refresh is involved.

Three fictional community programmes start at USD 15,000, 22,000 and 8,000: total
45,000, mean 15,000 and largest-project share 48.89%. The review prompt uses an
illustrative 50% threshold; it is not a policy, approval or payment instruction.
The project labels and narrative are authored, while numeric values and the IF
prompt are live. Cards are native Formula Shapes, not charts or scaled bars.

## Fourteen literal examples

Run in order in the demo iframe or standalone preview. Open Project register to
edit the source, then Portfolio review to inspect all three native pages. Double-
click an Allocation cell to type directly. No extra action panel is required.

### 1. Extend the evening programme

Total becomes 47,000. The largest project is still 22,000, but its share is now
46.81%. The third project grows to 21.28% of the portfolio.

```ts
window.univerAPI.getBase('indigo-community-portfolio').getTableById('projects').getRecordById('project-3').setValue('allocation', 10000)
```

### 2. A concentrated allocation

Repair commons becomes 30,000 of 55,000 (54.55%). The native IF prompt changes to
Review concentration; no fixed label in the presentation is rewritten.

```ts
window.univerAPI.getBase('indigo-community-portfolio').getTableById('projects').getRecordById('project-2').setValue('allocation', 30000)
```

### 3. Context is not an amount

Record a reason without changing any calculated output.

```ts
window.univerAPI.getBase('indigo-community-portfolio').getTableById('projects').getRecordById('project-2').setValue('note', 'Extend shared bench access to a second evening.')
```

### 4. Filter the working view

Only the two Making projects remain visible. All three still contribute to
whole-table formulas. A filter is not deletion or a formula scope change.

```ts
window.univerAPI.getBase('indigo-community-portfolio').getTableById('projects').getViewById('projects-grid').setFilter({
  conjunction: window.univerAPI.Enum.BaseFilterConjunction.AND,
  conditions: [{ fieldId: 'programme', operator: window.univerAPI.Enum.BaseFilterOperator.IS, operand: 'Making' }],
})
```

### 5. Edit the hidden library record

Total becomes 58,000; the largest-project share falls to 51.72% but remains above
the illustrative threshold. The filtered view still shows two records.

```ts
window.univerAPI.getBase('indigo-community-portfolio').getTableById('projects').getRecordById('project-1').setValue('allocation', 18000)
```

### 6. An unknown allocation

The third allocation is genuinely null. SUM ignores it, so total becomes 48,000
and largest share 62.50%. The project count stays three: mean per project is not
the mean of known amounts. The third allocation card shows the SUMIF result zero.

```ts
window.univerAPI.getBase('indigo-community-portfolio').getTableById('projects').getRecordById('project-3').setValue('allocation', null)
```

### 7. A known zero allocation

Aggregates match example 6; the stored source value is now zero rather than null.

```ts
window.univerAPI.getBase('indigo-community-portfolio').getTableById('projects').getRecordById('project-3').setValue('allocation', 0)
```

### 8. Zero denominator is not zero percent

Amounts and mean are zero. Shares and the review prompt must propagate a native
division error, not falsely claim that no project exceeds half.

```ts
const table = window.univerAPI.getBase('indigo-community-portfolio').getTableById('projects')
for (let i = 1; i <= 3; i++) table.getRecordById('project-' + i).setValue('allocation', 0)
```

### 9. Recover the baseline amounts

This restores numbers only, retaining the context edit and working-view filter.

```ts
const table = window.univerAPI.getBase('indigo-community-portfolio').getTableById('projects')
for (const [i, amount] of [[1,15000],[2,22000],[3,8000]]) table.getRecordById('project-' + i).setValue('allocation', amount)
```

### 10. Reveal every project

```ts
window.univerAPI.getBase('indigo-community-portfolio').getTableById('projects').getViewById('projects-grid').setFilter(null)
```

### 11. Rename the source and prove fresh calculation

The stable unit ID and Projects formula name remain unchanged. A new write to
the third allocation returns 47,000, proving more than a cached pre-rename result.

```ts
const base = window.univerAPI.getBase('indigo-community-portfolio')
base.setName('Indigo / Reviewed community portfolio')
base.getTableById('projects').getRecordById('project-3').setValue('allocation', 10000)
```

### 12. Point to an unavailable source

The real Base remains intact. The presentation's qualifier now points to a missing
ID. Inspect native error results instead of substituting cached or zero values.

```ts
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'indigo-allocation-review', qualifier: 'Indigo Portfolio', sourceUnitId: 'indigo-unavailable-portfolio', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 13. Repair the original source binding

```ts
window.univerAPI.getFormula().upsertExternalReference({ unitId: 'indigo-allocation-review', qualifier: 'Indigo Portfolio', sourceUnitId: 'indigo-community-portfolio', sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE })
```

### 14. Inspect both native snapshots

The host and child need to be persisted together; the Base snapshot contains an
embed reference, not the whole presentation. Reading them alone does not test
recovery. Use the reconstruction example below to restore a serialized pair.
Neither example performs PPTX or PDF conversion.

```ts
console.log({ source: window.univerAPI.getBase('indigo-community-portfolio').save(), presentation: window.univerAPI.getPresentation('indigo-allocation-review').save() })
```

## Save both units and reconstruct the owner

In the entry module, use `let demo = createDemo(container)` instead of `const demo`.
This uses the same imported factory and mount container; it needs no backend or
extra action panel. Keep both native snapshots together with their original IDs.

```js
const saved = JSON.parse(JSON.stringify({
  host: demo.univerAPI.getBase('indigo-community-portfolio').save(),
  presentation: demo.univerAPI.getPresentation('indigo-allocation-review').save(),
}))
const locale = demo.univerAPI.getCurrentLocale()
const darkMode = demo.univerAPI.isDarkMode()
demo.dispose()
demo = createDemo(container, darkMode, locale, saved)
```

The factory loads the saved native embed resource and both saved units. Only a
new, unsaved demo receives the initial Formula Shapes and reference bindings.
Recovery must retain changed formulas, number formats, notes, backgrounds and
deleted content. An unavailable source mapping must stay unavailable until
explicitly repaired. This is native snapshot reconstruction, not arbitrary file
import, durable storage, PPTX conversion or restoration of an open editor dialog.

Native embed activation opens the persisted `displayTarget.pageId`, which may
differ from the last page visited inside the child editor. To change that opening
page, use `getEmbed({ hostUnitId: 'indigo-community-portfolio', embedId:
'indigo-portfolio' }).setDisplayTarget({ pageId: 'concentration' })` on the Facade.
Activation also advances the embed resource's `updatedAt` timestamp. These are
navigation metadata, not changes to records or authored slide content.

## Implementation and visual reference

The factory reuses the SDK local Base Tab prepare/materialize/restore sequence:
BasesTableListBlock, not a custom navigation widget. This setup uses internal
SDK services as in the existing local example; it is not advertised as a public
Facade method. User examples use actual Facade methods. Formula bindings point
from each child presentation Shape to the stable host Base ID.

The Base remains the root unit. Its renderer is marked non-main when created,
because the native Base workbench owns that canvas. The generic single-canvas
focus switcher must not remount it over the embedded presentation. This is SDK
render-service configuration, not a public Facade method or a unit creation
embeddedRender option; the latter would remove the root Base navigation.
The same scoped rule excludes native thumbnails: restored embeds may create them
before the generic workbench starts. A thumbnail canvas is not an activatable
main render, and must remain inside its thumbnail container.

Preview and standalone share one factory, Grid configuration, all nine required
official CSS imports and complete English packs for the registered dependency UIs.
The cached Gamma Budget Review cover informs editorial hierarchy only. Original
navy/cyan, warm-paper/indigo and teal/apricot pages adapt the supplied Deep Ocean
palette. No competitor artwork is redistributed.

## Acceptance status

Native Base typing 22000 -> 24000 and exact full-Base Undo/Redo pass, with all three
result pages updated. Nine complete EN/ZH dependency packs and complete Base/Slides
snapshots are preserved through theme changes, with the same API owner.

Earlier test attempts are retained: a cached-canvas resize did not repaint numeric
glyphs, a right-aligned text anchor put the click at the next field boundary, and
a fresh source load has different generated Formula Shape paragraph IDs. The
corrected native test uses an inside-cell click and compares the complete model
against the same owner's baseline. Reload is only a diagnostic fallback on a
failed return-navigation gate, not part of the passing continuous flow and never
evidence of saved-state recovery.

Earlier roundtrip attempts are retained. The current-canvas report exposed native
thumbnail renders being offered to the generic workbench before Steady, causing
`activate is not a function`. Excluding thumbnails from main-canvas ownership
fixes this setup issue without changing SDK packages. The first strict snapshot
comparison also recorded the SDK's activation timestamp and persisted target
selection; it did not lose authored content. The test now checks those exact
metadata transitions instead of ignoring resources or page data.

Remaining: durable storage and arbitrary import are not implemented by this
native snapshot example;
all native menus, valid-source rebinding, printing/Exchange, responsive/accessibility,
Next integration and delivery performance.
