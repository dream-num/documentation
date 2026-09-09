import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })

export function createWorkbookData(): Partial<IWorkbookData> {
  const source: Record<number, Record<number, ICellData>> = {
    0: { 0: { ...text('Print shop sales · editable source'), s: { fs: 19, bl: 1, cl: { rgb: '#9A3412' } } } },
    1: {
      0: text(
        'Eight transactions feed one native pivot table. Edit D5 from 120 to 220, then inspect the refreshed sum.',
      ),
    },
    3: Object.fromEntries(
      ['Region', 'Product', 'Channel', 'Amount'].map((v, c) => [
        c,
        { ...text(v), s: { bl: 1, bg: { rgb: '#FFEDD5' } } },
      ]),
    ),
    14: {
      0: text('The source range is A4:D12, including headers. No totals or formulas are precomputed in the source.'),
    },
  }
  const rows: [string, string, string, number][] = [
    ['North', 'Posters', 'Web', 120],
    ['North', 'Posters', 'Store', 80],
    ['North', 'Cards', 'Web', 40],
    ['South', 'Posters', 'Web', 150],
    ['South', 'Cards', 'Store', 60],
    ['South', 'Cards', 'Web', 30],
    ['North', 'Cards', 'Store', 20],
    ['South', 'Posters', 'Store', 200],
  ]
  rows.forEach((row, i) => {
    source[i + 4] = Object.fromEntries(
      row.map((v, c) => [
        c,
        {
          ...(typeof v === 'string' ? text(v) : { v }),
          s: { bg: { rgb: c === 3 ? '#FEF3C7' : '#FFFFFF' } },
        },
      ]),
    )
  })
  return {
    id: 'print-sales-pivots',
    name: 'Native pivot layouts',
    locale: LocaleType.EN_US,
    sheetOrder: ['source', 'sales'],
    sheets: Object.fromEntries(
      (
        [
          ['source', 'Sales source', source],
          [
            'sales',
            'Pivot analysis',
            {
              0: {
                0: { ...text('Pivot analysis · layout and aggregation'), s: { fs: 19, bl: 1, cl: { rgb: '#0F766E' } } },
              },
              1: {
                0: text(
                  'Rows: Region then Product. Columns: Channel. Values: Sum of Amount. Select a pivot cell for native configuration.',
                ),
              },
            },
          ],
        ] as const
      ).map(([id, name, cellData]) => [
        id,
        {
          id,
          name,
          cellData,
          rowCount: 28,
          columnCount: 9,
          defaultRowHeight: 34,
          defaultColumnWidth: 160,
          columnData: { 0: { w: 200 }, 1: { w: 175 } },
        },
      ]),
    ),
  }
}
