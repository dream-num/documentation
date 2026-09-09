import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })
export function createWorkbookData(): Partial<IWorkbookData> {
  const cellData: Record<number, Record<number, ICellData>> = {
    0: { 0: { ...text('Database formulas · criteria as cells'), s: { fs: 19, bl: 1, cl: { rgb: '#075985' } } } },
    1: { 0: text('The database includes its header row. Criteria headers must match those field names.') },
    3: Object.fromEntries(
      ['Order', 'Region', 'Status', 'Amount', 'Units'].map((v, c) => [
        c,
        { ...text(v), s: { bl: 1, bg: { rgb: '#E0F2FE' } } },
      ]),
    ),
    2: { 6: { ...text('One criteria row = AND'), s: { bl: 1, cl: { rgb: '#0F766E' } } } },
    4: { 6: text('North'), 7: text('Ready') },
    6: { 6: { ...text('Two criteria rows = OR'), s: { bl: 1, cl: { rgb: '#9A3412' } } } },
    7: {
      6: { ...text('Region'), s: { bl: 1, bg: { rgb: '#FFEDD5' } } },
      7: { ...text('Status'), s: { bl: 1, bg: { rgb: '#FFEDD5' } } },
    },
    8: { 6: text('North'), 7: text('Ready') },
    9: { 6: text('South'), 7: text('Pending') },
    11: {
      6: { ...text('Function'), s: { bl: 1, bg: { rgb: '#E0F2FE' } } },
      7: { ...text('AND result'), s: { bl: 1, bg: { rgb: '#E0F2FE' } } },
      8: { ...text('OR result'), s: { bl: 1, bg: { rgb: '#FFEDD5' } } },
    },
    15: { 0: text('Zero is numeric. Empty is missing. pending is text.') },
    17: { 0: text('DCOUNT: numbers. DCOUNTA: numbers and text. Blank is excluded.') },
    19: { 0: text('G5 → South: AND sum 30, average 15. OR is independent.') },
    20: { 6: text('Field #4 = Amount'), 7: { f: '=DSUM(A4:E12,4,G4:H5)' } },
  }
  cellData[3][6] = { ...text('Region'), s: { bl: 1, bg: { rgb: '#CCFBF1' } } }
  cellData[3][7] = { ...text('Status'), s: { bl: 1, bg: { rgb: '#CCFBF1' } } }
  for (const r of [4, 8, 9]) for (const c of [6, 7]) cellData[r][c].s = { bg: { rgb: '#FEF3C7' } }
  const rows: (string | number | null)[][] = [
    ['Print proof', 'North', 'Ready', 120, 3],
    ['Studio labels', 'North', 'Ready', 0, 2],
    ['Poster run', 'North', 'Pending', 80, 4],
    ['Card packs', 'South', 'Ready', 30, 1],
    ['Rush order', 'South', 'Pending', 90, 6],
    ['Quote requested', 'North', 'Ready', null, 2],
    ['Manual quote', 'North', 'Ready', 'pending', 1],
    ['Return credit', 'South', 'Ready', 0, 0],
  ]
  rows.forEach((row, i) => {
    cellData[i + 4] ??= {}
    row.forEach((v, c) => {
      cellData[i + 4][c] = {
        ...(v === null ? {} : typeof v === 'string' ? text(v) : { v }),
        s: { bg: { rgb: c === 3 ? '#FEF3C7' : '#FFFFFF' } },
      }
    })
  })
  ;['DSUM', 'DAVERAGE', 'DCOUNT', 'DCOUNTA', 'DMAX', 'DMIN'].forEach((fn, i) => {
    cellData[i + 12] ??= {}
    cellData[i + 12][6] = text(fn)
    cellData[i + 12][7] = { f: `=${fn}($A$4:$E$12,"Amount",$G$4:$H$5)`, s: { bg: { rgb: '#F0FDFA' } } }
    cellData[i + 12][8] = { f: `=${fn}($A$4:$E$12,"Amount",$G$8:$H$10)`, s: { bg: { rgb: '#FFF7ED' } } }
  })
  return {
    id: 'database-formula-workbook',
    name: 'Order database criteria',
    locale: LocaleType.EN_US,
    sheetOrder: ['orders'],
    sheets: {
      orders: {
        id: 'orders',
        name: 'Database criteria',
        cellData,
        rowCount: 28,
        columnCount: 10,
        defaultRowHeight: 30,
        defaultColumnWidth: 110,
        columnData: {
          0: { w: 175 },
          1: { w: 95 },
          2: { w: 100 },
          3: { w: 100 },
          4: { w: 75 },
          5: { w: 25 },
          6: { w: 200 },
          7: { w: 160 },
          8: { w: 140 },
        },
      },
    },
  }
}
