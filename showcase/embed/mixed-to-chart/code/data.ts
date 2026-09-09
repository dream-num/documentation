import type { IBaseSnapshot, IWorkbookData, IWorksheetData } from '@univerjs/core'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  LocaleType,
} from '@univerjs/core'

export const HOST_ID = 'prism-income-comparison'
export const SOURCE_ID = 'prism-income-register'
export const SOURCE_NAME = 'Prism Income'
export const SHEET_ID = 'comparison'
export const CHANNELS = ['Membership', 'Workshops', 'Editions'] as const
export const RECORDS = [
  ['member-renewals', 'Autumn renewals', 'September', 'Membership', 'Confirmed', 12800, 'Mara', 'Returning supporters'],
  ['member-new', 'New memberships', 'September', 'Membership', 'Confirmed', 9000, 'Mara', 'New learning community'],
  [
    'workshop-evening',
    'Evening workshops',
    'September',
    'Workshops',
    'Confirmed',
    11200,
    'Arun',
    'Six hands-on sessions',
  ],
  [
    'workshop-weekend',
    'Weekend workshops',
    'September',
    'Workshops',
    'Confirmed',
    7500,
    'Arun',
    'Two public studio days',
  ],
  [
    'edition-field',
    'Field notebooks',
    'September',
    'Editions',
    'Confirmed',
    8400,
    'June',
    'Illustrated learning notebooks',
  ],
  ['edition-guide', 'Workshop guides', 'September', 'Editions', 'Confirmed', 5600, 'June', 'Small-run printed guides'],
  [
    'draft-workshop',
    'Partner workshop draft',
    'September',
    'Workshops',
    'Draft',
    2900,
    'Arun',
    'Not confirmed; excluded from actual',
  ],
  [
    'draft-edition',
    'Library edition draft',
    'September',
    'Editions',
    'Draft',
    1700,
    'June',
    'Not confirmed; excluded from actual',
  ],
  [
    'august-member',
    'August renewals',
    'August',
    'Membership',
    'Confirmed',
    9600,
    'Mara',
    'Prior period; not September income',
  ],
] as const
const TIME = Date.parse('2029-09-24T09:00:00Z')

export function createSourceData(): IBaseSnapshot {
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Entry', type: BaseFieldType.Text, config: {} },
    {
      id: 'period',
      name: 'Period',
      type: BaseFieldType.SingleSelect,
      config: {
        options: ['September', 'August'].map((name) => ({
          id: name,
          name,
          color: name === 'September' ? '#BDE0E3' : '#DDDAEB',
        })),
      },
    },
    {
      id: 'channel',
      name: 'Channel',
      type: BaseFieldType.SingleSelect,
      config: { options: CHANNELS.map((name, i) => ({ id: name, name, color: ['#BDE0E3', '#E6D3AD', '#DDDAEB'][i] })) },
    },
    {
      id: 'status',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Confirmed', name: 'Confirmed', color: '#BDE0D3' },
          { id: 'Draft', name: 'Draft', color: '#E6D3AD' },
        ],
      },
    },
    { id: 'amount', name: 'Amount', type: BaseFieldType.Number, config: { precision: 2 } },
    { id: 'owner', name: 'Coordinator', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Context', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((f) => f.id)
  const records = Object.fromEntries(
    RECORDS.map(([id, title, period, channel, status, amount, owner, note], i) => [
      id,
      {
        id,
        orderKey: String(i).padStart(3, '0'),
        createdAt: TIME,
        updatedAt: TIME,
        values: { [BASE_RECORD_ID_FIELD_ID]: id, title, period, channel, status, amount, owner, note },
      },
    ]),
  )
  return {
    id: SOURCE_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    schemaVersion: 2,
    createdAt: TIME,
    updatedAt: TIME,
    tableOrder: ['income'],
    tables: {
      income: {
        id: 'income',
        name: 'Income',
        formulaName: 'Income',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['income-grid'],
        views: {
          'income-grid': {
            id: 'income-grid',
            tableId: 'income',
            name: 'Income register',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'title' ? 240 : id === 'note' ? 330 : id === 'amount' ? 140 : 145,
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
const styles: IWorkbookData['styles'] = {
  title: { fs: 24, bl: 1, bg: { rgb: '#172F48' }, cl: { rgb: '#F4DAA2' } },
  header: { bl: 1, bg: { rgb: '#E1EAF3' }, cl: { rgb: '#334E6C' } },
  label: { cl: { rgb: '#334E6C' } },
  muted: { fs: 11, cl: { rgb: '#6B7E8D' } },
  input: { bg: { rgb: '#FFF0D2' }, cl: { rgb: '#805E25' }, bl: 1 },
  inputMoney: { bg: { rgb: '#FFF0D2' }, cl: { rgb: '#805E25' }, n: { pattern: '$#,##0' } },
  actual: { bg: { rgb: '#E0EFF0' }, cl: { rgb: '#287C87' }, n: { pattern: '$#,##0' } },
  plan: { bg: { rgb: '#F8EFD9' }, cl: { rgb: '#876626' }, n: { pattern: '$#,##0' } },
  total: { bg: { rgb: '#288B95' }, cl: { rgb: '#FFFFFF' }, bl: 1, n: { pattern: '$#,##0' } },
  change: { bg: { rgb: '#EDE7F4' }, cl: { rgb: '#6B5585' }, n: { pattern: '$#,##0;($#,##0)' } },
  share: { n: { pattern: '0.0%' }, cl: { rgb: '#287C87' } },
}
function sheet(
  id: string,
  name: string,
  cellData: IWorksheetData['cellData'],
  rows: number,
  widths: number[],
  merged: number[],
) {
  return {
    id,
    name,
    rowCount: rows,
    columnCount: 8,
    defaultRowHeight: 28,
    defaultColumnWidth: 125,
    rowData: { 0: { h: 46 } },
    columnData: Object.fromEntries(widths.map((w, i) => [i, { w }])),
    cellData,
    mergeData: merged.map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 5 })),
  }
}
export function createHostData(): Partial<IWorkbookData> {
  const cells: IWorksheetData['cellData'] = {
    0: { 0: { v: 'PRISM / Actuals need a target and a boundary.', s: 'title' } },
    1: { 0: { v: 'Original fictional learning studio / September 2029 / Illustrative USD amounts', s: 'muted' } },
    3: {
      0: { v: 'Selected period', s: 'header' },
      1: { v: 'September', s: 'input' },
      2: { v: 'Included status', s: 'header' },
      3: { v: 'Confirmed', s: 'input' },
    },
    5: Object.fromEntries(
      ['Channel', 'Actual · Base', 'Target · Sheet', 'Gap to target', 'Attainment', 'Actual mix'].map((v, i) => [
        i,
        { v, s: 'header' },
      ]),
    ),
    10: {
      0: { v: 'Studio total', s: 'header' },
      1: { f: '=SUM(B7:B9)', s: 'total' },
      2: { f: '=SUM(C7:C9)', s: 'plan' },
      3: { f: '=C11-B11', s: 'change' },
      4: { f: '=B11/C11', s: 'share' },
      5: { f: '=SUM(F7:F9)', s: 'share' },
    },
    12: {
      0: {
        v: 'Targets Sheet + Income Base → visible formulas A6:C9 → native comparison chart',
        s: 'muted',
      },
    },
    13: {
      0: {
        v: 'Draft and other-period records are excluded by explicit criteria, not by the Base view filter.',
        s: 'muted',
      },
    },
    28: {
      0: {
        v: 'A positive gap means income is below target. Attainment is not profit, cash flow or a forecast.',
        s: 'muted',
      },
    },
    30: {
      0: {
        v: 'Edit Target plan or Income register. Neither source is replaced when the chart recalculates.',
        s: 'muted',
      },
    },
  }
  const ref = '[Prism Income]!Income'
  CHANNELS.forEach((name, i) => {
    const row = 7 + i
    cells[row - 1] = {
      0: { v: name, s: 'label' },
      1: {
        f:
          '=SUMIFS(' +
          ref +
          '[Amount],' +
          ref +
          '[Channel],A' +
          row +
          ',' +
          ref +
          '[Period],$B$4,' +
          ref +
          '[Status],$D$4)',
        s: 'actual',
      },
      2: { f: "='Target plan'!B" + (i + 5), s: 'plan' },
      3: { f: '=C' + row + '-B' + row, s: 'change' },
      4: { f: '=B' + row + '/C' + row, s: 'share' },
      5: { f: '=B' + row + '/$B$11', s: 'share' },
    }
  })
  const targets: IWorksheetData['cellData'] = {
    0: { 0: { v: 'PRISM / Target envelopes', s: 'title' } },
    1: { 0: { v: 'Planning assumptions, separate from the confirmed-income register', s: 'muted' } },
    3: { 0: { v: 'Channel', s: 'header' }, 1: { v: 'Target', s: 'header' }, 2: { v: 'Planning context', s: 'header' } },
    8: { 0: { v: 'Studio target', s: 'header' }, 1: { f: '=SUM(B5:B7)', s: 'total' } },
    10: { 0: { v: 'Amber amounts are inputs. The comparison and chart read these cells directly.', s: 'muted' } },
    12: {
      0: { v: 'Targets do not modify Base transactions, their statuses or selected periods.', s: 'muted' },
    },
  }
  CHANNELS.forEach((name, i) => {
    targets[i + 4] = {
      0: { v: name, s: 'label' },
      1: { v: [24000, 21000, 15000][i], s: 'inputMoney' },
      2: {
        v: [
          'Support the year-round learning community',
          'Fund small-group public workshops',
          'Publish useful take-home editions',
        ][i],
        s: 'label',
      },
    }
  })
  return {
    id: HOST_ID,
    name: 'Prism / Plan versus actual',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID, 'targets'],
    styles,
    sheets: {
      [SHEET_ID]: sheet(
        SHEET_ID,
        'Plan versus actual',
        cells,
        34,
        [245, 155, 160, 150, 145, 145],
        [0, 1, 12, 13, 28, 30],
      ),
      targets: sheet('targets', 'Target plan', targets, 18, [245, 155, 380, 100, 100, 100], [0, 1, 10, 12]),
    },
  }
}
