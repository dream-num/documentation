import type { IDocumentData, IParagraph, ICustomColumnGroup } from '@univerjs/core'
import { ColumnDataStreamTreeTokenType } from '@univerjs-pro/docs-column'
import { BooleanNumber, ColumnLayoutType, ColumnResponsiveType, DocumentFlavor, NamedStyleType } from '@univerjs/core'
export const PRIMARY_ID = 'cedar-decisions'
export const SAMPLES = [
  {
    id: 'packing',
    label: 'Seed packing decisions',
    rows: [
      ['Decision', 'Owner', 'Due', 'Outcome'],
      ['Use paper envelopes', 'Mara', '02 Apr 2027', 'Approved'],
      ['Separate fragrant varieties', 'Ivo', '04 Apr 2027', 'Trial batch'],
      ['Add large-print labels', 'Nia', '06 Apr 2027', 'Review pending'],
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory reconciliation',
    rows: [
      ['Decision', 'Owner', 'Due', 'Outcome'],
      ['Recount bean packets', 'Eli', '03 Apr 2027', '18 packets verified'],
      ['Retire torn trays', 'Sana', '05 Apr 2027', '4 trays replaced'],
      ['Review unknown provenance', 'Jo', '07 Apr 2027', 'Hold for curator'],
      ['Photograph new donations', 'Remy', '08 Apr 2027', '12 images cataloged'],
    ],
  },
  {
    id: 'handoff',
    label: 'Weekend desk handoff',
    rows: [
      ['Decision', 'Owner', 'Due', 'Outcome'],
      ['Prepare welcome cards', 'Ari', '09 Apr 2027', 'Ready'],
      ['Assign quiet-hour host', 'Noor', '10 Apr 2027', 'Awaiting confirmation'],
    ],
  },
] as const
export const COMPARISON = [
  ['Borrowed trays', 'Reusable envelopes'],
  ['Easy to sort at the desk', 'Easy to carry home'],
  ['Return after the workshop', 'Return at the next seed swap'],
] as const
export const OWNER_ROW = ['Accessibility sign-off', 'Lena', '11 Apr 2027', 'Scheduled'] as const
export const NARRATIVE = [
  'At the desk\rBorrowed trays keep varieties visible during sorting. Volunteers check labels together and return each tray after the workshop.',
  'On the way home\rReusable envelopes fit small bags and protect seed labels. Borrowers bring them back at the next swap; large-print labels stay outside.',
] as const
export const COLLECTION = {
  packing: [
    ['Variety', 'Ready packets'],
    ['Beans', 42],
    ['Peas', 28],
    ['Calendula', 19],
  ],
  inventory: [
    ['Variety', 'Verified packets'],
    ['Beans', 18],
    ['Peas', 36],
    ['Calendula', 24],
  ],
  handoff: [
    ['Variety', 'Reserved packets'],
    ['Beans', 12],
    ['Peas', 8],
    ['Calendula', 15],
  ],
} as const
// Original code-authored illustration for this fictional fixture, dedicated to CC0.
// Embedded SVG travels with the runnable source; no remote image service is required.
export const PACKAGING_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="200" viewBox="0 0 640 200">
<rect width="640" height="200" rx="12" fill="#f0fdf4"/>
<g stroke="#166534" stroke-width="3"><rect x="24" y="26" width="260" height="148" rx="8" fill="#dcfce7"/>
<path d="M110 26v148M198 26v148M24 100h260" fill="none"/>
<ellipse cx="66" cy="62" rx="16" ry="9" fill="#a16207"/><ellipse cx="153" cy="64" rx="10" ry="15" fill="#a16207"/>
<ellipse cx="242" cy="62" rx="15" ry="9" fill="#a16207"/><ellipse cx="66" cy="137" rx="10" ry="15" fill="#a16207"/>
<ellipse cx="153" cy="137" rx="16" ry="9" fill="#a16207"/><ellipse cx="242" cy="137" rx="10" ry="15" fill="#a16207"/>
<rect x="342" y="26" width="270" height="148" rx="8" fill="#fef3c7"/><path d="m342 26 135 68 135-68" fill="none"/></g>
<rect x="400" y="108" width="154" height="42" rx="4" fill="white"/>
<text x="477" y="136" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#166534">CEDAR BEANS</text></svg>`
export function createData(empty = false): IDocumentData {
  const normal = NamedStyleType.NORMAL_TEXT,
    heading = NamedStyleType.HEADING_1
  const rows: readonly (readonly [string, NamedStyleType])[] = empty
    ? [['', normal]]
    : [
        ['Cedar — Seed Library Pilot', NamedStyleType.TITLE],
        ['31 March 2027 · Community collection team · Decision memo', normal],
        ['01 · Pilot context', heading],
        [
          'Cedar is a fictional lending collection for neighborhood seed swaps. The team records a decision, an owner, a due date and the expected result for each preparation task.',
          normal,
        ],
        ['02 · Decision register', heading],
        ['Inventory reconciliation', NamedStyleType.HEADING_2],
        ['Weekend desk handoff', NamedStyleType.HEADING_2],
        ['03 · Packaging comparison', heading],
        ['04 · Review notes', heading],
        [
          'The comparison remains independent when decision cells, rows or dimensions change. Review long labels before printing or embedding the memo.',
          normal,
        ],
        ['05 · Collection evidence', heading],
        ['Packaging illustration', normal],
        ['', normal],
        ['Original Cedar tray and envelope study · CC0 illustration, not a product photograph.', normal],
        ['Collection readiness', normal],
        ['', normal],
        ['Inventory packet counts', normal],
        ['', normal],
        ['Weekend reservations', normal],
        ['', normal],
        [
          'The charts show fictional packet counts for packing, inventory and handoff. They are editable document charts, separate from the decision registers.',
          normal,
        ],
        ['06 · Next handoff', heading],
        [
          'The volunteer coordinator checks the final owner row and records a clear outcome before the weekend desk opens.',
          normal,
        ],
      ]
  let dataStream = ''
  const paragraphs: IParagraph[] = []
  const columnGroups: ICustomColumnGroup[] = []
  const append = (text: string, style: NamedStyleType, paragraphId: string) => {
    dataStream += text + '\r'
    paragraphs.push({
      startIndex: dataStream.length - 1,
      paragraphId,
      paragraphStyle: { namedStyleType: style, lineSpacing: 1, spaceBelow: { v: 8 } },
    })
  }
  rows.forEach(([text, style], index) => {
    const originalIndex =
      index < 5 ? index : index >= 7 && index <= 15 ? index - 2 : index >= 20 ? index - 6 : 'supplement_' + index
    append(text, style, 'para_cedar_' + originalIndex)
    if (text === '04 · Review notes') {
      const startIndex = dataStream.length
      dataStream += ColumnDataStreamTreeTokenType.COLUMN_GROUP_START
      NARRATIVE.forEach((content, column) => {
        dataStream += ColumnDataStreamTreeTokenType.COLUMN_START
        content
          .split('\r')
          .forEach((line, lineIndex) => append(line, normal, 'para_cedar_narrative_' + column + '_' + lineIndex))
        dataStream += ColumnDataStreamTreeTokenType.COLUMN_END
      })
      const endIndex = dataStream.length
      dataStream += ColumnDataStreamTreeTokenType.COLUMN_GROUP_END
      columnGroups.push({
        startIndex,
        endIndex,
        columnGroupId: 'cedar-packaging-narrative',
        columns: [
          { columnId: 'cedar-desk', widthRatio: 1 },
          { columnId: 'cedar-home', widthRatio: 1 },
        ],
        gap: { v: 24 },
        layout: ColumnLayoutType.FIXED,
        responsive: ColumnResponsiveType.STACK,
      })
    }
  })
  dataStream += '\n'
  return {
    id: 'cedar-table-demo',
    title: 'Cedar — Seed Library Pilot',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      autoHyphenation: BooleanNumber.FALSE,
      pageSize: { width: 820, height: 1123 },
      marginTop: 24,
      marginBottom: 24,
      marginLeft: 40,
      marginRight: 40,
    },
    body: {
      dataStream,
      textRuns: [],
      customRanges: [],
      paragraphs,
      columnGroups,
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'cedar-section' }],
    },
  }
}
