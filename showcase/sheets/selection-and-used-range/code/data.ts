import type { ICellData, IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const rows = [
    ['Item', 'Unit price', 'Quantity', 'Line total'],
    ['Sketchbook', 12.5, 4, '=C5*D5'],
    ['Graphite set', 8, 3, '=C6*D6'],
    ['Portfolio', 24, 2, '=C7*D7'],
    ['Delivery', 0, 1, '=C8*D8'],
  ]
  const sheets = Object.fromEntries(
    ['selection', 'styled', 'empty'].map((id) => {
      const cellData: Record<number, Record<number, ICellData>> = {}
      if (id !== 'empty') {
        rows.forEach((row, index) => {
          cellData[index + 3] = Object.fromEntries(
            row.map((value, col) => [
              col + 1,
              {
                ...(typeof value === 'string' && value.startsWith('=') ? { f: value } : { v: value }),
                s: {
                  bg: { rgb: index === 0 ? '#254B5A' : col === 3 ? '#E5F0EE' : '#FFFFFF' },
                  cl: { rgb: index === 0 ? '#FFFFFF' : '#254B5A' },
                  ...(index === 0 ? { bl: 1 } : {}),
                  ...(index > 0 && (col === 1 || col === 3) ? { n: { pattern: '0.00' } } : {}),
                },
              },
            ]),
          )
        })
      }
      if (id === 'styled') cellData[11] = { 7: { s: { bg: { rgb: '#E6B77A' } } } }
      return [
        id,
        {
          id,
          name: id === 'selection' ? 'Selection' : id === 'styled' ? 'Styled boundary' : 'Empty',
          rowCount: 30,
          columnCount: 12,
          defaultRowHeight: 34,
          columnData: { 0: { w: 55 }, 1: { w: 210 }, 2: { w: 125 }, 3: { w: 115 }, 4: { w: 140 } },
          cellData,
        },
      ]
    }),
  )
  return {
    id: 'selection-used-range',
    name: 'Selection and stored cell boundaries',
    locale: LocaleType.EN_US,
    sheetOrder: ['selection', 'styled', 'empty'],
    sheets,
  }
}
