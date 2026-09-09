import type { ICellData, IWorkbookData, IWorksheetData } from '@univerjs/presets'
import { LocaleType } from '@univerjs/presets'
export const VARIANTS = [
  ['column', 'Column'],
  ['line', 'Line'],
  ['bar', 'Bar'],
  ['area', 'Area'],
  ['theme', 'Warm palette'],
  ['multilevel', 'Station and quarter'],
] as const
export function createWorkbookData(_legacyChinese = false): Partial<IWorkbookData> {
  // Original compact readings; blank, zero and negative are intentionally distinct.
  const monthly = [
    ['Jan', 142, 180, 160],
    ['Feb', 128, 174, 160],
    ['Mar', 37.5, 158, 150],
    ['Apr', -18, 131, 140],
    ['May', 0, 118, 130],
    ['Jun', null, 109, 120],
  ]
  const quarters = [
    ['North', 'Q1', 78, 90],
    ['North', 'Q2', 42, 80],
    ['North', 'Q3', 57, 85],
    ['North', 'Q4', 96, 100],
    ['South', 'Q1', 65, 75],
    ['South', 'Q2', 31, 65],
    ['South', 'Q3', 48, 70],
    ['South', 'Q4', 81, 90],
  ]
  const sheets: Record<string, Partial<IWorksheetData>> = {}
  for (const [id, en] of VARIANTS) {
    const multi = id === 'multilevel'
    const labels = multi ? ['Station', 'Quarter', 'Observed', 'Budget'] : ['Month', 'Net grid', 'Demand', 'Target']
    const rows = multi ? quarters : monthly
    const cellData: Record<number, Record<number, ICellData>> = {
      0: {
        0: {
          v: 'Edit values below to update the chart',
          s: { bl: 1, cl: { rgb: '#176b87' } },
        },
      },
      1: {
        0: {
          v: multi ? 'Two-level categories · MWh' : 'MWh · negative = export · blank ≠ zero',
        },
      },
      2: Object.fromEntries(labels.map((v, c) => [c, { v, s: { bl: 1, bg: { rgb: '#deedf2' } } }])),
    }
    rows.forEach((row, r) => {
      cellData[r + 3] = Object.fromEntries(
        row.map((v, c) => [c, { ...(v == null ? {} : { v }), s: { bg: { rgb: r % 2 ? '#f0f6f8' : '#ffffff' } } }]),
      )
    })
    sheets[id] = {
      id,
      name: en,
      rowCount: 35,
      columnCount: 20,
      defaultRowHeight: 28,
      defaultColumnWidth: 96,
      columnData: { 0: { w: 100 }, 1: { w: 108 }, 2: { w: 96 }, 3: { w: 96 }, 4: { w: 24 } },
      mergeData: [
        { startRow: 0, endRow: 0, startColumn: 0, endColumn: 3 },
        { startRow: 1, endRow: 1, startColumn: 0, endColumn: 3 },
      ],
      cellData,
    }
  }
  return {
    id: 'aster-chart-gallery',
    name: 'Native chart gallery',
    locale: LocaleType.EN_US,
    sheetOrder: VARIANTS.map(([id]) => id),
    sheets,
  }
}
