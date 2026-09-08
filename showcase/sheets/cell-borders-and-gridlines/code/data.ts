import type { ICellData, IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const sheets = Object.fromEntries(
    ['guides', 'clean'].map((id) => {
      const cellData: Record<number, Record<number, ICellData>> = {
        0: { 1: { v: 'Borders are content; gridlines are guides', s: { fs: 21, bl: 1, cl: { rgb: '#334155' } } } },
        1: { 1: { v: 'Switch tabs to compare the same borders with and without worksheet gridlines.' } },
        3: {
          1: { v: 'Medium outside border', s: { bl: 1, cl: { rgb: '#B45309' } } },
          5: { v: 'Thin borders on every cell', s: { bl: 1, cl: { rgb: '#334155' } } },
        },
        11: {
          1: { v: 'Dashed horizontal separators', s: { bl: 1, cl: { rgb: '#0F766E' } } },
          5: { v: 'Double outline and total rule', s: { bl: 1, cl: { rgb: '#7C3AED' } } },
        },
      }
      const samples: [number, number, (string | number)[][]][] = [
        [
          4,
          1,
          [
            ['Packing list', 'Units', 'Ready'],
            ['Posters', 24, 'Yes'],
            ['Programs', 60, 'Yes'],
            ['Badges', 40, 'No'],
          ],
        ],
        [
          4,
          5,
          [
            ['Inventory', 'Shelf', 'Count'],
            ['Canvas', 'A', 12],
            ['Frames', 'B', 8],
            ['Brushes', 'C', 30],
          ],
        ],
        [
          12,
          1,
          [
            ['Schedule', 'Start', 'Duration'],
            ['Setup', '09:00', '1 hour'],
            ['Open studio', '10:00', '3 hours'],
            ['Cleanup', '13:00', '1 hour'],
          ],
        ],
        [
          12,
          5,
          [
            ['Materials', 'Units', 'Amount'],
            ['Paper', 20, 40],
            ['Ink', 4, 60],
            ['Total', '=SUM(G14:G15)', '=SUM(H14:H15)'],
          ],
        ],
      ]
      for (const [startRow, startColumn, rows] of samples) {
        rows.forEach((row, rowOffset) => {
          const rowIndex = startRow + rowOffset
          cellData[rowIndex] ??= {}
          row.forEach((value, columnOffset) => {
            cellData[rowIndex][startColumn + columnOffset] = {
              ...(typeof value === 'string' && value.startsWith('=') ? { f: value } : { v: value }),
              ...(rowOffset === 0 ? { s: { bl: 1 } } : {}),
            }
          })
        })
      }
      return [
        id,
        {
          id,
          name: id === 'guides' ? 'Gridlines on' : 'Gridlines off',
          rowCount: 24,
          columnCount: 10,
          defaultRowHeight: 32,
          defaultColumnWidth: 115,
          columnData: { 0: { w: 28 }, 1: { w: 175 }, 4: { w: 38 }, 5: { w: 175 } },
          rowData: { 0: { h: 46 }, 1: { h: 38 } },
          mergeData: [
            { startRow: 0, endRow: 0, startColumn: 1, endColumn: 7 },
            { startRow: 1, endRow: 1, startColumn: 1, endColumn: 7 },
            ...[3, 11].flatMap((row) =>
              [1, 5].map((col) => ({ startRow: row, endRow: row, startColumn: col, endColumn: col + 2 })),
            ),
          ],
          cellData,
        },
      ]
    }),
  )
  return {
    id: 'border-specimens',
    name: 'Cell border specimens',
    locale: LocaleType.EN_US,
    sheetOrder: ['guides', 'clean'],
    sheets,
  }
}
