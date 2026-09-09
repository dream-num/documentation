# Kanban Cards and Columns

Six fictional instrument repairs occupy Intake, On bench and Play test. Ready for collection starts empty. Switch the native sidebar between **Compact cards**, **Labeled repair cards**, **Cover cards** and **Source records**. All four views share one table; changing a card's Status is a record edit, whereas card presentation belongs to each view.

Compact cards use the composed pill layout and show instrument and hours without field labels. Labeled repair cards use the normal stacked layout with labels and repair notes. In the installed SDK, field labels belong to the normal layout; composed pills do not show them even when the flag is set. Use native view settings and open a card's record detail to inspect the same values in the source Grid. There are no host-made cards, duplicate toolbar buttons or demo panels. At narrow widths, scroll the native canvas horizontally to inspect the fourth column.

## 1. Change one view's card presentation

```ts
const table = window.univerAPI.getBase('repair-kanban').getTableById('jobs')
if (!table.getViewById('compact').updateConfig({ cardLayout: 'normal', showFieldNames: true })) throw new Error('Card layout rejected')
```

Compact cards now use the normal stacked layout with labels. This does not rename the view or change its two visible fields. The second Kanban view retains its independent configuration.

## 2. Put the repair note before the instrument

```ts
const table = window.univerAPI.getBase('repair-kanban').getTableById('jobs')
if (!table.getViewById('detailed').updateConfig({
  card: { titleFieldId: 'job', fieldIds: ['note', 'instrument'] },
  fieldSettings: { note: { hidden: false, order: 0 }, instrument: { hidden: false, order: 1 }, hours: { hidden: true } },
})) throw new Error('Card fields rejected')
window.univerAPI.getBaseUI().activateView('detailed')
```

Hours are hidden in this card layout, not deleted from the records or source Grid. Hiding a field is not a permission boundary.

## 3. Rename and recolor the grouping option

```ts
const table = window.univerAPI.getBase('repair-kanban').getTableById('jobs')
const status = table.getFieldById('status')
const config = status.getConfig()
if (!status.setConfig({ ...config, options: config.options.map((option) =>
  option.id === 'bench' ? { ...option, name: 'Repair bench', color: '#287F87' } : option,
) })) throw new Error('Grouping option rejected')
window.univerAPI.getBaseUI().activateView('compact')
```

Select-field columns take their title and color from the grouping option. This updates the label/color in every view of the same table, while stored Status values remain `bench`. It is not a view-local rename: `columnSettings.bench.title/color` does not override the existing select option in this installed SDK.

## 4. Inspect the column-collapse limitation

```ts
const table = window.univerAPI.getBase('repair-kanban').getTableById('jobs')
const view = table.getViewById('compact')
if (!view.updateConfig({ columnSettings: {
  ...view.getConfig().columnSettings,
  ready: { collapsed: true },
} })) throw new Error('Column collapse rejected')
```

In the installed beta.2 runtime, this writes `collapsed: true` into the view configuration but does not change its native lane projection or visibly collapse the column. The actual group key is `ready`; a wrong option ID is not the cause. No record is removed. This is a reproducible limitation example, not a working collapse control. Set the value back to `false` to clear the stored flag; do not assume a native expand/collapse button exists.

## 5. Move a repair through its stored status

```ts
const table = window.univerAPI.getBase('repair-kanban').getTableById('jobs')
const job = table.getRecordById('job-5')
if (!job.setValue('status', 'ready')) throw new Error('Status update rejected')
if (job.getValue('status') !== 'ready') throw new Error('Status was not stored')
window.univerAPI.getBaseUI().activateView('source')
```

Clean trumpet valves changes from Play test to Ready for collection. Reopen a Kanban view to inspect the changed grouping. This demonstrates the public Facade, not mouse drag-and-drop. Reload the page for the original six records before repeating examples.

## 6. Hide covers without deleting attachments

```ts
const table = window.univerAPI.getBase('repair-kanban').getTableById('jobs')
if (!table.getViewById('covers').updateConfig({ coverFieldId: null,
  card: { titleFieldId: 'job', coverFieldId: null, fieldIds: ['instrument', 'hours'] },
})) throw new Error('Cover setting rejected')
window.univerAPI.getBaseUI().activateView('covers')
```

Cover cards initially uses original inline SVG violin and piano illustrations on two records; four records deliberately have no attachment. This recipe removes the cover presentation only. The attachments remain in Source records; restore both `coverFieldId` settings to `cover` to show them again. Actual image and missing-cover rendering must be verified in the native Kanban renderer.

## Export and boundaries

The independent export uses the same factory as the preview. Run `pnpm install`, then `pnpm dev`. All five English dependency locale packs and four official CSS imports are included. The native UI uses the Grid ribbon configuration and stays English on every documentation language route without mutating the host page language. Theme switches retain the current owner and edits. Native licensing notices remain visible.

This concise feature gallery compares text-only and native attachment-cover cards. The two SVG illustrations are original data URLs, not host CSS images or downloaded assets. No backend, upload, dependency changes, SDK patch, generated fixture panel or cross-demo import is required.
