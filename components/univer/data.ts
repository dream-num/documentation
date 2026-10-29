import type {
  IBullet,
  IDocumentData,
  IParagraph,
  IParagraphStyle,
  ISectionBreak,
  ITable,
  ICustomTable,
  ITextRun,
  ITextStyle,
  IWorkbookData,
} from '@univerjs/core'
import {
  BooleanNumber,
  BorderStyleTypes,
  CellValueType,
  DashStyleType,
  DataStreamTreeTokenType,
  DocumentFlavor,
  HorizontalAlign,
  LocaleType,
  MODERN_DOCUMENT_WIDTH,
  ModernDocumentWidthMode,
  NamedStyleType,
  ObjectRelativeFromH,
  ObjectRelativeFromV,
  PRESET_LIST_TYPE,
  PresetListType,
  TableAlignmentType,
  TableRowHeightRule,
  TableSizeType,
  TableTextWrapType,
  VerticalAlign,
  VerticalAlignmentType,
  WrapStrategy,
} from '@univerjs/core'

const FEATURE_SHEET_ID = 'feature-tour'
const FORMULA_SHEET_ID = 'formula-lab'
const PRACTICE_SHEET_ID = 'practice-data'

const featureRows = [
  ['Live formulas', 'Edit F7 or G7', 'Try it', 'Calculate', 0.75, 1200, 950, 46200, 'Start here'],
  ['Number formats', 'Format a number', 'Try it', 'Format', 0.88, 120, 96, 46201, 'Next'],
  ['Data bars', 'Change E9 to 50%', 'Try it', 'Visualize', 0.76, 95, 91, 46202, 'Start here'],
  ['Dropdown cells', 'Choose a status', 'Try it', 'Validate', 0.64, 68, 72, 46203, 'Start here'],
  ['Conditional styles', 'Edit G11', 'Try it', 'Visualize', 0.52, 150, 171, 46204, 'Next'],
  ['Date formats', 'Change a date', 'Try it', 'Format', 0.82, 74, 73, 46205, 'Next'],
  ['Frozen headers', 'Scroll this sheet', 'Try it', 'Navigate', 1, 88, 86, 46206, 'Explore'],
  ['Merged cells', 'Select the title', 'Try it', 'Layout', 1, 42, 40, 46207, 'Explore'],
  ['Multiple sheets', 'Open Formula lab', 'Try it', 'Calculate', 0.35, 56, 55, 46208, 'Start here'],
] as const

const formulaRows = [
  ['SUM', 'Add two inputs', 120, 80, '=SUM(C5:D5)', 'Try it'],
  ['AVERAGE', 'Find the mean', 85, 95, '=AVERAGE(C6:D6)', 'Try it'],
  ['MIN', 'Pick the smaller input', 45, 60, '=MIN(C7:D7)', 'Try it'],
  ['MAX', 'Pick the larger input', 45, 60, '=MAX(C8:D8)', 'Try it'],
  ['COUNT', 'Count numeric inputs', 10, 20, '=COUNT(C9:D9)', 'Try it'],
  ['ABS', 'Measure a difference', 72, 100, '=ABS(C10-D10)', 'Try it'],
  ['ROUND', 'Round a division', 100, 3, '=ROUND(C11/D11,2)', 'Try it'],
] as const

const practiceRows = featureRows.flatMap((feature, featureIndex) =>
  ['Explore', 'Customize', 'Embed'].map((team, index) => {
    const estimate = 4 + featureIndex * 2 + index * 3
    const actual = estimate + [2, -1, -3][index]
    return [
      feature[0],
      feature[3],
      team,
      ['Done', 'In progress', 'Planned'][index],
      estimate,
      actual,
      estimate - actual,
      [1, 0.65, 0.2][index],
      46200 + featureIndex + index,
    ] as const
  }),
)

function createCell(value: string | number, style: string, formula?: string) {
  return {
    v: value,
    t: typeof value === 'number' ? CellValueType.NUMBER : CellValueType.STRING,
    s: style,
    ...(formula ? { f: formula } : null),
  }
}

function createFeatureCellData() {
  const cellData: Record<number, Record<number, ReturnType<typeof createCell>>> = {
    0: { 0: createCell('UNIVER SHEETS  /  LIVE FEATURE LAB', 'title') },
    1: {
      0: createCell(
        'Explore a spreadsheet that explains itself. Edit an input, choose a dropdown, or open Formula lab.',
        'subtitle',
      ),
    },
    2: {
      0: createCell(
        featureRows.reduce((sum, row) => sum + row[4], 0) / featureRows.length,
        'kpiPercent',
        '=AVERAGE(E7:E15)',
      ),
      2: createCell(featureRows.length, 'kpiValue', '=COUNTA(A7:A15)'),
      4: createCell(
        featureRows.reduce((sum, row) => sum + row[5], 0),
        'kpiNumber',
        '=SUM(F7:F15)',
      ),
      6: createCell(
        featureRows.reduce((sum, row) => sum + row[5] - row[6], 0),
        'kpiResult',
        '=SUM(F7:F15)-SUM(G7:G15)',
      ),
      8: createCell(featureRows.length, 'kpiAlert', '=COUNTIF(C7:C15,"Try it")'),
    },
    3: {
      0: createCell('AVERAGE · E7:E15', 'kpiLabelGreen'),
      2: createCell('FEATURES TO EXPLORE', 'kpiLabel'),
      4: createCell('SUM · INPUT A', 'kpiLabel'),
      6: createCell('SUM · A − B', 'kpiLabelOrange'),
      8: createCell('TRY IT → DONE', 'kpiLabelBlue'),
    },
    5: {
      0: createCell('Feature', 'header'),
      1: createCell('Try this', 'header'),
      2: createCell('Status', 'header'),
      3: createCell('Category', 'header'),
      4: createCell('Progress', 'header'),
      5: createCell('Input A', 'header'),
      6: createCell('Input B', 'header'),
      7: createCell('A − B', 'header'),
      8: createCell('Date format', 'header'),
      9: createCell('Explore', 'header'),
    },
    16: {
      0: createCell('Try it yourself', 'sectionLabel'),
      2: createCell(
        'Change F7 from 1200 to 1500: H7 and the summary update. Mark a row Done to track your tour.',
        'decision',
      ),
    },
  }

  featureRows.forEach((row, index) => {
    const rowIndex = index + 6
    const sheetRow = rowIndex + 1
    const variance = row[5] - row[6]

    cellData[rowIndex] = {
      0: createCell(row[0], 'feature'),
      1: createCell(row[1], index % 2 === 0 ? 'body' : 'bodyAlt'),
      2: createCell(row[2], 'select'),
      3: createCell(row[3], index % 2 === 0 ? 'body' : 'bodyAlt'),
      4: createCell(row[4], 'percent'),
      5: createCell(row[5], 'number'),
      6: createCell(row[6], 'number'),
      7: createCell(variance, variance < 0 ? 'numberNegative' : 'numberPositive', `=F${sheetRow}-G${sheetRow}`),
      8: createCell(row[7], 'date'),
      9: createCell(row[8], 'select'),
    }
  })

  return cellData
}

function createFormulaCellData() {
  const cellData: Record<number, Record<number, ReturnType<typeof createCell>>> = {
    0: { 0: createCell('UNIVER SHEETS  /  FORMULA LAB', 'title') },
    1: { 0: createCell('Edit inputs C and D. Select a result in E to inspect its live formula.', 'subtitle') },
    3: {
      0: createCell('Formula', 'header'),
      1: createCell('What it does', 'header'),
      2: createCell('Input A', 'header'),
      3: createCell('Input B', 'header'),
      4: createCell('Result', 'header'),
      5: createCell('Result / A', 'header'),
      6: createCell('Your tour', 'header'),
    },
  }
  const results = [200, 90, 45, 60, 2, 28, 33.33]
  formulaRows.forEach((row, index) => {
    const rowIndex = index + 4
    const sheetRow = rowIndex + 1
    cellData[rowIndex] = {
      0: createCell(row[0], 'feature'),
      1: createCell(row[1], index % 2 === 0 ? 'body' : 'bodyAlt'),
      2: createCell(row[2], 'number'),
      3: createCell(row[3], 'number'),
      4: createCell(results[index], index === 6 ? 'decimal' : 'numberPositive', row[4]),
      5: createCell(results[index] / row[2], 'percentPositive', `=E${sheetRow}/C${sheetRow}`),
      6: createCell(row[5], 'select'),
    }
  })
  cellData[11] = {
    0: createCell('TOTAL INPUTS & RESULTS', 'totalLabel'),
    2: createCell(477, 'totalNumber', '=SUM(C5:C11)'),
    3: createCell(518, 'totalNumber', '=SUM(D5:D11)'),
    4: createCell(458.33, 'decimal', '=SUM(E5:E11)'),
    5: createCell(458.33 / 477, 'totalPercentAlert', '=E12/C12'),
  }
  cellData[14] = { 0: createCell('CROSS-SHEET ANALYSIS  /  PRACTICE DATA', 'title') }
  cellData[15] = {
    0: createCell(
      'These results read the 27 records in Practice data. Edit that table and watch them recalculate.',
      'subtitle',
    ),
  }
  cellData[17] = Object.fromEntries(
    ['Function', 'Question', 'Result'].map((text, index) => [index, createCell(text, 'header')]),
  )
  const analysis = [
    [
      'SUM',
      'Total estimated hours',
      "=SUM('Practice data'!E5:E31)",
      practiceRows.reduce((sum, row) => sum + row[4], 0),
    ],
    [
      'SUMIF',
      'Actual hours · Explore',
      "=SUMIF('Practice data'!C5:C31,\"Explore\",'Practice data'!F5:F31)",
      practiceRows.filter((row) => row[2] === 'Explore').reduce((sum, row) => sum + row[5], 0),
    ],
    ['COUNTIF', 'Completed experiments', '=COUNTIF(\'Practice data\'!D5:D31,"Done")', 9],
    ['AVERAGE', 'Average completion', "=AVERAGE('Practice data'!H5:H31)", (1 + 0.65 + 0.2) / 3],
    [
      'SUMIFS',
      'Calculate · Done hours',
      "=SUMIFS('Practice data'!F5:F31,'Practice data'!B5:B31,\"Calculate\",'Practice data'!D5:D31,\"Done\")",
      28,
    ],
    [
      'IF',
      'Are all experiments done?',
      '=IF(C21=COUNTA(\'Practice data\'!A5:A31),"Complete","Keep exploring")',
      'Keep exploring',
    ],
  ] as const
  analysis.forEach(([fn, question, formula, result], index) => {
    cellData[index + 18] = {
      0: createCell(fn, 'feature'),
      1: createCell(question, 'body'),
      2: createCell(
        result,
        index === 3 ? 'percentPositive' : typeof result === 'number' ? 'numberPositive' : 'body',
        formula,
      ),
    }
  })
  return cellData
}

function createPracticeCellData() {
  const cellData: Record<number, Record<number, ReturnType<typeof createCell>>> = {
    0: { 0: createCell('UNIVER SHEETS  /  PRACTICE DATA', 'title') },
    1: {
      0: createCell(
        'A native table for sorting, filtering, and cross-sheet analysis. Sample learning tasks, not benchmarks.',
        'subtitle',
      ),
    },
    3: Object.fromEntries(
      [
        'Feature',
        'Category',
        'Track',
        'Status',
        'Estimate · h',
        'Actual · h',
        'Remaining · h',
        'Progress',
        'Review date',
      ].map((text, index) => [index, createCell(text, 'header')]),
    ),
  }
  practiceRows.forEach((row, index) => {
    const rowIndex = index + 4
    cellData[rowIndex] = Object.fromEntries(
      row.map((value, column) => [
        column,
        createCell(
          value,
          column === 8 ? 'date' : column === 7 ? 'percent' : column >= 4 ? 'number' : index % 2 ? 'bodyAlt' : 'body',
          column === 6 ? `=E${rowIndex + 1}-F${rowIndex + 1}` : undefined,
        ),
      ]),
    )
  })
  return cellData
}

const cellBorder = { b: { s: BorderStyleTypes.THIN, cl: { rgb: '#E6EEF5' } } }
const cardBorder = {
  t: { s: BorderStyleTypes.THIN, cl: { rgb: '#BCCCDC' } },
  l: { s: BorderStyleTypes.THIN, cl: { rgb: '#BCCCDC' } },
  r: { s: BorderStyleTypes.THIN, cl: { rgb: '#BCCCDC' } },
}
const bodyCell = {
  ff: 'Arial',
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
  ff: 'Arial',
  fs: 19,
  bl: BooleanNumber.TRUE,
  bg: { rgb: '#FFFFFF' },
  cl: { rgb: '#102A43' },
  ht: HorizontalAlign.CENTER,
  vt: VerticalAlign.BOTTOM,
  bd: cardBorder,
}
const kpiLabel = {
  ff: 'Arial',
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
    ff: 'Arial',
    fs: 17,
    bl: BooleanNumber.TRUE,
    bg: { rgb: '#102A43' },
    cl: { rgb: '#FFFFFF' },
    vt: VerticalAlign.MIDDLE,
    pd: { l: 14, r: 10, t: 4, b: 4 },
  },
  subtitle: {
    ff: 'Arial',
    fs: 10,
    bg: { rgb: '#EAF2F8' },
    cl: { rgb: '#486581' },
    vt: VerticalAlign.MIDDLE,
    pd: { l: 14, r: 10, t: 2, b: 2 },
  },
  kpiValue,
  kpiPercent: { ...kpiValue, bg: { rgb: '#F0FDF4' }, cl: { rgb: '#166534' }, n: { pattern: '0%' } },
  kpiNumber: { ...kpiValue, fs: 18, n: { pattern: '#,##0' } },
  kpiResult: {
    ...kpiValue,
    fs: 18,
    bg: { rgb: '#FFF7ED' },
    cl: { rgb: '#C2410C' },
    n: { pattern: '#,##0;[Red]-#,##0' },
  },
  kpiAlert: { ...kpiValue, bg: { rgb: '#EFF6FF' }, cl: { rgb: '#1D4ED8' } },
  kpiLabel,
  kpiLabelGreen: { ...kpiLabel, bg: { rgb: '#F0FDF4' }, cl: { rgb: '#166534' } },
  kpiLabelOrange: { ...kpiLabel, bg: { rgb: '#FFF7ED' }, cl: { rgb: '#9A3412' } },
  kpiLabelBlue: { ...kpiLabel, bg: { rgb: '#EFF6FF' }, cl: { rgb: '#1D4ED8' } },
  header: {
    ff: 'Arial',
    fs: 9,
    bl: BooleanNumber.TRUE,
    bg: { rgb: '#243B53' },
    cl: { rgb: '#FFFFFF' },
    vt: VerticalAlign.MIDDLE,
    pd: { l: 7, r: 5, t: 2, b: 2 },
  },
  body: bodyCell,
  bodyAlt: { ...bodyCell, bg: { rgb: '#F7FAFC' } },
  feature: { ...bodyCell, bl: BooleanNumber.TRUE, cl: { rgb: '#102A43' } },
  select: { ...bodyCell, ht: HorizontalAlign.CENTER, pd: { l: 2, r: 2, t: 1, b: 1 } },
  percent: { ...numericCell, n: { pattern: '0%' }, cl: { rgb: '#0F766E' } },
  number: { ...numericCell, n: { pattern: '#,##0' } },
  decimal: { ...numericCell, bl: BooleanNumber.TRUE, n: { pattern: '#,##0.00' }, cl: { rgb: '#15803D' } },
  numberPositive: { ...numericCell, bl: BooleanNumber.TRUE, n: { pattern: '#,##0' }, cl: { rgb: '#15803D' } },
  numberNegative: {
    ...numericCell,
    bl: BooleanNumber.TRUE,
    n: { pattern: '#,##0;[Red]-#,##0' },
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
  totalNumber: {
    ...numericCell,
    bl: BooleanNumber.TRUE,
    bg: { rgb: '#D9E2EC' },
    n: { pattern: '#,##0' },
    cl: { rgb: '#102A43' },
  },
  totalNumberAlert: {
    ...numericCell,
    bl: BooleanNumber.TRUE,
    bg: { rgb: '#FEE2E2' },
    n: { pattern: '#,##0;[Red]-#,##0' },
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
      [FEATURE_SHEET_ID]: [
        {
          cfId: 'feature-progress-bars',
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
          cfId: 'feature-negative-results',
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
      [FORMULA_SHEET_ID]: [],
    }),
  },
  {
    name: 'SHEET_DATA_VALIDATION_PLUGIN',
    data: JSON.stringify({
      [FEATURE_SHEET_ID]: [
        {
          uid: 'feature-status-validation',
          type: 'list',
          formula1: 'Try it,Exploring,Done',
          formula2: '#DBEAFE,#FEF3C7,#DCFCE7',
          ranges: [
            {
              startRow: 6,
              startColumn: 2,
              endRow: 14,
              endColumn: 2,
              rangeType: 0,
            },
          ],
        },
        {
          uid: 'feature-tour-validation',
          type: 'list',
          formula1: 'Start here,Next,Explore',
          formula2: '#DBEAFE,#FEF3C7,#DCFCE7',
          ranges: [
            {
              startRow: 6,
              startColumn: 9,
              endRow: 14,
              endColumn: 9,
              rangeType: 0,
            },
          ],
        },
      ],
      [FORMULA_SHEET_ID]: [
        {
          uid: 'formula-tour-validation',
          type: 'list',
          formula1: 'Try it,Exploring,Done',
          formula2: '#DBEAFE,#FEF3C7,#DCFCE7',
          ranges: [
            {
              startRow: 4,
              startColumn: 6,
              endRow: 10,
              endColumn: 6,
              rangeType: 0,
            },
          ],
        },
      ],
    }),
  },
]

export const workbookData = {
  // Each demo mount needs a new workbook ID to keep formula caches isolated.
  name: 'Univer Sheets · Feature lab',
  locale: LocaleType.EN_US,
  sheetOrder: [FEATURE_SHEET_ID, FORMULA_SHEET_ID, PRACTICE_SHEET_ID],
  styles: sheetStyles,
  sheets: {
    [FEATURE_SHEET_ID]: {
      id: FEATURE_SHEET_ID,
      name: 'Feature tour',
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
      cellData: createFeatureCellData(),
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
    [FORMULA_SHEET_ID]: {
      id: FORMULA_SHEET_ID,
      name: 'Formula lab',
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
        { startRow: 14, endRow: 14, startColumn: 0, endColumn: 6 },
        { startRow: 15, endRow: 15, startColumn: 0, endColumn: 6 },
        ...[17, 18, 19, 20, 21, 22, 23].map((row) => ({ startRow: row, endRow: row, startColumn: 2, endColumn: 6 })),
      ],
      cellData: createFormulaCellData(),
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
        1: { w: 235 },
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
    [PRACTICE_SHEET_ID]: {
      id: PRACTICE_SHEET_ID,
      name: 'Practice data',
      tabColor: '#0F766E',
      hidden: BooleanNumber.FALSE,
      rowCount: 200,
      columnCount: 15,
      zoomRatio: 1,
      scrollTop: 0,
      scrollLeft: 0,
      defaultColumnWidth: 116,
      defaultRowHeight: 29,
      mergeData: [0, 1].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 8 })),
      cellData: createPracticeCellData(),
      rowData: { 0: { h: 40 }, 1: { h: 30 }, 2: { h: 14 }, 3: { h: 32 } },
      columnData: { 0: { w: 188 }, 1: { w: 105 }, 2: { w: 110 }, 3: { w: 122 }, 8: { w: 112 } },
      freeze: { startRow: 4, startColumn: 1, ySplit: 4, xSplit: 1 },
      rowHeader: { width: 42, hidden: BooleanNumber.FALSE },
      columnHeader: { height: 22, hidden: BooleanNumber.FALSE },
      showGridlines: BooleanNumber.FALSE,
    },
  },
  resources: workbookResources,
} as unknown as Partial<IWorkbookData>

const documentBuilder = {
  dataStream: '',
  pageBreakIndexes: [] as number[],
  paragraphs: [] as IParagraph[],
  textRuns: [] as ITextRun[],
  sectionBreaks: [] as ISectionBreak[],
  tables: [] as ICustomTable[],
  tableSource: {} as Record<string, ITable>,
}

const bodyText: ITextStyle = { ff: 'Arial', fs: 11, cl: { rgb: '#334E68' } }
const mutedText: ITextStyle = { ...bodyText, fs: 9, cl: { rgb: '#627D98' } }
const headingText: ITextStyle = { ...bodyText, fs: 17, bl: BooleanNumber.TRUE, cl: { rgb: '#0E7490' } }
const headingStyle: IParagraphStyle = {
  namedStyleType: NamedStyleType.HEADING_1,
  spaceAbove: { v: 18 },
  spaceBelow: { v: 10 },
}

function appendDocumentParagraph(
  text: string,
  textStyle: ITextStyle = bodyText,
  paragraphStyle: IParagraphStyle = {},
  bullet?: IBullet,
) {
  const start = documentBuilder.dataStream.length
  documentBuilder.dataStream += `${text}\r`
  if (text.length) documentBuilder.textRuns.push({ st: start, ed: start + text.length, ts: textStyle })
  documentBuilder.paragraphs.push({
    startIndex: documentBuilder.dataStream.length - 1,
    paragraphId: `guide-paragraph-${documentBuilder.paragraphs.length}`,
    paragraphStyle: { spaceBelow: { v: 10 }, ...paragraphStyle },
    ...(bullet ? { bullet } : {}),
  })
}

function appendDocumentPageBreak() {
  documentBuilder.pageBreakIndexes.push(documentBuilder.dataStream.length)
  appendDocumentParagraph(DataStreamTreeTokenType.PAGE_BREAK, bodyText, { spaceBelow: { v: 0 } })
}

function appendDocumentTable(id: string, rows: string[][], widths: number[]) {
  const startIndex = documentBuilder.dataStream.length
  documentBuilder.dataStream += DataStreamTreeTokenType.TABLE_START
  rows.forEach((row, rowIndex) => {
    documentBuilder.dataStream += DataStreamTreeTokenType.TABLE_ROW_START
    row.forEach((cell) => {
      documentBuilder.dataStream += DataStreamTreeTokenType.TABLE_CELL_START
      appendDocumentParagraph(
        cell,
        {
          ...bodyText,
          fs: 10,
          bl: rowIndex === 0 ? BooleanNumber.TRUE : BooleanNumber.FALSE,
          cl: { rgb: rowIndex === 0 ? '#FFFFFF' : '#334E68' },
        },
        { spaceBelow: { v: 0 } },
      )
      documentBuilder.sectionBreaks.push({
        sectionId: `guide-section-${documentBuilder.sectionBreaks.length}`,
        startIndex: documentBuilder.dataStream.length,
      })
      documentBuilder.dataStream += DataStreamTreeTokenType.SECTION_BREAK + DataStreamTreeTokenType.TABLE_CELL_END
    })
    documentBuilder.dataStream += DataStreamTreeTokenType.TABLE_ROW_END
  })
  documentBuilder.dataStream += DataStreamTreeTokenType.TABLE_END
  documentBuilder.tables.push({ startIndex, endIndex: documentBuilder.dataStream.length, tableId: id })
  const border = { color: { rgb: '#CBD5E1' }, width: { v: 1 }, dashStyle: DashStyleType.SOLID }
  documentBuilder.tableSource[id] = {
    tableId: id,
    tableRows: rows.map((row, rowIndex) => ({
      tableCells: row.map(() => ({
        margin: { start: { v: 10 }, end: { v: 10 }, top: { v: 8 }, bottom: { v: 8 } },
        borderTop: border,
        borderBottom: border,
        borderLeft: border,
        borderRight: border,
        backgroundColor: { rgb: rowIndex === 0 ? '#123B50' : rowIndex % 2 ? '#F0F9FA' : '#FFFFFF' },
        vAlign: VerticalAlignmentType.CENTER,
      })),
      trHeight: { val: { v: 38 }, hRule: TableRowHeightRule.AT_LEAST },
      repeatHeaderRow: rowIndex === 0 ? BooleanNumber.TRUE : BooleanNumber.FALSE,
    })),
    tableColumns: widths.map((width) => ({ size: { type: TableSizeType.SPECIFIED, width: { v: width } } })),
    align: TableAlignmentType.CENTER,
    indent: { v: 0 },
    textWrap: TableTextWrapType.NONE,
    position: {
      positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
      positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 0 },
    },
    dist: { distB: 0, distL: 0, distR: 0, distT: 0 },
    size: { type: TableSizeType.SPECIFIED, width: { v: widths.reduce((sum, width) => sum + width, 0) } },
  }
  appendDocumentParagraph('')
}

appendDocumentParagraph('UNIVER DOCS  /  THE EDITABLE FIELD GUIDE', {
  ...mutedText,
  bl: BooleanNumber.TRUE,
  cl: { rgb: '#0E7490' },
})
appendDocumentParagraph(
  'Make room for your words.',
  { ...bodyText, fs: 28, bl: BooleanNumber.TRUE, cl: { rgb: '#102A43' } },
  { namedStyleType: NamedStyleType.TITLE, spaceBelow: { v: 14 } },
)
appendDocumentParagraph(
  'A document about documents. Every paragraph, list, and table below is yours to edit.',
  { ...bodyText, fs: 13, it: BooleanNumber.TRUE },
  { spaceBelow: { v: 20 } },
)
appendDocumentParagraph('01  More than a text box', headingText, headingStyle)
appendDocumentParagraph(
  'I’m Univer Docs. I bring rich text, structured content, and page layout into your application. This guide introduces those features by using them: headings give it a hierarchy, tables organize the details, and lists turn an outline into a plan.',
)
appendDocumentParagraph(
  'The building blocks',
  { ...bodyText, fs: 13, bl: BooleanNumber.TRUE },
  { namedStyleType: NamedStyleType.HEADING_2 },
)
appendDocumentTable(
  'docs-building-blocks',
  [
    ['Feature', 'What you see', 'Try it'],
    ['Rich text', 'Font, emphasis, color, spacing', 'Select a phrase and restyle it'],
    ['Real tables', 'Rows, columns, cell backgrounds', 'Edit a cell; insert another row'],
    ['Structured lists', 'Numbering and nested levels', 'Press Enter to continue a list'],
    ['Page layout', 'Margins, headers, page breaks', 'Switch to Traditional above'],
  ],
  [126, 232, 240],
)
appendDocumentParagraph(
  'A good document lets the structure do the work.',
  { ...bodyText, fs: 14, it: BooleanNumber.TRUE, cl: { rgb: '#0E7490' } },
  {
    indentStart: { v: 18 },
    spaceAbove: { v: 14 },
    spaceBelow: { v: 16 },
    borderLeft: { color: { rgb: '#06B6D4' }, width: 3, padding: 10, dashStyle: DashStyleType.SOLID },
  },
)
appendDocumentParagraph(
  'MODERN: a continuous canvas for writing.  /  TRADITIONAL: pages ready for a reading layout.',
  mutedText,
)

appendDocumentPageBreak()
appendDocumentParagraph('02  An outline you can work with', headingText, headingStyle)
appendDocumentParagraph(
  'These are native lists. Their markers and indentation belong to the document structure, so adding or moving an item keeps the sequence intact.',
)
for (const [text, nestingLevel] of [
  ['Start with a clear idea', 0],
  ['Write a title that gives the reader context', 1],
  ['Use a short lead to introduce the main point', 1],
  ['Make the evidence easy to scan', 0],
  ['Compare details in a table', 1],
  ['Use a heading for each new idea', 1],
  ['Review the document in both layouts', 0],
] as const) {
  appendDocumentParagraph(
    text,
    bodyText,
    { spaceBelow: { v: 6 } },
    { listId: 'docs-writing-outline', listType: PresetListType.ORDER_LIST, nestingLevel },
  )
}
appendDocumentParagraph(
  'Typography carries meaning',
  { ...headingText, fs: 14 },
  { ...headingStyle, namedStyleType: NamedStyleType.HEADING_2 },
)
const emphasisStart = documentBuilder.dataStream.length
const emphasisParts: Array<[string, ITextStyle]> = [
  ['Give the key idea ', bodyText],
  ['bold emphasis', { ...bodyText, bl: BooleanNumber.TRUE, cl: { rgb: '#0E7490' } }],
  [', add an ', bodyText],
  ['italic aside', { ...bodyText, it: BooleanNumber.TRUE }],
  [', or ', bodyText],
  ['highlight a detail', { ...bodyText, bg: { rgb: '#FEF08A' }, ul: { s: BooleanNumber.TRUE } }],
  ['. The styles in this sentence are separate editable text runs.', bodyText],
]
appendDocumentParagraph(emphasisParts.map(([text]) => text).join(''))
documentBuilder.textRuns.pop()
let emphasisOffset = emphasisStart
for (const [text, ts] of emphasisParts) {
  documentBuilder.textRuns.push({ st: emphasisOffset, ed: emphasisOffset + text.length, ts })
  emphasisOffset += text.length
}
appendDocumentParagraph(
  'Before you share',
  { ...headingText, fs: 14 },
  { ...headingStyle, namedStyleType: NamedStyleType.HEADING_2 },
)
for (const [text, listType] of [
  ['Give the document a descriptive title', PresetListType.CHECK_LIST_CHECKED],
  ['Check that each heading introduces a clear section', PresetListType.CHECK_LIST_CHECKED],
  ['Replace this checklist with your team’s review steps', PresetListType.CHECK_LIST],
  ['Switch to Traditional and inspect the page layout', PresetListType.CHECK_LIST],
] as const) {
  appendDocumentParagraph(
    text,
    bodyText,
    { spaceBelow: { v: 7 } },
    { listId: 'docs-review', listType, nestingLevel: 0 },
  )
}

appendDocumentPageBreak()
appendDocumentParagraph('03  One document, two reading modes', headingText, headingStyle)
appendDocumentParagraph(
  'The same content can be a living workspace or a document with deliberate pages. Choose the layout that fits the way people will read and write.',
)
appendDocumentTable(
  'docs-layout-comparison',
  [
    ['Use case', 'Modern', 'Traditional'],
    ['Working notes', 'Continuous writing surface', 'A deliberate page structure'],
    ['Long reports', 'Scroll through one flowing story', 'Divide sections with page breaks'],
    ['Navigation', 'Named headings and lists', 'Headings plus running page furniture'],
    ['Formatting', 'Rich text, tables, spacing', 'The same content with margins'],
    ['This guide', 'Page breaks removed for flow', 'Three chapters on separate pages'],
  ],
  [126, 232, 240],
)
appendDocumentParagraph(
  'A workspace inside your product',
  { ...headingText, fs: 14 },
  { ...headingStyle, namedStyleType: NamedStyleType.HEADING_2 },
)
for (const text of [
  'Knowledge base: explain a feature with headings, examples, and reference tables.',
  'Team notes: turn an outline into a draft and keep the action checklist alongside it.',
  'Reports: combine narrative and structured comparisons in one editable document.',
]) {
  appendDocumentParagraph(
    text,
    bodyText,
    {},
    { listId: 'docs-use-cases', listType: PresetListType.BULLET_LIST, nestingLevel: 0 },
  )
}
appendDocumentParagraph(
  'Your turn: add a fourth chapter.',
  { ...bodyText, fs: 17, bl: BooleanNumber.TRUE, cl: { rgb: '#0E7490' } },
  { spaceAbove: { v: 20 } },
)
appendDocumentParagraph(
  'Place the cursor here and keep writing. This is a document editor, and the story is now yours.',
  bodyText,
)
documentBuilder.sectionBreaks.push({
  sectionId: `guide-section-${documentBuilder.sectionBreaks.length}`,
  startIndex: documentBuilder.dataStream.length,
})
documentBuilder.dataStream += DataStreamTreeTokenType.SECTION_BREAK

function createSegmentBody(text: string, horizontalAlign: HorizontalAlign) {
  return {
    dataStream: `${text}\r\n`,
    textRuns: [{ st: 0, ed: text.length, ts: { ...mutedText, fs: 8 } }],
    paragraphs: [
      { paragraphId: 'guide-segment-paragraph', startIndex: text.length, paragraphStyle: { horizontalAlign } },
    ],
    sectionBreaks: [{ sectionId: 'guide-segment-section', startIndex: text.length + 1 }],
  }
}

function createHomeDocumentData(documentFlavor: DocumentFlavor, id: string, title: string): Partial<IDocumentData> {
  const isModern = documentFlavor === DocumentFlavor.MODERN
  const body = structuredClone({
    dataStream: documentBuilder.dataStream,
    textRuns: documentBuilder.textRuns,
    paragraphs: documentBuilder.paragraphs,
    sectionBreaks: documentBuilder.sectionBreaks,
    tables: documentBuilder.tables,
  })
  if (isModern) {
    const remap = (index: number) =>
      index - documentBuilder.pageBreakIndexes.filter((pageBreak) => pageBreak < index).length
    body.dataStream = body.dataStream.split(DataStreamTreeTokenType.PAGE_BREAK).join('')
    for (const paragraph of body.paragraphs) paragraph.startIndex = remap(paragraph.startIndex)
    for (const section of body.sectionBreaks) section.startIndex = remap(section.startIndex)
    for (const run of body.textRuns) {
      run.st = remap(run.st)
      run.ed = remap(run.ed)
    }
    for (const table of body.tables) {
      table.startIndex = remap(table.startIndex)
      table.endIndex = remap(table.endIndex)
    }
  }
  return {
    id,
    title,
    locale: LocaleType.EN_US,
    body,
    documentStyle: {
      documentFlavor,
      pageSize: {
        width: isModern ? MODERN_DOCUMENT_WIDTH[ModernDocumentWidthMode.MEDIUM] : 793.3333333333334,
        height: isModern ? 960 : 1122.6666666666667,
      },
      marginTop: 64,
      marginBottom: 64,
      marginRight: 74,
      marginLeft: 74,
      marginHeader: 30,
      marginFooter: 30,
      defaultHeaderId: isModern ? '' : 'docs-header',
      defaultFooterId: isModern ? '' : 'docs-footer',
    },
    tableSource: structuredClone(documentBuilder.tableSource),
    lists: structuredClone(PRESET_LIST_TYPE),
    headers: isModern
      ? {}
      : {
          'docs-header': {
            headerId: 'docs-header',
            body: createSegmentBody('UNIVER DOCS  /  WRITE · STRUCTURE · CREATE', HorizontalAlign.LEFT),
          },
        },
    footers: isModern
      ? {}
      : {
          'docs-footer': {
            footerId: 'docs-footer',
            body: createSegmentBody('UNIVER DOCS  ·  AN EDITABLE FIELD GUIDE', HorizontalAlign.RIGHT),
          },
        },
    settings: { zoomRatio: 1 },
  }
}

export const modernDocumentData = createHomeDocumentData(
  DocumentFlavor.MODERN,
  'univer-docs-guide-modern',
  'Univer Docs · Field guide · Modern',
)
export const traditionalDocumentData = createHomeDocumentData(
  DocumentFlavor.TRADITIONAL,
  'univer-docs-guide-traditional',
  'Univer Docs · Field guide · Traditional',
)
