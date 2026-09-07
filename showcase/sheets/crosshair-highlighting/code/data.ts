import type { IWorkbookData, IWorksheetData } from '@univerjs/presets'

const headers = ['Room', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Hours', 'Coordinator']
function sheet(id: string, name: string, rows: (string | number | null)[][], empty: boolean): Partial<IWorksheetData> {
  const records = empty ? [headers] : [headers, ...rows]
  return {
    id,
    name,
    rowCount: 24,
    columnCount: 8,
    defaultRowHeight: 32,
    rowHeader: { width: 46 },
    columnHeader: { height: 28 },
    columnData: {
      0: { w: 190 },
      1: { w: 105 },
      2: { w: 105 },
      3: { w: 105 },
      4: { w: 105 },
      5: { w: 105 },
      6: { w: 110 },
      7: { w: 180 },
    },
    cellData: Object.fromEntries(
      records.map((values, r) => [
        r,
        Object.fromEntries(
          values.map((v, c) => [
            c,
            c === 6 && r > 0
              ? { f: '=SUM(B' + (r + 1) + ':F' + (r + 1) + ')' }
              : { v, ...(r === 0 ? { s: { bl: 1, bg: { rgb: '#dcfce7' } } } : {}) },
          ]),
        ),
      ]),
    ),
    ...(!empty
      ? {
          mergeData: [{ startRow: 10, endRow: 10, startColumn: 0, endColumn: 1 }],
        }
      : {}),
  }
}
// Fictional rehearsal hours: blanks, zero, fractions, Unicode and different weekday patterns.
export function createFixture(empty = false): Partial<IWorkbookData> {
  const rooms = sheet(
    'rooms',
    'This week',
    [
      ['Blackbird studio', 2, 3, 0, 4, 2, null, 'Mira'],
      ['Cedar hall', 4, 0, 3, 2, 5, null, 'Noé'],
      ['Loft rehearsal', 1.5, 2.5, 3, 0, 4, null, 'Aya'],
      ['Courtyard', null, 2, 0, 1, 3, null, 'Jun'],
      ['Percussion room', 3, 4, 2, 5, 0, null, 'Sam'],
      ['Choir room', 2, 2, 2, 2, 2, null, 'Léa'],
      ['Quiet practice', 0, 1, 0, 1.5, 2, null, 'Ren'],
      ['Open stage', 5, 3, 4, 6, 4, null, 'Mira'],
    ],
    empty,
  )
  if (!empty)
    rooms.cellData![10] = {
      0: { v: 'Evening programme', s: { bl: 1 } },
      2: { v: 'Quartet' },
      3: { v: '18:30' },
      5: { v: 0 },
      7: { v: 'Walk-ins welcome' },
    }
  return {
    id: 'oriole-rehearsals',
    name: 'Oriole rehearsal schedule',
    sheetOrder: empty ? ['rooms'] : ['rooms', 'archive'],
    sheets: {
      rooms,
      ...(!empty
        ? {
            archive: sheet(
              'archive',
              'Last week',
              [
                ['Blackbird studio', 3, 2, 1, 0, 4, null, 'Mira'],
                ['Cedar hall', 2, 4, 2, 3, 4, null, 'Noé'],
                ['Courtyard', 0, null, 0, 2, 1, null, 'Jun'],
                ['Guest room', 1, 0, 2.5, 0, 3, null, 'Inez'],
              ],
              false,
            ),
          }
        : {}),
    },
  }
}
