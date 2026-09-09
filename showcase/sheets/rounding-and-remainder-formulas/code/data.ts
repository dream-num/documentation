import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })

export function createWorkbookData(): Partial<IWorkbookData> {
  const precision: Record<number, Record<number, ICellData>> = {
    0: { 0: { ...text('Precision is not a display format'), s: { fs: 19, bl: 1, cl: { rgb: '#9A3412' } } } },
    1: { 0: text('Amber cells are inputs. D only displays two decimals; E:G change the calculated value.') },
    3: Object.fromEntries(
      ['Specimen', 'Number', 'Digits', 'Display 0.00', 'ROUND', 'ROUNDUP', 'ROUNDDOWN', 'D minus E'].map((v, c) => [
        c,
        { ...text(v), s: { bl: 1, bg: { rgb: '#FFEDD5' } } },
      ]),
    ),
    12: { 0: text('Edit B5 to 12.344: D5 displays 12.34 but stores 12.344; E5 stores 12.34.') },
    14: {
      0: text('Negative digits round tens or hundreds. ROUNDUP moves away from zero; ROUNDDOWN moves toward zero.'),
    },
  }
  const cases: [string, number, number][] = [
    ['Measured length', 12.345, 2],
    ['Negative adjustment', -12.345, 2],
    ['Positive half', 2.5, 0],
    ['Negative half', -2.5, 0],
    ['Nearest ten', 146, -1],
    ['Negative tens', -146, -1],
  ]
  cases.forEach(([label, value, digits], i) => {
    const r = i + 5
    precision[r - 1] = {
      0: text(label),
      1: { v: value, s: { bg: { rgb: '#FEF3C7' } } },
      2: { v: digits, s: { bg: { rgb: '#FEF3C7' } } },
      3: { f: `=B${r}`, s: { n: { pattern: '0.00' }, bg: { rgb: '#F1F5F9' } } },
      4: { f: `=ROUND(B${r},C${r})` },
      5: { f: `=ROUNDUP(B${r},C${r})` },
      6: { f: `=ROUNDDOWN(B${r},C${r})` },
      7: { f: `=D${r}-E${r}`, s: { n: { pattern: '0.000' }, bg: { rgb: '#FFF7ED' } } },
    }
  })
  const multiples: Record<number, Record<number, ICellData>> = {
    0: { 0: { ...text('Direction, multiples and remainders'), s: { fs: 19, bl: 1, cl: { rgb: '#075985' } } } },
    1: { 0: text('A = number; B = divisor / significance. Negative values reveal the direction rules.') },
    3: Object.fromEntries(
      ['Number', 'Divisor', 'INT', 'TRUNC', 'MOD', 'QUOTIENT', 'CEILING.MATH', 'FLOOR.MATH'].map((v, c) => [
        c,
        { ...text(v), s: { bl: 1, bg: { rgb: '#E0F2FE' } } },
      ]),
    ),
    12: {
      0: text('Mode = 1 for a negative number (using row 6):'),
      6: { f: '=CEILING.MATH(A6,B6,1)' },
      7: { f: '=FLOOR.MATH(A6,B6,1)' },
    },
    14: {
      0: text(
        'Default: CEILING moves toward +infinity; FLOOR toward -infinity. Mode 1 reverses negative-number direction.',
      ),
    },
    16: {
      0: text(
        'MOD takes the divisor sign. QUOTIENT truncates division toward zero; it is not the INT quotient for negatives.',
      ),
    },
  }
  ;[
    [17.8, 5],
    [-17.8, 5],
    [17.8, -5],
    [-17.8, -5],
    [7.25, 0.5],
    [-7.25, 0.5],
  ].forEach(([value, divisor], i) => {
    const r = i + 5
    multiples[r - 1] = {
      0: { v: value, s: { bg: { rgb: '#FEF3C7' } } },
      1: { v: divisor, s: { bg: { rgb: '#FEF3C7' } } },
    }
    ;['INT', 'TRUNC', 'MOD', 'QUOTIENT', 'CEILING.MATH', 'FLOOR.MATH'].forEach((fn, j) => {
      multiples[r - 1][j + 2] = {
        f: `=${fn}(A${r}${j < 2 ? '' : `,B${r}`})`,
        s: { n: { pattern: '0.00' }, bg: { rgb: j < 2 ? '#F0F9FF' : '#FFFFFF' } },
      }
    })
  })
  return {
    id: 'rounding-remainder-workbook',
    name: 'Rounding and remainder',
    locale: LocaleType.EN_US,
    sheetOrder: ['precision', 'multiples'],
    sheets: Object.fromEntries(
      (
        [
          ['precision', 'Precision and display', precision],
          ['multiples', 'Multiples and signs', multiples],
        ] as const
      ).map(([id, name, cellData]) => [
        id,
        {
          id,
          name,
          cellData,
          rowCount: 25,
          columnCount: 9,
          defaultRowHeight: 34,
          defaultColumnWidth: 130,
          columnData: {
            0: { w: id === 'precision' ? 190 : 130 },
            1: { w: 120 },
            2: { w: 100 },
            3: { w: 125 },
            4: { w: 125 },
            5: { w: 130 },
            6: { w: 155 },
            7: { w: 155 },
          },
        },
      ]),
    ),
  }
}
