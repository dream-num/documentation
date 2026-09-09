import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'
const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })
export function createWorkbookData(): Partial<IWorkbookData> {
  const slice: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Slice and reorder · one formula per output') },
    1: { 0: text('TAKE rows'), 1: { v: 2, s: { bg: { rgb: '#FEF3C7' } } } },
    3: { 0: text('Source'), 4: text('TAKE first rows'), 8: text('DROP first row') },
    4: { 0: text('Proof'), 1: { v: 12 }, 2: { v: 3 }, 4: { f: '=TAKE(A5:C8,B2)' }, 8: { f: '=DROP(A5:C8,1)' } },
    5: { 0: text('Labels'), 1: { v: 0 }, 2: { v: 8 } },
    6: { 0: text('Posters'), 1: { v: 25 }, 2: { v: 2 } },
    7: { 0: text('Signs'), 1: { v: 7 }, 2: { v: 5 } },
    10: { 0: text('CHOOSECOLS 3,1'), 4: text('CHOOSEROWS -1,1'), 8: text('TAKE last row') },
    11: { 0: { f: '=CHOOSECOLS(A5:C8,3,1)' }, 4: { f: '=CHOOSEROWS(A5:C8,-1,1)' }, 8: { f: '=TAKE(A5:C8,-1)' } },
    17: { 0: text('Change B2 to 1, 3 or -2. Edit source quantities to update every affected spill.') },
  }
  const stack: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Join differently sized arrays · padding stays visible') },
    3: { 0: text('Main batches'), 3: text('Extra IDs'), 5: text('HSTACK: shorter column') },
    4: { 0: text('Blue'), 1: { v: 14 }, 3: text('P-41'), 5: { f: '=HSTACK(A5:B7,D5:D6)' } },
    5: { 0: text('Amber'), 1: { v: 0 }, 3: text('P-42') },
    6: { 0: text('Green'), 1: { v: 9 } },
    10: { 0: text('VSTACK: narrower rows'), 5: text('Explicit IFNA padding') },
    11: { 0: { f: '=VSTACK(A5:B7,D5:D6)' }, 5: { f: '=IFNA(HSTACK(A5:B7,D5:D6),"Unassigned")' } },
    19: { 0: text('The raw #N/A cells are shape padding, not deleted source values. IFNA is an explicit choice.') },
  }
  const flatten: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Flatten and wrap · blank is not zero') },
    3: { 0: text('Source matrix'), 4: text('TOCOL keep all'), 6: text('TOCOL ignore 3'), 8: text('Column-major / 3') },
    4: {
      0: { v: 11 },
      1: {},
      2: { v: 0 },
      4: { f: '=TOCOL(A5:C6,0)' },
      6: { f: '=TOCOL(A5:C6,3)' },
      8: { f: '=TOCOL(A5:C6,3,TRUE)' },
    },
    5: { 0: { v: 21 }, 1: { f: '=NA()' }, 2: { v: 31 } },
    11: { 0: text('TOROW ignore blanks and errors') },
    12: { 0: { f: '=TOROW(A5:C6,3)' } },
    15: { 0: text('WRAPROWS / width 3'), 5: text('WRAPCOLS / height 3, custom pad') },
    16: { 0: { f: '=WRAPROWS(TOCOL(A5:C6,3),3)' }, 5: { f: '=WRAPCOLS(TOCOL(A5:C6,3),3,"—")' } },
    21: { 0: text('Ignore 0 keeps all; 3 skips blanks and errors, but retains the genuine zero in C5.') },
  }
  const sheets = {
    slice: { id: 'slice', name: 'Slice and reorder', cellData: slice },
    stack: { id: 'stack', name: 'Stack and pad', cellData: stack },
    flatten: { id: 'flatten', name: 'Flatten and wrap', cellData: flatten },
  }
  for (const sheet of Object.values(sheets)) {
    sheet.cellData[0][0].s = { bl: 1, fs: 19, cl: { rgb: '#0F766E' } }
    for (const row of Object.values(sheet.cellData))
      for (const cell of Object.values(row)) {
        if (cell.f) cell.s = { bg: { rgb: '#F0FDFA' } }
      }
  }
  return {
    id: 'array-reshaping-workbook',
    name: 'Array transformations',
    locale: LocaleType.EN_US,
    sheetOrder: ['slice', 'stack', 'flatten'],
    sheets: Object.fromEntries(
      Object.entries(sheets).map(([id, sheet]) => [
        id,
        {
          ...sheet,
          rowCount: 28,
          columnCount: 12,
          defaultRowHeight: 30,
          defaultColumnWidth: 108,
        },
      ]),
    ),
  }
}
