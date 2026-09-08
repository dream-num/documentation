# Cross-file Formula References

Use Sheets or Bases as data sources for native results in Docs, Slides, Boards,
and charts. A host is the outer editor, not the formula result or data source.
Changing a source value should update the relevant results without replacing
authored document text, slide layouts, or Board content.

## Choose a scenario

| Goal | Example | What to try |
| --- | --- | --- |
| Live presentation from a Sheet | [Sheet in Slides](../embed/sheet-to-slides-float/README.md) | Change source assumptions and inspect the native formula shapes. |
| Presentation embedded in a Sheet | [Slides in Sheets](../embed/slides-in-sheets-formula-float/README.md) | Edit the hosting Sheet and compare the embedded presentation results. |
| Data-linked narrative | [Sheet to modern Docs](../embed/sheet-to-modern-doc/README.md) | Change source inputs while keeping authored prose intact. |
| Structured business document | [Base to traditional Docs](../embed/base-to-traditional-doc/README.md) | Change fees and hours independently and inspect inline results. |
| Operational diagram | [Board in Bases](../embed/boards-in-bases-formula-tab/README.md) | Change load or capacity and compare connected formula shapes. |
| Multiple output products | [Mixed-source workspace](../embed/mixed-to-many-products/README.md) | Compare independent planned and actual values across the outputs. |
| Multi-step calculation | [Calculation chain](../embed/base-sheet-calculation-chain/README.md) | Change Base quantities and Sheet rates, then inspect intermediate and downstream values. |

## Navigation

- Single-output cases: Compose & Embed → Cross-file Formula References → Host → Example.
- Multi-output cases: Compose & Embed → Showcases → Host → Example.
- Variants and API recipes stay inside the example; they are not additional directory levels.

For both hosting directions, identify the source and consumer explicitly. A Slides
editor hosted by a Sheet can still consume Sheet values; hosting direction does
not imply write-back. Renaming a source, changing its identity, hiding records,
missing references, empty values, zero, text, and error recovery are distinct cases.

## Boundaries

An editable output is not automatically a source editor. Arbitrary cyclic
write-back, direct Base-to-chart binding, PDF formula consumption, persistence,
and complete native history behavior are not implied by these examples.
Use each case's recipes and limitations together with `coverage.json`; do not
infer acceptance from the presence of a route or screenshot.
