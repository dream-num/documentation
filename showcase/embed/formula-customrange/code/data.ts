import type { IBaseSnapshot, IDocumentData, IWorkbookData } from '@univerjs/core'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  BooleanNumber,
  createBaseRecordIdField,
  DocumentFlavor,
  LocaleType,
  NamedStyleType,
} from '@univerjs/core'

export const HOST_ID = 'estuary-field-brief'
export const SHEET_UNIT_ID = 'estuary-funding-model'
export const SHEET_ID = 'funding'
export const SHEET_NAME = 'Estuary Funding'
export const BASE_ID = 'estuary-delivery-register'
export const BASE_NAME = 'Estuary Delivery'
export const BLOCK_MARKERS = ['03 / Delivery commitments', '04 / Reading the numbers'] as const
const funding = "SUM('[Estuary Funding]Funding plan'!B5:B8)"
const spending = 'SUM([Estuary Delivery]!Costs[Amount])'
export const INLINE_FORMULAS = [
  { marker: '{{funding}}', formula: '=' + funding, pattern: '#,##0.00' },
  { marker: '{{spending}}', formula: '=' + spending, pattern: '#,##0.00' },
  { marker: '{{balance}}', formula: '=' + funding + '-' + spending, pattern: '#,##0.00' },
  { marker: '{{share}}', formula: '=' + spending + '/' + funding, pattern: '0.00%' },
] as const

const paragraphs = [
  ['ESTUARY / A neighborhood listening project', 'kicker'],
  ['Keep the story connected.', 'title'],
  ['Field brief / 18 April 2029 / Original fictional planning data', 'meta'],
  ['01 / The decision in context', 'heading'],
  [
    'A four-week listening programme brings residents, archivists and volunteer hosts together. The question is how much room remains for the next round of sessions, not how to turn a draft into an approval.',
    'body',
  ],
  [
    'The funding model provides USD {{funding}}. The delivery register records USD {{spending}} in commitments. Together they leave USD {{balance}} unallocated, with {{share}} of the funding committed.',
    'body',
  ],
  [
    'These four values are native inline formulas. The prose, paragraph styles and source blocks remain authored document content when an input changes.',
    'body',
  ],
  ['02 / Funding assumptions', 'heading'],
  [
    'The Sheet separates four illustrative contributions. Expand the native block and change B5 from 6,000 to 7,500: funding becomes 17,500 and the unallocated amount becomes 7,700. Delivery commitments do not change.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[0], 'heading'],
  [
    'The Relational Table tracks five work packages, each with a scope note and committed amount. Its formula sums the whole Costs table; filtering the view is not a claim that the document total follows that filter.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[1], 'heading'],
  [
    'Change a source amount and read the first paragraph again. A zero funding total deliberately exposes the native division error in the percentage; it does not replace the surrounding explanation with a fallback message.',
    'body',
  ],
  [
    'A native save preserves the live formula bindings. A display-text snapshot is a detached projection of the last successful values, not a fresh calculation or an Exchange file export.',
    'body',
  ],
  ['Decision / A draft for discussion, not an authorization to spend.', 'heading'],
] as const

export function createHostData(): IDocumentData {
  let offset = 0
  const dataStream = paragraphs.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Estuary / Data-linked field brief',
    documentStyle: {
      documentFlavor: DocumentFlavor.MODERN,
      pageSize: { width: 1000, height: 1000 },
      marginTop: 36,
      marginBottom: 36,
      marginLeft: 56,
      marginRight: 56,
    },
    drawings: {},
    drawingsOrder: [],
    body: {
      dataStream,
      paragraphs: paragraphs.map(([text, kind], i) => {
        offset += text.length + 1
        const heading = kind === 'heading'
        return {
          startIndex: offset - 1,
          paragraphId: 'estuary-p-' + i,
          paragraphStyle: {
            namedStyleType:
              kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
            ...(heading ? { headingId: 'estuary-heading-' + i } : {}),
            spaceAbove: { v: heading ? 16 : 0 },
            spaceBelow: { v: 10 },
            lineSpacing: 1.3,
            textStyle: {
              ff: 'Arial',
              fs: kind === 'title' ? 32 : heading ? 17 : kind === 'meta' ? 10 : 14,
              bl: heading || kind === 'title' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
              cl: { rgb: heading || kind === 'title' ? '#163E4B' : kind === 'kicker' ? '#997044' : '#405565' },
            },
          },
        }
      }),
      textRuns: [],
      customBlocks: [],
      customRanges: [],
      customDecorations: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'estuary-section' }],
    },
  }
}

export function createSheetData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'ESTUARY / Funding plan', s: 'title' } },
    1: { 0: { v: 'Four contributions / USD / Draft assumptions', s: 'muted' } },
    3: {
      0: { v: 'Contribution', s: 'header' },
      1: { v: 'Amount', s: 'header' },
      2: { v: 'Planning note', s: 'header' },
    },
    9: { 0: { v: 'Funding envelope', s: 'header' }, 1: { f: '=SUM(B5:B8)', s: 'total' } },
    11: { 0: { v: 'Amber cells are inputs. The brief reads B5:B8 directly.', s: 'muted' } },
  }
  const rows = [
    ['Programme allocation', 6000, 'Revise B5 to explore a larger envelope.'],
    ['Archive partnership', 4500, 'Illustrative contribution, not a grant award.'],
    ['Host contribution', 3500, 'A planning amount, not collected funds.'],
    ['Access reserve', 2000, 'Keep access costs visible in the discussion.'],
  ] as const
  rows.forEach(([label, amount, note], i) => {
    cellData[i + 4] = {
      0: { v: label, s: i % 2 ? 'stripe' : 'body' },
      1: { v: amount, s: 'input' },
      2: { v: note, s: 'muted' },
    }
  })
  return {
    id: SHEET_UNIT_ID,
    name: SHEET_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 22, bl: 1, cl: { rgb: '#163E4B' } },
      muted: { fs: 11, cl: { rgb: '#627785' } },
      header: { bg: { rgb: '#DDECEB' }, bl: 1, cl: { rgb: '#164B55' } },
      body: { cl: { rgb: '#405565' } },
      stripe: { bg: { rgb: '#F0F6F6' } },
      input: { bg: { rgb: '#FFF0D8' }, n: { pattern: '#,##0.00' } },
      total: { bg: { rgb: '#DDECEB' }, bl: 1, n: { pattern: '#,##0.00' }, cl: { rgb: '#164B55' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Funding plan',
        rowCount: 16,
        columnCount: 5,
        defaultRowHeight: 30,
        defaultColumnWidth: 100,
        columnData: { 0: { w: 225 }, 1: { w: 135 }, 2: { w: 390 } },
        rowData: { 0: { h: 40 } },
        cellData,
        mergeData: [0, 1, 11].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
    },
  }
}

export function createBaseData(): IBaseSnapshot {
  const time = Date.parse('2029-04-18T09:00:00Z')
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Work package', type: BaseFieldType.Text, config: {} },
    { id: 'amount', name: 'Amount', type: BaseFieldType.Number, config: { precision: 2 } },
    { id: 'note', name: 'Scope note', type: BaseFieldType.Text, config: {} },
  ]
  const rows = [
    ['Listening sessions', 3200, 'Four hosted conversations and preparation.'],
    ['Audio editing', 2400, 'A small archive of permission-cleared recordings.'],
    ['Accessible transcripts', 1800, 'Readable alternatives remain a separate line.'],
    ['Exhibition materials', 1400, 'Reusable displays for a temporary local venue.'],
    ['Local transport', 1000, 'Illustrative movement of materials, not bookings.'],
  ] as const
  const records = Object.fromEntries(
    rows.map(([title, amount, note], i) => {
      const id = 'cost-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: time,
          updatedAt: time,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, amount, note },
        },
      ]
    }),
  )
  const fieldOrder = fields.map((f) => f.id)
  return {
    id: BASE_ID,
    name: BASE_NAME,
    schemaVersion: 2,
    createdAt: time,
    updatedAt: time,
    tableOrder: ['costs'],
    tables: {
      costs: {
        id: 'costs',
        name: 'Costs',
        formulaName: 'Costs',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['costs-grid'],
        views: {
          'costs-grid': {
            id: 'costs-grid',
            tableId: 'costs',
            name: 'Delivery commitments',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                { hidden: id === BASE_RECORD_ID_FIELD_ID, width: id === 'title' ? 240 : id === 'note' ? 400 : 140 },
              ]),
            ),
            filter: null,
            sort: [],
            group: [],
            config: { rowHeight: 'medium', showRecordIndex: true, frozenFieldCount: 1 },
          },
        },
      },
    },
  }
}
