import type { IDocumentData, IParagraphStyle } from '@univerjs/core'
import { DocumentFlavor, NamedStyleType, TabStopAlignment, TabStopLeader } from '@univerjs/core'

export function createData(): IDocumentData {
  const rows = [
    { text: 'Tab stops, not repeated spaces' },
    { text: 'One native tab character separates each label from its value.' },
    { text: 'Number / start\t128', alignment: TabStopAlignment.START },
    { text: 'Number / center\t128', alignment: TabStopAlignment.CENTER },
    { text: 'Number / end\t128', alignment: TabStopAlignment.END },
    { text: 'Word / start\tHarbor', alignment: TabStopAlignment.START },
    { text: 'Word / center\tHarbor', alignment: TabStopAlignment.CENTER },
    { text: 'Word / end\tHarbor', alignment: TabStopAlignment.END },
    { text: 'Dotted leader\t12', alignment: TabStopAlignment.END, leader: TabStopLeader.DOT },
    { text: 'Hyphen leader\t128', alignment: TabStopAlignment.END, leader: TabStopLeader.HYPHEN },
    { text: 'Underline leader\t1,280', alignment: TabStopAlignment.END, leader: TabStopLeader.UNDERSCORE },
    { text: 'Edit a label or value. The stop stays fixed while the tab spacing changes.' },
  ]
  const dataStream = rows.map(({ text }) => text).join('\r') + '\r\n'
  let offset = 0
  return {
    id: 'traditional-paragraph-tab-stops',
    title: 'Paragraph tab stops',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 794, height: 1123 },
      marginTop: 48,
      marginBottom: 48,
      marginLeft: 64,
      marginRight: 64,
    },
    body: {
      dataStream,
      textRuns: [],
      paragraphs: rows.map(({ text, alignment, leader }, index) => {
        offset += text.length + 1
        const paragraphStyle: IParagraphStyle = {
          namedStyleType: index === 0 ? NamedStyleType.TITLE : NamedStyleType.NORMAL_TEXT,
          spaceBelow: { v: index === 0 ? 18 : 14 },
          lineSpacing: 1.3,
          textStyle: { fs: index === 0 ? 24 : 15, bl: index === 0 ? 1 : 0 },
          ...(alignment ? { tabStops: [{ offset: 390, alignment, leader: leader ?? TabStopLeader.NONE }] } : {}),
        }
        return { startIndex: offset - 1, paragraphId: 'tab-stop-' + index, paragraphStyle }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'tab-stop-section' }],
    },
  }
}
