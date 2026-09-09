import type { IWorkbookData, IWorksheetData } from '@univerjs/presets'

// Original fictional coastal seed-library records; deliberate search boundaries.
function sheet(id: string, name: string, rows: (string | number | null)[][]): Partial<IWorksheetData> {
  return {
    id,
    name,
    rowCount: 40,
    columnCount: 8,
    defaultRowHeight: 30,
    columnData: { 0: { w: 135 }, 1: { w: 210 }, 2: { w: 155 }, 3: { w: 120 }, 4: { w: 270 } },
    cellData: Object.fromEntries(
      rows.map((values, row) => [
        row,
        Object.fromEntries(
          values.map((v, column) => [
            column,
            {
              ...(typeof v === 'string' && v.startsWith('=') ? { f: v } : { v }),
              ...(row === 0 ? { s: { bg: { rgb: '#e0f2fe' }, bl: 1 } } : {}),
            },
          ]),
        ),
      ]),
    ),
  }
}
export const WORKBOOK_DATA: Partial<IWorkbookData> = {
  id: 'pelican-seeds',
  name: 'Pelican seed-library label review',
  sheetOrder: ['current', 'archive'],
  sheets: {
    current: sheet('current', 'Current stock', [
      ['Batch', 'Variety', 'Label status', 'Packets', 'Note'],
      ['P-104', 'Sea kale', 'Draft', 12, 'draft label; draft insert'],
      ['P-108', 'Glasswort', 'draft', 0, 'Coastal trial'],
      ['P-116', 'Beach pea', 'DRAFT', 7, 'Awaiting photo'],
      ['P-122', 'Sea beet', 'Draft review', 23, null],
      ['P-131', 'Rock samphire', 'Ready', 5, 'A.B label'],
      ['P-140', 'Sand leek', 'Ready', 2, 'A*B is literal text'],
      ['P-153', 'Sea aster', 'Ready', 9, 'Café nursery'],
      ['Formula', '=UPPER(C2)', '=SUM(D2:D8)', null, 'Computed text / numeric total'],
    ]),
    archive: sheet('archive', 'Last season', [
      ['Batch', 'Variety', 'Label status', 'Packets', 'Note'],
      ['A-017', 'Wild carrot', 'Draft', 3, 'Retained for comparison'],
      ['A-021', 'Sea rocket', 'Ready', 0, 'No packets remaining'],
      ['A-035', 'Buckshorn plantain', 'draft', 18, 'Old label'],
    ]),
  },
}
