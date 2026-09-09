# Paragraph bottom borders and shading

Seven editable paragraphs compare a plain baseline, solid/dashed/dotted bottom borders, a wider rule with extra padding, paragraph shading and a combined treatment. The official Docs Core preset renders the traditional document with complete English locales and native Grid controls. Preview and standalone share the factory and data.

This case deliberately covers **bottom borders**, not a simulated four-sided box. Although the installed paragraph model declares top/left/right/between borders, their rendering is not verified in this SDK version. There is no custom formatting toolbar or CSS-painted document decoration.

The combined specimen includes a following end-note paragraph. In this installed SDK, the same specimen's bottom border was not visible when it was the final paragraph; adding the following paragraph made it visible. This is a rendering boundary, not an SDK fix or a claim that final-paragraph borders work.

## Public Facade recipes

Run these recipes in the example source with access to `univerAPI`. The first imports the public core enum; it is not an unmodified browser-console snippet.

Change the solid rule to a thicker blue dashed line with more separation from the text:

```ts
import { DashStyleType } from '@univerjs/core'

const paragraph = univerAPI.getActiveDocument().getParagraphs().find(p => p.getText().startsWith('02 /'))
paragraph.setStyle({ borderBottom: {
  color: { rgb: '#24566B' }, width: 3,
  dashStyle: DashStyleType.DASH, padding: 10,
} })
```

Change only the shaded paragraph's background:

```ts
const paragraph = univerAPI.getActiveDocument().getParagraphs().find(p => p.getText().startsWith('06 /'))
paragraph.setStyle({ shading: { backgroundColor: { rgb: '#DEE8F5' } } })
```

Adjust the combined treatment's rule spacing without changing its shading:

```ts
const paragraph = univerAPI.getActiveDocument().getParagraphs().find(p => p.getText().startsWith('07 /'))
const border = paragraph.getInfo().paragraph.paragraphStyle.borderBottom
paragraph.setStyle({ borderBottom: { ...border, padding: 16 } })
```

These are public API formatting recipes; the example does not claim a dedicated native paragraph-border or shading picker. Native text editing remains available. Border padding is the distance below the paragraph's last line, not general four-sided paragraph padding. Shading is paragraph-level, not character highlighting. Export fidelity and non-bottom border rendering are outside this case's scope.
