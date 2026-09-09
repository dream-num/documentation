import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const specimens = [
    {
      id: 'values',
      name: 'Values and formulas',
      items: ['Linen folios', 'Brass clips', 'Cork sleeves', 'Maple stands'],
      qty: [6, 12, 4, 9],
      price: [8, 3, 15, 7],
      hint: 'Copy B5:D8 to G5. Compare ordinary paste with Paste Value; copy D5:D8 to I5 for Paste Formula.',
    },
    {
      id: 'formats',
      name: 'Formats and widths',
      items: ['Indigo ink', 'Copper foil', 'Cotton tape', 'Bone folders'],
      qty: [3, 7, 8, 5],
      price: [18, 11, 4, 9],
      hint: 'Copy B5:D8 to G5, then choose Paste Format: amber destination numbers must remain unchanged.',
    },
    {
      id: 'external',
      name: 'External clipboard',
      items: ['Workshop tickets', 'Guest badges', 'Table cards', 'Envelope sets'],
      qty: [8, 5, 12, 7],
      price: [25, 6, 4, 9],
      hint: 'Paste external tab-separated text or an HTML table into G5. README recipes use the public pasteIntoSheet API.',
    },
  ]
  return {
    id: 'bindery-clipboard',
    name: 'Bindery dispatch · clipboard comparisons',
    locale: LocaleType.EN_US,
    sheetOrder: specimens.map(({ id }) => id),
    sheets: Object.fromEntries(
      specimens.map(({ id, name, items, qty, price, hint }) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { v: name, s: { fs: 18, bl: 1, cl: { rgb: '#155E75' } } } },
          1: { 0: { v: hint } },
          3: Object.fromEntries(
            [
              'Source item',
              'Quantity',
              'Unit cost',
              'Formula total',
              '',
              'Destination item',
              'Quantity',
              'Unit cost',
              'Existing total',
            ].map((v, c) => [c, { v, s: { bl: 1, bg: { rgb: c < 4 ? '#CFFAFE' : '#FEF3C7' } } }]),
          ),
          10: {
            0: {
              v: 'Source cells B:D are teal. Destination G:I is amber so pasted formatting is visibly distinguishable.',
            },
          },
          12: {
            0: { v: 'Native: copy the source, select the destination, right-click > Paste Special > choose one mode.' },
          },
          14: {
            0: {
              v: 'Formula-only paste repositions relative references. Inspect the formula bar, not just the displayed number.',
            },
          },
        }
        items.forEach((item, r) => {
          const row = r + 4
          cellData[row] = {
            0: { v: item, t: CellValueType.STRING },
            5: { v: `Batch ${r + 1}`, t: CellValueType.STRING },
          }
          for (const [c, v] of [
            [1, qty[r]],
            [2, price[r]],
            [3, qty[r] * price[r]],
          ] as const)
            cellData[row][c] = {
              v,
              t: CellValueType.NUMBER,
              s: { bg: { rgb: r % 2 ? '#CFFAFE' : '#ECFEFF' }, cl: { rgb: '#155E75' }, bl: 1 },
            }
          cellData[row][3].f = `=B${row + 1}*C${row + 1}`
          for (const [c, v] of [
            [6, r + 2],
            [7, 20 + r * 5],
            [8, 900 + r * 10],
          ] as const)
            cellData[row][c] = {
              v,
              t: CellValueType.NUMBER,
              s: { bg: { rgb: r % 2 ? '#FDE68A' : '#FEF3C7' }, cl: { rgb: '#92400E' } },
            }
        })
        return [
          id,
          {
            id,
            name,
            rowCount: 24,
            columnCount: 14,
            defaultRowHeight: 40,
            defaultColumnWidth: 90,
            columnData: {
              0: { w: 185 },
              1: { w: 90 },
              2: { w: 100 },
              3: { w: 145 },
              4: { w: 35 },
              5: { w: 180 },
              6: { w: 115 },
              7: { w: 115 },
              8: { w: 155 },
            },
            cellData,
          },
        ]
      }),
    ),
  }
}
