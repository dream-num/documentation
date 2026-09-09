import type { ICellData, IWorkbookData, IWorksheetData } from '@univerjs/presets'
import { LocaleType } from '@univerjs/presets'
export const IDS = { summary: 'tern-summary', income: 'tern-income', costs: 'tern-costs', fx: 'tern-fx' }
export type Book = keyof typeof IDS
export const bookNames = (_legacyChinese = false) => ({
  summary: 'Summary',
  income: 'Sales',
  costs: 'Costs',
  fx: 'Rates',
})
const value = (v: string | number, editable = false): ICellData => ({
  v,
  ...(editable ? { s: { bg: { rgb: '#fef3c7' } } } : {}),
})
const formula = (f: string): ICellData => ({ f, s: { bg: { rgb: '#ddf3e9' }, bl: 1, n: { pattern: '0.00' } } })
const heading = (text: string): ICellData => ({
  v: text,
  s: { bg: { rgb: '#176b87' }, cl: { rgb: '#ffffff' }, bl: 1 },
})
const sheet = (name: string, cells: Record<number, Record<number, ICellData>>): Partial<IWorksheetData> => ({
  id: 'main',
  name,
  rowCount: 24,
  columnCount: 10,
  defaultRowHeight: 30,
  defaultColumnWidth: 110,
  columnData: { 0: { w: 280 }, 1: { w: 145 }, 2: { w: 140 }, 3: { w: 420 } },
  cellData: cells,
})
export function createWorkbooks(_legacyChinese = false): Partial<IWorkbookData>[] {
  const names = bookNames()
  const ref = (key: Book, address: string) => "'[" + IDS[key] + ']' + names[key] + "'!" + address
  const references = [
    ['Single cell', '=' + ref('income', 'D4')],
    ['External range SUM', '=SUM(' + ref('income', 'D4:D6') + ')'],
    ['Two source workbooks', '=' + ref('income', 'D8') + '-' + ref('costs', 'B8')],
    ['Same workbook, other sheet', "='Local Notes'!B4"],
    ['Missing workbook', "='[tern-not-loaded]" + names.income + "'!D4"],
    ['Missing worksheet', "='[tern-income]Unknown Stage'!D4"],
  ]
  const summary: Record<number, Record<number, ICellData>> = {
    0: { 0: heading('CROSS-WORKBOOK REFERENCES') },
    2: {
      0: value('Reference variant'),
      1: value('SDK result'),
      3: value('Formula text'),
    },
  }
  references.forEach(([title, expression], index) => {
    summary[index + 3] = { 0: value(title), 1: formula(expression), 3: value(expression) }
  })
  summary[10] = {
    0: value('Net × rate (third source)'),
    1: formula('=B6*' + ref('fx', 'B4')),
  }
  summary[11] = { 0: value('Transitive converted costs'), 1: formula('=' + ref('costs', 'B10')) }
  const main = {
    summary: sheet(names.summary, summary),
    income: sheet(names.income, {
      0: { 0: heading('EDIT YELLOW INPUT CELLS') },
      2: {
        0: value('Item'),
        1: value('Quantity'),
        2: value('Price'),
        3: value('Revenue'),
      },
      3: { 0: value('Paper'), 1: value(120, true), 2: value(12.5, true), 3: formula('=B4*C4') },
      4: { 0: value('Pens'), 1: value(80, true), 2: value(15, true), 3: formula('=B5*C5') },
      5: {
        0: value('Folders (zero order)'),
        1: value(0, true),
        2: value(40, true),
        3: formula('=B6*C6'),
      },
      7: { 0: value('Total'), 1: formula('=SUM(B4:B6)'), 3: formula('=SUM(D4:D6)') },
    }),
    costs: sheet(names.costs, {
      0: { 0: heading('COSTS AND CREDIT') },
      2: { 0: value('Item'), 1: value('Amount') },
      3: { 0: value('Delivery'), 1: value(325.5, true) },
      4: { 0: value('Storage'), 1: value(480, true) },
      5: { 0: value('Refund'), 1: value(-25.5, true) },
      7: { 0: value('Total'), 1: formula('=SUM(B4:B6)') },
      9: { 0: value('Converted costs'), 1: formula('=B8*' + ref('fx', 'B4')) },
    }),
    fx: sheet(names.fx, {
      0: { 0: heading('LOCAL RATE INPUT') },
      2: { 0: value('Parameter'), 1: value('Value') },
      3: { 0: value('Example multiplier (not live FX)'), 1: value(1.25, true) },
    }),
  }
  return (Object.keys(IDS) as Book[]).map((key) => ({
    id: IDS[key],
    name: names[key],
    locale: LocaleType.EN_US,
    sheetOrder: key === 'summary' ? ['main', 'notes'] : ['main'],
    sheets: {
      main: main[key],
      ...(key === 'summary'
        ? {
            notes: {
              ...sheet('Local Notes', {
                3: { 0: value('Local reference value'), 1: value(42, true) },
              }),
              id: 'notes',
            },
          }
        : {}),
    },
  }))
}
