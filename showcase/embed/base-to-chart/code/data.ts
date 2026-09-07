import type { IBaseSnapshot, IWorkbookData } from '@univerjs/core'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  LocaleType,
} from '@univerjs/core'

export const HOST_ID = 'moss-demand-comparison'
export const SOURCE_ID = 'moss-demand-register'
export const SOURCE_NAME = 'Moss Support'
export const SHEET_ID = 'comparison'
export const CHANNELS = ['Email', 'Live chat', 'Community']
// Original fictional weekly aggregates, not personal support records.
export const RECORDS = [
  ['week-35-email', 'Email / 27 August', 'Week 35', 'Email', 18, 'Account setup and invitation delivery', 'Nora'],
  ['week-35-chat', 'Chat / 27 August', 'Week 35', 'Live chat', 12, 'First-workspace orientation', 'Eli'],
  ['week-35-community', 'Community / 27 August', 'Week 35', 'Community', 6, 'Template discovery and sharing', 'Sam'],
  ['week-34-email', 'Email / 20 August', 'Week 34', 'Email', 14, 'Billing receipt and export questions', 'Nora'],
  ['week-34-chat', 'Chat / 20 August', 'Week 34', 'Live chat', 10, 'View configuration and navigation', 'Eli'],
  ['week-34-community', 'Community / 20 August', 'Week 34', 'Community', 6, 'Community office-hours follow-ups', 'Sam'],
] as const

export function createSourceData(): IBaseSnapshot {
  const time = Date.parse('2029-08-27T09:00:00Z')
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Weekly entry', type: BaseFieldType.Text, config: {} },
    {
      id: 'week',
      name: 'Week',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Week 35', name: 'Week 35', color: '#BCD6C4' },
          { id: 'Week 34', name: 'Week 34', color: '#EBD8AC' },
        ],
      },
    },
    {
      id: 'channel',
      name: 'Channel',
      type: BaseFieldType.SingleSelect,
      config: {
        options: CHANNELS.map((name, index) => ({ id: name, name, color: ['#BCD6C4', '#CFD7EA', '#E8CFD9'][index] })),
      },
    },
    { id: 'requests', name: 'Requests', type: BaseFieldType.Number, config: { precision: 0 } },
    { id: 'topic', name: 'Main topic', type: BaseFieldType.Text, config: {} },
    { id: 'owner', name: 'Coordinator', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map(({ id }) => id)
  const records = Object.fromEntries(
    RECORDS.map(([id, title, week, channel, requests, topic, owner], index) => [
      id,
      {
        id,
        orderKey: String(index).padStart(3, '0'),
        createdAt: time,
        updatedAt: time,
        values: { [BASE_RECORD_ID_FIELD_ID]: id, title, week, channel, requests, topic, owner },
      },
    ]),
  )
  return {
    id: SOURCE_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    schemaVersion: 2,
    createdAt: time,
    updatedAt: time,
    tableOrder: ['demand'],
    tables: {
      demand: {
        id: 'demand',
        name: 'Demand',
        formulaName: 'Demand',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((field) => [field.id, field])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['demand-grid'],
        views: {
          'demand-grid': {
            id: 'demand-grid',
            tableId: 'demand',
            name: 'Weekly demand',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                { hidden: id === BASE_RECORD_ID_FIELD_ID, width: id === 'title' ? 245 : id === 'topic' ? 390 : 135 },
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
  const cells: IWorkbookData['sheets'][string]['cellData'] = {
    0: { 0: { v: 'MOSS / Read the demand, not just the total.', s: 'title' } },
    1: { 0: { v: 'Support studio / 27 August 2029 / Original fictional weekly aggregates', s: 'muted' } },
    3: {
      0: { v: 'Selected week', s: 'header' },
      1: { v: 'Week 35', s: 'input' },
      2: { v: 'Comparison week', s: 'header' },
      3: { v: 'Week 34', s: 'input' },
    },
    5: Object.fromEntries(
      ['Channel', 'Selected', 'Comparison', 'Change', 'Selected share', 'Growth'].map((v, i) => [
        i,
        { v, s: 'header' },
      ]),
    ),
    10: {
      0: { v: 'All channels', s: 'header' },
      1: { f: '=SUM(B7:B9)', s: 'total' },
      2: { f: '=SUM(C7:C9)', s: 'comparison' },
      3: { f: '=B11-C11', s: 'change' },
      4: { f: '=SUM(E7:E9)', s: 'share' },
      5: { f: '=D11/C11', s: 'share' },
    },
    12: { 0: { v: 'Base records → SUMIFS by week and channel → Visible range A6:C9 → Native chart', s: 'muted' } },
    13: {
      0: {
        v: 'Select Demand register to edit counts. Change an amber week label to change the comparison.',
        s: 'muted',
      },
    },
    14: {
      0: {
        v: 'A Base view filter changes visible records, not these whole-table formulas. Empty denominators retain native errors.',
        s: 'muted',
      },
    },
    30: {
      0: {
        v: 'Counts describe demand, not resolution time, satisfaction or individual customer behavior.',
        s: 'muted',
      },
    },
  }
  const reference = '[Moss Support]!Demand'
  CHANNELS.forEach((name, i) => {
    const row = 7 + i
    const sum = (week: string) =>
      '=SUMIFS(' +
      reference +
      '[Requests],' +
      reference +
      '[Channel],A' +
      row +
      ',' +
      reference +
      '[Week],' +
      week +
      ')'
    cells[row - 1] = {
      0: { v: name, s: 'label' },
      1: { f: sum('$B$4'), s: 'selected' },
      2: { f: sum('$D$4'), s: 'comparison' },
      3: { f: '=B' + row + '-C' + row, s: 'change' },
      4: { f: '=B' + row + '/$B$11', s: 'share' },
      5: { f: '=D' + row + '/C' + row, s: 'share' },
    }
  })
  return {
    id: HOST_ID,
    name: 'Moss / Support demand',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 24, bl: 1, bg: { rgb: '#183C32' }, cl: { rgb: '#EBCF8C' } },
      header: { bl: 1, bg: { rgb: '#E6EBDC' }, cl: { rgb: '#284F41' } },
      label: { cl: { rgb: '#284F41' } },
      muted: { fs: 11, cl: { rgb: '#667769' } },
      input: { bg: { rgb: '#FFF0CE' }, cl: { rgb: '#73531D' }, bl: 1 },
      selected: { bg: { rgb: '#DEEEE4' }, cl: { rgb: '#286B54' }, n: { pattern: '0' } },
      comparison: { bg: { rgb: '#F7EEDB' }, cl: { rgb: '#8C662C' }, n: { pattern: '0' } },
      total: { bg: { rgb: '#397D69' }, cl: { rgb: '#FFFFFF' }, bl: 1, n: { pattern: '0' } },
      change: { bg: { rgb: '#ECE7F2' }, cl: { rgb: '#715B8B' }, n: { pattern: '+0;-0;0' } },
      share: { n: { pattern: '0.0%' }, cl: { rgb: '#397D69' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Demand comparison',
        rowCount: 34,
        columnCount: 8,
        defaultRowHeight: 29,
        defaultColumnWidth: 125,
        rowData: { 0: { h: 46 } },
        columnData: { 0: { w: 240 }, 1: { w: 140 }, 2: { w: 170 }, 3: { w: 150 }, 4: { w: 150 }, 5: { w: 150 } },
        cellData: cells,
        mergeData: [0, 1, 12, 13, 14, 30].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 5 })),
      },
    },
  }
}
