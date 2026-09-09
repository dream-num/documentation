import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export const LAYOUTS = [
  { id: 'columns-two', en: 'Two equal columns', ratios: [1, 1] },
  { id: 'columns-three', en: 'Three equal columns', ratios: [1, 1, 1] },
  { id: 'columns-four', en: 'Four equal columns', ratios: [1, 1, 1, 1] },
  { id: 'columns-five', en: 'Five equal columns', ratios: [1, 1, 1, 1, 1] },
  { id: 'columns-wide-left', en: 'Wide left · 2:1', ratios: [2, 1] },
  { id: 'columns-wide-right', en: 'Wide right · 1:2', ratios: [1, 2] },
] as const

export function createData(_legacyLocale = false): IDocumentData {
  const rows = [
    { id: 'columns-title', text: 'Column layouts', title: true },
    ...LAYOUTS.flatMap((layout) => [
      { id: layout.id + '-heading', text: layout.en, title: false },
      { id: layout.id + '-anchor', text: '', title: false },
    ]),
  ]
  const dataStream = rows.map((row) => row.text).join('\r') + '\r\n'
  let offset = 0
  return {
    id: 'native-columns-gallery',
    title: 'Column layouts',
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
      paragraphs: rows.map((row) => {
        offset += row.text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: row.id,
          paragraphStyle: {
            namedStyleType: row.title ? NamedStyleType.TITLE : NamedStyleType.NORMAL_TEXT,
            spaceAbove: { v: row.id.endsWith('-heading') ? 16 : 0 },
            spaceBelow: { v: 8 },
            lineSpacing: 1.1,
            textStyle: {
              fs: row.title ? 24 : 14,
              bl: row.id.endsWith('-anchor') ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'columns-section' }],
    },
  }
}
