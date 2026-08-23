import type { IDocumentData, IWorkbookData } from '@univerjs/presets'
import {
  BooleanNumber,
  BorderStyleTypes,
  CellValueType,
  DataStreamTreeTokenType,
  DocumentFlavor,
  HorizontalAlign,
  LocaleType,
  MODERN_DOCUMENT_WIDTH,
  ModernDocumentWidthMode,
  VerticalAlign,
  WrapStrategy,
} from '@univerjs/core'

const WORKBOOK_ID = 'northstar-launch-workbook'
const EXECUTIVE_SHEET_ID = 'executive-view'
const BUDGET_SHEET_ID = 'budget-plan'

const launchRows = [
  ['Release candidate', 'Maya Chen', 'Done', 'Global', 1, 180000, 174000, 45901, 'Low'],
  ['Enterprise onboarding', 'Jon Bell', 'In review', 'Americas', 0.88, 120000, 126500, 45908, 'Medium'],
  ['Partner certification', 'Priya Shah', 'In progress', 'EMEA', 0.76, 95000, 91000, 45912, 'Medium'],
  ['Localized launch kits', 'Noah Martin', 'In progress', 'APAC', 0.64, 68000, 72500, 45915, 'High'],
  ['Billing migration', 'Elena Rossi', 'At risk', 'Global', 0.52, 150000, 171000, 45910, 'High'],
  ['Support readiness', 'Andre Lewis', 'In review', 'Global', 0.82, 74000, 72800, 45914, 'Low'],
  ['Executive roadshow', 'Sofia Park', 'In progress', 'Americas', 0.7, 88000, 85600, 45918, 'Medium'],
  ['Analytics validation', 'Owen Davis', 'Done', 'Global', 1, 42000, 39800, 45906, 'Low'],
  ['Go-live command center', 'Amara Okafor', 'Planned', 'Global', 0.35, 56000, 54500, 45922, 'Medium'],
] as const

const budgetRows = [
  ['Product engineering', 'Maya Chen', 210000, 202500, 'Committed'],
  ['Customer enablement', 'Jon Bell', 135000, 141600, 'Review'],
  ['Partner ecosystem', 'Priya Shah', 98000, 94400, 'Committed'],
  ['Regional marketing', 'Noah Martin', 124000, 132800, 'Review'],
  ['Revenue operations', 'Elena Rossi', 162000, 181500, 'Escalate'],
  ['Support operations', 'Andre Lewis', 82000, 79100, 'Committed'],
  ['Executive programs', 'Sofia Park', 94000, 90700, 'Committed'],
] as const

function createCell(value: string | number, style: string, formula?: string) {
  return {
    v: value,
    t: typeof value === 'number' ? CellValueType.NUMBER : CellValueType.STRING,
    s: style,
    ...(formula ? { f: formula } : null),
  }
}

function createExecutiveCellData() {
  const cellData: Record<number, Record<number, ReturnType<typeof createCell>>> = {
    0: { 0: createCell('NORTHSTAR  /  GLOBAL LAUNCH CONTROL', 'title') },
    1: {
      0: createCell(
        'A single operating view for readiness, spend, regional delivery, and launch risk  ·  Updated 22 Aug 2026',
        'subtitle',
      ),
    },
    2: {
      0: createCell(0.86, 'kpiPercent', '=AVERAGE(E7:E15)'),
      2: createCell(2, 'kpiValue', '=COUNTIF(C7:C15,"Done")'),
      4: createCell(875000, 'kpiCurrency', '=SUM(F7:F15)'),
      6: createCell(-5500, 'kpiCurrencyAlert', '=SUM(F7:F15)-SUM(G7:G15)'),
      8: createCell(2, 'kpiAlert', '=COUNTIF(J7:J15,"High")'),
    },
    3: {
      0: createCell('AVERAGE READINESS', 'kpiLabelGreen'),
      2: createCell('WORKSTREAMS COMPLETE', 'kpiLabel'),
      4: createCell('APPROVED BUDGET', 'kpiLabel'),
      6: createCell('FORECAST VARIANCE', 'kpiLabelOrange'),
      8: createCell('HIGH-RISK ITEMS', 'kpiLabelRed'),
    },
    5: {
      0: createCell('Workstream', 'header'),
      1: createCell('Owner', 'header'),
      2: createCell('Status', 'header'),
      3: createCell('Region', 'header'),
      4: createCell('Progress', 'header'),
      5: createCell('Budget', 'header'),
      6: createCell('Forecast', 'header'),
      7: createCell('Variance', 'header'),
      8: createCell('Launch date', 'header'),
      9: createCell('Risk', 'header'),
    },
    16: {
      0: createCell('Decision focus', 'sectionLabel'),
      2: createCell('Billing migration needs a $21K scope decision before the regional readiness review.', 'decision'),
    },
  }

  launchRows.forEach((row, index) => {
    const rowIndex = index + 6
    const sheetRow = rowIndex + 1
    const variance = row[5] - row[6]

    cellData[rowIndex] = {
      0: createCell(row[0], 'workstream'),
      1: createCell(row[1], index % 2 === 0 ? 'body' : 'bodyAlt'),
      2: createCell(row[2], 'select'),
      3: createCell(row[3], index % 2 === 0 ? 'body' : 'bodyAlt'),
      4: createCell(row[4], 'percent'),
      5: createCell(row[5], 'currency'),
      6: createCell(row[6], 'currency'),
      7: createCell(variance, variance < 0 ? 'currencyNegative' : 'currencyPositive', `=F${sheetRow}-G${sheetRow}`),
      8: createCell(row[7], 'date'),
      9: createCell(row[8], 'select'),
    }
  })

  return cellData
}

function createBudgetCellData() {
  const cellData: Record<number, Record<number, ReturnType<typeof createCell>>> = {
    0: { 0: createCell('LAUNCH INVESTMENT PLAN', 'title') },
    1: {
      0: createCell('Approved envelope, current forecast, and corrective action by investment category', 'subtitle'),
    },
    3: {
      0: createCell('Category', 'header'),
      1: createCell('Accountable owner', 'header'),
      2: createCell('Approved', 'header'),
      3: createCell('Forecast', 'header'),
      4: createCell('Variance', 'header'),
      5: createCell('Variance %', 'header'),
      6: createCell('Action', 'header'),
    },
  }

  budgetRows.forEach((row, index) => {
    const rowIndex = index + 4
    const sheetRow = rowIndex + 1
    const variance = row[2] - row[3]

    cellData[rowIndex] = {
      0: createCell(row[0], 'workstream'),
      1: createCell(row[1], index % 2 === 0 ? 'body' : 'bodyAlt'),
      2: createCell(row[2], 'currency'),
      3: createCell(row[3], 'currency'),
      4: createCell(variance, variance < 0 ? 'currencyNegative' : 'currencyPositive', `=C${sheetRow}-D${sheetRow}`),
      5: createCell(
        variance / row[2],
        variance < 0 ? 'percentNegative' : 'percentPositive',
        `=E${sheetRow}/C${sheetRow}`,
      ),
      6: createCell(row[4], 'select'),
    }
  })

  cellData[11] = {
    0: createCell('TOTAL LAUNCH ENVELOPE', 'totalLabel'),
    2: createCell(905000, 'totalCurrency', '=SUM(C5:C11)'),
    3: createCell(922600, 'totalCurrency', '=SUM(D5:D11)'),
    4: createCell(-17600, 'totalCurrencyAlert', '=C12-D12'),
    5: createCell(-0.0194, 'totalPercentAlert', '=E12/C12'),
  }

  return cellData
}

const cellBorder = { b: { s: BorderStyleTypes.THIN, cl: { rgb: '#E6EEF5' } } }
const cardBorder = {
  t: { s: BorderStyleTypes.THIN, cl: { rgb: '#BCCCDC' } },
  l: { s: BorderStyleTypes.THIN, cl: { rgb: '#BCCCDC' } },
  r: { s: BorderStyleTypes.THIN, cl: { rgb: '#BCCCDC' } },
}
const bodyCell = {
  ff: 'Inter',
  fs: 9,
  cl: { rgb: '#334E68' },
  vt: VerticalAlign.MIDDLE,
  pd: { l: 7, r: 5, t: 2, b: 2 },
  bd: cellBorder,
}
const numericCell = {
  ...bodyCell,
  ht: HorizontalAlign.RIGHT,
  pd: { l: 5, r: 7, t: 2, b: 2 },
}
const kpiValue = {
  ff: 'Inter',
  fs: 19,
  bl: BooleanNumber.TRUE,
  bg: { rgb: '#FFFFFF' },
  cl: { rgb: '#102A43' },
  ht: HorizontalAlign.CENTER,
  vt: VerticalAlign.BOTTOM,
  bd: cardBorder,
}
const kpiLabel = {
  ff: 'Inter',
  fs: 8,
  bl: BooleanNumber.TRUE,
  bg: { rgb: '#FFFFFF' },
  cl: { rgb: '#627D98' },
  ht: HorizontalAlign.CENTER,
  vt: VerticalAlign.TOP,
  bd: {
    b: { s: BorderStyleTypes.THIN, cl: { rgb: '#BCCCDC' } },
    l: { s: BorderStyleTypes.THIN, cl: { rgb: '#BCCCDC' } },
    r: { s: BorderStyleTypes.THIN, cl: { rgb: '#BCCCDC' } },
  },
}

const sheetStyles = {
  title: {
    ff: 'Inter',
    fs: 17,
    bl: BooleanNumber.TRUE,
    bg: { rgb: '#102A43' },
    cl: { rgb: '#FFFFFF' },
    vt: VerticalAlign.MIDDLE,
    pd: { l: 14, r: 10, t: 4, b: 4 },
  },
  subtitle: {
    ff: 'Inter',
    fs: 10,
    bg: { rgb: '#EAF2F8' },
    cl: { rgb: '#486581' },
    vt: VerticalAlign.MIDDLE,
    pd: { l: 14, r: 10, t: 2, b: 2 },
  },
  kpiValue,
  kpiPercent: { ...kpiValue, bg: { rgb: '#F0FDF4' }, cl: { rgb: '#166534' }, n: { pattern: '0%' } },
  kpiCurrency: { ...kpiValue, fs: 18, n: { pattern: '$#,##0' } },
  kpiCurrencyAlert: {
    ...kpiValue,
    fs: 18,
    bg: { rgb: '#FFF7ED' },
    cl: { rgb: '#C2410C' },
    n: { pattern: '$#,##0;[Red]-$#,##0' },
  },
  kpiAlert: { ...kpiValue, bg: { rgb: '#FEF2F2' }, cl: { rgb: '#B91C1C' } },
  kpiLabel,
  kpiLabelGreen: { ...kpiLabel, bg: { rgb: '#F0FDF4' }, cl: { rgb: '#166534' } },
  kpiLabelOrange: { ...kpiLabel, bg: { rgb: '#FFF7ED' }, cl: { rgb: '#9A3412' } },
  kpiLabelRed: { ...kpiLabel, bg: { rgb: '#FEF2F2' }, cl: { rgb: '#B91C1C' } },
  header: {
    ff: 'Inter',
    fs: 9,
    bl: BooleanNumber.TRUE,
    bg: { rgb: '#243B53' },
    cl: { rgb: '#FFFFFF' },
    vt: VerticalAlign.MIDDLE,
    pd: { l: 7, r: 5, t: 2, b: 2 },
  },
  body: bodyCell,
  bodyAlt: { ...bodyCell, bg: { rgb: '#F7FAFC' } },
  workstream: { ...bodyCell, bl: BooleanNumber.TRUE, cl: { rgb: '#102A43' } },
  select: { ...bodyCell, ht: HorizontalAlign.CENTER, pd: { l: 2, r: 2, t: 1, b: 1 } },
  percent: { ...numericCell, n: { pattern: '0%' }, cl: { rgb: '#0F766E' } },
  currency: { ...numericCell, n: { pattern: '$#,##0' } },
  currencyPositive: { ...numericCell, bl: BooleanNumber.TRUE, n: { pattern: '$#,##0' }, cl: { rgb: '#15803D' } },
  currencyNegative: {
    ...numericCell,
    bl: BooleanNumber.TRUE,
    n: { pattern: '$#,##0;[Red]-$#,##0' },
    cl: { rgb: '#B91C1C' },
  },
  percentPositive: { ...numericCell, bl: BooleanNumber.TRUE, n: { pattern: '0.0%' }, cl: { rgb: '#15803D' } },
  percentNegative: {
    ...numericCell,
    bl: BooleanNumber.TRUE,
    n: { pattern: '0.0%;[Red]-0.0%' },
    cl: { rgb: '#B91C1C' },
  },
  date: { ...bodyCell, n: { pattern: 'mmm d' }, ht: HorizontalAlign.CENTER },
  sectionLabel: {
    ...bodyCell,
    bl: BooleanNumber.TRUE,
    bg: { rgb: '#102A43' },
    cl: { rgb: '#FFFFFF' },
  },
  decision: {
    ...bodyCell,
    bl: BooleanNumber.TRUE,
    bg: { rgb: '#FFF7ED' },
    cl: { rgb: '#9A3412' },
    tb: WrapStrategy.WRAP,
  },
  totalLabel: { ...bodyCell, bl: BooleanNumber.TRUE, bg: { rgb: '#D9E2EC' }, cl: { rgb: '#102A43' } },
  totalCurrency: {
    ...numericCell,
    bl: BooleanNumber.TRUE,
    bg: { rgb: '#D9E2EC' },
    n: { pattern: '$#,##0' },
    cl: { rgb: '#102A43' },
  },
  totalCurrencyAlert: {
    ...numericCell,
    bl: BooleanNumber.TRUE,
    bg: { rgb: '#FEE2E2' },
    n: { pattern: '$#,##0;[Red]-$#,##0' },
    cl: { rgb: '#B91C1C' },
  },
  totalPercentAlert: {
    ...numericCell,
    bl: BooleanNumber.TRUE,
    bg: { rgb: '#FEE2E2' },
    n: { pattern: '0.0%;[Red]-0.0%' },
    cl: { rgb: '#B91C1C' },
  },
}

const workbookResources = [
  {
    name: 'SHEET_CONDITIONAL_FORMATTING_PLUGIN',
    data: JSON.stringify({
      [EXECUTIVE_SHEET_ID]: [
        {
          cfId: 'launch-progress-bars',
          ranges: [{ startRow: 6, startColumn: 4, endRow: 14, endColumn: 4, rangeType: 0 }],
          rule: {
            type: 'dataBar',
            isShowValue: true,
            config: {
              min: { type: 'num', value: 0 },
              max: { type: 'num', value: 1 },
              isGradient: false,
              positiveColor: '#2CB1BC',
              nativeColor: '#F97316',
            },
          },
          stopIfTrue: false,
        },
        {
          cfId: 'launch-negative-variance',
          ranges: [{ startRow: 6, startColumn: 7, endRow: 14, endColumn: 7, rangeType: 0 }],
          rule: {
            type: 'highlightCell',
            subType: 'number',
            operator: 'lessThan',
            value: 0,
            style: { bg: { rgb: '#FEF2F2' }, cl: { rgb: '#B91C1C' } },
          },
          stopIfTrue: false,
        },
      ],
      [BUDGET_SHEET_ID]: [],
    }),
  },
  {
    name: 'SHEET_DATA_VALIDATION_PLUGIN',
    data: JSON.stringify({
      [EXECUTIVE_SHEET_ID]: [
        {
          uid: 'launch-status-validation',
          type: 'list',
          formula1: 'Planned,In progress,In review,At risk,Done',
          formula2: '#E9D5FF,#DBEAFE,#FEF3C7,#FEE2E2,#DCFCE7',
          ranges: [
            {
              startRow: 6,
              startColumn: 2,
              endRow: 14,
              endColumn: 2,
              rangeType: 0,
              unitId: WORKBOOK_ID,
              sheetId: EXECUTIVE_SHEET_ID,
            },
          ],
        },
        {
          uid: 'launch-risk-validation',
          type: 'list',
          formula1: 'Low,Medium,High',
          formula2: '#DCFCE7,#FEF3C7,#FEE2E2',
          ranges: [
            {
              startRow: 6,
              startColumn: 9,
              endRow: 14,
              endColumn: 9,
              rangeType: 0,
              unitId: WORKBOOK_ID,
              sheetId: EXECUTIVE_SHEET_ID,
            },
          ],
        },
      ],
      [BUDGET_SHEET_ID]: [
        {
          uid: 'budget-action-validation',
          type: 'list',
          formula1: 'Committed,Review,Escalate',
          formula2: '#DCFCE7,#FEF3C7,#FEE2E2',
          ranges: [
            {
              startRow: 4,
              startColumn: 6,
              endRow: 10,
              endColumn: 6,
              rangeType: 0,
              unitId: WORKBOOK_ID,
              sheetId: BUDGET_SHEET_ID,
            },
          ],
        },
      ],
    }),
  },
  { name: 'SHEET_FILTER_PLUGIN', data: '{}' },
  { name: 'SHEET_DRAWING_PLUGIN', data: '{}' },
  { name: 'SHEET_TABLE_PLUGIN', data: '{}' },
  { name: 'SHEET_NOTE_PLUGIN', data: '{}' },
  { name: 'SHEET_DEFINED_NAME_PLUGIN', data: '{}' },
]

export const workbookData = {
  id: WORKBOOK_ID,
  name: 'Northstar Global Launch',
  locale: LocaleType.EN_US,
  sheetOrder: [EXECUTIVE_SHEET_ID, BUDGET_SHEET_ID],
  styles: sheetStyles,
  sheets: {
    [EXECUTIVE_SHEET_ID]: {
      id: EXECUTIVE_SHEET_ID,
      name: 'Executive view',
      hidden: BooleanNumber.FALSE,
      rowCount: 200,
      columnCount: 16,
      zoomRatio: 1,
      scrollTop: 0,
      scrollLeft: 0,
      defaultColumnWidth: 88,
      defaultRowHeight: 25,
      mergeData: [
        { startRow: 0, endRow: 0, startColumn: 0, endColumn: 9 },
        { startRow: 1, endRow: 1, startColumn: 0, endColumn: 9 },
        ...[0, 2, 4, 6, 8].flatMap((startColumn) => [
          { startRow: 2, endRow: 2, startColumn, endColumn: startColumn + 1 },
          { startRow: 3, endRow: 3, startColumn, endColumn: startColumn + 1 },
        ]),
        { startRow: 16, endRow: 16, startColumn: 0, endColumn: 1 },
        { startRow: 16, endRow: 16, startColumn: 2, endColumn: 9 },
      ],
      cellData: createExecutiveCellData(),
      rowData: {
        0: { h: 40 },
        1: { h: 28 },
        2: { h: 39 },
        3: { h: 24 },
        4: { h: 12 },
        5: { h: 28 },
        6: { h: 29 },
        7: { h: 29 },
        8: { h: 29 },
        9: { h: 29 },
        10: { h: 29 },
        11: { h: 29 },
        12: { h: 29 },
        13: { h: 29 },
        14: { h: 29 },
        15: { h: 12 },
        16: { h: 34 },
      },
      columnData: {
        0: { w: 188 },
        1: { w: 118 },
        2: { w: 116 },
        3: { w: 92 },
        4: { w: 96 },
        5: { w: 104 },
        6: { w: 104 },
        7: { w: 98 },
        8: { w: 100 },
        9: { w: 88 },
      },
      freeze: { startRow: 5, startColumn: 0, ySplit: 5, xSplit: 1 },
      rowHeader: { width: 42, hidden: BooleanNumber.FALSE },
      columnHeader: { height: 22, hidden: BooleanNumber.FALSE },
      showGridlines: BooleanNumber.FALSE,
      rightToLeft: BooleanNumber.FALSE,
    },
    [BUDGET_SHEET_ID]: {
      id: BUDGET_SHEET_ID,
      name: 'Investment plan',
      tabColor: '#F59E0B',
      hidden: BooleanNumber.FALSE,
      rowCount: 120,
      columnCount: 12,
      zoomRatio: 1,
      scrollTop: 0,
      scrollLeft: 0,
      defaultColumnWidth: 96,
      defaultRowHeight: 27,
      mergeData: [
        { startRow: 0, endRow: 0, startColumn: 0, endColumn: 6 },
        { startRow: 1, endRow: 1, startColumn: 0, endColumn: 6 },
        { startRow: 11, endRow: 11, startColumn: 0, endColumn: 1 },
      ],
      cellData: createBudgetCellData(),
      rowData: {
        0: { h: 40 },
        1: { h: 28 },
        2: { h: 14 },
        3: { h: 30 },
        4: { h: 30 },
        5: { h: 30 },
        6: { h: 30 },
        7: { h: 30 },
        8: { h: 30 },
        9: { h: 30 },
        10: { h: 30 },
        11: { h: 34 },
      },
      columnData: {
        0: { w: 210 },
        1: { w: 150 },
        2: { w: 120 },
        3: { w: 120 },
        4: { w: 120 },
        5: { w: 110 },
        6: { w: 118 },
      },
      freeze: { startRow: 3, startColumn: 0, ySplit: 3, xSplit: 0 },
      rowHeader: { width: 42, hidden: BooleanNumber.FALSE },
      columnHeader: { height: 22, hidden: BooleanNumber.FALSE },
      showGridlines: BooleanNumber.FALSE,
      rightToLeft: BooleanNumber.FALSE,
    },
  },
  resources: workbookResources,
} as unknown as Partial<IWorkbookData>

const documentBuilder = {
  dataStream: '',
  pageBreakIndexes: [] as number[],
  paragraphs: [] as Array<Record<string, unknown>>,
  textRuns: [] as Array<Record<string, unknown>>,
}

function appendDocumentParagraph(
  text: string,
  textStyle: Record<string, unknown>,
  paragraphStyle: Record<string, unknown> = {},
) {
  const startIndex = documentBuilder.dataStream.length
  documentBuilder.dataStream += `${text}\r`

  if (text.length > 0) {
    documentBuilder.textRuns.push({ st: startIndex, ed: startIndex + text.length, ts: textStyle })
  }

  documentBuilder.paragraphs.push({
    startIndex: documentBuilder.dataStream.length - 1,
    paragraphStyle,
  })
}

function appendDocumentPageBreak() {
  documentBuilder.pageBreakIndexes.push(documentBuilder.dataStream.length)
  documentBuilder.dataStream += `${DataStreamTreeTokenType.PAGE_BREAK}\r`
  documentBuilder.paragraphs.push({
    startIndex: documentBuilder.dataStream.length - 1,
    paragraphStyle: {},
  })
}

const bodyText = { ff: 'Arial', fs: 11, cl: { rgb: '#334E68' } }
const mutedText = { ff: 'Arial', fs: 9, cl: { rgb: '#627D98' } }
const headingText = { ff: 'Arial', fs: 15, bl: BooleanNumber.TRUE, cl: { rgb: '#0E7490' } }
const subheadingText = { ff: 'Arial', fs: 11, bl: BooleanNumber.TRUE, cl: { rgb: '#102A43' } }

appendDocumentParagraph(
  'NORTHSTAR GLOBAL LAUNCH',
  { ff: 'Arial', fs: 9, bl: BooleanNumber.TRUE, cl: { rgb: '#0E7490' } },
  { spaceBelow: { v: 10 } },
)
appendDocumentParagraph(
  'Launch readiness decision brief',
  { ff: 'Arial', fs: 28, bl: BooleanNumber.TRUE, cl: { rgb: '#102A43' } },
  { spaceBelow: { v: 10 } },
)
appendDocumentParagraph('EXECUTIVE OPERATING MEMO  ·  22 AUGUST 2026  ·  CONFIDENTIAL', mutedText, {
  spaceBelow: { v: 22 },
})
appendDocumentParagraph('Decision required', headingText, { spaceBelow: { v: 6 } })
appendDocumentParagraph(
  'Approve the September 22 global launch while containing the billing migration variance to a $15K contingency. Regional activation remains on plan; the remaining exposure is concentrated in one technical workstream.',
  { ...bodyText, bl: BooleanNumber.TRUE, bg: { rgb: '#FFF7ED' }, cl: { rgb: '#9A3412' } },
  { spaceBelow: { v: 18 } },
)
appendDocumentParagraph('Executive signal', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  '86% readiness     2 workstreams complete     $875K approved     2 high-risk items',
  { ff: 'Arial', fs: 13, bl: BooleanNumber.TRUE, cl: { rgb: '#102A43' } },
  { spaceBelow: { v: 8 } },
)
appendDocumentParagraph(
  'Readiness improved eight points this week. Support, analytics, and the release candidate are green. EMEA partner certification is tracking to plan; APAC launch kits require daily review until localization quality clears 95%.',
  bodyText,
  { spaceBelow: { v: 18 } },
)
appendDocumentParagraph('What changed this week', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph('✓  Release candidate passed performance and recovery testing.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('✓  Enterprise onboarding entered legal and security review.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('→  Partner certification reached 76% across the priority cohort.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph(
  '!   Billing migration forecast increased by $21K after scope validation.',
  { ...bodyText, bl: BooleanNumber.TRUE, cl: { rgb: '#B91C1C' } },
  { spaceBelow: { v: 18 }, indentStart: { v: 10 } },
)
appendDocumentParagraph('Operating priorities', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph('1. Lock the billing cutover sequence and rollback owner by Tuesday.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('2. Complete APAC localization QA with market-level sign-off.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('3. Convert executive roadshow feedback into the launch FAQ within 24 hours.', bodyText, {
  spaceBelow: { v: 22 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('Risk and mitigation', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'BILLING MIGRATION  /  HIGH',
  { ff: 'Arial', fs: 10, bl: BooleanNumber.TRUE, cl: { rgb: '#B91C1C' } },
  { spaceBelow: { v: 4 } },
)
appendDocumentParagraph(
  'Exposure: budget and schedule compression. Mitigation: freeze non-critical scope, stage the cutover, and fund the approved contingency only after the Tuesday checkpoint.',
  bodyText,
  { spaceBelow: { v: 12 } },
)
appendDocumentParagraph(
  'LOCALIZED LAUNCH KITS  /  HIGH',
  { ff: 'Arial', fs: 10, bl: BooleanNumber.TRUE, cl: { rgb: '#B91C1C' } },
  { spaceBelow: { v: 4 } },
)
appendDocumentParagraph(
  'Exposure: inconsistent partner messaging in two APAC markets. Mitigation: local reviewer pairs, a single-source glossary, and daily quality sampling.',
  bodyText,
  { spaceBelow: { v: 18 } },
)
appendDocumentPageBreak()
appendDocumentParagraph('Regional execution plan', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'The launch sequence is intentionally staggered so that each regional team can absorb evidence from the previous activation window without changing the global customer promise.',
  { ...bodyText, bl: BooleanNumber.TRUE },
  { spaceBelow: { v: 16 } },
)
appendDocumentParagraph('AMERICAS  /  COMMERCIAL ACTIVATION', subheadingText, { spaceBelow: { v: 4 } })
appendDocumentParagraph(
  'Enterprise onboarding begins with twelve design partners and expands only after the billing reconciliation report clears. Sales engineering owns solution validation; Revenue Operations owns contract and entitlement exceptions.',
  bodyText,
  { spaceBelow: { v: 14 } },
)
appendDocumentParagraph('EMEA  /  PARTNER CERTIFICATION', subheadingText, { spaceBelow: { v: 4 } })
appendDocumentParagraph(
  'Priority partners complete the certification lab by September 16. The regional lead publishes one evidence pack covering security, data residency, migration, and escalation paths for every participating market.',
  bodyText,
  { spaceBelow: { v: 14 } },
)
appendDocumentParagraph('APAC  /  LOCALIZED LAUNCH KITS', subheadingText, { spaceBelow: { v: 4 } })
appendDocumentParagraph(
  'Local reviewer pairs validate product strings, lifecycle email, help content, and partner training. No market is released below the 95% quality threshold; exceptions require written approval from the regional GM.',
  bodyText,
  { spaceBelow: { v: 18 } },
)
appendDocumentParagraph('Dependency map', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph('01  Billing cutover must finish before enterprise entitlements are activated.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('02  Support playbooks depend on the final rollback and incident taxonomy.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('03  Regional campaigns release only after the localized evidence pack is signed.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph(
  '04  Executive reporting consumes the same readiness source used by delivery teams.',
  bodyText,
  {
    spaceBelow: { v: 18 },
    indentStart: { v: 10 },
  },
)
appendDocumentParagraph('Customer and partner communications', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'The launch narrative leads with workflow continuity, controlled migration, and measurable operating readiness. Product marketing owns the public story; Customer Success adapts it to account-level adoption plans without changing claims or dates.',
  bodyText,
  { spaceBelow: { v: 12 } },
)
appendDocumentParagraph(
  'A single launch FAQ is published from the command center. Questions that expose new commercial, security, or reliability risk are routed back into the decision register within four business hours.',
  bodyText,
  { spaceBelow: { v: 18 } },
)
appendDocumentPageBreak()
appendDocumentParagraph('Go-live operating system', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'The command center is a decision system, not a meeting calendar. Every checkpoint must change an owner, release an action, accept a risk, or close an evidence gap.',
  { ...bodyText, bl: BooleanNumber.TRUE, bg: { rgb: '#ECFEFF' } },
  { spaceBelow: { v: 18 } },
)
appendDocumentParagraph('Command center roles', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph('PRODUCT OPERATIONS  ·  integrated plan, readiness index, and decision log', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('ENGINEERING  ·  release quality, rollback design, and production telemetry', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('REGIONAL LEADS  ·  localization evidence, partner readiness, and market sign-off', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('FINANCE & LEGAL  ·  contingency control, contract exposure, and approval record', bodyText, {
  spaceBelow: { v: 18 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('Evidence required before the final gate', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph('✓  Production rollback rehearsal completed with named operators.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('✓  Billing reconciliation variance inside the approved contingency.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('✓  Support coverage and severity routing confirmed for all launch markets.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('✓  Localized product, lifecycle, and partner materials above 95% quality.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('✓  Executive decision record signed and distributed to accountable owners.', bodyText, {
  spaceBelow: { v: 18 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('Day-one operating rhythm', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  '06:00 UTC  ·  deployment and telemetry baseline  |  09:00 UTC  ·  regional activation review  |  13:00 UTC  ·  customer signal synthesis  |  17:00 UTC  ·  executive status and next-day decision',
  bodyText,
  { spaceBelow: { v: 18 } },
)
appendDocumentParagraph('Governance cadence', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'Monday 09:30  ·  launch control review  |  Wednesday 16:00  ·  regional readiness council  |  Friday 11:00  ·  executive go / no-go checkpoint',
  bodyText,
  { spaceBelow: { v: 18 } },
)
appendDocumentParagraph('Recommendation', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'Proceed with the September 22 launch. Product Operations owns the integrated plan, Finance controls contingency release, and each regional lead signs the readiness certificate before go-live.',
  { ...bodyText, bl: BooleanNumber.TRUE },
  { spaceBelow: { v: 18 } },
)
appendDocumentPageBreak()
appendDocumentParagraph('Readiness measurement framework', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'The readiness index converts evidence from five operating domains into one decision signal. It is deliberately compact enough for executive use while retaining a traceable link to every control, owner, and source artifact.',
  { ...bodyText, bl: BooleanNumber.TRUE },
  { spaceBelow: { v: 16 } },
)
appendDocumentParagraph('SCORING MODEL  /  100 POINTS', subheadingText, { spaceBelow: { v: 6 } })
appendDocumentParagraph('25  RELEASE QUALITY  ·  performance, recovery, security, and deployment evidence', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('20  CUSTOMER READINESS  ·  onboarding, support coverage, and account plans', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('20  COMMERCIAL CONTROL  ·  pricing, billing, contracts, and entitlement integrity', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph(
  '20  MARKET ACTIVATION  ·  localization, partners, campaigns, and regional approval',
  bodyText,
  {
    spaceBelow: { v: 6 },
    indentStart: { v: 10 },
  },
)
appendDocumentParagraph(
  '15  OPERATING RESILIENCE  ·  observability, incident command, and rollback capacity',
  bodyText,
  {
    spaceBelow: { v: 16 },
    indentStart: { v: 10 },
  },
)
appendDocumentParagraph('Decision thresholds', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  '90–100  /  READY  ·  all critical controls verified; remaining work is routine and fully owned.',
  { ...bodyText, bl: BooleanNumber.TRUE, cl: { rgb: '#166534' } },
  { spaceBelow: { v: 6 }, indentStart: { v: 10 } },
)
appendDocumentParagraph(
  '75–89  /  CONDITIONAL  ·  launch may proceed only with an accepted exposure, dated mitigation, and named decision owner.',
  { ...bodyText, bl: BooleanNumber.TRUE, cl: { rgb: '#9A3412' } },
  { spaceBelow: { v: 6 }, indentStart: { v: 10 } },
)
appendDocumentParagraph(
  'BELOW 75  /  HOLD  ·  evidence is insufficient or intervention capacity is too low to contain a launch failure.',
  { ...bodyText, bl: BooleanNumber.TRUE, cl: { rgb: '#B91C1C' } },
  { spaceBelow: { v: 16 }, indentStart: { v: 10 } },
)
appendDocumentParagraph('Evidence policy', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'A control receives credit only when the artifact is current, names an accountable owner, and has been checked by someone outside the producing team. Screenshots without source links, undated status messages, and self-reported percentages do not qualify as verified evidence.',
  bodyText,
  { spaceBelow: { v: 12 } },
)
appendDocumentParagraph(
  'Every score change above five points requires a short explanation in the decision log. Product Operations publishes both the current score and its seven-day movement so leaders can distinguish genuine convergence from a late reporting surge.',
  bodyText,
  { spaceBelow: { v: 18 } },
)
appendDocumentParagraph('Scenario test', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'If billing remains outside the approved variance on September 19, readiness falls to 78 and the launch becomes conditional. The default response is to delay enterprise entitlement activation—not the entire regional release—while preserving the tested deployment and support plan.',
  { ...bodyText, bg: { rgb: '#FFF7ED' } },
  { spaceBelow: { v: 18 } },
)
appendDocumentPageBreak()
appendDocumentParagraph('Cutover and incident operating plan', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'Launch day is organized as a controlled sequence with explicit entry criteria, exit evidence, and rollback authority. Time alone never advances the release to the next phase.',
  { ...bodyText, bl: BooleanNumber.TRUE },
  { spaceBelow: { v: 16 } },
)
appendDocumentParagraph('CUTOVER SEQUENCE', subheadingText, { spaceBelow: { v: 6 } })
appendDocumentParagraph('01  PRE-FLIGHT  /  freeze configuration, confirm operators, archive the baseline.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph(
  '02  DEPLOY  /  release to internal and design-partner cohorts with full telemetry.',
  bodyText,
  {
    spaceBelow: { v: 6 },
    indentStart: { v: 10 },
  },
)
appendDocumentParagraph(
  '03  VERIFY  /  reconcile billing, entitlements, latency, errors, and support intake.',
  bodyText,
  {
    spaceBelow: { v: 6 },
    indentStart: { v: 10 },
  },
)
appendDocumentParagraph('04  EXPAND  /  activate regions in sequence after evidence is signed.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph(
  '05  STABILIZE  /  hold scope, publish status, and transfer ownership to operations.',
  bodyText,
  {
    spaceBelow: { v: 16 },
    indentStart: { v: 10 },
  },
)
appendDocumentParagraph('Rollback triggers', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph('•  Severity 1 customer impact or confirmed data-integrity exposure.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('•  Billing or entitlement variance above 2% for two consecutive checkpoints.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('•  Authentication success below 99.5% in any activated market.', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph(
  '•  Recovery-point or recovery-time objectives missed during production verification.',
  bodyText,
  {
    spaceBelow: { v: 16 },
    indentStart: { v: 10 },
  },
)
appendDocumentParagraph('Incident command', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'The Incident Commander owns the operational decision; the Technical Lead owns diagnosis and recovery; the Communications Lead publishes one customer-facing narrative; the Regional Liaison validates market impact; the Scribe maintains the timeline and evidence record.',
  bodyText,
  { spaceBelow: { v: 12 } },
)
appendDocumentParagraph(
  'Rollback authority sits with the Incident Commander and does not require a committee vote after a trigger is met. The executive sponsor may accept a commercial delay, but may not waive a security, data-integrity, or recovery control.',
  { ...bodyText, bl: BooleanNumber.TRUE, bg: { rgb: '#FEE2E2' }, cl: { rgb: '#991B1B' } },
  { spaceBelow: { v: 18 } },
)
appendDocumentParagraph('Observability pack', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'The command center displays deployment health, API latency, authentication success, billing reconciliation, entitlement drift, support contacts, adoption by cohort, and regional campaign status. Each signal includes a baseline, threshold, owner, and last-updated timestamp.',
  bodyText,
  { spaceBelow: { v: 18 } },
)
appendDocumentPageBreak()
appendDocumentParagraph('Customer adoption and enablement plan', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'A reliable release is necessary but not sufficient. The adoption plan converts the same launch evidence into customer-specific actions so that product availability becomes measurable business use.',
  { ...bodyText, bl: BooleanNumber.TRUE },
  { spaceBelow: { v: 16 } },
)
appendDocumentParagraph('Cohort strategy', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'DESIGN PARTNERS  /  12 accounts  ·  high-touch migration, daily feedback, named engineering liaison, and direct access to the command center during the first five days.',
  bodyText,
  { spaceBelow: { v: 8 }, indentStart: { v: 10 } },
)
appendDocumentParagraph(
  'ENTERPRISE WAVE 1  /  46 accounts  ·  readiness-based activation, customer success review, administrator training, and a seven-day adoption checkpoint.',
  bodyText,
  { spaceBelow: { v: 8 }, indentStart: { v: 10 } },
)
appendDocumentParagraph(
  'GENERAL AVAILABILITY  /  remaining eligible accounts  ·  self-serve activation with automated health scoring and exception routing to regional teams.',
  bodyText,
  { spaceBelow: { v: 16 }, indentStart: { v: 10 } },
)
appendDocumentParagraph('Enablement system', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'ADMINISTRATORS  ·  migration guide, controls checklist, live clinic, and rollback FAQ',
  bodyText,
  {
    spaceBelow: { v: 6 },
    indentStart: { v: 10 },
  },
)
appendDocumentParagraph('END USERS  ·  role-based walkthroughs, in-product prompts, and task templates', bodyText, {
  spaceBelow: { v: 6 },
  indentStart: { v: 10 },
})
appendDocumentParagraph(
  'PARTNERS  ·  certification lab, demo environment, objection guide, and escalation map',
  bodyText,
  {
    spaceBelow: { v: 6 },
    indentStart: { v: 10 },
  },
)
appendDocumentParagraph(
  'SUPPORT  ·  issue taxonomy, diagnostic scripts, severity routing, and known limits',
  bodyText,
  {
    spaceBelow: { v: 16 },
    indentStart: { v: 10 },
  },
)
appendDocumentParagraph('Adoption measures', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'Day 7  ·  80% of activated administrators complete setup  |  Day 30  ·  65% of eligible teams complete the core workflow  |  Day 60  ·  support contacts per active account fall below baseline  |  Day 90  ·  renewal-risk accounts show measurable workflow adoption.',
  { ...bodyText, bg: { rgb: '#ECFEFF' } },
  { spaceBelow: { v: 16 } },
)
appendDocumentParagraph('Feedback loop', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'Customer signals are reviewed twice daily during launch week and weekly thereafter. Product defects, documentation gaps, enablement friction, and commercial objections are separated before prioritization so that the correct team receives a clear problem statement and evidence.',
  bodyText,
  { spaceBelow: { v: 12 } },
)
appendDocumentParagraph(
  'The first thirty-day review compares intended value, observed use, support demand, and regional variance. Any cohort below target receives a recovery plan with an owner, intervention, expected movement, and next decision date.',
  bodyText,
  { spaceBelow: { v: 18 } },
)
appendDocumentPageBreak()
appendDocumentParagraph('Appendix  /  decision record and control checklist', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph('OPEN DECISIONS', subheadingText, { spaceBelow: { v: 6 } })
appendDocumentParagraph(
  'D-041  ·  BILLING CONTINGENCY  ·  Finance  ·  Pending Tuesday variance review  ·  Maximum release $15K',
  bodyText,
  { spaceBelow: { v: 7 }, indentStart: { v: 10 } },
)
appendDocumentParagraph(
  'D-042  ·  APAC ACTIVATION  ·  Regional GM  ·  Conditional on 95% localization quality  ·  Review daily',
  bodyText,
  { spaceBelow: { v: 7 }, indentStart: { v: 10 } },
)
appendDocumentParagraph(
  'D-043  ·  GLOBAL GO-LIVE  ·  Executive sponsor  ·  Approved for September 22  ·  Reconfirm at T−1',
  bodyText,
  { spaceBelow: { v: 16 }, indentStart: { v: 10 } },
)
appendDocumentParagraph('FINAL CONTROL CHECKLIST', subheadingText, { spaceBelow: { v: 6 } })
appendDocumentParagraph('□  Release artifact signed, immutable, and mapped to the approved change record.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('□  Rollback artifact verified in the production-equivalent environment.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('□  Security, privacy, legal, and data-residency exceptions closed or accepted.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('□  Billing reconciliation and entitlement sampling inside threshold.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('□  Support rota, incident roles, and regional escalation paths confirmed.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('□  Status page, customer notices, and internal communication drafts approved.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('□  Design-partner and Wave 1 account lists reconciled with customer owners.', bodyText, {
  spaceBelow: { v: 5 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('□  Executive decision record signed with residual risks explicitly named.', bodyText, {
  spaceBelow: { v: 16 },
  indentStart: { v: 10 },
})
appendDocumentParagraph('Document control', headingText, { spaceBelow: { v: 8 } })
appendDocumentParagraph(
  'Version 1.7  ·  Owner: Product Operations  ·  Review cycle: daily through launch, weekly through day 30  ·  Source systems: launch portfolio, decision register, incident ledger, customer adoption dashboard.',
  mutedText,
  { spaceBelow: { v: 8 } },
)
appendDocumentParagraph('Prepared by Product Operations  ·  Source: Northstar launch command center', mutedText)
documentBuilder.dataStream += '\n'

function createSegmentBody(text: string, horizontalAlign: HorizontalAlign) {
  return {
    dataStream: `${text}\r\n`,
    textRuns: [
      {
        st: 0,
        ed: text.length,
        ts: { ff: 'Arial', fs: 8, bl: BooleanNumber.TRUE, cl: { rgb: '#627D98' } },
      },
    ],
    paragraphs: [{ startIndex: text.length, paragraphStyle: { horizontalAlign } }],
    sectionBreaks: [{ startIndex: text.length + 1 }],
  }
}

function createHomeDocumentBody(isModern: boolean) {
  if (!isModern) {
    return {
      dataStream: documentBuilder.dataStream,
      paragraphs: structuredClone(documentBuilder.paragraphs),
      textRuns: structuredClone(documentBuilder.textRuns),
    }
  }

  const pageBreakLength = DataStreamTreeTokenType.PAGE_BREAK.length
  const chunks: string[] = []
  let cursor = 0

  for (const pageBreakIndex of documentBuilder.pageBreakIndexes) {
    chunks.push(documentBuilder.dataStream.slice(cursor, pageBreakIndex))
    cursor = pageBreakIndex + pageBreakLength
  }
  chunks.push(documentBuilder.dataStream.slice(cursor))

  function remapIndex(index: number) {
    const precedingPageBreaks = documentBuilder.pageBreakIndexes.filter((pageBreakIndex) => pageBreakIndex < index)
    return index - precedingPageBreaks.length * pageBreakLength
  }

  return {
    dataStream: chunks.join(''),
    paragraphs: documentBuilder.paragraphs.map((paragraph) => {
      const remappedParagraph = structuredClone(paragraph)
      remappedParagraph.startIndex = remapIndex(paragraph.startIndex as number)
      return remappedParagraph
    }),
    textRuns: documentBuilder.textRuns.map((textRun) => {
      const remappedTextRun = structuredClone(textRun)
      remappedTextRun.st = remapIndex(textRun.st as number)
      remappedTextRun.ed = remapIndex(textRun.ed as number)
      return remappedTextRun
    }),
  }
}

function createHomeDocumentData(documentFlavor: DocumentFlavor, id: string, title: string) {
  const isModern = documentFlavor === DocumentFlavor.MODERN
  const body = createHomeDocumentBody(isModern)

  return {
    id,
    locale: LocaleType.EN_US,
    title,
    documentStyle: {
      pageSize: {
        width: isModern ? MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.MEDIUM] : 793.3333333333334,
        height: isModern ? 960 : 1122.6666666666667,
      },
      marginTop: 72,
      marginBottom: 68,
      marginRight: 74,
      marginLeft: 74,
      marginHeader: 34,
      marginFooter: 34,
      renderConfig: {
        zeroWidthParagraphBreak: BooleanNumber.FALSE,
        vertexAngle: 0,
        centerAngle: 0,
      },
      defaultHeaderId: isModern ? '' : 'northstar-header',
      defaultFooterId: isModern ? '' : 'northstar-footer',
      evenPageHeaderId: '',
      evenPageFooterId: '',
      firstPageHeaderId: '',
      firstPageFooterId: '',
      evenAndOddHeaders: BooleanNumber.FALSE,
      useFirstPageHeaderFooter: BooleanNumber.FALSE,
      documentFlavor,
    },
    tableSource: {},
    drawings: {},
    drawingsOrder: [],
    headers: isModern
      ? {}
      : {
          'northstar-header': {
            headerId: 'northstar-header',
            body: createSegmentBody('NORTHSTAR  /  LAUNCH OPERATIONS', HorizontalAlign.LEFT),
          },
        },
    footers: isModern
      ? {}
      : {
          'northstar-footer': {
            footerId: 'northstar-footer',
            body: createSegmentBody('CONFIDENTIAL  ·  INTERNAL DECISION MATERIAL', HorizontalAlign.RIGHT),
          },
        },
    body: {
      dataStream: body.dataStream,
      textRuns: body.textRuns,
      paragraphs: body.paragraphs,
      sectionBreaks: [{ startIndex: body.dataStream.length - 1 }],
      tables: [],
      customBlocks: [],
      customRanges: [],
      customDecorations: [],
    },
    settings: { zoomRatio: 1 },
  } as unknown as Partial<IDocumentData>
}

export const modernDocumentData = createHomeDocumentData(
  DocumentFlavor.MODERN,
  'northstar-launch-brief-modern',
  'Northstar Launch Readiness · Modern',
)

export const traditionalDocumentData = createHomeDocumentData(
  DocumentFlavor.TRADITIONAL,
  'northstar-launch-brief-traditional',
  'Northstar Launch Readiness · Traditional',
)
