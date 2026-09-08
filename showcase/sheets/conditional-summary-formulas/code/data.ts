import type { ICellData, IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const cellData: Record<number, Record<number, ICellData>> = {}
  const put = (row: number, col: number, value: string | number, color = '#FFFFFF') => {
    cellData[row] ??= {}
    cellData[row][col] = {
      ...(typeof value === 'string' && value.startsWith('=') ? { f: value } : { v: value }),
      s: { bg: { rgb: color }, cl: { rgb: '#243B35' } },
    }
  }
  put(0, 0, 'Conditional summaries')
  put(1, 0, 'Edit the order data or peach criteria. Green results are native formulas.')
  const orders = [
    ['Region', 'Item', 'Status', 'Units', 'Amount'],
    ['North', 'Notebooks', 'Shipped', 12, 96],
    ['South', 'Notebooks', 'Pending', 8, 64],
    ['North', 'Pens', 'Shipped', 20, 50],
    ['West', 'Folders', 'Shipped', 5, 30],
    ['South', 'Pens', 'Shipped', 16, 40],
    ['North', 'Notebooks', 'Pending', 10, 80],
    ['West', 'Pens', 'Pending', 4, 10],
    ['North', 'Plan*', 'Shipped', 3, 45],
  ]
  orders.forEach((row, index) => row.forEach((value, col) => put(index + 3, col, value, index ? '#F5F7F4' : '#D1FAE5')))
  const queries = [
    ['Comparison', 'Criterion', 'Live result'],
    ['SUMIF · region', 'North', '=SUMIF(A5:A12,H5,E5:E12)'],
    ['SUMIFS · region + shipped', 'North', '=SUMIFS(E5:E12,A5:A12,H6,C5:C12,"Shipped")'],
    ['COUNTIFS · amount at least', 50, '=COUNTIFS(E5:E12,">="&H7)'],
    ['AVERAGEIF · region', 'North', '=AVERAGEIF(A5:A12,H8,E5:E12)'],
    ['COUNTIF · one character', 'Pen?', '=COUNTIF(B5:B12,H9)'],
    ['COUNTIF · any suffix', 'Notebook*', '=COUNTIF(B5:B12,H10)'],
    ['COUNTIF · literal asterisk', 'Plan~*', '=COUNTIF(B5:B12,H11)'],
    ['SUMIF · no matches', 'East', '=SUMIF(A5:A12,H12,E5:E12)'],
    ['AVERAGEIF · fallback', 'East', '=IFERROR(AVERAGEIF(A5:A12,H13,E5:E12),"No matches")'],
  ]
  queries.forEach((row, index) =>
    row.forEach((value, col) => put(index + 3, col + 6, value, index && col === 1 ? '#FFEDD5' : '#D1FAE5')),
  )
  put(15, 0, 'SUMIFS combines criteria with AND. The amount threshold concatenates an operator and a cell value.')
  put(16, 0, '? matches one character; * matches any suffix; ~* matches a literal asterisk in Plan*.')
  put(17, 0, 'No-match sums return zero. A no-match average is an error; IFERROR supplies an explicit fallback.')
  for (const col of [0, 1, 2, 3, 4, 6, 7, 8]) {
    cellData[3][col].s = { bl: 1, bg: { rgb: '#14532D' }, cl: { rgb: '#FFFFFF' } }
  }
  cellData[0][0].s = { fs: 22, bl: 1, cl: { rgb: '#14532D' } }
  return {
    id: 'conditional-summary-lab',
    name: 'Conditional summaries',
    locale: LocaleType.EN_US,
    sheetOrder: ['orders'],
    sheets: {
      orders: {
        id: 'orders',
        name: 'Criteria and summaries',
        rowCount: 26,
        columnCount: 12,
        defaultRowHeight: 32,
        defaultColumnWidth: 100,
        columnData: {
          0: { w: 95 },
          1: { w: 130 },
          2: { w: 105 },
          3: { w: 70 },
          4: { w: 85 },
          5: { w: 24 },
          6: { w: 260 },
          7: { w: 135 },
          8: { w: 140 },
        },
        rowData: { 0: { h: 44 }, 1: { h: 36 } },
        mergeData: [0, 1, 15, 16, 17].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 8 })),
        cellData,
      },
    },
  }
}
