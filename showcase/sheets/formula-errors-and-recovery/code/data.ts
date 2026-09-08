import type { ICellData, IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const specimens = [
    {
      id: 'errors',
      name: 'Six formula errors',
      hint: 'Edit an amber input. The teal result is calculated, not a prefilled error label. Select D5 to inspect its formula.',
      headers: ['Small calculation', 'Input', 'Other input', 'Actual result', 'Repair to try'],
      rows: [
        ['Ticket cost per guest', 84, 0, '=B5/C5', 'C5: enter 7 → 12'],
        ['Find a material', 'Glass', 'Wood', '=MATCH(B6,C6:C7,0)', 'B6: enter Wood → 1'],
        ['Add handling charge', 'pending', 'Metal', '=B7+5', 'B7: enter 9 → 14'],
        ['Read an address', 'Missing!A1', '', '=INDIRECT(B8)', 'B8: enter B5 → 84'],
        ['Unknown function', 12, '', '=UNKNOWNMATERIAL(B9)', 'D9: enter =SUM(B9,3) → 15'],
        ['Square-root measure', -9, '', '=SQRT(B10)', 'B10: enter 9 → 3'],
      ],
      note: 'Expected initial results: #DIV/0!, #N/A, #VALUE!, #REF!, #NAME?, #NUM!. Errors are intentional teaching specimens.',
    },
    {
      id: 'recovery',
      name: 'IFERROR versus IFNA',
      hint: 'Change B5 to Maple or C6 to 4. Recovery formulas recalculate with the same source; IFNA only catches #N/A.',
      headers: ['Scenario', 'Input', 'Other input', 'Raw formula', 'IFERROR', 'IFNA'],
      rows: [
        [
          'Missing stock item',
          'Birch',
          'Maple',
          '=MATCH(B5,C5:C6,0)',
          '=IFERROR(D5,"Check input")',
          '=IFNA(D5,"Not stocked")',
        ],
        ['Batch cost per crate', 72, 0, '=B6/C6', '=IFERROR(D6,"Check input")', '=IFNA(D6,"Not stocked")'],
        ['Healthy calculation', 15, 3, '=B7/C7', '=IFERROR(D7,"Check input")', '=IFNA(D7,"Not stocked")'],
      ],
      note: 'Fallback text is not a repair: the raw error remains until its input is corrected. Healthy results pass through unchanged.',
    },
    {
      id: 'propagation',
      name: 'Dependent results',
      hint: 'Enter 6 in C5. D5, E5 and F5 recover together. Select each formula cell to inspect its native formula bar.',
      headers: ['Workshop estimate', 'Total cost', 'Attendees', 'Cost per person', 'With materials', 'Display result'],
      rows: [
        ['Cyanotype afternoon', 96, 0, '=B5/C5', '=D5+8', '=IFERROR(E5,"Enter attendees")'],
        ['Paper folding class', 60, 5, '=B6/C6', '=D6+3', '=IFERROR(E6,"Enter attendees")'],
        ['Book sewing class', 126, 7, '=B7/C7', '=D7+6', '=IFERROR(E7,"Enter attendees")'],
      ],
      note: 'This is native dependency recalculation, not a trace-arrow feature. No custom tracing overlay is added.',
    },
  ]
  return {
    id: 'workshop-formula-errors',
    name: 'Workshop calculations · errors and recovery',
    locale: LocaleType.EN_US,
    sheetOrder: specimens.map(({ id }) => id),
    sheets: Object.fromEntries(
      specimens.map(({ id, name, hint, headers, rows, note }) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { v: name, s: { fs: 18, bl: 1, cl: { rgb: '#155E75' } } } },
          1: { 0: { v: hint } },
          3: Object.fromEntries(headers.map((v, col) => [col, { v, s: { bl: 1, bg: { rgb: '#CFFAFE' } } }])),
          12: { 0: { v: note } },
          14: { 0: { v: 'Use the native name box to select an address, type a value or formula, then press Enter.' } },
        }
        rows.forEach((row, index) => {
          cellData[index + 4] = Object.fromEntries(
            row.map((value, col) => [
              col,
              {
                ...(typeof value === 'string' && value.startsWith('=') ? { f: value } : { v: value }),
                s: { bg: { rgb: col === 1 || col === 2 ? '#FEF3C7' : col >= 3 ? '#ECFEFF' : '#FFFFFF' } },
              },
            ]),
          )
        })
        return [
          id,
          {
            id,
            name,
            rowCount: 24,
            columnCount: 12,
            defaultRowHeight: 38,
            defaultColumnWidth: 110,
            columnData: {
              0: { w: 220 },
              1: { w: 135 },
              2: { w: 130 },
              3: { w: 165 },
              4: { w: id === 'errors' ? 295 : 195 },
              5: { w: 210 },
            },
            cellData,
          },
        ]
      }),
    ),
  }
}
