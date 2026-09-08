# Repair studio / Month, week and day

Seven fictional appointments share a native Base. Six have start/end times; one radio assessment awaits scheduling. September 8, 2026 contains a 09:00 lamp diagnosis, an overlapping 10:00 chair consultation and a 14:00 textile workshop. A glaze-curing interval runs from September 7 at 15:00 through September 9 at 10:00.

Use the native Month schedule, Week schedule and Day schedule tabs to compare a month overview, timed week and focused day. Source grid preserves all seven records, including the undated request. Month and Week request colors from Session type; Day uses fixed blue and the supported short slot setting, which shows hourly ticks and keeps several appointments in view. Native rendering determines how intervals and fields fit.

All three calendar anchors start at September 8 using the installed exported IBaseUIStateService.setCalendarAnchorDate(). Initial date is UI state, not an invented Calendar config property. Navigation remains native; Today uses the actual browser date. The factory never resets the anchor after interaction.

## Literal public Facade examples

Run these in order in the preview frame or standalone console. They verify distinct model/configuration operations; native clicks, dragging and canvas paint require separate evidence.

Zoom the Day schedule from hourly ticks to the medium setting's half-hour ticks:

```ts
window.univerAPI.getBase('repair-studio-calendar').getTableById('appointments').getViewById('day').updateConfig({ timeslotSize: 'medium' })
```

Restore the compact hourly setting and use Session type colors:

```ts
window.univerAPI.getBase('repair-studio-calendar').getTableById('appointments').getViewById('day').updateConfig({ timeslotSize: 'short', displayColor: { type: 'selectField', fieldId: 'kind' } })
```

Extend the lamp diagnosis by thirty minutes. The stored start is unchanged:

```ts
const lamp = window.univerAPI.getBase('repair-studio-calendar').getTableById('appointments').getRecordById('appointment-1')
lamp.setValue('end', lamp.getValue('end') + 30 / (24 * 60))
```

Update the chair consultation's category without changing its dates:

```ts
window.univerAPI.getBase('repair-studio-calendar').getTableById('appointments').getRecordById('appointment-2').setValue('kind', 'Repair')
```

Change the preparation note, then inspect Source grid and Day schedule through their native tabs:

```ts
window.univerAPI.getBase('repair-studio-calendar').getTableById('appointments').getRecordById('appointment-3').setValue('note', 'Bring a clean cotton garment for patch practice.')
```

Inspect the native calendar projection; the undated request must not be counted as a dated event:

```ts
console.log(window.univerAPI.getBase('repair-studio-calendar').getTableById('appointments').getViewById('month').getProjection())
```

## Dates and current limits

Source dates are authored with local Date components and converted using the public dateToExcelSerial() function; fields display date plus 24-hour time. Calendar requests timeZone: 'local'. No manually shifted UTC timestamps or replacement labels compensate for SDK date behavior.

Selected native verification runs all four views in English and Chinese host pages under Asia/Shanghai and UTC. The short Day default renders 52 pixels per hour, compared with 832 for the previous long setting; the morning overlap and afternoon workshop fit together in the reviewed desktop screenshot. Exact local source times, dated/undated projection membership, six literal recipes and the same Base owner/full snapshot through themes pass. Evidence: test-results/base-calendar-compact/report.json. This is partial acceptance, not a complete Calendar certification.

The strict run still fails because September 8, 2026 appears under Monday in Month view, and UTC displays a GMT+08 timezone caption despite correct local source values and timed-event positions. Both failures remain asserted, with screenshots, in scripts/test-base-calendar-views.mjs. No data shifts, replacement labels or hidden navigation corrections are used. The earlier August-31 month-navigation issue remains a separate unverified boundary. Native record editing/dragging, event-field visibility and detailed color interactions still need their own evidence.

The independent preview and standalone entry share one factory with the five English locale packs for Design, UI, Docs UI, Bases and Bases UI, and four official CSS imports. Data, native UI, alerts and these recipes stay English regardless of host language. Grid ribbon and the native sidebar are the only controls; no host calendar or date-navigation panel is added. No SDK/dependency patch, remote scheduling service or persistence is provided. Reload restores the authored data. SDK license notices remain visible.
