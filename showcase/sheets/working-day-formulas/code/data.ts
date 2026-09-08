import type { ICellData, IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

const date = (day: number) => (Date.UTC(2026, 8, day) - Date.UTC(1899, 11, 30)) / 86400000

export function createWorkbookData(): Partial<IWorkbookData> {
  const rows = [
    ['Standard calendar', date(7), 5, 1, '=WORKDAY(B5,C5,$H$5:$H$6)', '=NETWORKDAYS(B5,E5,$H$5:$H$6)'],
    ['Without holidays', date(7), 5, 1, '=WORKDAY(B6,C6)', '=NETWORKDAYS(B6,E6)'],
    [
      'Friday / Saturday off',
      date(11),
      3,
      7,
      '=WORKDAY.INTL(B7+0,C7+0,D7,$H$5:$H$6)',
      '=NETWORKDAYS.INTL(B7,E7,D7,$H$5:$H$6)',
    ],
    [
      'Sunday only off',
      date(7),
      5,
      11,
      '=WORKDAY.INTL(B8+0,C8+0,D8,$H$5:$H$6)',
      '=NETWORKDAYS.INTL(B8,E8,D8,$H$5:$H$6)',
    ],
    [
      'Custom weekend mask',
      date(7),
      5,
      '0000110',
      '=WORKDAY.INTL(B9+0,C9+0,D9,$H$5:$H$6)',
      '=NETWORKDAYS.INTL(B9,E9,D9,$H$5:$H$6)',
    ],
    ['Work backwards', date(16), -3, 1, '=WORKDAY(B10,C10,$H$5:$H$6)', '=NETWORKDAYS(E10,B10,$H$5:$H$6)'],
  ]
  const cellData: Record<number, Record<number, ICellData>> = {
    0: { 0: { v: 'Working-day calendars', s: { fs: 20, bl: 1, cl: { rgb: '#166534' } } } },
    1: { 0: { v: 'Edit amber dates, day offsets or weekend patterns. Green formulas recalculate in the sheet.' } },
    3: Object.fromEntries(
      ['Calendar', 'Start date', 'Day offset', 'Weekend', 'Result date', 'Inclusive days', '', 'Holiday', 'Reason'].map(
        (v, col) => [col, { v, s: { bl: 1, bg: { rgb: '#DCFCE7' } } }],
      ),
    ),
    12: { 0: { v: 'Weekend codes: 1 = Saturday / Sunday; 7 = Friday / Saturday; 11 = Sunday only.' } },
    13: {
      0: {
        v: 'A seven-character mask runs Monday to Sunday: 1 means non-working; 0000110 excludes Friday and Saturday.',
      },
    },
    14: { 0: { v: 'WORKDAY excludes the start date. NETWORKDAYS counts both endpoints when they are working days.' } },
    16: { 0: { v: 'Try C5 = 4: E5 becomes Sep 15, 2026 and F5 becomes 5. Select E5 to inspect the real formula.' } },
  }
  rows.forEach((row, index) => {
    cellData[index + 4] = Object.fromEntries(
      row.map((value, col) => [
        col,
        {
          ...(typeof value === 'string' && value.startsWith('=') ? { f: value } : { v: value }),
          s: {
            bg: { rgb: col >= 4 ? '#F0FDF4' : col > 0 ? '#FEF3C7' : '#FFFFFF' },
            ...(col === 1 || col === 4 ? { n: { pattern: 'mmm d, yyyy' } } : {}),
            ...(col === 3 && typeof value === 'string' ? { n: { pattern: '@' } } : {}),
          },
        },
      ]),
    )
  })
  cellData[4][7] = { v: date(10), s: { bg: { rgb: '#FEF3C7' }, n: { pattern: 'mmm d, yyyy' } } }
  cellData[4][8] = { v: 'Maintenance day' }
  cellData[5][7] = { v: date(14), s: { bg: { rgb: '#FEF3C7' }, n: { pattern: 'mmm d, yyyy' } } }
  cellData[5][8] = { v: 'Team closure' }
  return {
    id: 'working-day-calendars',
    name: 'Working-day calendars',
    locale: LocaleType.EN_US,
    sheetOrder: ['calendars'],
    sheets: {
      calendars: {
        id: 'calendars',
        name: 'Working days',
        rowCount: 30,
        columnCount: 12,
        defaultRowHeight: 32,
        defaultColumnWidth: 100,
        columnData: {
          0: { w: 205 },
          1: { w: 130 },
          2: { w: 95 },
          3: { w: 110 },
          4: { w: 135 },
          5: { w: 120 },
          6: { w: 24 },
          7: { w: 135 },
          8: { w: 170 },
        },
        cellData,
      },
    },
  }
}
