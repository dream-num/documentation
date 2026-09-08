import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

const cell = (v: string | number, header = false): ICellData => ({
  v,
  t: typeof v === 'number' ? CellValueType.NUMBER : CellValueType.STRING,
  ...(header ? { s: { bg: { rgb: '#164E63' }, cl: { rgb: '#FFFFFF' }, bl: 1 } } : {}),
})
export function createWorkbookData(): Partial<IWorkbookData> {
  const sheets = [
    ['relative', 'Relative rows', 'Initially: D5 = B5*C5. Both references move when the formula is filled down.'],
    ['absolute', 'Fixed anchor', 'Initially: D5 = B5*$E$5. Every row uses the same price in E5.'],
    ['mixed', 'Mixed matrix', 'Initially: B5 = $A5*B$4. The quantity column and price row stay fixed.'],
  ].map(([id, name, instruction]) => {
    const data: Record<number, Record<number, ICellData>> = {
      0: { 0: { v: name, s: { fs: 19, bl: 1, cl: { rgb: '#164E63' } } } },
      1: { 0: cell(instruction) },
      11: { 0: cell('Select a result cell: the native formula bar shows its actual references.') },
      13: {
        0: cell(
          id === 'relative'
            ? 'Edit D5, then drag its fill handle down to D8.'
            : id === 'absolute'
              ? 'Edit E5: all four row results recalculate from the fixed anchor.'
              : 'Edit a price in row 4 or a quantity in column A: the matching results recalculate.',
        ),
      },
    }
    if (id === 'mixed') {
      data[3] = { 0: cell('Units / Price', true) }
      ;[10, 20, 30, 40].forEach((value, i) => {
        data[3][i + 1] = cell(value, true)
      })
      ;[1, 2, 3, 4].forEach((value, i) => {
        const row = i + 4
        data[row] = { 0: cell(value) }
        ;['B', 'C', 'D', 'E'].forEach((column, j) => {
          data[row][j + 1] = { f: `=$A${row + 1}*${column}$4`, s: { bg: { rgb: '#E5DCEE' } } }
        })
      })
    } else {
      data[3] = Object.fromEntries(
        ['Print item', 'Quantity', 'Unit price', 'Result', 'Fixed price'].map((v, i) => [i, cell(v, true)]),
      )
      ;[
        ['Field cards', 2, 8],
        ['Route labels', 3, 6],
        ['Pocket maps', 4, 5],
        ['Trail sheets', 5, 4],
      ].forEach((row, i) => {
        data[i + 4] = Object.fromEntries(row.map((v, j) => [j, cell(v)]))
        if (id === 'absolute') data[i + 4][2] = { f: '=$E$5' }
        data[i + 4][3] = {
          f: id === 'relative' ? `=B${i + 5}*C${i + 5}` : `=B${i + 5}*$E$5`,
          s: { bg: { rgb: id === 'relative' ? '#D5EDE4' : '#FBE7BC' } },
        }
      })
      if (id === 'absolute') data[4][4] = cell(3.5)
      else delete data[3][4]
    }
    return [
      id,
      {
        id,
        name,
        rowCount: 24,
        columnCount: 9,
        defaultRowHeight: 38,
        columnData: { 0: { w: 240 }, 1: { w: 160 }, 2: { w: 160 }, 3: { w: 160 }, 4: { w: 160 } },
        cellData: data,
      },
    ]
  })
  return {
    id: 'print-room-references',
    name: 'Print room / formula references',
    locale: LocaleType.EN_US,
    sheetOrder: ['relative', 'absolute', 'mixed'],
    sheets: Object.fromEntries(sheets),
  }
}
