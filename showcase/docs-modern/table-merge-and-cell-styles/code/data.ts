import { BooleanNumber, DocumentFlavor, type IDocumentData } from '@univerjs/core'

export const ROWS = [
  ['Open studio / Saturday', '', ''],
  ['Room', 'Activity', 'Time'],
  ['Print room', 'Lino printing', '10:00'],
  ['', 'Book cover design', '11:30'],
  ['Ceramics room', 'Glaze testing', '14:00'],
]

export function createData(): IDocumentData {
  const rows = [
    { id: 'title', text: 'Workshop tables / shared headings' },
    {
      id: 'hint',
      text: 'Compare identical data before and after native horizontal and vertical merges. Covered cells start empty.',
    },
    { id: 'baseline-title', text: 'Unmerged reference' },
    { id: 'baseline-anchor', text: 'The title belongs to the first cell; the reserved neighboring cells are empty.' },
    { id: 'merged-title', text: 'Merged title and room label' },
    {
      id: 'merged-anchor',
      text: 'The title spans three columns. Print room spans two rows. Click a cell to edit its native text.',
    },
    { id: 'footer', text: 'Only the example tables are edited. Reload restores the original comparison.' },
  ]
  const dataStream = rows.map((r) => r.text).join('\r') + '\r\n'
  let offset = 0
  return {
    id: 'modern-table-merge',
    title: 'Table merge and cell styles',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 760, height: Number.POSITIVE_INFINITY },
      marginTop: 36,
      marginBottom: 36,
      marginLeft: 56,
      marginRight: 56,
      autoHyphenation: BooleanNumber.FALSE,
    },
    body: {
      dataStream,
      paragraphs: rows.map((r, i) => {
        offset += r.text.length + 1
        return {
          paragraphId: r.id,
          startIndex: offset - 1,
          paragraphStyle: {
            spaceAbove: { v: i === 0 ? 0 : 10 },
            spaceBelow: { v: 12 },
            textStyle: { ff: 'Arial', fs: i === 0 ? 23 : r.id.endsWith('title') ? 17 : 12, cl: { rgb: '#463450' } },
          },
        }
      }),
      textRuns: [],
      sectionBreaks: [{ sectionId: 'table-style-section', startIndex: dataStream.length - 1 }],
    },
  }
}
