import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'
const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })
export function createWorkbookData(): Partial<IWorkbookData> {
  const definitions = [
    {
      id: 'priority',
      name: 'Background priority',
      title: 'Competing fills · the earlier rule wins',
      values: [49, 50, 51, 80, 81, 95],
      high: '> 80: mint background',
      low: '> 50: amber background',
      note: '81 and 95 match both rules. Moving amber before mint changes only their competing fill.',
    },
    {
      id: 'merge',
      name: 'Style merge',
      title: 'Independent style properties can combine',
      values: [0, 50, 60, 80, 90, 100],
      high: '> 80: mint background',
      low: '> 50: burgundy text',
      note: '90 and 100 combine mint fill and burgundy text. The higher rule does not stop lower rules.',
    },
    {
      id: 'stop',
      name: 'Stop if true',
      title: 'A matching stop rule blocks later rules',
      values: [35, 50, 65, 80, 85, 98],
      high: '> 80: mint background; stop = true',
      low: '> 50: burgundy text',
      note: '85 and 98 use mint fill without the later burgundy text. At 80, the stop rule does not match.',
    },
  ]
  return {
    id: 'conditional-priority-workbook',
    name: 'Conditional rule priority',
    locale: LocaleType.EN_US,
    sheetOrder: definitions.map((d) => d.id),
    sheets: Object.fromEntries(
      definitions.map((d) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { ...text(d.title), s: { fs: 19, bl: 1, cl: { rgb: '#0F766E' } } } },
          1: {
            0: text(
              'Edit a score or inspect the native conditional-formatting manager. Rules never change the values.',
            ),
          },
          3: { 0: text('Inspection batch'), 1: text('Score'), 3: text('Ordered conditional rules') },
          4: { 3: text('1 / higher priority'), 5: text(d.high) },
          6: { 3: text('2 / lower priority'), 5: text(d.low) },
          12: { 0: text(d.note) },
          14: { 0: text('All matches target B5:B10. Scores of exactly 50 or 80 test the strict > boundaries.') },
        }
        d.values.forEach((v, r) => {
          cellData[r + 4] ??= {}
          cellData[r + 4][0] = text(
            ['Print proof', 'Window label', 'Studio card', 'Poster trim', 'Display sign', 'Final pack'][r],
          )
          cellData[r + 4][1] = { v, t: CellValueType.NUMBER }
        })
        for (const c of Object.values(cellData[3])) c.s = { bl: 1, bg: { rgb: '#E0F2FE' } }
        return [
          d.id,
          {
            id: d.id,
            name: d.name,
            cellData,
            rowCount: 22,
            columnCount: 9,
            defaultRowHeight: 36,
            defaultColumnWidth: 120,
            columnData: { 0: { w: 200 }, 1: { w: 130 }, 2: { w: 35 }, 3: { w: 200 }, 4: { w: 25 }, 5: { w: 300 } },
          },
        ]
      }),
    ),
  }
}
