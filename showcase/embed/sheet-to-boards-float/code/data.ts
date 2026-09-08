import type { IBoardData } from '@univerjs-pro/boards'
import type { IWorkbookData } from '@univerjs/core'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import { BooleanNumber, HorizontalAlign, LocaleType, VerticalAlign } from '@univerjs/core'

export const HOST_ID = 'willow-capacity-map'
export const CHILD_ID = 'willow-studio-capacity'
export const PAGE_ID = 'planning'
export const SHEET_ID = 'capacity'
export const SOURCE_NAME = 'Willow Capacity'
const source = "'[Willow Capacity]Capacity plan'!"
const available = 'SUM(' + source + 'B5:B7)'
const planned = 'SUM(' + source + 'C5:C7)'
export const FORMULA_CARDS = [
  { id: 'available', formula: '=' + available, format: '#,##0" h"' },
  { id: 'planned', formula: '=' + planned, format: '#,##0" h"' },
  { id: 'remaining', formula: '=' + available + '-' + planned, format: '#,##0" h"' },
  { id: 'utilization', formula: '=' + planned + '/' + available, format: '0.00%' },
  { id: 'editorial-free', formula: '=' + source + 'B5-' + source + 'C5', format: '#,##0" h"' },
  { id: 'production-free', formula: '=' + source + 'B6-' + source + 'C6', format: '#,##0" h"' },
  { id: 'access-free', formula: '=' + source + 'B7-' + source + 'C7', format: '#,##0" h"' },
  {
    id: 'capacity-signal',
    formula: '=IF(' + available + '-' + planned + '<0,"Rebalance scope","Within capacity")',
    format: 'General',
  },
] as const

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

function formulaCard(
  id: (typeof FORMULA_CARDS)[number]['id'],
  left: number,
  top: number,
  width: number,
  height: number,
  size: number,
  color: string,
) {
  const shape = card(id, '', left, top, width, height, size, color)
  const spec = FORMULA_CARDS.find((item) => item.id === id)!
  shape.shapeData = {
    ...createFormulaShapeData({
      numberFormatPattern: spec.format,
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
    ['available', 'AVAILABLE / PEOPLE HOURS', '#E2EDF5', '#234B6A'],
    ['planned', 'PLANNED / WORK HOURS', '#EBE5F2', '#654878'],
    ['remaining', 'UNALLOCATED / NOT A PROMISE', '#F8EDCF', '#82642C'],
    ['utilization', 'UTILIZATION / PLANNED ÷ AVAILABLE', '#DDEDE7', '#285C50'],
  ] as const
  const teams = [
    ['editorial', '01 / EDITORIAL', 'Research, edit and prepare the story.', '#E2EDF5', '#234B6A'],
    ['production', '02 / PRODUCTION', 'Build, test and assemble the display.', '#EBE5F2', '#654878'],
    ['access', '03 / ACCESS', 'Review transcripts and visitor guidance.', '#F8EDCF', '#82642C'],
  ] as const
  const shapes = [
    card('title-band', '', 70, 40, 1480, 120, 12, '#172C43', '#172C43'),
    card('title', 'WILLOW / MAKE CAPACITY VISIBLE', 100, 52, 1420, 62, 30, '#F4F7F9', undefined, true),
    card(
      'subtitle',
      'A fictional exhibition studio / One planning week / 22 May 2029',
      103,
      117,
      1400,
      32,
      15,
      '#A9CBD8',
    ),
    ...panels.flatMap(([id, label, fill, ink], i) => [
      card(id + '-panel', '', 80 + i * 375, 188, 350, 122, 12, ink, fill),
      card(id + '-label', label, 99 + i * 375, 199, 320, 28, 12, ink, undefined, true),
      formulaCard(id, 99 + i * 375, 233, 310, 58, 38, ink),
    ]),
    card(
      'source-caption',
      'SOURCE / Double-click the Sheet; expand for native editing',
      85,
      328,
      845,
      35,
      15,
      '#36536A',
      undefined,
      true,
    ),
    card(
      'team-caption',
      'FOLLOW THE SAME SOURCE / Remaining hours by team',
      1010,
      328,
      510,
      35,
      14,
      '#36536A',
      undefined,
      true,
    ),
    ...teams.flatMap(([id, label, detail, fill, ink], i) => [
      card(id + '-panel', '', 1010, 386 + i * 160, 500, 136, 12, ink, fill),
      card(id + '-label', label, 1032, 394 + i * 160, 450, 27, 15, ink, undefined, true),
      formulaCard(
        (id + '-free') as 'editorial-free' | 'production-free' | 'access-free',
        1032,
        430 + i * 160,
        170,
        52,
        32,
        ink,
      ),
      card(id + '-detail', detail, 1210, 429 + i * 160, 265, 72, 16, ink),
    ]),
    card('signal-label', 'MODEL SIGNAL', 86, 883, 175, 30, 14, '#36536A', undefined, true),
    formulaCard('capacity-signal', 270, 875, 400, 42, 24, '#36536A'),
    card(
      'decision-note',
      'Review overload within each team, even when the total has room.',
      700,
      883,
      810,
      38,
      16,
      '#755B3A',
    ),
    card(
      'footer',
      'The formula does not allocate people or approve overtime. Move cards and discuss the scope; local edits are not saved after reload.',
      85,
      948,
      1430,
      44,
      14,
      '#65788A',
    ),
  ]
  const connectors = ['editorial', 'production', 'access'].map((id, i) =>
    createBoardConnectorElement({
      id: 'source-to-' + id,
      start: { kind: 'shapeSite', shapeId: 'source-caption', connectionSiteId: 1 },
      end: { kind: 'shapeSite', shapeId: id + '-panel', connectionSiteId: 3 },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: ['#7096B0', '#A88AB9', '#C5A158'][i], strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const elements = [...connectors, ...shapes]
  return {
    id: HOST_ID,
    name: 'Willow / Capacity map',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1620, height: 1040 },
    pageOrder: [PAGE_ID],
    activePageId: PAGE_ID,
    pages: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Capacity discussion',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
        elementOrder: elements.map((e) => e.id),
      },
    },
  }
}

export function createChildData(): Partial<IWorkbookData> {
  const cells: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'WILLOW / Capacity plan', s: 'title' } },
    1: { 0: { v: 'Hours per planning week / Original fictional model', s: 'muted' } },
    3: Object.fromEntries(
      ['Team', 'Available', 'Planned', 'Remaining', 'Planning note'].map((v, i) => [i, { v, s: 'header' }]),
    ),
    9: {
      0: { v: 'Studio total', s: 'header' },
      1: { f: '=SUM(B5:B7)', s: 'total' },
      2: { f: '=SUM(C5:C7)', s: 'total' },
      3: { f: '=B10-C10', s: 'total' },
    },
    10: { 0: { v: 'Utilization', s: 'header' }, 3: { f: '=C10/B10', s: 'percent' } },
    12: { 0: { v: 'A positive total can hide a team overload. Compare the three branch cards.', s: 'muted' } },
    14: { 0: { v: 'Amber cells are inputs; the Board reads their live external references.', s: 'muted' } },
  }
  const rows = [
    ['Editorial', 128, 92, 'Research and story'],
    ['Production', 112, 104, 'Build and installation'],
    ['Access', 80, 80, 'Transcripts and guidance'],
  ] as const
  rows.forEach(([name, availableHours, plannedHours, note], i) => {
    cells[i + 4] = {
      0: { v: name, s: i % 2 ? 'stripe' : 'body' },
      1: { v: availableHours, s: 'input' },
      2: { v: plannedHours, s: 'input' },
      3: { f: '=B' + (i + 5) + '-C' + (i + 5), s: 'hours' },
      4: { v: note, s: 'muted' },
    }
  })
  return {
    id: CHILD_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 22, bl: 1, cl: { rgb: '#234B6A' } },
      muted: { fs: 11, cl: { rgb: '#637A8C' } },
      header: { bg: { rgb: '#E2EDF5' }, bl: 1, cl: { rgb: '#234B6A' } },
      body: { cl: { rgb: '#354E61' } },
      stripe: { bg: { rgb: '#F0F4F8' } },
      input: { bg: { rgb: '#FFF0D6' }, n: { pattern: '#,##0' }, cl: { rgb: '#775C2C' } },
      hours: { n: { pattern: '#,##0' }, cl: { rgb: '#354E61' } },
      total: { bg: { rgb: '#DDEDE7' }, n: { pattern: '#,##0' }, bl: 1, cl: { rgb: '#285C50' } },
      percent: { n: { pattern: '0.00%' }, bl: 1, cl: { rgb: '#285C50' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Capacity plan',
        rowCount: 18,
        columnCount: 6,
        defaultRowHeight: 29,
        defaultColumnWidth: 100,
        columnData: { 0: { w: 160 }, 1: { w: 110 }, 2: { w: 110 }, 3: { w: 110 }, 4: { w: 270 } },
        rowData: { 0: { h: 40 } },
        cellData: cells,
        mergeData: [0, 1, 12, 14].map((row) => ({ startRow: row, endRow: row, startColumn: 0, endColumn: 4 })),
      },
    },
  }
}
