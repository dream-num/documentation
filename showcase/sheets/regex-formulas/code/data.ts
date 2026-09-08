import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const rows = [
    ['Whole code / match', 'PK-2048', '^PK-[0-9]{4}$', '=REGEXTEST(B5,C5)', '=IF(D5,"Valid code","Check code")'],
    ['Whole code / reject', 'PK-20', '^PK-[0-9]{4}$', '=REGEXTEST(B6,C6)', '=IF(D6,"Valid code","Check code")'],
    [
      'Extract first match',
      'Order PK-2048 is ready',
      'PK-[0-9]{4}',
      '=REGEXEXTRACT(B7,C7)',
      '=IFNA(D7,"No code found")',
    ],
    ['No match', 'Awaiting assignment', 'PK-[0-9]{4}', '=REGEXEXTRACT(B8,C8)', '=IFNA(D8,"No code found")'],
    ['Invalid pattern', 'PK-2048', '[', '=REGEXEXTRACT(B9,C9)', '=IFERROR(D9,"Check pattern")'],
    ['Normalize separators', 'studio---west  wing', '[- ]+', '=REGEXREPLACE(B10,C10," ")', '=LEN(D10)'],
    ['Redact digits', 'Call 555-0142, ext 39', '[0-9]', '=REGEXREPLACE(B11,C11,"#")', '=LEN(D11)'],
    ['Replacement / no match', 'No digits here', '[0-9]', '=REGEXREPLACE(B12,C12,"#")', '=LEN(D12)'],
  ]
  const cellData: Record<number, Record<number, ICellData>> = {
    0: {
      0: {
        v: 'Pattern matching, extraction and replacement',
        t: CellValueType.STRING,
        s: { fs: 20, bl: 1, cl: { rgb: '#9A3412' } },
      },
    },
    1: {
      0: {
        v: 'Edit an amber input or pattern. Native regex formulas recalculate in the green result columns.',
        t: CellValueType.STRING,
      },
    },
    3: Object.fromEntries(
      ['OPERATION', 'INPUT TEXT', 'PATTERN', 'RAW RESULT', 'RECOVERY / LENGTH'].map((v, col) => [
        col,
        { v, t: CellValueType.STRING, s: { bl: 1, bg: { rgb: '#FFEDD5' } } },
      ]),
    ),
    14: {
      0: {
        v: 'Repair B6 with PK-7310; give B8 a code; replace the invalid pattern in C9 with PK-[0-9]{4}.',
        t: CellValueType.STRING,
      },
    },
    16: {
      0: {
        v: 'No match: TEST returns FALSE, EXTRACT returns #N/A, REPLACE preserves its input. Invalid patterns return #REF!.',
        t: CellValueType.STRING,
      },
    },
  }
  rows.forEach((row, index) => {
    cellData[index + 4] = Object.fromEntries(
      row.map((value, col) => [
        col,
        {
          ...(value.startsWith('=') ? { f: value } : { v: value, t: CellValueType.STRING }),
          s: { bg: { rgb: col === 1 || col === 2 ? '#FEF3C7' : col >= 3 ? '#ECFDF5' : '#FFFFFF' } },
        },
      ]),
    )
  })
  return {
    id: 'regex-formulas',
    name: 'Regular expressions',
    locale: LocaleType.EN_US,
    sheetOrder: ['regex'],
    sheets: {
      regex: {
        id: 'regex',
        name: 'Regex comparisons',
        rowCount: 24,
        columnCount: 10,
        defaultRowHeight: 38,
        defaultColumnWidth: 120,
        columnData: { 0: { w: 235 }, 1: { w: 270 }, 2: { w: 195 }, 3: { w: 280 }, 4: { w: 210 } },
        cellData,
      },
    },
  }
}
