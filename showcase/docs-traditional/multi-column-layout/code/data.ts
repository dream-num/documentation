import { DocumentFlavor, type IDocumentData } from '@univerjs/core'

export const VARIANTS: {
  id: string
  title: string
  count: number
  gap: number
  widths?: number[]
  separator: boolean
}[] = [
  { id: 'single', title: 'Single column / reference', count: 1, gap: 0, separator: false },
  { id: 'double', title: 'Two columns / 24 px gap', count: 2, gap: 24, separator: false },
  { id: 'triple', title: 'Three columns', count: 3, gap: 18, separator: true },
  { id: 'unequal', title: 'Unequal columns / 180 + 396', count: 2, gap: 24, widths: [180, 396], separator: true },
]

const COPY = [
  'The neighborhood seed library keeps its catalogue beside the reading room. Volunteers record each donation in a small notebook before placing it on the shelf. A name, a collection date and a short growing note help the next visitor understand what is available. These pages use fictional observations to compare the reading rhythm of native document columns.',
  'At the spring exchange, several families brought envelopes saved from their gardens. The team separated herbs, flowers and vegetables, then checked that every envelope had a legible label. Blank labels were kept on a nearby tray. Visitors could add a note about soil or shade without being asked to complete a long form at the entrance.',
  'A narrow column makes each line shorter but creates more lines from the same paragraph. The text should continue into the next column when the first one is full. It remains one document story, not a collection of independently positioned boxes. Add a sentence near the beginning and observe how later words move through the available space.',
  'During the afternoon, one volunteer read the catalogue aloud while another checked the shelves. They found two similar names written with different spellings. Rather than discard either note, they recorded both descriptions for a later review. This simple practice kept useful context visible and avoided treating an uncertain label as an established fact about the donation.',
  'The paper edition is designed for ordinary reading. Section boundaries let the same material appear in a different column arrangement on a new page. A visible separator can help the eye distinguish adjacent columns, while a wider gap provides separation without a line. The example changes layout properties without inserting spaces or manual column break characters.',
  'At closing time, the remaining envelopes were placed back in their boxes and the loan notebook was returned to its drawer. The volunteers left a short handover message explaining which labels needed another look. A new reader can follow that message from the top of a column to its bottom and then continue in the next column.',
  'The final entry records the next exchange date and leaves room for a visitor to add a suggestion. Different column widths give the page a different cadence even when the copy is identical. Compare this ending with the same ending in the other sections, then edit a word to confirm that the paragraphs are native, selectable and editable.',
]

export function createData(): IDocumentData {
  const rows = VARIANTS.flatMap((v) =>
    [{ id: v.id + '-title', text: v.title, heading: true }].concat(
      COPY.map((text, i) => ({ id: v.id + '-' + i, text, heading: false })),
    ),
  )
  const dataStream = rows.map((r) => r.text).join('\r') + '\r\n'
  let offset = 0
  return {
    id: 'traditional-multi-column',
    title: 'Seed library / column layout',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 696, height: 650 },
      marginTop: 40,
      marginBottom: 40,
      marginLeft: 48,
      marginRight: 48,
    },
    body: {
      dataStream,
      paragraphs: rows.map((row) => {
        offset += row.text.length + 1
        return {
          paragraphId: row.id,
          startIndex: offset - 1,
          paragraphStyle: {
            textStyle: {
              ff: 'Georgia',
              fs: row.heading ? 18 : 12,
              bl: row.heading ? 1 : 0,
              cl: { rgb: row.heading ? '#365F51' : '#27342F' },
            },
            lineSpacing: 1.15,
            spaceBelow: { v: row.heading ? 14 : 9 },
          },
        }
      }),
      textRuns: [],
      sectionBreaks: [{ sectionId: 'column-last-section', startIndex: dataStream.length - 1 }],
    },
  }
}
