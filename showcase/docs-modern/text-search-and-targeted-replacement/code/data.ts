import { DocumentFlavor, NamedStyleType, type IDocumentData } from '@univerjs/core'

export function createData(): IDocumentData {
  const lines = [
    'Find the right words',
    'Facade text queries in an editable fieldwork note',
    'Case study: Archive, archive and ARCHIVE label three storage trays.',
    'Repeated terms: cedar marks the gate; cedar marks the bridge; cedar marks the return path.',
    'Practice: add a short lead-in here before querying the next paragraph again.',
    'Route note: follow the amber trail to the quiet observation deck.',
    'Untouched reference: birch labels remain blue and the meeting time stays at 09:30.',
    'Search is literal and paragraph-scoped. The README demonstrates public SDK queries, not a native search panel.',
  ]
  const dataStream = lines.join('\r') + '\r\n'
  let offset = 0
  const reference = dataStream.indexOf('birch labels')
  return {
    id: 'modern-text-search',
    title: 'Text search and targeted replacement',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 850, height: 1123 },
      marginTop: 30,
      marginBottom: 30,
      marginLeft: 48,
      marginRight: 48,
    },
    body: {
      dataStream,
      textRuns: [{ st: reference, ed: reference + 'birch labels'.length, ts: { cl: { rgb: '#2563A0' }, bl: 1 } }],
      paragraphs: lines.map((line, i) => {
        offset += line.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: 'search-paragraph-' + i,
          paragraphStyle: {
            namedStyleType: i === 0 ? NamedStyleType.TITLE : NamedStyleType.NORMAL_TEXT,
            spaceAbove: { v: 0 },
            spaceBelow: { v: i < 2 ? 18 : 26 },
            lineSpacing: 1.3,
            textStyle: { ff: 'Arial', fs: i === 0 ? 25 : 15, cl: { rgb: '#374A43' } },
          },
        }
      }),
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'search-section' }],
    },
  }
}
