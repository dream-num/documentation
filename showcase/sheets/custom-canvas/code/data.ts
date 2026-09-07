import type { IWorkbookData, ICellData } from '@univerjs/core'
import { VerticalAlign } from '@univerjs/core'

export const LOTS: Array<[string, string, number | string | null, number, string]> = [
  ['M-041', 'Blue flax', 87, 640, 'Cold room'],
  ['M-042', 'Field poppy', 25, 120, 'Dry cabinet'],
  ['M-043', 'Cornflower', 100, 980, 'Cold room'],
  ['M-044', 'Red clover', 0, 0, 'Retest'],
  ['M-045', 'Wild carrot', 52.5, 305, 'Dry cabinet'],
  ['M-046', 'Yarrow', null, 210, 'Awaiting assay'],
  ['M-047', 'Oxeye daisy', 'pending', 475, 'Awaiting assay'],
  ['M-048', 'Meadow sage', -10, 80, 'Check source'],
  ['M-049', 'Birdsfoot trefoil', 120, 340, 'Check source'],
  ['M-050', 'Small scabious', 63, 230, 'Cold room'],
  ['M-051', 'Betony', 91, 560, 'Cold room'],
  ['M-052', 'Lady’s bedstraw', 34, 175, 'Dry cabinet'],
  ['M-053', 'Wild marjoram', 78, 420, 'Cold room'],
  ['M-054', 'Selfheal', 45, 190, 'Dry cabinet'],
  ['M-055', 'Ragged robin', 96, 760, 'Cold room'],
  ['M-056', 'Cowslip', 12, 75, 'Retest'],
  ['M-057', 'Viper’s bugloss', 68, 310, 'Cold room'],
  ['M-058', 'Musk mallow', 83, 550, 'Cold room'],
  ['M-059', 'Greater knapweed', 39, 280, 'Dry cabinet'],
  ['M-060', 'Harebell', 5, 45, 'Retest'],
  ['M-061', 'Yellow rattle', 74, 615, 'Cold room'],
  ['M-062', 'Wild basil', 57, 390, 'Dry cabinet'],
  ['M-063', 'Meadow vetchling', 99, 825, 'Cold room'],
  ['M-064', 'Wood avens', 41, 155, 'Dry cabinet'],
]
const cellData: Record<number, Record<number, ICellData>> = {
  0: { 0: { v: 'MOSSBROOK / SEED BANK', s: { bl: 1, cl: { rgb: '#0F766E' } } } },
  1: { 0: { v: 'Original fictional lots · render layer does not change cell values' } },
  2: Object.fromEntries(
    ['Lot', 'Species', 'Germination %', 'Seeds held', 'Storage'].map((v, c) => [
      c,
      { v, s: { bl: 1, bg: { rgb: '#E2E8F0' } } },
    ]),
  ),
  28: { 0: { v: 'Seeds held total' }, 3: { f: '=SUM(D4:D27)' } },
  30: { 0: { v: 'Outside the render range: preserve this note.' } },
}
for (const [index, lot] of LOTS.entries())
  cellData[index + 3] = Object.fromEntries(
    lot.map((v, c) => [
      c,
      {
        ...(v == null ? {} : { v }),
        s: { vt: VerticalAlign.MIDDLE, ...(c === 2 ? { n: { pattern: '0.0"%"' } } : {}) },
      },
    ]),
  )
export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'mossbrook-seed-bank',
  name: 'Mossbrook seed bank',
  sheetOrder: ['lots', 'reference'],
  sheets: {
    lots: {
      id: 'lots',
      name: 'Seed lots',
      rowCount: 60,
      columnCount: 12,
      defaultRowHeight: 38,
      defaultColumnWidth: 120,
      columnData: { 0: { w: 85 }, 1: { w: 190 }, 2: { w: 170 }, 4: { w: 175 } },
      cellData,
    },
    reference: {
      id: 'reference',
      name: 'Reference',
      rowCount: 20,
      columnCount: 8,
      defaultColumnWidth: 180,
      cellData: { 0: { 0: { v: 'No custom drawing on this worksheet' } }, 3: { 2: { v: 87 } } },
    },
  },
}
