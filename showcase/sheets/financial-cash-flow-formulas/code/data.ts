import type { IWorkbookData } from '@univerjs/core'

export function createWorkbookData(): Partial<IWorkbookData> {
  const comparisons = [
    ['End-of-month payment', '=PMT(B6/12,B7,B5,0,0)', 'Negative = cash paid out'],
    ['Start-of-month payment', '=PMT(B6/12,B7,B5,0,1)', 'Same loan, payment at period start'],
    ['First interest payment', '=IPMT(B6/12,1,B7,B5)', 'Interest portion of the first payment'],
    ['First principal payment', '=PPMT(B6/12,1,B7,B5)', 'Principal portion of the first payment'],
    ['Payment decomposition', '=E7+E8-E5', 'Zero: interest + principal = payment'],
    ['Balance after 12 payments', '=FV(B6/12,12,E5,B5)', 'Signed remaining balance'],
    ['Recovered initial value', '=PV(B6/12,B7,E5)', 'Returns the original amount'],
    ['Recovered period count', '=NPER(B6/12,E5,B5)', 'Returns the original period count'],
    ['Recovered annual rate', '=RATE(B7,E5,B5)*12', 'Monthly rate multiplied by 12'],
    ['Zero-rate payment', '=PMT(0,B7,B5)', 'No interest: principal divided by periods'],
  ]
  return {
    id: 'financial-cash-flow-formulas',
    name: 'Cash flow / timing and signs',
    sheetOrder: ['cash-flow'],
    styles: {
      title: { bg: { rgb: '#263F49' }, cl: { rgb: '#FFFFFF' }, fs: 20, bl: 1 },
      hint: { bg: { rgb: '#E7EEF0' }, cl: { rgb: '#263F49' }, fs: 11 },
      heading: { bg: { rgb: '#466A70' }, cl: { rgb: '#FFFFFF' }, bl: 1 },
      input: { bg: { rgb: '#FFF0D7' }, cl: { rgb: '#795021' }, n: { pattern: '#,##0.00' } },
      rate: { bg: { rgb: '#FFF0D7' }, n: { pattern: '0.00%' } },
      result: { bg: { rgb: '#E1EEE6' }, cl: { rgb: '#27543F' }, n: { pattern: '#,##0.00;[Red](#,##0.00)' } },
      percent: { bg: { rgb: '#E1EEE6' }, cl: { rgb: '#27543F' }, n: { pattern: '0.00%' } },
    },
    sheets: {
      'cash-flow': {
        id: 'cash-flow',
        name: 'Timing and signs',
        rowCount: 25,
        columnCount: 6,
        defaultRowHeight: 34,
        rowData: { 0: { h: 46 }, 1: { h: 36 } },
        columnData: { 0: { w: 165 }, 1: { w: 140 }, 2: { w: 25 }, 3: { w: 225 }, 4: { w: 150 }, 5: { w: 320 } },
        mergeData: [
          { startRow: 0, endRow: 0, startColumn: 0, endColumn: 5 },
          { startRow: 1, endRow: 1, startColumn: 0, endColumn: 5 },
          { startRow: 16, endRow: 16, startColumn: 0, endColumn: 5 },
        ],
        cellData: {
          0: { 0: { v: 'Cash flows / one loan, different questions', s: 'title' } },
          1: {
            0: {
              v: 'Edit amber inputs. Select green results to inspect native formulas in the formula bar.',
              s: 'hint',
            },
          },
          3: {
            0: { v: 'Loan input', s: 'heading' },
            1: { v: 'Value', s: 'heading' },
            3: { v: 'Question', s: 'heading' },
            4: { v: 'Formula result', s: 'heading' },
            5: { v: 'Interpretation', s: 'heading' },
          },
          ...Object.fromEntries(
            comparisons.map(([label, formula, note], i) => [
              i + 4,
              {
                ...(i === 0 ? { 0: { v: 'Principal received' }, 1: { v: 12000, s: 'input' } } : {}),
                ...(i === 1 ? { 0: { v: 'Annual rate' }, 1: { v: 0.06, s: 'rate' } } : {}),
                ...(i === 2 ? { 0: { v: 'Monthly periods' }, 1: { v: 24, s: 'input' } } : {}),
                3: { v: label },
                4: { f: formula, s: i === 8 ? 'percent' : 'result' },
                5: { v: note },
              },
            ]),
          ),
          16: {
            0: {
              v: 'Synthetic SDK sample. Fixed monthly periods, no fees or taxes; not a lending quotation.',
              s: 'hint',
            },
          },
        },
      },
    },
  }
}
