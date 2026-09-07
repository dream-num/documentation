import type { IWorkbookData } from '@univerjs/presets'

import { WORKBOOK_DATA } from './data'

// Keep the existing three reference galleries intact; prepend an original live workbench.
export function createFixture(id: string): Partial<IWorkbookData> {
  const fixture = structuredClone(WORKBOOK_DATA)
  return {
    ...fixture,
    id,
    name: 'Marlow reservoir · Shapes and reference galleries',
    sheetOrder: ['workbench', ...fixture.sheetOrder!],
    sheets: {
      ...fixture.sheets,
      workbench: {
        id: 'workbench',
        name: 'Marlow workbench',
        rowCount: 55,
        columnCount: 18,
        defaultColumnWidth: 95,
        defaultRowHeight: 28,
        cellData: {
          0: { 0: { v: 'MARLOW RESERVOIR · COMMISSIONING', s: { bl: 1, cl: { rgb: '#0369a1' } } } },
          12: { 0: { v: 'Stage', s: { bl: 1 } }, 2: { v: 'Hours', s: { bl: 1 } }, 3: { v: 'Note', s: { bl: 1 } } },
          13: { 0: { v: 'Intake' }, 2: { v: 6.5 }, 3: { v: 'Two crews' } },
          14: { 0: { v: 'Sampling' }, 2: { v: 0 }, 3: { v: 'Not started' } },
          15: { 0: { v: 'Review' }, 3: { v: 'Estimate pending' } },
          16: { 0: { v: 'Release' }, 2: { v: 3.25 }, 3: { v: 'Valve checks' } },
        },
      },
    },
  }
}
