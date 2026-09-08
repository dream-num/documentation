import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export function createData(_legacyLocale = false): IDocumentData {
  const rows = [
    'Width and zoom',
    'The same paragraph',
    'An open book rests beside a glass of water. Afternoon light falls across the paper, leaving a slowly moving shadow. Read this page, then turn to the next. The words keep their order while the ends of the lines move as the available width changes.',
    'Another paragraph',
    'A short path crosses the garden, passes a bench, and reaches a quiet doorway. Mint and rosemary grow beside the path. Their leaves move gently in the breeze. A few birds call in the distance, and then the garden is still again.',
    'A short line',
    'Width changes wrapping. Zoom changes visual size.',
  ]
  let offset = 0
  const dataStream = rows.join('\r') + '\r\n'
  return {
    id: 'native-width-document',
    title: rows[0],
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 820, height: 1123 },
      marginTop: 24,
      marginBottom: 24,
      marginLeft: 40,
      marginRight: 40,
    },
    body: {
      dataStream,
      textRuns: [],
      paragraphs: rows.map((text, index) => {
        offset += text.length + 1
        const heading = index === 1 || index === 3 || index === 5
        return {
          startIndex: offset - 1,
          paragraphId: 'width-paragraph-' + index,
          paragraphStyle: {
            namedStyleType:
              index === 0 ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_2 : NamedStyleType.NORMAL_TEXT,
            spaceAbove: { v: heading ? 12 : 0 },
            spaceBelow: { v: 12 },
            lineSpacing: 1.3,
            textStyle: {
              fs: index === 0 ? 24 : heading ? 17 : 14,
              bl: index === 0 || heading ? BooleanNumber.TRUE : BooleanNumber.FALSE,
            },
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'width-section' }],
    },
  }
}
