import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })

export function createWorkbookData(): Partial<IWorkbookData> {
  const dates: Record<number, Record<number, ICellData>> = {
    0: {
      0: { ...text('Build dates, then inspect the normalized result'), s: { fs: 19, bl: 1, cl: { rgb: '#047857' } } },
    },
    1: { 0: text('Amber inputs build a DATE. YEAR, MONTH and DAY read the result, not the original arguments.') },
    3: Object.fromEntries(
      ['Scenario', 'Year', 'Month', 'Day', 'DATE', 'YEAR', 'MONTH', 'DAY', 'EOMONTH + 0'].map((v, c) => [
        c,
        { ...text(v), s: { bl: 1, bg: { rgb: '#D1FAE5' } } },
      ]),
    ),
    12: {
      0: text('E5 as a raw date serial:'),
      4: { f: '=E5', s: { n: { pattern: '0' } } },
      6: text('Next month end:'),
      8: { f: '=EOMONTH(E5,1)', s: { n: { pattern: 'yyyy-mm-dd' } } },
    },
    14: { 0: text('Edit B5 from 2024 to 2025: February 29 normalizes to March 1; the month end becomes March 31.') },
    16: { 0: text('These are spreadsheet calendar serials, not UTC timestamps. No TODAY, NOW or host clock is used.') },
  }
  const dateRows: [string, number, number, number][] = [
    ['Leap-day delivery', 2024, 2, 29],
    ['Common-year overflow', 2025, 2, 29],
    ['Year rollover', 2026, 13, 1],
    ['Previous month end', 2026, 3, 0],
    ['Thirty-day overflow', 2026, 4, 31],
    ['Year-end review', 2026, 12, 31],
  ]
  dateRows.forEach(([label, year, month, day], i) => {
    const r = i + 5
    dates[r - 1] = {
      0: text(label),
      ...Object.fromEntries([year, month, day].map((v, c) => [c + 1, { v, s: { bg: { rgb: '#FEF3C7' } } }])),
    }
    dates[r - 1][4] = { f: `=DATE(B${r},C${r},D${r})`, s: { n: { pattern: 'yyyy-mm-dd' }, bg: { rgb: '#ECFDF5' } } }
    ;['YEAR', 'MONTH', 'DAY'].forEach((fn, c) => {
      dates[r - 1][c + 5] = { f: `=${fn}(E${r})` }
    })
    dates[r - 1][8] = { f: `=EOMONTH(E${r},0)`, s: { n: { pattern: 'yyyy-mm-dd' } } }
  })
  const times: Record<number, Record<number, ICellData>> = {
    0: { 0: { ...text('A clock time is a fraction of one day'), s: { fs: 19, bl: 1, cl: { rgb: '#6D28D9' } } } },
    1: { 0: text('TIME normalizes overflow into a clock time. Its serial has no retained whole-day duration.') },
    3: Object.fromEntries(
      ['Scenario', 'Hour', 'Minute', 'Second', 'TIME', 'Day fraction', 'HOUR', 'MINUTE', 'SECOND'].map((v, c) => [
        c,
        { ...text(v), s: { bl: 1, bg: { rgb: '#EDE9FE' } } },
      ]),
    ),
    12: {
      0: text('Date + time:'),
      4: { f: '=DATE(2026,9,9)+TIME(B5,C5,D5)', s: { n: { pattern: 'yyyy-mm-dd hh:mm:ss' } } },
    },
    14: { 0: text('Edit B5 from 8 to 9: E5 becomes 09:30:15, G5 becomes 9, and the combined timestamp changes too.') },
    16: {
      0: text(
        '25 hours becomes 01:00:00, not a 25-hour duration. Formatting changes presentation, not the numeric fraction.',
      ),
    },
  }
  const timeRows: [string, number, number, number][] = [
    ['Studio opens', 8, 30, 15],
    ['Noon checkpoint', 12, 0, 0],
    ['End of day', 23, 59, 59],
    ['Hour overflow', 25, 0, 0],
    ['Minute overflow', 0, 90, 0],
    ['Second overflow', 0, 0, 90],
  ]
  timeRows.forEach(([label, hour, minute, second], i) => {
    const r = i + 5
    times[r - 1] = {
      0: text(label),
      ...Object.fromEntries([hour, minute, second].map((v, c) => [c + 1, { v, s: { bg: { rgb: '#FEF3C7' } } }])),
    }
    times[r - 1][4] = { f: `=TIME(B${r},C${r},D${r})`, s: { n: { pattern: 'hh:mm:ss' }, bg: { rgb: '#F5F3FF' } } }
    times[r - 1][5] = { f: `=E${r}`, s: { n: { pattern: '0.000000' } } }
    ;['HOUR', 'MINUTE', 'SECOND'].forEach((fn, c) => {
      times[r - 1][c + 6] = { f: `=${fn}(E${r})` }
    })
  })
  return {
    id: 'date-time-workbook',
    name: 'Date and time formulas',
    locale: LocaleType.EN_US,
    sheetOrder: ['dates', 'times'],
    sheets: Object.fromEntries(
      (
        [
          ['dates', 'Calendar components', dates],
          ['times', 'Clock components', times],
        ] as const
      ).map(([id, name, cellData]) => [
        id,
        {
          id,
          name,
          cellData,
          rowCount: 25,
          columnCount: 10,
          defaultRowHeight: 34,
          defaultColumnWidth: 110,
          columnData: {
            0: { w: 215 },
            1: { w: 80 },
            2: { w: 80 },
            3: { w: 80 },
            4: { w: id === 'dates' ? 155 : 185 },
            5: { w: 115 },
            6: { w: 105 },
            7: { w: 90 },
            8: { w: 170 },
          },
        },
      ]),
    ),
  }
}
