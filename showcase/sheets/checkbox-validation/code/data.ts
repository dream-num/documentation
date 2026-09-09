import type { IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const jobs = [
    'Pack seed envelopes',
    'Clean hand lenses',
    'Label soil trays',
    'Charge field recorder',
    'Fold survey maps',
    'Check spare batteries',
  ]
  return {
    id: 'field-kit-checkboxes',
    name: 'Field kit checklist',
    locale: LocaleType.EN_US,
    sheetOrder: ['numeric', 'custom'],
    sheets: Object.fromEntries(
      [
        ['numeric', 'Default 1 and 0', '#164E63'],
        ['custom', 'Packed and Open', '#754153'],
      ].map(([id, name, accent]) => [
        id,
        {
          id,
          name,
          rowCount: 24,
          columnCount: 8,
          defaultRowHeight: 40,
          columnData: { 0: { w: 240 }, 1: { w: 125 }, 2: { w: 170 }, 3: { w: 310 } },
          cellData: {
            0: Object.fromEntries(
              ['Field kit task', 'Ready', 'Stored value', 'Try it'].map((v, c) => [
                c,
                { v, s: { bg: { rgb: accent }, cl: { rgb: '#FFFFFF' }, bl: 1 } },
              ]),
            ),
            ...Object.fromEntries(
              jobs.map((v, i) => [
                i + 1,
                {
                  0: { v },
                  2: { f: `=B${i + 2}`, s: { cl: { rgb: accent } } },
                  3: {
                    v: [
                      'Click the checked box.',
                      'Click the empty box.',
                      'Compare the value in column C.',
                      'Toggle twice to restore the value.',
                      'Use native Undo after a toggle.',
                      'Type Review to inspect invalid input.',
                    ][i],
                  },
                },
              ]),
            ),
            9: {
              0: { v: 'Completed tasks', s: { bl: 1 } },
              1: { f: id === 'numeric' ? '=COUNTIF(B2:B7,1)' : '=COUNTIF(B2:B7,"Packed")' },
            },
            11: {
              0: {
                v:
                  id === 'numeric'
                    ? 'Default checkboxes store 1 / 0, not JavaScript booleans.'
                    : 'Custom checkboxes store Packed / Open as text.',
              },
            },
            13: { 0: { v: 'Checkboxes are cell data validation, not floating form controls.' } },
          },
        },
      ]),
    ),
  }
}
