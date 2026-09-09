import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })
const input = (v: string | number | null): ICellData => ({
  ...(v === null ? {} : typeof v === 'string' ? text(v) : { v }),
  s: { bg: { rgb: '#FEF3C7' } },
})

export function createWorkbookData(): Partial<IWorkbookData> {
  const dispatch: Record<number, Record<number, ICellData>> = {
    0: { 0: { ...text('Combine conditions before making a decision'), s: { fs: 19, bl: 1, cl: { rgb: '#0F766E' } } } },
    1: {
      0: text(
        'Inputs C:E use 1 / 0 flags. Release needs stock, payment and no hold; attention needs express service or no stock.',
      ),
    },
    3: Object.fromEntries(
      ['Shipment', 'Units', 'Paid', 'Hold', 'Express', 'IF + AND', 'IF + OR', 'NOT hold', 'XOR paid / express'].map(
        (v, c) => [c, { ...text(v), s: { bl: 1, bg: { rgb: '#CCFBF1' } } }],
      ),
    ),
    12: { 0: text('Edit D7 from 1 to 0: the held shipment changes from Wait to Release; NOT hold changes to TRUE.') },
    14: {
      0: text('XOR is TRUE when exactly one of these two flags is true. Two true flags produce FALSE, unlike OR.'),
    },
    16: {
      0: text(
        'The last Units cell is genuinely blank. The > 0 / <= 0 tests here treat it like zero, not available stock.',
      ),
    },
  }
  const rows: [string, number | null, number, number, number][] = [
    ['Harbor notebooks', 3, 1, 0, 0],
    ['Rush ink refill', 0, 1, 0, 1],
    ['Held art prints', 2, 1, 1, 1],
    ['Unpaid envelopes', 4, 0, 0, 1],
    ['Express paper', 2, 1, 0, 1],
    ['Draft request', null, 0, 0, 0],
  ]
  rows.forEach(([label, ...values], i) => {
    const r = i + 5
    dispatch[r - 1] = {
      0: text(label),
      ...Object.fromEntries(values.map((v, c) => [c + 1, input(v)])),
      5: { f: `=IF(AND(B${r}>0,C${r}=1,NOT(D${r}=1)),"Release","Wait")` },
      6: { f: `=IF(OR(E${r}=1,B${r}<=0),"Attention","Routine")` },
      7: { f: `=NOT(D${r}=1)` },
      8: { f: `=XOR(C${r}=1,E${r}=1)` },
    }
  })
  const routing: Record<number, Record<number, ICellData>> = {
    0: {
      0: {
        ...text('Decision coverage is different from error recovery'),
        s: { fs: 19, bl: 1, cl: { rgb: '#9D174D' } },
      },
    },
    1: {
      0: text(
        'IFS chooses the first matching threshold. SWITCH maps an exact service code and supplies an explicit default.',
      ),
    },
    3: Object.fromEntries(
      ['Request', 'Score', 'Service code', 'Partial IFS', 'IFERROR', 'IFNA', 'SWITCH route', 'Complete policy'].map(
        (v, c) => [c, { ...text(v), s: { bl: 1, bg: { rgb: '#FCE7F3' } } }],
      ),
    ),
    12: {
      0: text(
        'Zero is a valid low score; blank means not assessed. H handles these separately before applying the complete threshold policy.',
      ),
    },
    14: {
      0: text(
        'D intentionally omits a final TRUE branch. IFNA catches its unmatched #N/A, but preserves malformed-score #VALUE!.',
      ),
    },
    16: {
      0: text(
        'Change B9 from pending to 55: raw IFS, both recovery columns and the complete policy all become Standard.',
      ),
    },
  }
  const scores: [string, number | string | null, string | null][] = [
    ['Gallery launch', 85, 'E'],
    ['Workshop restock', 60, 'S'],
    ['Trial request', 0, 'X'],
    ['Awaiting review', null, null],
    ['Imported draft', 'pending', 'E'],
    ['High-priority proof', 100, 'S'],
  ]
  scores.forEach(([label, score, code], i) => {
    const r = i + 5
    routing[r - 1] = {
      0: text(label),
      1: input(score),
      2: input(code),
      3: { f: `=IFS(B${r}+0>=80,"Priority",B${r}+0>=50,"Standard")` },
      4: { f: `=IFERROR(D${r},"Review")` },
      5: { f: `=IFNA(D${r},"Unassigned")` },
      6: { f: `=SWITCH(C${r},"E","Express","S","Standard","Unknown")` },
      7: { f: `=IF(B${r}="","Await score",IFS(B${r}+0>=80,"Priority",B${r}+0>=50,"Standard",TRUE,"Basic"))` },
    }
  })
  return {
    id: 'logical-decisions-workbook',
    name: 'Logical decisions and recovery',
    locale: LocaleType.EN_US,
    sheetOrder: ['dispatch', 'routing'],
    sheets: Object.fromEntries(
      (
        [
          ['dispatch', 'Dispatch decisions', dispatch],
          ['routing', 'Policy coverage', routing],
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
          defaultColumnWidth: 120,
          columnData: {
            0: { w: 195 },
            1: { w: 100 },
            2: { w: id === 'dispatch' ? 70 : 115 },
            3: { w: id === 'dispatch' ? 70 : 140 },
            4: { w: id === 'dispatch' ? 85 : 120 },
            5: { w: 125 },
            6: { w: 140 },
            7: { w: id === 'dispatch' ? 105 : 155 },
            8: { w: 190 },
          },
        },
      ]),
    ),
  }
}
