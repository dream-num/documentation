import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'
const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })
export function createWorkbookData(): Partial<IWorkbookData> {
  const product: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Production demand × material requirements') },
    1: { 0: text('Rows are morning/evening; columns are proof packs, labels and signs.') },
    3: { 0: text('Demand / 2 × 3'), 6: text('MMULT / 2 × 2') },
    4: { 0: { v: 2 }, 1: { v: 1 }, 2: { v: 0 }, 6: { f: '=MMULT(A5:C6,A10:B12)' } },
    5: { 0: { v: 0 }, 1: { v: 3 }, 2: { v: 4 } },
    8: { 0: text('Material per unit / paper, ink'), 6: text('TRANSPOSE demand / 3 × 2') },
    9: { 0: { v: 5 }, 1: { v: 2 }, 6: { f: '=TRANSPOSE(A5:C6)' } },
    10: { 0: { v: 1 }, 1: { v: 6 } },
    11: { 0: { v: 3 }, 1: { v: 0 } },
    15: { 0: text('The inner dimensions must match: (2 × 3) × (3 × 2) produces (2 × 2).') },
    17: { 0: text('Edit demand or per-unit material values. All matrix outputs are native spills.') },
  }
  const inverse: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Invert a coefficient matrix and solve A × x = b') },
    1: { 0: text('Identity size'), 1: { v: 3, s: { bg: { rgb: '#FEF3C7' } } } },
    3: { 0: text('A / coefficients'), 3: text('b / totals'), 6: text('MINVERSE(A)') },
    4: { 0: { v: 2 }, 1: { v: 1 }, 3: { v: 7 }, 6: { f: '=MINVERSE(A5:B6)' } },
    5: { 0: { v: 1 }, 1: { v: 3 }, 3: { v: 11 } },
    8: { 0: text('MDETERM(A)'), 3: text('Solution / x'), 6: text('A × inverse(A)') },
    9: {
      0: { f: '=MDETERM(A5:B6)' },
      3: { f: '=MMULT(MINVERSE(A5:B6),D5:D6)' },
      6: { f: '=MMULT(A5:B6,MINVERSE(A5:B6))' },
    },
    13: { 0: text('MUNIT / editable size') },
    14: { 0: { f: '=MUNIT(B2)' } },
    19: { 0: text('Nested matrix formulas use the engine, not stored copies of prior spill outputs.') },
  }
  const errors: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Singular matrices and incompatible dimensions') },
    1: { 0: text('Change B6 from 4 to 5 to make the matrix invertible.') },
    3: { 0: text('Singular source'), 4: text('Determinant'), 7: text('Raw inverse') },
    4: { 0: { v: 1 }, 1: { v: 2 }, 4: { f: '=MDETERM(A5:B6)' }, 7: { f: '=MINVERSE(A5:B6)' } },
    5: { 0: { v: 2 }, 1: { v: 4 } },
    8: { 0: text('IFERROR is explicit'), 7: text('Non-square determinant') },
    9: { 0: { f: '=IFERROR(MINVERSE(A5:B6),"Singular matrix")' }, 7: { f: "=MDETERM('Production'!A5:C6)" } },
    13: { 0: text('Incompatible MMULT: 2 × 3 versus 2 × 2') },
    14: { 0: { f: "=MMULT('Production'!A5:C6,A5:B6)" } },
    18: { 0: text('The raw errors remain visible; a fallback does not make an invalid matrix invertible.') },
  }
  const sheets = {
    product: { id: 'product', name: 'Production', cellData: product },
    inverse: { id: 'inverse', name: 'Inverse and identity', cellData: inverse },
    errors: { id: 'errors', name: 'Matrix errors', cellData: errors },
  }
  for (const sheet of Object.values(sheets)) {
    sheet.cellData[0][0].s = { bl: 1, fs: 19, cl: { rgb: '#075985' } }
    for (const row of Object.values(sheet.cellData))
      for (const cell of Object.values(row)) {
        if (cell.f) cell.s = { bg: { rgb: '#E0F2FE' } }
      }
  }
  return {
    id: 'matrix-calculation-workbook',
    name: 'Matrix calculations',
    locale: LocaleType.EN_US,
    sheetOrder: ['product', 'inverse', 'errors'],
    sheets: Object.fromEntries(
      Object.entries(sheets).map(([id, sheet]) => [
        id,
        {
          ...sheet,
          rowCount: 26,
          columnCount: 11,
          defaultRowHeight: 32,
          defaultColumnWidth: 120,
        },
      ]),
    ),
  }
}
