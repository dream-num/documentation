# Page breaks, section breaks and pagination rules

A short opening lab adds native continuous, next-page, odd-page and even-page section boundaries plus a real manual page-break token. The original seven keep/widow/page-break-before specimens follow unchanged. These are different mechanisms: a page break starts a page inside a section; a section break creates another persisted section. The headings say “Initially” where edits can change placement. No custom page layout or host panels are used.

## Four public Facade recipes

Turn the odd-page boundary into a next-page boundary. Observe whether the parity blank leaf disappears.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphs({paragraphId:'odd-page'})[0]
if (!doc.getSectionAt(paragraph.getRange().startOffset).setSectionType(window.univerAPI.Enum.SectionType.NEXT_PAGE)) throw new Error('Section type rejected')
```

Make that section continuous instead.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphs({paragraphId:'odd-page'})[0]
if (!doc.getSectionAt(paragraph.getRange().startOffset).setSectionType(window.univerAPI.Enum.SectionType.CONTINUOUS)) throw new Error('Section type rejected')
```

Insert a new next-page section before the manual-break reference paragraph.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphs({paragraphId:'manual-before'})[0]
if (!doc.insertSectionBreak(paragraph.getRange().startOffset,{nextSectionType:window.univerAPI.Enum.SectionType.NEXT_PAGE})) throw new Error('Section insertion rejected')
```

Apply paragraph page-break-before without creating another section.

```ts
const doc = window.univerAPI.getActiveDocument()
const paragraph = doc.findParagraphs({paragraphId:'continuous'})[0]
if (!paragraph.setStyle({pageBreakBefore:window.univerAPI.Enum.BooleanNumber.TRUE})) throw new Error('Paragraph rule rejected')
```

The native Breaks menu is present, but selecting Section Break (Next Page) currently throws an unregistered `doc.menu.section-break.next-page` command error. That strict native check remains failed; public Facade recipes are checked independently. Next-column breaks are not included because this lab has one column; header/footer linking remains in its dedicated gallery.

The initial manual break is inserted with the public `FDocument.insertText(offset, '\f')`. A native Ctrl+Enter attempt at the body caret did not insert a page-break token in the tested SDK; that strict keyboard check remains failed rather than being replaced by an API call. This is not a claim of complete native page-break keyboard support.
