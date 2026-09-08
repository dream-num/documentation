# Contact and Link Fields

Six fictional studios demonstrate native Link, Email and Phone fields, not Text fields styled to resemble contacts. Paper Harbor starts with a labeled website; Moss Letterpress stores a bare URL. Blue Kiln has no email, Copper Loom has email only, and Quiet Bindery starts with all three contact fields null.

Double-click a contact cell to edit it. The link editor separates display text from the destination URL; email and phone use their native contact editors. Edit the label without changing its destination or fill a missing address. The native editors provide contact-format feedback, not verification that an inbox, number or website exists.

All domains are example.com and all phone numbers use fictional 555-01xx numbers. Opening links or invoking email/phone actions is unnecessary for this demo; editing and reading stored values demonstrates the fields without leaving the page.

## Public Facade recipes

Run each block independently after the workbench loads.

```ts
const table = window.univerAPI.getBase('contact-link-fields').getTableById('contacts')
const record = table.getRecordById('contact-2')
if (!record.setValue('website', { text: 'Moss studio', url: 'https://example.com/moss' })) throw new Error('Link update rejected')
const link = record.getValue('website')
if (link.text !== 'Moss studio' || link.url !== 'https://example.com/moss') throw new Error('Link did not persist')
```

Fill a previously empty contact with two independent native fields:

```ts
const table = window.univerAPI.getBase('contact-link-fields').getTableById('contacts')
const record = table.getRecordById('contact-5')
if (!record.setValue('email', 'bindery@example.com')) throw new Error('Email update rejected')
if (!record.setValue('phone', '+1 (202) 555-0105')) throw new Error('Phone update rejected')
if (record.getValue('email') !== 'bindery@example.com' || record.getValue('phone') !== '+1 (202) 555-0105') throw new Error('Contact did not persist')
```

Replace the destination while retaining a readable label; the studio name and other fields remain unchanged:

```ts
const table = window.univerAPI.getBase('contact-link-fields').getTableById('contacts')
const record = table.getRecordById('contact-1')
if (!record.setValue('website', { text: 'Workshop catalog', url: 'https://example.com/paper/2027' })) throw new Error('Destination update rejected')
if (record.getValue('website').url !== 'https://example.com/paper/2027') throw new Error('Destination did not persist')
```

Link snapshots accept a URL string or a structured text/url value. The native editor may normalize a URL and store the structured form after editing; do not assume editing preserves the original representation. Null represents the explicitly missing values in this dataset. These links are external destinations, not relational RecordLink fields.

Current limitation: clearing an existing structured Link through setValue('website', null) returned true but retained its previous value in the installed SDK. Empty-string and empty text/url writes also retained it. Initial null cells therefore demonstrate missing data, not a verified clear operation. Check the saved value instead of relying only on the boolean return; this demo does not patch that behavior.

Preview and exported code share one factory, complete English locales, official CSS and Grid Ribbon configuration. No backend, contact lookup, custom link renderer or SDK changes are used.
