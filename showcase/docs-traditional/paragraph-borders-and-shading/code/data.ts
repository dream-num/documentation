import {
  BooleanNumber,
  DashStyleType,
  DocumentFlavor,
  SpacingRule,
  type IDocumentData,
  type IParagraphStyle,
} from '@univerjs/core'

export const SAMPLES: { id: string; text: string; style: IParagraphStyle }[] = [
  {
    id: 'plain',
    text: '01 / Plain paragraph. The field notebook records a quiet morning at the tide pools. No border or shading is applied.',
    style: {},
  },
  {
    id: 'solid',
    text: '02 / Solid bottom border. A one-point teal rule separates the observation from the next entry.',
    style: { borderBottom: { color: { rgb: '#366D72' }, width: 1, dashStyle: DashStyleType.SOLID, padding: 4 } },
  },
  {
    id: 'dash',
    text: '03 / Dashed bottom border. The same width and padding use an amber dashed stroke instead.',
    style: { borderBottom: { color: { rgb: '#AD763C' }, width: 1, dashStyle: DashStyleType.DASH, padding: 4 } },
  },
  {
    id: 'dot',
    text: '04 / Dotted bottom border. Violet dots mark a provisional note that is still under review.',
    style: { borderBottom: { color: { rgb: '#806180' }, width: 1, dashStyle: DashStyleType.DOT, padding: 4 } },
  },
  {
    id: 'wide-gap',
    text: '05 / Heavier rule with more padding. A three-point border sits twelve points below the final line.',
    style: { borderBottom: { color: { rgb: '#366D72' }, width: 3, dashStyle: DashStyleType.SOLID, padding: 12 } },
  },
  {
    id: 'shading',
    text: '06 / Paragraph shading. This pale green background belongs to the paragraph, not to individual highlighted characters.',
    style: { shading: { backgroundColor: { rgb: '#E1EFE8' } } },
  },
  {
    id: 'combined',
    text: '07 / Shading and rule. A warm background and amber bottom border emphasize the closing observation together.',
    style: {
      shading: { backgroundColor: { rgb: '#F5E9D4' } },
      borderBottom: { color: { rgb: '#AD763C' }, width: 2, dashStyle: DashStyleType.SOLID, padding: 8 },
    },
  },
]

export function createData(): IDocumentData {
  const rows = [
    { id: 'title', text: 'Field notes / paragraph treatments', style: { spaceBelow: { v: 18 } } },
    ...SAMPLES,
    { id: 'end-note', text: 'End of field notes.', style: {} },
  ]
  let offset = 0
  const dataStream = rows.map((row) => row.text).join('\r') + '\r\n'
  return {
    id: 'paragraph-border-shading-document',
    title: 'Paragraph bottom borders and shading',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 794, height: 1123 },
      marginTop: 56,
      marginBottom: 56,
      marginLeft: 68,
      marginRight: 68,
      textStyle: { fs: 12, ff: 'Arial', cl: { rgb: '#29454E' } },
    },
    body: {
      dataStream,
      textRuns: [{ st: 0, ed: rows[0].text.length, ts: { fs: 22, bl: BooleanNumber.TRUE } }],
      paragraphs: rows.map((row) => {
        offset += row.text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: row.id,
          paragraphStyle: {
            spacingRule: SpacingRule.AUTO,
            snapToGrid: BooleanNumber.FALSE,
            lineSpacing: 1.15,
            spaceAbove: { v: 0 },
            spaceBelow: { v: 24 },
            ...row.style,
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'field-notes' }],
    },
  }
}
