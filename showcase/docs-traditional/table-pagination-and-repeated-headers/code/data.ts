import { BooleanNumber, DocumentFlavor, type IDocumentData } from '@univerjs/core'

export const ROWS = [
  ['Community archive', 'Spring intake', 'Review register'],
  ['Collection item', 'Reference', 'Review status'],
  ...Array.from({ length: 18 }, (_, i) => [
    ['Map folio', 'Studio ledger', 'Garden diary', 'Photo album', 'Festival poster', 'Oral history'][i % 6] +
      ' / ' +
      String(i + 1).padStart(2, '0'),
    'CA-' + (2041 + i * 7),
    ['Catalogued', 'Check date', 'Ready to shelve', 'Awaiting note'][i % 4],
  ]),
]

export function createData(): IDocumentData {
  const rows = [
    { id: 'none-title', text: 'No repeated header / reference', title: true },
    {
      id: 'none-anchor',
      text: 'Initially, continuation pages do not repeat the first rows of this native table.',
      title: false,
    },
    { id: 'one-title', text: 'One repeated header row', title: true },
    { id: 'one-anchor', text: 'Initially, only the dark-green first row is marked for repetition.', title: false },
    { id: 'two-title', text: 'Two repeated header rows', title: true },
    {
      id: 'two-anchor',
      text: 'Initially, the collection heading and field labels are marked for repetition.',
      title: false,
    },
  ]
  const dataStream = rows.map((r) => r.text).join('\r') + '\r\n'
  let offset = 0
  return {
    id: 'traditional-table-pagination',
    title: 'Table pagination and repeated headers',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 656, height: 560 },
      marginLeft: 48,
      marginRight: 48,
      marginTop: 40,
      marginBottom: 40,
      autoHyphenation: BooleanNumber.FALSE,
    },
    body: {
      dataStream,
      paragraphs: rows.map((row, i) => {
        offset += row.text.length + 1
        return {
          paragraphId: row.id,
          startIndex: offset - 1,
          paragraphStyle: {
            pageBreakBefore: row.title && i > 0 ? BooleanNumber.TRUE : BooleanNumber.FALSE,
            spaceBelow: { v: 12 },
            textStyle: { ff: 'Arial', fs: row.title ? 19 : 12, cl: { rgb: '#36594D' } },
          },
        }
      }),
      textRuns: [],
      sectionBreaks: [{ sectionId: 'archive-section', startIndex: dataStream.length - 1 }],
    },
  }
}
