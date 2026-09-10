import type { BaseCellValue, IBaseSnapshot, IFieldSnapshot, ITableSnapshot, IWorkbookData } from '@univerjs/core'
import { serializeRecordLinkIds } from '@univerjs-pro/bases'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  LocaleType,
} from '@univerjs/core'

export const HOST_ID = 'acorn-sales-pipeline'
export const CHILD_ID = 'acorn-weighted-forecast'
export const SHEET_ID = 'forecast'
const REVIEW_TIME = Date.parse('2027-10-19T09:00:00Z')
const DEALS = [
  ['Maple / Refill stations', 'Qualified', 32000, 'Maya', 1, 'Confirm site count'],
  ['Canal / Library lockers', 'Proposal', 18500, 'Owen', 2, 'Review access needs'],
  ['River / Clinic storage', 'Negotiation', 45000, 'Imani', 3, 'Agree installation window'],
  ['Dune / Studio fit-out', 'Prospect', 12000, 'Maya', 4, 'Arrange discovery call'],
  ['Orchard / Lab benches', 'Proposal', 64000, 'Imani', 3, 'Check material sample'],
  ['North / School shelving', 'Qualified', 27500, 'Owen', 2, 'Validate room dimensions'],
  ['Moss / Cafe return bar', 'Prospect', 9000, 'Maya', 1, 'Explore return workflow'],
  ['Cedar / Shared storage', 'Negotiation', 78000, 'Imani', 4, 'Review service scope'],
  ['Peak / Museum displays', 'Proposal', 36000, 'Owen', 2, 'Compare modular layouts'],
  ['Bay / Workshop cabinets', 'Qualified', 16500, 'Maya', 4, 'Confirm tool inventory'],
] as const
const STAGES = [
  { name: 'Prospect', weight: 0.15, color: '#7E72A8', note: 'Interest recorded; needs not yet validated' },
  { name: 'Qualified', weight: 0.4, color: '#39848D', note: 'Scope discussed; no proposal accepted' },
  { name: 'Proposal', weight: 0.65, color: '#B78547', note: 'Written scope shared; price still open' },
  { name: 'Negotiation', weight: 0.85, color: '#50679E', note: 'Commercial details under discussion' },
] as const
const field = (id: string, name: string, type: BaseFieldType, config = {}): IFieldSnapshot => ({
  id,
  name,
  type,
  config,
})
function table(
  id: string,
  name: string,
  definitions: IFieldSnapshot[],
  rows: Record<string, BaseCellValue>[],
): ITableSnapshot {
  const fields = [createBaseRecordIdField(), ...definitions]
  const fieldOrder = fields.map((item) => item.id)
  const records = Object.fromEntries(
    rows.map((values, index) => {
      const recordId = `${id}-${index + 1}`
      return [
        recordId,
        {
          id: recordId,
          orderKey: String(index).padStart(3, '0'),
          createdAt: REVIEW_TIME,
          updatedAt: REVIEW_TIME,
          values: { [BASE_RECORD_ID_FIELD_ID]: recordId, ...values },
        },
      ]
    }),
  )
  return {
    id,
    name,
    formulaName: id,
    primaryFieldId: 'title',
    fields: Object.fromEntries(fields.map((item) => [item.id, item])),
    fieldOrder,
    records,
    recordOrder: Object.keys(records),
    viewOrder: [`${id}-grid`],
    views: {
      [`${id}-grid`]: {
        id: `${id}-grid`,
        tableId: id,
        name: id === 'deals' ? 'October review' : 'Customer groups',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((fieldId) => [
            fieldId,
            {
              hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
              width: fieldId === 'title' ? 230 : fieldId === 'next' ? 240 : fieldId === 'account' ? 180 : 135,
            },
          ]),
        ),
        filter: null,
        sort: [],
        group: [],
        config: { rowHeight: 'medium', showRecordIndex: true, frozenFieldCount: 1 },
      },
    },
  }
}
export function createHostData(): IBaseSnapshot {
  const accounts = table(
    'accounts',
    'Accounts',
    [
      field('title', 'Customer group', BaseFieldType.Text),
      field('sector', 'Sector', BaseFieldType.Text),
      field('next', 'Relationship context', BaseFieldType.Text),
    ],
    [
      { title: 'Local Retail', sector: 'Retail and hospitality', next: 'Small sites; repeatable installation' },
      { title: 'Public Learning', sector: 'Education and culture', next: 'Access and procurement review' },
      { title: 'Care and Research', sector: 'Health and research', next: 'Material and cleaning requirements' },
      { title: 'Shared Spaces', sector: 'Housing and workshops', next: 'Shared access; varied storage needs' },
    ],
  )
  const deals = table(
    'deals',
    'Opportunities',
    [
      field('title', 'Opportunity', BaseFieldType.Text),
      field('stage', 'Stage', BaseFieldType.SingleSelect, {
        options: STAGES.map((stage) => ({ id: stage.name, name: stage.name, color: stage.color })),
      }),
      field('amount', 'Value / USD', BaseFieldType.Currency, {
        decimalPlaces: 0,
        currencySymbol: '$',
        useThousands: true,
        separatorStyle: 'commaPeriod',
      }),
      field('account', 'Customer group', BaseFieldType.RecordLink, {
        targetTableId: 'accounts',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('owner', 'Owner', BaseFieldType.Text),
      field('next', 'Next conversation', BaseFieldType.Text),
    ],
    DEALS.map(([title, stage, amount, owner, account, next]) => ({
      title,
      stage,
      amount,
      owner,
      account: serializeRecordLinkIds([`accounts-${account}`]),
      next,
    })),
  )
  return {
    id: HOST_ID,
    name: 'Acorn / October opportunity review',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['deals', 'accounts'],
    tables: { deals, accounts },
  }
}

export function createChildData(): Partial<IWorkbookData> {
  const cells: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'ACORN / A forecast, not a promise', s: 'title' } },
    1: { 0: { v: '19 OCT 2027 / Fictional USD values / Independent what-if snapshot', s: 'muted' } },
    3: Object.fromEntries(
      ['Opportunity', 'Stage', 'Value / USD', 'Weight', 'Weighted / USD'].map((v, i) => [i, { v, s: 'header' }]),
    ),
    14: {
      0: { v: 'PIPELINE TOTAL', s: 'header' },
      2: { f: '=SUM(C5:C14)', s: 'total' },
      4: { f: '=SUM(E5:E14)', s: 'total' },
    },
    17: { 0: { v: 'Sand = editable values. Change stage weights on Assumptions.', s: 'muted' } },
    19: {
      0: {
        v: 'Base edits do not sync here. This workbook starts from the same authored deals.',
        s: 'muted',
      },
    },
    21: { 0: { v: 'Weighted pipeline is a planning scenario, not booked revenue or an order.', s: 'muted' } },
  }
  DEALS.forEach(([title, stage, amount], index) => {
    const row = index + 4
    cells[row] = {
      0: { v: title, s: index % 2 ? 'stripe' : 'body' },
      1: { v: stage, s: index % 2 ? 'stripe' : 'body' },
      2: { v: amount, s: 'inputMoney' },
      3: { f: `=VLOOKUP(B${row + 1},Assumptions!$A$4:$B$7,2,FALSE)`, s: 'percent' },
      4: { f: `=ROUND(C${row + 1}*D${row + 1},2)`, s: 'money' },
    }
  })
  const assumptions: typeof cells = {
    0: { 0: { v: 'ACORN / Make the uncertainty visible', s: 'title' } },
    2: Object.fromEntries(['Stage', 'Weight', 'Working interpretation'].map((v, i) => [i, { v, s: 'header' }])),
    9: { 0: { v: 'Weighted pipeline / USD', s: 'body' }, 1: { f: '=Forecast!E15', s: 'total' } },
    10: { 0: { v: 'Working target / USD', s: 'body' }, 1: { v: 210000, s: 'inputMoney' } },
    11: { 0: { v: 'Gap to target / USD', s: 'header' }, 1: { f: '=B11-B10', s: 'total' } },
    14: { 0: { v: 'Try Qualified at 50%, then 0%. Its three opportunities recalculate together.', s: 'muted' } },
    16: { 0: { v: 'These probabilities are illustrative, not calibrated predictions.', s: 'muted' } },
    18: { 0: { v: 'No customer messages, invoices, approvals or CRM synchronization.', s: 'muted' } },
  }
  STAGES.forEach((stage, index) => {
    assumptions[index + 3] = {
      0: { v: stage.name, s: index % 2 ? 'stripe' : 'body' },
      1: { v: stage.weight, s: 'inputPercent' },
      2: { v: stage.note, s: 'body' },
    }
  })
  return {
    id: CHILD_ID,
    name: 'Acorn / Weighted forecast',
    appVersion: '1.0.0-rc.0',
    locale: LocaleType.EN_US,
    sheetOrder: [SHEET_ID, 'assumptions'],
    styles: {
      title: { fs: 20, bl: 1, cl: { rgb: '#303C64' } },
      header: { bg: { rgb: '#303C64' }, cl: { rgb: '#FFFFFF' }, bl: 1 },
      body: { cl: { rgb: '#344C59' } },
      stripe: { bg: { rgb: '#EEF3F5' }, cl: { rgb: '#344C59' } },
      muted: { fs: 11, cl: { rgb: '#68758B' } },
      inputMoney: { bg: { rgb: '#F4D6B1' }, cl: { rgb: '#66492B' }, n: { pattern: '#,##0' } },
      inputPercent: { bg: { rgb: '#F4D6B1' }, cl: { rgb: '#66492B' }, n: { pattern: '0%' } },
      percent: { bg: { rgb: '#EAE4F2' }, cl: { rgb: '#65537D' }, n: { pattern: '0%' } },
      money: { cl: { rgb: '#227C7E' }, n: { pattern: '#,##0.00' } },
      total: { bg: { rgb: '#CBE5E1' }, cl: { rgb: '#215F62' }, bl: 1, n: { pattern: '#,##0.00' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Forecast',
        rowCount: 35,
        columnCount: 8,
        defaultRowHeight: 31,
        defaultColumnWidth: 110,
        columnData: { 0: { w: 245 }, 1: { w: 135 }, 2: { w: 140 }, 3: { w: 105 }, 4: { w: 155 } },
        cellData: cells,
        mergeData: [0, 1, 17, 19, 21].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
      assumptions: {
        id: 'assumptions',
        name: 'Assumptions',
        rowCount: 30,
        columnCount: 7,
        defaultRowHeight: 33,
        defaultColumnWidth: 120,
        columnData: { 0: { w: 245 }, 1: { w: 140 }, 2: { w: 395 } },
        cellData: assumptions,
        mergeData: [0, 14, 16, 18].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 2 })),
      },
    },
  }
}
