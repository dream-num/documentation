import type { IDocumentData } from '@univerjs/core'
import { BooleanNumber, DocumentFlavor, NamedStyleType } from '@univerjs/core'

export const BOOKMARKS = [
  { id: 'atlas-returns', heading: '04 · Returns desk' },
  { id: 'atlas-handoff', heading: '06 · Volunteer handoff' },
] as const
export const LINKS = [
  {
    id: 'atlas-manual',
    marker: 'Workshop reference: ',
    label: 'Tool care manual',
    url: 'https://example.org/atlas/manual?edition=2#care',
  },
  { id: 'atlas-summary', marker: 'Quick navigation: ', label: 'Return a borrowed kit', url: '#bookmark=atlas-returns' },
  {
    id: 'atlas-comparison',
    marker: 'Independent reference: ',
    label: 'Community calendar',
    url: 'https://example.org/atlas/calendar',
  },
] as const

// Original fictional lending-library brief, not a reused sales or task dataset.
export function createData(empty = false): IDocumentData {
  const normal = NamedStyleType.NORMAL_TEXT
  const heading = NamedStyleType.HEADING_1
  const rows: readonly (readonly [string, NamedStyleType])[] = empty
    ? [['', normal]]
    : [
        ['Atlas — Neighborhood Tool Library', NamedStyleType.TITLE],
        ['31 March 2027 · Volunteer operations · Prototype brief', normal],
        ['01 · Borrowing overview', heading],
        [
          'Atlas helps neighbors borrow repair kits and return complete sets. This fictional brief connects workshop guidance with the returns desk.',
          normal,
        ],
        [LINKS[1].marker + LINKS[1].label, normal],
        ['02 · Workshop references', heading],
        [LINKS[0].marker + LINKS[0].label, normal],
        [LINKS[2].marker + LINKS[2].label, normal],
        ['03 · Check-out checklist', heading],
        ['Photograph the numbered compartments before lending a kit', normal],
        ['Record the agreed return date on the lending card', normal],
        ['Confirm the torque wrench and adapter are present', normal],
        ['Check that the borrower can reach the returns instructions', normal],
        ['[CAUTION] These invented instructions demonstrate navigation, not safe equipment operation.', normal],
        [BOOKMARKS[0].heading, heading],
        [
          'Place the returned kit on the blue inspection shelf. A volunteer checks the compartment photo before closing the lending record.',
          normal,
        ],
        ['05 · Reminder configuration', heading],
        ['const reminder = { kit: "AT-204", daysBeforeReturn: 2 };', normal],
        [BOOKMARKS[1].heading, heading],
        [
          '[QUOTE] A useful handoff points the next volunteer to the exact decision, not just another document.',
          normal,
        ],
        ['— Atlas workshop retrospective, fictional attribution', normal],
      ]
  const dataStream = rows.map(([text]) => text).join('\r') + '\r\n'
  let offset = 0
  return {
    id: 'atlas-links-demo',
    title: 'Atlas — Neighborhood Tool Library',
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
      paragraphs: rows.map(([text, style], index) => {
        offset += text.length + 1
        return {
          startIndex: offset - 1,
          paragraphId: 'para_atlas_' + index,
          paragraphStyle: {
            namedStyleType: style,
            lineSpacing: 1,
            spaceBelow: { v: 8 },
            textStyle: {
              fs: style === NamedStyleType.TITLE ? 24 : style === heading ? 18 : 12,
              bl: style === normal ? BooleanNumber.FALSE : BooleanNumber.TRUE,
            },
          },
        }
      }),
      textRuns: [],
      customRanges: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'atlas-section' }],
    },
  }
}
