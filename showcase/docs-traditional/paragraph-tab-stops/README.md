# Paragraph Tab Stops

Each example contains a real tab character, not repeated spaces or typed dot characters. All nine stops use offset 390 in the paragraph's coordinate space.

- The first three rows compare the number 128 at the start, center or end of the stop.
- Three word rows compare Harbor against the numeric specimens at the same stop position.
- The last three rows use dotted, hyphen and underline leaders with end-aligned values of different lengths.

Edit a value in the native document to see its alignment respond. The leader is rendered from paragraph style, not stored as punctuation in the text.

## Public paragraph recipe

```ts
import { TabStopAlignment, TabStopLeader } from '@univerjs/core'

const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.getParagraphs().find(item => item.getText().startsWith('Dotted leader'))
if (!paragraph) throw new Error('The sample paragraph is missing')
if (!paragraph.setStyle({
  tabStops: [{
    offset: 450,
    alignment: TabStopAlignment.END,
    leader: TabStopLeader.DOT,
  }],
})) throw new Error('The paragraph rejected the tab stop')
```

The dotted leader and its value move to a stop 60 units farther right without changing the paragraph text.

The installed SDK exposes START, CENTER and END alignment; decimal-aligned stops are not shown. This is not a footnote/endnote demo. Preview and standalone use the same factory, official Docs core CSS, full English locale and Grid ribbon.
