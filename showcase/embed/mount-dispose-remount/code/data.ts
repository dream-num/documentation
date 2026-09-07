import type { IWorkbookData } from '@univerjs/presets'
import { LocaleType } from '@univerjs/presets'

export type Fixture = 'default' | 'empty' | 'boundary' | 'error'

// Original fictional trail-maintenance stock; stable SKUs identify records, not row numbers.
export const ITEMS = [
  ['KT-101', 'Folding trail saw', 'North hut', 24, 'each', '2027-03-29'],
  ['KT-102', 'Reflective marker', 'River shed', 85, 'each', '2027-03-30'],
  ['KT-103', 'Survey rope', 'Ridge store', 125.5, 'm', '2027-03-27'],
  ['KT-104', 'Drainage spade', 'North hut', 12, 'each', '2027-03-31'],
  ['KT-105', 'Bridge inspection tag', 'River shed', 0, 'each', '2027-03-28'],
  ['KT-106', 'Work gloves · small', 'Ridge store', 38, 'pair', '2027-03-29'],
  ['KT-107', 'Work gloves · large', 'North hut', 46, 'pair', '2027-03-30'],
  ['KT-108', 'Orange flagging tape', 'River shed', 210.75, 'm', '2027-03-31'],
  ['KT-109', 'Waterproof field book', 'Ridge store', 17, 'each', '2027-03-26'],
  ['KT-110', 'Hand lens', 'North hut', 9, 'each', '2027-03-27'],
  ['KT-111', 'Recycled stake', 'River shed', 142, 'each', '2027-03-28'],
  ['KT-112', 'Trail repair gravel', 'Ridge store', 680.25, 'kg', '2027-03-29'],
  ['KT-113', 'Steel carabiner', 'North hut', 31, 'each', '2027-03-30'],
  ['KT-114', 'Cable protector', 'River shed', 64.5, 'm', '2027-03-31'],
  ['KT-115', 'Reusable sample pouch', 'Ridge store', 73, 'each', '2027-03-26'],
  ['KT-116', 'Solar task light', 'North hut', 6, 'each', '2027-03-27'],
  ['KT-117', 'Seed mix · meadow', 'River shed', 8.125, 'kg', '2027-03-28'],
  ['KT-118', 'Brush-cleaning comb', 'Ridge store', 19, 'each', '2027-03-29'],
] as const

export function createInventory(fixture: Fixture): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'Kestrel Trailworks · depot inventory', s: 'title' } },
    1: { 0: { v: 'Fictional stock count · 2027-03-31 · edit blue quantity cells' } },
    2: Object.fromEntries(
      ['SKU', 'Item', 'Depot', 'On hand', 'Unit', 'Counted'].map((v, column) => [column, { v, s: 'header' }]),
    ),
  }
  if (fixture !== 'empty') {
    ITEMS.forEach((item, index) => {
      const row: Record<number, { v: string | number; s?: string }> = {}
      item.forEach((v, column) => {
        row[column] = { v, ...(column === 3 ? { s: 'quantity' } : {}) }
      })
      if (fixture === 'boundary') {
        if (index === 0) row[3].v = 0
        if (index === 1) row[3].v = 1000000
        if (index === 2) row[3].v = 0.125
      }
      cellData[index + 3] = row
    })
  }
  return {
    id: 'kestrel-inventory',
    name: 'Kestrel Trailworks inventory',
    locale: LocaleType.EN_US,
    sheetOrder: ['stock'],
    // beta.2 reloads an implicit empty string as '{}'; seed the explicit empty JSON resource for exact roundtrips.
    resources: [{ name: 'SHEET_DEFINED_NAME_PLUGIN', data: '{}' }],
    styles: {
      title: { bg: { rgb: '#164E63' }, cl: { rgb: '#FFFFFF' }, bl: 1 },
      header: { bg: { rgb: '#E0F2FE' }, cl: { rgb: '#0C4A6E' }, bl: 1 },
      quantity: { bg: { rgb: '#EFF6FF' }, cl: { rgb: '#1D4ED8' }, n: { pattern: '0.000' } },
    },
    sheets: {
      stock: {
        id: 'stock',
        name: 'Depot stock',
        rowCount: 36,
        columnCount: 8,
        defaultRowHeight: 26,
        columnData: { 0: { w: 100 }, 1: { w: 225 }, 2: { w: 125 }, 3: { w: 120 }, 4: { w: 65 }, 5: { w: 130 } },
        mergeData: [
          { startRow: 0, endRow: 0, startColumn: 0, endColumn: 5 },
          { startRow: 1, endRow: 1, startColumn: 0, endColumn: 5 },
        ],
        cellData,
      },
    },
  }
}
