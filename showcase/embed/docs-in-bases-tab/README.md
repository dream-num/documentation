# Fern / An editorial playbook inside a Base

Fern is a fictional neighborhood journal. Eight assignments span features,
guides, interviews and a photo essay across three linked issues: Everyday
Water, After Hours and Repair Culture. Writers, word targets, draft stages
and next checks vary by story. Issue dates are illustrative, not scheduled jobs.

Open **Editorial playbook** in the native Base table list. A complete modern
Docs editor explains audience, story scope, evidence, voice, review and handoff.
It is not a floating card, iframe, screenshot or traditional paginated document.
The white native editor uses forest-green headings, warm rust for the review
caution and muted editorial metadata. No fixture or duplicate toolbar is added.

## Code that matches the preview

Change the document headline without changing the assignment records:

```ts
window.univerAPI
  .getDocument('fern-editorial-playbook')
  .getParagraphs()[1]
  .setText('Leave the next editor a clear trail.')
```

Change the first assignment follow-up without rewriting the playbook:

```ts
window.univerAPI
  .getBase('fern-editorial-desk')
  .getTableById('assignments')
  .getRecordById('assignments-1')
  .setValue('next', 'Confirm opening times with the editor')
```

Use native Docs Undo/Redo, type in a paragraph and scroll to Handoff. Return to
Assignments, then Editions. Rename Everyday Water to Water Stories: three
linked assignment labels should follow the same edition ID. Base history and
document history must remain independent. A stage named Review is a local
record value, not an approval workflow or publishing command.

## Integration and acceptance

The same createDemo factory supplies Preview and standalone source. Official
Design, UI, Docs, Drawing, Bases and Embed styles are imported and exported.
The document uses Grid; Base retains its native sidebar and table controls.
Prepare, materialize and restore create a BasesTableListBlock anchor using
tableIndex/tableName, following the local SDK host model. The provider accepts
only this document ID and releases its owned resources on teardown.

Selected independent production verification passes at 1600px:
`test-results/embed-doc-base-tab-production-final/report.json` covers both
literal README examples, actual keyboard input, native Docs Ribbon and keyboard
Undo/Redo, lower-section scrolling, native Base edition rename and full-snapshot
Undo/Redo, three linked assignment labels with stable record IDs, tab navigation,
live themes and active-child disposal. No browser errors or backend requests
were observed. Host and document snapshots are checked independently.

`test-results/embed-doc-base-tab-next/report.json` passes EN/ZH guides,
Grid, white child CSS and actual media-theme transitions retaining the same
owner and both edited snapshots. Independent source/CSS parity is checked by
`scripts/test-showcase-export-ui.mjs test-results/fern-tab-export/exports.json`.
The export contains eleven files, including all six official CSS imports.

The first runtime failed native typing because its fixed click was in the
document's left whitespace. The corrected test clicks visible paragraph text
and verifies the resulting model; the original failure is retained. Native Docs
Undo materializes omitted customBlocks/customDecorations/customRanges as empty
arrays; every other saved field remains strict. Grid history buttons currently
expose command IDs without accessible names; that accessibility issue remains.

Full menus, error/empty/delayed sources, repeated mounts, React unmount races,
persistence, narrow/touch layouts, accessibility and performance remain open.
The independent build installs 206 packages; its main JS is 18,373.15 kB /
4,518.54 kB gzip and CSS is 134.30 / 19.21 kB. Cold selected Next guide and
playground requests took 55s and 28.2s, with a Gzip listener warning. This is
partial acceptance, not a complete capability claim. No Exchange conversion
or Print output is claimed for this case.

The saved Notion project-brief reference informs the sectioned editorial
structure; all stories, names and text are original and fictional. No reference
artwork is exported. No backend, publishing, source contact, consent collection,
approvals, notifications or automatic field synchronization is provided.
Reload restores initial data. Theme changes must preserve local edits.
The SDK license watermark remains unchanged; SDK packages are not patched.
