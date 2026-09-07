import type { ICellData, IWorkbookData } from '@univerjs/presets'

export const FIXTURE_CLOCK = '2027-03-31T09:00:00Z'
export const SHEET_ID = 'orders'
export const QUARTERS = Array.from({ length: 4 }, (_, q) => ({
  label: 'Q' + (q + 1),
  summary: 1 + q * 34,
  start: 2 + q * 34,
  end: 34 + q * 34,
  months: Array.from({ length: 3 }, (_month, m) => ({
    label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][q * 3 + m],
    summary: 2 + q * 34 + m * 11,
    start: 3 + q * 34 + m * 11,
    end: 12 + q * 34 + m * 11,
  })),
}))
const header = ['Period / order', 'Region', 'Equipment', 'Scenario', 'Units', 'Rate', 'Amount']
const regions = ['North', 'Coast', 'Highlands', 'South']
const categories = ['Rain shells', 'Trail lamps', 'Tents', 'Water filters', 'Repair kits', 'Snow shoes']
const cellData: Record<number, Record<number, ICellData>> = {}
function row(index: number, values: (string | number | null | ICellData)[], style?: string) {
  cellData[index] = Object.fromEntries(
    values.map((v, col) => [
      col,
      { ...(typeof v === 'object' && v !== null ? v : { v }), ...(style ? { s: style } : {}) },
    ]),
  )
}
row(0, header, 'header')
// Original fictional seasonal equipment orders: 12 months x 10 records, not copied template content.
for (const [q, quarter] of QUARTERS.entries()) {
  row(
    quarter.summary,
    [
      quarter.label + ' · 2027',
      null,
      null,
      null,
      null,
      null,
      { f: '=' + quarter.months.map((m) => 'G' + (m.summary + 1)).join('+') },
    ],
    'quarter',
  )
  for (const [m, month] of quarter.months.entries()) {
    row(
      month.summary,
      [
        month.label + ' · 10 orders',
        null,
        null,
        null,
        null,
        null,
        { f: '=SUM(G' + (month.start + 1) + ':G' + (month.end + 1) + ')' },
      ],
      'month',
    )
    for (let n = 0; n < 10; n++) {
      const ordinal = (q * 3 + m) * 10 + n
      const r = month.start + n
      row(r, [
        'AL-' + String(ordinal + 1).padStart(3, '0'),
        regions[(n + q) % regions.length],
        categories[(n + m + q) % categories.length],
        n % 3 === 0 ? 'Plan' : 'Actual',
        ordinal % 17 === 0 ? 0 : 3 + ((ordinal * 7) % 39),
        12 + ((ordinal * 11) % 88),
        { f: '=E' + (r + 1) + '*F' + (r + 1) },
      ])
    }
  }
}
export function createFixture(empty = false): Partial<IWorkbookData> {
  return {
    id: 'alder-seasonal-orders',
    name: 'Alder seasonal equipment',
    sheetOrder: [SHEET_ID],
    styles: {
      header: { bl: 1, bg: { rgb: '#dbeafe' } },
      quarter: { bl: 1, bg: { rgb: '#d1fae5' } },
      month: { bl: 1, bg: { rgb: '#f1f5f9' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Seasonal orders',
        rowCount: empty ? 20 : 137,
        columnCount: 7,
        defaultRowHeight: 28,
        rowHeader: { width: 46 },
        columnHeader: { height: 28 },
        columnData: {
          0: { w: 190 },
          1: { w: 115 },
          2: { w: 145 },
          3: { w: 105 },
          4: { w: 80 },
          5: { w: 85 },
          6: { w: 120 },
        },
        cellData: structuredClone(empty ? { 0: cellData[0] } : cellData),
      },
    },
  }
}
