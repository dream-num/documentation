import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'
const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })

export function createWorkbookData(): Partial<IWorkbookData> {
  const lab: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Choose an address or resize a reference window') },
    1: { 0: text('Amber cells are editable inputs. The two studio tabs contain the original figures.') },
    3: { 0: text('INDIRECT selector'), 1: text('Input'), 6: text('Native calculation'), 7: text('Result') },
    4: {
      0: text('Sheet name'),
      1: text('North Studio'),
      6: text('A1 address'),
      7: { f: `=INDIRECT("'"&B5&"'!"&B6,TRUE)` },
    },
    5: {
      0: text('A1 address'),
      1: text('B5'),
      6: text('Absolute R1C1 address'),
      7: { f: `=INDIRECT("'"&B5&"'!"&B7,FALSE)` },
    },
    6: {
      0: text('R1C1 address'),
      1: text('R5C2'),
      6: text('SUM of text range'),
      7: { f: `=SUM(INDIRECT("'"&B5&"'!"&B8))` },
    },
    7: { 0: text('Range address'), 1: text('B5:C7') },
    9: {
      0: text('OFFSET from North Studio!B5'),
      6: text('Dynamic rectangle SUM'),
      7: { f: "=SUM(OFFSET('North Studio'!$B$5,B11,B12,B13,B14))" },
    },
    10: {
      0: text('Rows down'),
      1: { v: 1 },
      6: text('Top-left value'),
      7: { f: "=OFFSET('North Studio'!$B$5,B11,B12)" },
    },
    11: { 0: text('Columns right'), 1: { v: 0 } },
    12: { 0: text('Height'), 1: { v: 2 } },
    13: { 0: text('Width'), 1: { v: 2 } },
    15: {
      0: text('Invalid text reference'),
      1: text('not a cell'),
      6: text('Unwrapped INDIRECT'),
      7: { f: '=INDIRECT(B16)' },
    },
    16: { 6: text('IFERROR boundary'), 7: { f: '=IFERROR(INDIRECT(B16),"Choose a valid reference")' } },
    18: {
      0: text('OFFSET bounds: row offset -5'),
      6: text('Unwrapped OFFSET'),
      7: { f: "=OFFSET('North Studio'!B5,-5,0)" },
    },
    19: { 6: text('IFERROR boundary'), 7: { f: '=IFERROR(H19,"Outside worksheet")' } },
    22: { 0: text('OFFSET uses North Studio directly; changing the INDIRECT sheet selector does not retarget it.') },
  }
  for (const r of [4, 5, 6, 7, 10, 11, 12, 13, 15]) lab[r][1].s = { bg: { rgb: '#FEF3C7' } }
  const source = (name: string, values: number[][]) => {
    const cellData: Record<number, Record<number, ICellData>> = {
      0: { 0: text(`${name} · print production`) },
      1: { 0: text('Edit any quantity to update dependent references in Reference lab.') },
      3: { 0: text('Batch'), 1: text('Posters'), 2: text('Cards'), 3: text('Signs') },
    }
    values.forEach((row, i) => {
      cellData[i + 4] = { 0: text(['Morning', 'Midday', 'Afternoon', 'Evening'][i]) }
      row.forEach((v, c) => {
        cellData[i + 4][c + 1] = { v }
      })
    })
    return cellData
  }
  const sheets = {
    lab: { id: 'lab', name: 'Reference lab', cellData: lab },
    north: {
      id: 'north',
      name: 'North Studio',
      cellData: source('North Studio', [
        [12, 40, 5],
        [18, 25, 0],
        [0, 30, 7],
        [9, 15, 3],
      ]),
    },
    south: {
      id: 'south',
      name: 'South Studio',
      cellData: source('South Studio', [
        [8, 50, 2],
        [22, 10, 4],
        [6, 45, 0],
        [14, 20, 8],
      ]),
    },
  }
  for (const sheet of Object.values(sheets)) {
    sheet.cellData[0][0].s = { fs: 19, bl: 1, cl: { rgb: '#075985' } }
    for (const cell of Object.values(sheet.cellData[3])) cell.s = { bl: 1, bg: { rgb: '#E0F2FE' } }
  }
  return {
    id: 'indirect-offset-workbook',
    name: 'Dynamic reference windows',
    locale: LocaleType.EN_US,
    sheetOrder: ['lab', 'north', 'south'],
    sheets: Object.fromEntries(
      Object.entries(sheets).map(([id, sheet]) => [
        id,
        {
          ...sheet,
          rowCount: 28,
          columnCount: 9,
          defaultRowHeight: 30,
          defaultColumnWidth: 90,
          columnData: {
            0: { w: 255 },
            1: { w: 160 },
            2: { w: 80 },
            3: { w: 80 },
            4: { w: 25 },
            5: { w: 25 },
            6: { w: 230 },
            7: { w: 220 },
          },
        },
      ]),
    ),
  }
}
