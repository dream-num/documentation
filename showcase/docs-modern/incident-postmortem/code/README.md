# Checkout latency / Incident postmortem

The demo runtime and authored data are English-only, including on a Chinese documentation page. Complete official English locale packs are retained. Any legacy locale argument is accepted but ignored; saved-snapshot argument positions are unchanged. Earlier bilingual test reports below describe the previous revision, not current language acceptance.

The original fictional 42-minute SEV-1 report retains its impact, cause, timeline,
evidence identifiers and A-04 owner/dates. Edit the actual native document; no
fixture buttons, activity strip or separately calculated completion counter exist.
Both entry points use one factory with Grid, official Docs CSS and full English core
resources. Theme changes retain the current editor and its edits.

The follow-up review adds containment reasoning, customer communication, a
release-validation gate and sampling uncertainty. It distinguishes observations
from decisions: completing the sample paragraph neither deploys a change nor
proves every follow-up is finished. These are native editable paragraphs, not
host explanation cards. The original incident facts and A-04 recipe are retained.

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
the ignored legacy locale and snapshot as the fourth argument. Do not overwrite snapshot IDs or
strip resources. No binary import/export or server conversion is implied.

## Verification boundary

Selected acceptance: 12/12 native gates and 4/4 recovery gates pass in
test-results/postmortem-follow-up-native/report.json and
test-results/postmortem-follow-up-recovery/report.json. Both literal recipes, current
remediation paint, repeated execution, native title input with complete Undo/Redo,
same-owner themes, initial Chinese UI and repeated entry disposal are checked.
The recovery harness uses this exact factory: full edited snapshot/ID equality,
fresh native input, invalid-input preservation and pre-ready double disposal pass.
The added review is reached with native end-of-document navigation. No snapshot
fields are removed or rewritten to make equality pass.

The actual React Preview also passes EN/ZH keyboard input, full edited snapshot
and owner retention across site-theme storage events, and unmount cleanup in
test-results/modern-story-previews/report.json.

These are selected checks, not full capability acceptance. Complete formatting,
accessibility, mobile/cross-browser, full Next routing, all error/recovery combinations
and binary conversion remain outside this evidence. Initial canvas text calls
alone are insufficient; screenshot checks wait for actual main-canvas ink.
