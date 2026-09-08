import type { ICellData, IWorkbookData } from '@univerjs/core'
import { BooleanNumber, LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const rows = [
    ['S-201', 'Sample envelopes', 12, 'Bin A', 'Ready'],
    ['S-202', 'Large archival storage boxes', 7, 'Bin C', 'Check column width'],
    ['S-203', 'Reserved sample pack', 13, 'Bin B', 'Initially hidden row'],
    ['S-204', 'Cotton gloves', 5, 'Bin D', 'Ready'],
    ['S-205', 'Label sheets', 9, 'Bin A', 'Ready'],
  ]
  const cellData: Record<number, Record<number, ICellData>> = {
    0: { 0: { v: 'Rows, columns and hidden data', s: { fs: 20, bl: 1, cl: { rgb: '#9A3412' } } } },
    1: { 0: { v: 'Drag header boundaries to resize. Row 7 and column D start hidden; their data still exists.' } },
    3: Object.fromEntries(
      ['Item', 'Description', 'Units', 'Storage bin', 'Status'].map((v, col) => [
        col,
        { v, s: { bl: 1, bg: { rgb: '#FED7AA' } } },
      ]),
    ),
    11: { 1: { v: 'Units, including hidden row' }, 2: { f: '=SUM(C5:C9)', s: { bl: 1, bg: { rgb: '#FFEDD5' } } } },
    14: { 0: { v: 'Select row headers 6–8, then use the native context menu to unhide row 7.' } },
    15: { 0: { v: 'Select column headers C–E to unhide D. Hiding is not deletion, filtering or access control.' } },
    16: { 0: { v: 'Row 6 is taller than its neighbours. Widen column B to reveal the complete item description.' } },
  }
  rows.forEach((row, index) => {
    cellData[index + 4] = Object.fromEntries(
      row.map((v, col) => [col, { v, s: { bg: { rgb: index % 2 ? '#FFF7ED' : '#FFFFFF' } } }]),
    )
  })
  return {
    id: 'row-column-lab',
    name: 'Row and column dimensions',
    locale: LocaleType.EN_US,
    sheetOrder: ['inventory'],
    sheets: {
      inventory: {
        id: 'inventory',
        name: 'Storage inventory',
        rowCount: 30,
        columnCount: 12,
        defaultRowHeight: 32,
        defaultColumnWidth: 110,
        rowData: { 0: { h: 44 }, 5: { h: 64, ia: BooleanNumber.FALSE }, 6: { hd: BooleanNumber.TRUE } },
        columnData: {
          0: { w: 115 },
          1: { w: 205 },
          2: { w: 95 },
          3: { w: 140, hd: BooleanNumber.TRUE },
          4: { w: 240 },
        },
        cellData,
      },
    },
  }
}
