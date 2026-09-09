import type { ICellData, IWorkbookData } from '@univerjs/core'
import { BooleanNumber, LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const pages = [
    {
      id: 'overview',
      name: 'Overview',
      color: '#4F46E5',
      title: 'Workshop workbook',
      hint: 'Select a tab, then right-click to rename, color or hide it. Archive starts hidden; restore it with Unhide.',
      headers: ['Sheet', 'Purpose', 'Initial state'],
      rows: [
        ['Overview', 'Navigate the workbook', 'Visible · indigo'],
        ['Supplies', 'Three materials to prepare', 'Visible · copper'],
        ['Delivery', 'Two dispatches to arrange', 'Visible · teal'],
        ['Archive', 'Previous workshop records', 'Hidden · slate'],
      ],
    },
    {
      id: 'supplies',
      name: 'Supplies',
      color: '#B45309',
      title: 'Materials to prepare',
      hint: 'Try renaming this tab to Materials. The sheet content remains unchanged.',
      headers: ['Material', 'Quantity', 'Unit'],
      rows: [
        ['Cotton paper', 24, 'sheets'],
        ['Ink bottles', 3, 'bottles'],
        ['Binding thread', 18, 'meters'],
      ],
    },
    {
      id: 'delivery',
      name: 'Delivery',
      color: '#0F766E',
      title: 'Dispatch checklist',
      hint: 'Hide this tab, then restore it from another visible tab. See the README for a public Facade ordering recipe.',
      headers: ['Destination', 'Crates', 'Status'],
      rows: [
        ['North studio', 4, 'Ready'],
        ['Riverside room', 2, 'Packing'],
      ],
    },
    {
      id: 'archive',
      name: 'Archive',
      color: '#64748B',
      title: 'Previous workshop',
      hint: 'This sheet was hidden, not deleted. Hiding a sheet is navigation, not access control.',
      headers: ['Session', 'Attendees', 'Completed pieces'],
      rows: [
        ['Monoprint morning', 12, 36],
        ['Bookbinding afternoon', 8, 8],
      ],
    },
  ]
  return {
    id: 'worksheet-tabs-workbook',
    name: 'Workshop workbook',
    locale: LocaleType.EN_US,
    sheetOrder: pages.map(({ id }) => id),
    sheets: Object.fromEntries(
      pages.map(({ id, name, color, title, hint, headers, rows }) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { v: title, s: { fs: 21, bl: 1, cl: { rgb: color } } } },
          1: { 0: { v: hint } },
          3: Object.fromEntries(
            headers.map((v, col) => [col, { v, s: { bg: { rgb: color }, cl: { rgb: '#FFFFFF' }, bl: 1 } }]),
          ),
        }
        rows.forEach((row, index) => {
          cellData[index + 4] = Object.fromEntries(
            row.map((v, col) => [col, { v, s: { bg: { rgb: index % 2 ? '#FFFFFF' : '#F1F5F9' } } }]),
          )
        })
        return [
          id,
          {
            id,
            name,
            tabColor: color,
            hidden: id === 'archive' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
            rowCount: 24,
            columnCount: 12,
            defaultRowHeight: 36,
            defaultColumnWidth: 115,
            columnData: { 0: { w: 230 }, 1: { w: 285 }, 2: { w: 235 } },
            cellData,
          },
        ]
      }),
    ),
  }
}
