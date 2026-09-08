import type { IWorkbookData, IWorksheetData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export const ROWS = [
  ['R01', 'North', 'kit-blue', 0, 'Ready'],
  ['R02', 'South', 'kit-red', 10, 'Hold'],
  ['R03', 'North', 'kit-green', 20, 'Ready'],
  ['R04', 'West', 'lamp', 30, 'Hold'],
  ['R05', 'East', 'kit*', 40, 'Ready'],
  ['R06', 'South', 'kit-blue', 50, 'Review'],
  ['R07', 'North', 'cable', null, 'Hold'],
  ['R08', 'West', 'kit-red', -10, 'Ready'],
  ['R09', 'East', 'stand', 20, 'Review'],
  ['R10', 'South', 'kit-green', 100, 'Ready'],
  ['R11', 'North', 'kit-blue', null, 'Review'],
  ['R12', 'East', 'lamp', 0, 'Hold'],
] as const

export const VARIANTS = [
  ['values', 'Value list', 'Region: North or South'],
  ['band', 'Numeric AND', 'Units: at least 10 AND at most 40'],
  ['text', 'Text wildcard', 'Item: kit* matches the prefix, not only the literal star'],
  ['blank', 'Blanks', 'Units: empty cells; zero remains a number'],
  ['combined', 'Two columns', 'Region: North AND State: Ready'],
  ['none', 'No matches', 'Units: greater than 500; clear the native condition to reveal all rows'],
] as const

export function createWorkbookData(): Partial<IWorkbookData> {
  return {
    id: 'filter-gallery',
    locale: LocaleType.EN_US,
    name: 'Values and conditions',
    sheetOrder: VARIANTS.map(([id]) => id),
    styles: {
      title: { bg: { rgb: '#153E49' }, cl: { rgb: '#FFFFFF' }, fs: 19, bl: 1 },
      subtitle: { cl: { rgb: '#466675' }, fs: 11 },
      header: { bg: { rgb: '#DAE8E8' }, cl: { rgb: '#173D49' }, bl: 1 },
      even: { bg: { rgb: '#F0F6F6' } },
      odd: { bg: { rgb: '#FFFFFF' } },
      input: { bg: { rgb: '#FAEBCD' }, cl: { rgb: '#795422' } },
    },
    sheets: Object.fromEntries(
      VARIANTS.map(([id, name, description]) => {
        const cellData: IWorksheetData['cellData'] = {
          0: { 0: { v: name, s: 'title' } },
          1: { 0: { v: `Initially: ${description}`, s: 'subtitle' } },
          3: Object.fromEntries(['Record', 'Region', 'Item', 'Units', 'State'].map((v, i) => [i, { v, s: 'header' }])),
          18: {
            0: {
              v: '12 independent source rows per sheet. Open a header filter to change or clear criteria.',
              s: 'subtitle',
            },
          },
        }
        ROWS.forEach((row, index) => {
          cellData[index + 4] = Object.fromEntries(
            row.map((value, col) => [
              col,
              {
                ...(value === null ? {} : { v: value }),
                s: col === 3 ? 'input' : index % 2 ? 'odd' : 'even',
              },
            ]),
          )
        })
        return [
          id,
          {
            id,
            name,
            rowCount: 28,
            columnCount: 8,
            defaultRowHeight: 34,
            defaultColumnWidth: 170,
            rowHeader: { width: 46 },
            columnHeader: { height: 26 },
            columnData: { 0: { w: 130 }, 2: { w: 200 }, 3: { w: 130 } },
            mergeData: [
              { startRow: 0, endRow: 0, startColumn: 0, endColumn: 4 },
              { startRow: 1, endRow: 1, startColumn: 0, endColumn: 6 },
            ],
            cellData,
          },
        ]
      }),
    ),
  }
}
