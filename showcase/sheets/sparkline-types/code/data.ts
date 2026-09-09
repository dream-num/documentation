import type { ICellData, IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export const SAMPLES = [
  {
    id: 'line',
    name: 'Line trends',
    hint: 'Weekly workshop attendance: compare rising, falling and uneven trajectories.',
    rows: [
      ['Ceramics', 8, 12, 11, 16, 18, 24],
      ['Letterpress', 22, 20, 16, 18, 12, 9],
      ['Textiles', 6, 18, 9, 21, 12, 25],
      ['Woodwork', 14, 14, 15, 14, 15, 14],
      ['Metalwork', 4, 7, 12, 10, 8, 16],
      ['Bookbinding', 20, 12, 8, 6, 11, 18],
    ],
  },
  {
    id: 'column',
    name: 'Column volumes',
    hint: 'Weekly finished batches: column height preserves the size of each observation.',
    rows: [
      ['Glazed bowls', 3, 9, 5, 12, 7, 4],
      ['Printed cards', 18, 8, 14, 6, 20, 11],
      ['Woven mats', 2, 4, 6, 8, 10, 12],
      ['Oak trays', 11, 9, 7, 5, 3, 1],
      ['Brass hooks', 6, 6, 6, 6, 6, 6],
      ['Stitched journals', 4, 10, 3, 8, 12, 7],
    ],
  },
  {
    id: 'winloss',
    name: 'Win-loss signs',
    hint: 'Weekly output versus plan: equal-height marks show sign, not magnitude; zero is neutral.',
    rows: [
      ['Clay studio', -3, 8, 1, -7, 0, 4],
      ['Print studio', 10, -2, -6, 3, 5, -1],
      ['Loom studio', -1, -4, 2, 6, 0, 9],
      ['Joinery studio', 1, 12, 3, 7, 2, 5],
      ['Metal studio', -2, -8, -1, -6, -4, -3],
      ['Binding studio', 0, 4, 0, -3, 0, 2],
    ],
  },
] as const

export function createWorkbookData(): Partial<IWorkbookData> {
  return {
    id: 'workshop-sparklines',
    name: 'Workshop pulse · native sparklines',
    locale: LocaleType.EN_US,
    sheetOrder: SAMPLES.map(({ id }) => id),
    sheets: Object.fromEntries(
      SAMPLES.map(({ id, name, hint, rows }) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { v: name, s: { fs: 18, bl: 1, cl: { rgb: '#155E75' } } } },
          1: { 0: { v: hint } },
          3: Object.fromEntries(
            ['Workshop', 'Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Native sparkline'].map((v, c) => [
              c,
              { v, s: { bl: 1, bg: { rgb: '#E0F2FE' } } },
            ]),
          ),
          12: { 0: { v: 'Edit B5:G10: the native sparkline in column H follows its source cells.' } },
          14: { 0: { v: 'Select H5 to inspect the native Sparkline controls. Each row has an independent group.' } },
        }
        rows.forEach((row, r) => {
          cellData[r + 4] = Object.fromEntries(row.map((v, c) => [c, { v }]))
        })
        return [
          id,
          {
            id,
            name,
            rowCount: 24,
            columnCount: 12,
            defaultRowHeight: 46,
            defaultColumnWidth: 95,
            columnData: { 0: { w: 190 }, 7: { w: 250 } },
            cellData,
          },
        ]
      }),
    ),
  }
}
