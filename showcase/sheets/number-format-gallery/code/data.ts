import type { IWorkbookData } from '@univerjs/core'

const ACCOUNTING_PATTERN = '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_)'

export const FORMAT_SAMPLES = [
  {
    label: 'Decimal rounding',
    value: 1234.5678,
    pattern: '#,##0.00',
    note: 'Stored precision is unchanged',
  },
  {
    label: 'Scientific notation',
    value: 12345678,
    pattern: '0.00E+00',
    note: 'Large measurements in compact form',
  },
  {
    label: 'USD amount',
    value: 2480.5,
    pattern: '"$"#,##0.00',
    note: 'A symbol, not currency conversion',
  },
  {
    label: 'EUR refund',
    value: -85.25,
    pattern: '"€"#,##0.00;[Red]("€"#,##0.00)',
    note: 'Negative values in red parentheses',
  },
  {
    label: 'Completion rate',
    value: 0.875,
    pattern: '0.0%',
    note: '0.875 becomes 87.5%',
  },
  {
    label: 'Over target',
    value: 1.125,
    pattern: '0.00%',
    note: 'A percentage can exceed 100%',
  },
  {
    label: 'Calendar date',
    value: 45658,
    pattern: 'yyyy-mm-dd',
    note: 'Numeric serial → 2025-01-01',
  },
  {
    label: 'Date and time',
    value: 45658.5,
    pattern: 'yyyy-mm-dd hh:mm',
    note: 'Half a day is noon',
  },
  {
    label: 'Elapsed 27 hours',
    value: 1.125,
    pattern: '[h]:mm',
    note: 'Brackets retain hours beyond 24',
  },
  {
    label: 'Clock time',
    value: 1.125,
    pattern: 'hh:mm',
    note: 'Same value, time wraps to 03:00',
  },
  {
    label: 'Padded identifier',
    value: 42,
    pattern: '"LOT-"00000',
    note: 'Numeric 42 with a display prefix',
  },
  {
    label: 'Measurement unit',
    value: 18.75,
    pattern: '0.0" kg"',
    note: 'A suffix does not turn a number into text',
  },
  {
    label: 'Signed variance',
    value: -320,
    pattern: '+#,##0;-#,##0;"—"',
    note: 'Positive; negative; zero sections',
  },
  {
    label: 'Zero as a dash',
    value: 0,
    pattern: '+#,##0;-#,##0;"—"',
    note: 'Still numeric zero, not a blank cell',
  },
  {
    label: 'Accounting receipt',
    value: 1234.5,
    pattern: ACCOUNTING_PATTERN,
    note: 'Accounting pattern; fill alignment is limited',
  },
  {
    label: 'Accounting refund',
    value: -85.25,
    pattern: ACCOUNTING_PATTERN,
    note: 'Negative section uses parentheses',
  },
  {
    label: 'Accounting zero',
    value: 0,
    pattern: ACCOUNTING_PATTERN,
    note: 'A dash occupies the numeric zero position',
  },
  {
    label: 'Mixed fraction',
    value: 2.375,
    pattern: '# ?/?',
    note: '2.375 displays as 2 3/8',
  },
  {
    label: 'Fixed denominator',
    value: 2.375,
    pattern: '# ??/16',
    note: 'Same value measured in sixteenths',
  },
  {
    label: 'Fraction approximation',
    value: 0.3333333333,
    pattern: '# ??/??',
    note: 'Displays 1/3 without changing stored precision',
  },
] as const

export function createWorkbookData(_legacyChinese = false): Partial<IWorkbookData> {
  return {
    id: 'number-format-gallery',
    name: 'Number format gallery',
    sheetOrder: ['formats'],
    styles: {
      title: { bg: { rgb: '#123C4A' }, cl: { rgb: '#FFFFFF' }, fs: 20, bl: 1 },
      hint: { bg: { rgb: '#E6F1F2' }, cl: { rgb: '#245566' }, fs: 11 },
      heading: { bg: { rgb: '#246B75' }, cl: { rgb: '#FFFFFF' }, bl: 1 },
      label: { bg: { rgb: '#F1F6F7' }, cl: { rgb: '#234954' } },
      raw: { bg: { rgb: '#FFF4E7' }, cl: { rgb: '#754423' } },
      formatted: { bg: { rgb: '#E3F3EC' }, cl: { rgb: '#175541' }, bl: 1 },
      pattern: { cl: { rgb: '#435A69' }, ff: 'monospace', fs: 11 },
    },
    sheets: {
      formats: {
        id: 'formats',
        name: 'Format comparisons',
        rowCount: 30,
        columnCount: 5,
        defaultRowHeight: 31,
        rowData: { 0: { h: 46 }, 1: { h: 34 }, 3: { h: 34 } },
        columnData: { 0: { w: 184 }, 1: { w: 132 }, 2: { w: 194 }, 3: { w: 470 }, 4: { w: 340 } },
        mergeData: [
          { startRow: 0, endRow: 0, startColumn: 0, endColumn: 4 },
          { startRow: 1, endRow: 1, startColumn: 0, endColumn: 4 },
        ],
        cellData: {
          0: { 0: { v: 'Same number. Different presentation.', s: 'title' } },
          1: {
            0: {
              v: 'Select a green cell and use the native number-format menu. The formula bar retains the actual value.',
              s: 'hint',
            },
          },
          3: Object.fromEntries(
            ['Variant', 'Raw number', 'Formatted number', 'Initial pattern', 'What to notice'].map((v, c) => [
              c,
              { v, s: 'heading' },
            ]),
          ),
          ...Object.fromEntries(
            FORMAT_SAMPLES.map((sample, i) => [
              i + 4,
              {
                0: { v: sample.label, s: 'label' },
                1: { v: sample.value, s: 'raw' },
                2: { v: sample.value, s: 'formatted' },
                3: { v: sample.pattern, s: 'pattern' },
                4: { v: sample.note },
              },
            ]),
          ),
        },
      },
    },
  }
}
