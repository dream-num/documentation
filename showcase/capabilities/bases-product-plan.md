# Bases: Views, Tables and Dashboards

User scope: show the distinctive capabilities of every view, as well as Tables and Dashboard. Feature galleries stay concise; only the integrated business story needs rich content. This supplements the capability ledger, not an assertion of completion.

Latest language requirement: demo data, native SDK UI, alerts and README instructions are English only, independent of the documentation site's navigation language. Earlier EN/ZH-switching evidence is historical, not acceptance of this new requirement. Preserve complete English plugin locale packs and official CSS in every export.

## Installed baseline

The current `1.0.0-beta.2` `BaseViewType` exports Grid, Kanban, Calendar, Gantt and Gallery. A Base table is the data container shared by its views; “Table view” means Grid, not a sixth enum. A record-creation dialog is not a Form view. Config declarations alone are not runtime acceptance.

| Area | Required visual differences and interactions | Current starting point | Next work |
| --- | --- | --- | --- |
| Table entities | Multiple named tables; primary field; field types; independent records; multiple views sharing one table; relationships and calculated summaries only where supported | `bases/create-base-and-tables`, schema/record feature demos | Verify multi-table ownership, table navigation and same-table cross-view edits; add relationship examples after checking installed Facades |
| Grid / Table view | Field order, visibility and widths; row heights; frozen fields; sorting, filtering, grouping and conditional colors; actual typed editing | `bases/view-field-layout`, `filter-builder`, `multi-field-sort`, `group-records`, `date-time-formats` | Native horizontal-scroll/frozen-field verification; cross-view config independence; visible empty/boundary states |
| Kanban | Group field; column title/color/collapse; card title, cover, visible fields and labels; card layouts; moving a card and verifying its grouping value | `bases/kanban-cards-and-columns`: six instrument repairs, compact/labeled/cover variants, two original covers and an empty status column; real drag writes back only the moved record's Status | Collapse stores config but leaves native projected lanes unchanged; keep strict failure. Complete record-detail editing, other grouping fields, accessibility and save/reload |
| Calendar | Month/week/day; start/end fields; multi-day events; time slots; title/field visibility; fixed or select-field color; native editing and navigation | `bases/calendar-month-week-day`: seven appointments, timed overlaps, multi-day interval and undated record; Day short slots show 52 px/hour. Four host/timezone runs verify actual clock positions and shared data | Month weekday alignment and UTC timezone caption fail in installed SDK. Native editing/dragging, navigation boundaries, field visibility and detailed color interactions remain open; no SDK patch or shifted fixture dates |
| Gantt | Week/month/quarter/year scales; start/end intervals; progress; dependencies; left-pane fields and collapse; today/weekend display; working weekdays and exceptions; date/progress interaction where supported | `bases/gantt-timeline-and-working-days`: eight tasks, native scale/view switching and five literal recipes; native progress drag updates only progress and paints 19% in the left pane | Strict move/resize failures retain changed duration/unexpected start; selected timeline bar painting after progress is not accepted. Complete working-day shading/counts, dependencies and full post-edit rendering. Do not infer pointer acceptance from Facade writes |
| Gallery | Small/medium/large cards; title and field order; field labels; attachment covers and missing-cover states; card details and editing | `bases/gallery-covers-and-card-layout`: six material samples, three sizes/layouts and source Grid; five native SVG covers plus missing cover visually reviewed; native detail note editing paints in Grid/Large cards and survives reopening/themes | Arbitrary field ordering and cover-field switching, post-removal cover pixels, other native editors, empty/error/save-reload and accessibility remain open |
| Dashboard | Native dashboards, data-backed charts, filters, text/images, formula shapes and pivot/table views where the installed plugin supports them | Not available in installed packages | Preserve this requirement; obtain compatible published packages before implementation. Do not substitute host summary cards or a Grid view |

## Dashboard boundary

Newer local SDK source contains `@univerjs-pro/bases-dashboard` and `bases-dashboard-ui`, with dashboard/pivot Facades and UI extensions. The installed packages do not expose these capabilities or their required Bases UI extension entry. Source availability is not proof that the current demos can run them. Do not copy SDK source into documentation, modify SDK packages, silently upgrade the dependency set or mark Dashboard complete.

## Acceptance for each view

`bases/view-lifecycle` adds three Grid projections of six original repair-library
records. Native rename, duplicate, confirmed delete and Add Grid pass on both
hosts, as do four literal create/activate/rename/copy/delete recipes. A real edit
in All items visibly repaints Dispatch and Scratch with other records unchanged.
Field visibility and row-height configuration remain view-local. Exact export
with complete English packs/CSS passes. Native projection-copy strict equality
still fails for empty filter null becoming undefined; the report keeps this
separate from the ten passing interaction gates per host. Evidence:
`test-results/base-view-lifecycle/final/report.json`. Nonempty filter/sort/group
copying, last-view deletion, other view types, actual Preview lifecycle and
reconstruction remain open; this does not implement Dashboard or locked views.

The concise field gallery `bases/linked-record-picker` now has six
equipment requests and five equipment records across two small tables. Compare
single and multiple links, display labels plus picker context, empty links and
target renaming. The installed `IRecordLinkFieldConfig` exposes `targetTableId`,
`multiple`, `displayFieldId` and `pickerFieldIds`; public record Facades expose
`getLinkedRecordIds`, `setLinkedRecordIds`, `addLinkedRecord` and
`removeLinkedRecord`. Existing `create-base-and-tables` seeds a single Related
project link, but does not establish native multi-selection/picker acceptance.
The selected export passes exact nine-file source, full English packs and official
CSS checks. Native single replacement, multiple selection/removal and target rename
with stable IDs pass on both hosts, as do all five literal README recipes. The
native report is 22/26: focused Delete does not clear the single link and the
inspected context menu has no Clear content item. These paths remain unaccepted;
successful Facade clearing is not a native-clear workaround. Main reviewed the
actual contextual picker screenshot used in the directory. Evidence is in
`test-results/base-linked-record-picker/final/report.json` and
`test-results/linked-record-picker-export-ui/final/report.json`.
Same-owner full saved model retention and same-ID reconstruction pass. The actual
Preview additionally passes development StrictMode, storage/provider themes with
the complete edited owner/model, unmount and fresh remount in both browser locales
in `test-results/validation-link-previews/final/report.json`. Native Undo/Redo,
missing targets and reciprocal links remain
open. Current installed field types/declarations do
not expose dedicated Lookup/Rollup fields or Facades; do not relabel a Formula
field or a host summary as either capability.

1. Put every runnable case in the localized directory and include the full independent source plus official CSS and plugin locale packs.
2. Show the distinguishing layouts with native SDK rendering; keep labels, data and README recipes consistent with the visible result.
3. Exercise native view switching and editing. Record Facade operations separately from pointer/keyboard interactions.
4. Verify a view-only configuration change does not alter records; verify a data edit appears consistently in other views of the same table.
5. Keep edits and the actual Base model owner across themes; distinguish save/reload, failures and unsupported SDK behavior from an accepted path.
6. Build only selected cases. Maintain screenshots and reports, and keep this plan's incomplete items visible until they have corresponding evidence.

## Source evidence

- Installed `@univerjs/core/lib/types/bases/typedef.d.ts`: `BaseViewType`, `IGridViewConfig`, `IKanbanViewConfig`, `ICalendarViewConfig`, `IGanttViewConfig`, `IGalleryViewConfig`.
- Installed `@univerjs-pro/bases` Facades: tables, records and view configuration.
- Installed `@univerjs-pro/bases-ui/lib/types/facade/f-base-ui.d.ts`: native table/view activation.
- Local SDK `packages/bases-dashboard` and `packages/bases-dashboard-ui`: future Dashboard product direction only, not installed-runtime evidence.
