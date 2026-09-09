import type { IWorkbookData, IWorksheetData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

// Spreadsheet serial for 2027-09-01; fixture data, not a validation implementation.
export const SEPTEMBER_START = 46631

export function createWorkbookData(): Partial<IWorkbookData> {
  const sheets = [
    {
      id: 'numbers',
      name: 'Numbers',
      title: 'Numeric boundaries / values versus rules',
      accent: '#503957',
      headers: ['Probe', 'Whole 1–12', 'Decimal 0–1', 'Strictly positive'],
      labels: ['Lower edge', 'Upper / valid', 'Below range', 'Above / valid', 'Fraction', 'Allowed blank'],
      columns: [
        [1, 12, 0, 13, 2.5, null],
        [0, 1, -0.1, 1.1, 0.25, null],
        [0, 1, -1, 12, 0.5, null],
      ],
      note: 'Initially: B accepts integers 1–12; C accepts decimals 0–1; D requires a number greater than zero.',
    },
    {
      id: 'dates',
      name: 'Dates',
      title: 'Date boundaries / inclusive versus exclusive',
      accent: '#28564C',
      headers: ['Probe', 'September window', 'Before Sep 1', 'Sep 1 onward'],
      labels: ['Opening day', 'Closing day', 'Previous day', 'Following month', 'Inside window', 'Allowed blank'],
      columns: Array.from({ length: 3 }, () => [
        SEPTEMBER_START,
        SEPTEMBER_START + 29,
        SEPTEMBER_START - 1,
        SEPTEMBER_START + 30,
        SEPTEMBER_START + 14,
        null,
      ]),
      note: 'Initially: B includes Sep 1–30, 2027; C is strictly before Sep 1; D includes Sep 1 and later.',
    },
  ]
  return {
    id: 'validation-boundaries',
    name: 'Date and number validation',
    locale: LocaleType.EN_US,
    sheetOrder: sheets.map(({ id }) => id),
    sheets: Object.fromEntries(
      sheets.map(({ id, name, title, accent, headers, labels, columns, note }) => {
        const cellData: IWorksheetData['cellData'] = {
          0: { 0: { v: title, s: { bg: { rgb: accent }, cl: { rgb: '#FFFFFF' }, fs: 19, bl: 1 } } },
          2: Object.fromEntries(
            headers.map((v, column) => [column, { v, s: { bg: { rgb: '#EEE9E4' }, cl: { rgb: '#403B37' }, bl: 1 } }]),
          ),
          11: { 0: { v: note } },
          13: { 0: { v: 'Edit the amber cells. Invalid values stay visible with native validation markers.' } },
          15: { 0: { v: 'Use Data > Data validation to inspect or change the actual rules.' } },
        }
        labels.forEach((label, row) => {
          cellData[row + 3] = { 0: { v: label } }
          columns.forEach((values, column) => {
            const value = values[row]
            cellData[row + 3][column + 1] = {
              ...(value === null ? {} : { v: value }),
              s: {
                bg: { rgb: '#FCF0DA' },
                cl: { rgb: '#684914' },
                ...(id === 'dates' ? { n: { pattern: 'yyyy-mm-dd' } } : {}),
              },
            }
          })
        })
        return [
          id,
          {
            id,
            name,
            rowCount: 24,
            columnCount: 7,
            defaultRowHeight: 38,
            defaultColumnWidth: 190,
            columnData: { 0: { w: 200 }, 1: { w: 200 }, 2: { w: 200 }, 3: { w: 200 } },
            mergeData: [
              { startRow: 0, endRow: 0, startColumn: 0, endColumn: 3 },
              ...[11, 13, 15].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 5 })),
            ],
            cellData,
          },
        ]
      }),
    ),
  }
}
