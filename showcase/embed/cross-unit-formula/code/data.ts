import type { ICellData, IWorkbookData, IWorksheetData } from '@univerjs/core'
import { CellValueType, LocaleType } from '@univerjs/core'

export const HOST_ID = 'harbor-fare-budget'
export const SOURCE_ID = 'harbor-fare-source'
export const SOURCE_NAME = 'Harbor Fares'
export const SHEET_ID = 'budget'
export const EMBED_ID = 'harbor-fare-source-float'
export const FARES = [
  ['SINGLE', 'Single crossing', 4, 180, 'One illustrative crossing'],
  ['RETURN', 'Return trip', 7, 110, 'Two directions, one planning fare'],
  ['STUDENT', 'Student fare', 2.5, 90, 'Illustrative reduced rate'],
  ['FAMILY', 'Family pass', 12, 40, 'Pass count, not individual riders'],
  ['ACCESS', 'Community access', 0, 36, 'Zero fare is intentional'],
  ['EVENING', 'Evening loop', 5.5, 60, 'A separate late-session assumption'],
] as const
const value = (v: string | number, s = 'body'): ICellData => ({
  v,
  t: typeof v === 'number' ? CellValueType.NUMBER : CellValueType.STRING,
  s,
})
const formula = (f: string, s = 'money'): ICellData => ({ f, s })
const ref = (sheetName: string, range: string) => "'[" + SOURCE_NAME + ']' + sheetName + "'!" + range
const styles: IWorkbookData['styles'] = {
  title: { fs: 23, bl: 1, bg: { rgb: '#101A34' }, cl: { rgb: '#F4F7FF' } },
  muted: { fs: 11, cl: { rgb: '#657F8D' } },
  header: { bg: { rgb: '#DFEAEF' }, bl: 1, cl: { rgb: '#22365F' } },
  body: { cl: { rgb: '#344C59' } },
  stripe: { bg: { rgb: '#F4F6F8' }, cl: { rgb: '#344C59' } },
  money: { bg: { rgb: '#E3F1EA' }, cl: { rgb: '#23594D' }, n: { pattern: '#,##0.00' } },
  input: { bg: { rgb: '#F3E5C5' }, cl: { rgb: '#1B1C1F' }, n: { pattern: '#,##0.00' } },
  count: { bg: { rgb: '#F3E5C5' }, cl: { rgb: '#1B1C1F' }, n: { pattern: '#,##0' } },
  percent: { bg: { rgb: '#F3E5C5' }, cl: { rgb: '#1B1C1F' }, n: { pattern: '0%' } },
  total: { bg: { rgb: '#2A655D' }, cl: { rgb: '#FFFFFF' }, bl: 1, n: { pattern: '#,##0.00' } },
  note: { bg: { rgb: '#E6E0F1' }, cl: { rgb: '#5A457A' }, fs: 11 },
  error: { bg: { rgb: '#F5E1D9' }, cl: { rgb: '#944E45' } },
}
function sheet(
  id: string,
  name: string,
  cellData: IWorksheetData['cellData'],
  widths: number[],
  mergedRows: number[] = [0, 1],
): Partial<IWorksheetData> {
  return {
    id,
    name,
    rowCount: 28,
    columnCount: id === SHEET_ID ? 16 : widths.length,
    defaultRowHeight: 28,
    defaultColumnWidth: 100,
    rowData: { 0: { h: 42 } },
    columnData: Object.fromEntries(widths.map((w, i) => [i, { w }])),
    cellData,
    mergeData: mergedRows.map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: widths.length - 1 })),
  }
}
export function createSourceData(): Partial<IWorkbookData> {
  const fares: IWorksheetData['cellData'] = {
    0: { 0: value('HARBOR / Fare card', 'title') },
    1: { 0: value('Draft inputs / 17 March 2029 / USD', 'muted') },
    3: Object.fromEntries(['Code', 'Fare', 'Price', 'Planning note'].map((v, i) => [i, value(v, 'header')])),
    12: { 0: value('Edit sand cells; budget uses VLOOKUP across workbook IDs.', 'muted') },
    14: { 0: value('Fictional fares / No bookings, payments or real services', 'muted') },
  }
  FARES.forEach(([code, name, price, , note], i) => {
    fares[i + 4] = { 0: value(code), 1: value(name), 2: value(price, 'input'), 3: value(note, 'muted') }
  })
  const assumptions: IWorksheetData['cellData'] = {
    0: { 0: value('HARBOR / Operating assumptions', 'title') },
    1: { 0: value('Separate worksheet in the same source workbook', 'muted') },
    3: { 0: value('Assumption', 'header'), 1: value('Value', 'header'), 2: value('Meaning', 'header') },
    4: { 0: value('Operating allowance'), 1: value(1350, 'input'), 2: value('Illustrative total for the day') },
    5: { 0: value('Revenue reserve'), 1: value(0.1, 'percent'), 2: value('Fraction of gross fare revenue') },
    8: { 0: value('Capacity and fare counts are not attendance forecasts.', 'muted') },
    10: { 0: value('No real-world financial or transport recommendation.', 'muted') },
  }
  return {
    id: SOURCE_ID,
    name: SOURCE_NAME,
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    styles: structuredClone(styles),
    sheetOrder: ['fares', 'assumptions'],
    sheets: {
      fares: sheet('fares', 'Fare card', fares, [115, 175, 100, 275], [0, 1, 12, 14]),
      assumptions: sheet('assumptions', 'Assumptions', assumptions, [245, 125, 330], [0, 1, 8, 10]),
    },
  }
}
export function createHostData(): Partial<IWorkbookData> {
  const budget: IWorksheetData['cellData'] = {
    0: { 0: value('HARBOR / Fare sensitivity', 'title') },
    1: { 0: value('Two real workbooks / Source changes drive native formulas', 'muted') },
    3: Object.fromEntries(
      ['Fare code', 'Passes', 'Linked fare', 'Revenue', 'Planning note'].map((v, i) => [i, value(v, 'header')]),
    ),
    11: {
      0: value('GROSS REVENUE', 'header'),
      1: formula('=SUM(B5:B10)', 'count'),
      3: formula('=SUM(D5:D10)', 'total'),
    },
    12: { 0: value('Operating allowance', 'header'), 3: formula('=' + ref('Assumptions', '$B$5')) },
    13: { 0: value('Revenue reserve', 'header'), 3: formula('=ROUND(D12*' + ref('Assumptions', '$B$6') + ',2)') },
    14: { 0: value('AFTER RESERVE', 'header'), 3: formula('=ROUND(D12-D13-D14,2)', 'total') },
    17: { 0: value('Try / Use the explicit-ID code to change the source fare from 4.00 to 4.50.', 'note') },
    19: { 0: value('Gross becomes 2,615.00; after reserve becomes 1,003.50.', 'muted') },
    21: { 0: value('Native source typing is not accepted: it can edit the host. See README.', 'error') },
  }
  FARES.forEach(([code, , , passes, note], i) => {
    const row = i + 4
    budget[row] = {
      0: value(code, i % 2 ? 'stripe' : 'body'),
      1: value(passes, 'count'),
      2: formula('=VLOOKUP(A' + (row + 1) + ',' + ref('Fare card', '$A$5:$C$10') + ',3,FALSE)'),
      3: formula('=ROUND(B' + (row + 1) + '*C' + (row + 1) + ',2)'),
      4: value(note, 'muted'),
    }
  })
  const sensitivity: IWorksheetData['cellData'] = {
    0: { 0: value('HARBOR / Demand scenarios', 'title') },
    1: { 0: value('Illustrative multipliers, not predictions / Follow the live budget', 'muted') },
    3: Object.fromEntries(
      ['Scenario', 'Multiplier', 'Gross revenue', 'Reserve', 'After allowance'].map((v, i) => [i, value(v, 'header')]),
    ),
    10: { 0: value('Source fare → Budget lookup → Revenue → Scenario result', 'note') },
    12: { 0: value('A zero-fare row remains zero. No IFERROR hides missing sources.', 'muted') },
  }
  ;[
    ['Quiet morning', 0.85],
    ['Opening baseline', 1],
    ['Busy afternoon', 1.15],
  ].forEach(([name, multiplier], i) => {
    const r = i + 5
    sensitivity[r - 1] = {
      0: value(name),
      1: value(multiplier, 'percent'),
      2: formula('=ROUND(Budget!$D$12*B' + r + ',2)'),
      3: formula('=ROUND(C' + r + '*' + ref('Assumptions', '$B$6') + ',2)'),
      4: formula('=ROUND(C' + r + '-D' + r + '-Budget!$D$13,2)', 'total'),
    }
  })
  const references: IWorksheetData['cellData'] = {
    0: { 0: value('HARBOR / Follow the reference', 'title') },
    1: { 0: value('Real results, including real errors / Inspect the native formula bar', 'muted') },
    3: Object.fromEntries(
      ['Reference type', 'SDK result', 'What it demonstrates'].map((v, i) => [i, value(v, 'header')]),
    ),
    4: {
      0: value('Single external cell'),
      1: formula('=' + ref('Fare card', '$C$5')),
      2: value('First price from the bound source'),
    },
    5: {
      0: value('External range'),
      1: formula('=SUM(' + ref('Fare card', '$C$5:$C$10') + ')'),
      2: value('Sum of six fare prices, not revenue'),
    },
    6: { 0: value('Local dependency'), 1: formula('=Budget!D15'), 2: value('Transitively follows the other workbook') },
    7: {
      0: value('Unavailable source'),
      1: formula("='[Missing Fares]Fare card'!$C$5", 'error'),
      2: value('Rebind Missing Fares to the real source to recover'),
    },
    8: { 0: value('Local control'), 1: formula('=1+1'), 2: value('Confirms that calculation is running') },
    11: { 0: value('Formula qualifiers bind stable unit IDs; names alone are not identities.', 'note') },
    13: { 0: value('No manually copied totals, custom JS calculator or network source.', 'muted') },
  }
  return {
    id: HOST_ID,
    name: 'Harbor / Operating budget',
    appVersion: '1.0.0-beta.2',
    locale: LocaleType.EN_US,
    styles: structuredClone(styles),
    sheetOrder: [SHEET_ID, 'sensitivity', 'references'],
    sheets: {
      budget: sheet(SHEET_ID, 'Budget', budget, [200, 90, 100, 125, 245], [0, 1, 17, 19, 21]),
      sensitivity: sheet('sensitivity', 'Sensitivity', sensitivity, [205, 120, 150, 150, 190], [0, 1, 10, 12]),
      references: sheet('references', 'Reference lab', references, [225, 160, 520], [0, 1, 11, 13]),
    },
  }
}
