import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })

export function createWorkbookData(): Partial<IWorkbookData> {
  const cellData: Record<number, Record<number, ICellData>> = {
    0: { 0: { ...text('One sample, different summaries'), s: { fs: 20, bl: 1, cl: { rgb: '#1D4ED8' } } } },
    1: { 0: text('Six readings, one empty cell and one text status. Edit B10 from 100 to 24 to reduce the outlier.') },
    3: Object.fromEntries(
      [
        [0, 'READING'],
        [1, 'VALUE'],
        [3, 'METRIC'],
        [4, 'RESULT'],
        [5, 'INITIAL INTERPRETATION'],
      ].map(([col, label]) => [col, { ...text(String(label)), s: { bl: 1, bg: { rgb: '#DBEAFE' } } }]),
    ),
    10: { 0: text('Empty observation'), 1: { s: { bg: { rgb: '#FEF3C7' } } } },
    11: { 0: text('Text status'), 1: { ...text('pending'), s: { bg: { rgb: '#FEF3C7' } } } },
    18: {
      0: text('Fill B11 with 0: COUNT and COUNTA both rise. Replace pending in B12 with a number: only COUNT rises.'),
    },
  }
  const labels = ['Sample A', 'Sample B / tied', 'Sample C / tied', 'Sample D', 'Sample E', 'Sample F / outlier']
  ;[12, 14, 14, 18, 22, 100].forEach((v, index) => {
    cellData[index + 4] = {
      0: text(labels[index]),
      1: { v, t: CellValueType.NUMBER, s: { bg: { rgb: '#FEF3C7' } } },
    }
  })
  const metrics = [
    ['COUNT', '=COUNT(B5:B12)', 'Counts six numeric readings, not the blank or text.'],
    ['COUNTA', '=COUNTA(B5:B12)', 'Also counts the pending status; a styled blank is still empty.'],
    ['AVERAGE', '=AVERAGE(B5:B12)', 'The outlier raises the mean to 30.'],
    ['MEDIAN', '=MEDIAN(B5:B12)', 'The middle pair is 14 and 18: median 16.'],
    ['MODE.SNGL', '=MODE.SNGL(B5:B12)', 'The repeated reading is 14.'],
    ['STDEV.S', '=STDEV.S(B5:B12)', 'Sample spread: divisor n - 1.'],
    ['STDEV.P', '=STDEV.P(B5:B12)', 'Population spread: divisor n.'],
    ['PERCENTILE.INC', '=PERCENTILE.INC(B5:B12,0.75)', 'Inclusive 75th percentile interpolates to 21.'],
    ['QUARTILE.INC', '=QUARTILE.INC(B5:B12,3)', 'Third quartile matches the 75th percentile.'],
    ['RANK.EQ / B6', '=RANK.EQ(B6,B5:B10,0)', 'Descending rank of the first 14 is 4.'],
    ['RANK.EQ / B7', '=RANK.EQ(B7,B5:B10,0)', 'The second 14 shares rank 4.'],
    ['RANK.EQ / B5', '=RANK.EQ(B5,B5:B10,0)', 'The next smaller value ranks 6, skipping rank 5.'],
  ]
  metrics.forEach(([label, f, note], index) => {
    cellData[index + 4] = {
      ...cellData[index + 4],
      3: text(label),
      4: { f, s: { bg: { rgb: '#EFF6FF' }, n: { pattern: index < 2 || index > 8 ? '0' : '0.00##' } } },
      5: text(note),
    }
  })
  return {
    id: 'statistical-summary-formulas',
    name: 'Sample statistics',
    locale: LocaleType.EN_US,
    sheetOrder: ['statistics'],
    sheets: {
      statistics: {
        id: 'statistics',
        name: 'Summary comparisons',
        rowCount: 24,
        columnCount: 10,
        defaultRowHeight: 34,
        defaultColumnWidth: 110,
        columnData: { 0: { w: 190 }, 1: { w: 135 }, 2: { w: 30 }, 3: { w: 185 }, 4: { w: 135 }, 5: { w: 490 } },
        cellData,
      },
    },
  }
}
