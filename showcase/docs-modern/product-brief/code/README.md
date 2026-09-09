# Atlas / Offline Review Product Brief

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

An original product proposal, not an implementation of offline synchronization,
collaborative comments or attachment storage. Eight sections distinguish the
problem, intended outcome, targets, launch plan, open questions, pilot boundaries,
owners and evidence. The original five sections and decision text are preserved;
the extra sections give the review an explicit scope and exit criteria.

The document is the interface. Use its native Grid toolbar and direct text
editing; there is no Preview-only decision button, Reset or activity strip.
The exported entry and Preview call the same factory, with the official bundled
Docs Core CSS and complete English preset locales. Theme changes keep the owner and
its edits. Content remains English. Teal section headings complement the navy
title; the SDK workbench keeps its official styling.

## Literal examples

Run these blocks in order in the preview frame or standalone browser console.
They use the actual document Facade. No host-only action or copied editor exists.

### 1. Read the brief

The baseline has eighteen paragraphs: title, subtitle and eight heading/body
pairs. Reading these paragraphs does not mutate the proposal.

```ts
window.univerAPI.getDocument('atlas-offline-product-brief').getParagraphs().map((paragraph) => paragraph.getText())
```

### 2. Expand the pilot, not the target metrics

Only the pilot-boundaries paragraph changes from six to eight partners. The
95% open target and September-to-December plan stay unchanged.

```ts
const document = window.univerAPI.getDocument('atlas-offline-product-brief')
const pilot = document.getParagraphs().find((paragraph) => paragraph.getText().startsWith('Start with six design partners'))
if (!pilot) throw new Error('Run this example against the original pilot paragraph.')
pilot.setText(pilot.getText().replace('six design partners', 'eight design partners'))
```

### 3. Undo the paragraph edit

```ts
window.univerAPI.undo()
```

### 4. Redo the paragraph edit

```ts
window.univerAPI.redo()
```

### 5. Record the decision once

This guard reads the current document, not a hidden boolean. Repeat this same
block: the existing heading prevents a duplicate section. It does not repair a
manually deleted decision body or provide a transaction across both appends.

```ts
const document = window.univerAPI.getDocument('atlas-offline-product-brief')
if (!document.getParagraphs().some((paragraph) => paragraph.getText().trim() === 'Decision log')) {
  document.appendParagraph('Decision log').setStyle({ textStyle: { bl: 1, fs: 16, cl: { rgb: '#226C68' } } })
  document.appendParagraph('Approved for design-partner pilot with a 250 MB offline workspace limit. Owner: Maya Chen. Review date: 18 September 2026.').setStyle({ spaceBelow: { v: 14 }, textStyle: { fs: 11, cl: { rgb: '#475467' } } })
}
```

### 6. Revise the owner without rewriting the brief

The decision belongs to Imani Brooks; its storage limit, review date and all
preceding paragraphs remain the same.

```ts
const document = window.univerAPI.getDocument('atlas-offline-product-brief')
const decision = document.getParagraphs().find((paragraph) => paragraph.getText().startsWith('Approved for design-partner pilot'))
if (!decision) throw new Error('Record the decision first.')
decision.setText(decision.getText().replace('Maya Chen', 'Imani Brooks'))
```

### 7. Download the edited snapshot

The browser downloads editable JSON, not DOCX/PDF or an offline-sync package.
This does not save undo history or prove file-format conversion.

```ts
const snapshot = window.univerAPI.getDocument('atlas-offline-product-brief').save()
const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }))
const link = document.createElement('a')
link.href = url
link.download = 'atlas-product-brief.json'
link.click()
setTimeout(() => URL.revokeObjectURL(url), 1000)
```

### 8. Recreate the edited document

Save before disposing the unit. Reopen that same snapshot in the existing SDK
owner; this deliberately does not promise to preserve the undo stack or cursor.
It is not arbitrary-file validation or failure-safe replacement.

```ts
const api = window.univerAPI
const snapshot = api.getDocument('atlas-offline-product-brief').save()
api.disposeUnit(snapshot.id)
api.createDocument(snapshot)
```

## Acceptance boundary

Native runtime, literal snippets, actual painting, complete model history,
English packs, theme ownership and export parity require separate checks. A
successful Facade call alone is insufficient. Printing, binary conversion,
collaboration, full lifecycle failure recovery, keyboard-only accessibility and
delivery performance are not supplied by this core-only template.
