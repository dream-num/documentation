import type { IBoardData } from '@univerjs-pro/boards'
import type { IWorkbookData } from '@univerjs/core'
import { BoardPageType, createBoardConnectorElement, createBoardTextBoxShapeElement } from '@univerjs-pro/boards'
import { ShapeFillEnum, ShapeTextWrapType, ShapeTypeEnum } from '@univerjs-pro/engine-shape'
import { createFormulaShapeData } from '@univerjs-pro/shape-editor'
import { BooleanNumber, HorizontalAlign, LocaleType, VerticalAlign } from '@univerjs/core'
export const HOST_ID = 'delta-studio-capacity'
export const CHILD_ID = 'delta-allocation-map'
export const SHEET_ID = 'allocation'
export const PAGE_ID = 'capacity'
export const SOURCE_NAME = 'Delta Capacity'
export const TEAMS = [
  ['Design', 120, 110, 'Clarify the review handoff.'],
  ['Build', 200, 210, 'Split scope before promising another item.'],
  ['Quality', 160, 105, 'Protect capacity for regression checks.'],
] as const
const source = "'[Delta Capacity]Allocation'!"
const capacity = 'SUM(' + source + 'B5:B7)'
const assigned = 'SUM(' + source + 'C5:C7)'
const overloaded = [5, 6, 7].map((row) => 'IF(' + source + 'C' + row + '>' + source + 'B' + row + ',1,0)').join('+')
export const FORMULA_CARDS = [
  { id: 'capacity', formula: '=' + capacity, format: '0" h"' },
  { id: 'assigned', formula: '=' + assigned, format: '0" h"' },
  { id: 'spare', formula: '=' + capacity + '-' + assigned, format: '0" h"' },
  { id: 'utilization', formula: '=' + assigned + '/' + capacity, format: '0.0%' },
  ...TEAMS.flatMap((_, i) => [
    { id: 'load-' + i, formula: '=' + source + 'C' + (i + 5), format: '0" h"' },
    { id: 'spare-' + i, formula: '=' + source + 'B' + (i + 5) + '-' + source + 'C' + (i + 5), format: '0" h";-0" h"' },
  ]),
  { id: 'overloaded', formula: '=' + overloaded, format: '0" team(s)"' },
  {
    id: 'peak',
    formula: '=MAX(' + [5, 6, 7].map((row) => source + 'C' + row + '/' + source + 'B' + row).join(',') + ')',
    format: '0.0%',
  },
  {
    id: 'signal',
    formula: '=IF((' + overloaded + ')>0,"Rebalance before adding scope","Review the remaining buffer")',
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
    ['#E1ECE8', '#2B675B'],
    ['#F7E1D7', '#A24D36'],
    ['#E1EAF4', '#376B91'],
  ]
  const shapes = [
    text('header', '', 24, 20, 1152, 100, 12, '#173F45', '#173F45'),
    text('title', 'DELTA / THE BUFFER IS NOT EVERYWHERE', 44, 28, 1108, 48, 29, '#FFF4D9', undefined, true),
    text(
      'subtitle',
      'Product studio / Sprint 19 / 28 September 2029 / Original planning hours',
      46,
      79,
      1100,
      26,
      15,
      '#9ED4CE',
    ),
    ...[
      ['capacity', 'AVAILABLE'],
      ['assigned', 'ASSIGNED'],
      ['spare', 'TOTAL BUFFER'],
      ['utilization', 'TOTAL UTILIZATION'],
    ].flatMap(([id, label], i) => [
      text(id + '-panel', '', 24 + i * 292, 140, 276, 110, 12, '#173F45', i === 2 ? '#F4E4BE' : '#E8EFEC'),
      text(id + '-label', label, 40 + i * 292, 150, 244, 26, 13, '#536B67', undefined, true),
      formula(id, 40 + i * 292, 182, 244, 32, '#173F45'),
    ]),
    text('source-node', 'ONE SHEET / THREE CAPACITY POOLS', 332, 272, 536, 44, 17, '#173F45', '#D5E4DF', true),
    ...TEAMS.flatMap(([name, , , note], i) => {
      const x = 24 + i * 392,
        [fill, ink] = colors[i]
      return [
        text('team-' + i, '', x, 362, 368, 212, 12, ink, fill),
        text(
          'team-title-' + i,
          '0' + (i + 1) + ' / ' + name.toUpperCase(),
          x + 18,
          370,
          332,
          37,
          23,
          ink,
          undefined,
          true,
        ),
        text('load-label-' + i, 'ASSIGNED', x + 18, 420, 152, 22, 12, ink, undefined, true),
        text('spare-label-' + i, 'BUFFER', x + 195, 420, 155, 22, 12, ink, undefined, true),
        formula('load-' + i, x + 18, 448, 152, 29, ink),
        formula('spare-' + i, x + 195, 448, 155, 29, ink),
        text('team-note-' + i, note, x + 18, 511, 332, 50, 14, ink),
      ]
    }),
    text('review-panel', '', 24, 602, 1152, 119, 12, '#FFF4D9', '#173F45'),
    text('overloaded-label', 'OVER CAPACITY', 43, 611, 232, 23, 12, '#AAD1CA', undefined, true),
    formula('overloaded', 43, 648, 238, 28, '#F1BB76'),
    text('peak-label', 'HIGHEST TEAM LOAD', 311, 611, 266, 23, 12, '#AAD1CA', undefined, true),
    formula('peak', 311, 648, 256, 28, '#F1BB76'),
    text('signal-label', 'NEXT CONVERSATION', 610, 611, 536, 23, 12, '#AAD1CA', undefined, true),
    formula('signal', 610, 648, 540, 24, '#FFF4D9'),
    text(
      'footer',
      'A positive total can hide a local overload. Arrows show formula dependencies, not an automatic transfer of work.',
      28,
      737,
      1142,
      44,
      13,
      '#58716C',
    ),
  ]
  const links = TEAMS.map((_, i) =>
    createBoardConnectorElement({
      id: 'capacity-link-' + i,
      start: { kind: 'shapeSite', shapeId: 'source-node', connectionSiteId: 2 },
      end: { kind: 'shapeSite', shapeId: 'team-' + i, connectionSiteId: 0 },
      routing: 'orthogonal',
      routingMode: 'auto',
      style: { stroke: colors[i][1], strokeWidth: 2, endMarker: { type: 'filledArrow' } },
    }),
  )
  const elements = [...links, ...shapes]
  return {
    id: CHILD_ID,
    name: 'Delta / Resource allocation map',
    appVersion: '1.0.0-beta.2',
    defaultPageSize: { width: 1200, height: 800 },
    pageOrder: [PAGE_ID],
    activePageId: PAGE_ID,
    pages: {
      [PAGE_ID]: {
        id: PAGE_ID,
        name: 'Where the buffer lives',
        pageType: BoardPageType.Page,
        elements: Object.fromEntries(elements.map((e) => [e.id, e])),
        elementOrder: elements.map((e) => e.id),
      },
    },
  }
}
export function createHostData(): Partial<IWorkbookData> {
  const cells: NonNullable<IWorkbookData['sheets'][string]['cellData']> = {
    0: { 0: { v: 'DELTA / Capacity is local.', s: 'title' } },
    1: { 0: { v: 'Sprint 19 / Fictional planning hours', s: 'muted' } },
    3: { 0: { v: 'Team', s: 'header' }, 1: { v: 'Capacity', s: 'header' }, 2: { v: 'Assigned', s: 'header' } },
    9: { 0: { v: 'Total capacity', s: 'label' }, 1: { f: '=SUM(B5:B7)', s: 'total' } },
    10: { 0: { v: 'Total assigned', s: 'label' }, 1: { f: '=SUM(C5:C7)', s: 'total' } },
    11: { 0: { v: 'Remaining buffer', s: 'header' }, 1: { f: '=B10-B11', s: 'total' } },
    13: { 0: { v: 'A surplus can hide an overload.', s: 'warning' } },
    15: { 0: { v: 'Edit the six highlighted inputs.', s: 'muted' } },
    16: { 0: { v: 'Double-click the native Canvas to edit.', s: 'muted' } },
    17: { 0: { v: 'Use its fullscreen menu for more room.', s: 'muted' } },
    19: { 0: { v: 'Team names are labels, not formula keys.', s: 'muted' } },
    21: { 0: { v: 'Hours are estimates, not headcount.', s: 'muted' } },
    22: { 0: { v: 'No task moves or staffing changes run.', s: 'muted' } },
  }
  TEAMS.forEach(([name, cap, load], i) => {
    cells[4 + i] = { 0: { v: name, s: 'label' }, 1: { v: cap, s: 'input' }, 2: { v: load, s: 'assigned' } }
  })
  return {
    id: HOST_ID,
    name: SOURCE_NAME,
    locale: LocaleType.EN_US,
    appVersion: '1.0.0-beta.2',
    sheetOrder: [SHEET_ID],
    styles: {
      title: { fs: 20, bl: 1, cl: { rgb: '#173F45' } },
      header: { bg: { rgb: '#D5E4DF' }, cl: { rgb: '#173F45' }, bl: 1 },
      label: { cl: { rgb: '#365C57' } },
      muted: { fs: 10, cl: { rgb: '#6F8078' } },
      warning: { fs: 12, bl: 1, cl: { rgb: '#A24D36' } },
      input: { bg: { rgb: '#E1ECE8' }, cl: { rgb: '#2B675B' }, n: { pattern: '0' } },
      assigned: { bg: { rgb: '#F7E1D7' }, cl: { rgb: '#A24D36' }, n: { pattern: '0' } },
      total: { bg: { rgb: '#F4E4BE' }, cl: { rgb: '#735721' }, bl: 1, n: { pattern: '0" h"' } },
    },
    sheets: {
      [SHEET_ID]: {
        id: SHEET_ID,
        name: 'Allocation',
        rowCount: 45,
        columnCount: 20,
        defaultRowHeight: 29,
        defaultColumnWidth: 100,
        columnData: { 0: { w: 215 }, 1: { w: 90 }, 2: { w: 90 } },
        rowData: { 0: { h: 40 } },
        cellData: cells,
        mergeData: [0, 1, 13, 15, 16, 17, 19, 21, 22].map((row) => ({
          startRow: row,
          endRow: row,
          startColumn: 0,
          endColumn: 2,
        })),
      },
    },
  }
}
