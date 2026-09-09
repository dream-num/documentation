import type { ICellData, IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const cellData: Record<number, Record<number, ICellData>> = {
    0: { 0: { v: 'AutoFill: continue or repeat', s: { fs: 21, bl: 1, cl: { rgb: '#6D28D9' } } } },
    1: {
      0: { v: 'Select both seed cells, then drag the bottom-right fill handle to row 10. Target cells start empty.' },
    },
    3: {
      1: { v: 'Add 5' },
      3: { v: 'Subtract 3' },
      5: { v: 'Weekly dates' },
      7: { v: 'Copy pattern' },
    },
    11: { 0: { v: 'B5:B6 → B10: 10, 15, 20, 25, 30, 35. D5:D6 → D10: 12, 9, 6, 3, 0, -3.' } },
    12: { 0: { v: 'F5:F6 → F10: Sep 7, 14, 21, 28, Oct 5, 12. Dates are numeric serials with date formatting.' } },
    13: { 0: { v: 'H5:H6 → H10: use Copy Cell to repeat 10, 15, 10, 15, 10, 15 instead of extending the step.' } },
    15: { 0: { v: 'Use native Undo to retry. The README provides exact SERIES and COPY Facade calls.' } },
  }
  const seeds = [
    { col: 1, values: [10, 15], fill: '#EDE9FE' },
    { col: 3, values: [12, 9], fill: '#FCE7F3' },
    { col: 5, values: [46272, 46279], fill: '#DBEAFE' },
    { col: 7, values: [10, 15], fill: '#FEF3C7' },
  ]
  for (const { col, values, fill } of seeds) {
    cellData[3][col].s = { bl: 1, bg: { rgb: fill } }
    for (let row = 4; row < 10; row++) {
      cellData[row] ??= {}
      cellData[row][col] = {
        ...(row < 6 ? { v: values[row - 4] } : {}),
        s: { bg: { rgb: row < 6 ? fill : '#F8FAFC' }, ...(col === 5 ? { n: { pattern: 'mmm d, yyyy' } } : {}) },
      }
    }
  }
  return {
    id: 'autofill-series-workbook',
    name: 'AutoFill series',
    locale: LocaleType.EN_US,
    sheetOrder: ['series'],
    sheets: {
      series: {
        id: 'series',
        name: 'Continue or repeat',
        rowCount: 28,
        columnCount: 12,
        defaultRowHeight: 36,
        defaultColumnWidth: 115,
        columnData: {
          0: { w: 45 },
          1: { w: 150 },
          2: { w: 30 },
          3: { w: 150 },
          4: { w: 30 },
          5: { w: 165 },
          6: { w: 30 },
          7: { w: 165 },
        },
        cellData,
      },
    },
  }
}
