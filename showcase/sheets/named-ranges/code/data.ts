import type { ICellData, IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const inputRows = [
    ['Festival ticket desk'],
    ['Edit ticket income or the service rate. Both sheets use the same names.'],
    [],
    ['Session', 'Income'],
    ['Morning', 120],
    ['Afternoon', 180],
    ['Evening', 240],
    [],
    ['Setting', 'Value'],
    ['Service rate', 0.1],
  ]
  const summaryRows = [
    ['Names make formulas readable'],
    ['Select a result to inspect its native formula. Names have workbook scope.'],
    [],
    ['Reference style', 'Live result', 'Formula shown as text'],
    ['Ordinary address', '=SUM(Inputs!B5:B7)', 'SUM(Inputs!B5:B7)'],
    ['Named range', '=SUM(TicketSales)', 'SUM(TicketSales)'],
    ['Named scalar', '=SUM(TicketSales)*ServiceRate', 'SUM(TicketSales)*ServiceRate'],
    ['Named formula', '=NetRevenue', 'NetRevenue'],
    [],
    ['Defined name', 'Meaning', 'Definition'],
    ['TicketSales', 'Three ticket-income cells', 'Inputs!$B$5:$B$7'],
    ['ServiceRate', 'Single editable rate', 'Inputs!$B$10'],
    ['NetRevenue', 'Reusable calculation', 'SUM(TicketSales)*(1-ServiceRate)'],
  ]
  const specimens: [string, string, (string | number)[][]][] = [
    ['summary', 'Summary', summaryRows],
    ['inputs', 'Inputs', inputRows],
  ]
  const sheets = Object.fromEntries(
    specimens.map(([id, name, rows]) => {
      const cellData: Record<number, Record<number, ICellData>> = {}
      rows.forEach((row, rowIndex) => {
        cellData[rowIndex] = Object.fromEntries(
          row.map((value, col) => [
            col,
            {
              ...(typeof value === 'string' && value.startsWith('=') ? { f: value } : { v: value }),
              s: {
                bg: {
                  rgb:
                    rowIndex === 3
                      ? '#581C87'
                      : col === 1 && rowIndex > 3
                        ? id === 'inputs'
                          ? '#FEF3C7'
                          : '#F3E8FF'
                        : '#FFFFFF',
                },
                cl: { rgb: rowIndex === 3 ? '#FFFFFF' : '#3B254C' },
                ...(rowIndex === 3 ? { bl: 1 } : {}),
              },
            },
          ]),
        )
      })
      cellData[0][0].s = { fs: 22, bl: 1, cl: { rgb: '#581C87' } }
      return [
        id,
        {
          id,
          name,
          rowCount: 22,
          columnCount: 8,
          defaultRowHeight: 38,
          columnData: { 0: { w: 235 }, 1: { w: 235 }, 2: { w: 390 } },
          rowData: { 0: { h: 48 } },
          mergeData: [
            { startRow: 0, endRow: 0, startColumn: 0, endColumn: 2 },
            { startRow: 1, endRow: 1, startColumn: 0, endColumn: 2 },
          ],
          cellData,
        },
      ]
    }),
  )
  return {
    id: 'festival-defined-names',
    name: 'Festival defined names',
    locale: LocaleType.EN_US,
    sheetOrder: ['summary', 'inputs'],
    sheets,
  }
}
