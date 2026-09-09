import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'
const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })
const number = (v: number): ICellData => ({ v, t: CellValueType.NUMBER })
export function createWorkbookData(): Partial<IWorkbookData> {
  const costs: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Inspect a real formula dependency chain') },
    1: { 0: text('Edit B5: it feeds both the line amount and packing cards. Summary adds a cross-sheet chain.') },
    3: {
      0: text('Production item'),
      1: text('Quantity'),
      2: text('Unit cost'),
      3: text('Line amount'),
      5: text('Shared input / independent branch'),
    },
    4: {
      0: text('Proof booklet'),
      1: number(2),
      2: number(12),
      3: { f: '=B5*C5' },
      5: text('Packing cards'),
      6: { f: '=B5*2' },
    },
    5: { 0: text('Label roll'), 1: number(5), 2: number(7), 3: { f: '=B6*C6' } },
    6: {
      0: text('Poster set'),
      1: number(3),
      2: number(6),
      3: { f: '=B7*C7' },
      5: text('Spare blue clips'),
      6: number(4),
    },
    7: { 5: text('Spare brass clips'), 6: number(9) },
    9: {
      0: text('Production subtotal'),
      3: { f: '=SUM(D5:D7)' },
      5: text('Independent clip total'),
      6: { f: '=SUM(G7:G8)' },
    },
    11: { 0: text('Handling input'), 1: number(5), 2: text('Net cost'), 3: { f: '=D10+B12' } },
    15: { 0: text('D5 → D10 → D12 is a same-sheet chain. B5 also directly drives G5.') },
    17: { 0: text('G10 uses separate inputs. Dependency inspection should distinguish it from the cost chain.') },
    19: { 0: text('README queries return SDK dependency metadata in the console; this is not a trace-arrow UI.') },
  }
  const summary: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Cross-sheet summary and an unrelated formula') },
    1: { 0: text('The net cost is referenced, not copied. Edit the Cost model tab and compare this summary.') },
    3: { 0: text('Cost chain'), 1: text('Value'), 4: text('Independent stock') },
    4: { 0: text('Net cost from Cost model'), 1: { f: "='Cost model'!D12" }, 4: { f: '=SUM(E7:E8)' } },
    5: { 0: text('Tax rate'), 1: number(0.1) },
    6: { 0: text('Tax amount'), 1: { f: '=B5*B6' }, 3: text('Small cartons'), 4: number(3) },
    7: { 0: text('Total including tax'), 1: { f: '=B5+B7' }, 3: text('Large cartons'), 4: number(11) },
    11: {
      0: text('Query B5:B8 to inspect formulas located here, or query the input on Cost model to find consumers.'),
    },
    13: {
      0: text('The stock total E5 does not consume cost-model inputs and remains unchanged when B5 there changes.'),
    },
  }
  const sheets = {
    costs: { id: 'costs', name: 'Cost model', cellData: costs },
    summary: { id: 'summary', name: 'Summary', cellData: summary },
  }
  for (const sheet of Object.values(sheets)) {
    sheet.cellData[0][0].s = { fs: 19, bl: 1, cl: { rgb: '#075985' } }
    for (const cell of Object.values(sheet.cellData[3])) cell.s = { bl: 1, bg: { rgb: '#E0F2FE' } }
    for (const row of Object.values(sheet.cellData))
      for (const cell of Object.values(row)) {
        if (cell.f) cell.s = { bg: { rgb: '#F0FDFA' } }
        else if (cell.t === CellValueType.NUMBER) cell.s = { bg: { rgb: '#FEF3C7' } }
      }
  }
  return {
    id: 'dependency-inspection-workbook',
    name: 'Production dependency inspection',
    locale: LocaleType.EN_US,
    sheetOrder: ['costs', 'summary'],
    sheets: Object.fromEntries(
      Object.entries(sheets).map(([id, sheet]) => [
        id,
        {
          ...sheet,
          rowCount: 25,
          columnCount: 9,
          defaultRowHeight: 32,
          defaultColumnWidth: 110,
          columnData: {
            0: { w: 235 },
            1: { w: 130 },
            2: { w: 110 },
            3: { w: 160 },
            4: { w: 110 },
            5: { w: 225 },
            6: { w: 130 },
          },
        },
      ]),
    ),
  }
}
