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
export const HOST_ID = 'cobalt-operating-review'
export const SHEET_UNIT_ID = 'cobalt-revenue-plan'
export const SHEET_ID = 'revenue'
export const SHEET_NAME = 'Cobalt Revenue'
export const BASE_ID = 'cobalt-cost-register'
export const BASE_NAME = 'Cobalt Costs'
export const BLOCK_MARKERS = ['03 / Cost register', '04 / Reconcile the decision'] as const
const revenue = "SUM('[Cobalt Revenue]Revenue'!B5:B7)"
const target = "'[Cobalt Revenue]Revenue'!E5"
const costs = 'SUMIF([Cobalt Costs]!Costs[Scope],"Included",[Cobalt Costs]!Costs[Amount])'
const balance = '(' + revenue + '-' + costs + ')'
const ratio = balance + '/' + revenue
const headroom = balance + '-' + revenue + '*' + target
export const INLINE_FORMULAS = [
  { marker: '{{revenue}}', formula: '=' + revenue, pattern: '$#,##0' },
  { marker: '{{cost}}', formula: '=' + costs, pattern: '$#,##0' },
  { marker: '{{balance}}', formula: '=' + balance, pattern: '$#,##0;-$#,##0' },
  { marker: '{{margin}}', formula: '=' + ratio, pattern: '0.0%' },
  { marker: '{{records}}', formula: '=ROWS([Cobalt Costs]!Costs[Cost])', pattern: '0' },
  { marker: '{{included}}', formula: '=COUNTIF([Cobalt Costs]!Costs[Scope],"Included")', pattern: '0' },
  {
    marker: '{{optional}}',
    formula: '=SUMIF([Cobalt Costs]!Costs[Scope],"Optional",[Cobalt Costs]!Costs[Amount])',
    pattern: '$#,##0',
  },
  { marker: '{{revenue-again}}', formula: '=' + revenue, pattern: '$#,##0' },
  { marker: '{{cost-again}}', formula: '=' + costs, pattern: '$#,##0' },
  { marker: '{{balance-again}}', formula: '=' + balance, pattern: '$#,##0;-$#,##0' },
  { marker: '{{target}}', formula: '=' + target, pattern: '0.0%' },
  { marker: '{{gap}}', formula: '=(' + ratio + ')-' + target, pattern: '+0.0%;-0.0%;0.0%' },
  { marker: '{{headroom}}', formula: '=' + headroom, pattern: '$#,##0;-$#,##0' },
  {
    marker: '{{signal}}',
    formula: '=IF((' + headroom + ')>=0,"Room within the scenario","Revisit the assumptions")',
    pattern: 'General',
  },
] as const
export const COSTS = [
  ['Programme staff', 18500, 'Included', 'Ada', 'Facilitators and preparation time across the season.'],
  ['Shared venue', 14200, 'Included', 'Leo', 'A planning allowance for an accessible shared space.'],
  ['Reusable materials', 9700, 'Included', 'Nia', 'Maintain and replenish the workshop kit.'],
  ['Partner services', 15100, 'Included', 'Owen', 'Specialist sessions and accessible formats.'],
  ['Follow-up residency', 3200, 'Optional', 'Mina', 'A separately scoped extension, not part of the baseline.'],
] as const
const paragraphs = [
  ['COBALT / COMMUNITY ARTS WORKSHOP', 'kicker'],
  ['One review. Two independent sources.', 'title'],
  ['Annual operating scenario / 15 September 2029 / Illustrative USD', 'meta'],
  ['01 / Executive reading', 'heading'],
  [
    'This fictional workshop compares a revenue plan with a separately maintained cost register. The report is a planning conversation, not financial statements, an audit opinion or an authorization to spend.',
    'body',
  ],
  [
    'POSITION / Planned revenue is {{revenue}} and included costs are {{cost}}. The difference is {{balance}}, or {{margin}} of planned revenue. These are live native formulas, not copied totals.',
    'body',
  ],
  [
    'SCOPE / The cost register has {{records}} lines: {{included}} are Included. Optional work totals {{optional}} and does not enter the baseline difference. A view filter is not the same as changing scope.',
    'body',
  ],
  [
    'The income assumptions live in a Sheet; cost amounts, owners and scope live in a Base. Changing one source does not rewrite the other. Repeated figures in the final chapter read the same bindings.',
    'body',
  ],
  ['Reading order / Summary · Revenue plan · Cost register · Reconciliation', 'caption'],
  ['02 / Revenue plan', 'heading'],
  [
    'Three programme lines total 86,000 in the baseline. The amber amounts are editable assumptions, not collected cash. The lavender target is a separate retained-share assumption.',
    'body',
  ],
  [
    'Expand the native Sheet block and change B5 from 24,000 to 26,000. Revenue and the difference should rise by 2,000; no Base cost line should change.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[0], 'heading'],
  [
    'Four Included lines total 57,500; the optional residency is outside that sum. Expand this native Base block to revise a cost or change its Scope. Notes and owners remain context, not arithmetic.',
    'body',
  ],
  [
    'A filter can hide all records while the whole-table formulas remain unchanged. Conversely, editing a hidden Included amount still changes the report.',
    'body',
  ],
  ['', 'body'],
  [BLOCK_MARKERS[1], 'heading'],
  [
    'RECONCILIATION / Revenue of {{revenue-again}} less included costs of {{cost-again}} leaves {{balance-again}}. This repeats the first-page calculation instead of saving a second manual total.',
    'body',
  ],
  [
    'TARGET / The retained-share assumption is {{target}}. The current share-minus-target difference is {{gap}} in percentage points; cash headroom above that scenario is {{headroom}}.',
    'body',
  ],
  ['Discussion signal: {{signal}}.', 'signal'],
  [
    'INTERPRETATION / Increasing the target changes the gap, headroom and signal without changing revenue or costs. Including optional work changes its contribution to the cost sum, not the revenue plan.',
    'body',
  ],
  [
    'BOUNDARIES / Zero revenue leaves the percentage denominator undefined; native errors remain visible. Blank amounts are missing, not measured zero. This simplified scenario excludes tax, depreciation, working capital and timing.',
    'body',
  ],
  ['Prepared for review / No live accounts, approvals, billing or backend connection.', 'caption'],
] as const
export function createHostData(): IDocumentData {
  let offset = 0
  const dataStream = paragraphs.map(([text]) => text).join('\r') + '\r\n'
  return {
    id: HOST_ID,
    title: 'Cobalt / Annual operating review',
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: 794, height: 1123 },
      marginTop: 64,
      marginBottom: 64,
      marginLeft: 68,
      marginRight: 68,
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
          paragraphId: 'cobalt-p-' + i,
          paragraphStyle: {
            namedStyleType:
              kind === 'title' ? NamedStyleType.TITLE : heading ? NamedStyleType.HEADING_1 : NamedStyleType.NORMAL_TEXT,
            ...(heading ? { headingId: 'cobalt-heading-' + i } : {}),
            ...(/^(02|03|04) \//.test(text) ? { pageBreakBefore: BooleanNumber.TRUE } : {}),
            spaceAbove: { v: heading ? 16 : 0 },
            spaceBelow: { v: kind === 'title' ? 16 : 12 },
            lineSpacing: 1.2,
            textStyle: {
              ff: kind === 'body' || kind === 'title' ? 'Georgia' : 'Arial',
              fs: kind === 'title' ? 29 : heading ? 16 : kind === 'body' ? 12 : 10,
              bl:
                heading || kind === 'title' || kind === 'kicker' || kind === 'signal'
                  ? BooleanNumber.TRUE
                  : BooleanNumber.FALSE,
              cl: {
                rgb:
                  kind === 'title'
                    ? '#132F59'
                    : heading
                      ? '#325B87'
                      : kind === 'kicker' || kind === 'caption'
                        ? '#967032'
                        : kind === 'signal'
                          ? '#276C5B'
                          : '#40536B',
              },
            },
          },
        }
      }),
      textRuns: [],
      customBlocks: [],
      customRanges: [],
      customDecorations: [],
      sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'cobalt-section' }],
    },
  }
}
export function createSheetData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'COBALT / Revenue plan', s: 'title' } },
    1: { 0: { v: 'Three programme assumptions / not collected cash', s: 'muted' } },
    3: {
      0: { v: 'Programme', s: 'header' },
      1: { v: 'Revenue / $', s: 'header' },
      2: { v: 'Assumption', s: 'header' },
      4: { v: 'Target share', s: 'header' },
    },
    8: { 0: { v: 'Planned revenue', s: 'header' }, 1: { f: '=SUM(B5:B7)', s: 'total' } },
    10: { 0: { v: 'Rows 5:7 feed the report. E5 is independent of revenue.', s: 'muted' } },
  }
  const rows = [
    ['Open workshops', 24000, 'A schedule of small-group sessions.'],
    ['Membership programme', 28000, 'Illustrative annual member support.'],
    ['Partner commissions', 34000, 'Proposed projects, not signed orders.'],
  ] as const
  rows.forEach(([name, value, note], i) => {
    cellData[i + 4] = { 0: { v: name, s: 'body' }, 1: { v: value, s: 'input' }, 2: { v: note, s: 'muted' } }
  })
  cellData[4][4] = { v: 0.3, s: 'target' }
  return {
    id: SHEET_UNIT_ID,
    name: SHEET_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 20, bl: 1, cl: { rgb: '#132F59' } },
      header: { bg: { rgb: '#E2EAF4' }, bl: 1, cl: { rgb: '#325B87' } },
      body: { cl: { rgb: '#40536B' } },
      muted: { fs: 10, cl: { rgb: '#6A7D90' } },
      input: { bg: { rgb: '#F8E9C9' }, n: { pattern: '$#,##0' }, cl: { rgb: '#805C24' } },
      target: { bg: { rgb: '#EBE3F7' }, n: { pattern: '0.0%' }, cl: { rgb: '#685187' } },
      total: { bg: { rgb: '#DDEEE7' }, bl: 1, n: { pattern: '$#,##0' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Revenue',
        rowCount: 15,
        columnCount: 6,
        defaultRowHeight: 28,
        defaultColumnWidth: 80,
        columnData: { 0: { w: 160 }, 1: { w: 100 }, 2: { w: 200 }, 3: { w: 18 }, 4: { w: 100 } },
        rowData: { 0: { h: 40 } },
        cellData,
        mergeData: [0, 1, 10].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
    },
  }
}
export function createBaseData(): IBaseSnapshot {
  const time = Date.parse('2029-09-15T09:00:00Z')
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Cost', type: BaseFieldType.Text, config: {} },
    { id: 'amount', name: 'Amount', type: BaseFieldType.Number, config: { precision: 0 } },
    {
      id: 'scope',
      name: 'Scope',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Included', name: 'Included', color: '#50C8B0' },
          { id: 'Optional', name: 'Optional', color: '#F2B84B' },
        ],
      },
    },
    { id: 'owner', name: 'Owner', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Context', type: BaseFieldType.Text, config: {} },
  ]
  const records = Object.fromEntries(
    COSTS.map(([title, amount, scope, owner, note], i) => {
      const id = 'cost-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: time,
          updatedAt: time,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, amount, scope, owner, note },
        },
      ]
    }),
  )
  const fieldOrder = fields.map((f) => f.id)
  return {
    id: BASE_ID,
    name: BASE_NAME,
    locale: LocaleType.EN_US,
    schemaVersion: 2,
    createdAt: time,
    updatedAt: time,
    tableOrder: ['costs'],
    tables: {
      costs: {
        id: 'costs',
        name: 'Cost register',
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
            name: 'Operating scope',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'title' ? 200 : id === 'note' ? 340 : id === 'scope' ? 110 : 100,
                },
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
