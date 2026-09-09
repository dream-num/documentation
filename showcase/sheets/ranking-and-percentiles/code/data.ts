import type { ICellData, IWorkbookData } from '@univerjs/core'
import { CellValueType, HorizontalAlign, LocaleType } from '@univerjs/core'

const text = (v: string): ICellData => ({ v, t: CellValueType.STRING })
const number = (v: number): ICellData => ({ v, t: CellValueType.NUMBER, s: { bg: { rgb: '#FEF3C7' } } })
const formula = (f: string): ICellData => ({ f, s: { bg: { rgb: '#F0FDFA' }, ht: HorizontalAlign.RIGHT } })

export function createWorkbookData(): Partial<IWorkbookData> {
  const ranking: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Tied scores: shared rank or average position?') },
    1: {
      0: text(
        'Edit either 68 to break the tie. Descending puts the largest score first; ascending reverses the order.',
      ),
    },
    3: {
      0: text('Proposal'),
      1: text('Score'),
      2: text('EQ descending'),
      3: text('AVG descending'),
      4: text('EQ ascending'),
      5: text('AVG ascending'),
      7: text('Percent-rank input'),
      8: text('Value'),
    },
    4: { 7: text('Target score'), 8: number(68) },
    6: { 7: text('PERCENTRANK.INC'), 8: formula('=PERCENTRANK.INC(B5:B11,I5,6)') },
    7: { 7: text('PERCENTRANK.EXC'), 8: formula('=PERCENTRANK.EXC(B5:B11,I5,6)') },
    9: { 7: text('Outside-range probe'), 8: number(151) },
    10: { 7: text('INC outside range'), 8: formula('=PERCENTRANK.INC(B5:B11,I10,6)') },
    11: { 7: text('EXC outside range'), 8: formula('=PERCENTRANK.EXC(B5:B11,I10,6)') },
    14: { 0: text('The tied 68 scores share EQ ranks 4 / 3, but AVG ranks are 4.5 / 3.5. Rankings are not dense.') },
    16: {
      0: text('Set I5 to 85 to interpolate between 74 and 96. Percent-rank is not the inverse of average tie ranking.'),
    },
    18: { 0: text('The Quantiles tab compares inclusive and exclusive interpolation on these same seven scores.') },
  }
  const names = [
    'Canal signage',
    'Repair station',
    'Shade pavilion',
    'Reading alcove',
    'Rain garden',
    'Cycle bridge',
    'Regional hub',
  ]
  ;[42, 55, 68, 68, 74, 96, 150].forEach((value, index) => {
    const row = index + 5
    ranking[row - 1] = {
      ...ranking[row - 1],
      0: text(names[index]),
      1: number(value),
      2: formula(`=RANK.EQ(B${row},$B$5:$B$11,0)`),
      3: formula(`=RANK.AVG(B${row},$B$5:$B$11,0)`),
      4: formula(`=RANK.EQ(B${row},$B$5:$B$11,1)`),
      5: formula(`=RANK.AVG(B${row},$B$5:$B$11,1)`),
    }
  })
  const source = "'Ranking'!$B$5:$B$11"
  const quantiles: Record<number, Record<number, ICellData>> = {
    0: { 0: text('Inclusive versus exclusive quantiles') },
    1: {
      0: text(
        'Seven scores from Ranking. EXC cannot interpolate outside positions 1 through 7; errors remain visible.',
      ),
    },
    3: {
      0: text('Percentile k'),
      1: text('PERCENTILE.INC'),
      2: text('PERCENTILE.EXC'),
      5: text('Quartile'),
      6: text('QUARTILE.INC'),
      7: text('QUARTILE.EXC'),
    },
    13: { 0: text('Custom percentile'), 1: text('k'), 2: text('INC result'), 3: text('EXC result') },
    14: {
      0: text('Custom k'),
      1: number(0.9),
      2: formula(`=PERCENTILE.INC(${source},B15)`),
      3: formula(`=PERCENTILE.EXC(${source},B15)`),
    },
    16: { 0: text('INC includes k = 0 and 1. For this seven-score sample, EXC accepts 0.125 through 0.875.') },
    18: { 0: text('Q1: INC 61.5 versus EXC 55. Q3: INC 85 versus EXC 96. Both medians are 68.') },
    20: { 0: text('Change B15 from 0.9 to 0.875: the EXC error recovers to 150; INC returns 109.5.') },
  }
  ;[0, 0.125, 0.25, 0.5, 0.75, 0.875, 1, 0.1].forEach((k, i) => {
    const row = i + 5
    quantiles[row - 1] = {
      ...quantiles[row - 1],
      0: number(k),
      1: formula(`=PERCENTILE.INC(${source},A${row})`),
      2: formula(`=PERCENTILE.EXC(${source},A${row})`),
    }
  })
  ;[0, 1, 2, 3, 4].forEach((q, i) => {
    const row = i + 5
    quantiles[row - 1] = {
      ...quantiles[row - 1],
      5: number(q),
      6: formula(`=QUARTILE.INC(${source},F${row})`),
      7: formula(`=QUARTILE.EXC(${source},F${row})`),
    }
  })
  for (const data of [ranking, quantiles]) {
    data[0][0].s = { fs: 19, bl: 1, cl: { rgb: '#115E59' } }
    for (const cell of Object.values(data[3])) cell.s = { bl: 1, bg: { rgb: '#CCFBF1' } }
  }
  return {
    id: 'ranking-and-percentiles',
    name: 'Proposal score comparisons',
    locale: LocaleType.EN_US,
    sheetOrder: ['ranking', 'quantiles'],
    sheets: {
      ranking: {
        id: 'ranking',
        name: 'Ranking',
        rowCount: 24,
        columnCount: 10,
        defaultRowHeight: 34,
        defaultColumnWidth: 110,
        columnData: {
          0: { w: 180 },
          1: { w: 85 },
          2: { w: 135 },
          3: { w: 145 },
          4: { w: 130 },
          5: { w: 140 },
          6: { w: 25 },
          7: { w: 195 },
          8: { w: 135 },
        },
        cellData: ranking,
      },
      quantiles: {
        id: 'quantiles',
        name: 'Quantiles',
        rowCount: 25,
        columnCount: 10,
        defaultRowHeight: 34,
        defaultColumnWidth: 125,
        columnData: {
          0: { w: 155 },
          1: { w: 155 },
          2: { w: 160 },
          3: { w: 140 },
          4: { w: 30 },
          5: { w: 105 },
          6: { w: 160 },
          7: { w: 165 },
        },
        cellData: quantiles,
      },
    },
  }
}
