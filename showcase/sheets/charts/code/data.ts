import type { ICellData, IWorkbookData } from '@univerjs/presets'

// Original fictional monitoring data: negative = net grid export; null ≠ zero.
export const MONTHS = [
  ['2025-01', 142, 180, 160],
  ['2025-02', 128, 174, 160],
  ['2025-03', 91, 158, 150],
  ['2025-04', 46, 131, 140],
  ['2025-05', -18, 118, 130],
  ['2025-06', -42, 109, 120],
  ['2025-07', 0, 116, 120],
  ['2025-08', null, 124, 130],
  ['2025-09', 37.5, 138, 140],
  ['2025-10', 83, 153, 150],
  ['2025-11', 136, 177, 160],
  ['2025-12', 169, 193, 170],
  ['2026-01', 133, 172, 160],
  ['2026-02', 112, 169, 160],
  ['2026-03', 74, 149, 150],
  ['2026-04', 29, 127, 140],
  ['2026-05', -31, 115, 130],
  ['2026-06', -56, 104, 120],
  ['2026-07', -12, 110, 120],
  ['2026-08', 8, null, 130],
  ['2026-09', 26.25, 129, 140],
  ['2026-10', 71, 147, 150],
  ['2026-11', 121, 165, 160],
  ['2026-12', 151, 184, 170],
]
const quarters = [
  ['North', 'Q1', 78, 90],
  ['North', 'Q2', 42, 80],
  ['North', 'Q3', 57, 85],
  ['North', 'Q4', 96, 100],
  ['South', 'Q1', 65, 75],
  ['South', 'Q2', 31, 65],
  ['South', 'Q3', 48, 70],
  ['South', 'Q4', 81, 90],
]
const header = (labels: string[]) =>
  Object.fromEntries(labels.map((v, c) => [c, { v, s: { bl: 1, bg: { rgb: '#dbeafe' } } }]))
const cellData: Record<number, Record<number, ICellData>> = {
  0: { 0: { v: 'ASTER OBSERVATORY · ENERGY', s: { bl: 1, cl: { rgb: '#1d4ed8' } } } },
  1: { 0: { v: 'Fictional MWh · negative = net export · blank ≠ zero' } },
  2: header(['Month', 'Net grid', 'Demand', 'Target']),
  30: header(['Station', 'Quarter', 'Observed', 'Budget']),
}
for (const [offset, rows] of [
  [3, MONTHS],
  [31, quarters],
] as const)
  for (const [r, row] of rows.entries())
    cellData[offset + r] = Object.fromEntries(row.map((v, c) => [c, v == null ? {} : { v }]))

export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'aster-observatory',
  name: 'Aster observatory energy',
  sheetOrder: ['energy', 'notes'],
  sheets: {
    energy: {
      id: 'energy',
      name: 'Energy',
      rowCount: 65,
      columnCount: 22,
      defaultRowHeight: 28,
      defaultColumnWidth: 95,
      columnData: { 0: { w: 110 }, 1: { w: 100 }, 2: { w: 100 }, 3: { w: 100 }, 4: { w: 24 } },
      cellData,
    },
    notes: {
      id: 'notes',
      name: 'Independent notes',
      rowCount: 25,
      columnCount: 12,
      cellData: { 0: { 0: { v: 'This worksheet has no demo charts.' } }, 3: { 1: { v: 999 } } },
    },
  },
}
