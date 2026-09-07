# Checkout latency / Incident postmortem

The original fictional 42-minute SEV-1 report retains its impact, cause, timeline,
evidence identifiers and A-04 owner/dates. Edit the actual native document; no
fixture buttons, activity strip or separately calculated completion counter exist.
Both entry points use one factory with Grid, official Docs CSS and full EN/ZH core
resources. Theme changes retain the current editor and its edits.

## Complete the remediation

Run in the standalone page or demo iframe. The guard inspects current document
content, not an independent boolean that becomes stale after Undo.

```ts
const doc = window.univerAPI.getActiveDocument()
const action = doc.getParagraphs().find((paragraph) => paragraph.getText().startsWith('A-04 · OPEN ·'))
if (action) {
  action.setText('A-04 · COMPLETE · Retry-budget alert shipped · Owner: Priya · Completed: 2027-01-15')
  action.setStyle({ textStyle: { fs: 11, bl: 1, cl: { rgb: '#027A48' } } })
}
```

## Save the original document identity and resources

```ts
const snapshot = window.univerAPI.getActiveDocument().save()
console.log(snapshot)
```

For integration, retain the controller returned by createIncidentPostmortemDemo.
Capture its snapshot before dispose; recreate with the same container, theme,
locale and snapshot as the fourth argument. Do not overwrite snapshot IDs or
strip resources. No binary import/export or server conversion is implied.

## Verification boundary

Selected acceptance: 11/11 native gates and 4/4 recovery gates pass in
test-results/postmortem-native-locale-painted/report.json and
test-results/postmortem-recovery/report.json. Both literal recipes, current
remediation paint, repeated execution, native title input with complete Undo/Redo,
same-owner themes, initial Chinese UI and repeated entry disposal are checked.
The recovery harness uses this exact factory: full edited snapshot/ID equality,
fresh native input, invalid-input preservation and pre-ready double disposal pass.
No snapshot fields are removed or rewritten to make equality pass.

These are selected checks, not full capability acceptance. Complete formatting,
accessibility, mobile/cross-browser, Next wrapper, all error/recovery combinations
and binary conversion remain outside this evidence. Initial canvas text calls
alone are insufficient; screenshot checks wait for actual main-canvas ink.
