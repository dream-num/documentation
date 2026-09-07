import type { IBoardData } from '@univerjs-pro/boards'
import type { IBaseSnapshot, IWorkbookData } from '@univerjs/core'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import {
  BASE_RECORD_ID_FIELD_ID,
  BaseFieldType,
  BaseViewType,
  BooleanNumber,
  createBaseRecordIdField,
  HorizontalAlign,
  LocaleType,
  VerticalAlign,
} from '@univerjs/core'

export const HOST_ID = 'grove-exhibition-readiness'
export const SHEET_UNIT_ID = 'grove-budget-plan'
export const BASE_ID = 'grove-readiness-register'
export const PAGE_ID = 'readiness'
export const SHEET_ID = 'budget'
export const SHEET_NAME = 'GroveBudget'
export const BASE_NAME = 'GroveReadiness'
const sheet = "'[GroveBudget]Budget'!"
const gates = '[GroveReadiness]!Gates'
const budget = 'SUM(' + sheet + 'B5:B7)'
const cost = 'SUM(' + gates + '[Cost])'
const ready = 'COUNTIF(' + gates + '[Status],"Ready")'
const count = 'ROWS(' + gates + '[Gate])'
const blocked = 'COUNTIF(' + gates + '[Status],"Blocked")'
export const ZONES = [
  ['build', 'Build', 6000, '#E2EAF4', '#345677'],
  ['programme', 'Programme', 7000, '#ECE4F3', '#6C527E'],
  ['care', 'Care', 5000, '#E0EEE7', '#326252'],
] as const
export const FORMULA_CARDS = [
  { id: 'budget', formula: '=' + budget, format: '$#,##0' },
  { id: 'cost', formula: '=' + cost, format: '$#,##0' },
  { id: 'balance', formula: '=' + budget + '-' + cost, format: '$#,##0;($#,##0)' },
  { id: 'ready-share', formula: '=' + ready + '/' + count, format: '0.0%' },
  { id: 'ready-count', formula: '=' + ready, format: '0" ready"' },
  { id: 'gate-count', formula: '=' + count, format: '0" gates"' },
  { id: 'blocked-count', formula: '=' + blocked, format: '0" blocked"' },
  { id: 'threshold', formula: '=' + sheet + 'E5', format: '0%" ceiling"' },
  { id: 'headroom', formula: '=' + budget + '*' + sheet + 'E5-' + cost, format: '$#,##0;($#,##0)' },
  {
    id: 'signal',
    formula:
      '=IF(' +
      blocked +
      '>0,"Resolve blockers",IF(' +
      cost +
      '>' +
      budget +
      '*' +
      sheet +
      'E5,"Review spending","Continue gate review"))',
    format: 'General',
  },
  ...ZONES.flatMap(([id, name], i) => [
    {
      id: id + '-balance',
      formula: '=' + sheet + 'B' + (i + 5) + '-SUMIF(' + gates + '[Zone],"' + name + '",' + gates + '[Cost])',
      format: '$#,##0;($#,##0)',
    },
    {
      id: id + '-share',
      formula:
        '=COUNTIFS(' +
        gates +
        '[Zone],"' +
        name +
        '",' +
        gates +
        '[Status],"Ready")/COUNTIF(' +
        gates +
        '[Zone],"' +
        name +
        '")',
      format: '0%" ready"',
    },
  ]),
]
export const GATES = [
  ['Display frame', 'Build', 'Ready', 3200, 'Rhea', 'Load test signed off.'],
  ['Lighting rig', 'Build', 'Ready', 2800, 'Omar', 'Focus positions marked.'],
  ['Listening room', 'Programme', 'Ready', 3600, 'Zoe', 'Sound sequence reviewed.'],
  ['Workshop rehearsal', 'Programme', 'In progress', 2100, 'Eli', 'Run the final rehearsal.'],
  ['Quiet-route guide', 'Care', 'Ready', 1700, 'Sana', 'Plain-language route approved.'],
  ['Access walkthrough', 'Care', 'Blocked', 1200, 'Jules', 'Await revised ramp detail.'],
] as const
const TIME = Date.parse('2029-09-12T09:00:00Z')

function card(
  id: string,
  text: string,
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  color: string,
  fill?: string,
  bold = false,
) {
  const shape = createBoardTextBoxShapeElement({
    id,
    text,
    left,
    top,
    width,
    height,
    horizontalAlign: HorizontalAlign.LEFT,
    verticalAlign: VerticalAlign.MIDDLE,
    textWrap: ShapeTextWrapType.Square,
    textStyle: { ff: 'Arial', fs: size, bl: bold ? BooleanNumber.TRUE : BooleanNumber.FALSE, cl: { rgb: color } },
  })
  shape.shapeData.shapeType = ShapeTypeEnum.Rect
  shape.shapeData.fill = fill ? { fillType: ShapeFillEnum.SolidFill, color: fill } : { fillType: ShapeFillEnum.NoFill }
  shape.shapeData.stroke = { color: 'transparent', width: 0 }
  if (!text) {
    delete shape.shapeData.shapeText
    shape.shapeData.isTextBox = false
  }
  return shape
}
function formula(id: string, left: number, top: number, width: number, height: number, size: number, color: string) {
  const shape = card(id, '', left, top, width, height, size, color)
  shape.shapeData = {
    ...createFormulaShapeData({
      numberFormatPattern: FORMULA_CARDS.find((s) => s.id === id)!.format,
      fill: { fillType: ShapeFillEnum.NoFill },
      stroke: { color: 'transparent', width: 0 },
      textStyle: { ff: 'Arial', fs: size, bl: 1, cl: { rgb: color } },
    }),
    shapeType: ShapeTypeEnum.Rect,
  }
  return shape
}
export function createHostData(): IBoardData {
  const panels = [
    ['budget', '01 / BUDGET · SHEET', '#E2EAF4', '#345677'],
    ['cost', '02 / PLANNED COST · BASE', '#ECE4F3', '#6C527E'],
    ['balance', '03 / REMAINING · BOTH SOURCES', '#F6E8CB', '#805D2C'],
    ['ready-share', '04 / READINESS · GATE COUNT', '#E0EEE7', '#326252'],
  ] as const
  const shapes = [
    card('title-band', '', 65, 35, 1585, 122, 12, '#192F45', '#192F45'),
    card('title', 'GROVE / READY IS MORE THAN FUNDED', 96, 49, 1500, 60, 32, '#FFF9EB', undefined, true),
    card(
      'subtitle',
      'An original fictional exhibition / Budget + readiness review / 12 September 2029',
      99,
      114,
      1480,
      30,
      15,
      '#AFCAD7',
    ),
    ...panels.flatMap(([id, label, fill, ink], i) => [
      card(id + '-panel', '', 80 + i * 395, 184, 370, 123, 12, ink, fill),
      card(id + '-label', label, 98 + i * 395, 195, 339, 28, 12, ink, undefined, true),
      formula(id, 98 + i * 395, 233, 334, 60, 38, ink),
    ]),
    formula('ready-count', 86, 334, 165, 38, 24, '#326252'),
    formula('gate-count', 258, 334, 165, 38, 24, '#345677'),
    formula('blocked-count', 430, 334, 180, 38, 24, '#975640'),
    card('source-summary', 'FOLLOW BOTH SOURCES', 650, 329, 315, 48, 15, '#345677', '#EDF1F5', true),
    formula('threshold', 1000, 334, 240, 38, 23, '#6C527E'),
    card('headroom-label', 'TO CEILING', 1252, 329, 160, 25, 12, '#805D2C', undefined, true),
    formula('headroom', 1430, 329, 200, 46, 28, '#805D2C'),
    ...ZONES.flatMap(([id, name, , fill, ink], i) => [
      card(id + '-panel', '', 80 + i * 535, 436, 510, 127, 12, ink, fill),
      card(
        id + '-label',
        name.toUpperCase() + ' / REMAINING + READINESS',
        100 + i * 535,
        446,
        465,
        26,
        13,
        ink,
        undefined,
        true,
      ),
      formula(id + '-balance', 100 + i * 535, 486, 240, 52, 32, ink),
      formula(id + '-share', 355 + i * 535, 487, 210, 50, 25, ink),
    ]),
    card(
      'sheet-label',
      'INPUT A / Budget envelopes + independent spend ceiling',
      85,
      577,
      710,
      30,
      15,
      '#345677',
      undefined,
      true,
    ),
    card(
      'base-label',
      'INPUT B / Six gates · costs, status and responsibility',
      825,
      577,
      815,
      30,
      15,
      '#6C527E',
      undefined,
      true,
    ),
    card('signal-label', 'NEXT CONVERSATION', 86, 1020, 240, 30, 13, '#345677', undefined, true),
    formula('signal', 340, 1013, 500, 46, 26, '#975640'),
    card(
      'decision-note',
      'Total headroom can hide a local overrun. Ready does not mean cost-free.',
      850,
      1015,
      790,
      46,
      16,
      '#536B75',
    ),
    card(
      'footer',
      'Whole-table formulas include filtered-out records. Native local edits only: no publishing, approvals or saved reload state.',
      86,
      1084,
      1525,
      36,
      14,
      '#6D7B88',
    ),
  ]
  const connectors = ZONES.map(([id, , , , ink]) =>
    createBoardConnectorElement({
      id: 'sources-to-' + id,
      start: { kind: 'shapeSite', shapeId: 'source-summary', connectionSiteId: 2 },
      end: { kind: 'shapeSite', shapeId: id + '-panel', connectionSiteId: 0 },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: ink, strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const elements = [...connectors, ...shapes]
  return {
    id: HOST_ID,
    name: 'Grove / Exhibition readiness',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1720, height: 1160 },
    pageOrder: [PAGE_ID],
    activePageId: PAGE_ID,
    pages: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Budget meets readiness',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
        elementOrder: elements.map((e) => e.id),
      },
    },
  }
}

export function createSheetData(): Partial<IWorkbookData> {
  const cells: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'GROVE / Budget envelopes', s: 'title' } },
    1: { 0: { v: 'Fictional USD planning amounts / Not an approval', s: 'muted' } },
    3: Object.fromEntries(['Zone', 'Budget', 'Scope', '', 'Spend ceiling'].map((v, i) => [i, { v, s: 'header' }])),
    8: { 0: { v: 'Total', s: 'header' }, 1: { f: '=SUM(B5:B7)', s: 'total' } },
    10: { 0: { v: 'Amber = envelopes · Lilac = independent ceiling', s: 'muted' } },
    12: { 0: { v: 'Costs and gate statuses live in the separate Base.', s: 'muted' } },
  }
  ZONES.forEach(([, name, amount], i) => {
    cells[i + 4] = {
      0: { v: name, s: 'body' },
      1: { v: amount, s: 'input' },
      2: { v: ['Build the space', 'Host the programme', 'Care for visitors'][i], s: 'body' },
    }
  })
  cells[4][4] = { v: 0.85, s: 'target' }
  return {
    id: SHEET_UNIT_ID,
    name: SHEET_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 21, bl: 1, cl: { rgb: '#345677' } },
      muted: { fs: 11, cl: { rgb: '#637687' } },
      header: { bg: { rgb: '#E2EAF4' }, bl: 1, cl: { rgb: '#345677' } },
      body: { cl: { rgb: '#3C5368' } },
      input: { bg: { rgb: '#FFF0D6' }, cl: { rgb: '#805D2C' }, n: { pattern: '$#,##0' } },
      target: { bg: { rgb: '#ECE4F3' }, cl: { rgb: '#6C527E' }, n: { pattern: '0%' } },
      total: { bg: { rgb: '#E0EEE7' }, cl: { rgb: '#326252' }, bl: 1, n: { pattern: '$#,##0' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Budget',
        rowCount: 15,
        columnCount: 6,
        defaultRowHeight: 27,
        defaultColumnWidth: 100,
        columnData: { 0: { w: 130 }, 1: { w: 110 }, 2: { w: 190 }, 3: { w: 18 }, 4: { w: 130 } },
        rowData: { 0: { h: 38 } },
        cellData: cells,
        mergeData: [0, 1, 10, 12].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
    },
  }
}

export function createBaseData(): IBaseSnapshot {
  const fields = [
    createBaseRecordIdField(),
    { id: 'title', name: 'Gate', type: BaseFieldType.Text, config: {} },
    { id: 'zone', name: 'Zone', type: BaseFieldType.Text, config: {} },
    {
      id: 'status',
      name: 'Status',
      type: BaseFieldType.SingleSelect,
      config: {
        options: [
          { id: 'Ready', name: 'Ready', color: '#719884' },
          { id: 'In progress', name: 'In progress', color: '#A88AB9' },
          { id: 'Blocked', name: 'Blocked', color: '#BD7A5D' },
        ],
      },
    },
    { id: 'cost', name: 'Cost', type: BaseFieldType.Number, config: {} },
    { id: 'owner', name: 'Owner', type: BaseFieldType.Text, config: {} },
    { id: 'note', name: 'Next step', type: BaseFieldType.Text, config: {} },
  ]
  const fieldOrder = fields.map((f) => f.id)
  const records = Object.fromEntries(
    GATES.map(([title, zone, status, gateCost, owner, note], i) => {
      const id = 'gate-' + (i + 1)
      return [
        id,
        {
          id,
          orderKey: String(i).padStart(3, '0'),
          createdAt: TIME,
          updatedAt: TIME,
          values: { [BASE_RECORD_ID_FIELD_ID]: id, title, zone, status, cost: gateCost, owner, note },
        },
      ]
    }),
  )
  return {
    id: BASE_ID,
    name: BASE_NAME,
    locale: LocaleType.EN_US,
    schemaVersion: 2,
    createdAt: TIME,
    updatedAt: TIME,
    tableOrder: ['gates'],
    tables: {
      gates: {
        id: 'gates',
        name: 'Gates',
        formulaName: 'Gates',
        primaryFieldId: 'title',
        fields: Object.fromEntries(fields.map((f) => [f.id, f])),
        fieldOrder,
        records,
        recordOrder: Object.keys(records),
        viewOrder: ['gates-grid'],
        views: {
          'gates-grid': {
            id: 'gates-grid',
            tableId: 'gates',
            name: 'Readiness register',
            type: BaseViewType.Grid,
            fieldOrder,
            fieldSettings: Object.fromEntries(
              fieldOrder.map((id) => [
                id,
                {
                  hidden: id === BASE_RECORD_ID_FIELD_ID,
                  width: id === 'title' ? 200 : id === 'note' ? 290 : id === 'cost' ? 95 : 120,
                },
              ]),
            ),
            filter: null,
            sort: [],
            group: [],
            config: { rowHeight: 'medium', showRecordIndex: true, frozenFieldCount: 1 },
          },
        },
      },
    },
  }
}
