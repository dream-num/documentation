import { BooleanNumber, DocumentFlavor, PageOrientType, type IDocumentData, type IParagraphStyle } from '@univerjs/core'

// Original, fictional fixture. No external assets or network requests.
export const TITLE = 'Harbor Field Guide — Page Geometry'
export const PARAGRAPHS = [
  'Harbor Field Guide',
  'Operations handbook · Edition 2027.03 · Fictional field guide',
  'Arrival checklist',
  'The east quay opens at 06:30. Confirm the tide window, the assigned berth, and the radio channel before approaching. A narrow page wraps this checklist into more lines; landscape leaves room for longer instructions.',
  'Weather and visibility',
  'Fog can obscure the outer marker before sunrise. Reduce speed, keep a dedicated lookout, and record visibility at the entrance. The advisory is a fictional layout sample, not navigation guidance.',
  'Visitor handover',
  'Visitors receive a printed pass at the gate. Keep the emergency contact and return time together on the pass. The small field-guide variant demonstrates custom paper without replacing the document content.',
  'Supply manifest',
  'Fresh water: 180 litres. Fuel allocation: 420 litres. Inspection kits: 6. Spare lamps: 12. These values are deliberately different from the financial and research fixtures elsewhere in the catalog.',
  'Departure record',
  'Log the final passenger count, returned equipment, and the next inspection date. Page margins adjust the usable text area while preserving every paragraph.',
  'Publication note',
  'Page measurements use nominal geometry in 96-DPI pixels. The rendered page count depends on text reflow; nominal margins do not describe printer-specific non-printable areas.',
]
export const VARIANTS = [
  { id: 'a4', label: 'A4 portrait', pageSize: { width: 794, height: 1123 }, pageOrient: PageOrientType.PORTRAIT },
  {
    id: 'landscape',
    label: 'A4 landscape',
    pageSize: { width: 1123, height: 794 },
    pageOrient: PageOrientType.LANDSCAPE,
  },
  { id: 'letter', label: 'US Letter', pageSize: { width: 816, height: 1056 }, pageOrient: PageOrientType.PORTRAIT },
  {
    id: 'custom',
    label: 'Field guide · custom size',
    pageSize: { width: 560, height: 720 },
    pageOrient: PageOrientType.PORTRAIT,
  },
]

export function createData(variant = 'a4'): IDocumentData {
  const paper = VARIANTS.find((item) => item.id === variant)
  if (!paper) throw new Error('Unknown Harbor paper variant.')
  const dataStream = PARAGRAPHS.join('\r') + '\r\n'
  let offset = 0
  const paragraphs = PARAGRAPHS.map((text, index) => {
    offset += text.length + 1
    const paragraphStyle: IParagraphStyle = {
      textStyle: {
        fs: index === 0 ? 18 : 11,
        ff: 'Georgia',
        ...(index === 0 ? { bl: BooleanNumber.TRUE, cl: { rgb: '#173B3A' } } : {}),
      },
      lineSpacing: 1.3,
      spaceBelow: { v: 12 },
    }
    return { startIndex: offset - 1, paragraphId: 'para_page-setup_' + index, paragraphStyle }
  })
  return {
    id: 'page-setup-fixture',
    title: TITLE,
    body: {
      dataStream,
      paragraphs,
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'page-setup-section' }],
      textRuns: [],
    },
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: structuredClone(paper.pageSize),
      pageOrient: paper.pageOrient,
      marginTop: 72,
      marginRight: 72,
      marginBottom: 72,
      marginLeft: 72,
    },
  }
}
