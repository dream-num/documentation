import type { IBoardData } from '@univerjs-pro/boards'
import type { IWorkbookData } from '@univerjs/core'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import { BooleanNumber, HorizontalAlign, LocaleType, VerticalAlign } from '@univerjs/core'
export const HOST_ID = 'juniper-workshop-model'
export const CHILD_ID = 'juniper-sensitivity-workshop'
export const SHEET_ID = 'assumptions'
export const PAGE_ID = 'scenarios'
export const SOURCE_NAME = 'Juniper Model'
const source = "'[Juniper Model]Assumptions'!"
const volume = source + 'B5',
  unit = source + 'B6',
  fixed = source + 'B7'
export const SCENARIOS = [
  ['Low volume', 11, 'Test the downside before adding commitments.'],
  ['Base case', 12, 'Keep the authored assumptions visible.'],
  ['High volume', 13, 'Higher volume does not reduce fixed cost.'],
] as const
export const FORMULA_CARDS = [
  { id: 'volume', formula: '=' + volume, format: '0.0" units"' },
  { id: 'unit', formula: '=' + unit, format: '$0.00" / unit"' },
  { id: 'fixed', formula: '=' + fixed, format: '$#,##0' },
  { id: 'breakeven', formula: '=' + fixed + '/' + unit, format: '0.0" units"' },
  ...SCENARIOS.flatMap(([, row], i) => {
    const qty = '(' + volume + '*' + source + 'B' + row + ')',
      gross = '(' + qty + '*' + unit + ')'
    return [
      { id: 'quantity-' + i, formula: '=' + qty, format: '0.0" units"' },
      { id: 'gross-' + i, formula: '=' + gross, format: '$#,##0;-$#,##0' },
      { id: 'net-' + i, formula: '=' + gross + '-' + fixed, format: '$#,##0;-$#,##0' },
    ]
  }),
  { id: 'spread', formula: '=' + volume + '*(' + source + 'B13-' + source + 'B11)*' + unit, format: '$#,##0;-$#,##0' },
  {
    id: 'signal',
    formula:
      '=IF(' +
      volume +
      '*' +
      source +
      'B12*' +
      unit +
      '>=' +
      fixed +
      ',"Base case covers fixed cost","Revisit contribution or scope")',
    format: 'General',
  },
]
function text(
  id: string,
  value: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  ink: string,
  fill?: string,
  bold = false,
) {
  const shape = createBoardTextBoxShapeElement({
    id,
    text: value,
    left,
    top,
    width,
    height,
    horizontalAlign: HorizontalAlign.LEFT,
    verticalAlign: VerticalAlign.MIDDLE,
    textWrap: ShapeTextWrapType.Square,
    textStyle: { ff: 'Arial', fs: size, bl: bold ? BooleanNumber.TRUE : BooleanNumber.FALSE, cl: { rgb: ink } },
  })
  shape.shapeData.shapeType = ShapeTypeEnum.Rect
  shape.shapeData.fill = fill ? { fillType: ShapeFillEnum.SolidFill, color: fill } : { fillType: ShapeFillEnum.NoFill }
  shape.shapeData.stroke = { color: 'transparent', width: 0 }
  if (!value) {
    delete shape.shapeData.shapeText
    shape.shapeData.isTextBox = false
  }
  return shape
}
function formula(id: string, x: number, y: number, width: number, size: number, ink: string) {
  const shape = text(id, '', x, y, width, 60, size, ink)
  shape.shapeData = {
    ...createFormulaShapeData({
      numberFormatPattern: FORMULA_CARDS.find((s) => s.id === id)!.format,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      textStyle: { ff: 'Arial', fs: size, bl: 1, cl: { rgb: ink } },
    }),
    shapeType: ShapeTypeEnum.Rect,
  }
  return shape
}
export function createChildData(): IBoardData {
  const colors = [
    ['#E6EAF5', '#53688F'],
    ['#E4EDDF', '#536E44'],
    ['#F6E6D4', '#9A6A3A'],
  ]
  const shapes = [
    text('header', '', 30, 24, 1200, 104, 12, '#412F46', '#412F46'),
    text('title', 'JUNIPER / WHAT CHANGES THE CONCLUSION?', 51, 32, 1155, 50, 30, '#F4E5B5', undefined, true),
    text(
      'subtitle',
      'Community making studio / Planning discussion / 29 September 2029 / Fictional USD model',
      54,
      87,
      1146,
      28,
      15,
      '#D6C4DB',
    ),
    ...[
      ['volume', 'REFERENCE VOLUME'],
      ['unit', 'UNIT CONTRIBUTION'],
      ['fixed', 'FIXED COST'],
      ['breakeven', 'BREAK-EVEN VOLUME'],
    ].flatMap(([id, label], i) => [
      text(id + '-panel', '', 30 + i * 305, 150, 285, 118, 12, '#412F46', '#F0EAF1'),
      text(id + '-label', label, 47 + i * 305, 161, 251, 25, 12, '#725E77', undefined, true),
      formula(id, 47 + i * 305, 202, 251, 29, '#412F46'),
    ]),
    text('source-node', 'SHARED INPUTS / THREE VOLUME SCENARIOS', 314, 293, 632, 46, 17, '#67562F', '#F4E5B5', true),
    ...SCENARIOS.flatMap(([name, , note], i) => {
      const x = 30 + i * 410,
        [fill, ink] = colors[i]
      return [
        text('scenario-' + i, '', x, 385, 380, 310, 12, ink, fill),
        text('scenario-title-' + i, name.toUpperCase(), x + 18, 395, 344, 39, 23, ink, undefined, true),
        text('quantity-label-' + i, 'SCENARIO VOLUME', x + 18, 444, 344, 23, 12, ink, undefined, true),
        formula('quantity-' + i, x + 18, 469, 344, 27, ink),
        text('gross-label-' + i, 'CONTRIBUTION BEFORE FIXED COST', x + 18, 530, 344, 23, 11, ink, undefined, true),
        formula('gross-' + i, x + 18, 553, 344, 27, ink),
        text('net-label-' + i, 'AFTER FIXED COST', x + 18, 614, 344, 23, 12, ink, undefined, true),
        formula('net-' + i, x + 18, 637, 344, 30, ink),
        text('scenario-note-' + i, note, x + 5, 708, 370, 54, 13, ink),
      ]
    }),
    text('review-band', '', 30, 779, 1200, 110, 12, '#F4E5B5', '#412F46'),
    text('spread-label', 'HIGH MINUS LOW CONTRIBUTION', 48, 788, 446, 24, 12, '#D6C4DB', undefined, true),
    formula('spread', 48, 826, 446, 29, '#F4E5B5'),
    text(
      'signal-label',
      'DISCUSSION PROMPT / NOT A LAUNCH APPROVAL',
      535,
      788,
      670,
      24,
      12,
      '#D6C4DB',
      undefined,
      true,
    ),
    formula('signal', 535, 826, 670, 25, '#F4E5B5'),
    text(
      'footer',
      'Multipliers scale equivalent units without rounding. These are scenarios, not forecasts or probabilities. Editing notes never writes back to the model.',
      34,
      906,
      1190,
      45,
      13,
      '#766B71',
    ),
  ]
  const links = SCENARIOS.map((_, i) =>
    createBoardConnectorElement({
      id: 'scenario-link-' + i,
      start: { kind: 'shapeSite', shapeId: 'source-node', connectionSiteId: 2 },
      end: { kind: 'shapeSite', shapeId: 'scenario-' + i, connectionSiteId: 0 },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: colors[i][1], strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const elements = [...links, ...shapes]
  return {
    id: CHILD_ID,
    name: 'Juniper / Sensitivity workshop',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1260, height: 980 },
    pageOrder: [PAGE_ID],
    activePageId: PAGE_ID,
    pages: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Three volume scenarios',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((e) => e.id),
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
      },
    },
  }
}
export function createHostData(): Partial<IWorkbookData> {
  const cells: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'JUNIPER / One assumption, several consequences.', s: 'title' } },
    1: { 0: { v: 'Community making studio / Original fictional USD amounts / 29 September 2029', s: 'muted' } },
    3: {
      0: { v: 'Shared assumption', s: 'header' },
      1: { v: 'Input', s: 'header' },
      2: { v: 'Interpretation', s: 'header' },
    },
    4: {
      0: { v: 'Reference volume', s: 'label' },
      1: { v: 150, s: 'input' },
      2: { v: 'Equivalent units; no integer rounding.', s: 'muted' },
    },
    5: {
      0: { v: 'Contribution per unit', s: 'label' },
      1: { v: 18, s: 'moneyInput' },
      2: { v: 'After variable cost, before fixed cost.', s: 'muted' },
    },
    6: {
      0: { v: 'Fixed workshop cost', s: 'label' },
      1: { v: 1800, s: 'moneyInput' },
      2: { v: 'The same cost in all three scenarios.', s: 'muted' },
    },
    9: {
      0: { v: 'Volume scenario', s: 'header' },
      1: { v: 'Multiplier', s: 'header' },
      2: { v: 'Units', s: 'header' },
      3: { v: 'Contribution', s: 'header' },
      4: { v: 'After fixed cost', s: 'header' },
    },
    15: { 0: { v: 'Break-even volume', s: 'header' }, 1: { f: '=B7/B6', s: 'total' } },
    17: { 0: { v: 'TRY THE DEPENDENCY, NOT A MANUAL REFRESH', s: 'section' } },
    19: {
      0: { v: 'Change unit contribution from 18 to 20: base contribution moves from 2,700 to 3,000.', s: 'muted' },
    },
    20: {
      0: {
        v: 'Change fixed cost: all net results change, but gross contribution and volume stay unchanged.',
        s: 'muted',
      },
    },
    21: {
      0: { v: 'Change only the high-volume multiplier: only that scenario and the spread should move.', s: 'muted' },
    },
    23: {
      0: {
        v: 'Open Sensitivity workshop in the native SheetBar. Source cells and Board notes are independent.',
        s: 'muted',
      },
    },
    25: { 0: { v: 'Not a probability, forecast, staffing plan or automatic approval.', s: 'warning' } },
  }
  SCENARIOS.forEach(([name, row], i) => {
    cells[row - 1] = {
      0: { v: name, s: 'label' },
      1: { v: [0.8, 1, 1.2][i], s: 'rate' },
      2: { f: '=$B$5*B' + row, s: 'number' },
      3: { f: '=C' + row + '*$B$6', s: 'money' },
      4: { f: '=D' + row + '-$B$7', s: 'money' },
    }
  })
  return {
    id: HOST_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 24, bl: 1, bg: { rgb: '#412F46' }, cl: { rgb: '#F4E5B5' } },
      header: { bl: 1, bg: { rgb: '#F0EAF1' }, cl: { rgb: '#725E77' } },
      label: { cl: { rgb: '#4F5953' } },
      muted: { fs: 11, cl: { rgb: '#80767E' } },
      section: { fs: 13, bl: 1, cl: { rgb: '#725E77' } },
      warning: { cl: { rgb: '#9A6A3A' }, fs: 11 },
      input: { bg: { rgb: '#E4EDDF' }, cl: { rgb: '#536E44' }, n: { pattern: '0.0' } },
      moneyInput: { bg: { rgb: '#F6E6D4' }, cl: { rgb: '#9A6A3A' }, n: { pattern: '$#,##0.00' } },
      rate: { bg: { rgb: '#E6EAF5' }, cl: { rgb: '#53688F' }, n: { pattern: '0.0%' } },
      number: { n: { pattern: '0.0' } },
      money: { n: { pattern: '$#,##0;-$#,##0' } },
      total: { bg: { rgb: '#F4E5B5' }, bl: 1, n: { pattern: '0.0" units"' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Assumptions',
        rowCount: 50,
        columnCount: 15,
        defaultRowHeight: 30,
        defaultColumnWidth: 110,
        columnData: { 0: { w: 250 }, 1: { w: 145 }, 2: { w: 325 }, 3: { w: 170 }, 4: { w: 190 } },
        rowData: { 0: { h: 46 } },
        cellData: cells,
        mergeData: [0, 1, 17, 19, 20, 21, 23, 25].map((row) => ({
          startRow: row,
          endRow: row,
          startColumn: 0,
          endColumn: 4,
        })),
      },
    },
  }
}
