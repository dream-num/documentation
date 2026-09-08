import type { ICellData, IWorkbookData } from '@univerjs/presets'

export const VARIANTS = [
  { id: 'rows', en: 'Row groups' },
  { id: 'nested', en: 'Nested rows' },
  { id: 'parent', en: 'Parent collapsed' },
  { id: 'child', en: 'Child collapsed' },
  { id: 'columns', en: 'Column groups' },
]
export function createFixture(_legacyChinese = false): Partial<IWorkbookData> {
  const rows: (string | number | ICellData)[][] = [
    ['Outline comparisons', '', '', '', '', '', ''],
    ['Item', 'Jan', 'Feb', 'Mar', 'Units', 'Rate', 'Amount'],
    ['Lighting', '', '', '', '', '', { f: '=SUM(G4:G6)' }],
    ['LED wash', 2, 4, 3, { f: '=SUM(B4:D4)' }, 35, { f: '=E4*F4' }],
    ['Spotlight', 3, 1, 5, { f: '=SUM(B5:D5)' }, 48, { f: '=E5*F5' }],
    ['Light stand', 4, 2, 2, { f: '=SUM(B6:D6)' }, 16, { f: '=E6*F6' }],
    ['Audio', '', '', '', '', '', { f: '=SUM(G8:G10)' }],
    ['Monitor pair', 1, 3, 2, { f: '=SUM(B8:D8)' }, 72, { f: '=E8*F8' }],
    ['Radio pack', 0, 4, 1, { f: '=SUM(B9:D9)' }, 24, { f: '=E9*F9' }],
    ['Cable kit', 6, 2, 3, { f: '=SUM(B10:D10)' }, 12, { f: '=E10*F10' }],
    ['Total', '', '', '', '', '', { f: '=G3+G7' }],
  ]
  return {
    id: 'outline-gallery',
    name: 'Row and column outlines',
    sheetOrder: VARIANTS.map((variant) => variant.id),
    styles: {
      title: { bl: 1, fs: 16, cl: { rgb: '#ffffff' }, bg: { rgb: '#174b63' } },
      header: { bl: 1, bg: { rgb: '#dceef3' }, cl: { rgb: '#173e50' } },
      summary: { bl: 1, bg: { rgb: '#e4f1e9' }, cl: { rgb: '#244d3a' } },
    },
    sheets: Object.fromEntries(
      VARIANTS.map((variant) => [
        variant.id,
        {
          id: variant.id,
          name: variant.en,
          rowCount: 24,
          columnCount: 9,
          defaultRowHeight: 30,
          rowHeader: { width: 46 },
          columnHeader: { height: 28 },
          columnData: {
            0: { w: 230 },
            1: { w: 90 },
            2: { w: 90 },
            3: { w: 90 },
            4: { w: 100 },
            5: { w: 100 },
            6: { w: 130 },
          },
          cellData: Object.fromEntries(
            rows.map((values, row) => [
              row,
              Object.fromEntries(
                values.map((value, column) => [
                  column,
                  {
                    ...(typeof value === 'object' ? value : { v: row === 0 && column === 0 ? variant.en : value }),
                    ...([0, 1, 2, 6, 10].includes(row)
                      ? { s: row === 0 ? 'title' : row === 1 ? 'header' : 'summary' }
                      : {}),
                  },
                ]),
              ),
            ]),
          ),
        },
      ]),
    ),
  }
}
