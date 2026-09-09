import type { ICellData, IWorkbookData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const examples = [
    {
      id: 'cleaning',
      name: 'Clean and normalize',
      hint: 'Edit a pink input. Purple results are live formulas; select a result to inspect its formula.',
      headers: ['Operation', 'Raw input', 'Cleaned text', 'Composed label'],
      rows: [
        ['Repeated spaces', '  Ada   Lovelace  ', '=TRIM(B5)', '=TEXTJOIN(" | ",TRUE,"Guest",C5)'],
        ['Control characters', 'Paper\tStudio\n', '=CLEAN(B6)', '=TEXTJOIN(" | ",TRUE,"Studio",C6)'],
        [
          'Nonbreaking spaces',
          'North\u00a0Wing',
          '=TRIM(SUBSTITUTE(B7,CHAR(160)," "))',
          '=TEXTJOIN(" | ",TRUE,"Location",C7)',
        ],
        [
          'Replace all matches',
          'draft-draft-final',
          '=SUBSTITUTE(B8,"draft","review")',
          '=TEXTJOIN(" | ",TRUE,"Version",C8)',
        ],
        [
          'Replace second match',
          'draft-draft-final',
          '=SUBSTITUTE(B9,"draft","review",2)',
          '=TEXTJOIN(" | ",TRUE,"Version",C9)',
        ],
        ['Combined cleanup', '  Evening\t   Class  ', '=TRIM(CLEAN(B10))', '=TEXTJOIN(" | ",TRUE,"Event",C10)'],
      ],
      widths: [220, 230, 240, 320],
      note: 'CLEAN removes control characters rather than inserting spaces. TRIM does not replace nonbreaking spaces; SUBSTITUTE does.',
    },
    {
      id: 'joining',
      name: 'Join optional fields',
      hint: 'Enter a middle name in C5. Compare TEXTJOIN with blank fields ignored or preserved.',
      headers: ['Record', 'First name', 'Middle name', 'Last name', 'Skip empty fields', 'Keep empty fields'],
      rows: [
        ['Guest 01', 'Ada', '', 'Lovelace', '=TEXTJOIN(" / ",TRUE,B5:D5)', '=TEXTJOIN(" / ",FALSE,B5:D5)'],
        [
          'Guest 02',
          'Mary',
          'Wollstonecraft',
          'Shelley',
          '=TEXTJOIN(" / ",TRUE,B6:D6)',
          '=TEXTJOIN(" / ",FALSE,B6:D6)',
        ],
        ['Guest 03', 'Grace', '', 'Hopper', '=TEXTJOIN(" / ",TRUE,B7:D7)', '=TEXTJOIN(" / ",FALSE,B7:D7)'],
      ],
      widths: [130, 130, 170, 130, 310, 310],
      note: 'TRUE skips empty fields; FALSE preserves their delimiter positions. Edit native cells and use Undo to compare results.',
    },
  ]
  return {
    id: 'text-cleaning-formulas',
    name: 'Text preparation',
    locale: LocaleType.EN_US,
    sheetOrder: examples.map(({ id }) => id),
    sheets: Object.fromEntries(
      examples.map(({ id, name, hint, headers, rows, widths, note }) => {
        const cellData: Record<number, Record<number, ICellData>> = {
          0: { 0: { v: name, s: { fs: 20, bl: 1, cl: { rgb: '#6B217E' } } } },
          1: { 0: { v: hint } },
          3: Object.fromEntries(headers.map((v, col) => [col, { v, s: { bl: 1, bg: { rgb: '#EDE0F3' } } }])),
          12: { 0: { v: note } },
        }
        rows.forEach((row, index) => {
          cellData[index + 4] = Object.fromEntries(
            row.map((value, col) => {
              const formula = value.startsWith('=')
              return [
                col,
                {
                  ...(formula ? { f: value } : { v: value }),
                  s: { bg: { rgb: formula ? '#F3EAF8' : col ? '#FCE7EF' : '#FFFFFF' } },
                },
              ]
            }),
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
            columnData: Object.fromEntries(widths.map((w, col) => [col, { w }])),
            cellData,
          },
        ]
      }),
    ),
  }
}
