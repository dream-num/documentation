import type { IWorkbookData, IWorksheetData } from '@univerjs/core'
import { LocaleType } from '@univerjs/core'

export const HOST_ID = 'tide-channel-comparison'
export const SOURCE_ID = 'tide-channel-source'
export const SOURCE_NAME = 'Tide Channels'
export const SHEET_ID = 'comparison'
export const EMBED_ID = 'tide-channel-source-float'
const ref = "'[Tide Channels]Channel inputs'!"
const styles: IWorkbookData['styles'] = {
  title: { fs: 22, bl: 1, bg: { rgb: '#192D30' }, cl: { rgb: '#EBD48F' } },
  header: { bg: { rgb: '#EEE8D7' }, bl: 1, cl: { rgb: '#354D52' } },
  body: { cl: { rgb: '#354D52' } },
  muted: { fs: 11, cl: { rgb: '#6E7D7C' } },
  input: { bg: { rgb: '#FFF0D6' }, n: { pattern: '#,##0' }, cl: { rgb: '#725926' } },
  actual: { bg: { rgb: '#E2F0ED' }, n: { pattern: '#,##0' }, cl: { rgb: '#236B6D' } },
  plan: { bg: { rgb: '#F8EFDA' }, n: { pattern: '#,##0' }, cl: { rgb: '#826126' } },
  total: { bg: { rgb: '#287F83' }, n: { pattern: '#,##0' }, bl: 1, cl: { rgb: '#FFFFFF' } },
  share: { n: { pattern: '0.00%' }, cl: { rgb: '#236B6D' } },
  note: { fs: 11, bg: { rgb: '#EFF3F3' }, cl: { rgb: '#536D70' } },
}
function sheet(id: string, name: string, cellData: IWorksheetData['cellData'], widths: number[], merged: number[]) {
  return {
    id,
    name,
    rowCount: id === SHEET_ID ? 32 : 16,
    columnCount: id === SHEET_ID ? 14 : 4,
    defaultRowHeight: 28,
    defaultColumnWidth: 100,
    rowData: { 0: { h: 42 } },
    columnData: Object.fromEntries(widths.map((w, i) => [i, { w }])),
    cellData,
    mergeData: merged.map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: widths.length - 1 })),
  }
}
export function createSourceData(): Partial<IWorkbookData> {
  const cells: IWorksheetData['cellData'] = {
    0: { 0: { v: 'TIDE / Channel inputs', s: 'title' } },
    1: { 0: { v: 'Fictional community programme / 12 June 2029', s: 'muted' } },
    3: { 0: { v: 'Channel', s: 'header' }, 1: { v: 'Actual', s: 'header' }, 2: { v: 'Plan', s: 'header' } },
    4: { 0: { v: 'Community', s: 'body' }, 1: { v: 120, s: 'input' }, 2: { v: 140, s: 'input' } },
    5: { 0: { v: 'Partners', s: 'body' }, 1: { v: 180, s: 'input' }, 2: { v: 160, s: 'input' } },
    6: { 0: { v: 'Newsletter', s: 'body' }, 1: { v: 90, s: 'input' }, 2: { v: 100, s: 'input' } },
    9: { 0: { v: 'Confirmed RSVPs, not attendance or forecasts.', s: 'note' } },
    11: { 0: { v: 'Amber cells feed the other workbook and its chart.', s: 'muted' } },
  }
  return {
    id: SOURCE_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    styles: structuredClone(styles),
    sheetOrder: ['channels'],
    sheets: { channels: sheet('channels', 'Channel inputs', cells, [170, 130, 130], [0, 1, 9, 11]) },
  }
}
export function createHostData(): Partial<IWorkbookData> {
  const cells: IWorksheetData['cellData'] = {
    0: { 0: { v: 'TIDE / Follow the source.', s: 'title' } },
    1: { 0: { v: 'Source Sheet → visible formulas → native chart', s: 'muted' } },
    3: Object.fromEntries(['Channel', 'Actual', 'Plan', 'Actual share'].map((v, i) => [i, { v, s: 'header' }])),
    8: { 0: { v: 'Total', s: 'header' }, 1: { f: '=SUM(B5:B7)', s: 'total' }, 2: { f: '=SUM(C5:C7)', s: 'total' } },
    9: { 0: { v: 'Change source B6 to 210: actual total becomes 420.', s: 'note' } },
    10: { 0: { v: 'Plan stays 400. The chart binds A4:C7, not a JS array.', s: 'muted' } },
    27: { 0: { v: 'Confirmed RSVPs / Original fictional data / No personal records', s: 'muted' } },
    29: { 0: { v: 'Two independent workbook IDs. Native source focus is tested separately.', s: 'note' } },
  }
  for (let i = 0; i < 3; i++) {
    const row = i + 5
    cells[row - 1] = {
      0: { f: '=' + ref + 'A' + row, s: 'body' },
      1: { f: '=' + ref + 'B' + row, s: 'actual' },
      2: { f: '=' + ref + 'C' + row, s: 'plan' },
      3: { f: '=B' + row + '/SUM($B$5:$B$7)', s: 'share' },
    }
  }
  return {
    id: HOST_ID,
    name: 'Tide / Channel comparison',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    styles: structuredClone(styles),
    sheetOrder: [SHEET_ID],
    sheets: { [SHEET_ID]: sheet(SHEET_ID, 'Channel comparison', cells, [180, 100, 100, 120], [0, 1, 9, 10, 27, 29]) },
  }
}
