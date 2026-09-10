import type { IBaseSnapshot, IFieldSnapshot, IWorkbookData } from '@univerjs/core'
import { normalizeBaseDateSerial } from '@univerjs-pro/bases'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  LocaleType,
} from '@univerjs/core'

export const HOST_ID = 'atlas-campaign-spend'
export const CHILD_ID = 'atlas-campaign-work'
export const SHEET_ID = 'campaign-budget'
const REVIEW_TIME = Date.parse('2027-06-07T09:00:00Z')
const CHANNELS = [
  ['Search', 4800, 4320],
  ['Partners', 2400, 1800],
  ['Workshops', 3500, 3750],
  ['Newsletter', 1200, 860],
  ['Print', 1800, 1440],
  ['Contingency', 1300, 0],
] as const

// Original fictional tasks: local text owners are not a directory or a collaboration service.
const TASKS = [
  ['Approve search landing copy', 'review', 'Nora Chen', 2, 'Search', 'Legal must approve the savings claim.'],
  [
    'Confirm accessible workshop venue',
    'blocked',
    'Malik Jones',
    1,
    'Workshops',
    'Step-free entrance still unconfirmed.',
  ],
  ['Prepare partner referral kit', 'active', 'Ines Silva', 4, 'Partners', 'Three partners need different co-branding.'],
  ['Test newsletter preference link', 'done', 'Theo Park', 0, 'Newsletter', 'Tested opt-out and plain-text version.'],
  [
    'Proof bilingual neighbourhood flyers',
    'review',
    'Jules Martin',
    3,
    'Print',
    'Check address and QR destination in both languages.',
  ],
  [
    'Publish facilitator briefing',
    'planned',
    'Malik Jones',
    5,
    'Workshops',
    'Include quiet-room and hearing-loop guidance.',
  ],
  [
    'Audit campaign tracking tags',
    'active',
    'Theo Park',
    2,
    'Search',
    'Exclude internal staff traffic from reporting.',
  ],
  ['Close supplier invoice checklist', 'planned', 'Nora Chen', 8, 'Operations', 'A commitment is not a paid invoice.'],
] as const

export function createChildData(): IBaseSnapshot {
  const fields: IFieldSnapshot[] = [
    createBaseRecordIdField(),
    { id: 'task', name: 'Deliverable', type: BaseFieldType.Text, config: {} },
    {
      id: 'status',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'planned', name: 'Planned', color: '#64748B' },
          { id: 'active', name: 'In progress', color: '#287B83' },
          { id: 'review', name: 'In review', color: '#B27A24' },
          { id: 'blocked', name: 'Blocked', color: '#B95743' },
          { id: 'done', name: 'Ready', color: '#53856B' },
        ],
      },
    },
    { id: 'owner', name: 'Owner / local text', type: BaseFieldType.Text, config: {} },
    { id: 'due', name: 'Due', type: BaseFieldType.Date, config: { pattern: 'mmm d', includeTime: false } },
    { id: 'channel', name: 'Channel', type: BaseFieldType.Text, config: {} },
    { id: 'evidence', name: 'Next evidence', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map(({ id }) => id)
  const records = Object.fromEntries(
    TASKS.map(([task, status, owner, day, channel, evidence], index) => {
      const id = `deliverable-${index + 1}`
      return [
        id,
        {
          id,
          orderKey: String(index).padStart(3, '0'),
          createdAt: REVIEW_TIME,
          updatedAt: REVIEW_TIME,
          values: {
            [BASE_RECORD_ID_FIELD_ID]: id,
            task,
            status,
            owner,
            due: normalizeBaseDateSerial(REVIEW_TIME + day * 86400000),
            channel,
            evidence,
          },
        },
      ]
    }),
  )
  return {
    id: CHILD_ID,
    name: 'Atlas / Campaign owners',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['deliverables'],
    tables: {
      deliverables: {
        id: 'deliverables',
        name: 'Launch deliverables',
        formulaName: 'deliverables',
        primaryFieldId: 'task',
        fields: Object.fromEntries(fields.map((field) => [field.id, field])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['delivery-grid'],
        views: {
          'delivery-grid': {
            id: 'delivery-grid',
            tableId: 'deliverables',
            name: 'Campaign readiness',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'task' ? 245 : id === 'evidence' ? 300 : id === 'due' ? 95 : 135,
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

export function createHostData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'ATLAS / Community launch', s: 'title' } },
    1: { 0: { v: 'Campaign review · 7 June 2027 · fictional USD commitments', s: 'muted' } },
    3: { 0: { v: 'Channel', s: 'header' }, 1: { v: 'Plan / USD', s: 'header' }, 2: { v: 'Committed', s: 'header' } },
    11: { 0: { v: 'Total', s: 'header' }, 1: { f: '=SUM(B5:B10)', s: 'total' }, 2: { f: '=SUM(C5:C10)', s: 'total' } },
    13: { 0: { v: 'Available budget', s: 'header' }, 1: { f: '=B12-C12', s: 'total' } },
    15: { 0: { v: 'Committed / plan', s: 'muted' }, 1: { f: '=C12/B12', s: 'percent' } },
    18: { 0: { v: 'SPEND IS NOT READINESS', s: 'section' } },
    20: { 0: { f: '="Workshop variance: $"&(C7-B7)', s: 'warning' } },
    22: { 0: { v: 'Double-click the Base to edit owners.', s: 'muted' } },
    23: { 0: { v: 'A ready task does not pay an invoice.', s: 'muted' } },
    25: { 0: { v: 'Budget formulas and Base records are independent.', s: 'muted' } },
    26: { 0: { v: 'No ad network, approval service or backend.', s: 'muted' } },
  }
  CHANNELS.forEach(([channel, planned, committed], index) => {
    cellData[index + 4] = {
      0: { v: channel, s: index % 2 ? 'stripe' : 'body' },
      1: { v: planned, s: 'money' },
      2: { v: committed, s: index === 2 ? 'overrun' : 'money' },
    }
  })
  return {
    id: HOST_ID,
    name: 'Atlas / Campaign spend',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-rc.0',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 22, bl: 1, cl: { rgb: '#164C57' } },
      section: { fs: 15, bl: 1, cl: { rgb: '#164C57' } },
      header: { bg: { rgb: '#DCEFF0' }, bl: 1, cl: { rgb: '#164C57' } },
      body: { cl: { rgb: '#354950' } },
      stripe: { bg: { rgb: '#F0F7F6' } },
      muted: { cl: { rgb: '#67787E' }, fs: 10 },
      money: { n: { pattern: '#,##0' }, cl: { rgb: '#354950' } },
      total: { n: { pattern: '#,##0' }, bg: { rgb: '#E5F2EE' }, cl: { rgb: '#22685C' }, bl: 1 },
      percent: { n: { pattern: '0.0%' }, cl: { rgb: '#22685C' } },
      overrun: { n: { pattern: '#,##0' }, bg: { rgb: '#FBE6DA' }, cl: { rgb: '#AA5634' }, bl: 1 },
      warning: { cl: { rgb: '#AA5634' }, fs: 11 },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Campaign budget',
        rowCount: 50,
        columnCount: 15,
        defaultRowHeight: 28,
        defaultColumnWidth: 100,
        columnData: { 0: { w: 170 }, 1: { w: 100 }, 2: { w: 110 } },
        cellData,
        mergeData: [0, 1, 18, 20, 22, 23, 25, 26].map((row) => ({
          startRow: row,
          endRow: row,
          startColumn: 0,
          endColumn: row < 2 ? 11 : 2,
        })),
      },
    },
  }
}
