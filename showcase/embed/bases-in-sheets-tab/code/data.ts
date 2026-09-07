import type { BaseCellValue, IBaseSnapshot, IFieldSnapshot, ITableSnapshot, IWorkbookData } from '@univerjs/core'
import { normalizeBaseDateSerial, serializeRecordLinkIds } from '@univerjs-pro/bases'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  createBaseRecordIdField,
  LocaleType,
} from '@univerjs/core'

export const HOST_ID = 'willow-landed-cost'
export const CHILD_ID = 'willow-supplier-operations'
export const SHEET_ID = 'landed-cost'
const REVIEW_TIME = Date.parse('2027-09-09T09:00:00Z')
const ORDERS = [
  ['Seabrook Looms', 'Canvas totes', 500, 24, 450, 80],
  ['Fenn Packaging', 'Gift cartons', 800, 3.2, 120, 60],
  ['Morrow Ceramics', 'Stoneware mugs', 360, 18, 340, 75],
  ['Kite Lighting', 'Desk lamps', 240, 42, 520, 110],
  ['Bracken Textiles', 'Tea towels', 600, 6.5, 180, 90],
  ['Oriole Labels', 'Woven labels', 1000, 1.8, 95, 45],
] as const
const field = (id: string, name: string, type: BaseFieldType, config = {}): IFieldSnapshot => ({
  id,
  name,
  type,
  config,
})
const status = field('status', 'Review state', BaseFieldType.SingleSelect, {
  options: [
    { id: 'ready', name: 'Ready', color: '#4A826D' },
    { id: 'review', name: 'In review', color: '#A67734' },
    { id: 'waiting', name: 'Waiting', color: '#8F4F69' },
    { id: 'blocked', name: 'Blocked', color: '#BC5E48' },
  ],
})
const date = field('due', 'Next review', BaseFieldType.Date, { pattern: 'yyyy-mm-dd', includeTime: false })

function table(
  id: string,
  name: string,
  definitions: IFieldSnapshot[],
  rows: Record<string, BaseCellValue>[],
): ITableSnapshot {
  const fields = [createBaseRecordIdField(), ...definitions]
  const fieldOrder = fields.map((definition) => definition.id)
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
    fields: Object.fromEntries(fields.map((definition) => [definition.id, structuredClone(definition)])),
    fieldOrder,
    records,
    recordOrder: Object.keys(records),
    viewOrder: [`${id}-grid`],
    views: {
      [`${id}-grid`]: {
        id: `${id}-grid`,
        tableId: id,
        name: id === 'suppliers' ? 'Supplier directory' : 'Follow-up queue',
        type: BaseViewType.Grid,
        fieldOrder,
        fieldSettings: Object.fromEntries(
          fieldOrder.map((fieldId) => [
            fieldId,
            {
              hidden: fieldId === BASE_RECORD_ID_FIELD_ID,
              width: fieldId === 'title' ? 245 : fieldId === 'notes' ? 310 : fieldId === 'supplier' ? 200 : 145,
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

export function createChildData(): IBaseSnapshot {
  const terms = [
    '30% deposit / balance before shipment',
    'Net 30 after acceptance',
    '50% deposit / balance at dispatch',
    'Net 15 after inspection',
    '20% deposit / balance on receipt',
    'Net 30 after acceptance',
  ]
  const notes = [
    'Confirm recycled-fibre evidence before the material claim.',
    'Proof the inner carton dimensions against the mug sample.',
    'Two glaze samples have different colour temperatures.',
    'The safety report must match this exact lamp revision.',
    'Check colourfastness after the second wash.',
    'Approve legibility at the final woven-label size.',
  ]
  const suppliers = table(
    'suppliers',
    'Suppliers',
    [
      field('title', 'Supplier', BaseFieldType.Text),
      status,
      field('terms', 'Payment terms', BaseFieldType.Text),
      date,
      field('contact', 'Contact role', BaseFieldType.Text),
      field('notes', 'Decision note', BaseFieldType.Text),
    ],
    ORDERS.map(([title], index) => ({
      title,
      status: ['review', 'ready', 'waiting', 'blocked', 'review', 'ready'][index],
      terms: terms[index],
      due: normalizeBaseDateSerial(REVIEW_TIME + [1, 4, 2, 0, 6, 7][index] * 86400000),
      contact: [
        'Account lead',
        'Packaging coordinator',
        'Studio manager',
        'Compliance lead',
        'Production planner',
        'Print coordinator',
      ][index],
      notes: notes[index],
    })),
  )
  const actions = [
    ['Request fibre evidence', 1, 'Elena Rossi', 'waiting', 1],
    ['Approve carton fit', 2, 'Samir Khan', 'review', 4],
    ['Choose final glaze sample', 3, 'Mina Cho', 'waiting', 2],
    ['Verify lamp report revision', 4, 'Elena Rossi', 'blocked', 0],
    ['Confirm wash-test result', 5, 'Noah Bell', 'review', 6],
    ['Approve label legibility', 6, 'Mina Cho', 'ready', 7],
    ['Book consolidated collection', 1, 'Samir Khan', 'waiting', 8],
    ['Confirm replacement allowance', 3, 'Noah Bell', 'review', 5],
  ] as const
  const followups = table(
    'followups',
    'Follow-ups',
    [
      field('title', 'Follow-up', BaseFieldType.Text),
      field('supplier', 'Supplier', BaseFieldType.RecordLink, {
        targetTableId: 'suppliers',
        multiple: false,
        displayFieldId: 'title',
      }),
      field('owner', 'Owner', BaseFieldType.Text),
      status,
      date,
    ],
    actions.map(([title, supplier, owner, state, day]) => ({
      title,
      supplier: serializeRecordLinkIds([`suppliers-${supplier}`]),
      owner,
      status: state,
      due: normalizeBaseDateSerial(REVIEW_TIME + day * 86400000),
    })),
  )
  return {
    id: CHILD_ID,
    name: 'Willow / Supplier operations',
    locale: LocaleType.EN_US,
    schemaVersion: 1,
    createdAt: REVIEW_TIME,
    updatedAt: REVIEW_TIME,
    tableOrder: ['suppliers', 'followups'],
    tables: { suppliers, followups },
  }
}

export function createHostData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'WILLOW / Autumn collection', s: 'title' } },
    1: { 0: { v: 'Landed-cost planning · 9 September 2027 · original fictional USD estimates', s: 'muted' } },
    3: Object.fromEntries(
      ['Supplier', 'Item', 'Units', 'Unit price', 'Freight', 'Handling', 'Landed total', 'Per unit'].map((v, index) => [
        index,
        { v, s: 'header' },
      ]),
    ),
    11: {
      0: { v: 'Collection total', s: 'header' },
      2: { f: '=SUM(C5:C10)', s: 'total' },
      6: { f: '=SUM(G5:G10)', s: 'total' },
    },
    14: { 0: { v: 'A QUOTE IS NOT A SUPPLIER SIGN-OFF', s: 'section' } },
    16: { 0: { v: 'Open Supplier operations for payment terms, review states and linked follow-ups.', s: 'muted' } },
    18: {
      0: {
        v: 'Freight and handling are editable planning allowances; all unit quotes are already in USD.',
        s: 'muted',
      },
    },
    19: { 0: { v: 'This model excludes tax, duties, insurance and foreign-exchange conversion.', s: 'muted' } },
    21: { 0: { v: 'Cost formulas do not approve samples or update independent Base records.', s: 'muted' } },
  }
  ORDERS.forEach(([supplier, item, units, price, freight, handling], index) => {
    const row = index + 4,
      n = row + 1
    cellData[row] = {
      0: { v: supplier, s: index % 2 ? 'stripe' : 'body' },
      1: { v: item },
      2: { v: units },
      3: { v: price, s: 'money' },
      4: { v: freight, s: 'input' },
      5: { v: handling, s: 'money' },
      6: { f: `=C${n}*D${n}+E${n}+F${n}`, s: 'money' },
      7: { f: `=G${n}/C${n}`, s: 'money' },
    }
  })
  return {
    id: HOST_ID,
    name: 'Willow / Landed-cost review',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID, 'release-checks'],
    styles: {
      title: { fs: 22, bl: 1, cl: { rgb: '#793F59' } },
      section: { fs: 16, bl: 1, cl: { rgb: '#793F59' } },
      header: { bg: { rgb: '#F0E1E8' }, bl: 1, cl: { rgb: '#793F59' } },
      body: { cl: { rgb: '#493D45' } },
      stripe: { bg: { rgb: '#FAF4F7' } },
      muted: { fs: 11, cl: { rgb: '#786E75' } },
      money: { n: { pattern: '#,##0.00' }, cl: { rgb: '#493D45' } },
      total: { bg: { rgb: '#E5F0E8' }, cl: { rgb: '#3F745D' }, bl: 1, n: { pattern: '#,##0' } },
      input: { bg: { rgb: '#FBF0D8' }, cl: { rgb: '#8D6530' }, n: { pattern: '#,##0.00' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Landed cost',
        rowCount: 50,
        columnCount: 15,
        defaultRowHeight: 30,
        defaultColumnWidth: 112,
        columnData: { 0: { w: 185 }, 1: { w: 165 }, 6: { w: 130 } },
        cellData,
        mergeData: [0, 1, 14, 16, 18, 19, 21].map((row) => ({
          startRow: row,
          endRow: row,
          startColumn: 0,
          endColumn: 7,
        })),
      },
      'release-checks': {
        id: 'release-checks',
        name: 'Release checks',
        rowCount: 40,
        columnCount: 10,
        defaultRowHeight: 36,
        defaultColumnWidth: 190,
        columnData: { 0: { w: 250 }, 1: { w: 180 }, 2: { w: 550 } },
        mergeData: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 }],
        cellData: {
          0: { 0: { v: 'WILLOW / Before purchase release', s: 'title' } },
          2: {
            0: { v: 'Gate', s: 'header' },
            1: { v: 'State', s: 'header' },
            2: { v: 'Evidence required', s: 'header' },
          },
          3: {
            0: { v: 'Cost review' },
            1: { f: '="Estimate: $"&\'Landed cost\'!G12', s: 'total' },
            2: { v: 'Confirm all freight allowances before release.' },
          },
          4: {
            0: { v: 'Material claims' },
            1: { v: 'Pending evidence' },
            2: { v: 'Obtain the relevant supplier report, not a general brochure.' },
          },
          5: {
            0: { v: 'Lamp revision' },
            1: { v: 'Blocked' },
            2: { v: 'Match the report to the actual product revision.' },
          },
          6: {
            0: { v: 'Sample approval' },
            1: { v: 'Buyer review' },
            2: { v: 'Retain approved glaze, wash-test and label samples.' },
          },
          8: {
            0: { v: 'No approval backend' },
            2: { v: 'These are authored checks, not an approval or certification service.' },
          },
        },
      },
    },
  }
}
