# Atlas / Native links and SDK bookmarks

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

The original tool-library brief keeps its three links, Returns desk bookmark,
handoff heading, lists, caution, code and quotation. Edit text and links using
the native Grid and link popup. The only host button opens the link at the
current native selection. It validates credential-free absolute HTTP(S), or
resolves a #bookmark= URL against live SDK custom ranges and scrolls there.
The native popup is separate: beta.2 opens URLs directly and does not route
bookmarks inside the current document. Host validation does not certify that
native popup's URL security. Tests intercept remote navigation.

Run these snippets in order after the editor paints. `demo` is the object
returned by createDemo; imports belong at the top of your application module.
No private property of the Facade is accessed. Bookmark mutations use the
exported Docs factories with the Univer injector, because there is no bookmark
Facade method in this SDK.

## Read and select the original manual

```ts
const { univer, univerAPI } = demo
const doc = univerAPI.getActiveDocument()!
const manual = doc.save().body!.customRanges!.find((range) => range.rangeId === 'atlas-manual')!
doc.setSelection(manual.startIndex, manual.endIndex + 1)
```

## Update its text and URL

```ts
const updated = await univerAPI.executeCommand('docs.command.update-hyper-link', {
  unitId: doc.getId(), linkId: manual.rangeId, segmentId: '',
  payload: 'https://example.org/atlas/repair?edition=3#inventory', label: 'Repair-kit guide — edition 3',
})
if (!updated) throw new Error('SDK did not update the manual link')
```

## Remove the link, keeping its text

```ts
if (!await univerAPI.executeCommand('docs.command.delete-hyper-link', {
  unitId: doc.getId(), linkId: manual.rangeId, segmentId: '',
})) throw new Error('SDK did not remove the link')
```

## Link the current manual paragraph again

```ts
const reference = doc.getParagraphs().find((p) => p.getText().startsWith('Workshop reference: '))!
const range = reference.getRange()
doc.setSelection(range.startOffset + 'Workshop reference: '.length, range.endOffset)
if (!await univerAPI.executeCommand('docs.command.add-hyper-link', {
  unitId: doc.getId(), payload: 'https://example.org/atlas/repair?edition=3#inventory',
})) throw new Error('SDK did not add the link')
```

The SDK allocates the new hyperlink range ID; do not overwrite it to match the
old ID. Rediscover the current range from the live paragraph after edits.

## Add the distinct handoff bookmark once

```ts
import { CustomRangeType } from '@univerjs/core'
import { addCustomRangeBySelectionFactory } from '@univerjs/docs'
const injector = univer.__getInjector()
if (!doc.save().body!.customRanges!.some((r) => r.rangeId === 'atlas-handoff')) {
  const heading = doc.getParagraphs().find((p) => p.getText().includes('06 · Volunteer handoff'))!
  const mutation = addCustomRangeBySelectionFactory(injector, {
    unitId: doc.getId(), rangeId: 'atlas-handoff', rangeType: CustomRangeType.BOOKMARK,
    properties: { name: '06 · Volunteer handoff' },
    selections: [{ ...heading.getRange(), collapsed: false, segmentId: '' }],
  })
  if (!mutation || !univerAPI.syncExecuteCommand(mutation.id, mutation.params)) throw new Error('Bookmark insertion failed')
}
```

## Point the summary at the live bookmark and open it through the host

```ts
const summary = doc.save().body!.customRanges!.find((r) => r.rangeId === 'atlas-summary')!
doc.setSelection(summary.startIndex, summary.endIndex + 1)
if (!await univerAPI.executeCommand('docs.command.update-hyper-link', {
  unitId: doc.getId(), linkId: summary.rangeId, segmentId: '',
  payload: '#bookmark=atlas-handoff', label: 'Return a borrowed kit',
})) throw new Error('Summary update failed')
demo.navigate('#bookmark=atlas-handoff')
```

## Move content; navigate without caching offsets

```ts
if (!doc.insertText(0, 'Volunteer note: follow the same named destination after this insertion.\r')) throw new Error('Insertion failed')
demo.navigate('#bookmark=atlas-handoff')
```

## Remove the bookmark; preserve the heading and reject a dangling link

```ts
import { deleteCustomRangeFactory } from '@univerjs/docs'
const deletion = deleteCustomRangeFactory(injector, { unitId: doc.getId(), rangeId: 'atlas-handoff' })
if (!deletion || !univerAPI.syncExecuteCommand(deletion.id, deletion.params)) throw new Error('Bookmark removal failed')
let rejected = false
try { demo.navigate('#bookmark=atlas-handoff') } catch { rejected = true }
if (!rejected) throw new Error('Expected a missing-bookmark error')
```

## Save and restore the same ID

```ts
const snapshot = structuredClone(doc.save())
univerAPI.disposeUnit(snapshot.id)
univerAPI.createDocument(snapshot)
```

The original owner can keep serving the newly created unit: host navigation
queries the active document each time. A new owner can instead receive the saved
snapshot as createDemo(container, darkMode, snapshot). No generation IDs or
snapshot normalization are used. Empty documents are supported with the original
ID and a valid terminal CR/LF body. This is JSON recovery, not binary conversion.

Both preset stylesheets and all four block UI stylesheets are included in the
shared Preview/export factory. Six complete English packs are loaded initially;
theme changes preserve the same owner. Fit-width zoom is a real SDK view setting
and may change the saved zoom on resize. Native acceptance and strict known
failures are recorded by scripts/test-atlas-links-native.mjs; old host-panel
tests are historical and do not certify this UI.
