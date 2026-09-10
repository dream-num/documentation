import type { IBoardData } from '@univerjs-pro/boards'
import type { IWorkbookData } from '@univerjs/core'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeLineTypeEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { BooleanNumber, HorizontalAlign, LocaleType, VerticalAlign } from '@univerjs/core'

export const HOST_ID = 'tidal-berth-costs'
export const CHILD_ID = 'tidal-dock-handoff'
export const SHEET_ID = 'shift-estimate'

// Original training scenario, not a live port operations or approval system.
const NODES = [
  { id: 'manifest', text: 'Check manifest\nJo Patel / 07:00', left: 40, top: 110, color: '#DDEFF4' },
  { id: 'count', text: 'Counts\nmatch?', left: 300, top: 90, color: '#F9EDC9', decision: true },
  { id: 'handoff', text: 'Shift handover\nLeo Kim / 09:00', left: 580, top: 110, color: '#E6E2F5' },
  { id: 'recount', text: 'Recheck labels\nMaya Chen', left: 40, top: 300, color: '#F9EDC9' },
  { id: 'hold', text: 'Hold bay B\n1 crate pending', left: 300, top: 300, color: '#F9DDD4' },
  { id: 'complete', text: 'Record handoff\nClose shift note', left: 580, top: 300, color: '#DCEFE6' },
] as const
const EDGES = [
  ['manifest-count', 'manifest', 1, 'count', 3],
  ['count-handoff', 'count', 1, 'handoff', 3],
  ['count-hold', 'count', 2, 'hold', 0],
  ['hold-recount', 'hold', 3, 'recount', 1],
  ['recount-manifest', 'recount', 0, 'manifest', 2],
  ['handoff-complete', 'handoff', 2, 'complete', 0],
] as const

export function createChildData(): IBoardData {
  const shapes = NODES.map((node) => {
    const decision = 'decision' in node
    const shape = createBoardTextBoxShapeElement({
      id: node.id,
      text: node.text,
      left: node.left,
      top: node.top,
      width: 190,
      height: decision ? 120 : 80,
      horizontalAlign: HorizontalAlign.CENTER,
      verticalAlign: VerticalAlign.MIDDLE,
      textStyle: { fs: 13, bl: BooleanNumber.TRUE, cl: { rgb: '#254451' } },
      textWrap: ShapeTextWrapType.Square,
    })
    shape.shapeData.shapeType = decision ? ShapeTypeEnum.Diamond : ShapeTypeEnum.RoundRect
    shape.shapeData.fill = { fillType: ShapeFillEnum.SolidFill, color: node.color }
    shape.shapeData.stroke = { lineStrokeType: ShapeLineTypeEnum.SolidLine, color: '#75929B', width: 1.5 }
    return shape
  })
  const connectors = EDGES.map(([id, from, fromSide, to, toSide]) =>
    createBoardConnectorElement({
      id,
      start: { kind: 'shapeSite', shapeId: from, connectionSiteId: fromSide },
      end: { kind: 'shapeSite', shapeId: to, connectionSiteId: toSide },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: {
        stroke: id === 'count-hold' ? '#B86550' : '#658790',
        strokeWidth: 2,
        endMarker: { type: 'filledArrow' },
      },
    }),
  )
  const labels = [
    createBoardTextBoxShapeElement({
      id: 'title',
      text: 'TIDAL / Morning dock handoff',
      left: 40,
      top: 5,
      width: 730,
      height: 55,
      textStyle: { fs: 25, bl: BooleanNumber.TRUE, cl: { rgb: '#245C70' } },
      textWrap: ShapeTextWrapType.Square,
    }),
    createBoardTextBoxShapeElement({
      id: 'matched',
      text: 'MATCHED',
      left: 495,
      top: 105,
      width: 85,
      height: 35,
      textStyle: { fs: 11, cl: { rgb: '#39755E' } },
    }),
    createBoardTextBoxShapeElement({
      id: 'mismatch',
      text: 'DIFFERENCE',
      left: 408,
      top: 235,
      width: 145,
      height: 35,
      textStyle: { fs: 11, cl: { rgb: '#B86550' } },
    }),
    createBoardTextBoxShapeElement({
      id: 'note',
      text: 'HOLD POINT / 41 counted against 42 expected.\nA revised cost estimate does not resolve the missing crate.',
      left: 40,
      top: 440,
      width: 730,
      height: 75,
      textStyle: { fs: 15, cl: { rgb: '#7C5946' } },
      textWrap: ShapeTextWrapType.Square,
    }),
  ]
  const elements = [...connectors, ...shapes, ...labels]
  return {
    id: CHILD_ID,
    name: 'Tidal / Dock handoff',
    appVersion: '1.0.0-rc.0',
    defaultPageSize: { width: 850, height: 560 },
    pageOrder: ['handoff'],
    activePageId: 'handoff',
    pages: {
      handoff: {
        id: 'handoff',
        name: 'Morning handoff',
        pageType: BoardPageType.Page,
        elementOrder: elements.map((element) => element.id),
        elements: Object.fromEntries(elements.map((element) => [element.id, element])),
      },
    },
  }
}

const COSTS = [
  ['Dock crew', 18, 32],
  ['Forklift cover', 6, 48],
  ['Manifest desk', 5, 26],
  ['Berth window', 8, 85],
  ['Late collection', 2, 60],
  ['Hold-bay standby', 3, 40],
  ['Check-out support', 4, 28],
  ['Cleaning turnover', 2, 35],
] as const

export function createHostData(): Partial<IWorkbookData> {
  const cellData: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'TIDAL / Morning berth estimate', s: 'title' } },
    1: { 0: { v: '12 October 2027 · original training scenario · fictional USD rates', s: 'muted' } },
    3: {
      0: { v: 'Cost line', s: 'header' },
      1: { v: 'Hours', s: 'header' },
      2: { v: '$ / hour', s: 'header' },
      3: { v: 'Estimate', s: 'header' },
    },
    13: { 0: { v: 'Shift subtotal', s: 'header' }, 3: { f: '=SUM(D5:D12)', s: 'total' } },
    15: { 0: { v: 'Planning allowance / 10%', s: 'muted' }, 3: { f: '=D14*10%', s: 'money' } },
    17: { 0: { v: 'Estimate incl. allowance', s: 'header' }, 3: { f: '=D14+D16', s: 'total' } },
    20: { 0: { v: 'COST IS NOT CLEARANCE', s: 'section' } },
    22: { 0: { v: '42 expected / 41 counted: one crate unresolved.', s: 'warning' } },
    24: { 0: { v: 'Double-click the Board to edit the handoff.', s: 'muted' } },
    25: { 0: { v: 'Cost edits do not change the diagram.', s: 'muted' } },
    27: { 0: { v: 'Training only. No live dispatch or approval.', s: 'muted' } },
  }
  COSTS.forEach(([label, hours, rate], index) => {
    const row = index + 4
    cellData[row] = {
      0: { v: label, s: index % 2 ? 'stripe' : 'body' },
      1: { v: hours, s: 'input' },
      2: { v: rate, s: 'money' },
      3: { f: `=B${row + 1}*C${row + 1}`, s: 'money' },
    }
  })
  return {
    id: HOST_ID,
    name: 'Tidal / Berth costs',
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-rc.0',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 22, bl: 1, cl: { rgb: '#245C70' } },
      section: { fs: 15, bl: 1, cl: { rgb: '#245C70' } },
      header: { bg: { rgb: '#DDEFF4' }, bl: 1, cl: { rgb: '#245C70' } },
      body: { cl: { rgb: '#354950' } },
      stripe: { bg: { rgb: '#F0F6F8' } },
      muted: { cl: { rgb: '#697B82' }, fs: 10 },
      money: { n: { pattern: '#,##0.00' }, cl: { rgb: '#354950' } },
      input: { bg: { rgb: '#F9EDC9' }, cl: { rgb: '#806327' }, n: { pattern: '0' } },
      total: { n: { pattern: '#,##0.00' }, bg: { rgb: '#DCEFE6' }, cl: { rgb: '#39755E' }, bl: 1 },
      warning: { cl: { rgb: '#B86550' }, fs: 11 },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Shift estimate',
        rowCount: 55,
        columnCount: 16,
        defaultRowHeight: 28,
        defaultColumnWidth: 100,
        columnData: { 0: { w: 215 }, 1: { w: 80 }, 2: { w: 80 }, 3: { w: 110 } },
        cellData,
        mergeData: [0, 1, 20, 22, 24, 25, 27].map((row) => ({
          startRow: row,
          endRow: row,
          startColumn: 0,
          endColumn: row < 2 ? 12 : 3,
        })),
      },
    },
  }
}
