import type { ICellData, IWorkbookData, IWorksheetData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export function createWorkbookData(_legacyChinese = false): Partial<IWorkbookData> {
  const names = ['Header rows', 'Identity columns', 'Rows and columns']
  const sheets: Record<string, Partial<IWorksheetData>> = {}
  for (const [index, id] of ['rows', 'columns', 'both'].entries()) {
    const accent = ['#075985', '#9a3412', '#115e59'][index]
    const cellData: Record<number, Record<number, ICellData>> = {}
    const headings = [
      'Station',
      'Location',
      ...Array.from(
        { length: 12 },
        (_, i) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      ),
    ]
    const notes = [
      'Scroll down: the first two rows stay visible',
      'Scroll right: the first two columns stay visible',
      'Scroll both ways: two rows and two columns stay visible',
    ]
    cellData[0] = { 0: { v: notes[index], s: { bg: { rgb: accent }, cl: { rgb: '#ffffff' }, bl: 1, fs: 13 } } }
    cellData[1] = Object.fromEntries(
      headings.map((v, c) => [c, { v, s: { bg: { rgb: '#e2e8f0' }, cl: { rgb: '#0f172a' }, bl: 1 } }]),
    )
    for (let r = 2; r < 82; r++) {
      cellData[r] = Object.fromEntries(
        headings.map((_, c) => [
          c,
          {
            v:
              c === 0
                ? `WX-${String(r - 1).padStart(3, '0')}`
                : c === 1
                  ? `Station ${r - 1}`
                  : 20 + ((r * 17 + c * 11) % 180),
            s: { bg: { rgb: c < 2 ? '#f1f5f9' : r % 2 ? '#ffffff' : '#f0fdfa' }, cl: { rgb: '#0f172a' } },
          },
        ]),
      )
    }
    sheets[id] = {
      id,
      name: names[index],
      rowCount: 100,
      columnCount: 20,
      defaultRowHeight: 27,
      defaultColumnWidth: 92,
      columnData: { 0: { w: 110 }, 1: { w: 140 } },
      rowData: { 0: { h: 34 } },
      mergeData: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 13 }],
      cellData,
    }
  }
  return {
    id: 'weather-freeze-panes',
    name: 'Rainfall stations · Freeze panes',
    locale: LocaleType.EN_US,
    sheetOrder: ['rows', 'columns', 'both'],
    sheets,
  }
}
