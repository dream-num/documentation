import { BooleanNumber, DocumentFlavor, type IDocumentData } from '@univerjs/core'

export const ILLUSTRATION =
  '<svg xmlns="http://www.w3.org/2000/svg" width="210" height="140" viewBox="0 0 210 140"><rect width="210" height="140" fill="#E4EEE4"/><path d="M0 115L65 45L110 89L153 32L210 105V140H0Z" fill="#62836B"/><path d="M95 140L125 102L110 89L147 56" fill="none" stroke="#F4D7A1" stroke-width="12"/><circle cx="38" cy="30" r="13" fill="#E3A46D"/></svg>'
export const VARIANTS = [
  { id: 'inline', title: 'Inline image' },
  { id: 'square', title: 'Square wrapping' },
  { id: 'top-bottom', title: 'Top and bottom wrapping' },
]
export function createData(): IDocumentData {
  const copy = [
    'The survey team reached the ridge before sunrise. A narrow trail crossed the open meadow and turned toward the old observation shelter. The sketch records the route rather than a measured boundary.',
    'At the first marker, the team compared the map with the distant tree line. Each volunteer carried a notebook and recorded one visible landmark. They kept the observations separate from their later interpretations.',
    'A short pause beside the shelter allowed everyone to compare their notes. The group agreed to return by the same path, leaving the lower wetland undisturbed. The final sketch stayed with the field report.',
    'After the walk, the coordinator checked that the report included the date, weather and route. Missing observations were left open for another visit. No estimated measurements were presented as recorded facts.',
  ]
  const rows = VARIANTS.flatMap((v) =>
    [
      { id: v.id + '-heading', text: v.title, heading: true },
      {
        id: v.id + '-lead',
        text: 'Edit this lead-in to move the following anchored image and compare pagination.',
        heading: false,
      },
    ].concat(copy.map((text, i) => ({ id: v.id + (i === 0 ? '-anchor' : '-body-' + i), text, heading: false }))),
  )
  const dataStream = rows.map((r) => r.text).join('\r') + '\r\n'
  let offset = 0
  return {
    id: 'traditional-image-flow',
    title: 'Anchored images and page flow',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 656, height: 640 },
      marginTop: 40,
      marginBottom: 40,
      marginLeft: 48,
      marginRight: 48,
      autoHyphenation: BooleanNumber.FALSE,
    },
    body: {
      dataStream,
      textRuns: [],
      paragraphs: rows.map((r, i) => {
        offset += r.text.length + 1
        return {
          paragraphId: r.id,
          startIndex: offset - 1,
          paragraphStyle: {
            pageBreakBefore: r.heading && i > 0 ? BooleanNumber.TRUE : BooleanNumber.FALSE,
            spaceBelow: { v: 12 },
            lineSpacing: 1.2,
            textStyle: { ff: 'Arial', fs: r.heading ? 20 : 13, cl: { rgb: '#334A3A' } },
          },
        }
      }),
      sectionBreaks: [{ sectionId: 'field-report', startIndex: dataStream.length - 1 }],
    },
  }
}
