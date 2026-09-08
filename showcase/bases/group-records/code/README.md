# Native record grouping

Native UI and authored data are English-only, including on Chinese documentation pages. Legacy locale arguments are ignored; saved-snapshot argument positions are unchanged. Bilingual runtime reports below describe earlier revisions, not acceptance of this English-only revision.

Use the native sidebar to compare seven independent views over 16 shared records.
The factory initializes grouping with public `view.setGroup(rules)`; the native
group menu and disclosure arrows own all subsequent interaction. Native cell
edits update the shared table. There are no host aggregates or control panels.

```ts
import { BaseSortDirection } from '@univerjs/core'

const table = base.getTableById('returns')!
table.getViewById('nested')!.setGroup([
  { fieldId: 'status', direction: BaseSortDirection.ASC },
  { fieldId: 'owner', direction: BaseSortDirection.ASC },
])
```

For standalone code, import BaseSortDirection from @univerjs/core as data.ts does.
The exported factory includes complete English SDK locale packs and official CSS. The site
preview changes the theme on the existing owner, preserving edited snapshots.

## SDK boundaries

- An unused Archived option is intentionally retained. The current SDK does not
  synthesize its zero-record group even with hideEmptyGroup=false. The two flag
  views demonstrate stored configuration, not a working visual distinction.
- A blank-value bucket contains actual records and is not a zero-record group.
- Null numeric cells may paint as 0.00; the source distinguishes null and zero.
- Collapse is transient native UI state, not snapshot record deletion.

The former 90-record host-panel interaction test is historical, not applicable
to this native gallery. The separate SDK empty-group regression remains strict.
